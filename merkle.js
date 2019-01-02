'use strict';
const hashFunction = require('ethereumjs-utils').keccak256;

var MerkleTree = function() {
    // in case 'new' was omitted
    if (!(this instanceof MerkleTree)) {
        return new MerkleTree();
    }

    var tree = {};
    tree.leaves = [];
    tree.levels = [];
    tree.isReady = false;

    this.resetTree = function() {
        tree = {};
        tree.leaves = [];
        tree.levels = [];
        tree.isReady = false;
    };

    this.addLeaf = function (value, doHash) {
        tree.isReady = false;
        if (doHash) value = hashFunction(value);
        tree.leaves.push(_getBuffer(value));
    };

    this.addLeaves = function(values, doHash){
        tree.isReady = false;
        values.forEach(function(value){
            if (doHash) value = hashFunction(value);
            tree.leaves.push(_getBuffer(value));
        });
    };

    this.makeTree = function() {
        tree.isReady = false;
        tree.leaves.sort();
        var leafCount = tree.leaves.length;
        if (leafCount > 0) {
            tree.levels = [];
            tree.levels.unshift(tree.leaves);
            while (tree.levels[0].length > 1) {
                tree.levels.unshift(_calculateNextLevel());
            }
        }
        tree.isReady = true;
    };

    // Returns the merkle root value for the tree
    this.getMerkleRoot = function (toHex = false) {
        if (!tree.isReady || tree.levels.length === 0) return null;
        if (toHex) {
            return _buf2hex(tree.levels[0][0]);
        } else {
            return tree.levels[0][0];
        }
    };

    // Returns the proof for a leaf at the given index as an array of merkle siblings in hex format
    this.getProof = function (index) {
        if (!tree.isReady) return null;
        var currentRowIndex = tree.levels.length - 1;
        if (index < 0 || index > tree.levels[currentRowIndex].length - 1) return null;  // the index it out of the bounds of the leaf array

        var proof = [];
        for (var x = currentRowIndex; x > 0; x--) {
            var currentLevelNodeCount = tree.levels[x].length;
            // skip if this is an odd end node
            if (index === currentLevelNodeCount - 1 && currentLevelNodeCount % 2 === 1) {
                index = Math.floor(index / 2);
                continue;
            }

            // determine the sibling for the current index and get its value
            var isRightNode = index % 2;
            var siblingIndex = isRightNode ? (index - 1) : (index + 1);

            var sibling = {};
            var siblingPosition = isRightNode ? 'left' : 'right';
            var siblingValue = tree.levels[x][siblingIndex].toString('hex');
            sibling[siblingPosition] = siblingValue;
            proof.push(sibling);
            index = Math.floor(index / 2);  // set index to the parent index
        }

        return proof;
    };

    this.getLeafCount = function () {
        return tree.leaves.length;
    };

    this.getLeaf = function(index) {
        if (index < 0 || index > tree.leaves.length - 1) return null;
        return tree.leaves[index];
    };

    // Takes a proof array, a target hash value, and a merkle root
    // Checks the validity of the proof and return true or false
    this.validateProof = function (proof, targetHash, merkleRoot) {
        targetHash = _getBuffer(targetHash);
        merkleRoot = _getBuffer(merkleRoot);
        if (proof.length === 0) return targetHash.toString('hex') === merkleRoot.toString('hex'); // no siblings, single item tree, so the hash should also be the root

        var proofHash = targetHash;
        for (var x = 0; x < proof.length; x++) {
            if (proof[x].left) { // then the sibling is a left node
                proofHash = hashFunction(Buffer.concat([_getBuffer(proof[x].left), proofHash]));
            } else if (proof[x].right) {
                proofHash = hashFunction(Buffer.concat([proofHash, _getBuffer(proof[x].right)]));
            } else {
                return false;
            }
        }

        return proofHash.toString('hex') === merkleRoot.toString('hex');
    };

    function _getBuffer (value) {
        if (value instanceof Buffer) {
            return value;
        } else if (_isHex(value)) {
            return Buffer.from(value, 'hex');
        } else { // the value is neither buffer nor hex string, will not process this, throw error
            throw new Error("Bad hex value - '" + value + "'");
        }
    }

    function _isHex (value) {
        var hexRegex = /^[0-9A-Fa-f]{2,}$/;
        return hexRegex.test(value);
    }

    function _calculateNextLevel () {
        var nodes = [];
        var topLevel = tree.levels[0];
        var topLevelCount = topLevel.length;
        for (var x = 0; x < topLevelCount; x += 2) {
            if (x + 1 <= topLevelCount - 1) { // concatenate and hash the pair, add to the next level array
                nodes.push(hashFunction(Buffer.concat([topLevel[x], topLevel[x + 1]])));
            } else { // this is an odd ending node, promote up to the next level by itself
                nodes.push(topLevel[x]);
            }
        }
        return nodes;
    }

    function _buf2hex(buf){
        return buf.toString('hex');
    }

};

module.exports = MerkleTree;
