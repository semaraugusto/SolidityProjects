circuit_name=$1

circom "circuits/test/${circuit_name}.circom" --r1cs --wasm --sym --c

snarkjs groth16 setup ${circuit_name}.r1cs pot12_final.ptau circuit_0000.zkey
echo "test" | snarkjs zkey contribute circuit_0000.zkey $circuit_name.zkey --name="1st Contributor Name" -v

cd $circuit_name\_js;
node generate_witness.js ${circuit_name}.wasm ../PublicInputs.json ../witness.wtns

cd ../

snarkjs zkey export verificationkey $circuit_name.zkey verification_key.json

snarkjs groth16 prove args_hash.zkey witness.wtns proof_args_hash.json public_args_hash.json
snarkjs groth16 verify verification_key.json public_args_hash.json proof_args_hash.json
#
snarkjs zkey export solidityverifier args_hash.zkey verifier.sol
mv verifier.sol contracts/Verifier.sol

sed -i 's/0.6.11/0.8.10/' contracts/Verifier.sol

echo "$(snarkjs zkey export soliditycalldata public_args_hash.json proof_args_hash.json)" &> ./tmp/calldata_spawn
#
cat ./tmp/calldata_spawn
