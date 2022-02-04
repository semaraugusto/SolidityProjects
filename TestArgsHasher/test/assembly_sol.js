const AssemblySol = artifacts.require("AssemblySol");
const ethers = require("ethers");
const Web3 = require("web3");
const fs = require('fs');
const jsSHA = require('jssha');
const TruffleAssert = require('truffle-assertions');
const { genCalldata } = require("../args_hash_js/gen_calldata");

var web3 = new Web3('http://localhost:8545')

function getChainIdType(chainID = 31337) {
  const CHAIN_TYPE = '0x0100';
  const chainIdType = CHAIN_TYPE + toFixedHex(String(chainID), 4).substr(2);
  return Number(BigInt(chainIdType));
}


function hashInputs(input) {
  sha.update(toBuffer(input.oldRoot, 32))
  sha.update(toBuffer(input.newRoot, 32))
  sha.update(toBuffer(input.pathIndices, 4))

  for (let i = 0; i < input.instances.length; i++) {
    sha.update(toBuffer(input.hashes[i], 32))
    sha.update(toBuffer(input.instances[i], 20))
    sha.update(toBuffer(input.blocks[i], 4))
  }

  const hash = '0x' + sha.getHash('HEX')
  const result = ethers.BigNumber.from(hash)
    .mod(ethers.BigNumber.from('21888242871839275222246405745257275088548364400416034343698204186575808495617'))
    .toString()
  return result
}

const toBuffer = (value, length) =>
  Buffer.from(
    ethers.BigNumber.from(value)
      .toHexString()
      .slice(2)
      .padStart(length * 2, '0'),
    'hex',
  )

const toByteArray = (value, length) =>
    value.slice(2)
        .padStart(length * 2, '0')

const Buffer2Hex = (number, length = 32) =>
  '0x' +
  (number instanceof Buffer
    ? number.toString('hex')
    : ethers.BigNumber.from(number).toHexString().slice(2)
  ).padStart(length * 2, '0')

const toFixedHex = (number, length = 32) =>
  '0x' + number.slice(2).padStart(length*2, '0');

const toFixedSizeString = (number, length = 32) =>
  '0x' + number.padStart(length*2, '0');
  // (number instanceof String
  //   ? number.slice(2)
  //   : ethers.BigNumber.from(number).toHexString().slice(2)
  // ).padStart(length * 2, '0')


contract("AssemblySol", function (/* accounts */) {
  it("it should get data", async function () {
    let instance = await AssemblySol.deployed();
    publicInputs = JSON.parse(fs.readFileSync("./PublicInputs.json"));
    // console.log(publicInputs)
    console.log("publicAmount: ", publicInputs.publicAmount)

    // var roots = await web3.eth.abi.decodeParameters(["uint256", 'uint256'], publicInputs.roots)
    roots = publicInputs.roots

    var chainId = ethers.BigNumber.from(31337).toString()
    chainId = Buffer2Hex(toBuffer(chainId.toString()))

    let inputData = toByteArray(publicInputs.publicAmount)
    inputData += toByteArray(publicInputs.extDataHash)
    inputData += toByteArray(publicInputs.inputNullifiers[0])
    inputData += toByteArray(publicInputs.inputNullifiers[1])
    inputData += toByteArray(publicInputs.outputCommitments[0])
    inputData += toByteArray(publicInputs.outputCommitments[1])
    inputData += toByteArray(chainId.toString())
    inputData += toByteArray(roots[0])
    inputData += toByteArray(roots[1])

    const out = await instance.getData.call(
        publicInputs.publicAmount,
        publicInputs.extDataHash,
        publicInputs.inputNullifiers,
        publicInputs.outputCommitments,
        chainId,
        publicInputs.roots
    )

    inputData = "0x" + inputData.toString()
    assert.equal(inputData, out)
  });
  it("should get Hash", async function () {
    let instance = await AssemblySol.deployed();

    publicInputs = JSON.parse(fs.readFileSync("./PublicInputs.json"));
    // console.log(publicInputs)
    console.log("publicAmount: ", publicInputs.publicAmount)

    roots = publicInputs.roots

    var chainId = ethers.BigNumber.from(31337).toString()
    chainId = Buffer2Hex(toBuffer(chainId.toString()))

    let inputData = toByteArray(publicInputs.publicAmount)
    inputData += toByteArray(publicInputs.extDataHash)
    inputData += toByteArray(publicInputs.inputNullifiers[0])
    inputData += toByteArray(publicInputs.inputNullifiers[1])
    inputData += toByteArray(publicInputs.outputCommitments[0])
    inputData += toByteArray(publicInputs.outputCommitments[1])
    inputData += toByteArray(chainId.toString())
    inputData += toByteArray(roots[0])
    inputData += toByteArray(roots[1])

    inputData = "0x" + inputData.toString()
    console.log("inputData:: ", inputData)
      
    const sha = new jsSHA('SHA-256', 'ARRAYBUFFER')

    sha.update(toBuffer(inputData, 32*9))
    const hash = "0x" + sha.getHash("HEX")
    const result = ethers.BigNumber.from(hash)
        .mod(ethers.BigNumber.from('21888242871839275222246405745257275088548364400416034343698204186575808495617'))
        .toString()
    console.log("RESULT: ", result)

    const dataHash = await instance.getHash.call(
        publicInputs.publicAmount,
        publicInputs.extDataHash,
        publicInputs.inputNullifiers,
        publicInputs.outputCommitments,
        chainId,
        publicInputs.roots,
    )
    // dataHash = out[1]
    console.log('dataHash: ', toFixedHex(dataHash.toString(), 32))
    console.log('hash: ', toFixedHex(result, 32))

    assert.equal(toFixedHex(dataHash.toString(), 32), toFixedHex(result, 32))
  });

  it("should validate transaction", async function () {
    let instance = await AssemblySol.deployed();

    publicInputs = JSON.parse(fs.readFileSync("./PublicInputs.json"));
    // console.log(publicInputs)
    roots = publicInputs.roots
    var chainId = ethers.BigNumber.from(getChainIdType(31337)).toHexString()

    const out = await instance.getHash.call(
        publicInputs.publicAmount,
        publicInputs.extDataHash,
        publicInputs.inputNullifiers,
        publicInputs.outputCommitments,
        chainId,
        publicInputs.roots,
    )
    console.log(out)
    // const argsHash = ethers.BigNumber.from(out)
    const argsHash = ethers.BigNumber.from(out.toString())

    publicInputs.argsHash = argsHash
    publicInputs.chainID = ethers.BigNumber.from(getChainIdType(31337)).toHexString()
    let a, b, c, input;
    let calldata = await genCalldata(publicInputs)
    a = calldata[0]
    b = calldata[1]
    c = calldata[2]
    input = calldata[3]
    console.log("CALLDATA::: ", calldata)

    console.log("ARGS_HASH:: ", publicInputs.argsHash.toHexString())
    const response = await instance.verifyInputs.call(
        a,b,c,input
    )
    console.log(response)

    assert.equal(response, true)
    // data = out
    // console.log("cdata:: ", data)
    // console.log("idata:: ", inputData)
    //
    // assert.equal(out, true);
  });
  it("should fail validation transaction", async function () {
    let instance = await AssemblySol.deployed();

    let a = [
        "0x197045cfae96bf591ca6c0d392aee4a2b99828086da4b3d3df9eb306a6e164eb",
        "0x1cdc84480e54a6ea8f6af09d416e2c2b7ec34bc6bcc7300dc6b96c841313e513"
    ]
    let b = [
        ["0x30086658742cfe8102036e35cf635adaab028acac34543358d1354ecb2812123", "0x1a16e63feabd447ce4ee706311e4b2ded1aa355a7ad763ce308b28ed92fd7122"],
        ["0x0576d8b14e16fa583ab34498d3a635137205d8a28d14007fca7c2f99f5db3ba8", "0x0f0df29a80cd691eb3f32a8bfa1754052cdab2d017f12567a29621326bd2c603"]
    ]

    let c = [
        "0x06015f241dc4d23efe415e5f2d50cdd193e741cb3d9d1836d59043298c72a39f",
        "0x196ec9bed16298b998feb1d7a0fb6a88456c79f3be8fdc990e56a08dcd1ed91e"
    ]
    let input = ["0x196ec9bed16298b998feb1d7a0fb6a88456c79f3be8fdc990e56a08dcd1ed91e"]


    await TruffleAssert.reverts(
        instance.verifyInputs.call(
            a,b,c,input
        )
    )
  });
    
});
