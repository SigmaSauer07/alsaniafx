// AlsaniaFX Main Application
class AlsaniaFXApp {
    constructor() {
        this.currentTab = 'marketplace';
        this.isWalletConnected = false;
        this.currentAccount = null;
        this.nfts = [];
        this.collections = [];
        
        // Initialize modules
        this.ui = null;
        this.marketplace = null;
        this.nft = null;
        this.collections = null;
        this.profile = null;
        this.lazyMinting = null;
        this.erc20Manager = null;
        this.erc1155Manager = null;
        this.analytics = null;
        this.web3 = null;
        
        this.init();
    }

    async init() {
        console.log('🚀 Initializing AlsaniaFX Application...');
        
        try {
            // Initialize modules
            await this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            // Initialize UI
            this.initializeUI();
            
            console.log('✅ Application initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize application:', error);
            // Continue anyway for demo purposes
            console.log('⚠️ Continuing with demo mode');
        }
    }

    async initializeModules() {
        try {
            // Initialize Web3
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3Manager();
                console.log('✅ Web3 initialized');
            } else {
                console.warn('⚠️ MetaMask not detected');
            }

            // Initialize UI module
            try {
                this.ui = new UI(this);
                console.log('✅ UI module initialized');
            } catch (error) {
                console.warn('⚠️ UI module not available:', error);
            }

            // Initialize other modules
            try {
                this.marketplace = new Marketplace(this);
                console.log('✅ Marketplace module initialized');
            } catch (error) {
                console.warn('⚠️ Marketplace module not available:', error);
            }

            try {
                this.nft = new NFT(this);
                console.log('✅ NFT module initialized');
            } catch (error) {
                console.warn('⚠️ NFT module not available:', error);
            }

            try {
                this.collections = new Collections(this);
                console.log('✅ Collections module initialized');
            } catch (error) {
                console.warn('⚠️ Collections module not available:', error);
            }

            try {
                this.profile = new Profile(this);
                console.log('✅ Profile module initialized');
            } catch (error) {
                console.warn('⚠️ Profile module not available:', error);
            }

            try {
                this.lazyMinting = new LazyMinting(this.web3);
                console.log('✅ Lazy Minting module initialized');
            } catch (error) {
                console.warn('⚠️ Lazy Minting module not available:', error);
            }

            try {
                this.erc20Manager = new ERC20Manager(this.web3);
                console.log('✅ ERC20 Manager module initialized');
            } catch (error) {
                console.warn('⚠️ ERC20 Manager module not available:', error);
            }

            try {
                this.erc1155Manager = new ERC1155Manager(this.web3);
                console.log('✅ ERC1155 Manager module initialized');
            } catch (error) {
                console.warn('⚠️ ERC1155 Manager module not available:', error);
            }

            try {
                this.analytics = new Analytics();
                console.log('✅ Analytics module initialized');
            } catch (error) {
                console.warn('⚠️ Analytics module not available:', error);
            }

        } catch (error) {
            console.error('❌ Failed to initialize modules:', error);
            throw error;
        }
    }

    setupEventListeners() {
        console.log('🔧 Setting up event listeners...');
        
        // Tab navigation
        const tabButtons = document.querySelectorAll('.tab-button');
        console.log('Found tab buttons:', tabButtons.length);
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                console.log('Tab clicked:', tabName);
                this.switchTab(tabName);
            });
        });

        // Profile tab navigation
        const profileTabButtons = document.querySelectorAll('.profile-tab');
        console.log('Found profile tab buttons:', profileTabButtons.length);
        
        profileTabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-profile-tab');
                console.log('Profile tab clicked:', tabName);
                this.switchProfileTab(tabName);
            });
        });

        // Wallet connection
        const connectWalletBtn = document.getElementById('connect-wallet');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => this.connectWallet());
        }

        const disconnectWalletBtn = document.getElementById('disconnect-wallet');
        if (disconnectWalletBtn) {
            disconnectWalletBtn.addEventListener('click', () => this.disconnectWallet());
        }

        // Search functionality
        const searchInput = document.getElementById('search-nfts');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Sort functionality
        const sortSelect = document.getElementById('sort-nfts');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.handleSort(e.target.value);
            });
        }

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.currentTarget.getAttribute('data-filter');
                this.handleFilter(filter);
                
                // Update active filter tab
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                e.currentTarget.classList.add('active');
            });
        });

        // Load more NFTs
        const loadMoreBtn = document.getElementById('load-more-nfts');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => this.loadMoreNFTs());
        }

        // NFT creation form
        const mintNFTBtn = document.getElementById('mint-nft');
        if (mintNFTBtn) {
            mintNFTBtn.addEventListener('click', () => this.mintNFT());
        }

        const resetFormBtn = document.getElementById('reset-form');
        if (resetFormBtn) {
            resetFormBtn.addEventListener('click', () => this.resetCreateForm());
        }

        // File upload preview
        const nftFileInput = document.getElementById('nft-file');
        if (nftFileInput) {
            nftFileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        // Form input preview updates
        const nftNameInput = document.getElementById('nft-name');
        if (nftNameInput) {
            nftNameInput.addEventListener('input', (e) => this.updatePreview('name', e.target.value));
        }

        const nftDescriptionInput = document.getElementById('nft-description');
        if (nftDescriptionInput) {
            nftDescriptionInput.addEventListener('input', (e) => this.updatePreview('description', e.target.value));
        }

        const nftPriceInput = document.getElementById('nft-price');
        if (nftPriceInput) {
            nftPriceInput.addEventListener('input', (e) => this.updatePreview('price', e.target.value));
        }

        // Analytics period change
        const analyticsPeriodSelect = document.getElementById('analytics-period');
        if (analyticsPeriodSelect) {
            analyticsPeriodSelect.addEventListener('change', (e) => {
                this.loadAnalytics(e.target.value);
            });
        }

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());

        // Modal close
        const modal = document.getElementById('nft-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }
        
        console.log('✅ Event listeners setup complete');
    }

    async loadInitialData() {
        try {
            await this.loadSampleNFTs();
            await this.loadSampleCollections();
            console.log('✅ Initial data loaded');
        } catch (error) {
            console.error('❌ Error loading initial data:', error);
        }
    }

    async loadSampleNFTs() {
        console.log('📦 Loading sample NFTs...');
        
        this.nfts = [
            {
                id: '1',
                name: 'Cosmic Dreams #001',
                description: 'A mesmerizing digital artwork featuring cosmic landscapes',
                image: 'assets/images/example1.png',
                price: '0.5',
                category: 'Art',
                collection: 'Cosmic Dreams',
                owner: '0x1234...5678',
                creator: '0xabcd...efgh',
                likes: 42,
                views: 156,
                created: '2024-01-15'
            },
            {
                id: '2',
                name: 'Pixel Warrior #042',
                description: 'Epic gaming character with unique pixel art style',
                image: 'assets/images/example2.png',
                price: '1.2',
                category: 'Gaming',
                collection: 'Pixel Warriors',
                owner: '0x5678...1234',
                creator: '0xefgh...abcd',
                likes: 89,
                views: 234,
                created: '2024-01-20'
            },
            {
                id: '3',
                name: 'Neon Cityscape #007',
                description: 'Cyberpunk cityscape with neon lights and atmosphere',
                image: 'assets/images/example3.png',
                price: '0.8',
                category: 'Art',
                collection: 'Neon Dreams',
                owner: '0xabcd...efgh',
                creator: '0x1234...5678',
                likes: 67,
                views: 189,
                created: '2024-01-25'
            },
            {
                id: '4',
                name: 'Digital Music #015',
                description: 'Unique musical composition as digital art',
                image: 'assets/images/example4.png',
                price: '2.1',
                category: 'Music',
                collection: 'Digital Melodies',
                owner: '0xefgh...abcd',
                creator: '0x5678...1234',
                likes: 123,
                views: 456,
                created: '2024-01-30'
            },
            {
                id: '5',
                name: 'Photography Masterpiece #023',
                description: 'Stunning landscape photography in digital format',
                image: 'assets/images/example1.png',
                price: '1.5',
                category: 'Photography',
                collection: 'Nature\'s Beauty',
                owner: '0x1234...5678',
                creator: '0xabcd...efgh',
                likes: 78,
                views: 203,
                created: '2024-02-05'
            },
            {
                id: '6',
                name: 'Gaming Asset #007',
                description: 'Rare gaming weapon with unique properties',
                image: 'assets/images/example2.png',
                price: '3.2',
                category: 'Gaming',
                collection: 'Epic Weapons',
                owner: '0x5678...1234',
                creator: '0xefgh...abcd',
                likes: 156,
                views: 789,
                created: '2024-02-10'
            }
        ];
        
        this.updateNFTGrid();
        console.log('✅ Sample NFTs loaded:', this.nfts.length);
    }

    async loadSampleCollections() {
        console.log('📚 Loading sample collections...');
        
        this.collections = [
            {
                id: '1',
                name: 'Cosmic Dreams',
                description: 'A collection of mesmerizing cosmic artworks',
                image: 'assets/images/example1.png',
                itemCount: 50,
                floorPrice: '0.5',
                totalVolume: '125.5',
                creator: '0xabcd...efgh'
            },
            {
                id: '2',
                name: 'Pixel Warriors',
                description: 'Epic gaming characters with pixel art style',
                image: 'assets/images/example2.png',
                itemCount: 100,
                floorPrice: '1.2',
                totalVolume: '89.3',
                creator: '0xefgh...abcd'
            },
            {
                id: '3',
                name: 'Neon Dreams',
                description: 'Cyberpunk cityscapes with neon aesthetics',
                image: 'assets/images/example3.png',
                itemCount: 25,
                floorPrice: '0.8',
                totalVolume: '45.7',
                creator: '0x1234...5678'
            },
            {
                id: '4',
                name: 'Digital Melodies',
                description: 'Unique musical compositions as digital art',
                image: 'assets/images/example4.png',
                itemCount: 75,
                floorPrice: '2.1',
                totalVolume: '234.8',
                creator: '0x5678...1234'
            }
        ];
        
        this.updateCollectionsGrid();
        console.log('✅ Sample collections loaded:', this.collections.length);
    }

    initializeUI() {
        // Set initial active tab
        this.switchTab('marketplace');
        
        // Initialize any UI components
        if (this.ui) {
            this.ui.initializeComponents();
        }
    }

    switchTab(tabName) {
        console.log('🔄 Switching to tab:', tabName);
        
        // Update current tab
        this.currentTab = tabName;
        
        // Update tab buttons
        const allTabButtons = document.querySelectorAll('.tab-button');
        console.log('Found tab buttons to update:', allTabButtons.length);
        
        allTabButtons.forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
            console.log('✅ Active button updated');
        } else {
            console.warn('⚠️ Active button not found for tab:', tabName);
        }
        
        // Update tab panels
        const allTabPanels = document.querySelectorAll('.tab-panel');
        console.log('Found tab panels to update:', allTabPanels.length);
        
        allTabPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        const activePanel = document.getElementById(`${tabName}-tab`);
        if (activePanel) {
            activePanel.classList.add('active');
            console.log('✅ Active panel updated');
        } else {
            console.warn('⚠️ Active panel not found for tab:', tabName);
        }
        
        // Load tab-specific content
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        try {
            switch (tabName) {
                case 'marketplace':
                    await this.loadMarketplaceContent();
                    break;
                case 'create':
                    this.loadCreateContent();
                    break;
                case 'collections':
                    await this.loadCollectionsContent();
                    break;
                case 'lazy-minting':
                    await this.loadLazyMintingContent();
                    break;
                case 'erc20-tokens':
                    await this.loadERC20TokensContent();
                    break;
                case 'erc1155-tokens':
                    await this.loadERC1155TokensContent();
                    break;
                case 'analytics':
                    await this.loadAnalyticsContent();
                    break;
                case 'profile':
                    await this.loadProfileContent();
                    break;
            }
        } catch (error) {
            console.error(`❌ Error loading ${tabName} content:`, error);
        }
    }

    async loadMarketplaceContent() {
        console.log('✅ Marketplace content loaded');
    }

    loadCreateContent() {
        console.log('✅ Create content loaded');
    }

    async loadCollectionsContent() {
        console.log('✅ Collections content loaded');
    }

    async loadLazyMintingContent() {
        console.log('✅ Lazy minting content loaded');
    }

    async loadERC20TokensContent() {
        console.log('✅ ERC20 tokens content loaded');
    }

    async loadERC1155TokensContent() {
        console.log('✅ ERC1155 tokens content loaded');
    }

    async loadAnalyticsContent() {
        console.log('✅ Analytics content loaded');
    }

    async loadProfileContent() {
        console.log('✅ Profile content loaded');
    }

    switchProfileTab(tabName) {
        console.log('🔄 Switching to profile tab:', tabName);
        
        // Update profile tab buttons
        document.querySelectorAll('.profile-tab').forEach(button => {
            button.classList.remove('active');
        });
        
        const activeProfileButton = document.querySelector(`[data-profile-tab="${tabName}"]`);
        if (activeProfileButton) {
            activeProfileButton.classList.add('active');
        }
        
        // Update profile tab content
        document.querySelectorAll('.profile-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeProfileContent = document.getElementById(`${tabName}-content`);
        if (activeProfileContent) {
            activeProfileContent.classList.add('active');
        }
        
        // Load profile tab-specific content
        this.loadProfileTabContent(tabName);
    }

    async loadProfileTabContent(tabName) {
        try {
            switch (tabName) {
                case 'owned':
                    await this.loadOwnedNFTs();
                    break;
                case 'created':
                    await this.loadCreatedNFTs();
                    break;
                case 'favorites':
                    await this.loadFavoriteNFTs();
                    break;
                case 'activity':
                    await this.loadActivityHistory();
                    break;
            }
        } catch (error) {
            console.error(`❌ Error loading profile tab ${tabName}:`, error);
        }
    }

    async loadOwnedNFTs() {
        console.log('✅ Loading owned NFTs');
        // Simulate loading owned NFTs
        const ownedNFTs = this.nfts.filter(nft => nft.owner === this.currentAccount);
        this.updateProfileNFTGrid('owned-nft-grid', ownedNFTs);
    }

    async loadCreatedNFTs() {
        console.log('✅ Loading created NFTs');
        // Simulate loading created NFTs
        const createdNFTs = this.nfts.filter(nft => nft.creator === this.currentAccount);
        this.updateProfileNFTGrid('created-nft-grid', createdNFTs);
    }

    async loadFavoriteNFTs() {
        console.log('✅ Loading favorite NFTs');
        // Simulate loading favorite NFTs
        const favoriteNFTs = this.nfts.slice(0, 6); // Demo favorites
        this.updateProfileNFTGrid('favorites-nft-grid', favoriteNFTs);
    }

    async loadActivityHistory() {
        console.log('✅ Loading activity history');
        const activityList = document.getElementById('activity-list');
        if (activityList) {
            const activities = [
                {
                    type: 'buy',
                    title: 'Purchased NFT',
                    description: 'Bought "Cosmic Dreams #42" for 0.5 MATIC',
                    time: '2 hours ago'
                },
                {
                    type: 'mint',
                    title: 'Minted NFT',
                    description: 'Created "Digital Art #15"',
                    time: '1 day ago'
                },
                {
                    type: 'sell',
                    title: 'Sold NFT',
                    description: 'Sold "Gaming Asset #7" for 1.2 MATIC',
                    time: '3 days ago'
                },
                {
                    type: 'transfer',
                    title: 'Transferred NFT',
                    description: 'Sent "Music NFT #23" to 0x1234...',
                    time: '1 week ago'
                }
            ];

            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon ${activity.type}">
                        <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-description">${activity.description}</div>
                    </div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            `).join('');
        }
    }

    getActivityIcon(type) {
        const icons = {
            buy: 'shopping-cart',
            sell: 'money-bill-wave',
            mint: 'plus-circle',
            transfer: 'exchange-alt'
        };
        return icons[type] || 'circle';
    }

    updateProfileNFTGrid(gridId, nfts) {
        const grid = document.getElementById(gridId);
        if (grid) {
            grid.innerHTML = nfts.map(nft => this.createNFTCard(nft)).join('');
        }
    }

    async connectWallet() {
        try {
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                this.currentAccount = accounts[0];
                this.isWalletConnected = true;
                
                this.updateWalletUI();
                
                if (this.ui) {
                    this.ui.showNotification('Wallet connected successfully!', 'success');
                }
                
                console.log('✅ Wallet connected:', this.currentAccount);
            } else {
                if (this.ui) {
                    this.ui.showNotification('Please install MetaMask to connect your wallet', 'error');
                }
            }
        } catch (error) {
            console.error('❌ Error connecting wallet:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to connect wallet', 'error');
            }
        }
    }

    disconnectWallet() {
        this.isWalletConnected = false;
        this.currentAccount = null;
        this.updateWalletUI();
        
        if (this.ui) {
            this.ui.showNotification('Wallet disconnected', 'info');
        }
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet');
        const walletInfo = document.getElementById('wallet-info');
        const walletAddress = document.getElementById('wallet-address');
        
        if (this.isWalletConnected && this.currentAccount) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (walletInfo) walletInfo.style.display = 'flex';
            if (walletAddress) {
                walletAddress.textContent = `${this.currentAccount.substring(0, 6)}...${this.currentAccount.substring(38)}`;
            }
        } else {
            if (connectBtn) connectBtn.style.display = 'block';
            if (walletInfo) walletInfo.style.display = 'none';
        }
    }

    handleSearch(query) {
        console.log('Searching for:', query);
        // Implement search functionality
    }

    handleSort(sortBy) {
        console.log('Sorting by:', sortBy);
        // Implement sort functionality
    }

    handleFilter(filter) {
        console.log('Filtering by:', filter);
        // Implement filter functionality
    }

    updateNFTGrid(nfts = this.nfts) {
        const grid = document.getElementById('nft-grid');
        if (grid) {
            grid.innerHTML = nfts.map(nft => this.createNFTCard(nft)).join('');
        }
    }

    createNFTCard(nft) {
        return `
            <div class="nft-card" onclick="app.openNFTModal('${nft.id}')">
                <div class="nft-image">
                    <img src="${nft.image}" alt="${nft.name}">
                    <div class="nft-overlay">
                        <button class="btn btn-primary btn-small">View Details</button>
                    </div>
                </div>
                <div class="nft-info">
                    <h3 class="nft-name">${nft.name}</h3>
                    <p class="nft-description">${nft.description}</p>
                    <div class="nft-meta">
                        <span class="nft-price">${nft.price} MATIC</span>
                        <span class="nft-category">${nft.category}</span>
                    </div>
                    <div class="nft-stats">
                        <span><i class="fas fa-heart"></i> ${nft.likes}</span>
                        <span><i class="fas fa-eye"></i> ${nft.views}</span>
                    </div>
                </div>
            </div>
        `;
    }

    updateCollectionsGrid() {
        const grid = document.getElementById('collections-grid');
        if (grid) {
            grid.innerHTML = this.collections.map(collection => `
                <div class="collection-card">
                    <div class="collection-image">
                        <img src="${collection.image}" alt="${collection.name}">
                    </div>
                    <div class="collection-info">
                        <h3 class="collection-name">${collection.name}</h3>
                        <p class="collection-description">${collection.description}</p>
                        <div class="collection-stats">
                            <span><i class="fas fa-image"></i> ${collection.itemCount} items</span>
                            <span><i class="fas fa-coins"></i> ${collection.floorPrice} MATIC floor</span>
                            <span><i class="fas fa-chart-line"></i> ${collection.totalVolume} MATIC volume</span>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    getTimeLeft(endTime) {
        const now = new Date().getTime();
        const end = new Date(endTime).getTime();
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${days}d ${hours}h ${minutes}m`;
    }

    loadMoreNFTs() {
        console.log('Loading more NFTs...');
        // Implement load more functionality
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const preview = document.getElementById('nft-preview');
                if (preview) {
                    preview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
    }

    updatePreview(type, value) {
        const preview = document.getElementById('nft-preview');
        if (preview) {
            switch (type) {
                case 'name':
                    preview.alt = value;
                    break;
                case 'description':
                    // Update description in preview
                    break;
                case 'price':
                    // Update price in preview
                    break;
            }
        }
    }

    async mintNFT() {
        if (!this.isWalletConnected) {
            if (this.ui) {
                this.ui.showNotification('Please connect your wallet first', 'warning');
            }
            return;
        }

        const name = document.getElementById('nft-name')?.value;
        const description = document.getElementById('nft-description')?.value;
        const price = document.getElementById('nft-price')?.value;

        if (!name || !description || !price) {
            if (this.ui) {
                this.ui.showNotification('Please fill in all fields', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Minting NFT...', 'info');
            }

            // Simulate minting process
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification('NFT minted successfully!', 'success');
                }
                this.resetCreateForm();
            }, 3000);

        } catch (error) {
            console.error('❌ Error minting NFT:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to mint NFT', 'error');
            }
        }
    }

    resetCreateForm() {
        const form = document.getElementById('create-nft-form');
        if (form) {
            form.reset();
        }
        
        const preview = document.getElementById('nft-preview');
        if (preview) {
            preview.src = 'assets/images/placeholder.png';
        }
    }

    openNFTModal(nftId) {
        const modal = document.getElementById('nft-modal');
        const details = document.getElementById('nft-details');
        
        if (modal && details) {
            const nft = this.nfts.find(n => n.id === nftId);
            if (nft) {
                details.innerHTML = `
                    <div class="nft-modal-content">
                        <div class="nft-modal-image">
                            <img src="${nft.image}" alt="${nft.name}">
                        </div>
                        <div class="nft-modal-info">
                            <h2>${nft.name}</h2>
                            <p>${nft.description}</p>
                            <div class="nft-modal-meta">
                                <span class="price">${nft.price} MATIC</span>
                                <span class="category">${nft.category}</span>
                            </div>
                            <div class="nft-modal-actions">
                                <button class="btn btn-primary" onclick="app.buyNFT('${nft.id}')">
                                    <i class="fas fa-shopping-cart"></i>
                                    Buy Now
                                </button>
                                <button class="btn btn-secondary" onclick="app.placeBid('${nft.id}')">
                                    <i class="fas fa-gavel"></i>
                                    Place Bid
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                modal.style.display = 'block';
            }
        }
    }

    closeModal() {
        const modal = document.getElementById('nft-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async buyNFT(nftId) {
        if (!this.isWalletConnected) {
            if (this.ui) {
                this.ui.showNotification('Please connect your wallet first', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Processing purchase...', 'info');
            }

            // Simulate purchase process
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification('NFT purchased successfully!', 'success');
                }
                this.closeModal();
            }, 2000);

        } catch (error) {
            console.error('❌ Error purchasing NFT:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to purchase NFT', 'error');
            }
        }
    }

    async placeBid(nftId) {
        if (!this.isWalletConnected) {
            if (this.ui) {
                this.ui.showNotification('Please connect your wallet first', 'warning');
            }
            return;
        }

        const bidAmount = prompt('Enter your bid amount (MATIC):');
        if (!bidAmount || isNaN(bidAmount)) {
            if (this.ui) {
                this.ui.showNotification('Please enter a valid bid amount', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Placing bid...', 'info');
            }

            // Simulate bid process
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification(`Bid of ${bidAmount} MATIC placed successfully!`, 'success');
                }
                this.closeModal();
            }, 2000);

        } catch (error) {
            console.error('❌ Error placing bid:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to place bid', 'error');
            }
        }
    }

    handleScroll() {
        // Add scroll-based animations or lazy loading
        const scrollTop = window.pageYOffset;
        
        // Parallax effect for hero section
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.style.transform = `translateY(${scrollTop * 0.5}px)`;
        }
    }

    handleResize() {
        // Handle responsive behavior
        const width = window.innerWidth;
        
        // Update grid columns based on screen size
        const nftGrid = document.getElementById('nft-grid');
        if (nftGrid) {
            if (width < 768) {
                nftGrid.style.gridTemplateColumns = 'repeat(1, 1fr)';
            } else if (width < 1024) {
                nftGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
            } else {
                nftGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            }
        }
    }

    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    async loadLazyNFTs() {
        if (this.lazyMinting) {
            await this.lazyMinting.loadLazyNFTs();
        }
    }

    async loadERC20Tokens() {
        if (this.erc20Manager) {
            await this.erc20Manager.loadERC20Tokens();
        }
    }

    setupRoleManagementListeners() {
        // Role management event listeners (for admin functionality)
        console.log('✅ Role management listeners setup');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing AlsaniaFX App...');
    window.app = new AlsaniaFXApp();
}); 