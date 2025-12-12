# 🌟 AlsaniaFX - Sovereign NFT Marketplace

**The future of decentralized NFT trading** - A fully-featured, production-ready NFT marketplace built with the Alsania aesthetic and vision of true digital sovereignty.

![AlsaniaFX](https://img.shields.io/badge/Status-Production%20Ready-39ff14?style=for-the-badge)
![Solidity](https://img.shields.io/badge/Solidity-0.8.30-363636?style=for-the-badge&logo=solidity)
![License](https://img.shields.io/badge/License-MIT-0a2472?style=for-the-badge)

## ✨ What is AlsaniaFX?

AlsaniaFX is a **sovereign NFT marketplace** that rivals OpenSea and Rarible, but with unique features that put creators and collectors first. Built on the Alsania ecosystem with a stunning cyberpunk aesthetic, it offers advanced functionality while maintaining the principles of decentralization and user sovereignty.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MetaMask or compatible Web3 wallet
- Git

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/yourusername/alsaniafx.git
cd alsaniafx

# Install dependencies
npm install --legacy-peer-deps

# Compile smart contracts
npx hardhat compile

# Start local blockchain (Terminal 1)
npx hardhat node

# Deploy contracts (Terminal 2)
npx hardhat run scripts/deploy.js --network localhost

# Start frontend (Terminal 3)
cd fx-front && python3 -m http.server 8080
```

**🎯 Access the marketplace at:** `http://localhost:8080`
**👑 Admin panel at:** `http://localhost:8080/admin.html`

## 🎨 Features

### 🏪 **Marketplace Core**
- **Multi-Token Support**: ERC721, ERC1155, ERC20 tokens
- **Advanced Trading**: Fixed-price sales, Dutch auctions, English auctions
- **ERC20 Trading**: **UNIQUE** - Trade NFTs with custom ERC20 tokens
- **Lazy Minting**: Gasless NFT creation - buyers pay minting costs
- **Metadata Editing**: **UNIQUE** - Edit NFT metadata post-mint

### 🎭 **Creator Tools**
- **Multi-Standard Creation**: Create ERC721, ERC1155, and ERC20 tokens
- **Collection Management**: Organize NFTs into branded collections
- **Royalty System**: Built-in ERC2981 royalty enforcement
- **IPFS Integration**: Decentralized metadata and image storage

### 👑 **Role-Based System**
- **Admin**: Full platform control and settings management
- **Team**: Operational management and content moderation
- **Moderator**: Content review and community management
- **Approver**: Token approval and listing management
- **Creator**: Enhanced creation tools and analytics

### 🔧 **Admin Dashboard**
- **Role Management**: Grant/revoke roles with blockchain verification
- **Token Control**: Approve/disapprove ERC20 tokens for trading
- **Analytics**: Real-time marketplace statistics and insights
- **Security**: Emergency controls and audit tools

### 🎨 **UI/UX Excellence**
- **Cyberpunk Aesthetic**: Neon green (#39ff14) and midnight blue (#0a2472)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with stunning visual effects
- **Smooth Animations**: CSS transitions and hover effects
- **Accessibility**: Keyboard navigation and screen reader support

## 🏗️ Architecture

### 📋 **Smart Contracts**
```
contracts/
├── AlsaniaFX.sol          # Main marketplace with role-based access
├── NFTFactoryUpgradeable.sol  # ERC721 creation and management
├── ERC20Factory.sol       # ERC20 token creation and approval
├── ERC1155Factory.sol     # Multi-token creation and management
├── LazyMinting.sol        # Gasless NFT creation system
└── SigmaSauer07.sol       # Signature collection contract
```

### 🎨 **Frontend Structure**
```
fx-front/
├── index.html             # Main marketplace interface
├── admin.html             # Admin control panel
├── css/style.css          # Alsania-themed styling
└── js/
    ├── app.js             # Main application coordinator
    ├── web3.js            # Blockchain integration
    ├── marketplace.js     # Trading functionality
    ├── nft.js             # NFT creation and management
    ├── collections.js     # Collection management
    ├── profile.js         # User profiles and activity
    ├── admin.js           # Admin panel functionality
    └── ui.js              # User interface management
```

## 🆚 Feature Comparison

| Feature | AlsaniaFX | OpenSea | Rarible |
|---------|-----------|---------|---------|
| **ERC721 Support** | ✅ | ✅ | ✅ |
| **ERC1155 Support** | ✅ | ✅ | ✅ |
| **ERC20 Trading** | ✅ **UNIQUE** | ❌ | ❌ |
| **Metadata Editing** | ✅ **UNIQUE** | ❌ | ❌ |
| **Role-Based System** | ✅ **UNIQUE** | ❌ | ❌ |
| **Lazy Minting** | ✅ | ✅ | ✅ |
| **Custom Royalties** | ✅ | ✅ | ✅ |
| **IPFS Integration** | ✅ | ✅ | ✅ |
| **Admin Dashboard** | ✅ **FULL** | ❌ | ❌ |
| **Upgradeable Contracts** | ✅ | ❌ | ❌ |
| **Open Source** | ✅ **MIT** | ❌ | ❌ |

## 🛠️ Technology Stack

### **Blockchain**
- **Solidity 0.8.30** - Smart contract development
- **OpenZeppelin** - Security-audited contract libraries
- **Hardhat** - Development environment and testing
- **UUPS Proxy Pattern** - Upgradeable contract architecture

### **Frontend**
- **Vanilla JavaScript** - No framework dependencies
- **Ethers.js** - Ethereum blockchain interaction
- **HTML5/CSS3** - Modern web standards
- **IPFS** - Decentralized file storage

### **Development**
- **Node.js** - Development environment
- **NPM** - Package management
- **Git** - Version control

## 📖 Usage Guide

### 🔗 **Connecting Your Wallet**
1. Install MetaMask or compatible Web3 wallet
2. Connect to localhost network (Chain ID: 31337)
3. Import test accounts from Hardhat node
4. Click "Connect Wallet" in AlsaniaFX

### 🎨 **Creating NFTs**
1. Navigate to the "Create" section
2. Choose your token type (ERC721, ERC1155, Lazy, ERC20)
3. Upload image and fill metadata
4. Set price and royalty percentage
5. Confirm transaction in wallet

### 🛒 **Trading NFTs**
1. Browse marketplace or use search/filters
2. Click on NFT to view details
3. Click "Buy Now" or "Place Bid"
4. Confirm transaction and gas fees
5. NFT transfers to your wallet

### 👑 **Admin Functions**
1. Access admin panel at `/admin.html`
2. Only Admin/Team roles can access
3. Manage platform fees (1-10%)
4. Grant/revoke user roles
5. Approve ERC20 tokens for trading

## 🔧 Development

### **Local Development**
```bash
# Install dependencies
npm install --legacy-peer-deps

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Start local node
npx hardhat node

# Deploy locally
npx hardhat run scripts/deploy.js --network localhost

# Start frontend
cd fx-front && python3 -m http.server 8080
```

### **Testing**
```bash
# Run all tests
npm test

# Run specific test file
npx hardhat test test/AlsaniaFX.test.js

# Generate coverage report
npm run coverage

# Check contract size
npm run size
```

### **Deployment**
```bash
# Deploy to testnet
npm run deploy:mumbai

# Deploy to mainnet
npm run deploy:polygon

# Verify contracts
npm run verify
```

## 🛡️ Security

### **Smart Contract Security**
- **OpenZeppelin Libraries** - Battle-tested, audited contracts
- **Reentrancy Protection** - ReentrancyGuard on all payable functions
- **Access Control** - Role-based permissions with AccessControl
- **Pausable Contracts** - Emergency stop functionality
- **Upgradeable Pattern** - UUPS proxy for future improvements

### **Frontend Security**
- **Input Validation** - All user inputs sanitized and validated
- **XSS Protection** - Content Security Policy headers
- **Wallet Security** - Secure Web3 provider integration
- **HTTPS Only** - All production deployments use HTTPS

### **Best Practices**
- **Gas Optimization** - Efficient contract design
- **Error Handling** - Comprehensive error messages
- **Event Logging** - Complete audit trail
- **Testing Coverage** - Extensive test suite

## 📊 Analytics

AlsaniaFX includes comprehensive analytics:

- **Trading Volume** - Real-time volume tracking
- **User Activity** - Active users and engagement metrics
- **Collection Performance** - Top collections and trends
- **Revenue Tracking** - Platform fees and earnings
- **Gas Usage** - Transaction cost optimization

## 🤝 Contributing

We welcome contributions to AlsaniaFX! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### **Development Workflow**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### **Code Standards**
- **Solidity**: Follow OpenZeppelin patterns
- **JavaScript**: ES6+ with clear documentation
- **CSS**: BEM methodology with CSS variables
- **Git**: Conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 About Alsania

AlsaniaFX is part of the **Alsania ecosystem** - a vision of true digital sovereignty where users control their data, assets, and digital identity. Built with the principles of:

- **Decentralization** - No single point of failure
- **Transparency** - Open source and auditable
- **User Sovereignty** - You own your assets
- **Innovation** - Pushing the boundaries of what's possible

## 📞 Support

- **Documentation**: [docs.alsania.com](https://docs.alsania.com)
- **Discord**: [discord.gg/alsania](https://discord.gg/alsania)
- **Twitter**: [@AlsaniaFX](https://twitter.com/AlsaniaFX)
- **Email**: support@alsania.com

---

**🚀 Built with ❤️ by the Alsania team**

*"The future is sovereign, the future is Alsania"*