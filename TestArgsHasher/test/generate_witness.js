const wc  = require("../args_hash_js/witness_calculator.js"); 
const { readFileSync, writeFile } = require("fs");

// if (process.argv.length != 5) {
//     console.log("Usage: node generate_witness.js <file.wasm> <input.json> <output.wtns>");
// } else {

function generateWitness(filename) {
    const input = JSON.parse(readFileSync(filename, "utf-8"));
    
    const buffer = readFileSync("../args_hash_js/args_hash.wasm");
    wc(buffer).then(async witnessCalculator => {
        //    const w= await witnessCalculator.calculateWitness(input,0);
        //    for (let i=0; i< w.length; i++){
        //	console.log(w[i]);
        //    }
        const buff= await witnessCalculator.calculateWTNSBin(input,0);
        return buff
    });
}
