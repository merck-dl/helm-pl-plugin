const constants = require("./constants");
const path = require("path");
const fs = require("fs");
const {portForward} = require("./portForward");

function getAccountInfo(smartContractInfoDirectoryPath) {
    let publicInfo;
    let secrets;
    let orgAcc;
    try {
        publicInfo = JSON.parse(fs.readFileSync(path.join(smartContractInfoDirectoryPath, constants.PATHS.SMART_CONTRACT_INFO), "utf-8"));
        secrets = JSON.parse(fs.readFileSync(path.join(smartContractInfoDirectoryPath, constants.PATHS.SMART_CONTRACT_SECRETS), "utf-8"));
        orgAcc = {
            address: publicInfo.userAddress,
            privateKey: secrets.privateKey
        }
    } catch (e) {
        const createOrgAccount = require("./createOrgAcc").createOrgAcc;
        orgAcc = createOrgAccount();
    }
    return orgAcc;
}

function deploySmartContract(web3, accountInfo, contractInfo, contractName, contractArgs, callback) {
    let abi = contractInfo.abi;
    let bin = contractInfo.bytecode;

    let contract = new web3.eth.Contract(abi);
    console.log(accountInfo);
    sendTransaction(web3, accountInfo, contract.deploy({data: "0x" + bin, arguments: contractArgs}), (err, tr) => {
        if (err) {
            return callback(err);
        }
        console.log('Contract mined : ', tr.contractAddress);
        callback(undefined, tr.contractAddress);
    });
}

function sendTransaction(web3, accountInfo, transaction, callback) {
    transaction.estimateGas({from: accountInfo.account}).then(
        (estimatedGas) => {

            let options = {
                from: accountInfo.account,
                data: transaction.encodeABI(),
                gas: estimatedGas
            };

            web3.eth.accounts.signTransaction(options, accountInfo.privateKey).then(
                (signedT) => {
                    let signedTransaction = signedT;
                    web3.eth.sendSignedTransaction(signedTransaction.rawTransaction, (err, hash) => {
                        if (err) {
                            console.log(err);
                            return callback(err);
                        }
                        console.log('Received T receipt', hash);
                        waitForTransactionToFinish(web3, hash, callback);
                    });
                },
                (err) => {
                    console.log(err);
                    return callback(err);
                }
            );

        },
    );
}

function compileSmartContracts(config, contracts) {
    const fs = require('fs');
    const path = require('path');
    const solc = require('solc');

    const compilerInput = {
        language: 'Solidity',
        sources: {},
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    for (let contract of contracts) {
        const contractPath = path.join(config.paths.smart_contracts, contract);
        const content = fs.readFileSync(contractPath, 'utf-8');
        compilerInput.sources[contract] = {content}
    }

    const output = JSON.parse(solc.compile(JSON.stringify(compilerInput)));
    const contractsABIAndBytecode = {};
    for (let contractName in output.contracts) {
        const contractClass = Object.keys(output.contracts[contractName])[0]
        const bytecode = output.contracts[contractName][contractClass].evm.bytecode.object;
        const abi = output.contracts[contractName][contractClass].abi;
        contractsABIAndBytecode[contractName] = {bytecode, abi}
    }

    return contractsABIAndBytecode;
}

function waitForTransactionToFinish(web3, hash, callback) {
    console.log('waiting for transaction to finish');
    const receipt = () => {
        web3.eth.getTransactionReceipt(hash).then((tr) => {
                if (tr === null) {
                    console.log('waiting for transaction to finish');
                    setTimeout(() => {
                        receipt();
                    }, 1000);
                    return;
                }
                console.log('Transaction finished : ', tr);

                callback(undefined, tr);
            },
            (err) => {
                console.log(err);
                return callback(err);
            }
        )
    }

    receipt();
}

function storeSmartContractsInfo(publicInfo, secrets, outputPath) {
    const publicInfoPath = path.join(outputPath, constants.PATHS.SMART_CONTRACT_INFO);
    const secretsPath = path.join(outputPath, constants.PATHS.SMART_CONTRACT_SECRETS);
    try {
        fs.accessSync(outputPath);
    } catch (e) {
        fs.mkdirSync(outputPath);
    }

    console.log(publicInfoPath)
    console.log(secretsPath)
    fs.writeFileSync(publicInfoPath, JSON.stringify(publicInfo));
    fs.writeFileSync(secretsPath, JSON.stringify(secrets));

    console.log("Smart contract info was store successfully");
}

function deploySmartContracts(accountInfo, config, callback) {
    const portForward = require("./portForward").portForward;
    const cp = portForward();
    const fs = require('fs');
    const files = fs.readdirSync(config.paths.smart_contracts);
    const contracts = files.filter(file => file.endsWith(".sol"));
    const Web3 = require('web3');
    const web3 = new Web3('http://127.0.0.1:8545'); // your geth
    const contractsInfo = compileSmartContracts(config, contracts);
    const __deploySmartContractsSequentially = (index) => {
        const contract = contracts[index];
        if (typeof contract === "undefined") {
            cp.kill();
            return callback(undefined, contractsInfo);
        }

        const contractABIAndBytecode = contractsInfo[contract];
        deploySmartContract(web3, accountInfo, contractABIAndBytecode, contract, [], (err, scAddress) => {
            if (err) {
                return callback(err);
            }

            contractsInfo[contract].address = scAddress;
            __deploySmartContractsSequentially(index + 1);
        })
    }

    setTimeout(() => {
        __deploySmartContractsSequentially(0);
    }, 1000)
}

function deploySmartContractsAndStoreInfo(config) {
    const accountInfo = getAccountInfo(config.outputPath);
    const secrets = {privateKey: accountInfo.privateKey};
    const publicInfo = {userAddress: accountInfo.address};
    deploySmartContracts(accountInfo, config, (err, contractsInfo) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        publicInfo.contracts = contractsInfo;
        console.log("Smart contracts were deployed");
        storeSmartContractsInfo(publicInfo, secrets, config.outputPath);
        process.exit(0);
    })
}

module.exports = {
    deploySmartContractsAndStoreInfo
}

