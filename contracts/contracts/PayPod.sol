// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./Roles.sol";

contract PayPod is Ownable, Pausable {
    using Roles for Roles.Role;
    using SafeERC20 for IERC20;
    Roles.Role private _controllers;

    mapping(address => uint256) spendLimits;

    uint256 public expirationTime;

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

    constructor(
        address[] memory controllers,
        address[] memory tokenAddresses,
        uint256[] memory limits,
        uint256 _expirationTime
    ) {
        for (uint256 i = 0; i < controllers.length; ++i) {
            _controllers.add(controllers[i]);
        }
        for (uint256 i = 0; i < tokenAddresses.length; ++i) {
            spendLimits[tokenAddresses[i]] = limits[i];
        }
        transferOwnership(msg.sender);
        if (_expirationTime > 0) {
            expirationTime = _expirationTime;
        }
    }

    modifier onlyController() {
        require(_controllers.has(msg.sender), "Caller is not the controller");
        _;
    }

    modifier whenNotExpired() {
        require(
            expirationTime == 0 || block.timestamp < expirationTime,
            "Pod has expired"
        );
        _;
    }

    function safeTransferERC20(
        address _tokenAddress,
        address _recipient,
        uint256 _amount
    ) internal returns (bool, bytes memory) {
        bytes memory data = abi.encodeWithSelector(
            bytes4(keccak256("transfer(address,uint256)")),
            _recipient,
            _amount
        );

        (bool success, ) = _tokenAddress.call(data);

        if (success) {
            return (true, "");
        }
        return (false, "");
    }

    /* ONLY CONTROLLER FUNCTIONS */

    function spend(address _recipient, uint256 _amount)
        external
        onlyController
        whenNotPaused
        whenNotExpired
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
    ) external onlyController whenNotPaused whenNotExpired {
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
        uint256 operation,
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

        if (operation == 0) {
            (bool success, bytes memory returnData) = to.call{value: value}(
                data
            );

            result = returnData;

            if (success) {
                emit Call(to, value, bytes4(data));
            }
        }

        if (operation == 1) {
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

        revert("Unknown operation type");
    }

    /* ONLY OWNER FUNCTIONS */

    function withdraw(uint256 _amount, bool _withdrawAll) external onlyOwner {
        if (_withdrawAll) {
            uint256 balance = address(this).balance;

            (bool success, ) = msg.sender.call{value: balance}("");
        } else {
            (bool success, ) = msg.sender.call{value: _amount}("");
        }

        if (success) {
            emit Withdraw(balance);
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
        } else {
            bytes memory data = abi.encodeWithSelector(
                bytes4(keccak256("transfer(address,uint256)")),
                msg.sender,
                _amount
            );

            (bool success, ) = _tokenAddress.call(data);
        }

        if (success) {
            emit WithdrawERC20(_tokenAddress, balance);
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
