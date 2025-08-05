// AlsaniaFX Development Script
// This script sets up the local development environment

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting AlsaniaFX Development Environment...');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('📝 Creating .env file from template...');
  if (fs.existsSync('.env.example')) {
    fs.copyFileSync('.env.example', '.env');
    console.log('✅ .env file created. Please update with your configuration.');
  } else {
    console.log('⚠️ No .env.example found. Please create .env manually.');
  }
}

// Function to run command and log output
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// Main development setup
async function setupDev() {
  try {
    console.log('\n📦 Installing dependencies...');
    await runCommand('npm', ['install']);
    
    console.log('\n🔧 Compiling contracts...');
    await runCommand('npx', ['hardhat', 'compile']);
    
    console.log('\n🧪 Running tests...');
    await runCommand('npm', ['test']);
    
    console.log('\n🚀 Starting local blockchain...');
    const hardhatNode = spawn('npx', ['hardhat', 'node'], {
      stdio: 'pipe',
      shell: true
    });

    // Wait for node to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\n📋 Deploying contracts to local network...');
    await runCommand('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost']);
    
    console.log('\n🌐 Starting frontend server...');
    const frontendServer = spawn('python3', ['-m', 'http.server', '8000'], {
      cwd: './fx-front',
      stdio: 'pipe',
      shell: true
    });

    console.log('\n🎉 Development environment is ready!');
    console.log('📱 Frontend: http://localhost:8000');
    console.log('🔗 Hardhat Node: http://localhost:8545');
    console.log('\n📋 Available commands:');
    console.log('  - npm test          : Run tests');
    console.log('  - npm run compile   : Compile contracts');
    console.log('  - npm run deploy    : Deploy to testnet');
    console.log('  - npm run gas       : Run gas analysis');
    
    console.log('\n💡 Tips:');
    console.log('  - Connect MetaMask to localhost:8545');
    console.log('  - Import test accounts from Hardhat output');
    console.log('  - Use network ID 1337 for local development');
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development environment...');
      hardhatNode.kill();
      frontendServer.kill();
      process.exit(0);
    });

    // Keep the process running
    process.stdin.resume();

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run setup
setupDev(); 