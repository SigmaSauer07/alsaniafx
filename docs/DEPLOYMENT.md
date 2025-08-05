# AlsaniaFX NFT Marketplace - Deployment Guide

## Overview

This guide covers the complete deployment process for the AlsaniaFX NFT Marketplace, from local development to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Testnet Deployment](#testnet-deployment)
4. [Production Deployment](#production-deployment)
5. [Post-Deployment](#post-deployment)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software
- Node.js (v18 or higher)
- npm or yarn
- Git
- MetaMask or similar wallet
- Python 3 (for local frontend server)

### Required Accounts & API Keys
- **Ethereum Wallet**: For deployment and testing
- **PolygonScan API Key**: For contract verification
- **Pinata API Key**: For IPFS file uploads
- **Infura/Alchemy Account**: For RPC endpoints (optional)

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/alsania/alsaniafx.git
cd alsaniafx
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment template:
```bash
cp .env.example .env
```

4. Configure environment variables:
```bash
# Network Configuration
AMOY_RPC=https://rpc-amoy.polygon.technology
POLYGON_RPC=https://polygon-rpc.com
MUMBAI_RPC=https://rpc-mumbai.maticvigil.com

# Deployment
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address_here

# IPFS Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt_token

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

## Local Development

### Quick Start

Run the development script for automatic setup:

```bash
npm run dev
```

This will:
- Install dependencies
- Compile contracts
- Run tests
- Start local Hardhat node
- Deploy contracts locally
- Start frontend server

### Manual Setup

1. **Start Local Blockchain**:
```bash
npx hardhat node
```

2. **Deploy Contracts**:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Start Frontend**:
```bash
cd fx-front
python3 -m http.server 8000
```

4. **Access Application**:
- Frontend: http://localhost:8000
- Hardhat Node: http://localhost:8545

### Testing

Run the complete test suite:

```bash
npm test
```

Run specific test categories:

```bash
# Gas analysis
npm run gas

# Coverage report
npm run coverage

# Linting
npm run lint
```

## Testnet Deployment

### Amoy Testnet (Recommended)

1. **Configure Network**:
```bash
# Add Amoy to MetaMask
Network Name: Amoy
RPC URL: https://rpc-amoy.polygon.technology
Chain ID: 80002
Currency Symbol: MATIC
```

2. **Get Test MATIC**:
- Visit: https://amoy.polygonscan.com/faucet
- Request test tokens for your address

3. **Deploy Contracts**:
```bash
npm run deploy:upgradeable
```

4. **Verify Contracts**:
```bash
npx hardhat verify --network amoy <CONTRACT_ADDRESS>
```

### Mumbai Testnet

1. **Configure Network**:
```bash
# Add Mumbai to MetaMask
Network Name: Mumbai
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
```

2. **Deploy**:
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

## Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Security audit completed
- [ ] Environment variables configured
- [ ] Sufficient balance for deployment
- [ ] Network configuration verified
- [ ] Backup procedures in place

### Polygon Mainnet Deployment

1. **Safety Checks**:
```bash
npm run deploy:production
```

2. **Manual Deployment** (if needed):
```bash
npx hardhat run scripts/deploy-production.js --network polygon
```

3. **Verification**:
```bash
npx hardhat verify --network polygon <MARKETPLACE_ADDRESS> <OWNER_ADDRESS>
npx hardhat verify --network polygon <NFT_FACTORY_ADDRESS>
```

### Ethereum Mainnet Deployment

1. **Deploy**:
```bash
npx hardhat run scripts/deploy-production.js --network ethereum
```

2. **Verify**:
```bash
npx hardhat verify --network ethereum <MARKETPLACE_ADDRESS> <OWNER_ADDRESS>
```

## Post-Deployment

### Contract Verification

1. **Automatic Verification**: The deployment scripts attempt automatic verification
2. **Manual Verification**: If automatic verification fails, verify manually:

```bash
# Marketplace
npx hardhat verify --network polygon <MARKETPLACE_ADDRESS> <OWNER_ADDRESS>

# NFT Factory
npx hardhat verify --network polygon <NFT_FACTORY_ADDRESS>
```

### Frontend Configuration

1. **Update Contract Addresses**:
The deployment script automatically updates `fx-front/js/config.js`

2. **Manual Update** (if needed):
```javascript
// In fx-front/js/config.js
CONTRACTS: {
  MARKETPLACE: '0x...',
  NFT_FACTORY: '0x...',
}
```

### IPFS Configuration

1. **Pinata Setup**:
- Create account at https://pinata.cloud
- Generate API keys
- Configure in environment variables

2. **Gateway Configuration**:
```javascript
// In fx-front/js/config.js
IPFS: {
  GATEWAY: 'https://gateway.pinata.cloud/ipfs/',
  // or use public gateways
  // GATEWAY: 'https://ipfs.io/ipfs/',
}
```

### Monitoring Setup

1. **Block Explorer**:
- Monitor transactions on PolygonScan
- Set up alerts for contract events

2. **Analytics**:
- Configure Google Analytics
- Set up error tracking (Sentry)

3. **Performance Monitoring**:
- Monitor gas usage
- Track user interactions
- Monitor contract events

## Security Considerations

### Private Key Management

- **Never commit private keys** to version control
- Use environment variables for sensitive data
- Consider hardware wallets for production
- Implement multi-signature for critical operations

### Contract Security

- Regular security audits
- Monitor for suspicious activity
- Implement emergency pause functionality
- Backup deployment information

### Access Control

- Limit admin functions
- Implement proper role management
- Regular access reviews
- Secure admin key storage

## Troubleshooting

### Common Issues

1. **Deployment Fails**:
```bash
# Check balance
npx hardhat run scripts/check-balance.js

# Check network
npx hardhat run scripts/check-network.js
```

2. **Verification Fails**:
```bash
# Manual verification
npx hardhat verify --network polygon <ADDRESS> <ARGS>

# Check constructor arguments
npx hardhat run scripts/get-constructor-args.js
```

3. **Frontend Issues**:
```bash
# Clear cache
rm -rf fx-front/cache

# Rebuild
npm run frontend:build
```

4. **Gas Issues**:
```bash
# Estimate gas
npx hardhat run scripts/estimate-gas.js

# Check gas price
npx hardhat run scripts/check-gas-price.js
```

### Network Issues

1. **RPC Endpoint Issues**:
- Check endpoint availability
- Use alternative RPC providers
- Verify network configuration

2. **Transaction Failures**:
- Check gas limits
- Verify account balance
- Check network congestion

### Performance Issues

1. **High Gas Usage**:
- Optimize contract functions
- Batch operations where possible
- Use efficient data structures

2. **Slow Loading**:
- Optimize frontend assets
- Use CDN for static files
- Implement caching strategies

## Support

### Documentation
- [Technical Documentation](https://docs.alsaniafx.com)
- [API Reference](https://api.alsaniafx.com)
- [Smart Contract Docs](https://contracts.alsaniafx.com)

### Community
- [Discord](https://discord.gg/alsania)
- [Telegram](https://t.me/alsaniafx)
- [Twitter](https://twitter.com/alsaniafx)

### Issues
- [GitHub Issues](https://github.com/alsania/alsaniafx/issues)
- [Bug Reports](https://bugs.alsaniafx.com)
- [Feature Requests](https://features.alsaniafx.com)

## Maintenance

### Regular Tasks

1. **Weekly**:
- Monitor gas usage
- Check for security updates
- Review error logs

2. **Monthly**:
- Update dependencies
- Review performance metrics
- Backup deployment data

3. **Quarterly**:
- Security audit
- Performance optimization
- Feature updates

### Backup Procedures

1. **Deployment Data**:
```bash
# Backup deployment info
cp deployments/*.json backup/

# Backup configuration
cp fx-front/js/config.js backup/
```

2. **Contract Data**:
- Export contract state
- Backup IPFS data
- Document contract interactions

## Conclusion

This deployment guide covers the essential steps for deploying the AlsaniaFX NFT Marketplace. Always test thoroughly in development and testnet environments before deploying to production.

For additional support or questions, please refer to the community channels or documentation links provided above. 