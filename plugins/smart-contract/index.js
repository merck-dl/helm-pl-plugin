/*
config
account?= pokud neni vyrobit
network | node=


smartContractFolder=./
*/
// const downloadSmartContracts = require("./downloadSmartContracts").downloadAndStoreSmartContracts;
// function getConfig(config, outputPath) {
//     const path = require('path');
//     config.outputPath = path.resolve(outputPath);
//     return config;
// }

function deploySmartContracts(inputPath, outputPath) {
    const config = getConfig(inputPath, outputPath);
    console.log('config', config);
    // downloadSmartContracts(config, (err)=>{
    //     if (err) {
    //         console.log(err);
    //         process.exit(1);
    //     }
    // })
    require("./deploySmartContracts").deploySmartContractsAndStoreInfo(config);
}

module.exports = {
    deploySmartContracts
}