---
description: Repository Information Overview
alwaysApply: true
---

# AlsaniaFX NFT Marketplace Information

## Summary
AlsaniaFX is a fully-featured NFT marketplace built with modern web technologies and blockchain integration. It provides a complete solution for creating, trading, and managing NFTs with advanced features including ERC721 NFT support, ERC20 token trading, metadata editing, lazy minting, and a comprehensive role-based system.

## Structure
- **contracts/**: Smart contracts for the NFT marketplace, factories, and lazy minting
- **frontend/**: Web interface with admin and home components
- **subgraph/**: GraphQL API for indexing blockchain data
- **scripts/**: Deployment and utility scripts
- **test/**: Smart contract test files
- **docs/**: Documentation and deployment guides
- **deployments/**: Contract deployment artifacts
- **artifacts/**: Compiled contract artifacts
- **cache/**: Hardhat compilation cache

## Language & Runtime
**Language**: Solidity, JavaScript
**Solidity Version**: 0.8.30
**Node Version**: >=16.0.0
**Build System**: Hardhat
**Package Manager**: npm (>=8.0.0)

## Dependencies
**Main Dependencies**:
- @openzeppelin/contracts: ^5.3.0
- @openzeppelin/contracts-upgradeable: ^5.4.0
- @openzeppelin/hardhat-upgrades: ^3.9.0
- ethers: ^6.14.4
- ipfs-http-client: ^60.0.1
- pinata-sdk: ^0.1.0

**Development Dependencies**:
- hardhat: ^2.24.3
- @nomicfoundation/hardhat-toolbox: ^4.0.0
- chai: ^5.2.0
- solhint: ^4.0.0
- solidity-coverage: ^0.8.0
- dotenv: ^16.0.0

## Build & Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Compile contracts
npm run compile

# Deploy to local network
npm run node
npm run deploy:local

# Start frontend
npm run frontend:dev
```

## Smart Contracts
**Main Contracts**:
- AlsaniaFX.sol: Main marketplace contract
- NFTFactoryUpgradeable.sol: ERC721 NFT factory with upgradeable pattern
- ERC20Factory.sol: ERC20 token factory
- LazyMinting.sol: Gasless NFT creation
- SigmaSauer07.sol: Custom NFT implementation

**Deployment Networks**:
- Local: Hardhat network (chainId: 1337)
- Testnet: Polygon Amoy (chainId: 80002)
- Testnet: Polygon Mumbai (chainId: 80001)
- Mainnet: Polygon (chainId: 137)
- Mainnet: Ethereum (chainId: 1)

## Frontend
**Structure**:
- afx-admin/: Admin interface for marketplace management
- afx-home/: Public-facing marketplace interface

**Key Components**:
- web3.js: Blockchain integration
- Marketplace.js: Marketplace functionality
- nft.js: NFT management
- collections.js: Collection management
- erc20-manager.js: ERC20 token management
- lazy-minting.js: Lazy minting feature
- ipfs-integration.js: IPFS storage
- analytics-dashboard.js: Analytics tracking

## Testing
**Framework**: Hardhat with Chai
**Test Location**: test/ directory
**Naming Convention**: *.test.js
**Run Command**:
```bash
npm test
# Or for specific tests
npx hardhat test test/AlsaniaFX.test.js
# For coverage
npm run coverage
```

## Subgraph
**Dependencies**:
- @graphprotocol/graph-cli: ^0.97.1
- @graphprotocol/graph-ts: ^0.38.1

**Commands**:
```bash
# Generate code from schema
npm run subgraph:codegen
# Build subgraph
npm run subgraph:build
# Deploy subgraph
npm run subgraph:deploy
```