// AlsaniaFX Profile Manager
// Handles user profiles, owned NFTs, created NFTs, and activity history

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.userNFTs = {
            owned: [],
            created: [],
            favorited: [],
            activity: []
        };
        this.profileData = null;
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        try {
            // Listen for wallet connection changes
            if (window.web3Manager) {
                // Check if wallet is already connected
                if (window.web3Manager.isWalletConnected()) {
                    await this.loadUserProfile(window.web3Manager.getCurrentAccount());
                }
            }
            
            console.log('👤 Profile Manager initialized');
        } catch (error) {
            console.error('Error initializing Profile Manager:', error);
        }
    }

    // Load user profile data
    async loadUserProfile(userAddress) {
        if (!userAddress) {
            this.showDisconnectedState();
            return;
        }

        try {
            this.isLoading = true;
            this.currentUser = userAddress;

            // Load profile data
            await Promise.all([
                this.fetchUserProfile(userAddress),
                this.fetchUserNFTs(userAddress),
                this.fetchUserActivity(userAddress)
            ]);

            // Update UI
            if (window.ui) {
                window.ui.updateProfile(this.profileData);
            }

            this.isLoading = false;

        } catch (error) {
            console.error('Error loading user profile:', error);
            this.isLoading = false;
            this.showDisconnectedState();
        }
    }

    // Fetch user profile from blockchain/API
    async fetchUserProfile(userAddress) {
        try {
            // In a real implementation, this would fetch from:
            // 1. ENS/AED domain resolution
            // 2. IPFS profile metadata
            // 3. On-chain activity analysis
            // 4. API backend with cached data

            // For now, generate profile from on-chain data
            const balance = await window.web3Manager.getBalance(userAddress);
            
            this.profileData = {
                address: userAddress,
                balance: balance,
                username: await this.resolveUsername(userAddress),
                avatar: await this.resolveAvatar(userAddress),
                bio: await this.resolveBio(userAddress),
                website: null,
                twitter: null,
                discord: null,
                joinedAt: await this.getFirstTransactionDate(userAddress),
                isVerified: await this.checkVerificationStatus(userAddress),
                nftCount: 0, // Will be updated after fetching NFTs
                createdCount: 0,
                totalVolume: 0,
                followers: 0,
                following: 0
            };

            return this.profileData;

        } catch (error) {
            console.error('Error fetching user profile:', error);
            
            // Return basic profile with just address and balance
            this.profileData = {
                address: userAddress,
                balance: await window.web3Manager.getBalance(userAddress) || '0',
                username: null,
                avatar: null,
                bio: null,
                nftCount: 0,
                createdCount: 0,
                totalVolume: 0,
                joinedAt: Date.now(),
                isVerified: false
            };

            return this.profileData;
        }
    }

    // Resolve username from AED or ENS
    async resolveUsername(userAddress) {
        try {
            // Try to resolve from AED first
            // This would require reverse resolution functionality
            // For now, return null (will show formatted address)
            return null;

        } catch (error) {
            console.error('Error resolving username:', error);
            return null;
        }
    }

    // Resolve avatar from profile metadata
    async resolveAvatar(userAddress) {
        try {
            // This would fetch from IPFS profile metadata
            // For now, generate a deterministic avatar based on address
            const hash = userAddress.slice(2, 10);
            return `https://api.dicebear.com/7.x/identicon/svg?seed=${hash}`;

        } catch (error) {
            console.error('Error resolving avatar:', error);
            return null;
        }
    }

    // Resolve bio from profile metadata
    async resolveBio(userAddress) {
        try {
            // This would fetch from IPFS profile metadata
            return null;

        } catch (error) {
            console.error('Error resolving bio:', error);
            return null;
        }
    }

    // Get first transaction date (approximate join date)
    async getFirstTransactionDate(userAddress) {
        try {
            // This would analyze blockchain history
            // For now, return a random date in the past
            const daysAgo = Math.floor(Math.random() * 365) + 30;
            return Date.now() - (daysAgo * 24 * 60 * 60 * 1000);

        } catch (error) {
            console.error('Error getting first transaction date:', error);
            return Date.now() - (30 * 24 * 60 * 60 * 1000); // 30 days ago
        }
    }

    // Check verification status
    async checkVerificationStatus(userAddress) {
        try {
            // Check if user has any roles in the marketplace
            const contract = window.web3Manager.getContract('marketplace');
            if (contract) {
                const isCreator = await contract.hasRole(CONFIG.ROLES.CREATOR_ROLE, userAddress);
                const isApprover = await contract.hasRole(CONFIG.ROLES.APPROVER_ROLE, userAddress);
                const isAdmin = await contract.hasRole(CONFIG.ROLES.ADMIN_ROLE, userAddress);
                
                return isCreator || isApprover || isAdmin;
            }

            return false;

        } catch (error) {
            console.error('Error checking verification status:', error);
            return false;
        }
    }

    // Fetch user's NFTs
    async fetchUserNFTs(userAddress) {
        try {
            // Fetch owned NFTs
            this.userNFTs.owned = await this.fetchOwnedNFTs(userAddress);
            
            // Fetch created NFTs
            this.userNFTs.created = await this.fetchCreatedNFTs(userAddress);
            
            // Fetch favorited NFTs (from local storage for now)
            this.userNFTs.favorited = this.getFavoritedNFTs(userAddress);

            // Update profile counts
            if (this.profileData) {
                this.profileData.nftCount = this.userNFTs.owned.length;
                this.profileData.createdCount = this.userNFTs.created.length;
                this.profileData.totalVolume = this.calculateUserVolume();
            }

        } catch (error) {
            console.error('Error fetching user NFTs:', error);
        }
    }

    // Fetch NFTs owned by user
    async fetchOwnedNFTs(userAddress) {
        try {
            // This would typically query:
            // 1. ERC721 tokens owned by address
            // 2. ERC1155 token balances
            // 3. Indexing service or subgraph
            
            // For now, filter from marketplace NFTs
            if (window.marketplace && window.marketplace.nfts) {
                return window.marketplace.nfts.filter(nft => 
                    nft.owner && nft.owner.toLowerCase() === userAddress.toLowerCase()
                );
            }

            // Return mock data for development
            return this.getMockOwnedNFTs(userAddress);

        } catch (error) {
            console.error('Error fetching owned NFTs:', error);
            return [];
        }
    }

    // Fetch NFTs created by user
    async fetchCreatedNFTs(userAddress) {
        try {
            // This would query creation events from the blockchain
            // For now, filter from marketplace NFTs
            if (window.marketplace && window.marketplace.nfts) {
                return window.marketplace.nfts.filter(nft => 
                    nft.creator && nft.creator.toLowerCase() === userAddress.toLowerCase()
                );
            }

            // Return mock data for development
            return this.getMockCreatedNFTs(userAddress);

        } catch (error) {
            console.error('Error fetching created NFTs:', error);
            return [];
        }
    }

    // Get favorited NFTs from local storage
    getFavoritedNFTs(userAddress) {
        try {
            const key = `alsaniafx_favorites_${userAddress.toLowerCase()}`;
            const favorites = localStorage.getItem(key);
            return favorites ? JSON.parse(favorites) : [];

        } catch (error) {
            console.error('Error getting favorited NFTs:', error);
            return [];
        }
    }

    // Add NFT to favorites
    addToFavorites(nftId) {
        try {
            if (!this.currentUser) return;

            const key = `alsaniafx_favorites_${this.currentUser.toLowerCase()}`;
            let favorites = this.getFavoritedNFTs(this.currentUser);
            
            if (!favorites.includes(nftId)) {
                favorites.push(nftId);
                localStorage.setItem(key, JSON.stringify(favorites));
                this.userNFTs.favorited = favorites;
                
                if (window.ui) {
                    window.ui.showNotification('Added to favorites', 'success');
                }
            }

        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    }

    // Remove NFT from favorites
    removeFromFavorites(nftId) {
        try {
            if (!this.currentUser) return;

            const key = `alsaniafx_favorites_${this.currentUser.toLowerCase()}`;
            let favorites = this.getFavoritedNFTs(this.currentUser);
            
            favorites = favorites.filter(id => id !== nftId);
            localStorage.setItem(key, JSON.stringify(favorites));
            this.userNFTs.favorited = favorites;
            
            if (window.ui) {
                window.ui.showNotification('Removed from favorites', 'info');
            }

        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    }

    // Check if NFT is favorited
    isFavorited(nftId) {
        return this.userNFTs.favorited.includes(nftId);
    }

    // Fetch user activity
    async fetchUserActivity(userAddress) {
        try {
            // This would fetch from blockchain events or API
            // For now, generate mock activity
            this.userNFTs.activity = this.getMockActivity(userAddress);

        } catch (error) {
            console.error('Error fetching user activity:', error);
            this.userNFTs.activity = [];
        }
    }

    // Calculate user's total trading volume
    calculateUserVolume() {
        // This would sum up all sales/purchases by the user
        // For now, return a mock value
        return Math.random() * 100;
    }

    // Get mock owned NFTs for development
    getMockOwnedNFTs(userAddress) {
        return [
            {
                id: 'owned_1',
                tokenId: '101',
                name: 'My Cyber Punk',
                image: 'https://via.placeholder.com/400x400/39ff14/000000?text=Owned+NFT+1',
                collection: 'Cyber Punks Alsania',
                purchasePrice: '1.2',
                purchaseDate: Date.now() - 86400000
            },
            {
                id: 'owned_2',
                tokenId: '102',
                name: 'Digital Warrior',
                image: 'https://via.placeholder.com/400x400/0a2472/39ff14?text=Owned+NFT+2',
                collection: 'Alsania Warriors',
                purchasePrice: '0.8',
                purchaseDate: Date.now() - 172800000
            }
        ];
    }

    // Get mock created NFTs for development
    getMockCreatedNFTs(userAddress) {
        return [
            {
                id: 'created_1',
                tokenId: '201',
                name: 'My First Creation',
                image: 'https://via.placeholder.com/400x400/8a2be2/39ff14?text=Created+NFT+1',
                collection: 'My Collection',
                mintPrice: '0.5',
                currentPrice: '1.5',
                createdDate: Date.now() - 259200000
            }
        ];
    }

    // Get mock activity for development
    getMockActivity(userAddress) {
        return [
            {
                type: 'purchase',
                nftId: 'owned_1',
                nftName: 'My Cyber Punk',
                price: '1.2',
                from: '0x742d35Cc6e6B8D8E8A8eD0e8E6B8D8F8A8eD0e8E',
                timestamp: Date.now() - 86400000,
                txHash: '0x1234567890abcdef'
            },
            {
                type: 'sale',
                nftId: 'created_1',
                nftName: 'My First Creation',
                price: '1.5',
                to: '0x8B3e2A4C2e2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A',
                timestamp: Date.now() - 172800000,
                txHash: '0xabcdef1234567890'
            },
            {
                type: 'mint',
                nftId: 'created_1',
                nftName: 'My First Creation',
                timestamp: Date.now() - 259200000,
                txHash: '0xfedcba0987654321'
            }
        ];
    }

    // Load tab content for profile tabs
    loadTabContent(tab) {
        const tabContent = document.getElementById('profileTabContent');
        if (!tabContent) return;

        switch (tab) {
            case 'owned':
                this.loadOwnedTab(tabContent);
                break;
            case 'created':
                this.loadCreatedTab(tabContent);
                break;
            case 'activity':
                this.loadActivityTab(tabContent);
                break;
            case 'favorites':
                this.loadFavoritesTab(tabContent);
                break;
            default:
                this.loadOwnedTab(tabContent);
        }
    }

    // Load owned NFTs tab
    loadOwnedTab(container) {
        if (this.userNFTs.owned.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No NFTs Owned</h3>
                    <p>You don't own any NFTs yet. Start exploring the marketplace!</p>
                    <button class="btn btn-primary" onclick="scrollToSection('marketplace')">
                        Explore Marketplace
                    </button>
                </div>
            `;
            return;
        }

        const nftsHTML = this.userNFTs.owned.map(nft => `
            <div class="profile-nft-card" onclick="ui.openNFTModal('${nft.id}')">
                <img src="${nft.image}" alt="${nft.name}" loading="lazy">
                <div class="profile-nft-info">
                    <h4>${nft.name}</h4>
                    <p class="collection-name">${nft.collection || 'Unknown Collection'}</p>
                    <div class="nft-stats">
                        <span>Bought: ${UTILS.formatPrice(nft.purchasePrice)} ETH</span>
                        <span>${this.formatDate(nft.purchaseDate)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="profile-nft-grid">
                ${nftsHTML}
            </div>
        `;
    }

    // Load created NFTs tab
    loadCreatedTab(container) {
        if (this.userNFTs.created.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No NFTs Created</h3>
                    <p>You haven't created any NFTs yet. Start creating your digital art!</p>
                    <button class="btn btn-primary" onclick="scrollToSection('create')">
                        Create NFT
                    </button>
                </div>
            `;
            return;
        }

        const nftsHTML = this.userNFTs.created.map(nft => `
            <div class="profile-nft-card" onclick="ui.openNFTModal('${nft.id}')">
                <img src="${nft.image}" alt="${nft.name}" loading="lazy">
                <div class="profile-nft-info">
                    <h4>${nft.name}</h4>
                    <p class="collection-name">${nft.collection || 'Unknown Collection'}</p>
                    <div class="nft-stats">
                        <span>Created: ${this.formatDate(nft.createdDate)}</span>
                        <span>Current: ${UTILS.formatPrice(nft.currentPrice)} ETH</span>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="profile-nft-grid">
                ${nftsHTML}
            </div>
        `;
    }

    // Load activity tab
    loadActivityTab(container) {
        if (this.userNFTs.activity.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Activity</h3>
                    <p>No trading activity found.</p>
                </div>
            `;
            return;
        }

        const activityHTML = this.userNFTs.activity.map(activity => {
            const icon = this.getActivityIcon(activity.type);
            const description = this.getActivityDescription(activity);
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">${icon}</div>
                    <div class="activity-details">
                        <h4>${activity.nftName}</h4>
                        <p>${description}</p>
                        <span class="activity-time">${this.formatDate(activity.timestamp)}</span>
                    </div>
                    <div class="activity-price">
                        ${activity.price ? `${UTILS.formatPrice(activity.price)} ETH` : ''}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <div class="activity-list">
                ${activityHTML}
            </div>
        `;
    }

    // Load favorites tab
    loadFavoritesTab(container) {
        // Get favorited NFTs from marketplace
        const favoritedNFTs = [];
        if (window.marketplace && window.marketplace.nfts) {
            this.userNFTs.favorited.forEach(nftId => {
                const nft = window.marketplace.nfts.find(n => n.id === nftId);
                if (nft) favoritedNFTs.push(nft);
            });
        }

        if (favoritedNFTs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>No Favorites</h3>
                    <p>You haven't favorited any NFTs yet.</p>
                </div>
            `;
            return;
        }

        const nftsHTML = favoritedNFTs.map(nft => `
            <div class="profile-nft-card" onclick="ui.openNFTModal('${nft.id}')">
                <img src="${nft.image}" alt="${nft.name}" loading="lazy">
                <div class="profile-nft-info">
                    <h4>${nft.name}</h4>
                    <p class="collection-name">${nft.collection || 'Unknown Collection'}</p>
                    <div class="nft-stats">
                        <span>Price: ${UTILS.formatPrice(nft.price)} ETH</span>
                        <button class="btn btn-small btn-outline" onclick="event.stopPropagation(); profile.removeFromFavorites('${nft.id}')">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="profile-nft-grid">
                ${nftsHTML}
            </div>
        `;
    }

    // Get activity icon
    getActivityIcon(type) {
        const icons = {
            purchase: '🛒',
            sale: '💰',
            mint: '✨',
            transfer: '📤',
            bid: '🏷️',
            listing: '📋'
        };
        return icons[type] || '📄';
    }

    // Get activity description
    getActivityDescription(activity) {
        switch (activity.type) {
            case 'purchase':
                return `Purchased from ${UTILS.formatAddress(activity.from)}`;
            case 'sale':
                return `Sold to ${UTILS.formatAddress(activity.to)}`;
            case 'mint':
                return 'Minted NFT';
            case 'transfer':
                return `Transferred to ${UTILS.formatAddress(activity.to)}`;
            case 'bid':
                return `Placed bid of ${UTILS.formatPrice(activity.price)} ETH`;
            case 'listing':
                return `Listed for ${UTILS.formatPrice(activity.price)} ETH`;
            default:
                return 'Unknown activity';
        }
    }

    // Format date for display
    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    // Show disconnected state
    showDisconnectedState() {
        if (window.ui) {
            window.ui.updateProfile(null);
        }
    }

    // Update profile when wallet connects
    onWalletConnect(userAddress) {
        this.loadUserProfile(userAddress);
    }

    // Clear profile when wallet disconnects
    onWalletDisconnect() {
        this.currentUser = null;
        this.profileData = null;
        this.userNFTs = {
            owned: [],
            created: [],
            favorited: [],
            activity: []
        };
        this.showDisconnectedState();
    }

    // Get current user address
    getCurrentUser() {
        return this.currentUser;
    }

    // Get profile data
    getProfileData() {
        return this.profileData;
    }

    // Get user NFTs
    getUserNFTs() {
        return this.userNFTs;
    }
}

// Initialize Profile Manager
window.profile = new ProfileManager();

console.log('👤 Profile Manager loaded');