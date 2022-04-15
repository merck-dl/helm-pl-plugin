const constants = require("./constants");
const path = require("path");
const fs = require("fs");
const {createOrgAcc: createOrgAccount} = require("./createOrgAcc");

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
function storeSmartContractsInfo(publicInfo, secrets, config) {
    const childProcess = require("child_process");
    childProcess.execSync(`cd ${path.join(__dirname, constants.PATHS.SHARED_REPO_CLONE_PATH)}`);
    childProcess.execSync(`git clone ${config.shared_repository} ${constants.PATHS.SHARED_REPO_NAME}`);
    childProcess.execSync(`cd ${path.join(constants.PATHS.SHARED_REPO_NAME, constants.PATHS.SHARED_SMART_CONTRACT_DATA_FOLDER)}`);
    childProcess.execSync(`git remote set-url origin ${config.shared_repository}`);

    fs.writeFileSync(path.join(__dirname, constants.PATHS.SHARED_REPO_NAME,constants.PATHS.SHARED_SMART_CONTRACT_DATA_FOLDER, constants.PATHS.SMART_CONTRACT_INFO), JSON.stringify(publicInfo));
    fs.writeFileSync(path.join(__dirname, constants.PATHS.SHARED_REPO_NAME,constants.PATHS.SHARED_SMART_CONTRACT_DATA_FOLDER, constants.PATHS.SMART_CONTRACT_SECRETS), JSON.stringify(secrets));
    childProcess.execSync(`git add .`);
    childProcess.execSync(`git commit -m "${constants.COMMIT_MESSAGE}"`);
    childProcess.execSync(`git push origin master`);
    console.log("Smart contract info was stored successfully");
}


function deploySmartContracts(accountInfo, config, callback) {
    const portForward = require("./portForward").portForward;
    const fs = require('fs');
    const files = fs.readdirSync(config.paths.smart_contracts);
    const contracts = files.filter(file => file.endsWith(".sol"));
    const Web3 = require('web3');
    const web3 = new Web3('http://127.0.0.1:8545'); // your geth
    const contractsInfo = compileSmartContracts(config, contracts);
    const __deploySmartContractsSequentially = (index, childProcess) => {
        const contract = contracts[index];
        if (typeof contract === "undefined") {
            process.kill(-childProcess.pid);
            return callback(undefined, contractsInfo);
        }

        const contractABIAndBytecode = contractsInfo[contract];
        deploySmartContract(web3, accountInfo, contractABIAndBytecode, contract, [], (err, scAddress) => {
            if (err) {
                return callback(err);
            }

            contractsInfo[contract].address = scAddress;
            __deploySmartContractsSequentially(index + 1, childProcess);
        })
    }

    portForward(config, (err, childProcess) => {
        if (err) {
            return callback(err);
        }
        __deploySmartContractsSequentially(0, childProcess);
    })
}

function deploySmartContractsAndStoreInfo(config) {
    const accountInfo = createOrgAccount();
    const secrets = {privateKey: accountInfo.privateKey};
    const publicInfo = {userAddress: accountInfo.address};
    deploySmartContracts(accountInfo, config, (err, contractsInfo) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        publicInfo.contracts = contractsInfo;
        console.log("Smart contracts were deployed");
        storeSmartContractsInfo(publicInfo, secrets, config);
        process.exit(0);
    })
}

module.exports = {
    deploySmartContractsAndStoreInfo
}

