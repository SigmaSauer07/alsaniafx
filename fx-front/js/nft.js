// AlsaniaFX NFT Manager
// Handles NFT creation, minting, metadata management, and IPFS uploads

class NFTManager {
    constructor() {
        this.ipfsClient = null;
        this.uploadQueue = [];
        this.isUploading = false;
        
        this.init();
    }

    async init() {
        try {
            // Initialize IPFS client (using NFT.Storage or Pinata)
            await this.initializeIPFS();
            console.log('🎨 NFT Manager initialized');
        } catch (error) {
            console.error('Error initializing NFT Manager:', error);
        }
    }

    // Initialize IPFS client
    async initializeIPFS() {
        try {
            // For now, we'll use fetch API to upload to NFT.Storage
            // In production, you'd want to use their SDK
            this.ipfsEndpoint = CONFIG.IPFS.API_ENDPOINT;
            console.log('📦 IPFS client ready');
        } catch (error) {
            console.error('IPFS initialization error:', error);
        }
    }

    // Create ERC-721 NFT
    async createERC721(nftData) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        try {
            // Upload image to IPFS
            const imageHash = await this.uploadToIPFS(nftData.image);
            
            // Create metadata
            const metadata = UTILS.generateNFTMetadata(
                nftData.name,
                nftData.description,
                `ipfs://${imageHash}`,
                nftData.attributes || []
            );

            // Upload metadata to IPFS
            const metadataHash = await this.uploadJSONToIPFS(metadata);
            
            // Mint NFT on blockchain
            const contract = window.web3Manager.getContract('nftFactory');
            if (!contract) {
                throw new Error('NFT Factory contract not available');
            }

            const royaltyBps = Math.floor((nftData.royalty || 2.5) * 100); // Convert percentage to basis points
            const tokenURI = `ipfs://${metadataHash}`;
            const collectionName = nftData.collection || 'Default Collection';

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'mintNFT', 
                [window.web3Manager.getCurrentAccount(), tokenURI, royaltyBps, collectionName]
            );

            // Execute minting transaction
            const tx = await contract.mintNFT(
                window.web3Manager.getCurrentAccount(),
                tokenURI,
                royaltyBps,
                collectionName,
                { gasLimit }
            );

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                // Extract token ID from transaction logs
                const tokenId = this.extractTokenIdFromReceipt(receipt);
                
                return {
                    tokenId,
                    transactionHash: tx.hash,
                    imageHash,
                    metadataHash,
                    tokenURI
                };
            } else {
                throw new Error('Minting transaction failed');
            }

        } catch (error) {
            console.error('ERC-721 creation error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Create ERC-1155 NFT
    async createERC1155(nftData) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        try {
            // Upload image to IPFS
            const imageHash = await this.uploadToIPFS(nftData.image);
            
            // Create metadata
            const metadata = UTILS.generateNFTMetadata(
                nftData.name,
                nftData.description,
                `ipfs://${imageHash}`,
                nftData.attributes || []
            );

            // Upload metadata to IPFS
            const metadataHash = await this.uploadJSONToIPFS(metadata);
            
            // Mint NFT on blockchain
            const contract = window.web3Manager.getContract('erc1155Factory');
            if (!contract) {
                throw new Error('ERC1155 Factory contract not available');
            }

            // First create collection if needed
            let collectionId = nftData.collectionId;
            if (!collectionId) {
                collectionId = await this.createERC1155Collection(nftData);
            }

            const amount = parseInt(nftData.supply) || 1;
            const metadataURI = `ipfs://${metadataHash}`;

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'mintToken', 
                [collectionId, metadataURI, amount]
            );

            // Execute minting transaction
            const tx = await contract.mintToken(
                collectionId,
                metadataURI,
                amount,
                { gasLimit }
            );

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                const tokenId = this.extractTokenIdFromReceipt(receipt);
                
                return {
                    tokenId,
                    collectionId,
                    amount,
                    transactionHash: tx.hash,
                    imageHash,
                    metadataHash,
                    tokenURI: metadataURI
                };
            } else {
                throw new Error('Minting transaction failed');
            }

        } catch (error) {
            console.error('ERC-1155 creation error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Create ERC-1155 Collection
    async createERC1155Collection(nftData) {
        const contract = window.web3Manager.getContract('erc1155Factory');
        if (!contract) {
            throw new Error('ERC1155 Factory contract not available');
        }

        try {
            const collectionName = nftData.collection || 'My Collection';
            const symbol = nftData.symbol || 'MC';
            const contractURI = ''; // Could be collection metadata
            const baseURI = CONFIG.IPFS.GATEWAY;
            const royaltyBps = Math.floor((nftData.royalty || 2.5) * 100);

            const tx = await contract.createCollection(
                collectionName,
                symbol,
                contractURI,
                baseURI,
                royaltyBps
            );

            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                // Extract collection ID from logs
                return this.extractCollectionIdFromReceipt(receipt);
            } else {
                throw new Error('Collection creation failed');
            }

        } catch (error) {
            console.error('Collection creation error:', error);
            throw error;
        }
    }

    // Create Lazy Mint NFT
    async createLazyNFT(nftData) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        try {
            // Upload image to IPFS
            const imageHash = await this.uploadToIPFS(nftData.image);
            
            // Create metadata
            const metadata = UTILS.generateNFTMetadata(
                nftData.name,
                nftData.description,
                `ipfs://${imageHash}`,
                nftData.attributes || []
            );

            // Upload metadata to IPFS
            const metadataHash = await this.uploadJSONToIPFS(metadata);
            
            // Create lazy NFT on blockchain
            const contract = window.web3Manager.getContract('lazyMinting');
            if (!contract) {
                throw new Error('Lazy Minting contract not available');
            }

            const metadataURI = `ipfs://${metadataHash}`;
            const priceWei = ethers.utils.parseEther(nftData.price.toString());
            const royaltyBps = Math.floor((nftData.royalty || 2.5) * 100);

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'createLazyNFT', 
                [metadataURI, priceWei, royaltyBps]
            );

            // Execute transaction
            const tx = await contract.createLazyNFT(
                metadataURI,
                priceWei,
                royaltyBps,
                { gasLimit }
            );

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                const lazyNFTId = this.extractLazyNFTIdFromReceipt(receipt);
                
                return {
                    lazyNFTId,
                    price: nftData.price,
                    transactionHash: tx.hash,
                    imageHash,
                    metadataHash,
                    tokenURI: metadataURI
                };
            } else {
                throw new Error('Lazy NFT creation failed');
            }

        } catch (error) {
            console.error('Lazy NFT creation error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Create ERC-20 Token
    async createERC20(tokenData) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        try {
            const contract = window.web3Manager.getContract('erc20Factory');
            if (!contract) {
                throw new Error('ERC20 Factory contract not available');
            }

            const name = tokenData.name;
            const symbol = tokenData.symbol || tokenData.name.substring(0, 4).toUpperCase();
            const totalSupply = ethers.utils.parseEther(tokenData.supply.toString());

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'createToken', 
                [name, symbol, totalSupply]
            );

            // Execute transaction
            const tx = await contract.createToken(
                name,
                symbol,
                totalSupply,
                { gasLimit }
            );

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                const tokenAddress = this.extractTokenAddressFromReceipt(receipt);
                
                return {
                    tokenAddress,
                    name,
                    symbol,
                    totalSupply: tokenData.supply,
                    transactionHash: tx.hash
                };
            } else {
                throw new Error('Token creation failed');
            }

        } catch (error) {
            console.error('ERC-20 creation error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Upload file to IPFS
    async uploadToIPFS(file) {
        try {
            if (this.isUploading) {
                throw new Error('Another upload is in progress');
            }

            this.isUploading = true;

            // Create FormData for file upload
            const formData = new FormData();
            formData.append('file', file);

            // Upload to NFT.Storage (free IPFS pinning service)
            const response = await fetch('https://api.nft.storage/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getNFTStorageKey()}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Upload failed: ${response.statusText}`);
            }

            const result = await response.json();
            this.isUploading = false;

            return result.value.cid;

        } catch (error) {
            this.isUploading = false;
            console.error('IPFS upload error:', error);
            
            // Fallback: return a mock hash for development
            if (CONFIG.DEV.MOCK_DATA) {
                return 'QmMockHashForDevelopment' + Date.now();
            }
            
            throw new Error('Failed to upload to IPFS');
        }
    }

    // Upload JSON metadata to IPFS
    async uploadJSONToIPFS(metadata) {
        try {
            // Convert metadata to blob
            const blob = new Blob([JSON.stringify(metadata, null, 2)], {
                type: 'application/json'
            });

            return await this.uploadToIPFS(blob);

        } catch (error) {
            console.error('Metadata upload error:', error);
            throw new Error('Failed to upload metadata to IPFS');
        }
    }

    // Get NFT.Storage API key (in production, this should be from environment)
    getNFTStorageKey() {
        // For development - replace with your actual NFT.Storage API key
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkZXZlbG9wbWVudCIsImlhdCI6MTYzNzI0NzYwMH0.mock_key';
    }

    // Extract token ID from transaction receipt
    extractTokenIdFromReceipt(receipt) {
        try {
            // Look for Transfer event in logs
            const transferLog = receipt.logs.find(log => 
                log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
            );

            if (transferLog && transferLog.topics[3]) {
                return parseInt(transferLog.topics[3], 16);
            }

            // Fallback: return timestamp-based mock ID
            return Date.now() % 10000;

        } catch (error) {
            console.error('Error extracting token ID:', error);
            return Date.now() % 10000;
        }
    }

    // Extract collection ID from transaction receipt
    extractCollectionIdFromReceipt(receipt) {
        try {
            // Look for collection creation event
            const collectionLog = receipt.logs.find(log => 
                log.topics.length > 1
            );

            if (collectionLog && collectionLog.topics[1]) {
                return parseInt(collectionLog.topics[1], 16);
            }

            return Date.now() % 1000;

        } catch (error) {
            console.error('Error extracting collection ID:', error);
            return Date.now() % 1000;
        }
    }

    // Extract lazy NFT ID from transaction receipt
    extractLazyNFTIdFromReceipt(receipt) {
        try {
            // Similar to token ID extraction but for lazy NFTs
            const lazyNFTLog = receipt.logs.find(log => 
                log.topics.length > 1
            );

            if (lazyNFTLog && lazyNFTLog.topics[1]) {
                return parseInt(lazyNFTLog.topics[1], 16);
            }

            return Date.now() % 10000;

        } catch (error) {
            console.error('Error extracting lazy NFT ID:', error);
            return Date.now() % 10000;
        }
    }

    // Extract token address from transaction receipt
    extractTokenAddressFromReceipt(receipt) {
        try {
            // Look for contract creation or token creation event
            if (receipt.contractAddress) {
                return receipt.contractAddress;
            }

            // Look in logs for token address
            const tokenLog = receipt.logs.find(log => 
                log.address && log.address !== '0x0000000000000000000000000000000000000000'
            );

            if (tokenLog) {
                return tokenLog.address;
            }

            // Fallback: generate mock address for development
            return '0x' + Date.now().toString(16).padStart(40, '0');

        } catch (error) {
            console.error('Error extracting token address:', error);
            return '0x' + Date.now().toString(16).padStart(40, '0');
        }
    }

    // Update NFT metadata
    async updateMetadata(tokenId, newMetadata) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        try {
            // Upload new metadata to IPFS
            const metadataHash = await this.uploadJSONToIPFS(newMetadata);
            const newTokenURI = `ipfs://${metadataHash}`;

            // Update on blockchain
            const contract = window.web3Manager.getContract('nftFactory');
            if (!contract) {
                throw new Error('NFT Factory contract not available');
            }

            const tx = await contract.updateMetadata(tokenId, newTokenURI);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                return {
                    tokenId,
                    newTokenURI,
                    metadataHash,
                    transactionHash: tx.hash
                };
            } else {
                throw new Error('Metadata update failed');
            }

        } catch (error) {
            console.error('Metadata update error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Get NFT metadata from IPFS
    async getNFTMetadata(tokenURI) {
        try {
            let url = tokenURI;
            if (tokenURI.startsWith('ipfs://')) {
                url = tokenURI.replace('ipfs://', CONFIG.IPFS.GATEWAY);
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch metadata');
            }

            return await response.json();

        } catch (error) {
            console.error('Error fetching NFT metadata:', error);
            return {
                name: 'Unknown NFT',
                description: 'Metadata unavailable',
                image: '',
                attributes: []
            };
        }
    }

    // Validate NFT data before creation
    validateNFTData(nftData) {
        const errors = [];

        if (!nftData.name || nftData.name.trim() === '') {
            errors.push('Name is required');
        }

        if (!nftData.image) {
            errors.push('Image is required');
        }

        if (nftData.price !== undefined) {
            const price = parseFloat(nftData.price);
            if (isNaN(price) || price < 0) {
                errors.push('Price must be a valid positive number');
            }
        }

        if (nftData.royalty !== undefined) {
            const royalty = parseFloat(nftData.royalty);
            if (isNaN(royalty) || royalty < 0 || royalty > 10) {
                errors.push('Royalty must be between 0% and 10%');
            }
        }

        if (nftData.supply !== undefined) {
            const supply = parseInt(nftData.supply);
            if (isNaN(supply) || supply < 1) {
                errors.push('Supply must be at least 1');
            }
        }

        return errors;
    }

    // Generate attributes from form data
    generateAttributes(formData) {
        const attributes = [];
        
        // Extract attribute pairs from form
        const attributeKeys = formData.getAll('attributeKey');
        const attributeValues = formData.getAll('attributeValue');

        for (let i = 0; i < attributeKeys.length; i++) {
            if (attributeKeys[i] && attributeValues[i]) {
                attributes.push({
                    trait_type: attributeKeys[i],
                    value: attributeValues[i]
                });
            }
        }

        return attributes;
    }

    // Calculate rarity score for NFT
    calculateRarityScore(attributes, collectionAttributes) {
        if (!attributes || !collectionAttributes) return 0;

        let rarityScore = 0;
        
        attributes.forEach(attr => {
            const traitOccurrences = collectionAttributes.filter(
                collectionAttr => collectionAttr.trait_type === attr.trait_type && 
                                collectionAttr.value === attr.value
            ).length;

            if (traitOccurrences > 0) {
                rarityScore += 1 / (traitOccurrences / collectionAttributes.length);
            }
        });

        return Math.round(rarityScore * 100) / 100;
    }

    // Get user's created NFTs
    async getUserCreatedNFTs(userAddress) {
        try {
            // This would typically query events from the blockchain
            // For now, return mock data
            return [
                {
                    tokenId: '1',
                    name: 'My First NFT',
                    image: 'https://via.placeholder.com/400x400',
                    createdAt: Date.now() - 86400000
                }
            ];

        } catch (error) {
            console.error('Error fetching user NFTs:', error);
            return [];
        }
    }

    // Get user's owned NFTs
    async getUserOwnedNFTs(userAddress) {
        try {
            // This would typically query the user's wallet or indexing service
            // For now, return mock data
            return [
                {
                    tokenId: '2',
                    name: 'Purchased NFT',
                    image: 'https://via.placeholder.com/400x400',
                    purchasedAt: Date.now() - 172800000
                }
            ];

        } catch (error) {
            console.error('Error fetching owned NFTs:', error);
            return [];
        }
    }
}

// Initialize NFT Manager
window.nftManager = new NFTManager();

console.log('🎨 NFT Manager loaded');