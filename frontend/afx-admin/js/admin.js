// AlsaniaFX Admin Panel - Main Application
class AdminApp {
    constructor() {
        this.currentTab = 'dashboard';
        this.isWalletConnected = false;
        this.currentAccount = null;
        this.isAdmin = true; // Set to true for demo purposes
        
        this.init();
    }

    async init() {
        console.log('🔧 Initializing AlsaniaFX Admin Panel...');
        
        try {
            // Initialize modules
            await this.initializeModules();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Initialize UI (skip admin check for demo)
            this.initializeUI();
            
            console.log('✅ Admin Panel initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Admin Panel:', error);
            // Don't show access denied for demo
            console.log('⚠️ Continuing with demo mode');
        }
    }

    async initializeModules() {
        try {
            // Initialize Web3
            if (typeof window.ethereum !== 'undefined') {
                this.web3 = new Web3(window.ethereum);
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

            // Initialize role manager
            try {
                this.roleManager = new RoleManager(this);
                console.log('✅ Role Manager initialized');
            } catch (error) {
                console.warn('⚠️ Role Manager not available:', error);
            }

        } catch (error) {
            console.error('❌ Error initializing modules:', error);
            // Don't throw error for demo
            console.log('⚠️ Continuing with demo mode');
        }
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });

        // Wallet connection
        const connectWalletBtn = document.getElementById('connect-wallet-btn');
        if (connectWalletBtn) {
            connectWalletBtn.addEventListener('click', () => this.connectWallet());
        }

        // Role management
        const grantRoleBtn = document.getElementById('grant-role-btn');
        if (grantRoleBtn) {
            grantRoleBtn.addEventListener('click', () => this.grantRole());
        }

        const revokeRoleBtn = document.getElementById('revoke-role-btn');
        if (revokeRoleBtn) {
            revokeRoleBtn.addEventListener('click', () => this.revokeRole());
        }

        // Platform settings
        const setFeeBtn = document.getElementById('set-fee-btn');
        if (setFeeBtn) {
            setFeeBtn.addEventListener('click', () => this.setPlatformFee());
        }

        const setRecipientBtn = document.getElementById('set-recipient-btn');
        if (setRecipientBtn) {
            setRecipientBtn.addEventListener('click', () => this.setFeeRecipient());
        }

        // Token management
        const approveTokenBtn = document.getElementById('approve-token-btn');
        if (approveTokenBtn) {
            approveTokenBtn.addEventListener('click', () => this.approveToken());
        }

        const revokeTokenBtn = document.getElementById('revoke-token-btn');
        if (revokeTokenBtn) {
            revokeTokenBtn.addEventListener('click', () => this.revokeToken());
        }

        // Marketplace controls
        const pauseMarketplaceBtn = document.getElementById('pause-marketplace-btn');
        if (pauseMarketplaceBtn) {
            pauseMarketplaceBtn.addEventListener('click', () => this.pauseMarketplace());
        }

        const resumeMarketplaceBtn = document.getElementById('resume-marketplace-btn');
        if (resumeMarketplaceBtn) {
            resumeMarketplaceBtn.addEventListener('click', () => this.resumeMarketplace());
        }

        // Security
        const emergencyStopBtn = document.getElementById('emergency-stop-btn');
        if (emergencyStopBtn) {
            emergencyStopBtn.addEventListener('click', () => this.emergencyStop());
        }
    }

    async checkAdminAccess() {
        try {
            // For demo purposes, always allow access
            this.isAdmin = true;
            this.updateAdminStatus();
            console.log('✅ Admin access granted (demo mode)');

        } catch (error) {
            console.error('❌ Admin access check failed:', error);
            // Don't throw error for demo
            this.isAdmin = true;
            this.updateAdminStatus();
        }
    }

    updateAdminStatus() {
        const statusText = document.getElementById('admin-status-text');
        if (statusText) {
            if (this.isAdmin) {
                statusText.textContent = 'Admin access granted (Demo Mode)';
                statusText.style.color = 'var(--secondary-color)';
            } else {
                statusText.textContent = 'Admin access denied';
                statusText.style.color = 'var(--danger-color)';
            }
        }
    }

    initializeUI() {
        // Set initial active tab
        this.switchTab('dashboard');
        
        // Initialize any UI components
        if (this.ui) {
            this.ui.initializeComponents();
        }
    }

    switchTab(tabName) {
        // Update current tab
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        const activePanel = document.getElementById(`${tabName}-tab`);
        if (activePanel) {
            activePanel.classList.add('active');
        }
        
        // Load tab-specific content
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        try {
            switch (tabName) {
                case 'dashboard':
                    await this.loadDashboardContent();
                    break;
                case 'role-management':
                    await this.loadRoleManagementContent();
                    break;
                case 'platform-settings':
                    await this.loadPlatformSettingsContent();
                    break;
                case 'token-management':
                    await this.loadTokenManagementContent();
                    break;
                case 'marketplace-controls':
                    await this.loadMarketplaceControlsContent();
                    break;
                case 'analytics':
                    await this.loadAnalyticsContent();
                    break;
                case 'security':
                    await this.loadSecurityContent();
                    break;
            }
        } catch (error) {
            console.error(`❌ Error loading ${tabName} content:`, error);
        }
    }

    async loadDashboardContent() {
        console.log('✅ Dashboard content loaded');
    }

    async loadRoleManagementContent() {
        console.log('✅ Role management content loaded');
    }

    async loadPlatformSettingsContent() {
        console.log('✅ Platform settings content loaded');
    }

    async loadTokenManagementContent() {
        console.log('✅ Token management content loaded');
    }

    async loadMarketplaceControlsContent() {
        console.log('✅ Marketplace controls content loaded');
    }

    async loadAnalyticsContent() {
        console.log('✅ Analytics content loaded');
    }

    async loadSecurityContent() {
        console.log('✅ Security content loaded');
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

    updateWalletUI() {
        const connectBtn = document.getElementById('connect-wallet-btn');
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

    async grantRole() {
        // Remove admin check for demo
        const role = document.getElementById('grant-role-select').value;
        const address = document.getElementById('grant-address').value;

        if (!role || !address) {
            if (this.ui) {
                this.ui.showNotification('Please fill in all fields', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Granting role...', 'info');
            }

            // Simulate role granting
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification(`Role ${role} granted to ${address}`, 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error granting role:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to grant role', 'error');
            }
        }
    }

    async revokeRole() {
        // Remove admin check for demo
        const role = document.getElementById('revoke-role-select').value;
        const address = document.getElementById('revoke-address').value;

        if (!role || !address) {
            if (this.ui) {
                this.ui.showNotification('Please fill in all fields', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Revoking role...', 'info');
            }

            // Simulate role revocation
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification(`Role ${role} revoked from ${address}`, 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error revoking role:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to revoke role', 'error');
            }
        }
    }

    async setPlatformFee() {
        // Remove admin check for demo
        const newFee = document.getElementById('new-fee').value;

        if (!newFee || isNaN(newFee)) {
            if (this.ui) {
                this.ui.showNotification('Please enter a valid fee', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Updating platform fee...', 'info');
            }

            // Simulate fee update
            setTimeout(() => {
                document.getElementById('current-fee').textContent = `${newFee}%`;
                if (this.ui) {
                    this.ui.showNotification(`Platform fee updated to ${newFee}%`, 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error setting platform fee:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to update platform fee', 'error');
            }
        }
    }

    async setFeeRecipient() {
        // Remove admin check for demo
        const newRecipient = document.getElementById('new-recipient').value;

        if (!newRecipient) {
            if (this.ui) {
                this.ui.showNotification('Please enter a valid address', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Updating fee recipient...', 'info');
            }

            // Simulate recipient update
            setTimeout(() => {
                document.getElementById('current-recipient').textContent = newRecipient;
                if (this.ui) {
                    this.ui.showNotification('Fee recipient updated successfully', 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error setting fee recipient:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to update fee recipient', 'error');
            }
        }
    }

    async approveToken() {
        // Remove admin check for demo
        const tokenAddress = document.getElementById('approve-token-address').value;

        if (!tokenAddress) {
            if (this.ui) {
                this.ui.showNotification('Please enter a token address', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Approving token...', 'info');
            }

            // Simulate token approval
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification(`Token ${tokenAddress} approved successfully`, 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error approving token:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to approve token', 'error');
            }
        }
    }

    async revokeToken() {
        // Remove admin check for demo
        const tokenAddress = document.getElementById('revoke-token-address').value;

        if (!tokenAddress) {
            if (this.ui) {
                this.ui.showNotification('Please enter a token address', 'warning');
            }
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Revoking token...', 'info');
            }

            // Simulate token revocation
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification(`Token ${tokenAddress} revoked successfully`, 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error revoking token:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to revoke token', 'error');
            }
        }
    }

    async pauseMarketplace() {
        // Remove admin check for demo
        try {
            if (this.ui) {
                this.ui.showNotification('Pausing marketplace...', 'info');
            }

            // Simulate marketplace pause
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification('Marketplace paused successfully', 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error pausing marketplace:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to pause marketplace', 'error');
            }
        }
    }

    async resumeMarketplace() {
        // Remove admin check for demo
        try {
            if (this.ui) {
                this.ui.showNotification('Resuming marketplace...', 'info');
            }

            // Simulate marketplace resume
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification('Marketplace resumed successfully', 'success');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Error resuming marketplace:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to resume marketplace', 'error');
            }
        }
    }

    async emergencyStop() {
        // Remove admin check for demo
        const confirmed = confirm('Are you sure you want to perform an emergency stop? This will halt all marketplace operations.');
        
        if (!confirmed) {
            return;
        }

        try {
            if (this.ui) {
                this.ui.showNotification('Performing emergency stop...', 'warning');
            }

            // Simulate emergency stop
            setTimeout(() => {
                if (this.ui) {
                    this.ui.showNotification('Emergency stop executed successfully', 'success');
                }
            }, 3000);

        } catch (error) {
            console.error('❌ Error performing emergency stop:', error);
            if (this.ui) {
                this.ui.showNotification('Failed to perform emergency stop', 'error');
            }
        }
    }

    showAccessDenied() {
        // Don't show access denied for demo
        console.log('⚠️ Demo mode - access granted');
    }
}

// Initialize the admin application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.adminApp = new AdminApp();
}); 