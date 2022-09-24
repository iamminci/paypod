// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Controllable
 * @dev Library for managing addresses assigned as controllers.
 */
contract Controllable {
    mapping(address => bool) controllersMap;

    address[] public controllers;

    function addController(address account) internal {
        require(account != address(0));
        require(!isController(account));

        controllersMap[account] = true;
        controllers.push(account);
    }

    function removeController(address account) internal {
        require(account != address(0));
        require(isController(account));

        controllersMap[account] = false;

        for (uint256 i = 0; i < controllers.length; i++) {
            if (controllers[i] == account) {
                controllers[i] = controllers[controllers.length - 1];
                controllers.pop();
                break;
            }
        }
    }

    function isController(address account) internal view returns (bool) {
        require(account != address(0));
        return controllersMap[account];
    }

    function getControllers() public view returns (address[] memory) {
        return controllers;
    }
}
