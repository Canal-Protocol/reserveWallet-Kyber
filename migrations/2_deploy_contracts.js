/* global artifacts */
/* eslint-disable no-unused-vars */
const ConversionRates = artifacts.require('./ConversionRates.sol');
const SanityRates = artifacts.require('./SanityRates.sol');
const ReserveWallet = artifacts.require('./ReserveWallet.sol');
const WalletReserve = artifacts.require('./WalletReserve.sol');
const TestToken = artifacts.require('./mockContracts/TestToken.sol');


module.exports = async (deployer, network, accounts) => {
  const admin = accounts[0];
  const backupAdmin = accounts[1];

  // Deploy the contracts
  await deployer.deploy(ConversionRates, admin);
  await deployer.deploy(ReserveWallet, admin, backupAdmin);
  await deployer.deploy(SanityRates, admin);
  await deployer.deploy(WalletReserve, SanityRates.address, ConversionRates.address, ReserveWallet.address, admin);

  await deployer.deploy(TestToken, "test", "tst", "18");
};
