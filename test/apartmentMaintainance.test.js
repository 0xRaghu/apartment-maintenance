const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());

const compiledAptMaint = require('../build/AptMaint.json');

let accounts;
let aptmaint;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    aptmaint = await new web3.eth.Contract(compiledAptMaint.abi)
              .deploy({ data: compiledAptMaint.bytecode, arguments:[4]})
              .send ({ from: accounts[0], gas: '6721975'});
});


describe('AptMaint', () => {
    it ('deploys a contract', () => {
      assert.ok(aptmaint.options.address);  //options.address will have the contract deployed address,  assert.ok check if value exists
    });

    it ('check if the account used to deploy the contract is the Executor(Admin)', async () =>{
        const admin = await aptmaint.methods.requestExecutor().call();
        assert.equal(accounts[0], admin);
    });

    it ('create and modify user details', async () =>{
        await aptmaint.methods.addUser("1001","1000","Sachin","Qme91EGgm9JtvRwf8hXLkhQATX1vpmNDS6Brd79VpjHg5g").send({
            from: accounts[1], gas: '1000000'
        });

        await aptmaint.methods.modifyUser("1001","Sachin","Subash",accounts[2]).send({
            from: accounts[1], gas: '1000000'
        })

        const details = await aptmaint.methods.getUserById("1001").call();
        assert.equal(details.tenantname,"Subash");
    });



    it('allows users to pay maintainance and marks them as approvers', async () =>{
        await aptmaint.methods.addUser("1001","1000","Sachin","Qme91EGgm9JtvRwf8hXLkhQATX1vpmNDS6Brd79VpjHg5g").send({
            from: accounts[1], gas: '1000000'
        });

        await aptmaint.methods.approveNewModiferUser("1001").send({
            from: accounts[0], gas: '1000000'
        });

        await aptmaint.methods.maintPayment("1001").send({
            value: '4500',
            from: accounts[1], gas: '1000000'
        });

        const isApprover = await aptmaint.methods.maintPaymentsList("1001").call();
        assert(isApprover);
    });

    it('make sure user Maintainance Payment value is not less than sqft * sqftprice', async () => {
        try {
            await aptmaint.methods.maintPayment("1001").send({
                value: '3500',
                from: accounts[1], gas: '1000000'
            });
            assert(false); 
        } catch (err){
            assert(err);
        }
    });

    it('allows a Admin to make a payment request', async() => {
        await aptmaint.methods.createRequest('ER1','Electricity Bill','10000',accounts[2])
        .send({
            from: accounts[0],
            gas: '1000000'
        });

        const request = await aptmaint.methods.paymentRequests(0).call();
        assert.equal('ER1',request.requestid);        

    });

    it('processes requests', async () =>{
        await aptmaint.methods.addUser("1001","1000","Sachin","Qme91EGgm9JtvRwf8hXLkhQATX1vpmNDS6Brd79VpjHg5g").send({
            from: accounts[1], gas: '1000000'
        });

        await aptmaint.methods.approveNewModiferUser("1001").send({
            from: accounts[0], gas: '1000000'
        });

        await aptmaint.methods.maintPayment("1001").send({
            value: '4500',
            from: accounts[1], gas: '1000000'
        });

        await aptmaint.methods.createRequest('ER1','Electricity Bill','2000',accounts[2])
        .send({
            from: accounts[0],
            gas: '1000000'
        });

        await aptmaint.methods.approveRequest("1001","ER1").send({
            from: accounts[1],
            gas: '1000000'
        });

        await aptmaint.methods.finalizeRequest("ER1").send({
            from: accounts[0],
            gas: '1000000'
        });

        let balance = await aptmaint.methods.getBalance().call();
        assert.equal(balance,'2500');

    });

    it('Change Owner of the contract', async () =>{
        await aptmaint.methods.changeOwner(accounts[3]).send({
            from: accounts[0],
            gas: '1000000'
        });
        const admin = await aptmaint.methods.requestExecutor().call();
        assert.equal(accounts[3], admin);
    });

    it ('set the square feet price', async () => {
        await aptmaint.methods.setSqftPrice(5).send({
            from: accounts[0],
            gas: '1000000'
        });
        const price = await aptmaint.methods.sqftPrice().call();
        assert.equal(5, price);
    });

  });