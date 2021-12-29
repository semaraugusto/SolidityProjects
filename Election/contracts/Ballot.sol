// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;
/// @title Voting with delegation.
contract Ballot {
    // This declares a new complex type which will
    // be used for variables later.
    // It will represent a single voter. Each voter can only delegate their vote. If they wanna vote they become delegators
    struct Voter{
        bool can_vote;
        bool voted; // preventing chairperson from cheating
        address delegate;
    }

    // Delegators accumulate votes sent to t
    struct Delegate{
        uint32 weight;
        uint32 proposal_id;
        bool voted;
    }

    modifier onlyChairperson {
        require(
            msg.sender == chairperson,
            "Only chairperson can give right to vote."
        );
        _;
    }

    mapping(address => Delegate) public delegates;
    // This is a type for a single proposal.
    struct Proposal {
        bytes32 name;   // short name (up to 32 bytes)
        uint32 voteCount; // number of accumulated votes (assuming max about 4Bi votes)
    }

    address public chairperson;

    // This declares a state variable that
    // stores a `Voter` struct for each possible address.
    mapping(address => Voter) public voters;

    // A dynamically-sized array of `Proposal` structs.
    Proposal[] public proposals;

    /// Create a new ballot to choose one of `proposalNames`.
    constructor(bytes32[] memory proposalNames) {
        chairperson = msg.sender;
        voters[chairperson].can_vote = true;

        // For each of the provided proposal names,
        // create a new proposal object and add it
        // to the end of the array.
        for (uint i = 0; i < proposalNames.length; i++) {
            // `Proposal({...})` creates a temporary
            // Proposal object and `proposals.push(...)`
            // appends it to the end of `proposals`.
            proposals.push(Proposal({
                name: proposalNames[i],
                voteCount: 0
            }));
        }
    }

    // Give `voters` the right to vote on this ballot.
    // May only be called by `chairperson`.
    function giveRightToVote(address[] memory voters_addr) external onlyChairperson {
        for(uint i=0; i < voters_addr.length; i++) {
            address voter = voters_addr[i];
            require(
                !voters[voter].can_vote,
                "The voter is already allowed."
            );
            require(
                !voters[voter].voted,
                "The voter has already voted."
            );
            voters[voter].can_vote = true;
        }
    }

    // TODO: Function created for debug and unit-testing purposes, should be removed on release
    function getVoter(address voter) external view onlyChairperson returns(Voter memory) {
        return voters[voter];
    } 

    /// Delegate your vote to the voter `to`.
    function delegate(address to) external {
        require(to != msg.sender, "Self-delegation is disallowed.");

        Voter storage sender = voters[msg.sender];
        require(sender.can_vote, "You already voted.");

        while (voters[to].delegate != address(0)) {
            to = voters[to].delegate;

            // We found a loop in the delegation, not allowed.
            require(to != msg.sender, "Found loop in delegation.");
        }

        sender.can_vote = false;
        sender.voted = true;
        sender.delegate = to;

        Delegate storage delegate_ = delegates[to];
        
        if (delegate_.voted) {
            // If the delegate already voted,
            // directly add to the number of votes
            proposals[delegate_.proposal_id].voteCount += 1;
        } else {
            if (delegate_.weight == 0) {
                delegate_.weight = 1; // delegates have their own votes
            }
            // If the delegate did no vote yet,
            // add to her weight.
            delegate_.weight += 1;
        }
    }

    /// Give your vote (including votes delegated to you)
    /// to proposal `proposals[proposal].name`.
    function vote(uint32 proposal) external {
        Voter storage voter = voters[msg.sender];
        require(voter.can_vote, "Has no right to vote");

        Delegate storage sender = delegates[msg.sender];
        require(!sender.voted, "Already voted.");

        voter.can_vote = false;
        voter.voted = true;

        // Allows for a random voter to become a delegate himself if he wishes to vote directly
        if (sender.weight == 0) {
            sender.weight = 1;
        } 

        sender.voted = true;
        sender.proposal_id = proposal;

        // If `proposal` is out of the range of the array,
        // this will throw automatically and revert all
        // changes.
        proposals[proposal].voteCount += sender.weight;
    }

    /// @dev Computes the winning proposal taking all
    /// previous votes into account.
    function winningProposal() public view
            returns (uint winningProposal_)
    {
        uint winningVoteCount = 0;
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                winningVoteCount = proposals[p].voteCount;
                winningProposal_ = p;
            }
        }
    }

    // Calls winningProposal() function to get the index
    // of the winner contained in the proposals array and then
    // returns the name of the winner
    function winnerName() external view
            returns (bytes32 winnerName_)
    {
        winnerName_ = proposals[winningProposal()].name;
    }
    function getVoteCounts() public view returns (uint[] memory)
    {
        uint winningVoteCount = 0;
        uint[] memory voteCounts = new uint[](proposals.length);
        for (uint p = 0; p < proposals.length; p++) {
            if (proposals[p].voteCount > winningVoteCount) {
                voteCounts[p] = proposals[p].voteCount;
            }
        }
        return voteCounts;
    }
}
