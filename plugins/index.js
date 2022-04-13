
function processFlags(){
    const argv = require('minimist')(process.argv)
    if (argv.h || argv.help){
        return showHelp();
    }
    if (argv.newNetwork){
        return require('./new-network/bin/lib/src/new-network').processFlags();
    }

    if (argv.joinNetwork){
        return require('./join-network/bin/lib/src/join-network').processFlags();
    }

    if (argv.updatePartnersInfo){
        return require('./update-partners-info/bin/lib/src/update-partners-info').processFlags();
    }

    if (argv.ethAdapter){
        return require('./ethereum-adapter/bin/lib/src/eth-adapter.js').processFlags();
    }

    if(argv.smartContract){
        return require('./smart-contract/bin/lib/src/index').processFlags();
    }

    console.log(argv);
    return showHelp();
}


function showHelp(){
    return console.log('\n\nPharmaLedger plugin for helm.\n\n' +
        'Usage:\n' +
        'helm plugin-name [command] [flags]\n\n' +
        'Plugin commands:\n' +
        '--newNetwork           generate crypto for the initial node and genesis information\n'+
        '--joinNetwork          generate crypto for the joining node\n'+
        '--updatePartnersInfo   aggregates the information regarding partners present in the network\n'+
        '--ethAdapter   Demo code for aggregation\n' +
        '--ethereumSC   deploys smart contracts\n\n');
}


processFlags();
