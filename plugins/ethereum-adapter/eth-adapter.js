async function dlFilesAndWriteJsonFile(inputPath, outputPath) {
    const path = require('path');
    const inputValuesPath = path.resolve(inputPath);
    const constants = require("../constants");
    const yaml = require('js-yaml');
    const fs = require('fs');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const config = yaml.load(inputYamlFile);
    const utils = require('../utils');
    const smartContractInfo = await utils.dlFile(config.smartContractInfoLocation)
    outputPath = path.join(path.resolve(outputPath), constants.PATHS.ETH_ADAPTER_OUTPUT);
    fs.writeFileSync(outputPath, JSON.stringify(smartContractInfo));
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
