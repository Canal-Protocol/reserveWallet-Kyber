//this test the main functionality of Fund Wallet - this also tests fund wallet in its loss scenario.
const TestToken = artifacts.require("./mockContracts/TestToken.sol");
const ReserveWallet = artifacts.require("./ReserveWallet.sol");

const Helper = require("./helper.js");
const BigNumber = require('bignumber.js');
const truffleAssert = require('truffle-assertions');

let admin;
let backupAdmin;
let reserve;
let newAdmin;
let outsideAcc;
let reserveWalletInst;
let token;

const precisionUnits = (new BigNumber(10).pow(18));
const ethAddress = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const precision = new BigNumber(10).pow(18);

contract('ReserveWallet', function(accounts) {

  //need to have a test from time period failiures

  it("Should init Fund Wallet and test token", async function () {
      // set account addresses
      admin = accounts[0];
      backupAdmin = accounts[1];
      reserve = accounts[2];
      newAdmin = accounts[3];
      outsideAcc = accounts[4];

      reserveWalletInst = await ReserveWallet.new(admin, backupAdmin, {});

      token = await TestToken.new("test", "tst", 18);
    });

    it("Should set reserve", async function () {

      //failed non admin reserve set
      try {
          await reserveWalletInst.setReserve(reserve, {from:outsideAcc});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      await reserveWalletInst.setReserve(reserve, {from:admin});
    });

    it("Should  test withdrawals, check balances", async function () {
      let tokenInitBal = 100;
      let etherInitBal = 100;
      let etherWDAmt = 10;
      let tokenWDAmt = 10;

      await Helper.sendEtherWithPromise(accounts[9], reserveWalletInst.address, etherInitBal);
      await token.transfer(reserveWalletInst.address, tokenInitBal);
      let tokenBal = await token.balanceOf(reserveWalletInst.address);
      assert.equal(tokenBal, tokenInitBal, "wrong balance");

      let etherBal = await Helper.getBalancePromise(reserveWalletInst.address);

      //withdraw ether
      await reserveWalletInst.withdrawEther(etherWDAmt, admin, {from:admin});

      let etherBal2 = await Helper.getBalancePromise(reserveWalletInst.address);
      let expEthBal = await parseInt(etherBal) - parseInt(etherWDAmt);
      assert.equal(etherBal2, expEthBal, "incorrect balance");

      //withdraw token
      await reserveWalletInst.withdrawToken(token.address, tokenWDAmt, admin, {from:admin});
      let tokenBal2 = await token.balanceOf(reserveWalletInst.address);
      let expTokBal = await parseInt(tokenBal) - parseInt(tokenWDAmt);
      assert.equal(tokenBal2, expTokBal, "incorrect balance");
    });

    it("Should check failed withdrawals and check balances", async function () {
      let tokenInitBal = 100;
      let etherWDAmt = 10;
      let tokenWDAmt = 10;

      let startTokenBal = await token.balanceOf(reserveWalletInst.address);

      let startEtherBal = await Helper.getBalancePromise(reserveWalletInst.address);

      //failed withdraw non-admin
      try {
          await reserveWalletInst.withdrawEther(etherWDAmt, admin, {from:outsideAcc});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      try {
          await reserveWalletInst.withdrawToken(token.address, tokenWDAmt, admin, {from:outsideAcc});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      let endEtherBal = await Helper.getBalancePromise(reserveWalletInst.address);
      assert.equal(parseInt(startEtherBal), parseInt(endEtherBal), "incorrect balance");

      let endTokenBalance = await token.balanceOf(reserveWalletInst.address);
      assert.equal(parseInt(startTokenBal), parseInt(endTokenBalance), "incorrect balance");
    });

    it("Should pull token (successful in opperateP) and check balances", async function () {
      let tokAmount = 10;

      let tokenBal = await token.balanceOf(reserveWalletInst.address);

      await reserveWalletInst.pullToken(token.address, tokAmount, {from:reserve});

      let tokenBal2 = await token.balanceOf(reserveWalletInst.address);
      let expTokBal = await parseInt(tokenBal) - parseInt(tokAmount);
      assert.equal(tokenBal2, expTokBal, "wrong balance");
    });

    it("Should test failed pull token", async function () {
      let tokAmount = 10;

      let startTokenBal = await token.balanceOf(reserveWalletInst.address);;

      //failed pull token non-reserve
      try {
          await reserveWalletInst.pullToken(token.address, tokAmount, {from:outsideAcc});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      let endTokenBalance = await token.balanceOf(reserveWalletInst.address);
      assert.equal(parseInt(startTokenBal), parseInt(endTokenBalance), "incorrect balance");
    });

    it("Should pull ether (successful in opperateP) and check balances", async function () {
      let ethAmount = 10;

      let etherBal = await Helper.getBalancePromise(reserveWalletInst.address);

      await reserveWalletInst.pullEther(ethAmount, {from:reserve});

      let etherBal2 = await Helper.getBalancePromise(reserveWalletInst.address);
      let expEthBal = await parseInt(etherBal) - parseInt(ethAmount);
      assert.equal(etherBal2, expEthBal, "incorrect balance");
    });

    it("Should test failed pull ether", async function () {
      let ethAmount = 10;

      let startEtherBal = await Helper.getBalancePromise(reserveWalletInst.address);

      //failed pull ether non-reserve
      try {
          await reserveWalletInst.pullEther(ethAmount, {from:outsideAcc});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      let endEtherBal = await Helper.getBalancePromise(reserveWalletInst.address);
      assert.equal(parseInt(startEtherBal), parseInt(endEtherBal), "incorrect balance");
    });

    it("Should check that checkBalance returns correct balances (both eth and token", async function () {

      let etherBal = await Helper.getBalancePromise(reserveWalletInst.address);
      let tokenBal = parseInt(await token.balanceOf(reserveWalletInst.address));

      let returnEthBal = await reserveWalletInst.checkBalance(ethAddress);
      let returnTokBal = parseInt(await reserveWalletInst.checkBalance(token.address));

      assert.equal(etherBal, returnEthBal, "wrong balance");
      assert.equal(returnTokBal, tokenBal, "wrong balance");
    });

    it("Should test change admin (success and failiures)", async function () {

      //failed change admin - non backupAdmin
      try {
          await reserveWalletInst.changeAdmin(newAdmin, {from:admin});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }
      try {
          await reserveWalletInst.changeAdmin(newAdmin, {from:outsideAcc});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      await reserveWalletInst.changeAdmin(newAdmin, {from:backupAdmin});

      let adminAddr = await reserveWalletInst.admin.call();

      assert.equal(adminAddr, newAdmin, "incorrect admin");
    });

    it("Should test failed init of Fund Wallet", async function () {

      try {
          reserveWalletInst = await ReserveWallet.new(0, backupAdmin, {});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      try {
          reserveWalletInst = await ReserveWallet.new(admin, 0, {});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

      try {
          reserveWalletInst = await ReserveWallet.new(0, 0, {});
          assert(false, "throw was expected in line above.")
      }
      catch(e){
          assert(Helper.isRevertErrorMessage(e), "expected throw but got: " + e);
      }

    });

});
