pragma solidity ^0.4.24;

contract MerkleTreeValidator {
    address public owner;
    uint constant maxLengthOfProof = 1024;
    struct MerkleRoot {
        bytes32 root;
        bytes32 bufmessage;
    }

    mapping (uint256 => MerkleRoot) public merkleRootInfo;

    modifier ownerOnly() {
        require(msg.sender == owner);
        _;
    }

    constructor() public {
        owner = msg.sender;
    }

    function uploadMerkleRoot(uint256 blockNo, bytes32 root, bytes32 bufmessage) external ownerOnly returns (bool) {
        require(blockNo < block.number);
        MerkleRoot memory newRoot;
        newRoot.root = root;
        newRoot.bufmessage = bufmessage;
        merkleRootInfo[blockNo] = newRoot;
        return true;
    }

    function validate(bytes32[] memory proof, bool[] memory isLeft, bytes32 targetLeaf, bytes32 merkleRoot) public pure returns (bool) {
        require(proof.length < maxLengthOfProof);
        require(proof.length == isLeft.length);

        bytes32 targetHash = targetLeaf;
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofEle = proof[i]; 
            if (isLeft[i]) {
                targetHash = keccak256(abi.encodePacked(proofEle, targetHash));
            } else if (!isLeft[i]) {
                targetHash = keccak256(abi.encodePacked(targetHash, proofEle));
            } else {
                return false;
            }
        }
        return targetHash == merkleRoot;
    }
}
