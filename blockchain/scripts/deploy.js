async function main() {
  console.log("🚀 Deploying CipherDocs...");

  const Contract = await ethers.getContractFactory("CipherDocs");

  const contract = await Contract.deploy();

  console.log("⏳ Waiting for deployment confirmation...");
  await contract.waitForDeployment(); // ✅ correct for ethers v6

  const address = await contract.getAddress();

  console.log("✅ Deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
