// AlsaniaFX NFT Marketplace Web3 Integration

class Web3Manager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.isConnected = false;
        this.currentAccount = null;
        this.currentNetwork = null;
        
        this.init();
    }

    // ====== INITIALIZATION ======

    /**
     * Initialize Web3 manager
     */
    async init() {
        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            this.provider = new ethers.BrowserProvider(window.ethereum);
            
            // Listen for account changes
            window.ethereum.on('accountsChanged', (accounts) => {
                this.handleAccountsChanged(accounts);
            });

            // Listen for chain changes
            window.ethereum.on('chainChanged', (chainId) => {
                this.handleChainChanged(chainId);
            });

            // Check if already connected
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await this.connectWallet();
            }
        } else {
            console.warn('MetaMask not installed');
        }
    }

    // ====== WALLET CONNECTION ======

    /**
     * Connect wallet
     */
    async connectWallet() {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }

            Utils.showLoading('Connecting wallet...');

            // Request account access
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            // Get signer
            this.signer = await this.provider.getSigner();
            this.currentAccount = accounts[0];
            this.isConnected = true;

            // Check and switch network if needed
            await this.ensureCorrectNetwork();

            // Initialize contracts
            await this.initContracts();

            // Update UI
            this.updateConnectionStatus();

            Utils.hideLoading();
            Utils.showNotification(CONFIG.SUCCESS.WALLET_CONNECTED, 'success');

            return this.currentAccount;

        } catch (error) {
            Utils.hideLoading();
            const errorMessage = Utils.handleContractError(error);
            Utils.showNotification(errorMessage, 'error');
            throw error;
        }
    }

    /**
     * Disconnect wallet
     */
    disconnectWallet() {
        this.provider = null;
        this.signer = null;
        this.contracts = {};
        this.isConnected = false;
        this.currentAccount = null;
        this.currentNetwork = null;

        // Clear storage
        Utils.removeStorage(CONFIG.STORAGE.WALLET_ADDRESS);
        Utils.removeStorage(CONFIG.STORAGE.CONNECTED_NETWORK);

        // Update UI
        this.updateConnectionStatus();
    }

    /**
     * Handle account changes
     */
    async handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            // User disconnected wallet
            this.disconnectWallet();
        } else if (accounts[0] !== this.currentAccount) {
            // Account changed
            this.currentAccount = accounts[0];
            this.signer = await this.provider.getSigner();
            this.updateConnectionStatus();
            
            // Refresh data
            if (window.App) {
                window.App.refreshUserData();
            }
        }
    }

    /**
     * Handle chain changes
     */
    async handleChainChanged(chainId) {
        // Reload page to ensure correct network
        window.location.reload();
    }

    // ====== NETWORK MANAGEMENT ======

    /**
     * Ensure user is on correct network
     */
    async ensureCorrectNetwork() {
        const isCorrectNetwork = await Utils.checkNetwork();
        
        if (!isCorrectNetwork) {
            try {
                await Utils.switchNetwork();
            } catch (error) {
                throw new Error('Please switch to the correct network');
            }
        }
    }

    /**
     * Get current network info
     */
    async getCurrentNetwork() {
        if (!this.provider) return null;

        try {
            const network = await this.provider.getNetwork();
            return {
                chainId: network.chainId.toString(),
                name: network.name
            };
        } catch (error) {
            console.error('Failed to get network info:', error);
            return null;
        }
    }

    // ====== CONTRACT INITIALIZATION ======

    /**
     * Initialize smart contracts
     */
    async initContracts() {
        if (!this.signer) return;

        try {
            // Initialize marketplace contract
            this.contracts.marketplace = new ethers.Contract(
                CONFIG.CONTRACTS.MARKETPLACE,
                CONFIG.ABIS.MARKETPLACE || this.getMarketplaceABI(),
                this.signer
            );

            // Initialize NFT factory contract
            this.contracts.nftFactory = new ethers.Contract(
                CONFIG.CONTRACTS.NFT_FACTORY,
                CONFIG.ABIS.NFT_FACTORY || this.getNFTFactoryABI(),
                this.signer
            );

            // Store connection info
            Utils.setStorage(CONFIG.STORAGE.WALLET_ADDRESS, this.currentAccount);
            Utils.setStorage(CONFIG.STORAGE.CONNECTED_NETWORK, await this.getCurrentNetwork());

        } catch (error) {
            console.error('Failed to initialize contracts:', error);
            throw error;
        }
    }

    /**
     * Get marketplace ABI (placeholder - load from artifacts in production)
     */
    getMarketplaceABI() {
        return [
            "function listingId() view returns (uint256)",
            "function listings(uint256) view returns (address seller, address nftAddress, uint256 tokenId, uint256 price, bool isSold, bool isAuction, uint256 auctionEndTime, uint256 minBid, string metadata)",
            "function listItem(address nftAddress, uint256 tokenId, uint256 price, bool isAuction, uint256 auctionDuration, uint256 minBid, string metadata)",
            "function buyItem(uint256 listingId) payable",
            "function placeBid(uint256 listingId) payable",
            "function endAuction(uint256 listingId)",
            "function cancelListing(uint256 listingId)",
            "function getActiveListings() view returns (uint256[])",
            "function getUserListings(address user) view returns (uint256[])",
            "function getUserBids(address user) view returns (uint256[])",
            "function getAuction(uint256 listingId) view returns (address highestBidder, uint256 highestBid, bool ended)",
            "event Listed(uint256 indexed id, address indexed seller, address indexed nft, uint256 tokenId, uint256 price, bool isAuction)",
            "event Sold(uint256 indexed id, address indexed buyer, uint256 price)",
            "event BidPlaced(uint256 indexed id, address indexed bidder, uint256 amount)",
            "event AuctionEnded(uint256 indexed id, address indexed winner, uint256 amount)"
        ];
    }

    /**
     * Get NFT factory ABI (placeholder - load from artifacts in production)
     */
    getNFTFactoryABI() {
        return [
            "function createCollection(string name, string symbol, string contractURI, string baseURI, bool isERC721, address royaltyRecipient, uint16 royaltyBps, uint256 maxSupply, uint256 mintPrice) returns (uint256)",
            "function mintNFT(uint256 collectionId, string metadata, uint256 amount, address recipient, string attributes)",
            "function batchMintNFT(uint256 collectionId, string[] metadata, uint256[] amounts, address[] recipients, string[] attributes)",
            "function getCollection(uint256 collectionId) view returns (tuple(uint256 id, string name, string symbol, string contractURI, string baseURI, bool isERC721, address creator, address royaltyRecipient, uint16 royaltyBps, uint256 maxSupply, uint256 totalMinted, bool isPublic, uint256 mintPrice, bool isPaused))",
            "function getNFT(uint256 tokenId) view returns (tuple(uint256 collectionId, uint256 tokenId, string metadataURI, uint256 supply, address creator, uint256 createdAt, string attributes))",
            "function getCollectionsByCreator(address creator) view returns (uint256[])",
            "function getPublicCollections() view returns (uint256[])",
            "function tokenURI(uint256 tokenId) view returns (string)",
            "function royaltyInfo(uint256 tokenId, uint256 salePrice) view returns (address, uint256)",
            "event CollectionCreated(uint256 indexed id, string name, address indexed creator)",
            "event NFTMinted(uint256 indexed collectionId, uint256 indexed tokenId, address indexed recipient)"
        ];
    }

    // ====== CONTRACT INTERACTIONS ======

    /**
     * Get contract instance
     */
    getContract(contractName) {
        return this.contracts[contractName];
    }

    /**
     * Execute contract transaction
     */
    async executeTransaction(contractName, methodName, args = [], options = {}) {
        if (!this.isConnected) {
            throw new Error(CONFIG.ERRORS.WALLET_NOT_CONNECTED);
        }

        const contract = this.getContract(contractName);
        if (!contract) {
            throw new Error(`Contract ${contractName} not initialized`);
        }

        try {
            const method = contract[methodName];
            if (!method) {
                throw new Error(`Method ${methodName} not found`);
            }

            const tx = await method(...args, options);
            const receipt = await tx.wait();

            return {
                hash: tx.hash,
                receipt: receipt
            };

        } catch (error) {
            const errorMessage = Utils.handleContractError(error);
            throw new Error(errorMessage);
        }
    }

    /**
     * Read contract data
     */
    async readContract(contractName, methodName, args = []) {
        if (!this.isConnected) {
            throw new Error(CONFIG.ERRORS.WALLET_NOT_CONNECTED);
        }

        const contract = this.getContract(contractName);
        if (!contract) {
            throw new Error(`Contract ${contractName} not initialized`);
        }

        try {
            const method = contract[methodName];
            if (!method) {
                throw new Error(`Method ${methodName} not found`);
            }

            return await method(...args);

        } catch (error) {
            console.error('Contract read error:', error);
            throw error;
        }
    }

    // ====== BALANCE & GAS ======

    /**
     * Get account balance
     */
    async getBalance(address = null) {
        if (!this.provider) return '0';

        const targetAddress = address || this.currentAccount;
        if (!targetAddress) return '0';

        try {
            const balance = await this.provider.getBalance(targetAddress);
            return balance.toString();
        } catch (error) {
            console.error('Failed to get balance:', error);
            return '0';
        }
    }

    /**
     * Get formatted balance
     */
    async getFormattedBalance(address = null) {
        const balance = await this.getBalance(address);
        return Utils.formatETH(balance);
    }

    /**
     * Estimate gas for transaction
     */
    async estimateGas(contractName, methodName, args = [], options = {}) {
        const contract = this.getContract(contractName);
        if (!contract) return null;

        try {
            const method = contract[methodName];
            const gasEstimate = await method.estimateGas(...args, options);
            return gasEstimate.toString();
        } catch (error) {
            console.error('Gas estimation failed:', error);
            return null;
        }
    }

    // ====== TRANSACTION HELPERS ======

    /**
     * Wait for transaction confirmation
     */
    async waitForTransaction(txHash, confirmations = 1) {
        if (!this.provider) return null;

        try {
            const receipt = await this.provider.waitForTransaction(txHash, confirmations);
            return receipt;
        } catch (error) {
            console.error('Transaction confirmation failed:', error);
            throw error;
        }
    }

    /**
     * Get transaction status
     */
    async getTransactionStatus(txHash) {
        if (!this.provider) return null;

        try {
            const tx = await this.provider.getTransaction(txHash);
            const receipt = await this.provider.getTransactionReceipt(txHash);
            
            return {
                hash: txHash,
                from: tx.from,
                to: tx.to,
                value: tx.value.toString(),
                gasLimit: tx.gasLimit.toString(),
                gasPrice: tx.gasPrice.toString(),
                nonce: tx.nonce,
                data: tx.data,
                blockNumber: receipt?.blockNumber,
                status: receipt?.status === 1 ? 'success' : 'failed',
                gasUsed: receipt?.gasUsed.toString(),
                effectiveGasPrice: receipt?.effectiveGasPrice.toString()
            };
        } catch (error) {
            console.error('Failed to get transaction status:', error);
            return null;
        }
    }

    // ====== UI UPDATES ======

    /**
     * Update connection status in UI
     */
    updateConnectionStatus() {
        const statusIndicator = document.getElementById('connectionStatus');
        const walletAddress = document.getElementById('walletAddress');
        const connectBtn = document.getElementById('connectWallet');

        if (this.isConnected && this.currentAccount) {
            // Connected
            statusIndicator.classList.add('connected');
            walletAddress.textContent = Utils.formatAddress(this.currentAccount);
            connectBtn.textContent = 'Disconnect';
            connectBtn.classList.remove('btn-primary');
            connectBtn.classList.add('btn-secondary');
        } else {
            // Disconnected
            statusIndicator.classList.remove('connected');
            walletAddress.textContent = 'Connect Wallet';
            connectBtn.textContent = 'Connect Wallet';
            connectBtn.classList.remove('btn-secondary');
            connectBtn.classList.add('btn-primary');
        }
    }

    // ====== EVENT LISTENERS ======

    /**
     * Listen to contract events
     */
    listenToEvents(contractName, eventName, callback) {
        const contract = this.getContract(contractName);
        if (!contract) return null;

        try {
            const filter = contract.filters[eventName]();
            contract.on(filter, callback);
            return filter;
        } catch (error) {
            console.error('Failed to listen to event:', error);
            return null;
        }
    }

    /**
     * Stop listening to events
     */
    stopListening(contractName) {
        const contract = this.getContract(contractName);
        if (contract) {
            contract.removeAllListeners();
        }
    }

    // ====== UTILITY METHODS ======

    /**
     * Check if wallet is connected
     */
    isWalletConnected() {
        return this.isConnected && this.currentAccount;
    }

    /**
     * Get current account
     */
    getCurrentAccount() {
        return this.currentAccount;
    }

    /**
     * Get signer
     */
    getSigner() {
        return this.signer;
    }

    /**
     * Get provider
     */
    getProvider() {
        return this.provider;
    }
}

// Create global Web3 manager instance
// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Web3Manager;
} else {
    window.Web3Manager = Web3Manager;
} 