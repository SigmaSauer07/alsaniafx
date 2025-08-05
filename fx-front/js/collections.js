// AlsaniaFX Collections Manager
// Handles collection data, featured collections, and collection-based functionality

class CollectionsManager {
    constructor() {
        this.collections = [];
        this.featuredCollections = [];
        this.userCollections = [];
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCollections();
            await this.loadFeaturedCollections();
            console.log('📚 Collections Manager initialized');
        } catch (error) {
            console.error('Error initializing Collections Manager:', error);
        }
    }

    // Load all collections
    async loadCollections() {
        try {
            this.isLoading = true;

            // Get collections from blockchain
            const collections = await this.fetchCollectionsFromChain();
            this.collections = collections;

            // Update UI
            if (window.ui) {
                window.ui.updateCollectionsGrid(this.collections);
            }

            this.isLoading = false;

        } catch (error) {
            console.error('Error loading collections:', error);
            this.isLoading = false;
            
            // Load mock data in development
            if (CONFIG.DEV.MOCK_DATA) {
                this.loadMockCollections();
            }
        }
    }

    // Fetch collections from smart contracts
    async fetchCollectionsFromChain() {
        if (!window.web3Manager.isWalletConnected()) {
            return this.getMockCollections();
        }

        try {
            // Get collections from NFT Factory
            const nftContract = window.web3Manager.getContract('nftFactory');
            const erc1155Contract = window.web3Manager.getContract('erc1155Factory');
            
            let collections = [];

            // Fetch ERC721 collections (if available)
            if (nftContract) {
                // This would need to be implemented based on your contract structure
                // For now, we'll use mock data
            }

            // Fetch ERC1155 collections
            if (erc1155Contract) {
                try {
                    // Get collection count (you'd need to add this to your contract)
                    // const collectionCount = await erc1155Contract.collectionCounter();
                    
                    // For now, use mock data
                    collections = this.getMockCollections();
                } catch (error) {
                    console.error('Error fetching ERC1155 collections:', error);
                }
            }

            return collections.length > 0 ? collections : this.getMockCollections();

        } catch (error) {
            console.error('Error fetching collections from chain:', error);
            return this.getMockCollections();
        }
    }

    // Get mock collections for development
    getMockCollections() {
        return [
            {
                id: '1',
                name: 'Cyber Punks Alsania',
                description: 'A collection of cyberpunk-inspired NFTs from the Alsania universe',
                banner: 'https://via.placeholder.com/800x200/39ff14/000000?text=Cyber+Punks+Banner',
                avatar: 'https://via.placeholder.com/100x100/39ff14/000000?text=CP',
                creator: '0x742d35Cc6e6B8D8E8A8eD0e8E6B8D8F8A8eD0e8E',
                itemCount: 10000,
                ownersCount: 3456,
                floorPrice: '0.5',
                volume: '1234.56',
                createdAt: Date.now() - 2592000000, // 30 days ago
                isVerified: true,
                category: 'art',
                blockchain: 'Alsania',
                royalty: 2.5,
                website: 'https://cyberpunks.alsania.com',
                discord: 'https://discord.gg/cyberpunks',
                twitter: 'https://twitter.com/cyberpunks_als'
            },
            {
                id: '2',
                name: 'Alsania Warriors',
                description: 'Legendary warriors defending the Alsania realm',
                banner: 'https://via.placeholder.com/800x200/0a2472/39ff14?text=Warriors+Banner',
                avatar: 'https://via.placeholder.com/100x100/0a2472/39ff14?text=AW',
                creator: '0x8B3e2A4C2e2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A',
                itemCount: 5000,
                ownersCount: 2100,
                floorPrice: '1.2',
                volume: '890.34',
                createdAt: Date.now() - 1814400000, // 21 days ago
                isVerified: true,
                category: 'gaming',
                blockchain: 'Alsania',
                royalty: 5.0,
                website: 'https://warriors.alsania.com',
                discord: 'https://discord.gg/alsania-warriors',
                twitter: 'https://twitter.com/alsania_warriors'
            },
            {
                id: '3',
                name: 'Digital Dreams',
                description: 'Abstract digital art exploring the future of consciousness',
                banner: 'https://via.placeholder.com/800x200/8a2be2/39ff14?text=Dreams+Banner',
                avatar: 'https://via.placeholder.com/100x100/8a2be2/39ff14?text=DD',
                creator: '0x5E8A2B3E2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C',
                itemCount: 1000,
                ownersCount: 567,
                floorPrice: '0.8',
                volume: '234.67',
                createdAt: Date.now() - 1209600000, // 14 days ago
                isVerified: false,
                category: 'art',
                blockchain: 'Alsania',
                royalty: 3.0,
                website: 'https://digitaldreams.art',
                twitter: 'https://twitter.com/digital_dreams_nft'
            },
            {
                id: '4',
                name: 'Neon Genesis',
                description: 'The birth of a new digital era captured in NFT form',
                banner: 'https://via.placeholder.com/800x200/00d4ff/000000?text=Genesis+Banner',
                avatar: 'https://via.placeholder.com/100x100/00d4ff/000000?text=NG',
                creator: '0x2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A5E8A',
                itemCount: 777,
                ownersCount: 345,
                floorPrice: '2.5',
                volume: '567.89',
                createdAt: Date.now() - 604800000, // 7 days ago
                isVerified: true,
                category: 'collectibles',
                blockchain: 'Alsania',
                royalty: 7.5,
                website: 'https://neongenesis.alsania.com',
                discord: 'https://discord.gg/neon-genesis',
                twitter: 'https://twitter.com/neon_genesis_nft'
            }
        ];
    }

    // Load mock collections for development
    loadMockCollections() {
        this.collections = this.getMockCollections();
        
        if (window.ui) {
            window.ui.updateCollectionsGrid(this.collections);
        }
    }

    // Load featured collections
    async loadFeaturedCollections() {
        try {
            // Featured collections are typically curated or based on volume/popularity
            this.featuredCollections = this.collections
                .filter(collection => collection.isVerified)
                .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
                .slice(0, 4);

        } catch (error) {
            console.error('Error loading featured collections:', error);
        }
    }

    // Get collection by ID
    getCollectionById(collectionId) {
        return this.collections.find(collection => collection.id === collectionId);
    }

    // Get collections by creator
    getCollectionsByCreator(creatorAddress) {
        return this.collections.filter(collection => 
            collection.creator.toLowerCase() === creatorAddress.toLowerCase()
        );
    }

    // Get collections by category
    getCollectionsByCategory(category) {
        return this.collections.filter(collection => collection.category === category);
    }

    // Get trending collections (by volume)
    getTrendingCollections(limit = 8) {
        return this.collections
            .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
            .slice(0, limit);
    }

    // Get new collections (recently created)
    getNewCollections(limit = 8) {
        return this.collections
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, limit);
    }

    // Get verified collections
    getVerifiedCollections() {
        return this.collections.filter(collection => collection.isVerified);
    }

    // Search collections
    searchCollections(query) {
        if (!query || query.trim() === '') {
            return this.collections;
        }

        const searchTerm = query.toLowerCase();
        return this.collections.filter(collection =>
            collection.name.toLowerCase().includes(searchTerm) ||
            collection.description.toLowerCase().includes(searchTerm) ||
            UTILS.formatAddress(collection.creator).toLowerCase().includes(searchTerm)
        );
    }

    // Get collection statistics
    getCollectionStats(collectionId) {
        const collection = this.getCollectionById(collectionId);
        if (!collection) return null;

        return {
            itemCount: collection.itemCount,
            ownersCount: collection.ownersCount,
            floorPrice: collection.floorPrice,
            volume: collection.volume,
            averagePrice: (parseFloat(collection.volume) / collection.itemCount).toFixed(4),
            uniqueOwners: Math.round((collection.ownersCount / collection.itemCount) * 100),
            royalty: collection.royalty
        };
    }

    // Get collection NFTs
    async getCollectionNFTs(collectionId, page = 1, limit = 12) {
        try {
            // In a real implementation, this would fetch NFTs from the specific collection
            // For now, we'll filter from the marketplace NFTs
            if (window.marketplace && window.marketplace.nfts) {
                const collectionNFTs = window.marketplace.nfts.filter(nft => 
                    nft.collectionId === collectionId
                );

                const startIndex = (page - 1) * limit;
                const endIndex = startIndex + limit;
                
                return {
                    nfts: collectionNFTs.slice(startIndex, endIndex),
                    totalCount: collectionNFTs.length,
                    currentPage: page,
                    totalPages: Math.ceil(collectionNFTs.length / limit)
                };
            }

            return {
                nfts: [],
                totalCount: 0,
                currentPage: 1,
                totalPages: 0
            };

        } catch (error) {
            console.error('Error fetching collection NFTs:', error);
            return {
                nfts: [],
                totalCount: 0,
                currentPage: 1,
                totalPages: 0
            };
        }
    }

    // Create new collection
    async createCollection(collectionData) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        try {
            // Validate collection data
            const errors = this.validateCollectionData(collectionData);
            if (errors.length > 0) {
                throw new Error(errors.join(', '));
            }

            // Upload banner and avatar to IPFS
            let bannerHash, avatarHash;
            
            if (collectionData.banner) {
                bannerHash = await window.nftManager.uploadToIPFS(collectionData.banner);
            }
            
            if (collectionData.avatar) {
                avatarHash = await window.nftManager.uploadToIPFS(collectionData.avatar);
            }

            // Create collection metadata
            const metadata = {
                name: collectionData.name,
                description: collectionData.description,
                banner: bannerHash ? `ipfs://${bannerHash}` : null,
                avatar: avatarHash ? `ipfs://${avatarHash}` : null,
                website: collectionData.website || null,
                discord: collectionData.discord || null,
                twitter: collectionData.twitter || null,
                category: collectionData.category || 'art'
            };

            // Upload metadata to IPFS
            const metadataHash = await window.nftManager.uploadJSONToIPFS(metadata);
            const contractURI = `ipfs://${metadataHash}`;

            // Create collection on blockchain (ERC1155)
            const contract = window.web3Manager.getContract('erc1155Factory');
            if (!contract) {
                throw new Error('ERC1155 Factory contract not available');
            }

            const name = collectionData.name;
            const symbol = collectionData.symbol || collectionData.name.substring(0, 4).toUpperCase();
            const baseURI = CONFIG.IPFS.GATEWAY;
            const royaltyBps = Math.floor((collectionData.royalty || 2.5) * 100);

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'createCollection', 
                [name, symbol, contractURI, baseURI, royaltyBps]
            );

            // Execute transaction
            const tx = await contract.createCollection(
                name,
                symbol,
                contractURI,
                baseURI,
                royaltyBps,
                { gasLimit }
            );

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                const collectionId = this.extractCollectionIdFromReceipt(receipt);
                
                // Add to local collections
                const newCollection = {
                    id: collectionId.toString(),
                    name,
                    description: collectionData.description,
                    banner: bannerHash ? `${CONFIG.IPFS.GATEWAY}${bannerHash}` : null,
                    avatar: avatarHash ? `${CONFIG.IPFS.GATEWAY}${avatarHash}` : null,
                    creator: window.web3Manager.getCurrentAccount(),
                    itemCount: 0,
                    ownersCount: 0,
                    floorPrice: '0',
                    volume: '0',
                    createdAt: Date.now(),
                    isVerified: false,
                    category: collectionData.category || 'art',
                    blockchain: 'Alsania',
                    royalty: collectionData.royalty || 2.5,
                    website: collectionData.website || null,
                    discord: collectionData.discord || null,
                    twitter: collectionData.twitter || null
                };

                this.collections.unshift(newCollection);
                
                // Update UI
                if (window.ui) {
                    window.ui.updateCollectionsGrid(this.collections);
                }

                return {
                    collectionId,
                    transactionHash: tx.hash,
                    collection: newCollection
                };
            } else {
                throw new Error('Collection creation failed');
            }

        } catch (error) {
            console.error('Collection creation error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Validate collection data
    validateCollectionData(collectionData) {
        const errors = [];

        if (!collectionData.name || collectionData.name.trim() === '') {
            errors.push('Collection name is required');
        }

        if (!collectionData.description || collectionData.description.trim() === '') {
            errors.push('Collection description is required');
        }

        if (collectionData.royalty !== undefined) {
            const royalty = parseFloat(collectionData.royalty);
            if (isNaN(royalty) || royalty < 0 || royalty > 10) {
                errors.push('Royalty must be between 0% and 10%');
            }
        }

        if (collectionData.website && !this.isValidURL(collectionData.website)) {
            errors.push('Website URL is not valid');
        }

        if (collectionData.discord && !this.isValidURL(collectionData.discord)) {
            errors.push('Discord URL is not valid');
        }

        if (collectionData.twitter && !this.isValidURL(collectionData.twitter)) {
            errors.push('Twitter URL is not valid');
        }

        return errors;
    }

    // Validate URL
    isValidURL(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Extract collection ID from transaction receipt
    extractCollectionIdFromReceipt(receipt) {
        try {
            // Look for collection creation event in logs
            const collectionLog = receipt.logs.find(log => 
                log.topics.length > 1
            );

            if (collectionLog && collectionLog.topics[1]) {
                return parseInt(collectionLog.topics[1], 16);
            }

            // Fallback: return timestamp-based mock ID
            return Date.now() % 10000;

        } catch (error) {
            console.error('Error extracting collection ID:', error);
            return Date.now() % 10000;
        }
    }

    // Get user's collections
    async getUserCollections(userAddress) {
        try {
            const userCollections = this.getCollectionsByCreator(userAddress);
            this.userCollections = userCollections;
            return userCollections;

        } catch (error) {
            console.error('Error fetching user collections:', error);
            return [];
        }
    }

    // Calculate collection rarity distribution
    getCollectionRarityDistribution(collectionId) {
        // This would analyze all NFTs in the collection and calculate rarity
        // For now, return mock distribution
        return {
            common: 60,      // 60%
            uncommon: 25,    // 25%
            rare: 10,        // 10%
            epic: 4,         // 4%
            legendary: 1     // 1%
        };
    }

    // Get collection activity (sales, listings, etc.)
    async getCollectionActivity(collectionId, limit = 20) {
        try {
            // This would fetch recent activity from blockchain events
            // For now, return mock activity
            return [
                {
                    type: 'sale',
                    nftId: '123',
                    nftName: 'Cyber Punk #123',
                    price: '1.5',
                    buyer: '0x742d35Cc6e6B8D8E8A8eD0e8E6B8D8F8A8eD0e8E',
                    seller: '0x8B3e2A4C2e2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A',
                    timestamp: Date.now() - 3600000
                },
                {
                    type: 'listing',
                    nftId: '124',
                    nftName: 'Cyber Punk #124',
                    price: '2.0',
                    seller: '0x5E8A2B3E2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C',
                    timestamp: Date.now() - 7200000
                }
            ];

        } catch (error) {
            console.error('Error fetching collection activity:', error);
            return [];
        }
    }

    // Get collection price history
    async getCollectionPriceHistory(collectionId, period = '7d') {
        try {
            // This would fetch historical price data
            // For now, return mock data
            const now = Date.now();
            const dayMs = 24 * 60 * 60 * 1000;
            
            return Array.from({ length: 7 }, (_, i) => ({
                timestamp: now - (6 - i) * dayMs,
                floorPrice: (Math.random() * 2 + 0.5).toFixed(3),
                volume: (Math.random() * 100 + 50).toFixed(2),
                sales: Math.floor(Math.random() * 20 + 5)
            }));

        } catch (error) {
            console.error('Error fetching price history:', error);
            return [];
        }
    }
}

// Initialize Collections Manager
window.collections = new CollectionsManager();

console.log('📚 Collections Manager loaded');