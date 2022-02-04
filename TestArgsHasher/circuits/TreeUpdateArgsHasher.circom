pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/sha256/sha256.circom";

// Computes a SHA256 hash of all inputs packed into a byte array
// Field elements are padded to 256 bits with zeroes
template TreeUpdateArgsHasher(nIns, nOuts, length) {
    signal input publicAmount;
    signal input extDataHash; // arbitrary
    signal input inputNullifiers[nIns];
    signal input outputCommitments[nOuts];
    signal input chainID;
    signal input roots[length];
    signal output out;

    component bitsPublicAmount = Num2Bits_strict();
    component bitsExtDataHash = Num2Bits_strict();
    component bitsChainID = Num2Bits_strict();
    component bitsInputNullifiers[nIns];
    component bitsOutputCommitments[nOuts];
    component bitsRoots[length];
    bitsPublicAmount.in <== publicAmount;

    var index = 0;
    var bitsize = 256 + 256 + 256*nIns + 256*nOuts + 256 + 256*length;
    component hasher = Sha256(bitsize);
    hasher.in[index] <== 0;
    index = index + 1;
    hasher.in[index] <== 0;
    index = index + 1;
    log(publicAmount);
    for(var i = 0; i < 254; i++) {
        hasher.in[index] <== bitsPublicAmount.out[253 - i];
        index = index + 1;
    }

    bitsExtDataHash.in <== extDataHash;

    hasher.in[index] <== 0;
    index = index + 1;
    hasher.in[index] <== 0;
    index = index + 1;
    log(extDataHash);
    for(var i = 0; i < 254; i++) {
        hasher.in[index] <== bitsExtDataHash.out[253 - i];
        index = index + 1;
    }
    for(var n = 0; n < nIns; n++) {
        bitsInputNullifiers[n] = Num2Bits_strict();
        bitsInputNullifiers[n].in <== inputNullifiers[n];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        log(inputNullifiers[n]);
        for(var i = 0; i < 254; i++) {
            hasher.in[index] <== bitsInputNullifiers[n].out[253 - i];
            index = index + 1;
        }
    }

    for(var m = 0; m < nOuts; m++) {
        bitsOutputCommitments[m] = Num2Bits_strict();
        bitsOutputCommitments[m].in <== outputCommitments[m];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        log(outputCommitments[m]);
        for(var i = 0; i < 254; i++) {
            hasher.in[index] <== bitsOutputCommitments[m].out[253 - i];
            index = index + 1;
        }
    }
    bitsChainID.in <== chainID;
    hasher.in[index] <== 0;
    index = index + 1;
    hasher.in[index] <== 0;
    index = index + 1;
    log(chainID);
    for(var i = 0; i < 254; i++) {
        hasher.in[index] <== bitsChainID.out[253 - i];
        index = index + 1;
    }

    for(var m = 0; m < nOuts; m++) {
        bitsRoots[m] = Num2Bits_strict();
        bitsRoots[m].in <== roots[m];
        hasher.in[index] <== 0;
        index = index + 1;
        hasher.in[index] <== 0;
        index = index + 1;
        log(roots[m]);
        for(var i = 0; i < 254; i++) {
            hasher.in[index] <== bitsRoots[m].out[253 - i];
            index = index + 1;
        }
    }

    component b2n = Bits2Num(256);
    /* b2n.in[255] <== 0; */
    /* b2n.in[254] <== 0; */
    for (var i = 0; i < 256; i++) {
        /* b2n.in[i] <== bitsPublicAmount.out[253 - i]; */
        b2n.in[i] <== hasher.out[255 - i];
        /* b2n.in[i] <== 0; */
    }

    log(b2n.out);
   
    out <== b2n.out;
}

