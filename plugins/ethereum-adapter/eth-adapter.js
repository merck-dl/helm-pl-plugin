async function dlFilesAndWriteJsonFile(inputPath, outputPath) {
    const path = require('path');
    const inputValuesPath = path.resolve(inputPath);
    const constants = require("../constants");
    const yaml = require('js-yaml');
    const fs = require('fs');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const config = yaml.load(inputYamlFile);
    const utils = require('../utils');

    const token = config.smart_contract_shared_configuration.read_write_token;
    const repoName = config.smart_contract_shared_configuration.repository_name;
    const baseShareFolder = "networks";
    const networkName = config.smart_contract_shared_configuration.network_name;
    const smartContractFileName = config.smart_contract_shared_configuration.smartContractInfoName;
    const smartContractUrl = `https://raw.githubusercontent.com/${repoName}/master/${baseShareFolder}/${networkName}/${smartContractFileName}`
    const smartContractInfo = await utils.dlFile(smartContractUrl,token);
    console.log('Downloaded file : ', smartContractUrl);
    const ethAdapterInfoPath = path.join(path.resolve(outputPath), constants.PATHS.ETH_ADAPTER_OUTPUT);
    const orgAcc = utils.createOrgAccount();
    fs.writeFileSync(path.join(outputPath, constants.PATHS.ORG_ACCOUNT), JSON.stringify(orgAcc));
    fs.writeFileSync(ethAdapterInfoPath, smartContractInfo);
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
