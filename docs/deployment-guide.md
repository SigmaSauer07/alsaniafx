# 🚀 AlsaniaFX Deployment Guide

Complete guide for deploying the AlsaniaFX NFT Marketplace to various networks.

## 📋 Prerequisites

### Required Software
- Node.js 18+ 
- npm or yarn
- Git
- MetaMask or Web3 wallet

### Required Accounts
- **Polygon Network**: For mainnet deployment
- **IPFS Service**: Pinata, Infura, or self-hosted
- **Block Explorer API**: PolygonScan API key
- **Analytics Service**: Optional for tracking

## 🔧 Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/alsaniafx.git
cd alsaniafx
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env` file:
```bash
cp .env.example .env
```

Configure the following variables:
```env
# Network Configuration
NETWORK_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key_here
DEPLOYER_ADDRESS=your_deployer_address_here

# IPFS Configuration
IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_API_KEY=your_ipfs_api_key
IPFS_SECRET_KEY=your_ipfs_secret_key

# Block Explorer
POLYGONSCAN_API_KEY=your_polygonscan_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Analytics (Optional)
ANALYTICS_KEY=your_analytics_key
GOOGLE_ANALYTICS_ID=your_ga_id

# Security
SECURITY_AUDIT_ENABLED=true
AUTOMATIC_VERIFICATION=true
```

## 🏗️ Smart Contract Deployment

### Local Development

1. **Start Local Blockchain**
```bash
npx hardhat node
```

2. **Deploy Contracts**
```bash
npx hardhat run scripts/deploy.js --network localhost
```

3. **Verify Deployment**
```bash
# Check deployment status
node scripts/status.js

# Run security audit
node scripts/security-audit.js
```

### Testnet Deployment (Polygon Mumbai)

1. **Configure Network**
```bash
# Ensure you have MATIC testnet tokens
# Get from: https://faucet.polygon.technology/
```

2. **Deploy to Mumbai**
```bash
npx hardhat run scripts/deploy.js --network mumbai
```

3. **Verify Contracts**
```bash
# Automatic verification is enabled
# Check on: https://mumbai.polygonscan.com/
```

### Mainnet Deployment (Polygon)

1. **Pre-deployment Checklist**
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Gas optimization verified
- [ ] Sufficient MATIC balance
- [ ] Backup private keys secure

2. **Deploy to Mainnet**
```bash
npx hardhat run scripts/deploy.js --network polygon
```

3. **Post-deployment Verification**
```bash
# Verify contracts on PolygonScan
# Test all functionality
# Monitor for any issues
```

## 🌐 Frontend Deployment

### Local Development

1. **Start Development Server**
```bash
cd fx-front
python3 -m http.server 8000
# Or use any static server
```

2. **Access Application**
```
http://localhost:8000
```

### Production Deployment

#### Option 1: Static Hosting (Recommended)

1. **Build for Production**
```bash
# No build step needed - static files
# Just copy fx-front/ to your web server
```

2. **Deploy to Netlify**
```bash
# Connect your GitHub repository
# Set build command: none
# Set publish directory: fx-front
```

3. **Deploy to Vercel**
```bash
# Connect your GitHub repository
# Set root directory: fx-front
# Deploy automatically
```

#### Option 2: Traditional Web Server

1. **Upload Files**
```bash
# Copy fx-front/ to your web server
# Ensure proper file permissions
```

2. **Configure Web Server**
```nginx
# Nginx configuration
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/fx-front;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## 🔗 Contract Integration

### Update Frontend Configuration

After deployment, update `fx-front/js/config.js`:

```javascript
const CONFIG = {
    // Network Configuration
    network: "polygon", // or "mumbai", "localhost"
    rpcUrl: "https://polygon-rpc.com",
    
    // Contract Addresses
    contracts: {
        nftFactory: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
        lazyMinting: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853", 
        marketplace: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6"
    },
    
    // IPFS Configuration
    ipfsGateway: "https://ipfs.io/ipfs/",
    
    // Analytics
    analytics: {
        enabled: true,
        trackingId: "your-tracking-id"
    },
    
    // Features
    features: {
        lazyMinting: true,
        metadataEditing: true,
        advancedSearch: true,
        analytics: true
    }
};
```

### Environment-Specific Configurations

#### Development
```javascript
const CONFIG = {
    network: "localhost",
    rpcUrl: "http://127.0.0.1:8545",
    contracts: {
        // Local deployment addresses
    }
};
```

#### Testnet
```javascript
const CONFIG = {
    network: "mumbai",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    contracts: {
        // Mumbai deployment addresses
    }
};
```

#### Mainnet
```javascript
const CONFIG = {
    network: "polygon",
    rpcUrl: "https://polygon-rpc.com",
    contracts: {
        // Mainnet deployment addresses
    }
};
```

## 🧪 Testing & Verification

### Smart Contract Testing

1. **Run All Tests**
```bash
npm test
```

2. **Run Specific Test Suites**
```bash
# Test marketplace functionality
npx hardhat test test/AlsaniaFX.test.js

# Test NFT factory
npx hardhat test test/NFTFactoryUpgradeable.test.js

# Test lazy minting
npx hardhat test test/LazyMinting.test.js
```

3. **Gas Optimization**
```bash
npx hardhat test --gas
```

### Frontend Testing

1. **Security Audit**
```bash
node scripts/security-audit.js
```

2. **Performance Testing**
```bash
# Use browser dev tools
# Check Lighthouse scores
# Monitor Core Web Vitals
```

3. **User Acceptance Testing**
- [ ] Wallet connection works
- [ ] NFT creation functional
- [ ] Marketplace trading works
- [ ] Lazy minting operational
- [ ] Analytics dashboard loads
- [ ] Mobile responsiveness verified

## 🔒 Security Considerations

### Pre-deployment Security

1. **Smart Contract Audit**
```bash
# Run automated security checks
node scripts/security-audit.js

# Review findings and fix issues
# Consider professional audit for mainnet
```

2. **Access Control Verification**
```bash
# Verify admin functions
# Test emergency pause
# Confirm upgrade permissions
```

3. **Private Key Security**
- [ ] Use hardware wallet for mainnet
- [ ] Secure private key storage
- [ ] Multi-signature setup (recommended)
- [ ] Regular key rotation

### Post-deployment Security

1. **Monitoring Setup**
```bash
# Set up transaction monitoring
# Configure alerts for suspicious activity
# Monitor gas usage patterns
```

2. **Emergency Procedures**
```bash
# Pause contracts if needed
npx hardhat run scripts/pause-contracts.js --network polygon

# Upgrade contracts if vulnerabilities found
npx hardhat run scripts/upgrade-contracts.js --network polygon
```

## 📊 Monitoring & Analytics

### On-Chain Monitoring

1. **Transaction Monitoring**
- Monitor all contract interactions
- Track gas usage patterns
- Alert on unusual activity

2. **Performance Metrics**
- Transaction success rates
- Gas optimization
- User activity patterns

### Frontend Analytics

1. **User Behavior Tracking**
```javascript
// Analytics events
analytics.trackEvent('nft_created', { collection: 'art' });
analytics.trackEvent('nft_purchased', { price: '0.1' });
analytics.trackEvent('wallet_connected', { address: '0x...' });
```

2. **Performance Monitoring**
- Page load times
- User engagement metrics
- Error tracking

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Failures**
```bash
# Check network connection
# Verify private key
# Ensure sufficient balance
# Check gas limits
```

2. **Contract Verification Issues**
```bash
# Verify constructor arguments
# Check compiler version
# Ensure all dependencies included
```

3. **Frontend Issues**
```bash
# Check browser console
# Verify contract addresses
# Test wallet connection
# Clear browser cache
```

### Debug Commands

```bash
# Check deployment status
node scripts/status.js

# Run security audit
node scripts/security-audit.js

# Test contract functions
npx hardhat console --network localhost

# Verify contracts
npx hardhat verify --network polygon CONTRACT_ADDRESS
```

## 📈 Performance Optimization

### Gas Optimization

1. **Contract Optimization**
- Batch operations
- Efficient data structures
- Minimal external calls

2. **Frontend Optimization**
- Lazy loading
- Image compression
- CDN usage

### Scalability Considerations

1. **Network Selection**
- Polygon for low fees
- Layer 2 solutions
- Cross-chain bridges

2. **Infrastructure**
- Load balancing
- CDN deployment
- Database optimization

## 🔄 Maintenance & Updates

### Regular Maintenance

1. **Weekly Tasks**
- Monitor transaction volume
- Check for security updates
- Review user feedback

2. **Monthly Tasks**
- Update dependencies
- Review analytics
- Performance optimization

3. **Quarterly Tasks**
- Security audit
- Feature updates
- Infrastructure review

### Upgrade Procedures

1. **Contract Upgrades**
```bash
# Deploy new implementation
npx hardhat run scripts/upgrade.js --network polygon

# Verify upgrade
npx hardhat verify --network polygon NEW_ADDRESS
```

2. **Frontend Updates**
- Deploy new version
- Test thoroughly
- Monitor for issues

## 📞 Support & Resources

### Documentation
- [Smart Contract Docs](docs/contracts.md)
- [API Reference](docs/api.md)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Community
- [GitHub Issues](https://github.com/your-username/alsaniafx/issues)
- [Discord Community](https://discord.gg/alsaniafx)
- [Telegram Group](https://t.me/alsaniafx)

### Professional Services
- Smart contract audits
- Security consulting
- Development support

---

**🚀 Ready to deploy? Follow this guide step-by-step for a successful AlsaniaFX deployment!** 