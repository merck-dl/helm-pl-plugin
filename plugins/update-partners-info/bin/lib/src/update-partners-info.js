

function processFlags(){
    const argv = require('minimist')(process.argv)

    if (argv.h || argv.help){
        return require('./utils').showHelp();
    }
    if (!argv.i){
        console.log('Input values.yaml file not provided.\n\n');
        return require('./utils').showHelp();
    }

    if (!argv.o){
        console.log('Output path not provided.\n\n');
        return require('./utils').showHelp();
    }

    aggregatePartnersInfo(argv.i,argv.o).then(
        () => {},
        (err) => {console.log(err)}

    );
}




async function aggregatePartnersInfo(inputValuesYamlFile, outputPath){

    const path = require('path');
    const inputValuesPath = path.resolve(inputValuesYamlFile);

    const yaml = require('yaml');
    const fs = require('fs');
    const utils = require('./utils');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const parsedInputFile = yaml.parse(inputYamlFile);
    //configured use case validation
    if (!parsedInputFile.use_case.updatePartnersInfo.enabled){
        return console.log('Error : values.yaml file has not enabled the updatePartnersInfo use case. Please review the input values.yaml configuration and execute the correct plugin for the configured use case !');
    }

    const generatedInfoFile = path.resolve(outputPath,'update-partners-info.plugin.json');
    const publicJson = {};
    publicJson.peers = [];

    const rawshared = parsedInputFile.use_case.updatePartnersInfo.shared_data_location;
    const peers = parsedInputFile.use_case.updatePartnersInfo.peers;
    for (let i = 0; i < peers.length ; i++) {
        const peer = peers[0];
        const enodeurl = rawshared+'/'+peer+'/'+'enode';
        console.log('Reading : ',enodeurl);
        const nodeInfo = {};
        nodeInfo.enode = (await utils.dlFile(enodeurl)).toString().trim();
        const nodeaddressurl = rawshared+'/'+peer+'/'+'validator.address';
        console.log('Reading: ',nodeaddressurl);
        nodeInfo.nodeAddress = (await utils.dlFile(nodeaddressurl)).toString().trim();
        const enodeIpUrl = rawshared+'/'+peer+'/'+'enode.ip';
        console.log('Reading: ',enodeIpUrl);
        nodeInfo.enodeip = (await utils.dlFile(enodeIpUrl)).toString().trim();
        const enodeIpPortUrl = rawshared+'/'+peer+'/'+'enode.ip.port';
        console.log('Reading: ',enodeIpPortUrl);
        nodeInfo.enodeipport = (await utils.dlFile(enodeIpPortUrl)).toString().trim();

        publicJson.peers.push(nodeInfo);
    }

    fs.writeFileSync(generatedInfoFile,JSON.stringify(publicJson));
    console.log('Generated information file for updatePartnersInfo use case : ', generatedInfoFile);

}




module.exports = {
    processFlags
}
