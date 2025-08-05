// ERC-1155 Manager for AlsaniaFX NFT Marketplace
class ERC1155Manager {
    constructor(web3) {
        this.web3 = web3;
        this.contract = null;
        this.currentAccount = null;
        this.init();
    }

    async init() {
        console.log('🏭 Initializing ERC-1155 Manager...');
        try {
            await this.initializeContract();
            this.setupEventListeners();
            console.log('✅ ERC-1155 Manager initialized');
        } catch (error) {
            console.error('❌ Failed to initialize ERC-1155 Manager:', error);
        }
    }

    async initializeContract() {
        try {
            const contractAddress = window.CONFIG?.CONTRACTS?.ERC1155_FACTORY;
            if (!contractAddress) {
                throw new Error('ERC1155 Factory address not found in config');
            }

            const abi = await this.loadERC1155FactoryABI();
            this.contract = new this.web3.eth.Contract(abi, contractAddress);
            console.log('✅ ERC-1155 contract initialized');
        } catch (error) {
            console.error('Failed to initialize ERC-1155 contract:', error);
            throw error;
        }
    }

    async loadERC1155FactoryABI() {
        return [
            {
                "inputs": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "string", "name": "symbol", "type": "string"},
                    {"internalType": "string", "name": "uri", "type": "string"},
                    {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
                    {"internalType": "bool", "name": "transferable", "type": "bool"}
                ],
                "name": "createToken",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256", "name": "amount", "type": "uint256"}
                ],
                "name": "mint",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256[]", "name": "tokenIds", "type": "uint256[]"},
                    {"internalType": "address", "name": "to", "type": "address"},
                    {"internalType": "uint256[]", "name": "amounts", "type": "uint256[]"}
                ],
                "name": "batchMint",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                "name": "getTokenInfo",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "uint256", "name": "tokenId", "type": "uint256"},
                            {"internalType": "string", "name": "name", "type": "string"},
                            {"internalType": "string", "name": "symbol", "type": "string"},
                            {"internalType": "string", "name": "uri", "type": "string"},
                            {"internalType": "uint256", "name": "totalSupply", "type": "uint256"},
                            {"internalType": "bool", "name": "exists", "type": "bool"},
                            {"internalType": "address", "name": "creator", "type": "address"},
                            {"internalType": "uint256", "name": "maxSupply", "type": "uint256"},
                            {"internalType": "bool", "name": "transferable", "type": "bool"}
                        ],
                        "internalType": "struct ERC1155Factory.TokenInfo",
                        "name": "",
                        "type": "tuple"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "creator", "type": "address"}],
                "name": "getCreatorTokens",
                "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                "name": "uri",
                "outputs": [{"internalType": "string", "name": "", "type": "string"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    setupEventListeners() {
        // ERC-1155 creation button
        const createERC1155Btn = document.getElementById('create-erc1155-btn');
        if (createERC1155Btn) {
            createERC1155Btn.addEventListener('click', () => {
                this.openCreationModal();
            });
        }

        // ERC-1155 creation form
        const createERC1155Form = document.getElementById('create-erc1155-form');
        if (createERC1155Form) {
            createERC1155Form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createERC1155Token();
            });
        }

        // ERC-1155 minting form
        const mintERC1155Form = document.getElementById('mint-erc1155-form');
        if (mintERC1155Form) {
            mintERC1155Form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.mintERC1155Token();
            });
        }

        // ERC-1155 batch minting form
        const batchMintERC1155Form = document.getElementById('batch-mint-erc1155-form');
        if (batchMintERC1155Form) {
            batchMintERC1155Form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.batchMintERC1155Tokens();
            });
        }

        // Modal close buttons
        const closeButtons = document.querySelectorAll('.modal-close, .btn-secondary');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        console.log('✅ ERC-1155 Manager event listeners setup');
    }

    openCreationModal() {
        const modal = document.getElementById('erc1155-creation-modal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('active');
        }
    }

    openMintingModal() {
        const modal = document.getElementById('erc1155-minting-modal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('active');
        }
    }

    openBatchMintingModal() {
        const modal = document.getElementById('erc1155-batch-minting-modal');
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('active');
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('active');
        });
    }

    async createERC1155Token() {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const name = document.getElementById('erc1155-name').value.trim();
            const symbol = document.getElementById('erc1155-symbol').value.trim();
            const uri = document.getElementById('erc1155-uri').value.trim();
            const maxSupply = parseInt(document.getElementById('erc1155-max-supply').value) || 0;
            const transferable = document.getElementById('erc1155-transferable').checked;

            // Validation
            if (!name || !symbol) {
                throw new Error('Name and symbol are required');
            }

            if (name.length < 3 || name.length > 50) {
                throw new Error('Name must be between 3 and 50 characters');
            }

            if (symbol.length < 2 || symbol.length > 10) {
                throw new Error('Symbol must be between 2 and 10 characters');
            }

            if (maxSupply < 0) {
                throw new Error('Maximum supply cannot be negative');
            }

            console.log('🏭 Creating ERC-1155 token...', { 
                name, 
                symbol, 
                uri: uri || 'Default IPFS URI', 
                maxSupply, 
                transferable 
            });

            // Show loading state
            const submitBtn = document.getElementById('create-erc1155-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            submitBtn.disabled = true;

            const result = await this.contract.methods.createToken(
                name,
                symbol,
                uri || '', // Empty string for default URI
                maxSupply,
                transferable
            ).send({ from });

            console.log('✅ ERC-1155 token created:', result);
            this.showNotification('ERC-1155 token created successfully!', 'success');
            this.resetCreateForm();
            this.closeAllModals();

            // Refresh token list
            await this.loadERC1155Tokens();

        } catch (error) {
            console.error('❌ Failed to create ERC-1155 token:', error);
            this.showNotification('Failed to create ERC-1155 token: ' + error.message, 'error');
        } finally {
            // Reset button state
            const submitBtn = document.getElementById('create-erc1155-submit');
            submitBtn.innerHTML = '<i class="fas fa-cube"></i> Create Token';
            submitBtn.disabled = false;
        }
    }

    async mintERC1155Token() {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const tokenId = parseInt(document.getElementById('mint-token-id').value);
            const to = document.getElementById('mint-to-address').value.trim();
            const amount = parseInt(document.getElementById('mint-amount').value);

            // Validation
            if (!tokenId || tokenId < 1) {
                throw new Error('Valid token ID is required');
            }

            if (!to) {
                throw new Error('Recipient address is required');
            }

            if (!this.web3.utils.isAddress(to)) {
                throw new Error('Invalid recipient address');
            }

            if (!amount || amount < 1) {
                throw new Error('Valid amount is required');
            }

            console.log('🏭 Minting ERC-1155 token...', { tokenId, to, amount });

            // Show loading state
            const submitBtn = document.getElementById('mint-erc1155-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Minting...';
            submitBtn.disabled = true;

            const result = await this.contract.methods.mint(tokenId, to, amount).send({ from });

            console.log('✅ ERC-1155 token minted:', result);
            this.showNotification('ERC-1155 token minted successfully!', 'success');
            this.resetMintForm();
            this.closeAllModals();

            // Refresh token list
            await this.loadERC1155Tokens();

        } catch (error) {
            console.error('❌ Failed to mint ERC-1155 token:', error);
            this.showNotification('Failed to mint ERC-1155 token: ' + error.message, 'error');
        } finally {
            // Reset button state
            const submitBtn = document.getElementById('mint-erc1155-submit');
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Mint Token';
            submitBtn.disabled = false;
        }
    }

    async batchMintERC1155Tokens() {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const tokenIdsInput = document.getElementById('batch-token-ids').value.trim();
            const to = document.getElementById('batch-mint-to-address').value.trim();
            const amountsInput = document.getElementById('batch-amounts').value.trim();

            // Validation
            if (!tokenIdsInput || !to || !amountsInput) {
                throw new Error('Token IDs, recipient address, and amounts are required');
            }

            if (!this.web3.utils.isAddress(to)) {
                throw new Error('Invalid recipient address');
            }

            const tokenIds = tokenIdsInput.split(',').map(id => parseInt(id.trim()));
            const amounts = amountsInput.split(',').map(amount => parseInt(amount.trim()));

            if (tokenIds.length !== amounts.length) {
                throw new Error('Token IDs and amounts arrays must have the same length');
            }

            // Validate each token ID and amount
            for (let i = 0; i < tokenIds.length; i++) {
                if (!tokenIds[i] || tokenIds[i] < 1) {
                    throw new Error(`Invalid token ID at position ${i + 1}`);
                }
                if (!amounts[i] || amounts[i] < 1) {
                    throw new Error(`Invalid amount at position ${i + 1}`);
                }
            }

            console.log('🏭 Batch minting ERC-1155 tokens...', { tokenIds, to, amounts });

            // Show loading state
            const submitBtn = document.getElementById('batch-mint-erc1155-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Batch Minting...';
            submitBtn.disabled = true;

            const result = await this.contract.methods.batchMint(tokenIds, to, amounts).send({ from });

            console.log('✅ ERC-1155 tokens batch minted:', result);
            this.showNotification('ERC-1155 tokens batch minted successfully!', 'success');
            this.resetBatchMintForm();
            this.closeAllModals();

            // Refresh token list
            await this.loadERC1155Tokens();

        } catch (error) {
            console.error('❌ Failed to batch mint ERC-1155 tokens:', error);
            this.showNotification('Failed to batch mint ERC-1155 tokens: ' + error.message, 'error');
        } finally {
            // Reset button state
            const submitBtn = document.getElementById('batch-mint-erc1155-submit');
            submitBtn.innerHTML = '<i class="fas fa-layer-group"></i> Batch Mint';
            submitBtn.disabled = false;
        }
    }

    async getTokenInfo(tokenId) {
        try {
            const tokenInfo = await this.contract.methods.getTokenInfo(tokenId).call();
            return tokenInfo;
        } catch (error) {
            console.error('Failed to get token info:', error);
            throw error;
        }
    }

    async getCreatorTokens(creator) {
        try {
            const tokenIds = await this.contract.methods.getCreatorTokens(creator).call();
            return tokenIds;
        } catch (error) {
            console.error('Failed to get creator tokens:', error);
            throw error;
        }
    }

    async getTokenURI(tokenId) {
        try {
            const uri = await this.contract.methods.uri(tokenId).call();
            return uri;
        } catch (error) {
            console.error('Failed to get token URI:', error);
            throw error;
        }
    }

    resetCreateForm() {
        document.getElementById('erc1155-name').value = '';
        document.getElementById('erc1155-symbol').value = '';
        document.getElementById('erc1155-uri').value = '';
        document.getElementById('erc1155-max-supply').value = '';
        document.getElementById('erc1155-transferable').checked = false;
    }

    resetMintForm() {
        document.getElementById('mint-token-id').value = '';
        document.getElementById('mint-to-address').value = '';
        document.getElementById('mint-amount').value = '';
    }

    resetBatchMintForm() {
        document.getElementById('batch-token-ids').value = '';
        document.getElementById('batch-mint-to-address').value = '';
        document.getElementById('batch-amounts').value = '';
    }

    showNotification(message, type = 'info') {
        if (window.app?.ui) {
            window.app.ui.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    async loadERC1155Tokens() {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const currentUser = accounts[0];

            const creatorTokens = await this.getCreatorTokens(currentUser);
            const tokensContainer = document.getElementById('erc1155-token-grid');
            
            if (!tokensContainer) return;

            tokensContainer.innerHTML = '';

            if (creatorTokens.length === 0) {
                tokensContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-cube"></i>
                        <h3>No ERC-1155 Tokens Created</h3>
                        <p>Create your first ERC-1155 token to get started!</p>
                    </div>
                `;
                return;
            }

            for (const tokenId of creatorTokens) {
                try {
                    const tokenInfo = await this.getTokenInfo(tokenId);
                    const tokenCard = this.createTokenCard(tokenInfo);
                    tokensContainer.appendChild(tokenCard);
                } catch (error) {
                    console.error(`Failed to load token ${tokenId}:`, error);
                }
            }

        } catch (error) {
            console.error('Failed to load ERC-1155 tokens:', error);
            this.showNotification('Failed to load ERC-1155 tokens: ' + error.message, 'error');
        }
    }

    createTokenCard(tokenInfo) {
        const card = document.createElement('div');
        card.className = 'erc1155-token-card';
        card.innerHTML = `
            <div class="token-header">
                <h3>${tokenInfo.name} (${tokenInfo.symbol})</h3>
                <span class="token-id">ID: ${tokenInfo.tokenId}</span>
            </div>
            <div class="token-details">
                <p><strong>Total Supply:</strong> <span>${tokenInfo.totalSupply}</span></p>
                <p><strong>Max Supply:</strong> <span>${tokenInfo.maxSupply === 0 ? 'Unlimited' : tokenInfo.maxSupply}</span></p>
                <p><strong>Transferable:</strong> <span>${tokenInfo.transferable ? 'Yes' : 'No'}</span></p>
                <p><strong>Creator:</strong> <span>${tokenInfo.creator}</span></p>
                <p><strong>URI:</strong> <span>${tokenInfo.uri || 'Default'}</span></p>
            </div>
            <div class="token-actions">
                <button onclick="window.app.erc1155Manager.mintToken(${tokenInfo.tokenId})" class="btn btn-primary">
                    <i class="fas fa-plus"></i> Mint
                </button>
                <button onclick="window.app.erc1155Manager.viewToken(${tokenInfo.tokenId})" class="btn btn-secondary">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>
        `;
        return card;
    }

    async mintToken(tokenId) {
        try {
            // Pre-fill the minting form
            document.getElementById('mint-token-id').value = tokenId;
            document.getElementById('mint-to-address').value = '';
            document.getElementById('mint-amount').value = '';
            
            // Open minting modal
            this.openMintingModal();
            
        } catch (error) {
            console.error('Failed to open minting modal:', error);
            this.showNotification('Failed to open minting modal: ' + error.message, 'error');
        }
    }

    async viewToken(tokenId) {
        try {
            const tokenInfo = await this.getTokenInfo(tokenId);
            const tokenURI = await this.getTokenURI(tokenId);
            
            // Create a modal to show token details
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.style.display = 'block';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="modal-close">&times;</span>
                    <div class="modal-body">
                        <h2>Token Details</h2>
                        <div class="token-details-view">
                            <p><strong>Token ID:</strong> ${tokenInfo.tokenId}</p>
                            <p><strong>Name:</strong> ${tokenInfo.name}</p>
                            <p><strong>Symbol:</strong> ${tokenInfo.symbol}</p>
                            <p><strong>Total Supply:</strong> ${tokenInfo.totalSupply}</p>
                            <p><strong>Max Supply:</strong> ${tokenInfo.maxSupply === 0 ? 'Unlimited' : tokenInfo.maxSupply}</p>
                            <p><strong>Transferable:</strong> ${tokenInfo.transferable ? 'Yes' : 'No'}</p>
                            <p><strong>Creator:</strong> ${tokenInfo.creator}</p>
                            <p><strong>URI:</strong> ${tokenInfo.uri || 'Default'}</p>
                            <p><strong>Full URI:</strong> ${tokenURI}</p>
                        </div>
                        <div class="modal-actions">
                            <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            // Add close functionality
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => modal.remove());
            
            // Close when clicking outside
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.remove();
            });
            
        } catch (error) {
            console.error('Failed to view token:', error);
            this.showNotification('Failed to view token: ' + error.message, 'error');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ERC1155Manager;
} else {
    window.ERC1155Manager = ERC1155Manager;
} 