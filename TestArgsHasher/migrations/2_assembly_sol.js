const Verifier = artifacts.require("Verifier");
const AssemblySol = artifacts.require("AssemblySol");

module.exports = function (deployer) {
  deployer.deploy(Verifier).then(async () => {
    let verifier = await Verifier.deployed();
    // let addr = verifier.address.toString();
    // console.log("verifier deployed at: ", addr);
    // await deployer.deploy(AssemblySol());
    await deployer.deploy(AssemblySol, verifier.address)
  });
};
