// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

/**
 * @title HelloWorld contract
 * @author [Team] Group 8
 * @notice This contract is a simple example that stores and retrieves a greeting message.
 */
contract HelloWorld {
    /// @dev The greeting message stored in the contract.
    string private text;

    /// @dev The address of the contract owner.
    address public owner;

    /**
     * @dev Constructor that initializes the greeting message and sets the owner to the contract deployer.
     */
    constructor() {
        text = "Hello World";
        owner = msg.sender;
    }

    /**
     * @dev A modifier that restricts function calls to the contract owner.
     */
    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    /**
     * @dev Returns the current greeting message.
     * @return The greeting message stored in the contract.
     * @notice This function is publicly viewable and can be called by anyone.
     */
    function helloWorld() public view returns (string memory) {
        return text;
    }

    /**
     * @dev Sets a new greeting message.
     * @param newText The new greeting message to store.
     * @notice This function can only be called by the contract owner.
     */
    function setText(string calldata newText) public onlyOwner {
        text = newText;
    }

    /**
     * @dev Transfers ownership of the contract to a new address.
     * @param newOwner The address of the new owner.
     * @notice This function can only be called by the contract owner.
     */
    function transferOwnership(address newOwner) public onlyOwner {
        owner = newOwner;
    }
}
