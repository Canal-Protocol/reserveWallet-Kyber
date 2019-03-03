const Math = require('mathjs');
const BigNumber = require('bignumber.js');

isRevertErrorMessage = ( error ) => {
    if( error.message.search('invalid opcode') >= 0 ) return true;
    if( error.message.search('revert') >= 0 ) return true;
    if( error.message.search('out of gas') >= 0 ) return true;
    return false;
};


sendEtherWithPromise = ( sender, recv, amount ) => {
    return new Promise(function(fulfill, reject){
            web3.eth.sendTransaction({to: recv, from: sender, value: amount}, function(error, result){
            if( error ) {
                return reject(error);
            }
            else {
                return fulfill(true);
            }
        });
    });
};


getBalancePromise = ( account ) => {
    return new Promise(function (fulfill, reject){
        web3.eth.getBalance(account,function(err,result){
            if( err ) reject(err);
            else fulfill(result);
        });
    });
};


getCurrentBlock = () => {
    return new Promise(function (fulfill, reject){
        web3.eth.getBlockNumber(function(err,result){
            if( err ) reject(err);
            else fulfill(result);
        });
    });
};

bytesToHex = (byteArray) => {
    let strNum = toHexString(byteArray);
    let num = '0x' + strNum;
    return num;
};

function toHexString(byteArray) {
  return Array.from(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('')
};


sendPromise = (method, params) => {
    return new Promise(function(fulfill, reject){
        web3.currentProvider.send({
          jsonrpc: '2.0',
          method,
          params: params || [],
          id: new Date().getTime()
        }, function(err,result) {
          if (err) {
            reject(err);
          }
          else {
            fulfill(result);
          }
        });
    });
};

////////////////////////////////////////////////////////////////////////////////

exp = (num1,num2) => {
    const num1Math = Math.bignumber(new BigNumber(num1).toString(10));
    const num2Math = Math.bignumber(new BigNumber(num2).toString(10));

    const result = Math.pow(num1Math,num2Math);

    return new BigNumber(result.toString());
};

ln = (num) => {
    const numMath = Math.bignumber(new BigNumber(num).toString(10));

    const result = Math.log(numMath);

    return new BigNumber(result.toString());
};


////////////////////////////////////////////////////////////////////////////////

function absDiffInPercent(num1, num2) {
    return (absDiff(num1,num2).div(num1)).mul(100)
}

function checkAbsDiff(num1, num2, maxDiffInPercentage) {
    const maxDiffBig = new BigNumber(maxDiffInPercentage);
    const diff = absDiff(num1,num2);
    return (diff.div(num1)).lte(maxDiffInPercentage.div(100));
};

function absDiff(num1,num2) {
    const bigNum1 = new BigNumber(num1);
    const bigNum2 = new BigNumber(num2);

    if(bigNum1.gt(bigNum2)) {
        return bigNum1.minus(bigNum2);
    }
    else {
        return bigNum2.minus(bigNum1);
    }
};

assertAbsDiff = (val1, val2, expectedDiffInPct, errorStr) => {
    val1 = val1.toString()
    val2 = val2.toString()
    assert(checkAbsDiff(val1,val2,expectedDiffInPct),
            errorStr +
           " first val is " + val1 +
           " second val is " + val2 +
           " result diff is " + absDiff(val1, val2).toString(10) +
           " actual result diff in percents is " + absDiffInPercent(val1,val2).toString(10));
}

//time stuff

advanceTimeAndBlock = async (time) => {
    await advanceTime(time);
    await advanceBlock();

    return Promise.resolve(web3.eth.getBlock('latest'));
}

advanceTime = (time) => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_increaseTime",
            params: [time],
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            return resolve(result);
        });
    });
}

advanceBlock = () => {
    return new Promise((resolve, reject) => {
        web3.currentProvider.send({
            jsonrpc: "2.0",
            method: "evm_mine",
            id: new Date().getTime()
        }, (err, result) => {
            if (err) { return reject(err); }
            const newBlockHash = web3.eth.getBlock('latest').hash;

            return resolve(newBlockHash)
        });
    });
}

module.exports = {
    advanceTime,
    advanceBlock,
    advanceTimeAndBlock,
    bytesToHex,
    isRevertErrorMessage,
    sendEtherWithPromise,
    getBalancePromise,
    getCurrentBlock,
    sendPromise,
    exp,
    ln,
    assertAbsDiff
}
