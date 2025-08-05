// AlsaniaFX NFT Marketplace Deployment Script

const { ethers, upgrades } = require("hardhat");

async function main() {
    console.log("🚀 Starting AlsaniaFX deployment...");

    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying contracts with account:", deployer.address);

    // Deploy ERC20Factory
    console.log("🏭 Deploying ERC20Factory...");
    const ERC20Factory = await ethers.getContractFactory("ERC20Factory");
    const erc20Factory = await upgrades.deployProxy(ERC20Factory, []);
    await erc20Factory.waitForDeployment();
    const erc20FactoryAddress = await erc20Factory.getAddress();
    console.log("✅ ERC20Factory deployed to:", erc20FactoryAddress);

    // Deploy ERC1155Factory
    console.log("🏭 Deploying ERC1155Factory...");
    const ERC1155Factory = await ethers.getContractFactory("ERC1155Factory");
    const erc1155Factory = await upgrades.deployProxy(ERC1155Factory, [deployer.address]);
    await erc1155Factory.waitForDeployment();
    const erc1155FactoryAddress = await erc1155Factory.getAddress();
    console.log("✅ ERC1155Factory deployed to:", erc1155FactoryAddress);

    // Deploy LazyMinting
    console.log("🎨 Deploying LazyMinting...");
    const LazyMinting = await ethers.getContractFactory("LazyMinting");
    const lazyMinting = await upgrades.deployProxy(LazyMinting, []);
    await lazyMinting.waitForDeployment();
    const lazyMintingAddress = await lazyMinting.getAddress();
    console.log("✅ LazyMinting deployed to:", lazyMintingAddress);

    // Deploy AlsaniaFX Marketplace
    console.log("🏪 Deploying AlsaniaFX Marketplace...");
    const AlsaniaFX = await ethers.getContractFactory("AlsaniaFX");
    const marketplace = await upgrades.deployProxy(AlsaniaFX, [
        deployer.address
    ]);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    console.log("✅ AlsaniaFX Marketplace deployed to:", marketplaceAddress);

    // Configure marketplace with ERC20Factory
    console.log("🔧 Configuring marketplace...");
    await marketplace.setERC20Factory(erc20FactoryAddress);
    await marketplace.toggleERC20Trading(true);
    console.log("✅ Marketplace configured with ERC20Factory");

    // Save deployment info
    const deploymentInfo = {
        network: "localhost",
        deployer: deployer.address,
        contracts: {
            marketplace: marketplaceAddress,
            erc20Factory: erc20FactoryAddress,
            erc1155Factory: erc1155FactoryAddress,
            lazyMinting: lazyMintingAddress
        },
        timestamp: new Date().toISOString()
    };

    console.log("\n📋 Deployment Summary:");
    console.log("================================");
    console.log("🌐 Network:", deploymentInfo.network);
    console.log("👤 Deployer:", deploymentInfo.deployer);
    console.log("🏪 Marketplace:", deploymentInfo.contracts.marketplace);
    console.log("🏭 ERC20Factory:", deploymentInfo.contracts.erc20Factory);
    console.log("🏭 ERC1155Factory:", deploymentInfo.contracts.erc1155Factory);
    console.log("🎨 LazyMinting:", deploymentInfo.contracts.lazyMinting);
    console.log("⏰ Timestamp:", deploymentInfo.timestamp);
    console.log("================================");

    console.log("\n🎉 Deployment completed successfully!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
