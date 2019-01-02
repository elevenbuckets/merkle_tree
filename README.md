This project is adapted from https://github.com/Tierion/merkle-tools .
The purpose is to generate Merkle trees, calculate the proofs, and validate the data.

Apart from removing some features, the main differences of this code is:
* Only use `keccak256` hash function (from [ethereumjs-util](https://github.com/ethereumjs/ethereumjs-util))
* Sort the leaves by using the hash of transactions (the original merkle-tools sort by the sequence while adding the leaves)

# Brief intro
See the example:

    const MerkleTree = require('merkle.js');
    let merkleTree = new MerkleTree();
    merkleTree.addLeaf(keccak256('a'));  // give a hash (in the form of hex Buffer)
    merkleTree.addLeaf('b', True);  // tell the addLeaf() to make a hash
    merkleTree.addLeaves(['c', 'd', 'e'], True);  // add multiple leaves, need to make hashes

    merkleTree.makeTree();  // Now the tree is ready

    let mroot = merkleTree.getMerkleRoot();
    let proof = merkleTree.getProof(2);  // all the proofs require to validate leave of index 2
    let target = merkleTree.getLeaf(2);
    let isValid = merkleTree.validateProof(proof, target, mroot);  // should be true here


# How to validate a tx?

           [root]         level 0
            / \      
            o  o          level 1
           /\   \
          o  o   \        level 2
         /\  /\   \
        1 2 3  4   5      level 3

For example, if there are 5 transactions (tx), the merkle tree would look like above.

* Numbers are index of tx (leaves), circles are hashes, `[root]` is Merkle root
* To validate tx 2, one need these proofs (returned value of merkleTree.getProof(2))
    - hash of `1`, hash of `hash(3)+hash(4)` in level 2, and hash of 5
    - By using the tx 2 (to be validated) and these proof, the merkleTree.validateProof() creae a new hash then compare the result with
the known merkleroot (getMerkleRoot()), and return true if the target is valid.
