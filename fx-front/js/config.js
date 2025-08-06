// AlsaniaFX Configuration
// This file contains all the configuration constants for the marketplace

const CONFIG = {
    // Development/Demo Settings
    DEMO_MODE: true, // Set to false in production
    
    // Network Configuration
    NETWORK: {
        CHAIN_ID: 31337, // Localhost
        CHAIN_NAME: 'Localhost',
        RPC_URL: 'http://127.0.0.1:8545',
        CURRENCY: {
            NAME: 'Ethereum',
            SYMBOL: 'ETH',
            DECIMALS: 18
        }
    },

    // Contract Addresses (updated after deployment)
    CONTRACTS: {
        MARKETPLACE: '0xa513E6E4b8f2a923D98304ec87F64353C4D5C853',
        NFT_FACTORY: '0x0000000000000000000000000000000000000000',
        ERC20_FACTORY: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
        ERC1155_FACTORY: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
        LAZY_MINTING: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
    },

    // IPFS Configuration
    IPFS: {
        GATEWAY: 'https://ipfs.io/ipfs/',
        API_ENDPOINT: 'https://api.nft.storage', // NFT.Storage for free IPFS
        PINATA_GATEWAY: 'https://gateway.pinata.cloud/ipfs/'
    },

    // Marketplace Settings
    MARKETPLACE: {
        PLATFORM_FEE: 100, // 1% in basis points
        MAX_PLATFORM_FEE: 1000, // 10% in basis points
        DEFAULT_ROYALTY: 250, // 2.5% in basis points
        MAX_ROYALTY: 1000, // 10% in basis points
        ITEMS_PER_PAGE: 12,
        MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
        SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        SUPPORTED_VIDEO_TYPES: ['video/mp4', 'video/webm'],
        SUPPORTED_AUDIO_TYPES: ['audio/mp3', 'audio/wav', 'audio/ogg']
    },

    // UI Configuration
    UI: {
        ANIMATION_DURATION: 300,
        NOTIFICATION_TIMEOUT: 5000,
        SEARCH_DEBOUNCE: 500,
        WALLET_CONNECT_TIMEOUT: 30000,
        TRANSACTION_TIMEOUT: 120000
    },

    // Role Constants
    ROLES: {
        DEFAULT_ADMIN_ROLE: '0x0000000000000000000000000000000000000000000000000000000000000000',
        ADMIN_ROLE: '0xa49807205ce4d355092ef5a8a18f56e8913cf4a201fbe287825b095693c21775',
        TEAM_ROLE: '0x8b73c3c69bb8fe3d512ecc4cf759cc79239f7b179b0ffacaa9a75d522b39400f',
        MODERATOR_ROLE: '0x797669c9492c21432e0a5d4c3f2a5e8a2b3e2a4c2e2a4c4f2a5e8a2b3e2a4c2e',
        APPROVER_ROLE: '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
        CREATOR_ROLE: '0x828634d95e775031b9ff576b159a8509d3053581a8c9c4d7c2c5c1f6e3c8f9a1'
    },

    // Categories
    CATEGORIES: [
        { id: 'art', name: 'Art', icon: '🎨' },
        { id: 'collectibles', name: 'Collectibles', icon: '🏆' },
        { id: 'gaming', name: 'Gaming', icon: '🎮' },
        { id: 'music', name: 'Music', icon: '🎵' },
        { id: 'photography', name: 'Photography', icon: '📸' },
        { id: 'sports', name: 'Sports', icon: '⚽' },
        { id: 'virtual-worlds', name: 'Virtual Worlds', icon: '🌐' },
        { id: 'domain-names', name: 'Domain Names', icon: '🌍' }
    ],

    // Price Filters
    PRICE_FILTERS: [
        { id: 'all', name: 'All Prices', min: 0, max: Infinity },
        { id: 'under-0.1', name: 'Under 0.1 ETH', min: 0, max: 0.1 },
        { id: '0.1-1', name: '0.1 - 1 ETH', min: 0.1, max: 1 },
        { id: '1-10', name: '1 - 10 ETH', min: 1, max: 10 },
        { id: 'over-10', name: 'Over 10 ETH', min: 10, max: Infinity }
    ],

    // Sort Options
    SORT_OPTIONS: [
        { id: 'newest', name: 'Newest', field: 'createdAt', direction: 'desc' },
        { id: 'oldest', name: 'Oldest', field: 'createdAt', direction: 'asc' },
        { id: 'price-low-high', name: 'Price: Low to High', field: 'price', direction: 'asc' },
        { id: 'price-high-low', name: 'Price: High to Low', field: 'price', direction: 'desc' },
        { id: 'most-liked', name: 'Most Liked', field: 'likes', direction: 'desc' },
        { id: 'most-viewed', name: 'Most Viewed', field: 'views', direction: 'desc' }
    ],

    // Error Messages
    ERRORS: {
        WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
        WALLET_WRONG_NETWORK: 'Please switch to the correct network',
        INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
        TRANSACTION_REJECTED: 'Transaction was rejected by user',
        TRANSACTION_FAILED: 'Transaction failed. Please try again',
        FILE_TOO_LARGE: 'File size exceeds maximum limit',
        FILE_TYPE_NOT_SUPPORTED: 'File type not supported',
        INVALID_PRICE: 'Please enter a valid price',
        INVALID_ROYALTY: 'Royalty must be between 0% and 10%',
        NETWORK_ERROR: 'Network error. Please check your connection',
        IPFS_UPLOAD_FAILED: 'Failed to upload file to IPFS',
        CONTRACT_INTERACTION_FAILED: 'Failed to interact with smart contract',
        METADATA_FETCH_FAILED: 'Failed to fetch NFT metadata',
        UNAUTHORIZED: 'You are not authorized to perform this action'
    },

    // Success Messages
    SUCCESS: {
        WALLET_CONNECTED: 'Wallet connected successfully',
        NFT_CREATED: 'NFT created successfully',
        NFT_LISTED: 'NFT listed for sale',
        NFT_PURCHASED: 'NFT purchased successfully',
        BID_PLACED: 'Bid placed successfully',
        AUCTION_CREATED: 'Auction created successfully',
        PROFILE_UPDATED: 'Profile updated successfully',
        COLLECTION_CREATED: 'Collection created successfully',
        TOKEN_APPROVED: 'Token approved for trading',
        SETTINGS_SAVED: 'Settings saved successfully'
    },

    // API Endpoints
    API: {
        BASE_URL: 'http://localhost:3000/api',
        ENDPOINTS: {
            NFTS: '/nfts',
            COLLECTIONS: '/collections',
            USERS: '/users',
            TRANSACTIONS: '/transactions',
            ANALYTICS: '/analytics',
            SEARCH: '/search',
            METADATA: '/metadata'
        }
    },

    // Development Flags
    DEV: {
        ENABLE_CONSOLE_LOGS: true,
        MOCK_DATA: true,
        SKIP_WALLET_CHECK: false,
        USE_TEST_ACCOUNTS: true
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Global access
window.CONFIG = CONFIG;

// Helper functions
const UTILS = {
    // Format address for display
    formatAddress: (address) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    },

    // Format price for display
    formatPrice: (price, decimals = 4) => {
        if (!price) return '0';
        const num = parseFloat(price);
        if (num === 0) return '0';
        if (num < 0.0001) return '< 0.0001';
        return num.toFixed(decimals).replace(/\.?0+$/, '');
    },

    // Format large numbers
    formatNumber: (num) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    },

    // Convert Wei to Ether
    weiToEth: (wei) => {
        return parseFloat(wei) / Math.pow(10, 18);
    },

    // Convert Ether to Wei
    ethToWei: (eth) => {
        return (parseFloat(eth) * Math.pow(10, 18)).toString();
    },

    // Generate random ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validate Ethereum address
    isValidAddress: (address) => {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    },

    // Validate file type
    isValidFileType: (file, allowedTypes) => {
        return allowedTypes.includes(file.type);
    },

    // Validate file size
    isValidFileSize: (file, maxSize) => {
        return file.size <= maxSize;
    },

    // Get file extension
    getFileExtension: (filename) => {
        return filename.split('.').pop().toLowerCase();
    },

    // Generate metadata for NFT
    generateNFTMetadata: (name, description, image, attributes = []) => {
        return {
            name,
            description,
            image,
            attributes,
            external_url: window.location.origin,
            animation_url: null,
            background_color: null
        };
    },

    // Validate NFT metadata
    validateNFTMetadata: (metadata) => {
        const required = ['name', 'description', 'image'];
        return required.every(field => metadata[field] && metadata[field].trim() !== '');
    },

    // Get category by ID
    getCategoryById: (id) => {
        return CONFIG.CATEGORIES.find(cat => cat.id === id);
    },

    // Get sort option by ID
    getSortOptionById: (id) => {
        return CONFIG.SORT_OPTIONS.find(sort => sort.id === id);
    },

    // Get price filter by ID
    getPriceFilterById: (id) => {
        return CONFIG.PRICE_FILTERS.find(filter => filter.id === id);
    }
};

// Export utils
window.UTILS = UTILS;

console.log('🚀 AlsaniaFX Config loaded');