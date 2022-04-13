const fs = require("fs");
const path = require("path");

function downloadSmartContract(url, callback) {
    const urlObj = new URL(url);
    const urlSegments = url.split("/");
    const contractName = urlSegments[urlSegments.length - 1];
    const http = require(urlObj.protocol.slice(0, -1));
    let data = "";
    http.get(url, (res) => {
        res.on('data', (chunk) => {
            data += chunk.toString();
        });

        res.on('end', () => {
            callback(undefined, {contractName, contractCode: data});
        })

    }).on('error', (err) => {
        callback(err);
    });
}

function downloadAndStoreSmartContracts(config, callback) {
    let noRemainingSC = config.smart_contract_urls.length;
    try {
        fs.accessSync(config.paths.smart_contracts);
    } catch (e) {
        fs.mkdirSync(config.paths.smart_contracts, {recursive: true});
    }

    config.smart_contract_urls.forEach(url => {
        downloadSmartContract(url, (err, {contractName, contractCode}) => {
            if (err) {
                return callback(err);
            }

            try {
                fs.writeFileSync(path.join(config.paths.smart_contracts, contractName), contractCode);
            }catch (e) {
                return callback(e);
            }

            noRemainingSC--;
            if (noRemainingSC === 0) {
                return callback();
            }
        })
    })
}

module.exports = {
    downloadAndStoreSmartContracts
}