
function processFlags(){
    const argv = require('minimist')(process.argv)
    if (argv.h || argv.help){
        return showHelp();
    }
    if (argv.newNetwork){

        return require('./new-network/bin/lib/src/new-network').processFlags();
    }

    if (argv.ethAdapter){

        return require('./eth-adapter/bin/lib/src/eth-adapter').processFlags();
    }

    return showHelp();
}


function showHelp(){
    return console.log('\n\nPharmaLedger plugin for helm.\n\n' +
        'Usage:\n' +
        'helm plugin-name [command] [flags]\n\n' +
        'Plugin commands:\n' +
        '-newNetwork   generate crypto for the initial node and genesis information\n'+
        '-ethAdapter   Demo code for aggregation\n\n');
}


processFlags();
