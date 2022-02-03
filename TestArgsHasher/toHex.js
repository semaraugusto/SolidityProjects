const ethers = require("ethers");

value = String(process.argv[2])
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

console.log('value: ', value)
console.log("Hex: ", Buffer2Hex(toBuffer(ethers.BigNumber.from(value).toHexString(), 32), 32))
