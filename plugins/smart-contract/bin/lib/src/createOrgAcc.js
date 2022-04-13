function createOrgAcc() {
    const Web3 = require("web3");

    const web3 = new Web3('http://ref-quorum-node1:8545'); // your geth

    //create a new account which doesn't have a storekey located in the blockchain node
    const newAccount = web3.eth.accounts.create();
    const orgAccData = {
        privateKey: newAccount.privateKey,
        address: newAccount.address
    }

    return orgAccData;
}

module.exports = {
    createOrgAcc
}


