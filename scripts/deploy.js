const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  await nft.deployed();
  console.log("✅ NFT deployed to:", nft.address);

  const AlsaniaFX = await hre.ethers.getContractFactory("AlsaniaFX");
  const proxy = await upgrades.deployProxy(AlsaniaFX, [], { initializer: "initialize" });
  await proxy.waitForDeployment();
  console.log("✅ AlsaniaFX (proxy) deployed to:", await proxy.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
