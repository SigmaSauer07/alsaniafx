// AlsaniaFX Project Status Script
// This script provides a comprehensive overview of the project status

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 AlsaniaFX NFT Marketplace - Project Status');
console.log('='.repeat(60));

// Check project structure
function checkProjectStructure() {
  console.log('\n📁 Project Structure:');
  
  const requiredDirs = [
    'contracts',
    'fx-front',
    'test',
    'scripts',
    'docs'
  ];
  
  const requiredFiles = [
    'package.json',
    'hardhat.config.js',
    'README.md',
    '.env.example',
    'contracts/AlsaniaFX.sol',
    'contracts/NFTFactoryUpgradeable.sol',
    'fx-front/index.html',
    'fx-front/css/style.css'
  ];
  
  let allGood = true;
  
  // Check directories
  for (const dir of requiredDirs) {
    if (fs.existsSync(dir)) {
      console.log(`  ✅ ${dir}/`);
    } else {
      console.log(`  ❌ ${dir}/ (missing)`);
      allGood = false;
    }
  }
  
  // Check files
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} (missing)`);
      allGood = false;
    }
  }
  
  return allGood;
}

// Check dependencies
function checkDependencies() {
  console.log('\n📦 Dependencies:');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    
    console.log(`  ✅ ${dependencies.length} production dependencies`);
    console.log(`  ✅ ${devDependencies.length} development dependencies`);
    
    // Check for key dependencies
    const keyDeps = [
      '@openzeppelin/contracts',
      '@openzeppelin/hardhat-upgrades',
      'hardhat',
      'ethers'
    ];
    
    for (const dep of keyDeps) {
      if (dependencies.includes(dep) || devDependencies.includes(dep)) {
        console.log(`  ✅ ${dep}`);
      } else {
        console.log(`  ❌ ${dep} (missing)`);
      }
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ Error reading package.json');
    return false;
  }
}

// Check contracts
function checkContracts() {
  console.log('\n🔧 Smart Contracts:');
  
  const contracts = [
    'contracts/AlsaniaFX.sol',
    'contracts/NFTFactoryUpgradeable.sol'
  ];
  
  let allGood = true;
  
  for (const contract of contracts) {
    if (fs.existsSync(contract)) {
      const content = fs.readFileSync(contract, 'utf8');
      
      // Check for key features
      const checks = [
        { name: 'Upgradeable', pattern: 'UUPSUpgradeable', found: content.includes('UUPSUpgradeable') },
        { name: 'Ownable', pattern: 'OwnableUpgradeable', found: content.includes('OwnableUpgradeable') },
        { name: 'ReentrancyGuard', pattern: 'ReentrancyGuardUpgradeable', found: content.includes('ReentrancyGuardUpgradeable') },
        { name: 'Pausable', pattern: 'PausableUpgradeable', found: content.includes('PausableUpgradeable') },
        { name: 'ERC2981', pattern: 'ERC2981Upgradeable', found: content.includes('ERC2981Upgradeable') }
      ];
      
      console.log(`  📄 ${contract}:`);
      for (const check of checks) {
        if (check.found) {
          console.log(`    ✅ ${check.name}`);
        } else {
          console.log(`    ❌ ${check.name} (missing)`);
          allGood = false;
        }
      }
    } else {
      console.log(`  ❌ ${contract} (missing)`);
      allGood = false;
    }
  }
  
  return allGood;
}

// Check frontend
function checkFrontend() {
  console.log('\n🌐 Frontend:');
  
  const frontendFiles = [
    'fx-front/index.html',
    'fx-front/css/style.css',
    'fx-front/js/config.js',
    'fx-front/js/utils.js',
    'fx-front/js/web3.js',
    'fx-front/js/marketplace.js',
    'fx-front/js/nft.js',
    'fx-front/js/collections.js',
    'fx-front/js/profile.js',
    'fx-front/js/ui.js',
    'fx-front/js/app.js'
  ];
  
  let allGood = true;
  
  for (const file of frontendFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} (missing)`);
      allGood = false;
    }
  }
  
  return allGood;
}

// Check tests
function checkTests() {
  console.log('\n🧪 Tests:');
  
  const testFiles = [
    'test/AlsaniaFX.test.js',
    'test/NFTFactoryUpgradeable.test.js'
  ];
  
  let allGood = true;
  
  for (const file of testFiles) {
    if (fs.existsSync(file)) {
      console.log(`  ✅ ${file}`);
    } else {
      console.log(`  ❌ ${file} (missing)`);
      allGood = false;
    }
  }
  
  return allGood;
}

// Check scripts
function checkScripts() {
  console.log('\n📜 Scripts:');
  
  const scripts = [
    'scripts/deploy.js',
    'scripts/deploy-upgradeable.js',
    'scripts/deploy-production.js',
    'scripts/dev.js'
  ];
  
  let allGood = true;
  
  for (const script of scripts) {
    if (fs.existsSync(script)) {
      console.log(`  ✅ ${script}`);
    } else {
      console.log(`  ❌ ${script} (missing)`);
      allGood = false;
    }
  }
  
  return allGood;
}

// Check environment
function checkEnvironment() {
  console.log('\n⚙️ Environment:');
  
  if (fs.existsSync('.env')) {
    console.log('  ✅ .env file exists');
  } else if (fs.existsSync('.env.example')) {
    console.log('  ⚠️ .env.example exists, but .env is missing');
    console.log('  💡 Run: cp .env.example .env');
  } else {
    console.log('  ❌ No environment files found');
  }
  
  return fs.existsSync('.env');
}

// Check compilation
function checkCompilation() {
  console.log('\n🔨 Compilation:');
  
  try {
    // Check if artifacts exist
    if (fs.existsSync('artifacts/contracts/AlsaniaFX.sol/AlsaniaFX.json')) {
      console.log('  ✅ Contracts compiled');
    } else {
      console.log('  ⚠️ Contracts not compiled');
      console.log('  💡 Run: npx hardhat compile');
    }
    
    return fs.existsSync('artifacts/contracts/AlsaniaFX.sol/AlsaniaFX.json');
  } catch (error) {
    console.log('  ❌ Error checking compilation');
    return false;
  }
}

// Check deployment
function checkDeployment() {
  console.log('\n🚀 Deployment:');
  
  const deploymentsDir = 'deployments';
  
  if (fs.existsSync(deploymentsDir)) {
    const files = fs.readdirSync(deploymentsDir);
    if (files.length > 0) {
      console.log('  ✅ Deployment files found');
      for (const file of files) {
        console.log(`    📄 ${file}`);
      }
    } else {
      console.log('  ⚠️ Deployments directory empty');
    }
  } else {
    console.log('  ⚠️ No deployments directory found');
  }
  
  return fs.existsSync(deploymentsDir) && fs.readdirSync(deploymentsDir).length > 0;
}

// Generate summary
function generateSummary(results) {
  console.log('\n📊 Summary:');
  console.log('='.repeat(60));
  
  const totalChecks = Object.keys(results).length;
  const passedChecks = Object.values(results).filter(Boolean).length;
  const failedChecks = totalChecks - passedChecks;
  
  console.log(`Total Checks: ${totalChecks}`);
  console.log(`Passed: ${passedChecks} ✅`);
  console.log(`Failed: ${failedChecks} ❌`);
  
  if (failedChecks === 0) {
    console.log('\n🎉 All checks passed! Project is ready for development.');
  } else {
    console.log('\n⚠️ Some checks failed. Please address the issues above.');
  }
  
  // Next steps
  console.log('\n📋 Next Steps:');
  if (!results.environment) {
    console.log('1. Set up environment variables (.env file)');
  }
  if (!results.compilation) {
    console.log('2. Compile contracts: npx hardhat compile');
  }
  if (!results.deployment) {
    console.log('3. Deploy contracts: npm run deploy:local');
  }
  console.log('4. Start development: npm run dev');
  console.log('5. Run tests: npm test');
  
  return failedChecks === 0;
}

// Main function
function main() {
  const results = {
    structure: checkProjectStructure(),
    dependencies: checkDependencies(),
    contracts: checkContracts(),
    frontend: checkFrontend(),
    tests: checkTests(),
    scripts: checkScripts(),
    environment: checkEnvironment(),
    compilation: checkCompilation(),
    deployment: checkDeployment()
  };
  
  const allGood = generateSummary(results);
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Status check completed');
  
  if (allGood) {
    console.log('✅ Project is ready for production!');
  } else {
    console.log('⚠️ Please address the issues above before proceeding.');
  }
  
  return allGood;
}

// Run status check
main(); 