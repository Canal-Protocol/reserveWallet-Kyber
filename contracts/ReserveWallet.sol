pragma solidity 0.4.18;

/// @title Fund Wallet - Fund raising and distribution wallet according to stake and incentive scheme.
/// @dev Not fully tested, use only in test environment.


import "./ERC20Interface.sol";

contract ReserveWallet {

    //Kyber Reserve contract address
    address public reserve;
    //admins
    address public admin;
    address public backupAdmin;

    //eth address
    ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

    //modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin);
        _;
    }

    modifier onlyBackupAdmin() {
        require(msg.sender == backupAdmin);
        _;
    }

    //events
    event TokenPulled(ERC20 token, uint amount, address sendTo);
    event EtherPulled(uint amount, address sendTo);
    event TokenWithdraw(ERC20 token, uint amount, address sendTo);
    event EtherWithdraw(uint amount, address sendTo);

    /// @notice Constructor, initialises admin wallets.
    function ReserveWallet(address _admin, address _backupAdmin) public {
        require(_admin != address(0));
        require(_backupAdmin != address(0));
        admin = _admin;
        backupAdmin = _backupAdmin;
    }

    function() public payable {
    }

    /// @dev set or change reserve address
    /// @param _reserve the address of corresponding kyber reserve.
    function setReserve(address _reserve) public onlyAdmin {
        reserve = _reserve;
    }

    /// @notice Function to change the admins address
    /// @dev Only available to the back up admin.
    /// @param _newAdmin address of the new admin.
    function changeAdmin(address _newAdmin) public onlyBackupAdmin {
        admin = _newAdmin;
    }

    /// @notice Funtion for admin to withdraw ERC20 token while fund is opperating.
    /// @dev Only available to admin and in the opperating period
    function withdrawToken(ERC20 token, uint amount, address sendTo) external onlyAdmin {
        require(token.transfer(sendTo, amount));
        TokenWithdraw(token, amount, sendTo);
    }

    /// @notice Funtion for admin to withdraw ERC20 token while fund is opperating.
    /// @dev Only available to admin and in the opperating period
    function withdrawEther(uint amount, address sendTo) external onlyAdmin {
        sendTo.transfer(amount);
        EtherWithdraw(amount, sendTo);
    }

    //functions to allow trading with reserve address

    /// @dev send erc20token to the reserve address
    /// @param token ERC20 The address of the token contract
    function pullToken(ERC20 token, uint amount) external returns (bool){
        require(msg.sender == reserve);
        require(token.transfer(reserve, amount));
        TokenPulled(token, amount, reserve);
        return true;
    }

    ///@dev Send ether to the reserve address
    function pullEther(uint amount) external returns (bool){
        require(msg.sender == reserve);
        reserve.transfer(amount);
        EtherPulled(amount, reserve);
        return true;
    }

    ///@dev function to check balance only returns balances in opperating and liquidating periods
    function checkBalance(ERC20 token) public view returns (uint) {
        if (token == ETH_TOKEN_ADDRESS) {
            return this.balance;
        }
        else {
            return token.balanceOf(this);
        }
    }
}
