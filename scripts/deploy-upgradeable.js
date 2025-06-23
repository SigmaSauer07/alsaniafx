const { ethers, upgrades } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  const AlsaniaFX = await ethers.getContractFactory("AlsaniaFX");
  const alsania = await upgrades.deployProxy(AlsaniaFX, [], { initializer: "initialize" });
  await alsania.waitForDeployment();
  console.log("AlsaniaFX Proxy deployed to:", await alsania.getAddress());

  const NFTFactoryUpgradeable = await ethers.getContractFactory("NFTFactoryUpgradeable");
  const factory = await upgrades.deployProxy(NFTFactoryUpgradeable, [], { initializer: "initialize" });
  await factory.waitForDeployment();
  console.log("NFTFactoryUpgradeable Proxy deployed to:", await factory.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
