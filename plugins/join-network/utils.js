function generateValidator(){
    const crypto = require('crypto');
    const entropy = crypto.randomBytes(128);
    const eth = require('eth-crypto');
    const identity = eth.createIdentity(entropy);
    return {
        nodekey:identity.privateKey.slice(2),
        nodeAddress : identity.address.toString(),
        enode : identity.publicKey.toString()
    }
}

function showHelp(){
    return console.log('\n\nPharmaLedger plugin for helm.\n\n' +
        'Usage : helm plugin-name --joinNetwork -i <input> -o <output> \n\n'+
        '--joinNetwork command flags:\n\n' +
        '-i <values.yaml file path>\n' +
        '-o <output path where to store the generated json files>\n\n');
}


async function dlFile(githubUrl){
    const fetch = require('node-fetch');

    try {
        const res = await fetch(githubUrl);
        return res.text();
    } catch (err){
        throw err;
    }
}



module.exports = {
    generateValidator,
    showHelp,
    dlFile
}
