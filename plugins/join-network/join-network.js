async function generateNodeCrypto(inputValuesYamlFile, outputPath) {
    const path = require('path');
    const utils = require('../utils');

    const inputValuesPath = path.resolve(inputValuesYamlFile);

    const yaml = require('js-yaml');
    const fs = require('fs');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const parsedInputFile = yaml.load(inputYamlFile);

    //configured use case validation
    if (!parsedInputFile.use_case.joinNetwork.enabled) {
        return console.log('Error: values.yaml file has not enabled the joinNetwork use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }
    const token = parsedInputFile.git_shared_configuration.read_write_token;
    const repoName = parsedInputFile.git_shared_configuration.repository_name;
    const baseShareFolder = "networks";
    const networkName = parsedInputFile.deployment.network_name;
    const genesisFileName = "genesis.json";
    const genesisUrl = `https://raw.githubusercontent.com/${repoName}/master/${baseShareFolder}/${networkName}/${genesisFileName}`

    const generatedInfoFile = path.resolve(outputPath, 'join-network.plugin.json');
    const generatedSecretInfoFile = path.resolve(outputPath, 'join-network.plugin.secrets.json');
    const publicJson = {};
    const secretJson = {};

    const node = utils.generateValidator();

    publicJson.enode = node.enode;
    publicJson.nodeAddress = node.nodeAddress;
    console.log('Downloading : ', genesisUrl);
    try {
        publicJson.genesis = await utils.dlFile(genesisUrl, token);
    } catch (e){
        return console.log(e);
    }
    secretJson.nodeKey = node.nodekey;

    fs.writeFileSync(generatedInfoFile, JSON.stringify(publicJson));
    fs.writeFileSync(generatedSecretInfoFile, JSON.stringify(secretJson));

    console.log('Generated information file for joinNetwork use case : ', generatedInfoFile);
    console.log('Generated secret information file for joinNetwork use case : ', generatedSecretInfoFile);
}

module.exports = {
    generateNodeCrypto
}
