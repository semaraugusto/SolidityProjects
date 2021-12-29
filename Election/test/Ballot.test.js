const Ballot = artifacts.require('./Ballot.sol')
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

   it("Gives 10 voters the right to vote", async () => {
        results = []
        total_cost = 0
        // for(i=1; i<=9; i++) {
        //     // result = await truffleCost.log(this.Ballot.giveRightToVote.call(accounts[i]));
        //     tx_cost = result['receipt']['cumulativeGasUsed']
        //     total_cost += tx_cost
        //     // console.log(result)
        //     results.push(result)
        // }
        result = await truffleCost.log(this.Ballot.giveRightToVote(accounts.slice(1, 11)));
        tx_cost = result['receipt']['cumulativeGasUsed'];
        total_cost += tx_cost;
        // assert.equal(result.receipt.status, true);
        // console.log(this.Ballot.voters);
        // assert.equal(this.Ballot.voters.length(), 5)
        for(i=1; i<=10; i++) {
            const voter = await this.Ballot.getVoter(accounts[i])
            assert.equal(voter.can_vote, true);
            assert.equal(voter.voted, false);
            assert.equal(voter.delegate, 0x0);
        }

       console.log("NEW: Giving rights to voters spent ", total_cost)
    })

   it("Test delegating to person that has also delegated", async () => {
        alice = accounts[1];
        bob = accounts[2];
        carl = accounts[3];
        // this.Ballot.giveRightToVote(alice);
        // this.Ballot.giveRightToVote(bob);
        // this.Ballot.giveRightToVote(carl);

        result = await this.Ballot.delegate(carl, { from: bob })
        result = await this.Ballot.delegate(bob, { from: alice })

        const bobVoter = await this.Ballot.getVoter(bob)
        console.log(bobVoter)
        assert.equal(bobVoter.can_vote, false);
        assert.equal(bobVoter.voted, true);
        assert.equal(bobVoter.delegate, carl);
       // console.log(result)
        const aliceVoter = await this.Ballot.getVoter(alice)
        console.log(aliceVoter)
        assert.equal(aliceVoter.can_vote, false);
        assert.equal(aliceVoter.voted, true);
        assert.equal(aliceVoter.delegate, carl);
        const carlVoter = await this.Ballot.getVoter(carl)
        console.log(carlVoter)
    })
   it("Random voter should be able to vote", async () => {
        john_doe = accounts[9];
        johnVoter = await this.Ballot.getVoter(john_doe);
        console.log("John_doe ", johnVoter)
        result = await this.Ballot.vote(0, { from: john_doe });

        voteCounts = await this.Ballot.getVoteCounts()
        expected_values = [1, 0, 0]
        for(i=0; i < voteCounts.length; i++) {
            assert.equal(voteCounts[i].toNumber(), expected_values[i])

        }
        const proposals = [str2bytes('Alice'), str2bytes('Bob'), str2bytes("Carl")];
        proposal_name = await this.Ballot.winningProposal();
        console.log(proposal_name)
        
    })
   it("Delegate should be able to vote", async () => {
        carl = accounts[3];
        result = await this.Ballot.vote(1, { from: carl });

        result = await this.Ballot.getVoteCounts()
        const expected_values = [1, 3, 0]
        for(i=0; i < result.length; i++) {
            assert.equal(result[i].toNumber(), expected_values[i])

        }
        carlVoter = await this.Ballot.getVoter(carl);
        console.log("carl ", carlVoter)
        assert.equal(carlVoter['voted'], true)
        assert.equal(carlVoter['can_vote'], false)
    })

   it("People should be able to delegate after he's already voted", async () => {
        carl = accounts[3];
        carlVoter = await this.Ballot.getVoter(carl);
        console.log("carl ", carlVoter)
        assert.equal(carlVoter['voted'], true)

        daniel = accounts[4];
        danielVoter = await this.Ballot.getVoter(daniel);
        console.log("daniel ", danielVoter)
        assert.equal(danielVoter['voted'], false)
        assert.equal(danielVoter['can_vote'], true)
        //
        result = await this.Ballot.delegate(carl, { from: daniel });
        //
        result = await this.Ballot.getVoteCounts()
        const expected_values = [1, 4, 0]
        for(i=0; i < result.length; i++) {
            assert.equal(result[i].toNumber(), expected_values[i])

        }
       
        danielVoter = await this.Ballot.getVoter(daniel);
        console.log("daniel ", danielVoter)
        assert.equal(danielVoter['voted'], true)
        assert.equal(danielVoter['can_vote'], false)
    })
})

