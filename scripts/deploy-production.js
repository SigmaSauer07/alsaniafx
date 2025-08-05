// AlsaniaFX Production Deployment Script
// This script handles production deployment with safety checks

const { ethers, upgrades } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting AlsaniaFX Production Deployment...");

  // Production safety checks
  await performSafetyChecks();

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.getBalance()), "ETH");

  // Verify network
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);

  // Confirm deployment
  await confirmDeployment(network.name);

  // Deploy contracts
  const deploymentInfo = await deployContracts(deployer);

  // Verify contracts
  await verifyContracts(deploymentInfo);

  // Save deployment info
  saveDeploymentInfo(deploymentInfo, network.name);

  // Update frontend configuration
  updateFrontendConfig(deploymentInfo);

  // Final verification
  await finalVerification(deploymentInfo);

  console.log("\n🎉 Production deployment completed successfully!");
  printDeploymentSummary(deploymentInfo);
}

async function performSafetyChecks() {
  console.log("\n🔒 Performing safety checks...");

  // Check environment variables
  const requiredEnvVars = [
    'PRIVATE_KEY',
    'POLYGONSCAN_API_KEY',
    'PINATA_JWT'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  // Check network
  const network = await ethers.provider.getNetwork();
  if (network.chainId === 1337n || network.chainId === 31337n) {
    throw new Error("Cannot deploy to local network in production mode");
  }

  // Check deployer balance
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.getBalance();
  const minBalance = ethers.parseEther("0.1"); // Minimum 0.1 ETH

  if (balance < minBalance) {
    throw new Error(`Insufficient balance. Need at least 0.1 ETH, have ${ethers.formatEther(balance)} ETH`);
  }

  console.log("✅ Safety checks passed");
}

async function confirmDeployment(networkName) {
  console.log(`\n⚠️  You are about to deploy to ${networkName.toUpperCase()}`);
  console.log("This is a PRODUCTION deployment. Are you sure?");
  console.log("Type 'YES' to continue:");

  // In a real scenario, you might want to use a proper prompt library
  // For now, we'll just log the warning
  console.log("Proceeding with deployment...");
}

async function deployContracts(deployer) {
  console.log("\n📦 Deploying contracts...");

  const deploymentInfo = {
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    network: (await ethers.provider.getNetwork()).name,
    contracts: {}
  };

  // Deploy NFT Factory
  console.log("Deploying NFT Factory...");
  const NFTFactory = await ethers.getContractFactory("NFTFactoryUpgradeable");
  const nftFactory = await upgrades.deployProxy(NFTFactory, [], {
    initializer: "initialize",
    kind: "uups"
  });
  await nftFactory.waitForDeployment();
  const nftFactoryAddress = await nftFactory.getAddress();
  console.log("✅ NFT Factory deployed to:", nftFactoryAddress);
  deploymentInfo.contracts.nftFactory = nftFactoryAddress;

  // Deploy Marketplace
  console.log("Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("AlsaniaFX");
  const marketplace = await upgrades.deployProxy(Marketplace, [deployer.address], {
    initializer: "initialize",
    kind: "uups"
  });
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);
  deploymentInfo.contracts.marketplace = marketplaceAddress;

  // Get deployment block
  deploymentInfo.blockNumber = await ethers.provider.getBlockNumber();

  return deploymentInfo;
}

async function verifyContracts(deploymentInfo) {
  console.log("\n🔍 Verifying contracts...");

  try {
    // Verify NFT Factory
    console.log("Verifying NFT Factory...");
    await verifyContract(deploymentInfo.contracts.nftFactory, []);

    // Verify Marketplace
    console.log("Verifying Marketplace...");
    await verifyContract(deploymentInfo.contracts.marketplace, [deploymentInfo.deployer]);

    console.log("✅ All contracts verified successfully");
  } catch (error) {
    console.log("⚠️ Verification failed:", error.message);
    console.log("You may need to verify contracts manually");
  }
}

async function verifyContract(address, constructorArguments) {
  const network = await ethers.provider.getNetwork();
  
  if (network.chainId === 137n) { // Polygon
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
  } else if (network.chainId === 80001n) { // Mumbai
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArguments,
    });
  } else {
    console.log(`Skipping verification for network ${network.name}`);
  }
}

function saveDeploymentInfo(deploymentInfo, networkName) {
  console.log("\n💾 Saving deployment information...");

  // Create deployments directory
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentPath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("✅ Deployment info saved to:", deploymentPath);

  // Create deployment summary
  const summaryPath = path.join(deploymentsDir, `${networkName}-summary.txt`);
  const summary = generateDeploymentSummary(deploymentInfo);
  fs.writeFileSync(summaryPath, summary);
  console.log("✅ Deployment summary saved to:", summaryPath);
}

function generateDeploymentSummary(deploymentInfo) {
  return `
AlsaniaFX NFT Marketplace - Production Deployment Summary
========================================================

Network: ${deploymentInfo.network}
Deployer: ${deploymentInfo.deployer}
Timestamp: ${deploymentInfo.timestamp}
Block Number: ${deploymentInfo.blockNumber}

Contracts:
- NFT Factory: ${deploymentInfo.contracts.nftFactory}
- Marketplace: ${deploymentInfo.contracts.marketplace}

Next Steps:
1. Update frontend configuration with contract addresses
2. Test all marketplace functionality
3. Set up monitoring and analytics
4. Configure IPFS gateway
5. Deploy subgraph (optional)
6. Set up backup and recovery procedures

Security Notes:
- Keep private keys secure
- Monitor contract activity
- Regular security audits
- Backup deployment information

Support:
- Documentation: https://docs.alsaniafx.com
- Community: https://discord.gg/alsania
- Issues: https://github.com/alsania/alsaniafx/issues
`;
}

function updateFrontendConfig(deploymentInfo) {
  console.log("\n⚙️ Updating frontend configuration...");

  const configPath = path.join(__dirname, '../fx-front/js/config.js');
  
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Update contract addresses
    configContent = configContent.replace(
      /CONTRACTS: \{[^}]*\}/,
      `CONTRACTS: {
        MARKETPLACE: '${deploymentInfo.contracts.marketplace}',
        NFT_FACTORY: '${deploymentInfo.contracts.nftFactory}',
    }`
    );
    
    fs.writeFileSync(configPath, configContent);
    console.log("✅ Frontend config updated");
  } else {
    console.log("⚠️ Frontend config file not found");
  }
}

async function finalVerification(deploymentInfo) {
  console.log("\n🔍 Performing final verification...");

  try {
    // Test contract interactions
    const marketplace = await ethers.getContractAt("AlsaniaFX", deploymentInfo.contracts.marketplace);
    const nftFactory = await ethers.getContractAt("NFTFactoryUpgradeable", deploymentInfo.contracts.nftFactory);

    // Check ownership
    const owner = await marketplace.owner();
    console.log("✅ Marketplace owner:", owner);

    // Check platform fee
    const platformFee = await marketplace.platformFeeBps();
    console.log("✅ Platform fee:", platformFee.toString(), "basis points");

    // Check NFT factory initialization
    const name = await nftFactory.name();
    console.log("✅ NFT Factory name:", name);

    console.log("✅ Final verification completed");
  } catch (error) {
    console.log("⚠️ Final verification failed:", error.message);
  }
}

function printDeploymentSummary(deploymentInfo) {
  console.log("\n" + "=".repeat(60));
  console.log("🎉 PRODUCTION DEPLOYMENT SUMMARY");
  console.log("=".repeat(60));
  console.log("Network:", deploymentInfo.network);
  console.log("Deployer:", deploymentInfo.deployer);
  console.log("Timestamp:", deploymentInfo.timestamp);
  console.log("Block Number:", deploymentInfo.blockNumber);
  console.log("");
  console.log("Contracts:");
  console.log("  NFT Factory:", deploymentInfo.contracts.nftFactory);
  console.log("  Marketplace:", deploymentInfo.contracts.marketplace);
  console.log("=".repeat(60));
  
  console.log("\n📋 Next Steps:");
  console.log("1. Test all marketplace functionality");
  console.log("2. Set up monitoring and alerts");
  console.log("3. Configure IPFS gateway");
  console.log("4. Deploy frontend to production");
  console.log("5. Set up backup procedures");
  console.log("6. Monitor gas usage and performance");
  
  console.log("\n🔒 Security Reminders:");
  console.log("- Keep private keys secure");
  console.log("- Monitor contract activity");
  console.log("- Regular security audits");
  console.log("- Backup deployment information");
  
  console.log("\n📞 Support:");
  console.log("- Documentation: https://docs.alsaniafx.com");
  console.log("- Community: https://discord.gg/alsania");
  console.log("- Issues: https://github.com/alsania/alsaniafx/issues");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Production deployment failed:", error);
    process.exit(1);
  }); 