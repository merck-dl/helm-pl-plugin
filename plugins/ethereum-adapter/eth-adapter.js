const utils = require("../utils");
const constants = require("../constants");

async function dlFilesAndWriteJsonFile(config, outputPath) {
    const path = require('path');
    const constants = require("../constants");
    const fs = require('fs');
    const utils = require('../utils');
    const {sharedRepoPath, tmpDir} = utils.cloneSharedRepo(config);
    // const baseShareFolder = "networks";
    // const networkName = config.network_name;
    // const smartContractFileName = config.smart_contract_shared_configuration.smartContractInfoName;
    // const smartContractUrl = `https://raw.githubusercontent.com/${repoName}/master/${baseShareFolder}/${networkName}/${smartContractFileName}`
    // const smartContractInfo = await utils.dlFile(smartContractUrl,token);
    const smartContractAbiPath = path.join(sharedRepoPath, "smartContractAbi.json");
    const smartContractAddressPath = path.join(sharedRepoPath, "smartContractAddress.json");
    const smartContractAbi = fs.readFileSync(smartContractAbiPath, "utf-8")
    const smartContractAddress = fs.readFileSync(smartContractAddressPath, "utf-8")
    const ethAdapterInfoPath = path.join(path.resolve(outputPath), constants.PATHS.ETH_ADAPTER_OUTPUT);
    const smartContractInfo = {
        abi: JSON.parse(smartContractAbi),
        address: JSON.parse(smartContractAddress)
    }

    console.log("Smart contract info ......", JSON.stringify(smartContractInfo));
    const orgAcc = utils.createOrgAccount();
    fs.writeFileSync(path.join(outputPath, constants.PATHS.ORG_ACCOUNT), JSON.stringify(orgAcc));
    fs.writeFileSync(ethAdapterInfoPath, JSON.stringify(smartContractInfo));
    console.log('Configuration created at : ', outputPath);
}
module.exports = {
    downloadFilesAndCreateJSON: function (inputPath, outputPath) {
        dlFilesAndWriteJsonFile(inputPath, outputPath).then(
            () => {
            },
            (err) => {
                console.log(err);
            }
        );
    }
}
