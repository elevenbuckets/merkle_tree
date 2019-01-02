const MerkleTree = require('./merkle.js');
const keccak256 = require('ethereumjs-utils').keccak256;

const merkleTree = new MerkleTree();
let leaves = ['a', 'b', 'c', 'd', 'e'].map((x)=>keccak256(x).toString('hex'));
merkleTree.addLeaves(leaves);
merkleTree.makeTree();

console.log("Hashes of 'a', 'b', 'c', 'd', 'e':");
['a', 'b', 'c', 'd', 'e'].forEach( (x) => console.log(x + ':' + keccak256(x).toString('hex')));
console.log('\nIndex of leaves are sorted by their hash in the tree:')  // ...not the order to add them
for (var i=0; i<5; i++){
    console.log(merkleTree.getLeaf(i).toString('hex'));
}
let mroot = merkleTree.getMerkleRoot();

// 'good' examples
console.log('\nGood examples (all true):');
let proof, target, isValid;
for (var i = 0; i < 5; i ++){
    proof = merkleTree.getProof(i);
    // console.dir(proof);
    target = merkleTree.getLeaf(i);
    isValid = merkleTree.validateProof(proof, target, mroot);
    console.log(`${i+1}: ${isValid} (${target.toString('hex')})`);
}

// 'bad' examples
console.log('\nBad examples (all false):');
proof = merkleTree.getProof(0);
target = keccak256('evil tx 0').toString('hex');
isValid = merkleTree.validateProof(proof, target, mroot);
console.log(`1: ${isValid} (${target.toString('hex')})`);

proof = merkleTree.getProof(4);
target = merkleTree.getLeaf(3);
isValid = merkleTree.validateProof(proof, target, mroot);  // use wrong proof or tx
console.log(`2: ${isValid} (${target.toString('hex')})`);
