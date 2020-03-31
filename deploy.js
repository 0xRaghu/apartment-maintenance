const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');
const compiledAptMaint = require('./build/AptMaint.json');

const provider = new HDWalletProvider(

    'find uncle rally cliff work shed yellow truth penalty hollow castle dizzy','https://rinkeby.infura.io/v3/ea5bf8dbd343494495ae2a2570015a33'
);

const web3 = new Web3(provider);

const deploy = async () => {
   const accounts = await web3.eth.getAccounts();
   console.log('Attempting to deploy from Account',accounts[0]);

   const result = await new web3.eth.Contract(compiledAptMaint.abi)
   .deploy({ data: '0x' + compiledAptMaint.bytecode, arguments:[4]})
   .send ({ from: accounts[0] });

   console.log('Contract Deployed to:', result.options.address);
};
deploy();

//Contract Deployed to: 0x31375df967fe2786873DD5B5B16c2e3E6b0bC6dD

