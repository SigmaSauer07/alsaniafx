# 🚀 AlsaniaFX NFT Marketplace

A fully-featured, production-ready NFT marketplace built with modern web technologies and blockchain integration. AlsaniaFX provides a complete solution for creating, trading, and managing NFTs with advanced features that rival major platforms like OpenSea and Rarible.

## ✨ Features

### 🎨 Core NFT Functionality
- **ERC721 NFT Support**: Full non-fungible token creation and management
- **ERC20 Token Support**: Create and trade ERC20 tokens with approval system
- **Metadata Editing**: **UNIQUE FEATURE** - Edit NFT metadata after minting
- **Collection Management**: Create, manage, and organize NFT collections
- **Royalty System**: Up to 10% royalty configuration per collection
- **Batch Operations**: Mint multiple NFTs at once
- **Supply Control**: Set maximum supply limits for collections

### ⚡ Advanced Features
- **Lazy Minting**: Create NFTs without upfront gas costs
- **IPFS Integration**: Decentralized metadata and image storage
- **Advanced Search & Filters**: Price range, traits, rarity, date filters
- **Analytics Dashboard**: Real-time marketplace performance tracking
- **Service Worker**: Offline functionality and caching
- **Security Audit**: Automated vulnerability scanning

### 🎯 User Experience
- **Modern UI/UX**: Sleek, responsive design with smooth animations
- **Mobile Optimized**: Responsive design for all devices
- **Real-time Updates**: Live marketplace data and notifications
- **Wallet Integration**: MetaMask and Web3 wallet support
- **Performance Optimized**: Fast loading and smooth interactions

### 🔒 Security & Compliance
- **Upgradeable Contracts**: UUPS proxy pattern for future improvements
- **Reentrancy Protection**: Secure smart contract architecture
- **Access Control**: Role-based permissions and verification
- **Pausable Operations**: Emergency pause functionality
- **Comprehensive Testing**: Full test suite coverage

### 🏛️ Role-Based System
- **Admin Role**: Full marketplace control and configuration
- **Team Role**: Token approval and listing management
- **Moderator Role**: Content moderation and dispute resolution
- **Approver Role**: ERC20 token approval and verification
- **Creator Role**: NFT and token creation privileges

## 🏗️ Architecture

### Smart Contracts
```
contracts/
├── AlsaniaFX.sol              # Main marketplace contract
├── NFTFactoryUpgradeable.sol  # ERC721 NFT factory
├── ERC20Factory.sol          # ERC20 token factory
├── LazyMinting.sol           # Gasless NFT creation
└── test/                     # Contract tests
```

### Frontend Structure
```
fx-front/
├── index.html                # Main application
├── css/style.css            # Modern design system
├── js/
│   ├── app.js              # Main application logic
│   ├── web3.js             # Blockchain integration
│   ├── marketplace.js      # Marketplace functionality
│   ├── nft.js             # NFT management
│   ├── collections.js     # Collection management
│   ├── profile.js         # User profiles
│   ├── ui.js              # User interface
│   ├── lazy-minting.js    # Lazy minting feature
│   ├── erc20-manager.js   # ERC20 token management
│   ├── ipfs-integration.js # IPFS storage
│   ├── advanced-search.js  # Advanced filtering
│   ├── analytics-dashboard.js # Analytics
│   ├── performance.js     # Performance optimization
│   ├── advanced-ui.js     # Advanced UI components
│   └── analytics.js       # Analytics tracking
└── assets/                # Images, icons, fonts
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MetaMask or Web3 wallet

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/alsaniafx.git
cd alsaniafx
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Compile contracts**
```bash
npx hardhat compile
```

5. **Deploy to local network**
```bash
# Start local blockchain
npx hardhat node

# Deploy contracts (in new terminal)
npx hardhat run scripts/deploy.js --network localhost
```

6. **Start frontend**
```bash
cd fx-front
python3 -m http.server 8000
# Or use any static server
```

7. **Access the marketplace**
```
http://localhost:8000
```

## 📊 Feature Comparison

| Feature | AlsaniaFX | OpenSea | Rarible |
|---------|-----------|---------|---------|
| ERC721 Support | ✅ | ✅ | ✅ |
| ERC1155 Support | ❌ | ✅ | ✅ |
| **ERC20 Trading** | ✅ | ❌ | ❌ |
| **Metadata Editing** | ✅ | ❌ | ❌ |
| **Role-Based System** | ✅ | ❌ | ❌ |
| Lazy Minting | ✅ | ✅ | ✅ |
| IPFS Integration | ✅ | ✅ | ✅ |
| Advanced Analytics | ✅ | ✅ | ✅ |
| Mobile App | ❌ | ✅ | ✅ |
| Multi-Chain | ❌ | ✅ | ✅ |

## 🎯 Unique Features

### 🔄 Metadata Editing
**AlsaniaFX is the only marketplace that allows users to edit NFT metadata after minting!** This revolutionary feature enables creators to:
- Update NFT descriptions
- Modify attributes and traits
- Fix typos or errors
- Add new information
- Maintain full edit history

### 🪙 ERC20 Token Trading
**First marketplace to support ERC20 token trading for NFTs:**
- Create custom ERC20 tokens
- Approval system for security
- Trade NFTs with any approved token
- Flexible payment options
- Platform fee collection in tokens

### 🏛️ Role-Based Access Control
**Comprehensive role management system:**
- **Admin**: Full marketplace control, fee management
- **Team**: Token approval, listing management
- **Moderator**: Content moderation, dispute resolution
- **Approver**: ERC20 token verification
- **Creator**: NFT and token creation

### ⚡ Lazy Minting
Create NFTs without paying gas fees upfront:
- Upload metadata and images
- Set prices and royalties
- Buyers pay gas when purchasing
- Perfect for creators with limited funds

### 📈 Advanced Analytics
Comprehensive marketplace insights:
- Volume tracking over time
- Collection performance metrics
- User growth analytics
- Market trend analysis
- Real-time dashboard updates

## 🔧 Configuration

### Environment Variables
```bash
# Blockchain Configuration
NETWORK_URL=https://polygon-rpc.com
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESSES=deployed_contract_addresses

# IPFS Configuration
IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_API_KEY=your_ipfs_api_key

# Analytics
ANALYTICS_KEY=your_analytics_key
```

### Contract Addresses
After deployment, update `fx-front/js/config.js`:
```javascript
const CONFIG = {
    contracts: {
        nftFactory: "0x...",
        erc20Factory: "0x...",
        lazyMinting: "0x...",
        marketplace: "0x..."
    },
    network: "polygon",
    ipfsGateway: "https://ipfs.io/ipfs/"
};
```

## 🧪 Testing

### Smart Contract Tests
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/AlsaniaFX.test.js

# Run with coverage
npx hardhat coverage
```

### Frontend Tests
```bash
# Run security audit
node scripts/security-audit.js

# Check deployment status
node scripts/status.js
```

## 🚀 Deployment

### Local Development
```bash
# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment
```bash
# Deploy to Polygon Mumbai
npx hardhat run scripts/deploy.js --network mumbai
```

### Mainnet Deployment
```bash
# Deploy to Polygon Mainnet
npx hardhat run scripts/deploy.js --network polygon
```

## 📚 API Reference

### Smart Contract Functions

#### ERC20Factory
```solidity
// Create a new ERC20 token
function createToken(
    string memory name,
    string memory symbol,
    uint256 initialSupply,
    uint8 decimals
) public returns (address)

// Approve token for marketplace
function approveToken(address tokenAddress) public

// List token for trading
function listToken(address tokenAddress) public

// Set platform fee (1-10%)
function setPlatformFee(uint256 newFeeBps) public
```

#### AlsaniaFX Marketplace
```solidity
// Buy NFT with ERC20 tokens
function buyWithERC20(
    uint256 listingId,
    address erc20Token,
    uint256 amount
) external

// Approve ERC20 token for trading
function approveERC20Token(address tokenAddress, bool approved) public

// Role management
function grantRole(bytes32 role, address account) public
function revokeRole(bytes32 role, address account) public
```

### Frontend API

#### ERC20 Management
```javascript
// Create ERC20 token
await app.erc20Manager.createToken(name, symbol, supply, decimals);

// Approve token
await app.erc20Manager.approveToken(tokenAddress);

// Buy NFT with ERC20
await app.erc20Manager.buyNFTWithERC20(listingId, tokenAddress, amount);
```

#### Role Management
```javascript
// Grant role
await app.marketplace.grantRole(role, account);

// Check role
await app.marketplace.hasRole(role, account);
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Solidity best practices
- Write comprehensive tests
- Update documentation
- Use conventional commits
- Maintain code quality standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Hardhat for development environment
- IPFS for decentralized storage
- MetaMask for wallet integration
- Font Awesome for icons
- Google Fonts for typography

## 📞 Support

- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-username/alsaniafx/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/alsaniafx/discussions)
- **Email**: support@alsaniafx.com

## 🗺️ Roadmap

### Phase 1 (Current) ✅
- [x] ERC721 NFT support
- [x] ERC20 token trading
- [x] Metadata editing
- [x] Lazy minting
- [x] Role-based system
- [x] Advanced search
- [x] Analytics dashboard
- [x] IPFS integration

### Phase 2 (Next) 🚧
- [ ] ERC1155 support
- [ ] Multi-chain deployment
- [ ] Mobile app
- [ ] Social features
- [ ] Governance system

### Phase 3 (Future) 📋
- [ ] Cross-chain bridges
- [ ] Gaming integration
- [ ] Staking features
- [ ] DAO governance
- [ ] Advanced DeFi features

---

**Built with ❤️ by the AlsaniaFX Team**

*Empowering creators in the digital economy*

