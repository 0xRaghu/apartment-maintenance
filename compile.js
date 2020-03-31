var path = require('path');
var fs = require('fs-extra');
var solc =  require('solc');

var buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const aptmaintPath = path.resolve(__dirname, 'contracts', 'AptMaint.sol');
let contractSource = fs.readFileSync(aptmaintPath, 'utf-8');
let jsonContractSource = JSON.stringify({
    language: 'Solidity',
    sources: {
        'AptMaint.sol': {
            content: contractSource
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': [ '*' ]
            }
        }
    }
});
let output = JSON.parse(solc.compile(jsonContractSource));
contractJson = {
    'abi': {},
    'bytecode': ''
};
for (var contractName in output.contracts['AptMaint.sol']) {
    contractJson.abi = output.contracts['AptMaint.sol'][contractName].abi;
    contractJson.bytecode = output.contracts['AptMaint.sol'][contractName].evm.bytecode.object;
}

fs.ensureDirSync(buildPath);
var filePath = path.resolve(__dirname, 'build', 'AptMaint.json');

fs.writeFile(filePath, JSON.stringify(contractJson), function(err){
    if(err)
        console.error(err);
})