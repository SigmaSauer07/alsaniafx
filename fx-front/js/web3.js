// AlsaniaFX Web3 Integration
// Handles all blockchain interactions, wallet connections, and smart contract calls

class Web3Manager {
    constructor() {
        this.web3 = null;
        this.account = null;
        this.networkId = null;
        this.contracts = {};
        this.isConnected = false;
        this.provider = null;
        
        this.init();
    }

    async init() {
        try {
            // Check if MetaMask is installed
            if (typeof window.ethereum !== 'undefined') {
                this.provider = window.ethereum;
                
                // Listen for account changes
                this.provider.on('accountsChanged', (accounts) => {
                    this.handleAccountsChanged(accounts);
                });

                // Listen for network changes
                this.provider.on('chainChanged', (chainId) => {
                    this.handleChainChanged(chainId);
                });

                // Listen for connection changes
                this.provider.on('connect', (connectInfo) => {
                    console.log('Connected to network:', connectInfo.chainId);
                });

                this.provider.on('disconnect', (error) => {
                    console.log('Disconnected from network:', error);
                    this.handleDisconnect();
                });

                // Check if already connected
                const accounts = await this.provider.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    await this.connectWallet();
                }
            } else {
                console.warn('MetaMask not detected');
            }
        } catch (error) {
            console.error('Web3 initialization error:', error);
        }
    }

    // Connect wallet
    async connectWallet() {
        try {
            if (!this.provider) {
                throw new Error('No wallet provider found. Please install MetaMask.');
            }

            // Request account access
            const accounts = await this.provider.request({
                method: 'eth_requestAccounts'
            });

            if (accounts.length === 0) {
                throw new Error('No accounts found');
            }

            this.account = accounts[0];
            this.isConnected = true;

            // Get network ID
            const chainId = await this.provider.request({ method: 'eth_chainId' });
            this.networkId = parseInt(chainId, 16);

            // Initialize Web3
            this.web3 = new ethers.providers.Web3Provider(this.provider);

            // Load contracts
            await this.loadContracts();

            // Update UI
            this.updateWalletUI();

            // Show success notification
            if (window.ui) {
                window.ui.showNotification('Wallet connected successfully!', 'success');
            }

            return {
                account: this.account,
                networkId: this.networkId
            };

        } catch (error) {
            console.error('Wallet connection error:', error);
            if (window.ui) {
                window.ui.showNotification(error.message, 'error');
            }
            throw error;
        }
    }

    // Disconnect wallet
    async disconnectWallet() {
        try {
            this.account = null;
            this.isConnected = false;
            this.web3 = null;
            this.contracts = {};
            
            this.updateWalletUI();
            
            if (window.ui) {
                window.ui.showNotification('Wallet disconnected', 'info');
            }
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }

    // Handle account changes
    handleAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.handleDisconnect();
        } else if (accounts[0] !== this.account) {
            this.account = accounts[0];
            this.updateWalletUI();
            window.location.reload(); // Reload to update user data
        }
    }

    // Handle network changes
    handleChainChanged(chainId) {
        this.networkId = parseInt(chainId, 16);
        if (this.networkId !== CONFIG.NETWORK.CHAIN_ID) {
            if (window.ui) {
                window.ui.showNotification('Please switch to the correct network', 'warning');
            }
        }
        window.location.reload(); // Reload to update network data
    }

    // Handle disconnect
    handleDisconnect() {
        this.account = null;
        this.isConnected = false;
        this.web3 = null;
        this.contracts = {};
        this.updateWalletUI();
    }

    // Update wallet UI
    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');

        if (this.isConnected && this.account) {
            connectBtn.style.display = 'none';
            walletInfo.style.display = 'flex';
            walletAddress.textContent = UTILS.formatAddress(this.account);
            
            // Show admin elements if user has admin role
            this.checkAdminRole();
        } else {
            connectBtn.style.display = 'block';
            walletInfo.style.display = 'none';
            
            // Hide admin elements
            document.querySelectorAll('.admin-only').forEach(el => {
                el.style.display = 'none';
            });
        }
    }

    // Check if user has admin role
    async checkAdminRole() {
        try {
            if (!this.contracts.marketplace || !this.account) return;

            const hasAdminRole = await this.contracts.marketplace.hasRole(
                CONFIG.ROLES.ADMIN_ROLE,
                this.account
            );

            const hasTeamRole = await this.contracts.marketplace.hasRole(
                CONFIG.ROLES.TEAM_ROLE,
                this.account
            );

            if (hasAdminRole || hasTeamRole) {
                document.querySelectorAll('.admin-only').forEach(el => {
                    el.style.display = 'block';
                });
            }
        } catch (error) {
            console.error('Error checking admin role:', error);
        }
    }

    // Load smart contracts
    async loadContracts() {
        try {
            if (!this.web3) return;

            const signer = this.web3.getSigner();

            // Load contract ABIs (simplified for demo)
            const marketplaceABI = [
                "function listItem(address nftContract, uint256 tokenId, uint256 price, bool isAuction, uint256 auctionDuration, uint256 minBid, string metadata) external",
                "function buyItem(uint256 listingId) external payable",
                "function createAuction(address nftContract, uint256 tokenId, uint256 startPrice, uint256 duration, string metadata) external",
                "function placeBid(uint256 auctionId) external payable",
                "function endAuction(uint256 auctionId) external",
                "function approveERC20Token(address tokenAddress, bool approved) external",
                "function setPlatformFee(uint256 newFeeBps) external",
                "function setFeeRecipient(address newRecipient) external",
                "function hasRole(bytes32 role, address account) external view returns (bool)",
                "function grantRole(bytes32 role, address account) external",
                "function revokeRole(bytes32 role, address account) external",
                "function getListing(uint256 listingId) external view returns (tuple)",
                "function getAuction(uint256 auctionId) external view returns (tuple)",
                "function listingCounter() external view returns (uint256)",
                "function auctionCounter() external view returns (uint256)"
            ];

            const nftFactoryABI = [
                "function mintNFT(address to, string tokenURI, uint256 royaltyBps, string collectionName) external payable returns (uint256)",
                "function batchMintNFT(address to, string[] tokenURIs, uint256 royaltyBps, string collectionName) external payable returns (uint256[])",
                "function updateMetadata(uint256 tokenId, string newTokenURI) external",
                "function getCollectionNFTs(uint256 collectionId) external view returns (uint256[])",
                "function nftCounter() external view returns (uint256)"
            ];

            const erc20FactoryABI = [
                "function createToken(string name, string symbol, uint256 totalSupply) external returns (address)",
                "function approveToken(address tokenAddress, bool approved) external",
                "function listToken(address tokenAddress, bool listed) external",
                "function getTokenInfo(address tokenAddress) external view returns (tuple)",
                "function getApprovedTokens() external view returns (address[])",
                "function setPlatformFee(uint256 newFeeBps) external"
            ];

            const erc1155FactoryABI = [
                "function createCollection(string name, string symbol, string contractURI, string baseURI, uint256 royaltyBps) external returns (uint256)",
                "function mintToken(uint256 collectionId, string metadata, uint256 amount) external returns (uint256)",
                "function batchMintTokens(uint256 collectionId, string[] metadatas, uint256[] amounts) external returns (uint256[])",
                "function updateMetadata(uint256 tokenId, string newMetadata) external",
                "function getCollection(uint256 collectionId) external view returns (tuple)",
                "function getToken(uint256 tokenId) external view returns (tuple)"
            ];

            const lazyMintingABI = [
                "function createLazyNFT(string metadata, uint256 price, uint256 royaltyBps) external returns (uint256)",
                "function mintLazyNFT(uint256 lazyNFTId, address recipient, tuple signature) external payable",
                "function getLazyNFT(uint256 lazyNFTId) external view returns (tuple)",
                "function getUnmintedLazyNFTs() external view returns (uint256[])",
                "function getLazyNFTsByCreator(address creator) external view returns (uint256[])"
            ];

            // Initialize contracts
            if (CONFIG.CONTRACTS.MARKETPLACE !== '0x0000000000000000000000000000000000000000') {
                this.contracts.marketplace = new ethers.Contract(
                    CONFIG.CONTRACTS.MARKETPLACE,
                    marketplaceABI,
                    signer
                );
            }

            if (CONFIG.CONTRACTS.NFT_FACTORY !== '0x0000000000000000000000000000000000000000') {
                this.contracts.nftFactory = new ethers.Contract(
                    CONFIG.CONTRACTS.NFT_FACTORY,
                    nftFactoryABI,
                    signer
                );
            }

            if (CONFIG.CONTRACTS.ERC20_FACTORY !== '0x0000000000000000000000000000000000000000') {
                this.contracts.erc20Factory = new ethers.Contract(
                    CONFIG.CONTRACTS.ERC20_FACTORY,
                    erc20FactoryABI,
                    signer
                );
            }

            if (CONFIG.CONTRACTS.ERC1155_FACTORY !== '0x0000000000000000000000000000000000000000') {
                this.contracts.erc1155Factory = new ethers.Contract(
                    CONFIG.CONTRACTS.ERC1155_FACTORY,
                    erc1155FactoryABI,
                    signer
                );
            }

            if (CONFIG.CONTRACTS.LAZY_MINTING !== '0x0000000000000000000000000000000000000000') {
                this.contracts.lazyMinting = new ethers.Contract(
                    CONFIG.CONTRACTS.LAZY_MINTING,
                    lazyMintingABI,
                    signer
                );
            }

            console.log('✅ Contracts loaded successfully');
        } catch (error) {
            console.error('Error loading contracts:', error);
        }
    }

    // Get user balance
    async getBalance(address = null) {
        try {
            if (!this.web3) return '0';
            
            const targetAddress = address || this.account;
            if (!targetAddress) return '0';

            const balance = await this.web3.getBalance(targetAddress);
            return ethers.utils.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0';
        }
    }

    // Switch network
    async switchNetwork(chainId) {
        try {
            if (!this.provider) throw new Error('No wallet provider');

            await this.provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chainId.toString(16)}` }]
            });
        } catch (error) {
            console.error('Error switching network:', error);
            throw error;
        }
    }

    // Add network
    async addNetwork(networkConfig) {
        try {
            if (!this.provider) throw new Error('No wallet provider');

            await this.provider.request({
                method: 'wallet_addEthereumChain',
                params: [networkConfig]
            });
        } catch (error) {
            console.error('Error adding network:', error);
            throw error;
        }
    }

    // Sign message
    async signMessage(message) {
        try {
            if (!this.web3) throw new Error('Web3 not initialized');
            
            const signer = this.web3.getSigner();
            return await signer.signMessage(message);
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }

    // Verify signature
    verifySignature(message, signature, address) {
        try {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        } catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }

    // Wait for transaction
    async waitForTransaction(txHash, confirmations = 1) {
        try {
            if (!this.web3) throw new Error('Web3 not initialized');
            
            const receipt = await this.web3.waitForTransaction(txHash, confirmations);
            return receipt;
        } catch (error) {
            console.error('Error waiting for transaction:', error);
            throw error;
        }
    }

    // Get transaction receipt
    async getTransactionReceipt(txHash) {
        try {
            if (!this.web3) throw new Error('Web3 not initialized');
            
            return await this.web3.getTransactionReceipt(txHash);
        } catch (error) {
            console.error('Error getting transaction receipt:', error);
            return null;
        }
    }

    // Estimate gas
    async estimateGas(contract, method, params = [], value = 0) {
        try {
            if (!contract || !contract[method]) {
                throw new Error('Invalid contract or method');
            }

            const gasEstimate = await contract.estimateGas[method](...params, { value });
            return gasEstimate.mul(120).div(100); // Add 20% buffer
        } catch (error) {
            console.error('Error estimating gas:', error);
            return ethers.BigNumber.from('500000'); // Default gas limit
        }
    }

    // Get gas price
    async getGasPrice() {
        try {
            if (!this.web3) return ethers.BigNumber.from('20000000000'); // 20 gwei default
            
            return await this.web3.getGasPrice();
        } catch (error) {
            console.error('Error getting gas price:', error);
            return ethers.BigNumber.from('20000000000'); // 20 gwei default
        }
    }

    // Format transaction error
    formatTransactionError(error) {
        if (error.code === 4001) {
            return 'Transaction was rejected by user';
        }
        if (error.code === -32603) {
            return 'Transaction failed. Please try again';
        }
        if (error.message.includes('insufficient funds')) {
            return 'Insufficient funds for transaction';
        }
        if (error.message.includes('gas required exceeds allowance')) {
            return 'Transaction would fail. Please check your inputs';
        }
        
        return error.message || 'Transaction failed';
    }

    // Check if connected
    isWalletConnected() {
        return this.isConnected && this.account;
    }

    // Get current account
    getCurrentAccount() {
        return this.account;
    }

    // Get current network
    getCurrentNetwork() {
        return this.networkId;
    }

    // Get contract instance
    getContract(name) {
        return this.contracts[name];
    }
}

// Initialize Web3Manager
window.web3Manager = new Web3Manager();

console.log('🌐 Web3Manager initialized');