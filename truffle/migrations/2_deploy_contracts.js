var MyContract = artifacts.require("MerkleTreeValidate");

module.exports = function(deployer) {
    deployer.deploy(MyContract);
};
