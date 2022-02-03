# Argument Hasher: a toy sample

ZK verifiers spend gas for each public input its delivered. It costs around 6k gas for each public provided on the verifier call function

This is where it gets so expensive.
```
for (uint i = 0; i < input.length; i++) {
    require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
    vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
}
```

Due to this characteristic, it might be beneficial for a protocol to hash its inputs before sending them to the verifier, and providing only a hash of the inputs as a public input.

This adds complexity to the circuit, as, also for gas optimization purposes (according to Roman Semenov. Need to test to make sure), we use a SHA256 hash instead of a more circuit friendly hash function like poseidon or MIMC.

This repo is a simple contract and its respective tests in order to make sure everything is working the same both on chain and on the js/ts side

I'd recomend using the pot12\_final.ptau for testing purposes. It takes a while to calculate the cerimony on 18+ constraints (necessary for the circuit)

Compiling using the pot12\_final.ptau provided is simple. Just run `sh test_circuit_update.sh`. It should generate a proof from the inputs in PublicInput.json and the verifier.sol on the current folder.

run contract locally using truffle

```
truffle develop
> test
```
