# AlsaniaFX NFT Marketplace

A modern, fully-featured NFT marketplace built with a clean tabbed interface, similar to aed-home and aed-admin patterns.

## Features

### 🏠 Main Marketplace (index.html)
- **Tabbed Interface**: Clean, organized navigation with 8 main sections
- **Marketplace**: Browse, search, and filter NFTs
- **Create**: Mint new NFTs with preview functionality
- **Collections**: Explore curated NFT collections
- **Lazy Minting**: Create NFTs without upfront gas costs
- **ERC20 Tokens**: Manage and trade ERC20 tokens
- **ERC-1155 Tokens**: Multi-token standard for gaming and collectibles
- **Analytics**: Market insights and performance metrics
- **Profile**: Manage your account and view your NFTs

### 🔧 Admin Panel (admin.html)
- **Dashboard**: Overview with quick actions and platform statistics
- **Role Management**: Grant and revoke user roles
- **Platform Settings**: Configure fees and settings
- **Token Management**: Approve and manage ERC20 tokens
- **Marketplace Controls**: Pause/resume marketplace operations
- **Analytics**: Platform analytics and insights
- **Security**: Security and emergency controls

## Getting Started

### Prerequisites
- Modern web browser with MetaMask extension
- Node.js and npm (for development)

### Installation
1. Clone the repository
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Start the development server: `npm run frontend:dev`

### Usage

#### Main Marketplace
1. Open `index.html` in your browser
2. Connect your MetaMask wallet
3. Navigate between tabs using the tab navigation
4. Browse NFTs, create new ones, or manage your profile

#### Admin Panel
1. Open `admin.html` in your browser
2. Connect your MetaMask wallet (must have admin role)
3. Use the tabbed interface to manage platform settings
4. Monitor analytics and control marketplace operations

## Tab Navigation

### Main Marketplace Tabs
- **Marketplace**: Browse and search NFTs with filters
- **Create**: Mint new NFTs with live preview
- **Collections**: Explore curated collections
- **Lazy Minting**: Create NFTs without gas fees
- **ERC20 Tokens**: Manage ERC20 token trading
- **ERC-1155 Tokens**: Handle multi-token standards
- **Analytics**: View market insights
- **Profile**: Manage your account and NFTs

### Admin Panel Tabs
- **Dashboard**: Overview and quick actions
- **Role Management**: User role administration
- **Platform Settings**: Fee and configuration management
- **Token Management**: ERC20 token approval system
- **Marketplace Controls**: Operational controls
- **Analytics**: Platform statistics
- **Security**: Emergency controls

## Features

### Responsive Design
- Mobile-first approach
- Adaptive tab navigation
- Touch-friendly interface

### Modern UI/UX
- Clean, professional design
- Smooth animations and transitions
- Intuitive navigation

### Web3 Integration
- MetaMask wallet connection
- Smart contract interactions
- Real-time blockchain data

### Security
- Role-based access control
- Admin authentication
- Secure transaction handling

## File Structure

```
fx-front/
├── index.html          # Main marketplace
├── admin.html          # Admin panel
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   ├── app.js          # Main application logic
│   ├── admin.js        # Admin panel logic
│   ├── ui.js           # UI utilities
│   ├── web3.js         # Web3 integration
│   └── ...             # Other modules
└── assets/
    ├── images/         # NFT images and examples
    └── icons/          # App icons
```

## Development

### Adding New Tabs
1. Add tab button to navigation in HTML
2. Create tab panel content
3. Add tab switching logic in JavaScript
4. Style new components in CSS

### Customization
- Modify CSS variables for theming
- Update tab icons and labels
- Add new functionality modules

## Browser Support
- Chrome (recommended)
- Firefox
- Safari
- Edge

## License
MIT License - see LICENSE file for details

## Support
For support and questions, please open an issue on GitHub.