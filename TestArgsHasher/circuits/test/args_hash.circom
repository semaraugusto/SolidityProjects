pragma circom 2.0.0;

/* include "../../node_modules/circomlib/circuits/poseidon.circom"; */
/* include "../set/membership.circom"; */
/* include "../vanchor/manyMerkleProof.circom"; */
/* include "../vanchor/keypair.circom"; */
/* include "../../node_modules/circomlib/circuits/bitify.circom"; */
/* include "../../node_modules/circomlib/circuits/sha256/sha256.circom"; */

include "../TreeUpdateArgsHasher.circom";

/*
UTXO structure:
{
    chainID, // destination chain identifier
    amount,
    pubkey,
    blinding, // random number
}

commitment = hash(chainID, amount, pubKey, blinding)
nullifier = hash(commitment, merklePath, sign(privKey, commitment, merklePath))
*/
template transaction(nIns, nOuts, length) {
    signal input publicAmount;
    signal input argsHash;
    signal input extDataHash; // arbitrary
    signal input inputNullifiers[nIns];
    signal input outputCommitments[nOuts];
    signal input chainID;
    signal input roots[length];

    component argsHasher = TreeUpdateArgsHasher(nIns, nOuts, length);

    argsHasher.publicAmount <== publicAmount;
    argsHasher.extDataHash <== extDataHash;
    for(var i = 0; i < nIns; i++) {
        argsHasher.inputNullifiers[i] <== inputNullifiers[i];
    }
    for(var i = 0; i < nOuts; i++) {
        argsHasher.outputCommitments[i] <== outputCommitments[i];
    }
    argsHasher.chainID <== chainID;

    for(var i = 0; i < length; i++) {
        argsHasher.roots[i] <== roots[i];
    }

    argsHash === argsHasher.out;
}

component main {public [argsHash]} = transaction(2, 2, 2);
/* component main = Multiplier(2); */
// zeroLeaf = Poseidon(zero, zero)
// default `zero` value is keccak256("tornado") % FIELD_SIZE = 21663839004416932945382355908790599225266501822907911457504978515578255421292
/* component main {public [argsHash]} = TestHashArgs(5, 2, 2, 11850551329423159860688778991827824730037759162201783566284850822760196767874, 2); */
// component main = TestHashArgs(5, 2, 2, 11850551329423159860688778991827824730037759162201783566284850822760196767874, 2);
