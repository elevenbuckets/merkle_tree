var MyContract = artifacts.require("MerkleTreeValidator");

module.exports = function(deployer) {
    deployer.deploy(MyContract);
};
