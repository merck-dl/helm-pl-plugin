

function processFlags(){
    const argv = require('minimist')(process.argv)
    if (argv.h || argv.help){
        return require('./utils').showHelp();
    }

    if (!argv.i){
        console.log('Error: Input values.yaml file not provided.\n\n');
        return require('./utils').showHelp();
    }

    if (!argv.o){
        console.log('Output path was not provided.\n\n');
        return require('./utils').showHelp();
    }

    return generateInitialNodeCrypto(argv.i, argv.o);
}



function generateInitialNodeCrypto(inputValuesYamlFile, outputPath){
    const path = require('path');
    const inputValuesPath = path.resolve(inputValuesYamlFile);

    const yaml = require('yaml');
    const fs = require('fs');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const parsedInputFile = yaml.parse(inputYamlFile);
    //configured use case validation
    if (!parsedInputFile.use_case.newNetwork.enabled){
        return console.log('Error : values.yaml file has not enabled the newNetwork use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }


    const generatedInfoFile = path.resolve(outputPath,'new-network.plugin.json');
    const publicJson = {};
    const generatedSecretInfoFile = path.resolve(outputPath,'new-network.plugin.secrets.json');
    const secretJson = {}

    const utils = require('./utils');
    const node = utils.generateValidator();
    const genesisextradata = utils.getGenesisExtraData([node.nodeAddress]);
    const admAccount = utils.createAdmAcc();

    publicJson.extradata = genesisextradata;
    publicJson.enode = node.enode;
    publicJson.nodeAddress = node.nodeAddress;
    publicJson.genesisAccount = admAccount.account;

    secretJson.nodeKey = node.nodekey;
    secretJson.genesisKeyStoreAccount = admAccount.keyObject;
    secretJson.genesisKeyStoreAccountEncryptionPassword = admAccount.password;
    secretJson.genesisAccountPrivateKey = admAccount.privateKey;


    fs.writeFileSync(generatedInfoFile,JSON.stringify(publicJson));
    fs.writeFileSync(generatedSecretInfoFile,JSON.stringify(secretJson));

    console.log('Generated information file for newNetwork use case : ', generatedInfoFile);
    console.log('Generated secret information file for newNetwork use case : ', generatedSecretInfoFile);
}


module.exports = {
    processFlags
}

