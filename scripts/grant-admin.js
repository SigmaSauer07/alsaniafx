// Grant Admin Role Script for AlsaniaFX

const { ethers } = require("hardhat");

async function main() {
    console.log("🔐 Granting admin role...");

    // Get contracts
    const [deployer] = await ethers.getSigners();
    console.log("👤 Current deployer:", deployer.address);

    // Connect to marketplace contract
    const marketplaceAddress = "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853"; // Update this if needed
    const AlsaniaFX = await ethers.getContractFactory("AlsaniaFX");
    const marketplace = AlsaniaFX.attach(marketplaceAddress);

    // Define the new admin address (replace with your address)
    const newAdminAddress = "YOUR_WALLET_ADDRESS_HERE"; // Replace this!
    
    // Role hashes
    const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));
    const TEAM_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TEAM_ROLE"));

    console.log("🎯 Granting admin role to:", newAdminAddress);

    try {
        // Grant admin role
        const tx1 = await marketplace.grantRole(ADMIN_ROLE, newAdminAddress);
        await tx1.wait();
        console.log("✅ ADMIN_ROLE granted!");

        // Grant team role
        const tx2 = await marketplace.grantRole(TEAM_ROLE, newAdminAddress);
        await tx2.wait();
        console.log("✅ TEAM_ROLE granted!");

        // Verify roles
        const hasAdmin = await marketplace.hasRole(ADMIN_ROLE, newAdminAddress);
        const hasTeam = await marketplace.hasRole(TEAM_ROLE, newAdminAddress);

        console.log("\n🔍 Role verification:");
        console.log("  Admin role:", hasAdmin ? "✅ YES" : "❌ NO");
        console.log("  Team role:", hasTeam ? "✅ YES" : "❌ NO");

        console.log("\n🎉 Admin access granted successfully!");
        console.log(`Now you can access the admin panel at: http://localhost:8080/admin.html`);

    } catch (error) {
        console.error("❌ Error granting admin role:", error.message);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("Script failed:", error);
        process.exit(1);
    });