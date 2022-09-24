// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Controllable.sol";

contract PayPod is Ownable, Pausable, Controllable {
    using SafeERC20 for IERC20;

    mapping(address => uint256) public spendLimits;

    string public name;

    uint256 public expirationTime;

    /* EVENTS */

    event Spend(address indexed recipient, uint256 indexed amount);

    event SpendERC20(
        address indexed tokenAddress,
        address indexed recipient,
        uint256 indexed amount
    );

    event Withdraw(uint256 indexed balance);

    event WithdrawERC20(address indexed tokenAddress, uint256 indexed balance);

    event Pause();

    event Unpause();

    event Call(address to, uint256 value, bytes4 data);

    event Create(address indexed tokenAddress, uint256 indexed value);

    /* CONSTRUCTOR */

    constructor(
        string memory _name,
        address[] memory _controllers,
        address[] memory tokenAddresses,
        uint256[] memory limits,
        uint256 _expirationTime
    ) {
        name = _name;
        for (uint256 i = 0; i < _controllers.length; ++i) {
            addController(_controllers[i]);
        }
        for (uint256 i = 0; i < tokenAddresses.length; ++i) {
            spendLimits[tokenAddresses[i]] = limits[i];
        }
        if (_expirationTime > 0) {
            expirationTime = _expirationTime;
        }
        transferOwnership(msg.sender);
    }

    /* MODIFIERS */

    modifier onlyController() {
        require(isController(msg.sender), "Caller is not the controller");
        _;
    }

    modifier whenNotExpired() {
        require(
            expirationTime == 0 || block.timestamp < expirationTime,
            "Pod has expired"
        );
        _;
    }

    modifier whenNotExceededLimit(uint256 _amount) {
        require(
            spendLimits[address(0x0)] == 0 ||
                spendLimits[address(0x0)] >= _amount,
            "Amount exceeds spending limit"
        );
        _;
    }

    modifier whenNotExceededLimitERC20(address _tokenAddress, uint256 _amount) {
        require(
            spendLimits[_tokenAddress] == 0 ||
                spendLimits[_tokenAddress] >= _amount,
            "Amount exceeds ERC20 spending limit"
        );
        _;
    }

    /* ONLY CONTROLLER FUNCTIONS */

    function spend(address _recipient, uint256 _amount)
        external
        onlyController
        whenNotPaused
        whenNotExpired
        whenNotExceededLimit(_amount)
    {
        (bool success, ) = _recipient.call{value: _amount}("");

        if (success) {
            emit Spend(_recipient, _amount);
        }
    }

    function spendERC20(
        address _tokenAddress,
        address _recipient,
        uint256 _amount
    )
        external
        onlyController
        whenNotPaused
        whenNotExpired
        whenNotExceededLimitERC20(_tokenAddress, _amount)
    {
        bytes memory data = abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            _recipient,
            _amount
        );

        (bool success, ) = _tokenAddress.call(data);

        if (success) {
            emit SpendERC20(_tokenAddress, _recipient, _amount);
        }
    }

    function call(
        address to,
        uint256 value,
        bytes memory data
    )
        public
        payable
        virtual
        onlyController
        whenNotPaused
        whenNotExpired
        returns (bytes memory result)
    {
        require(address(this).balance >= value, "Insufficient balance");

        (bool success, bytes memory returnData) = to.call{value: value}(data);

        result = returnData;

        if (success) {
            emit Call(to, value, bytes4(data));
        }
    }

    function create(
        address to,
        uint256 value,
        bytes memory data
    )
        public
        payable
        virtual
        onlyController
        whenNotPaused
        whenNotExpired
        returns (bytes memory result)
    {
        require(address(this).balance >= value, "Insufficient balance");

        require(
            to == address(0),
            "CREATE operations require the receiver address to be empty"
        );
        require(data.length != 0, "No contract bytecode provided");

        address contractAddress;
        assembly {
            contractAddress := create(value, add(data, 0x20), mload(data))
        }

        require(contractAddress != address(0), "Could not deploy contract");

        result = abi.encodePacked(contractAddress);
        emit Create(contractAddress, value);
    }

    /* ONLY OWNER FUNCTIONS */

    function withdraw(uint256 _amount, bool _withdrawAll) external onlyOwner {
        if (_withdrawAll) {
            uint256 balance = address(this).balance;

            (bool success, ) = msg.sender.call{value: balance}("");

            if (success) {
                emit Withdraw(balance);
            }
        } else {
            (bool success, ) = msg.sender.call{value: _amount}("");

            if (success) {
                emit Withdraw(_amount);
            }
        }
    }

    function withdrawERC20(
        address _tokenAddress,
        uint256 _amount,
        bool _withdrawAll
    ) external onlyOwner {
        if (_withdrawAll) {
            uint256 balance = address(this).balance;

            bytes memory data = abi.encodeWithSelector(
                bytes4(keccak256("transfer(address,uint256)")),
                msg.sender,
                balance
            );

            (bool success, ) = _tokenAddress.call(data);

            if (success) {
                emit WithdrawERC20(_tokenAddress, balance);
            }
        } else {
            bytes memory data = abi.encodeWithSelector(
                bytes4(keccak256("transfer(address,uint256)")),
                msg.sender,
                _amount
            );

            (bool success, ) = _tokenAddress.call(data);

            if (success) {
                emit WithdrawERC20(_tokenAddress, _amount);
            }
        }
    }

    function pause() public onlyOwner {
        _pause();

        emit Pause();
    }

    function unpause() public onlyOwner {
        _unpause();

        emit Unpause();
    }
}
