async function dlFilesAndWriteJsonFile(inputValuesYamlFile, outputJsonFile) {
    const path = require('path');
    const inputValuesPath = path.resolve(inputValuesYamlFile);

    const yaml = require('yaml');
    const fs = require('fs');
    const inputYamlFile = fs.readFileSync(inputValuesPath).toString('utf8');
    const parsedInputFile = yaml.parse(inputYamlFile);
    const utils = require('../utils');
    const jsonData = {};
    jsonData.genesis = await utils.dlFile(parsedInputFile.quorum.genesis_file_location);
    jsonData.data = "";
    const dlsources = parsedInputFile.quorum.other_files_to_download;
    for (let i = 0; i < dlsources.length; i++) {
        jsonData.data += await utils.dlFile(dlsources[i]) + ";";
    }
    fs.writeFileSync(outputJsonFile, JSON.stringify(jsonData));
}


module.exports = {
    downloadFilesAndCreateJSON: function (inputPath, outputPath) {
        dlFilesAndWriteJsonFile(inputPath, outputPath).then(
            () => {
            },
            (err) => {
                console.log(err);
            }
        );
    }
}
