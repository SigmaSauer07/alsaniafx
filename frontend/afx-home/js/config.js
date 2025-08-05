// Configuration for AlsaniaFX NFT Marketplace
window.CONFIG = {
    // Network configuration
    NETWORK: {
        CHAIN_ID: 31337, // Hardhat local network
        RPC_URL: 'http://127.0.0.1:8545',
        EXPLORER_URL: 'http://localhost:8545'
    },

    // Contract addresses
    CONTRACTS: {
        MARKETPLACE: '0x0dcd1bf9a1b36ce34237eeafef220932846bcd82',
        ERC20_FACTORY: '0xb7f8bc63bbcad18155201308c8f3540b07f84f5e',
        ERC1155_FACTORY: '0x2279b7a0a67db372996a5fab50d91eaa73d2ebe6',
        LAZY_MINTING: '0x0165878a594ca255338adfa4d48449f69242eb8f'
    },

    // IPFS configuration
    IPFS: {
        GATEWAY: 'https://ipfs.io/ipfs/',
        API_URL: 'https://ipfs.infura.io:5001/api/v0',
        MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
        SUPPORTED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
    },

    // Marketplace settings
    MARKETPLACE: {
        DEFAULT_PLATFORM_FEE: 100, // 1% in basis points
        MAX_PLATFORM_FEE: 1000, // 10% in basis points
        MIN_LISTING_PRICE: '0.001', // in ETH
        MAX_LISTING_PRICE: '1000' // in ETH
    },

    // UI settings
    UI: {
        ITEMS_PER_PAGE: 12,
        AUTO_REFRESH_INTERVAL: 30000, // 30 seconds
        NOTIFICATION_DURATION: 5000, // 5 seconds
        NOTIFICATIONS: {
            DURATION: 5000
        }
    },

    // Cache settings
    CACHE: {
        DURATION: 300000, // 5 minutes
        CLEANUP_INTERVAL: 600000 // 10 minutes
    },

    // Error messages
    ERRORS: {
        FILE_TOO_LARGE: 'File size exceeds maximum allowed size',
        UNSUPPORTED_FILE: 'File type not supported',
        NETWORK_ERROR: 'Network connection error',
        CONTRACT_ERROR: 'Smart contract interaction failed',
        WALLET_NOT_CONNECTED: 'Please connect your wallet first',
        INSUFFICIENT_BALANCE: 'Insufficient balance for transaction',
        TRANSACTION_FAILED: 'Transaction failed',
        METAMASK_NOT_FOUND: 'MetaMask not found. Please install MetaMask.',
        WRONG_NETWORK: 'Please switch to the correct network'
    },

    // Success messages
    SUCCESS: {
        WALLET_CONNECTED: 'Wallet connected successfully!',
        NFT_MINTED: 'NFT minted successfully!',
        NFT_LISTED: 'NFT listed successfully!',
        NFT_SOLD: 'NFT sold successfully!',
        BID_PLACED: 'Bid placed successfully!',
        TRANSACTION_CONFIRMED: 'Transaction confirmed!',
        PROFILE_UPDATED: 'Profile updated successfully!',
        COLLECTION_CREATED: 'Collection created successfully!'
    },

    // Default values
    DEFAULTS: {
        NFT: {
            NAME: 'Untitled NFT',
            DESCRIPTION: 'No description provided',
            PRICE: '0.01',
            ROYALTY: 500 // 5% in basis points
        },
        COLLECTION: {
            NAME: 'Untitled Collection',
            DESCRIPTION: 'No description provided'
        }
    },

    // Feature flags
    FEATURES: {
        LAZY_MINTING: true,
        ERC20_TRADING: true,
        ERC1155_SUPPORT: true,
        IPFS_INTEGRATION: true,
        ADVANCED_SEARCH: true,
        ANALYTICS: true
    }
}; 