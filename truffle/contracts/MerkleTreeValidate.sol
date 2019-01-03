pragma solidity ^0.4.24;

contract MerkleTreeValidate {

    function validate(bytes32[] memory proof, bool[] memory isLeft, bytes32 targetLeaf, bytes32 merkleRoot) public pure returns (bool) {
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
