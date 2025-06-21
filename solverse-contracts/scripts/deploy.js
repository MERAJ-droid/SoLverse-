const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  // Deploy SoulboundToken
  const SBT = await hre.ethers.getContractFactory("SoulboundToken");
  const sbt = await SBT.deploy();
  await sbt.deployed();
  console.log("SoulboundToken deployed to:", sbt.address);

  // // Deploy ContentNFT
  const ContentNFT = await hre.ethers.getContractFactory("ContentNFT");
  const contentNFT = await ContentNFT.deploy();
  await contentNFT.deployed();
  console.log("ContentNFT deployed to:", contentNFT.address);

  // Deploy ReputationOracle
  const Oracle = await hre.ethers.getContractFactory("ReputationOracle");
  const oracle = await Oracle.deploy();
  await oracle.deployed();
  console.log("ReputationOracle deployed to:", oracle.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});