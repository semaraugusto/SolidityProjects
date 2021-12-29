const Ballot = artifacts.require('./BallotOld.sol')
const ethers = require("ethers");
const truffleCost = require('truffle-cost');


function str2bytes(text) {
    var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
    while (result.length < 66) { result += '0'; }
    if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result;
}

contract('Ballot', (accounts) => {
    before(async() => {
        this.Ballot = await Ballot.deployed()
    })

   it("Should be able to create a new ballot", async () => {
        const proposals = [str2bytes('Alice'), str2bytes('Bob'), str2bytes("Carl")];
        const contractInstance = await Ballot.new(proposals);
        // assert.equal(result.receipt.status, true);
    })

   it("Gives 9 voters the right to vote", async () => {
        results = []
        total_cost = 0
        for(i=1; i<=9; i++) {
            // result = await truffleCost.log(this.Ballot.giveRightToVote.call(accounts[i]));
            result = await truffleCost.log(this.Ballot.giveRightToVote(accounts[i]))
            tx_cost = result['receipt']['cumulativeGasUsed']
            total_cost += tx_cost
            console.log(result)
            results.push(result)
        }
        // assert.equal(result.receipt.status, true);
        console.log(this.Ballot.voters);
        // assert.equal(this.Ballot.voters.length(), 5)
        for(i=1; i<=9; i++) {
            const voter = await this.Ballot.getVoter(accounts[i])
            assert.equal(voter.weight, 1);
            assert.equal(voter.voted, false);
            assert.equal(voter.delegate, 0x0);
            assert.equal(voter.vote, 0);
        }

       console.log("OLD: Giving rights to voters spent ", total_cost)
    })

})

