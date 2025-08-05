// ERC20 Token Management Module for AlsaniaFX NFT Marketplace
class ERC20Manager {
    constructor(web3Provider) {
        this.web3 = web3Provider;
        this.erc20Factory = null;
        this.marketplace = null;
        this.init();
    }

    async init() {
        try {
            // Initialize contracts (addresses will be loaded from config)
            const erc20FactoryAddress = window.app?.config?.contracts?.erc20Factory;
            const marketplaceAddress = window.app?.config?.contracts?.marketplace;
            
            if (erc20FactoryAddress) {
                const erc20FactoryABI = await this.loadERC20FactoryABI();
                this.erc20Factory = new this.web3.eth.Contract(erc20FactoryABI, erc20FactoryAddress);
            }
            
            if (marketplaceAddress) {
                const marketplaceABI = await this.loadMarketplaceABI();
                this.marketplace = new this.web3.eth.Contract(marketplaceABI, marketplaceAddress);
            }
        } catch (error) {
            console.error('Failed to initialize ERC20 Manager:', error);
        }
    }

    async loadERC20FactoryABI() {
        return [
            {
                "inputs": [],
                "name": "initialize",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "string", "name": "symbol", "type": "string"},
                    {"internalType": "uint256", "name": "initialSupply", "type": "uint256"},
                    {"internalType": "uint8", "name": "decimals", "type": "uint8"}
                ],
                "name": "createToken",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}],
                "name": "approveToken",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}],
                "name": "listToken",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "newFeeBps", "type": "uint256"}],
                "name": "setPlatformFee",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}],
                "name": "getTokenInfo",
                "outputs": [{
                    "components": [
                        {"internalType": "address", "name": "tokenAddress", "type": "address"},
                        {"internalType": "string", "name": "name", "type": "string"},
                        {"internalType": "string", "name": "symbol", "type": "string"},
                        {"internalType": "uint256", "name": "totalSupply", "type": "uint256"},
                        {"internalType": "address", "name": "creator", "type": "address"},
                        {"internalType": "bool", "name": "isApproved", "type": "bool"},
                        {"internalType": "bool", "name": "isListed", "type": "bool"},
                        {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                        {"internalType": "uint256", "name": "approvalDate", "type": "uint256"},
                        {"internalType": "address", "name": "approvedBy", "type": "address"}
                    ],
                    "internalType": "struct ERC20Factory.TokenInfo",
                    "name": "",
                    "type": "tuple"
                }],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    async loadMarketplaceABI() {
        return [
            {
                "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}, {"internalType": "bool", "name": "approved", "type": "bool"}],
                "name": "approveERC20Token",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "listingId", "type": "uint256"}, {"internalType": "address", "name": "erc20Token", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
                "name": "buyWithERC20",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "address", "name": "tokenAddress", "type": "address"}],
                "name": "isERC20TokenApproved",
                "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
                "stateMutability": "view",
                "type": "function"
            }
        ];
    }

    // Token Creation
    async createToken(name, symbol, initialSupply, decimals = 18) {
        try {
            if (!this.erc20Factory) {
                throw new Error('ERC20 Factory not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.erc20Factory.methods.createToken(
                name,
                symbol,
                initialSupply,
                decimals
            ).send({ from });

            return result;
        } catch (error) {
            console.error('Failed to create ERC20 token:', error);
            throw error;
        }
    }

    // Token Approval (Admin/Approver only)
    async approveToken(tokenAddress) {
        try {
            if (!this.erc20Factory) {
                throw new Error('ERC20 Factory not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.erc20Factory.methods.approveToken(tokenAddress).send({ from });
            return result;
        } catch (error) {
            console.error('Failed to approve ERC20 token:', error);
            throw error;
        }
    }

    // Token Listing (Admin/Team only)
    async listToken(tokenAddress) {
        try {
            if (!this.erc20Factory) {
                throw new Error('ERC20 Factory not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.erc20Factory.methods.listToken(tokenAddress).send({ from });
            return result;
        } catch (error) {
            console.error('Failed to list ERC20 token:', error);
            throw error;
        }
    }

    // Marketplace ERC20 Approval
    async approveERC20TokenForMarketplace(tokenAddress, approved) {
        try {
            if (!this.marketplace) {
                throw new Error('Marketplace not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.marketplace.methods.approveERC20Token(tokenAddress, approved).send({ from });
            return result;
        } catch (error) {
            console.error('Failed to approve ERC20 token for marketplace:', error);
            throw error;
        }
    }

    // Buy NFT with ERC20
    async buyNFTWithERC20(listingId, erc20Token, amount) {
        try {
            if (!this.marketplace) {
                throw new Error('Marketplace not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.marketplace.methods.buyWithERC20(listingId, erc20Token, amount).send({ from });
            return result;
        } catch (error) {
            console.error('Failed to buy NFT with ERC20:', error);
            throw error;
        }
    }

    // Platform Fee Management (Admin only)
    async setPlatformFee(newFeeBps) {
        try {
            if (!this.erc20Factory) {
                throw new Error('ERC20 Factory not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.erc20Factory.methods.setPlatformFee(newFeeBps).send({ from });
            return result;
        } catch (error) {
            console.error('Failed to set platform fee:', error);
            throw error;
        }
    }

    // View Functions
    async getTokenInfo(tokenAddress) {
        try {
            if (!this.erc20Factory) {
                throw new Error('ERC20 Factory not initialized');
            }

            const result = await this.erc20Factory.methods.getTokenInfo(tokenAddress).call();
            return result;
        } catch (error) {
            console.error('Failed to get token info:', error);
            throw error;
        }
    }

    async isTokenApproved(tokenAddress) {
        try {
            if (!this.marketplace) {
                throw new Error('Marketplace not initialized');
            }

            const result = await this.marketplace.methods.isERC20TokenApproved(tokenAddress).call();
            return result;
        } catch (error) {
            console.error('Failed to check token approval:', error);
            throw error;
        }
    }

    // UI Methods
    async showERC20CreationModal() {
        const modal = document.getElementById('erc20-creation-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    async hideERC20CreationModal() {
        const modal = document.getElementById('erc20-creation-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async createERC20TokenFromUI() {
        try {
            const name = document.getElementById('erc20-name').value;
            const symbol = document.getElementById('erc20-symbol').value;
            const initialSupply = document.getElementById('erc20-supply').value;
            const decimals = document.getElementById('erc20-decimals').value || 18;

            if (!name || !symbol || !initialSupply) {
                throw new Error('Please fill in all required fields');
            }

            const result = await this.createToken(name, symbol, initialSupply, parseInt(decimals));
            
            this.showNotification('ERC20 token created successfully!', 'success');
            this.hideERC20CreationModal();
            
            // Refresh UI
            if (window.app) {
                window.app.loadERC20Tokens();
            }

        } catch (error) {
            console.error('Failed to create ERC20 token:', error);
            this.showNotification('Failed to create ERC20 token: ' + error.message, 'error');
        }
    }

    async approveTokenFromUI(tokenAddress) {
        try {
            await this.approveToken(tokenAddress);
            this.showNotification('Token approved successfully!', 'success');
            
            // Refresh UI
            if (window.app) {
                window.app.loadERC20Tokens();
            }
        } catch (error) {
            console.error('Failed to approve token:', error);
            this.showNotification('Failed to approve token: ' + error.message, 'error');
        }
    }

    async listTokenFromUI(tokenAddress) {
        try {
            await this.listToken(tokenAddress);
            this.showNotification('Token listed successfully!', 'success');
            
            // Refresh UI
            if (window.app) {
                window.app.loadERC20Tokens();
            }
        } catch (error) {
            console.error('Failed to list token:', error);
            this.showNotification('Failed to list token: ' + error.message, 'error');
        }
    }

    async buyNFTWithERC20FromUI(listingId, erc20Token, amount) {
        try {
            await this.buyNFTWithERC20(listingId, erc20Token, amount);
            this.showNotification('NFT purchased with ERC20 successfully!', 'success');
            
            // Refresh UI
            if (window.app) {
                window.app.loadNFTs();
            }
        } catch (error) {
            console.error('Failed to buy NFT with ERC20:', error);
            this.showNotification('Failed to buy NFT: ' + error.message, 'error');
        }
    }

    showNotification(message, type = 'info') {
        if (window.app?.ui) {
            window.app.ui.showNotification(message, type);
        }
    }

    // Load ERC20 tokens for display
    async loadERC20Tokens() {
        try {
            // In a real implementation, you would get tokens from the contract
            // For now, we'll simulate with sample data
            const tokens = [
                {
                    address: '0x1234567890123456789012345678901234567890',
                    name: 'Sample Token',
                    symbol: 'SMPL',
                    totalSupply: '1000000',
                    isApproved: true,
                    isListed: true
                }
            ];

            this.updateERC20TokenGrid(tokens);
        } catch (error) {
            console.error('Failed to load ERC20 tokens:', error);
        }
    }

    updateERC20TokenGrid(tokens) {
        const grid = document.getElementById('erc20-token-grid');
        if (!grid) return;

        grid.innerHTML = tokens.map(token => this.createERC20TokenCard(token)).join('');
    }

    createERC20TokenCard(token) {
        const statusClass = token.isListed ? 'listed' : token.isApproved ? 'approved' : 'pending';
        const statusText = token.isListed ? 'Listed' : token.isApproved ? 'Approved' : 'Pending';
        
        return `
            <div class="erc20-token-card">
                <div class="token-info">
                    <h3 class="token-name">${token.name}</h3>
                    <p class="token-symbol">${token.symbol}</p>
                    <p class="token-supply">Supply: ${token.totalSupply}</p>
                    <div class="token-status ${statusClass}">
                        <span class="status-badge">${statusText}</span>
                    </div>
                </div>
                <div class="token-actions">
                    ${!token.isApproved ? `
                        <button class="btn btn-primary" onclick="window.app.erc20Manager.approveTokenFromUI('${token.address}')">
                            Approve
                        </button>
                    ` : ''}
                    ${token.isApproved && !token.isListed ? `
                        <button class="btn btn-secondary" onclick="window.app.erc20Manager.listTokenFromUI('${token.address}')">
                            List
                        </button>
                    ` : ''}
                    ${token.isListed ? `
                        <button class="btn btn-success" disabled>
                            Listed
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ERC20Manager;
} else {
    window.ERC20Manager = ERC20Manager;
} 