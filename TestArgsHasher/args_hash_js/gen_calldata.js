const wc = require('../args_hash_js/witness_calculator.js');
const snarkjs = require("snarkjs");
const fs = require("fs")

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}


module.exports.genCalldata = async function(inputs) {
    let generateWitnessSuccess = true;

    const witness_path = "wtns"    
    let witness = generateWitness(inputs).then()
        .catch((error) => {
            console.error(error);
            generateWitnessSuccess = false;
        });

    if(!generateWitnessSuccess) {
        return;
    }

    var files = fs.readdirSync('./');
    console.log('files: ./ ', files)
    const { proof, publicSignals } = await snarkjs.groth16.prove("./args_hash.zkey", witness_path)
    console.log("proof done")

    const editedPublicSignals = unstringifyBigInts(publicSignals);
    const editedProof = unstringifyBigInts(proof);
    const calldata = await snarkjs.groth16.exportSolidityCallData(editedProof, editedPublicSignals);

    const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

    const a = [argv[0], argv[1]];
    const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
    const c = [argv[6], argv[7]];
    const Input = [argv[8]];

    return [a, b, c, Input];
}

async function generateWitness(inputs) {
    const buffer = fs.readFileSync("./args_hash_js/args_hash.wasm");

    const witness_path = "wtns"    
    console.log("buffer leaded ", buffer)
    let buff;
    wc(buffer).then(async witnessCalculator => {
        buff = await witnessCalculator.calculateWTNSBin(inputs,0);
        fs.writeFileSync(witness_path, buff, function(err) {
            if (err) throw err;
        })
    })
    console.log('WITNESS: ', buff)
    return buff
}
