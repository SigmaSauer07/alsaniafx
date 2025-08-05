// AlsaniaFX Main Application
// Coordinates all modules and handles application lifecycle

class AlsaniaFXApp {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.eventListeners = [];
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing AlsaniaFX...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.start());
            } else {
                await this.start();
            }
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.showErrorState(error);
        }
    }

    async start() {
        try {
            // Initialize core modules
            await this.initializeModules();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Setup periodic updates
            this.setupPeriodicUpdates();
            
            // Load initial data
            await this.loadInitialData();
            
            // Mark as initialized
            this.isInitialized = true;
            
            console.log('✅ AlsaniaFX initialized successfully');
            
            // Show success notification
            if (window.ui) {
                window.ui.showNotification('AlsaniaFX loaded successfully!', 'success');
            }
            
        } catch (error) {
            console.error('❌ App startup failed:', error);
            this.showErrorState(error);
        }
    }

    // Initialize all modules
    async initializeModules() {
        try {
            // Check if modules are available
            this.modules = {
                web3: window.web3Manager,
                ui: window.ui,
                marketplace: window.marketplace,
                nft: window.nftManager,
                collections: window.collections,
                profile: window.profile
            };

            // Verify critical modules
            const criticalModules = ['web3', 'ui'];
            for (const moduleName of criticalModules) {
                if (!this.modules[moduleName]) {
                    throw new Error(`Critical module ${moduleName} not available`);
                }
            }

            console.log('📦 All modules initialized');
            
        } catch (error) {
            console.error('Error initializing modules:', error);
            throw error;
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        try {
            // Wallet connection events
            this.addEventListener(document, 'walletConnected', (e) => {
                this.onWalletConnected(e.detail);
            });

            this.addEventListener(document, 'walletDisconnected', () => {
                this.onWalletDisconnected();
            });

            // Network change events
            this.addEventListener(document, 'networkChanged', (e) => {
                this.onNetworkChanged(e.detail);
            });

            // Error handling
            this.addEventListener(window, 'error', (e) => {
                this.handleGlobalError(e.error);
            });

            this.addEventListener(window, 'unhandledrejection', (e) => {
                this.handleGlobalError(e.reason);
            });

            // Visibility change (pause/resume updates when tab is hidden)
            this.addEventListener(document, 'visibilitychange', () => {
                if (document.hidden) {
                    this.pauseUpdates();
                } else {
                    this.resumeUpdates();
                }
            });

            // Before unload (cleanup)
            this.addEventListener(window, 'beforeunload', () => {
                this.cleanup();
            });

            console.log('🔗 Global event listeners setup');
            
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Setup periodic updates
    setupPeriodicUpdates() {
        try {
            // Update marketplace data every 30 seconds
            this.marketplaceUpdateInterval = setInterval(() => {
                if (this.modules.marketplace && !document.hidden) {
                    this.modules.marketplace.loadStats();
                }
            }, 30000);

            // Update user balance every 60 seconds
            this.balanceUpdateInterval = setInterval(() => {
                if (this.modules.web3 && this.modules.web3.isWalletConnected() && !document.hidden) {
                    this.updateUserBalance();
                }
            }, 60000);

            // Check for new notifications every 2 minutes
            this.notificationInterval = setInterval(() => {
                if (!document.hidden) {
                    this.checkForUpdates();
                }
            }, 120000);

            console.log('⏰ Periodic updates setup');
            
        } catch (error) {
            console.error('Error setting up periodic updates:', error);
        }
    }

    // Load initial data
    async loadInitialData() {
        try {
            const loadPromises = [];

            // Load marketplace data
            if (this.modules.marketplace) {
                loadPromises.push(
                    this.modules.marketplace.loadNFTs().catch(e => 
                        console.warn('Failed to load marketplace NFTs:', e)
                    )
                );
            }

            // Load collections data
            if (this.modules.collections) {
                loadPromises.push(
                    this.modules.collections.loadCollections().catch(e => 
                        console.warn('Failed to load collections:', e)
                    )
                );
            }

            // Wait for all data to load (with timeout)
            await Promise.race([
                Promise.allSettled(loadPromises),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Data loading timeout')), 10000)
                )
            ]);

            console.log('📊 Initial data loaded');
            
        } catch (error) {
            console.warn('Some initial data failed to load:', error);
            // Don't throw - app can still function with mock data
        }
    }

    // Handle wallet connection
    async onWalletConnected(accountData) {
        try {
            console.log('👛 Wallet connected:', accountData.account);
            
            // Update profile
            if (this.modules.profile) {
                await this.modules.profile.onWalletConnect(accountData.account);
            }

            // Refresh marketplace data to show user-specific info
            if (this.modules.marketplace) {
                await this.modules.marketplace.loadNFTs();
            }

            // Update UI state
            this.updateConnectionState(true);
            
        } catch (error) {
            console.error('Error handling wallet connection:', error);
        }
    }

    // Handle wallet disconnection
    onWalletDisconnected() {
        try {
            console.log('👛 Wallet disconnected');
            
            // Update profile
            if (this.modules.profile) {
                this.modules.profile.onWalletDisconnect();
            }

            // Update UI state
            this.updateConnectionState(false);
            
        } catch (error) {
            console.error('Error handling wallet disconnection:', error);
        }
    }

    // Handle network change
    async onNetworkChanged(networkData) {
        try {
            console.log('🌐 Network changed:', networkData.networkId);
            
            // Check if network is supported
            if (networkData.networkId !== CONFIG.NETWORK.CHAIN_ID) {
                if (this.modules.ui) {
                    this.modules.ui.showNotification(
                        'Please switch to the correct network', 
                        'warning'
                    );
                }
                return;
            }

            // Reload contracts and data
            await this.modules.web3.loadContracts();
            await this.loadInitialData();
            
        } catch (error) {
            console.error('Error handling network change:', error);
        }
    }

    // Update connection state in UI
    updateConnectionState(isConnected) {
        try {
            // Update navigation
            const adminLinks = document.querySelectorAll('.admin-only');
            adminLinks.forEach(link => {
                link.style.display = isConnected ? 'block' : 'none';
            });

            // Update create section visibility
            const createSection = document.getElementById('create');
            if (createSection) {
                createSection.style.opacity = isConnected ? '1' : '0.5';
            }
            
        } catch (error) {
            console.error('Error updating connection state:', error);
        }
    }

    // Update user balance
    async updateUserBalance() {
        try {
            if (!this.modules.web3 || !this.modules.web3.isWalletConnected()) {
                return;
            }

            const balance = await this.modules.web3.getBalance();
            
            // Update balance display if profile is loaded
            if (this.modules.profile && this.modules.profile.profileData) {
                this.modules.profile.profileData.balance = balance;
                
                // Update UI if profile is visible
                const balanceElements = document.querySelectorAll('.user-balance');
                balanceElements.forEach(element => {
                    element.textContent = `${UTILS.formatPrice(balance)} ETH`;
                });
            }
            
        } catch (error) {
            console.error('Error updating user balance:', error);
        }
    }

    // Check for updates and notifications
    async checkForUpdates() {
        try {
            // Check for new listings
            if (this.modules.marketplace) {
                const currentCount = this.modules.marketplace.nfts.length;
                await this.modules.marketplace.loadStats();
                
                // Show notification if new NFTs were added
                if (this.modules.marketplace.nfts.length > currentCount) {
                    const newCount = this.modules.marketplace.nfts.length - currentCount;
                    if (this.modules.ui) {
                        this.modules.ui.showNotification(
                            `${newCount} new NFT${newCount > 1 ? 's' : ''} added to marketplace`,
                            'info'
                        );
                    }
                }
            }
            
        } catch (error) {
            console.error('Error checking for updates:', error);
        }
    }

    // Handle global errors
    handleGlobalError(error) {
        console.error('Global error:', error);
        
        // Show user-friendly error message
        if (this.modules.ui) {
            let message = 'An unexpected error occurred';
            
            if (error.message) {
                if (error.message.includes('network')) {
                    message = 'Network connection error. Please check your internet connection.';
                } else if (error.message.includes('wallet')) {
                    message = 'Wallet connection error. Please try reconnecting your wallet.';
                } else if (error.message.includes('contract')) {
                    message = 'Smart contract error. Please try again later.';
                }
            }
            
            this.modules.ui.showNotification(message, 'error');
        }
    }

    // Show error state
    showErrorState(error) {
        const container = document.body;
        
        const errorHTML = `
            <div class="error-state">
                <div class="error-content">
                    <h1>⚠️ AlsaniaFX Error</h1>
                    <p>Something went wrong while loading the application.</p>
                    <details>
                        <summary>Error Details</summary>
                        <pre>${error.message || error}</pre>
                    </details>
                    <button class="btn btn-primary" onclick="window.location.reload()">
                        Reload Page
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = errorHTML;
    }

    // Pause updates when tab is hidden
    pauseUpdates() {
        this.updatesPaused = true;
        console.log('⏸️ Updates paused');
    }

    // Resume updates when tab is visible
    resumeUpdates() {
        this.updatesPaused = false;
        console.log('▶️ Updates resumed');
        
        // Trigger immediate update
        if (this.modules.marketplace) {
            this.modules.marketplace.loadStats();
        }
    }

    // Add event listener with cleanup tracking
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    // Cleanup resources
    cleanup() {
        try {
            // Clear intervals
            if (this.marketplaceUpdateInterval) {
                clearInterval(this.marketplaceUpdateInterval);
            }
            if (this.balanceUpdateInterval) {
                clearInterval(this.balanceUpdateInterval);
            }
            if (this.notificationInterval) {
                clearInterval(this.notificationInterval);
            }

            // Remove event listeners
            this.eventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners = [];

            console.log('🧹 Cleanup completed');
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Get module instance
    getModule(name) {
        return this.modules[name];
    }

    // Check if app is initialized
    isReady() {
        return this.isInitialized;
    }

    // Get app status
    getStatus() {
        return {
            initialized: this.isInitialized,
            walletConnected: this.modules.web3?.isWalletConnected() || false,
            networkId: this.modules.web3?.getCurrentNetwork() || null,
            updatesPaused: this.updatesPaused || false,
            modules: Object.keys(this.modules).reduce((acc, key) => {
                acc[key] = !!this.modules[key];
                return acc;
            }, {})
        };
    }

    // Reload application data
    async reload() {
        try {
            if (this.modules.ui) {
                this.modules.ui.showLoading('Reloading data...');
            }

            await this.loadInitialData();

            if (this.modules.ui) {
                this.modules.ui.hideLoading();
                this.modules.ui.showNotification('Data reloaded successfully', 'success');
            }
            
        } catch (error) {
            console.error('Error reloading app:', error);
            
            if (this.modules.ui) {
                this.modules.ui.hideLoading();
                this.modules.ui.showNotification('Failed to reload data', 'error');
            }
        }
    }

    // Debug information
    debug() {
        return {
            status: this.getStatus(),
            config: CONFIG,
            modules: this.modules,
            eventListeners: this.eventListeners.length
        };
    }
}

// Initialize the application
const app = new AlsaniaFXApp();

// Make app globally available for debugging
window.alsaniaFX = app;

// Global helper functions
window.connectWallet = async () => {
    if (window.ui) {
        await window.ui.connectWallet();
    }
};

window.scrollToSection = (sectionId) => {
    if (window.ui) {
        window.ui.scrollToSection(sectionId);
    }
};

// Export for modules that might need it
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlsaniaFXApp;
}

console.log('🎯 AlsaniaFX App loaded');