# Ballot

This is my implementation of a voting system. It improves over Ethereum's documentation by saving gas while giving rights to voters. This implementation assumes that most voters will prefer to delegate their vote instead of voting themselves. With this assumption we get some further optimization for each voter that delegates because of the smaller Voter struct. New code is at contracts/Ballot.sol, Unit tests are provided under test/Ballot.test.js

Tested using ganache and truffle

Reference code: https://github.com/ethereum/solidity/blob/v0.4.24/docs/solidity-by-example.rst

