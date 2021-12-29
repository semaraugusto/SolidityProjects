const ethers = require("ethers");
const Ballot = artifacts.require("Ballot");


// async function createBytes(args) {
//
// 	const name = args[0];
// 	const bytes = ethers.utils.formatBytes32String(name);
// 	console.log("Bytes:", bytes);
//     return bytes
// }
function str2bytes(text) {
    var result = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(text));
    while (result.length < 66) { result += '0'; }
    if (result.length !== 66) { throw new Error("invalid web3 implicit bytes32"); }
    return result;
}

// module.exports = function (deployer) {
//   deployer.deploy(Ballot);
// };

module.exports = (deployer, network, accounts) => {
  // const userAddress = accounts[3];
    // toUtf8Bytes
  const proposals = [str2bytes('Alice'), str2bytes('Bob'), str2bytes("Carl")];
  console.log(proposals);
  deployer.deploy(Ballot, proposals);
}
