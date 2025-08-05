// AlsaniaFX Marketplace Manager
// Handles marketplace data, NFT listings, auctions, and trading functionality

class MarketplaceManager {
    constructor() {
        this.nfts = [];
        this.filteredNFTs = [];
        this.currentFilters = {
            category: 'all',
            price: 'all',
            sort: 'newest',
            search: ''
        };
        this.currentPage = 1;
        this.itemsPerPage = CONFIG.MARKETPLACE.ITEMS_PER_PAGE;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            await this.loadNFTs();
            await this.loadStats();
            console.log('🏪 Marketplace Manager initialized');
        } catch (error) {
            console.error('Error initializing marketplace:', error);
        }
    }

    // Load NFTs from blockchain and display
    async loadNFTs(page = 1, append = false) {
        try {
            this.isLoading = true;
            
            if (!append) {
                document.getElementById('loadingSpinner').style.display = 'flex';
            }

            // Get NFTs from blockchain
            const nfts = await this.fetchNFTsFromChain();
            
            if (append) {
                this.nfts = [...this.nfts, ...nfts];
            } else {
                this.nfts = nfts;
            }

            // Apply current filters
            this.applyFilters(this.currentFilters);
            
            this.isLoading = false;
            
        } catch (error) {
            console.error('Error loading NFTs:', error);
            this.isLoading = false;
            
            // Show mock data in development
            if (CONFIG.DEV.MOCK_DATA) {
                this.loadMockNFTs();
            }
        }
    }

    // Fetch NFTs from smart contracts
    async fetchNFTsFromChain() {
        if (!window.web3Manager.isWalletConnected()) {
            return this.getMockNFTs();
        }

        const contract = window.web3Manager.getContract('marketplace');
        if (!contract) {
            return this.getMockNFTs();
        }

        try {
            // Get total number of listings
            const listingCount = await contract.listingCounter();
            const nfts = [];

            // Fetch each listing
            for (let i = 0; i < listingCount; i++) {
                try {
                    const listing = await contract.getListing(i);
                    
                    if (listing.isActive) {
                        // Fetch metadata from IPFS
                        const metadata = await this.fetchMetadata(listing.metadata);
                        
                        nfts.push({
                            id: i.toString(),
                            tokenId: listing.tokenId.toString(),
                            contract: listing.nftContract,
                            name: metadata.name || `NFT #${listing.tokenId}`,
                            description: metadata.description || '',
                            image: metadata.image || '',
                            creator: listing.seller,
                            owner: listing.seller,
                            price: ethers.utils.formatEther(listing.price),
                            isAuction: listing.isAuction,
                            auctionEndTime: listing.auctionEndTime.toNumber(),
                            highestBid: ethers.utils.formatEther(listing.highestBid),
                            highestBidder: listing.highestBidder,
                            attributes: metadata.attributes || [],
                            category: this.determineCategory(metadata.attributes),
                            createdAt: listing.createdAt.toNumber(),
                            likes: Math.floor(Math.random() * 100), // Mock data
                            views: Math.floor(Math.random() * 1000) // Mock data
                        });
                    }
                } catch (error) {
                    console.error(`Error fetching listing ${i}:`, error);
                }
            }

            return nfts;
        } catch (error) {
            console.error('Error fetching NFTs from chain:', error);
            return this.getMockNFTs();
        }
    }

    // Fetch metadata from IPFS
    async fetchMetadata(metadataURI) {
        try {
            if (!metadataURI) return {};
            
            // Handle IPFS URIs
            let url = metadataURI;
            if (metadataURI.startsWith('ipfs://')) {
                url = metadataURI.replace('ipfs://', CONFIG.IPFS.GATEWAY);
            }
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch metadata');
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching metadata:', error);
            return {};
        }
    }

    // Determine category from attributes
    determineCategory(attributes) {
        if (!attributes || !Array.isArray(attributes)) return 'art';
        
        const categoryAttr = attributes.find(attr => 
            attr.trait_type.toLowerCase() === 'category'
        );
        
        return categoryAttr ? categoryAttr.value.toLowerCase() : 'art';
    }

    // Get mock NFTs for development
    getMockNFTs() {
        return [
            {
                id: '1',
                tokenId: '1',
                name: 'Cyber Punk #001',
                description: 'A rare cyberpunk NFT from the Alsania collection',
                image: 'https://via.placeholder.com/400x400/39ff14/000000?text=Cyber+Punk+%23001',
                creator: '0x742d35Cc6e6B8D8E8A8eD0e8E6B8D8F8A8eD0e8E',
                owner: '0x742d35Cc6e6B8D8E8A8eD0e8E6B8D8F8A8eD0e8E',
                price: '1.5',
                isAuction: false,
                category: 'art',
                attributes: [
                    { trait_type: 'Background', value: 'Neon City' },
                    { trait_type: 'Style', value: 'Cyberpunk' },
                    { trait_type: 'Rarity', value: 'Legendary' }
                ],
                createdAt: Date.now() - 86400000,
                likes: 42,
                views: 256
            },
            {
                id: '2',
                tokenId: '2',
                name: 'Digital Dreams',
                description: 'An abstract piece representing the digital future',
                image: 'https://via.placeholder.com/400x400/0a2472/39ff14?text=Digital+Dreams',
                creator: '0x8B3e2A4C2e2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A',
                owner: '0x8B3e2A4C2e2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A',
                price: '0.75',
                isAuction: true,
                auctionEndTime: Date.now() + 3600000,
                highestBid: '0.5',
                category: 'art',
                attributes: [
                    { trait_type: 'Style', value: 'Abstract' },
                    { trait_type: 'Colors', value: 'Neon' },
                    { trait_type: 'Mood', value: 'Futuristic' }
                ],
                createdAt: Date.now() - 172800000,
                likes: 28,
                views: 189
            },
            {
                id: '3',
                tokenId: '3',
                name: 'Alsania Warrior',
                description: 'A powerful warrior from the Alsania realm',
                image: 'https://via.placeholder.com/400x400/8a2be2/39ff14?text=Alsania+Warrior',
                creator: '0x5E8A2B3E2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C',
                owner: '0x5E8A2B3E2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C',
                price: '2.25',
                isAuction: false,
                category: 'gaming',
                attributes: [
                    { trait_type: 'Class', value: 'Warrior' },
                    { trait_type: 'Level', value: '99' },
                    { trait_type: 'Weapon', value: 'Neon Blade' }
                ],
                createdAt: Date.now() - 259200000,
                likes: 67,
                views: 423
            },
            {
                id: '4',
                tokenId: '4',
                name: 'Neon Genesis',
                description: 'The birth of a new digital era',
                image: 'https://via.placeholder.com/400x400/00d4ff/000000?text=Neon+Genesis',
                creator: '0x2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A5E8A',
                owner: '0x2A4C2E2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A5E8A',
                price: '3.0',
                isAuction: false,
                category: 'collectibles',
                attributes: [
                    { trait_type: 'Era', value: 'Genesis' },
                    { trait_type: 'Energy', value: 'Maximum' },
                    { trait_type: 'Rarity', value: 'Mythic' }
                ],
                createdAt: Date.now() - 345600000,
                likes: 91,
                views: 567
            }
        ];
    }

    // Load mock NFTs for development
    loadMockNFTs() {
        this.nfts = this.getMockNFTs();
        this.applyFilters(this.currentFilters);
    }

    // Apply filters to NFT list
    applyFilters(filters) {
        this.currentFilters = { ...this.currentFilters, ...filters };
        
        let filtered = [...this.nfts];

        // Apply category filter
        if (filters.category && filters.category !== 'all') {
            filtered = filtered.filter(nft => nft.category === filters.category);
        }

        // Apply price filter
        if (filters.price && filters.price !== 'all') {
            const priceFilter = UTILS.getPriceFilterById(filters.price);
            if (priceFilter) {
                filtered = filtered.filter(nft => {
                    const price = parseFloat(nft.price);
                    return price >= priceFilter.min && price <= priceFilter.max;
                });
            }
        }

        // Apply search filter
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filtered = filtered.filter(nft => 
                nft.name.toLowerCase().includes(searchTerm) ||
                nft.description.toLowerCase().includes(searchTerm) ||
                UTILS.formatAddress(nft.creator).toLowerCase().includes(searchTerm)
            );
        }

        // Apply sorting
        const sortOption = UTILS.getSortOptionById(filters.sort || 'newest');
        if (sortOption) {
            filtered.sort((a, b) => {
                let aValue = a[sortOption.field];
                let bValue = b[sortOption.field];

                if (sortOption.field === 'price') {
                    aValue = parseFloat(aValue);
                    bValue = parseFloat(bValue);
                }

                if (sortOption.direction === 'asc') {
                    return aValue > bValue ? 1 : -1;
                } else {
                    return aValue < bValue ? 1 : -1;
                }
            });
        }

        this.filteredNFTs = filtered;
        
        // Update UI
        if (window.ui) {
            window.ui.updateNFTGrid(this.filteredNFTs);
            
            // Show/hide load more button
            const loadMoreBtn = document.getElementById('loadMoreBtn');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = this.filteredNFTs.length >= this.itemsPerPage ? 'block' : 'none';
            }
        }
    }

    // Search NFTs
    searchNFTs(query) {
        this.applyFilters({ search: query });
    }

    // Get NFT details
    async getNFTDetails(nftId) {
        const nft = this.nfts.find(n => n.id === nftId);
        if (nft) {
            return nft;
        }

        // If not found locally, try to fetch from blockchain
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (contract) {
                const listing = await contract.getListing(nftId);
                const metadata = await this.fetchMetadata(listing.metadata);
                
                return {
                    id: nftId,
                    tokenId: listing.tokenId.toString(),
                    name: metadata.name || `NFT #${listing.tokenId}`,
                    description: metadata.description || '',
                    image: metadata.image || '',
                    creator: listing.seller,
                    price: ethers.utils.formatEther(listing.price),
                    isAuction: listing.isAuction,
                    attributes: metadata.attributes || []
                };
            }
        } catch (error) {
            console.error('Error fetching NFT details:', error);
        }

        return null;
    }

    // Buy NFT
    async buyNFT(nftId) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        const contract = window.web3Manager.getContract('marketplace');
        if (!contract) {
            throw new Error('Marketplace contract not available');
        }

        try {
            const nft = await this.getNFTDetails(nftId);
            if (!nft) {
                throw new Error('NFT not found');
            }

            const priceWei = ethers.utils.parseEther(nft.price);
            
            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'buyItem', [nftId], priceWei
            );

            // Execute transaction
            const tx = await contract.buyItem(nftId, {
                value: priceWei,
                gasLimit
            });

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                // Remove from local list
                this.nfts = this.nfts.filter(n => n.id !== nftId);
                this.applyFilters(this.currentFilters);
                
                return receipt;
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('Buy NFT error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Place bid on auction
    async placeBid(nftId, bidAmount) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        const contract = window.web3Manager.getContract('marketplace');
        if (!contract) {
            throw new Error('Marketplace contract not available');
        }

        try {
            const bidWei = ethers.utils.parseEther(bidAmount.toString());
            
            // Get auction details to find auction ID
            const nft = await this.getNFTDetails(nftId);
            if (!nft || !nft.isAuction) {
                throw new Error('This is not an auction item');
            }

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'placeBid', [nftId], bidWei
            );

            // Execute transaction
            const tx = await contract.placeBid(nftId, {
                value: bidWei,
                gasLimit
            });

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                // Update local data
                const nftIndex = this.nfts.findIndex(n => n.id === nftId);
                if (nftIndex !== -1) {
                    this.nfts[nftIndex].highestBid = bidAmount;
                    this.nfts[nftIndex].highestBidder = window.web3Manager.getCurrentAccount();
                }
                
                this.applyFilters(this.currentFilters);
                return receipt;
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('Place bid error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // List NFT for sale
    async listNFT(nftData) {
        if (!window.web3Manager.isWalletConnected()) {
            throw new Error('Please connect your wallet first');
        }

        const contract = window.web3Manager.getContract('marketplace');
        if (!contract) {
            throw new Error('Marketplace contract not available');
        }

        try {
            const {
                nftContract,
                tokenId,
                price,
                isAuction,
                auctionDuration,
                minBid,
                metadata
            } = nftData;

            const priceWei = ethers.utils.parseEther(price.toString());
            const minBidWei = minBid ? ethers.utils.parseEther(minBid.toString()) : 0;
            const duration = auctionDuration || 0;

            // Estimate gas
            const gasLimit = await window.web3Manager.estimateGas(
                contract, 'listItem', 
                [nftContract, tokenId, priceWei, isAuction, duration, minBidWei, metadata]
            );

            // Execute transaction
            const tx = await contract.listItem(
                nftContract,
                tokenId,
                priceWei,
                isAuction,
                duration,
                minBidWei,
                metadata,
                { gasLimit }
            );

            // Wait for confirmation
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);
            
            if (receipt.status === 1) {
                // Reload NFTs to show new listing
                await this.loadNFTs();
                return receipt;
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            console.error('List NFT error:', error);
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Load marketplace statistics
    async loadStats() {
        try {
            // In a real implementation, these would come from the blockchain or API
            const stats = {
                totalNFTs: this.nfts.length,
                totalVolume: this.calculateTotalVolume(),
                totalUsers: this.calculateUniqueUsers(),
                totalCollections: this.calculateTotalCollections()
            };

            if (window.ui) {
                window.ui.updateStats(stats);
            }

        } catch (error) {
            console.error('Error loading stats:', error);
            
            // Show mock stats
            if (window.ui) {
                window.ui.updateStats({
                    totalNFTs: 1234,
                    totalVolume: 567.89,
                    totalUsers: 890,
                    totalCollections: 123
                });
            }
        }
    }

    // Calculate total trading volume
    calculateTotalVolume() {
        return this.nfts.reduce((total, nft) => {
            return total + parseFloat(nft.price || 0);
        }, 0);
    }

    // Calculate unique users
    calculateUniqueUsers() {
        const users = new Set();
        this.nfts.forEach(nft => {
            users.add(nft.creator);
            users.add(nft.owner);
        });
        return users.size;
    }

    // Calculate total collections
    calculateTotalCollections() {
        const collections = new Set();
        this.nfts.forEach(nft => {
            if (nft.contract) {
                collections.add(nft.contract);
            }
        });
        return collections.size;
    }

    // Get featured NFTs
    getFeaturedNFTs(limit = 4) {
        return this.nfts
            .sort((a, b) => b.likes - a.likes)
            .slice(0, limit);
    }

    // Get trending NFTs
    getTrendingNFTs(limit = 8) {
        return this.nfts
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    // Get NFTs by category
    getNFTsByCategory(category, limit = 12) {
        return this.nfts
            .filter(nft => nft.category === category)
            .slice(0, limit);
    }

    // Get NFTs by creator
    getNFTsByCreator(creator, limit = 12) {
        return this.nfts
            .filter(nft => nft.creator.toLowerCase() === creator.toLowerCase())
            .slice(0, limit);
    }

    // Get auction NFTs
    getAuctionNFTs() {
        return this.nfts.filter(nft => nft.isAuction);
    }

    // Check if auction is ending soon (within 1 hour)
    isAuctionEndingSoon(nft) {
        if (!nft.isAuction || !nft.auctionEndTime) return false;
        const now = Date.now();
        const endTime = nft.auctionEndTime * 1000; // Convert to milliseconds
        return (endTime - now) <= 3600000; // 1 hour in milliseconds
    }

    // Format time remaining for auction
    formatTimeRemaining(endTime) {
        const now = Date.now();
        const remaining = (endTime * 1000) - now;
        
        if (remaining <= 0) return 'Ended';
        
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days}d ${hours}h`;
        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    }
}

// Initialize Marketplace Manager
window.marketplace = new MarketplaceManager();

console.log('🏪 Marketplace Manager loaded');