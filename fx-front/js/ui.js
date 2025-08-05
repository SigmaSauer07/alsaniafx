// AlsaniaFX UI Manager
// Handles all user interface interactions, modals, notifications, and animations

class UIManager {
    constructor() {
        this.notifications = [];
        this.modals = {};
        this.currentPage = 1;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeModals();
        this.setupScrollEffects();
        console.log('🎨 UI Manager initialized');
    }

    // Setup global event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                if (target.startsWith('#')) {
                    this.scrollToSection(target.substring(1));
                    this.setActiveNavLink(link);
                }
            });
        });

        // Wallet connection
        const connectBtn = document.getElementById('connectWallet');
        if (connectBtn) {
            connectBtn.addEventListener('click', () => this.connectWallet());
        }

        const disconnectBtn = document.getElementById('disconnectWallet');
        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', () => this.disconnectWallet());
        }

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            searchInput.addEventListener('input', 
                UTILS.debounce((e) => this.handleSearch(e.target.value), CONFIG.UI.SEARCH_DEBOUNCE)
            );
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.handleSearch(searchInput.value));
        }

        // Filter controls
        const categoryFilter = document.getElementById('categoryFilter');
        const priceFilter = document.getElementById('priceFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.handleFilterChange());
        }
        
        if (priceFilter) {
            priceFilter.addEventListener('change', () => this.handleFilterChange());
        }

        // Load more button
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreNFTs());
        }

        // Create form
        const createForm = document.getElementById('createForm');
        if (createForm) {
            createForm.addEventListener('submit', (e) => this.handleCreateSubmit(e));
        }

        // File upload
        const fileInput = document.getElementById('nftImage');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Modal close on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Initialize modals
    initializeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            this.modals[modal.id] = {
                element: modal,
                isOpen: false
            };
        });
    }

    // Setup scroll effects
    setupScrollEffects() {
        // Navbar background on scroll
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(0, 0, 0, 0.98)';
            } else {
                navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            }
        });

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.neon-grid');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }

    // Navigation methods
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = section.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        activeLink.classList.add('active');
    }

    // Wallet connection methods
    async connectWallet() {
        try {
            this.showLoading('Connecting wallet...');
            await window.web3Manager.connectWallet();
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showNotification(error.message, 'error');
        }
    }

    async disconnectWallet() {
        try {
            await window.web3Manager.disconnectWallet();
            this.showNotification('Wallet disconnected', 'info');
        } catch (error) {
            this.showNotification('Error disconnecting wallet', 'error');
        }
    }

    // Search and filter methods
    handleSearch(query) {
        console.log('Searching for:', query);
        if (window.marketplace) {
            window.marketplace.searchNFTs(query);
        }
    }

    handleFilterChange() {
        const category = document.getElementById('categoryFilter').value;
        const price = document.getElementById('priceFilter').value;
        
        console.log('Applying filters:', { category, price });
        
        if (window.marketplace) {
            window.marketplace.applyFilters({ category, price });
        }
    }

    // NFT Grid methods
    updateNFTGrid(nfts) {
        const grid = document.getElementById('nftGrid');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        if (!nfts || nfts.length === 0) {
            grid.innerHTML = '<div class="no-results"><h3>No NFTs found</h3><p>Try adjusting your search or filters</p></div>';
            return;
        }

        grid.innerHTML = nfts.map(nft => this.createNFTCard(nft)).join('');
        
        // Add click listeners to NFT cards
        grid.querySelectorAll('.nft-card').forEach(card => {
            card.addEventListener('click', () => {
                const nftId = card.dataset.nftId;
                this.openNFTModal(nftId);
            });
        });
    }

    createNFTCard(nft) {
        const priceUSD = nft.price ? (parseFloat(nft.price) * 2000).toFixed(2) : '0.00'; // Mock USD conversion
        
        return `
            <div class="nft-card" data-nft-id="${nft.id}">
                <img src="${nft.image || 'assets/images/placeholder.jpg'}" alt="${nft.name}" class="nft-image" loading="lazy">
                <div class="nft-info">
                    <h3 class="nft-title">${nft.name}</h3>
                    <p class="nft-creator">by ${UTILS.formatAddress(nft.creator)}</p>
                    <div class="nft-price">
                        <div>
                            <span class="price-value">${UTILS.formatPrice(nft.price)} ETH</span>
                            <span class="price-usd">$${priceUSD}</span>
                        </div>
                        <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); ui.buyNFT('${nft.id}')">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    loadMoreNFTs() {
        this.currentPage++;
        if (window.marketplace) {
            window.marketplace.loadNFTs(this.currentPage);
        }
    }

    // Collections methods
    updateCollectionsGrid(collections) {
        const grid = document.getElementById('collectionsGrid');
        
        if (!collections || collections.length === 0) {
            grid.innerHTML = '<div class="no-results"><h3>No collections found</h3></div>';
            return;
        }

        grid.innerHTML = collections.map(collection => this.createCollectionCard(collection)).join('');
    }

    createCollectionCard(collection) {
        return `
            <div class="collection-card" data-collection-id="${collection.id}">
                <img src="${collection.banner || 'assets/images/collection-banner.jpg'}" alt="${collection.name}" class="collection-banner">
                <div class="collection-info">
                    <img src="${collection.avatar || 'assets/images/collection-avatar.jpg'}" alt="${collection.name}" class="collection-avatar">
                    <h3 class="collection-name">${collection.name}</h3>
                    <p class="collection-description">${collection.description || 'No description available'}</p>
                    <div class="collection-stats">
                        <span>${collection.itemCount || 0} items</span>
                        <span>${UTILS.formatPrice(collection.floorPrice)} ETH floor</span>
                        <span>${UTILS.formatNumber(collection.volume)} ETH volume</span>
                    </div>
                </div>
            </div>
        `;
    }

    // Modal methods
    openModal(modalId) {
        const modal = this.modals[modalId];
        if (modal) {
            modal.element.classList.add('active');
            modal.element.style.display = 'flex';
            modal.isOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = this.modals[modalId];
        if (modal) {
            modal.element.classList.remove('active');
            modal.element.style.display = 'none';
            modal.isOpen = false;
            document.body.style.overflow = 'auto';
        }
    }

    closeAllModals() {
        Object.keys(this.modals).forEach(modalId => {
            this.closeModal(modalId);
        });
    }

    // Create NFT modal methods
    openCreateModal(type) {
        const modal = document.getElementById('createModal');
        const title = document.getElementById('createModalTitle');
        const supplyGroup = document.getElementById('supplyGroup');
        const priceGroup = document.getElementById('priceGroup');
        
        switch (type) {
            case 'erc721':
                title.textContent = 'Create Single NFT (ERC-721)';
                supplyGroup.style.display = 'none';
                priceGroup.style.display = 'block';
                break;
            case 'erc1155':
                title.textContent = 'Create Multi-Edition NFT (ERC-1155)';
                supplyGroup.style.display = 'block';
                priceGroup.style.display = 'block';
                break;
            case 'lazy':
                title.textContent = 'Create Lazy Mint NFT';
                supplyGroup.style.display = 'none';
                priceGroup.style.display = 'block';
                break;
            case 'erc20':
                title.textContent = 'Create ERC-20 Token';
                supplyGroup.style.display = 'block';
                priceGroup.style.display = 'none';
                break;
        }
        
        modal.dataset.createType = type;
        this.openModal('createModal');
    }

    openNFTModal(nftId) {
        // Load NFT details and open modal
        if (window.marketplace) {
            window.marketplace.getNFTDetails(nftId).then(nft => {
                this.displayNFTDetails(nft);
                this.openModal('nftModal');
            });
        }
    }

    displayNFTDetails(nft) {
        const content = document.getElementById('nftDetailContent');
        const title = document.getElementById('nftModalTitle');
        
        title.textContent = nft.name;
        
        content.innerHTML = `
            <div class="nft-detail-grid">
                <div class="nft-detail-image">
                    <img src="${nft.image}" alt="${nft.name}">
                </div>
                <div class="nft-detail-info">
                    <h2>${nft.name}</h2>
                    <p class="nft-detail-creator">Created by ${UTILS.formatAddress(nft.creator)}</p>
                    <div class="nft-detail-description">
                        <h4>Description</h4>
                        <p>${nft.description || 'No description available'}</p>
                    </div>
                    <div class="nft-detail-properties">
                        <h4>Properties</h4>
                        <div class="properties-grid">
                            ${nft.attributes ? nft.attributes.map(attr => `
                                <div class="property-item">
                                    <span class="property-type">${attr.trait_type}</span>
                                    <span class="property-value">${attr.value}</span>
                                </div>
                            `).join('') : '<p>No properties</p>'}
                        </div>
                    </div>
                    <div class="nft-detail-price">
                        <h4>Current Price</h4>
                        <div class="price-display">
                            <span class="price-eth">${UTILS.formatPrice(nft.price)} ETH</span>
                            <span class="price-usd">$${(parseFloat(nft.price) * 2000).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="nft-detail-actions">
                        <button class="btn btn-primary btn-large" onclick="ui.buyNFT('${nft.id}')">
                            Buy Now
                        </button>
                        <button class="btn btn-outline btn-large" onclick="ui.placeBid('${nft.id}')">
                            Place Bid
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Form handling
    async handleCreateSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const createType = document.getElementById('createModal').dataset.createType;
        
        try {
            this.showLoading('Creating NFT...');
            
            const nftData = {
                name: formData.get('nftName'),
                description: formData.get('nftDescription'),
                image: formData.get('nftImage'),
                price: formData.get('nftPrice'),
                royalty: formData.get('nftRoyalty'),
                supply: formData.get('nftSupply') || 1
            };
            
            // Validate data
            if (!nftData.name || !nftData.image) {
                throw new Error('Name and image are required');
            }
            
            // Create NFT based on type
            let result;
            switch (createType) {
                case 'erc721':
                    result = await window.nftManager.createERC721(nftData);
                    break;
                case 'erc1155':
                    result = await window.nftManager.createERC1155(nftData);
                    break;
                case 'lazy':
                    result = await window.nftManager.createLazyNFT(nftData);
                    break;
                case 'erc20':
                    result = await window.nftManager.createERC20(nftData);
                    break;
                default:
                    throw new Error('Invalid creation type');
            }
            
            this.hideLoading();
            this.closeModal('createModal');
            this.showNotification('NFT created successfully!', 'success');
            
            // Reset form
            e.target.reset();
            
            // Refresh NFT grid
            if (window.marketplace) {
                window.marketplace.loadNFTs();
            }
            
        } catch (error) {
            this.hideLoading();
            this.showNotification(error.message, 'error');
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file
        if (!UTILS.isValidFileType(file, CONFIG.MARKETPLACE.SUPPORTED_IMAGE_TYPES)) {
            this.showNotification('Invalid file type. Please select an image.', 'error');
            e.target.value = '';
            return;
        }
        
        if (!UTILS.isValidFileSize(file, CONFIG.MARKETPLACE.MAX_FILE_SIZE)) {
            this.showNotification('File too large. Maximum size is 50MB.', 'error');
            e.target.value = '';
            return;
        }
        
        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.querySelector('.upload-placeholder');
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; border-radius: 8px;">`;
        };
        reader.readAsDataURL(file);
    }

    // Transaction methods
    async buyNFT(nftId) {
        try {
            if (!window.web3Manager.isWalletConnected()) {
                this.showNotification('Please connect your wallet first', 'warning');
                return;
            }
            
            this.showLoading('Processing purchase...');
            
            if (window.marketplace) {
                await window.marketplace.buyNFT(nftId);
                this.showNotification('NFT purchased successfully!', 'success');
            }
            
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showNotification(error.message, 'error');
        }
    }

    async placeBid(nftId) {
        try {
            if (!window.web3Manager.isWalletConnected()) {
                this.showNotification('Please connect your wallet first', 'warning');
                return;
            }
            
            const bidAmount = prompt('Enter your bid amount (ETH):');
            if (!bidAmount) return;
            
            this.showLoading('Placing bid...');
            
            if (window.marketplace) {
                await window.marketplace.placeBid(nftId, bidAmount);
                this.showNotification('Bid placed successfully!', 'success');
            }
            
            this.hideLoading();
        } catch (error) {
            this.hideLoading();
            this.showNotification(error.message, 'error');
        }
    }

    // Loading states
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = document.getElementById('loadingMessage');
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        if (overlay) {
            overlay.style.display = 'flex';
        }
        
        this.isLoading = true;
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
        this.isLoading = false;
    }

    // Notification system
    showNotification(message, type = 'info', duration = CONFIG.UI.NOTIFICATION_TIMEOUT) {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const id = UTILS.generateId();
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <p>${message}</p>
            <button class="notification-close" onclick="ui.closeNotification('${id}')">&times;</button>
        `;
        notification.id = id;
        
        container.appendChild(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            this.closeNotification(id);
        }, duration);
        
        this.notifications.push({ id, element: notification });
    }

    closeNotification(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.remove();
            this.notifications = this.notifications.filter(n => n.id !== id);
        }
    }

    // Statistics updates
    updateStats(stats) {
        const elements = {
            totalNFTs: document.getElementById('totalNFTs'),
            totalVolume: document.getElementById('totalVolume'),
            totalUsers: document.getElementById('totalUsers'),
            totalCollections: document.getElementById('totalCollections')
        };
        
        Object.keys(elements).forEach(key => {
            if (elements[key] && stats[key] !== undefined) {
                elements[key].textContent = UTILS.formatNumber(stats[key]);
                if (key === 'totalVolume') {
                    elements[key].textContent += ' ETH';
                }
            }
        });
    }

    // Profile methods
    updateProfile(profileData) {
        const profileContent = document.getElementById('profileContent');
        
        if (!profileData || !window.web3Manager.isWalletConnected()) {
            profileContent.innerHTML = `
                <div class="connect-prompt">
                    <h2>Connect Your Wallet</h2>
                    <p>Connect your wallet to view your profile, NFTs, and trading history</p>
                    <button class="btn btn-primary" onclick="ui.connectWallet()">Connect Wallet</button>
                </div>
            `;
            return;
        }
        
        profileContent.innerHTML = `
            <div class="profile-header">
                <img src="${profileData.avatar || 'assets/images/default-avatar.jpg'}" alt="Profile" class="profile-avatar">
                <div class="profile-info">
                    <h2>${profileData.username || UTILS.formatAddress(profileData.address)}</h2>
                    <p class="profile-address">${profileData.address}</p>
                    <div class="profile-stats">
                        <div class="profile-stat">
                            <span class="profile-stat-value">${profileData.nftCount || 0}</span>
                            <span class="profile-stat-label">NFTs Owned</span>
                        </div>
                        <div class="profile-stat">
                            <span class="profile-stat-value">${profileData.createdCount || 0}</span>
                            <span class="profile-stat-label">Created</span>
                        </div>
                        <div class="profile-stat">
                            <span class="profile-stat-value">${UTILS.formatPrice(profileData.totalVolume)} ETH</span>
                            <span class="profile-stat-label">Volume</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-tabs">
                <button class="profile-tab active" onclick="ui.showProfileTab('owned')">Owned</button>
                <button class="profile-tab" onclick="ui.showProfileTab('created')">Created</button>
                <button class="profile-tab" onclick="ui.showProfileTab('activity')">Activity</button>
            </div>
            
            <div class="profile-content" id="profileTabContent">
                <!-- Tab content will be loaded here -->
            </div>
        `;
    }

    showProfileTab(tab) {
        // Update active tab
        document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');
        
        // Load tab content
        if (window.profile) {
            window.profile.loadTabContent(tab);
        }
    }
}

// Initialize UI Manager
window.ui = new UIManager();

// Global helper functions
function scrollToSection(sectionId) {
    window.ui.scrollToSection(sectionId);
}

function openCreateModal(type) {
    window.ui.openCreateModal(type);
}

function closeModal(modalId) {
    window.ui.closeModal(modalId);
}

console.log('🎨 UI Manager loaded');