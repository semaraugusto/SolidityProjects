circuit_name=args_hash

snarkjs powersoftau new bn128 19 pot12_0000.ptau -v
echo "test" | snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v
snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v

sh test_circuit_update.sh
