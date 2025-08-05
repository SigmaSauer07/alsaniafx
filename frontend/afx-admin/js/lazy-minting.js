// Lazy Minting Module for AlsaniaFX NFT Marketplace
class LazyMinting {
    constructor(web3Provider) {
        this.web3 = web3Provider;
        this.contract = null;
        this.init();
    }

    async init() {
        try {
            // Initialize contract (address will be loaded from config)
            const contractAddress = window.app?.config?.contracts?.lazyMinting;
            if (contractAddress) {
                const abi = await this.loadABI('LazyMinting');
                this.contract = new this.web3.eth.Contract(abi, contractAddress);
            }
        } catch (error) {
            console.error('Failed to initialize Lazy Minting:', error);
        }
    }

    async loadABI(contractName) {
        // In production, load from artifacts
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
                    {"internalType": "string", "name": "metadata", "type": "string"},
                    {"internalType": "uint256", "name": "price", "type": "uint256"},
                    {"internalType": "uint16", "name": "royaltyBps", "type": "uint16"},
                    {"internalType": "address", "name": "royaltyRecipient", "type": "address"}
                ],
                "name": "createLazyNFT",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "lazyNFTId", "type": "uint256"},
                    {"internalType": "address", "name": "recipient", "type": "address"},
                    {
                        "components": [
                            {"internalType": "uint8", "name": "v", "type": "uint8"},
                            {"internalType": "bytes32", "name": "r", "type": "bytes32"},
                            {"internalType": "bytes32", "name": "s", "type": "bytes32"}
                        ],
                        "internalType": "struct LazyMinting.Signature",
                        "name": "signature",
                        "type": "tuple"
                    }
                ],
                "name": "mintLazyNFT",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            }
        ];
    }

    async createLazyNFT(metadata, price, royaltyBps = 250, royaltyRecipient = null) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            if (!royaltyRecipient) {
                royaltyRecipient = from;
            }

            const result = await this.contract.methods.createLazyNFT(
                metadata,
                this.web3.utils.toWei(price.toString(), 'ether'),
                royaltyBps,
                royaltyRecipient
            ).send({ from });

            return result;
        } catch (error) {
            console.error('Failed to create lazy NFT:', error);
            throw error;
        }
    }

    async mintLazyNFT(lazyNFTId, recipient, signature) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const accounts = await this.web3.eth.getAccounts();
            const from = accounts[0];

            const result = await this.contract.methods.mintLazyNFT(
                lazyNFTId,
                recipient,
                signature
            ).send({ from, value: '0' }); // Value will be set based on NFT price

            return result;
        } catch (error) {
            console.error('Failed to mint lazy NFT:', error);
            throw error;
        }
    }

    async getLazyNFT(lazyNFTId) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const result = await this.contract.methods.getLazyNFT(lazyNFTId).call();
            return result;
        } catch (error) {
            console.error('Failed to get lazy NFT:', error);
            throw error;
        }
    }

    async getUnmintedLazyNFTs() {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const result = await this.contract.methods.getUnmintedLazyNFTs().call();
            return result;
        } catch (error) {
            console.error('Failed to get unminted lazy NFTs:', error);
            throw error;
        }
    }

    async getLazyNFTsByCreator(creator) {
        try {
            if (!this.contract) {
                throw new Error('Contract not initialized');
            }

            const result = await this.contract.methods.getLazyNFTsByCreator(creator).call();
            return result;
        } catch (error) {
            console.error('Failed to get lazy NFTs by creator:', error);
            throw error;
        }
    }

    // Generate signature for lazy minting
    async generateSignature(lazyNFTId, recipient, price, metadata, privateKey) {
        try {
            const messageHash = this.web3.utils.soliditySha3(
                lazyNFTId,
                recipient,
                price,
                metadata
            );

            const signature = await this.web3.eth.accounts.sign(messageHash, privateKey);
            
            return {
                v: signature.v,
                r: signature.r,
                s: signature.s
            };
        } catch (error) {
            console.error('Failed to generate signature:', error);
            throw error;
        }
    }

    // UI Methods
    async showLazyMintingModal() {
        const modal = document.getElementById('lazy-minting-modal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    async hideLazyMintingModal() {
        const modal = document.getElementById('lazy-minting-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    async createLazyNFTFromUI() {
        try {
            const name = document.getElementById('lazy-nft-name').value;
            const description = document.getElementById('lazy-nft-description').value;
            const price = document.getElementById('lazy-nft-price').value;
            const image = document.getElementById('lazy-nft-image').files[0];

            if (!name || !description || !price || !image) {
                throw new Error('Please fill in all fields');
            }

            // Upload image to IPFS
            const imageUrl = await this.uploadToIPFS(image);
            
            // Create metadata
            const metadata = JSON.stringify({
                name: name,
                description: description,
                image: imageUrl,
                attributes: []
            });

            // Create lazy NFT
            const result = await this.createLazyNFT(metadata, price);
            
            // Show success message
            this.showNotification('Lazy NFT created successfully!', 'success');
            
            // Hide modal
            this.hideLazyMintingModal();
            
            // Refresh UI
            if (window.app) {
                window.app.loadLazyNFTs();
            }

        } catch (error) {
            console.error('Failed to create lazy NFT:', error);
            this.showNotification('Failed to create lazy NFT: ' + error.message, 'error');
        }
    }

    async uploadToIPFS(file) {
        // Simulate IPFS upload
        return `https://ipfs.io/ipfs/${Math.random().toString(36).substring(7)}`;
    }

    showNotification(message, type = 'info') {
        if (window.app?.ui) {
            window.app.ui.showNotification(message, type);
        }
    }

    // Load lazy NFTs for display
    async loadLazyNFTs() {
        try {
            const unmintedNFTs = await this.getUnmintedLazyNFTs();
            const lazyNFTs = [];

            for (const lazyNFTId of unmintedNFTs) {
                const lazyNFT = await this.getLazyNFT(lazyNFTId);
                lazyNFTs.push({
                    id: lazyNFTId,
                    ...lazyNFT
                });
            }

            this.updateLazyNFTGrid(lazyNFTs);
        } catch (error) {
            console.error('Failed to load lazy NFTs:', error);
        }
    }

    updateLazyNFTGrid(lazyNFTs) {
        const grid = document.getElementById('lazy-nft-grid');
        if (!grid) return;

        grid.innerHTML = lazyNFTs.map(nft => this.createLazyNFTCard(nft)).join('');
    }

    createLazyNFTCard(nft) {
        const metadata = JSON.parse(nft.metadata);
        const price = this.web3.utils.fromWei(nft.price, 'ether');
        
        return `
            <div class="lazy-nft-card">
                <div class="lazy-nft-image">
                    <img src="${metadata.image}" alt="${metadata.name}">
                    <div class="lazy-nft-badge">Lazy Mint</div>
                </div>
                <div class="lazy-nft-info">
                    <h3 class="lazy-nft-name">${metadata.name}</h3>
                    <p class="lazy-nft-description">${metadata.description}</p>
                    <div class="lazy-nft-price">
                        <span class="price-amount">${price} MATIC</span>
                        <span class="price-label">Price</span>
                    </div>
                    <div class="lazy-nft-actions">
                        <button class="btn btn-primary" onclick="window.app.lazyMinting.mintLazyNFTFromUI(${nft.id})">
                            Mint NFT
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    async mintLazyNFTFromUI(lazyNFTId) {
        try {
            const accounts = await this.web3.eth.getAccounts();
            const recipient = accounts[0];

            // In a real implementation, you would get the signature from the backend
            const signature = {
                v: 27,
                r: '0x' + '0'.repeat(64),
                s: '0x' + '0'.repeat(64)
            };

            await this.mintLazyNFT(lazyNFTId, recipient, signature);
            
            this.showNotification('NFT minted successfully!', 'success');
            
            // Refresh UI
            this.loadLazyNFTs();
        } catch (error) {
            console.error('Failed to mint lazy NFT:', error);
            this.showNotification('Failed to mint NFT: ' + error.message, 'error');
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyMinting;
} else {
    window.LazyMinting = LazyMinting;
} 