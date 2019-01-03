'use strict';

const hashFunction = require('ethereumjs-utils').keccak256;

class MerkleTree {
    constructor() {
        this.tree = {
            leaves: [],
            levels: [],
            isReady: false
        };

        this.resetTree = () => {
            this.tree = {};
            this.tree.leaves = [];
            this.tree.levels = [];
            this.tree.isReady = false;
        };

        this.addLeaf = (value, doHash) => {
            this.tree.isReady = false;
            if (doHash) value = hashFunction(value);
            this.tree.leaves.push(this._getBuffer(value));
        };

        this.addLeaves = (values, doHash) => {
            this.tree.isReady = false;
            values.forEach((value) => {
                if (doHash) value = hashFunction(value);
                this.tree.leaves.push(this._getBuffer(value));
            });
        };

        this.makeTree = () => {
            this.tree.isReady = false;
            this.tree.leaves.sort();
            let leafCount = this.tree.leaves.length;
            if (leafCount > 0) {
                this.tree.levels = [];
                this.tree.levels.unshift(this.tree.leaves);
                while (this.tree.levels[0].length > 1) {
                    this.tree.levels.unshift(this._calculateNextLevel());
                }
            }
            this.tree.isReady = true;
        };

        this.getMerkleRoot = (toHex=false) => {
            if (!this.tree.isReady || this.tree.levels.length === 0) return null;
            if (toHex) {
                return this._buf2hex(this.tree.levels[0][0]);
            } else {
                return this.tree.levels[0][0];
            }
        };

        // Returns the proof for a leaf at the given index as an array of merkle siblings in hex format
        this.getProof = (index) => {
            if (!this.tree.isReady) return null;
            let currentRowIndex = this.tree.levels.length - 1;
            if (index < 0 || index > this.tree.levels[currentRowIndex].length - 1) return null;  // the index it out of the bounds of the leaf array

            let proof = [];
            for (let x = currentRowIndex; x > 0; x--) {
                let currentLevelNodeCount = this.tree.levels[x].length;
                // skip if this is an odd end node
                if (index === currentLevelNodeCount - 1 && currentLevelNodeCount % 2 === 1) {
                    index = Math.floor(index / 2);
                    continue;
                }

                // determine the sibling for the current index and get its value
                let isRightNode = index % 2;
                let siblingIndex = isRightNode ? (index - 1) : (index + 1);

                let sibling = {};
                let siblingPosition = isRightNode ? 'left' : 'right';
                let siblingValue = this.tree.levels[x][siblingIndex].toString('hex');
                sibling[siblingPosition] = siblingValue;
                proof.push(sibling);
                index = Math.floor(index / 2);  // set index to the parent index
            }
            return proof;
        };

        this.getLeafCount = () => {
            return this.tree.leaves.length;
        };

        this.getLeaf = (index) => {
            if (index < 0 || index > this.tree.leaves.length - 1) return null;
            return this.tree.leaves[index];
        };

        // Takes a proof array, a target hash value, and a merkle root
        // Checks the validity of the proof and return true or false
        this.validateProof = (proof, targetHash, merkleRoot) => {
            targetHash = this._getBuffer(targetHash);
            merkleRoot = this._getBuffer(merkleRoot);
            if (proof.length === 0) return targetHash.toString('hex') === merkleRoot.toString('hex');

            let proofHash = targetHash;
            for (let x = 0; x < proof.length; x++) {
                if (proof[x].left) { // then the sibling is a left node
                    proofHash = hashFunction(Buffer.concat([this._getBuffer(proof[x].left), proofHash]));
                } else if (proof[x].right) {
                    proofHash = hashFunction(Buffer.concat([proofHash, this._getBuffer(proof[x].right)]));
                } else {
                    return false;
                }
            }

            return proofHash.toString('hex') === merkleRoot.toString('hex');
        };

        this._getBuffer = (value) => {
            if (value instanceof Buffer) {
                return value;
            } else if (this._isHex(value)) {
                return Buffer.from(value, 'hex');
            } else { // the value is neither buffer nor hex string, will not process this, throw error
                throw new Error("Bad hex value - '" + value + "'");
            }
        };

        this._isHex = (value) =>  {
            let hexRegex = /^[0-9A-Fa-f]{2,}$/;
            return hexRegex.test(value);
        };

        this._calculateNextLevel = () => {
            let nodes = [];
            let topLevel = this.tree.levels[0];
            let topLevelCount = topLevel.length;
            for (let x = 0; x < topLevelCount; x += 2) {
                if (x + 1 <= topLevelCount - 1) { // concatenate and hash the pair, add to the next level array
                    nodes.push(hashFunction(Buffer.concat([topLevel[x], topLevel[x + 1]])));
                } else { // this is an odd ending node, promote up to the next level by itself
                    nodes.push(topLevel[x]);
                }
            }
            return nodes;
        };

        this._buf2hex = (buf) => {
            return buf.toString('hex');
        };
    }
}

module.exports = MerkleTree;
