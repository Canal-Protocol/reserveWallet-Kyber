# Fund Wallet and Kyber Integration

This repo is for testing the DLP infrastructure and ints integration with Kyber Network.
Currently won't work due to ongoing work on tests - should work as below if "mockContracts" and "test" folders are removed.

## Prerequisites

1. Node and NPM LTS versions `10.14.1` and `6.4.1` respectively. Download from [nodejs.org](https://nodejs.org/en/download/)

2. Ganache

Install the Ganache AppImage by downloading here https://truffleframework.com/ganache.
To use the provided Ganache snapshot, install `ganache-cli`.

```
sudo npm install -g ganache-cli
```

3. Truffle

Install the latest Truffle v5 beta.

```
sudo npm install -g truffle@5.0.0-beta.1
```

4. Install the rest of the NPM packages

```
npm install
```

### To Run

Run ganache-cli in one terminal session
```
ganache-cli --accounts 10 --defaultBalanceEther 500 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug
```

In a new terminal session, connect to the ganache network, and run the truffle migration scripts
```
truffle migrate --network development
```

### Set Up Fund Wallet

Set Time periods - by default set to 1 minute for admin period, 1 minute for raising period, 3 minutes for opperational period and 3 minutes for liquidation period. If you wish to change this you can change the inputs in fund/setTimes.js
```
truffle exec fund/setTimes.js
```

Do Admin Stuff - adds contributors, sets the reserve address and the Fund scheme for the admin (default is 25 ether stake and 20% performance on the fund - these can be cahngged in fund/adminStuff.js 
**You Will have 1 Minute to do this step**
```
truffle exec fund/adminStuff.js
```

Make Contributions - Admin deposits their stake of 25 ETH and the contributor deposits 15 ETH. 
**You Will have 1 Minute to do this step**
```
truffle exec fund/makeContributions.js
```

After 1 minute passes the Opperational period will begin - the fund reserve can now take part in ETH to Token, Token to Token, and Token - ETH trades. 
**This will last 3 minutes**

ETH to Token:
```
truffle exec examples/truffle/swapEtherToToken.js
```

Token to ETH:
```
truffle exec examples/truffle/swapTokenToEther.js
```

After that the Liquidation period begins and only ETH to Token trades will be processed as the fund is liquidating its token reserves.
**This period will also last 3 minutes**
```
truffle exec examples/truffle/swapEtherToToken.js
```

After this period is over the ending balance can be logged and contributors/admins can claim their stakes.
**No time limit**
```
truffle exec fund/makeClaims.js
```

