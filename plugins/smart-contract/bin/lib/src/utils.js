function showHelp(){
    return console.log('\n\nPharmaLedger plugin for helm.\n\n' +
        'Usage : helm plugin-name --smartContract -i <input> -o <output> \n\n'+
        '--smartContract command flags:\n\n' +
        '-i <values.yaml file path>\n' +
        '-o <output path where to store the generated json files>\n\n');
}


module.exports = {
    showHelp
}
