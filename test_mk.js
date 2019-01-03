const MerkleTree = require('./merkle.js');
const keccak256 = require('ethereumjs-utils').keccak256;

const merkleTree = new MerkleTree();
merkleTree.addLeaf('a', true);  // the 'true' tell addLeaf to convert to hash
merkleTree.addLeaves(['b', 'c', 'd', 'e'].map((x)=>keccak256(x).toString('hex')));
merkleTree.makeTree();

console.log("Added hashes of 'a', 'b', 'c', 'd', 'e' to the tree:");
['a', 'b', 'c', 'd', 'e'].forEach( (x) => console.log(x + ':' + keccak256(x).toString('hex')));
console.log('\nIndex of leaves are sorted by their hash in the tree:')  // ...not the order to add them
for (var i=0; i<5; i++){
    console.log(merkleTree.getLeaf(i).toString('hex'));
}
console.log('\nNumber of leaves: ' + merkleTree.getLeafCount());

let mroot = merkleTree.getMerkleRoot();

// 'good' examples
console.log('\nGood validation examples (all true):');
let proof, target, isValid;
for (var i = 0; i < 5; i ++){
    proof = merkleTree.getProof(i);
    // console.dir(proof);
    target = merkleTree.getLeaf(i);
    isValid = merkleTree.validateProof(proof, target, mroot);
    console.log(`${i+1}: ${isValid} (target hash: ${target.toString('hex')})`);
}

// 'bad' examples
console.log('\nBad validation examples (all false):');
proof = merkleTree.getProof(0);
target = keccak256('evil tx 0').toString('hex');
isValid = merkleTree.validateProof(proof, target, mroot);
console.log(`1: ${isValid} (target hash: ${target.toString('hex')})`);

proof = merkleTree.getProof(4);
target = merkleTree.getLeaf(3);  // use a wrong target hash
isValid = merkleTree.validateProof(proof, target, mroot);
console.log(`2: ${isValid} (target hash: ${target.toString('hex')})`);

console.log('\ntest resetTree() then ask for the MerkleRoot (should return null):');
merkleTree.resetTree();
console.log(merkleTree.getMerkleRoot());  // should return null
