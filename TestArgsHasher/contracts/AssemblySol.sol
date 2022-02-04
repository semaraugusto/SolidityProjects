// SPDX-License-Identifier: MIT
// pragma solidity >=0.4.22 <0.9.0;
pragma solidity 0.8.10;

import "./Verifier.sol";

interface iVerifier {
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[1] memory input
        ) external returns (bool r);
}

contract AssemblySol {
    event PartialSuccess(string info);
    event DataValue(bytes data);
    event ChainId(uint256 chainId);
    uint256 public constant BYTE_SIZE_MAX_EDGE_1 = 32*9;
    uint256 public constant SNARK_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;

    iVerifier verifier;
    constructor(address _verifier_addr) public {
        verifier = iVerifier(_verifier_addr);
    }

    function getData(
        uint256 _publicAmount,
        uint256 _extDataHash,
        uint256[] memory _inputNullifiers,
        uint256[] memory _outputCommitments,
        uint256 _chainId,
        bytes32[] memory _roots
    ) public view returns(bytes memory) {
        // bytes32[2] memory roots = abi.decode(_roots, (bytes32[2]));
        // bytes32[2] memory roots = _roots;
        bytes32[] memory result = new bytes32[](2);
        // assign roots
        result[0] = _roots[0];
        result[1] = _roots[1];

        uint256 i0 = _publicAmount;
        uint256 i1 = _extDataHash;
        uint256 i2 = _inputNullifiers[0];
        uint256 i3 = _inputNullifiers[1];
        uint256 i4 = _outputCommitments[0];
        uint256 i5 = _outputCommitments[1];
        uint256 i6 = _chainId;
        // emit ChainId(_chainId);
        uint256 i7 = uint256(_roots[0]);
        uint256 i8 = uint256(_roots[1]);
        bytes memory data = new bytes(32*9);
        assembly {
            mstore(add(data, 0x120), i8)
            mstore(add(data, 0x100), i7)
            mstore(add(data, 0xe0), i6)
            mstore(add(data, 0xc0), i5)
            mstore(add(data, 0xa0), i4)
            mstore(add(data, 0x80), i3)
            mstore(add(data, 0x60), i2)
            mstore(add(data, 0x40), i1)
            mstore(add(data, 0x20), i0)
        }

        return data;
    }

    function getHash(
        uint256 _publicAmount,
        uint256 _extDataHash,
        uint256[] memory _inputNullifiers,
        uint256[] memory _outputCommitments,
        uint256 _chainId,
        bytes32[] memory _roots
    ) public view returns(uint256) {
        // bytes memory data = getData(_publicAmount, _extDataHash, _inputNullifiers, _outputCommitments, _chainId, _roots))
        // TODO CALL THROUGH FUNCTION
        // bytes memory data = new bytes(32*6;
        bytes memory data = new bytes(32*9);
        bytes32[] memory result = new bytes32[](2);
        // assign roots
        result[0] = _roots[0];
        result[1] = _roots[1];
        // assign input
        {
            uint256 i0 = _publicAmount;
            uint256 i1 = _extDataHash;
            uint256 i2 = _inputNullifiers[0];
            assembly {
                mstore(add(data, 0x60), i2)
                mstore(add(data, 0x40), i1)
                mstore(add(data, 0x20), i0)
            }
        }
        {
            uint256 i3 = _inputNullifiers[1];
            uint256 i4 = _outputCommitments[0];
            assembly {
                mstore(add(data, 0xa0), i4)
                mstore(add(data, 0x80), i3)
            }
        }
        {
            uint256 i5 = _outputCommitments[1];
            uint256 i6 = _chainId;
            assembly {
                mstore(add(data, 0xe0), i6)
                mstore(add(data, 0xc0), i5)
            }
        }
        // emit ChainId(_chainId);
        { 
            uint256 i7 = uint256(_roots[0]);
            uint256 i8 = uint256(_roots[1]);
            assembly {
                mstore(add(data, 0x120), i8)
                mstore(add(data, 0x100), i7)
            }
        }
        uint256 argsHash = uint256(sha256(data)) % SNARK_FIELD;
        return argsHash;
    }

    function verifyInputs(
        uint[2] memory _a,
        uint[2][2] memory _b,
        uint[2] memory _c,
        uint[1] memory _input
    ) public returns(bool) {
        require(verifier.verifyProof(_a, _b, _c, _input));
        return true;
    }

}
