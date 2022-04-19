function processFlags() {
    const argv = require('minimist')(process.argv)

    if (argv.h || argv.help) {
        return require('./utils').showHelp();
    }
    if (!argv.i) {
        console.log('Error: Input values.yaml file not provided.\n\n');
        return require('./utils').showHelp();
    }

    if (!argv.o){
        console.log('Output path not provided.\n\n');
        return require('./utils').showHelp();
    }

    deploySmartContracts(argv.i, argv.o);
}

const downloadSmartContracts = require("./downloadSmartContracts").downloadAndStoreSmartContracts;
function getConfig(inputPath, outputPath) {
    const path = require('path');
    const inputValuesPath = path.resolve(inputPath);

    const yaml = require('js-yaml');
    const fs = require('fs');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const parsedInputFile = yaml.load(inputYamlFile);
    parsedInputFile.outputPath = path.resolve(outputPath);
    return parsedInputFile;
}

function deploySmartContracts(inputPath, outputPath) {
    const config = getConfig(inputPath, outputPath);
    downloadSmartContracts(config, (err)=>{
        if (err) {
            console.log(err);
            process.exit(1);
        }

        require("./deploySmartContracts").deploySmartContractsAndStoreInfo(config);
    })
}

module.exports = {
    processFlags
}