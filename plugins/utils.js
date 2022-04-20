const constants = require("./constants");

function promisify(fun) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            function callback(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }

            args.push(callback);

            fun.call(this, ...args);
        });
    };
}

async function dlFile(githubUrl, token){
    return promisify(downloadFile)(githubUrl, token);
}

function downloadFile(url,token, callback) {
    if (typeof token === "function"){
        callback = token;
        token = undefined;
    }
    const urlObj = new URL(url);
    const http = require(urlObj.protocol.slice(0, -1));
    let data = "";
    let options;
    if (token)
    {
        options = {
            headers: {
                "Authorization": `token ${token}`
            }
        }
    } else {
        options = {};
    }
    http.get(url, options, (res) => {
        res.on('data', (chunk) => {
            data += chunk.toString();
        });

        res.on('end', () => {
            callback(undefined, data);
        })

    }).on('error', (err) => {
        callback(err);
    });
}


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

function showHelp(plugin){
    let helpMessage = `\n\nPharmaLedger plugin for helm.\n\nUsage : helm plugin-name --${plugin} -i <input> -o <output> \n\n
        --${plugin} command flags:\n\n
        -i <values.yaml file path>\n
        -o <output path where to store the generated json files>\n\n`;

    const plugins = Object.values(constants.PLUGINS);
    if (plugins.findIndex(pl => pl === plugin) === -1) {
        throw Error(`Invalid plugin name: ${plugin}`);
    }
    return helpMessage;
}

function processFlagsThenExecute(argv, fnToExecute) {
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

    fnToExecute(argv.i, argv.o);
}

module.exports = {
    generateValidator,
    showHelp,
    processFlagsThenExecute,
    dlFile
}

