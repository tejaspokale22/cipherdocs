const { ethers, network } = require("hardhat");

async function main() {
  console.log("Starting deployment...");
  console.log("Network:", network.name);

  // get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  // get contract factory
  const ContractFactory = await ethers.getContractFactory("CipherDocs");

  // deploy contract
  const contract = await ContractFactory.deploy();

  console.log("Transaction hash:", contract.deploymentTransaction().hash);

  // wait for deployment confirmation
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log("Contract deployed at:", contractAddress);

  // optional: log gas used
  const receipt = await contract.deploymentTransaction().wait();
  console.log("Gas used:", receipt.gasUsed.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:");
    console.error(error);
    process.exit(1);
  });
