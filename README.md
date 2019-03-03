# Reserve Wallet and Kyber Integration

This is built as a starting point for people building on the liquidity side of kyber - essentially it is a Reserve (Wallet Reserve) which stores all of its funds in a separate smart contract (Reserve Wallet), and the reserve pushes and pulls funds from that smart contract. It is a wallet integrated with the Reserve infrastructure, developers can build on the wallet side without having to do the integration work with kyber.

## Prerequisites

1. Node and NPM LTS versions `10.14.1` and `6.4.1` respectively. Download from [nodejs.org](https://nodejs.org/en/download/)

2. Truffle

Install the latest Truffle v5 beta.

```
sudo npm install -g truffle@5.0.0-beta.1
```

4. Install the rest of the NPM packages

```
npm install
```

### To Run Tests

cd into the directory and run truffle develop.
```
truffle develop
```

Within the truffle develop console test the contracts.
```
test
```
