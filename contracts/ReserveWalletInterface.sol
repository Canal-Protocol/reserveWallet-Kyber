pragma solidity 0.4.18;

/// @dev interface to allow for Wallet Reserve integration with Reserve Wallet

import "./ERC20Interface.sol";


interface ReserveWalletInterface {
    function() public payable;
    function pullToken(ERC20 token, uint amount) external returns (bool);
    function pullEther(uint amount) external returns (bool);
    function checkBalance(ERC20 token) public view returns (uint);
}
