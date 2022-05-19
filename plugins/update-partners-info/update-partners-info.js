async function aggregatePartnersInfo(config, outputPath) {
    const path = require('path');
    const fs = require('fs');
    const utils = require('../utils');
    //configured use case validation
    if (!config.use_case.updatePartnersInfo.enabled) {
        return console.log('Error : values.yaml file has not enabled the updatePartnersInfo use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }

    const generatedInfoFile = path.resolve(outputPath, 'update-partners-info.plugin.json');
    const publicJson = {};
    publicJson.peers = [];

    const token = config.git_shared_configuration.read_write_token;
    const repoName = config.git_shared_configuration.repository_name;
    const baseShareFolder = "networks"
    console.log("config", config);
    const networkName = config.deployment.network_name;
    const enodeFile = "enode";
    const validatorFile = "validator.keypub";
    const enodeAddressFile = "enode.address";
    const enodeAddressPortFile = "enode.address.port";

    console.log("networkName", networkName);
    const rawshared = `https://raw.githubusercontent.com/${repoName}/master/${baseShareFolder}/${networkName}`;
    const peers = config.use_case.updatePartnersInfo.peers;
    console.log("peers", peers);
    for (let i = 0; i < peers.length; i++) {
        const peer = peers[i];
        const enodeurl = `${rawshared}/${peer}/${enodeFile}`;
        console.log('Reading : ', enodeurl);
        const nodeInfo = {};
        nodeInfo.enode = (await utils.dlFile(enodeurl, token)).toString().trim();
        const nodeaddressurl = `${rawshared}/${peer}/${validatorFile}`;
        console.log('Reading: ', nodeaddressurl);
        nodeInfo.nodeKeyPublic = (await utils.dlFile(nodeaddressurl, token)).toString().trim();
        const enodeAddressUrl = `${rawshared}/${peer}/${enodeAddressFile}`;
        console.log('Reading: ', enodeAddressUrl);
        nodeInfo.enodeAddress = (await utils.dlFile(enodeAddressUrl, token)).toString().trim();
        const enodeAddressPortUrl = `${rawshared}/${peer}/${enodeAddressPortFile}`;
        console.log('Reading: ', enodeAddressPortUrl);
        nodeInfo.enodeAddressPort = (await utils.dlFile(enodeAddressPortUrl, token)).toString().trim();

        publicJson.peers.push(nodeInfo);
    }

    fs.writeFileSync(generatedInfoFile, JSON.stringify(publicJson));
    console.log('Generated information file for updatePartnersInfo use case : ', generatedInfoFile);

}


module.exports = {
    aggregatePartnersInfo
}
