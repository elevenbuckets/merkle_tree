// this script generate the output parameters for the contract in
// ./truffle/contracts/MerkleTreeValidate.sol (same commit as this file)while deployed in
// remix interface
'use strict';
const MerkleTree = require('./merkle.js');
const ethUtils= require('ethereumjs-utils');

const merkleTree = new MerkleTree();
// merkleTree.addLeaves(['a', 'b', 'c', 'd', 'e'].map((x)=>ethUtils.keccak256(x).toString('hex')));
let leaves = []; for (var i = 0; i<22; i++) { leaves.push(String(Math.random())+'aa'); }
merkleTree.addLeaves(leaves.map((x)=>ethUtils.keccak256(x).toString('hex')));
merkleTree.makeTree();

let proof;
let txIdx = 15;
proof = merkleTree.getProof(txIdx, true);
console.log('Number of leaves: ' + merkleTree.getLeafCount());
console.log('< proof > ');
// console.log('[' + proof[1].map((x) => {return '"0x'+x + '"';}).join(',') + ']'); // proof array
console.log('[' + proof[1].map((x) => { return `"${ethUtils.bufferToHex(x)}"`;}).join(',') + ']');
console.log(proof[0]);  // isLeft: t/f array
console.log(ethUtils.bufferToHex(merkleTree.getLeaf(txIdx)));  // target
console.log(ethUtils.bufferToHex(merkleTree.getMerkleRoot()));  // Mer
