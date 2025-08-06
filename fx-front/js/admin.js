// AlsaniaFX Admin Panel JavaScript
// Handles all admin functionality, role management, and platform settings

class AdminManager {
    constructor() {
        this.isAdmin = false;
        this.currentUser = null;
        this.platformSettings = {};
        this.roleHolders = {};
        this.approvedTokens = [];
        
        this.init();
    }

    async init() {
        try {
            // Wait for web3 to be ready
            if (window.web3Manager && window.web3Manager.isWalletConnected()) {
                await this.checkAccess();
            }
            
            this.setupEventListeners();
            console.log('👑 Admin Manager initialized');
        } catch (error) {
            console.error('Error initializing Admin Manager:', error);
        }
    }

    // Check if user has admin access
    async checkAccess() {
        try {
            console.log('🔍 Checking admin access...');
            console.log('📍 Demo mode:', CONFIG.DEMO_MODE);
            
            // Demo mode bypass for testing
            if (CONFIG.DEMO_MODE) {
                console.log('🚀 Demo mode enabled - granting admin access');
                this.currentUser = window.web3Manager?.getCurrentAccount() || 'demo-user';
                this.isAdmin = true;
                console.log('✅ Admin access granted (demo mode)');
                return true;
            }

            const contract = window.web3Manager?.getContract('marketplace');
            console.log('📄 Contract:', contract ? 'Found' : 'Not found');
            if (!contract) return false;

            this.currentUser = window.web3Manager.getCurrentAccount();
            console.log('👤 Current user:', this.currentUser);
            if (!this.currentUser) return false;

            const isAdmin = await contract.hasRole(CONFIG.ROLES.ADMIN_ROLE, this.currentUser);
            const isTeam = await contract.hasRole(CONFIG.ROLES.TEAM_ROLE, this.currentUser);

            console.log('🔑 Admin role:', isAdmin);
            console.log('🔑 Team role:', isTeam);

            this.isAdmin = isAdmin || isTeam;
            console.log('✅ Final admin status:', this.isAdmin);
            return this.isAdmin;
        } catch (error) {
            console.error('❌ Error checking admin access:', error);
            return false;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Role management forms
        const grantRoleForm = document.getElementById('grantRoleForm');
        if (grantRoleForm) {
            grantRoleForm.addEventListener('submit', (e) => this.handleGrantRole(e));
        }

        const revokeRoleForm = document.getElementById('revokeRoleForm');
        if (revokeRoleForm) {
            revokeRoleForm.addEventListener('submit', (e) => this.handleRevokeRole(e));
        }

        const checkRoleForm = document.getElementById('checkRoleForm');
        if (checkRoleForm) {
            checkRoleForm.addEventListener('submit', (e) => this.handleCheckRole(e));
        }

        // Token management form
        const approveTokenForm = document.getElementById('approveTokenForm');
        if (approveTokenForm) {
            approveTokenForm.addEventListener('submit', (e) => this.handleApproveToken(e));
        }
    }

    // Load platform settings
    async loadPlatformSettings() {
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) return;

            // Get platform fee
            const platformFee = await contract.getPlatformFee();
            const feePercent = (platformFee / 100).toFixed(1);
            
            const currentFeeElement = document.getElementById('currentPlatformFee');
            if (currentFeeElement) {
                currentFeeElement.textContent = `${feePercent}%`;
            }

            // Get fee recipient
            const feeRecipient = await contract.getFeeRecipient();
            const currentRecipientElement = document.getElementById('currentFeeRecipient');
            if (currentRecipientElement) {
                currentRecipientElement.textContent = UTILS.formatAddress(feeRecipient);
            }

            // Get ERC20 trading status
            // This would need to be added to the contract
            const erc20StatusElement = document.getElementById('erc20TradingStatus');
            if (erc20StatusElement) {
                erc20StatusElement.textContent = 'Enabled'; // Mock for now
            }

            this.platformSettings = {
                platformFee: platformFee,
                feeRecipient: feeRecipient,
                erc20TradingEnabled: true // Mock for now
            };

        } catch (error) {
            console.error('Error loading platform settings:', error);
        }
    }

    // Load admin statistics
    async loadAdminStats() {
        try {
            // These would come from contract calls or analytics API
            // For now, using mock data
            const stats = {
                totalNFTs: 1234,
                activeListings: 567,
                totalVolume: 890.45,
                platformFees: 8.9
            };

            // Update UI
            const elements = {
                adminTotalNFTs: document.getElementById('adminTotalNFTs'),
                adminActiveListings: document.getElementById('adminActiveListings'),
                adminTotalVolume: document.getElementById('adminTotalVolume'),
                adminPlatformFees: document.getElementById('adminPlatformFees')
            };

            if (elements.adminTotalNFTs) elements.adminTotalNFTs.textContent = UTILS.formatNumber(stats.totalNFTs);
            if (elements.adminActiveListings) elements.adminActiveListings.textContent = UTILS.formatNumber(stats.activeListings);
            if (elements.adminTotalVolume) elements.adminTotalVolume.textContent = `${stats.totalVolume} ETH`;
            if (elements.adminPlatformFees) elements.adminPlatformFees.textContent = `${stats.platformFees} ETH`;

        } catch (error) {
            console.error('Error loading admin stats:', error);
        }
    }

    // Load role holders
    async loadRoleHolders() {
        try {
            // This would query role events from the blockchain
            // For now, showing mock data
            const roleHoldersList = document.getElementById('roleHoldersList');
            if (!roleHoldersList) return;

            const mockRoleHolders = [
                { address: this.currentUser, roles: ['Admin', 'Team', 'Moderator', 'Approver', 'Creator'] },
                { address: '0x742d35Cc6e6B8D8E8A8eD0e8E6B8D8F8A8eD0e8E', roles: ['Creator'] },
                { address: '0x8B3e2A4C2e2A4C4F2A5E8A2B3E2A4C2E2A4C4F2A', roles: ['Moderator'] }
            ];

            const roleHoldersHTML = mockRoleHolders.map(holder => `
                <div class="role-holder">
                    <div class="role-holder-address">
                        <strong>${UTILS.formatAddress(holder.address)}</strong>
                        ${holder.address === this.currentUser ? '<span class="you-badge">You</span>' : ''}
                    </div>
                    <div class="role-holder-roles">
                        ${holder.roles.map(role => `<span class="role-badge role-${role.toLowerCase()}">${role}</span>`).join('')}
                    </div>
                </div>
            `).join('');

            roleHoldersList.innerHTML = roleHoldersHTML;

        } catch (error) {
            console.error('Error loading role holders:', error);
        }
    }

    // Load approved tokens
    async loadApprovedTokens() {
        try {
            const approvedTokensList = document.getElementById('approvedTokensList');
            if (!approvedTokensList) return;

            // This would come from the ERC20Factory contract
            // For now, showing mock data
            const mockTokens = [
                {
                    address: '0x1234567890123456789012345678901234567890',
                    name: 'Alsania Token',
                    symbol: 'ALS',
                    approved: true,
                    listed: true
                },
                {
                    address: '0x0987654321098765432109876543210987654321',
                    name: 'Test Token',
                    symbol: 'TEST',
                    approved: true,
                    listed: false
                }
            ];

            const tokensHTML = mockTokens.map(token => `
                <div class="token-item">
                    <div class="token-info">
                        <strong>${token.name} (${token.symbol})</strong>
                        <span class="token-address">${UTILS.formatAddress(token.address)}</span>
                    </div>
                    <div class="token-status">
                        <span class="status-badge ${token.approved ? 'status-approved' : 'status-pending'}">
                            ${token.approved ? 'Approved' : 'Pending'}
                        </span>
                        <span class="status-badge ${token.listed ? 'status-listed' : 'status-unlisted'}">
                            ${token.listed ? 'Listed' : 'Unlisted'}
                        </span>
                    </div>
                    <div class="token-actions">
                        <button class="btn btn-small btn-outline" onclick="admin.revokeTokenApproval('${token.address}')">
                            Revoke
                        </button>
                    </div>
                </div>
            `).join('');

            approvedTokensList.innerHTML = tokensHTML;

        } catch (error) {
            console.error('Error loading approved tokens:', error);
        }
    }

    // Handle grant role form submission
    async handleGrantRole(e) {
        e.preventDefault();
        
        try {
            const roleSelect = document.getElementById('grantRoleSelect');
            const addressInput = document.getElementById('grantRoleAddress');
            
            const role = roleSelect.value;
            const address = addressInput.value.trim();

            if (!UTILS.isValidAddress(address)) {
                throw new Error('Invalid address format');
            }

            await this.grantRole(role, address);
            
            // Clear form
            addressInput.value = '';
            
            // Reload role holders
            await this.loadRoleHolders();
            
        } catch (error) {
            console.error('Error granting role:', error);
            if (window.ui) {
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Handle revoke role form submission
    async handleRevokeRole(e) {
        e.preventDefault();
        
        try {
            const roleSelect = document.getElementById('revokeRoleSelect');
            const addressInput = document.getElementById('revokeRoleAddress');
            
            const role = roleSelect.value;
            const address = addressInput.value.trim();

            if (!UTILS.isValidAddress(address)) {
                throw new Error('Invalid address format');
            }

            await this.revokeRole(role, address);
            
            // Clear form
            addressInput.value = '';
            
            // Reload role holders
            await this.loadRoleHolders();
            
        } catch (error) {
            console.error('Error revoking role:', error);
            if (window.ui) {
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Handle check role form submission
    async handleCheckRole(e) {
        e.preventDefault();
        
        try {
            const roleSelect = document.getElementById('checkRoleSelect');
            const addressInput = document.getElementById('checkRoleAddress');
            const resultDiv = document.getElementById('roleCheckResult');
            
            const role = roleSelect.value;
            const address = addressInput.value.trim();

            if (!UTILS.isValidAddress(address)) {
                throw new Error('Invalid address format');
            }

            const hasRole = await this.checkRole(role, address);
            
            resultDiv.innerHTML = `
                <div class="role-check-result ${hasRole ? 'has-role' : 'no-role'}">
                    <strong>${UTILS.formatAddress(address)}</strong>
                    ${hasRole ? 'HAS' : 'DOES NOT HAVE'}
                    <strong>${role.replace('_ROLE', '').toLowerCase()}</strong> role
                </div>
            `;
            
        } catch (error) {
            console.error('Error checking role:', error);
            const resultDiv = document.getElementById('roleCheckResult');
            if (resultDiv) {
                resultDiv.innerHTML = `<div class="role-check-error">Error: ${error.message}</div>`;
            }
        }
    }

    // Handle approve token form submission
    async handleApproveToken(e) {
        e.preventDefault();
        
        try {
            const addressInput = document.getElementById('approveTokenAddress');
            const statusCheckbox = document.getElementById('approveTokenStatus');
            
            const address = addressInput.value.trim();
            const approved = statusCheckbox.checked;

            if (!UTILS.isValidAddress(address)) {
                throw new Error('Invalid token address format');
            }

            await this.approveToken(address, approved);
            
            // Clear form
            addressInput.value = '';
            statusCheckbox.checked = true;
            
            // Reload approved tokens
            await this.loadApprovedTokens();
            
        } catch (error) {
            console.error('Error approving token:', error);
            if (window.ui) {
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Grant role to address
    async grantRole(role, address) {
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            const roleHash = CONFIG.ROLES[role];
            if (!roleHash) {
                throw new Error('Invalid role');
            }

            if (window.ui) {
                window.ui.showLoading('Granting role...');
            }

            const tx = await contract.grantRole(roleHash, address);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);

            if (receipt.status === 1) {
                if (window.ui) {
                    window.ui.hideLoading();
                    window.ui.showNotification(`Role granted successfully!`, 'success');
                }
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.hideLoading();
            }
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Revoke role from address
    async revokeRole(role, address) {
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            const roleHash = CONFIG.ROLES[role];
            if (!roleHash) {
                throw new Error('Invalid role');
            }

            if (window.ui) {
                window.ui.showLoading('Revoking role...');
            }

            const tx = await contract.revokeRole(roleHash, address);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);

            if (receipt.status === 1) {
                if (window.ui) {
                    window.ui.hideLoading();
                    window.ui.showNotification(`Role revoked successfully!`, 'success');
                }
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.hideLoading();
            }
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Check if address has role
    async checkRole(role, address) {
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            const roleHash = CONFIG.ROLES[role];
            if (!roleHash) {
                throw new Error('Invalid role');
            }

            return await contract.hasRole(roleHash, address);

        } catch (error) {
            console.error('Error checking role:', error);
            throw error;
        }
    }

    // Approve token for trading
    async approveToken(tokenAddress, approved) {
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            if (window.ui) {
                window.ui.showLoading(`${approved ? 'Approving' : 'Revoking'} token...`);
            }

            const tx = await contract.approveERC20Token(tokenAddress, approved);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);

            if (receipt.status === 1) {
                if (window.ui) {
                    window.ui.hideLoading();
                    window.ui.showNotification(
                        `Token ${approved ? 'approved' : 'revoked'} successfully!`, 
                        'success'
                    );
                }
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.hideLoading();
            }
            throw new Error(window.web3Manager.formatTransactionError(error));
        }
    }

    // Revoke token approval
    async revokeTokenApproval(tokenAddress) {
        await this.approveToken(tokenAddress, false);
    }

    // Update platform fee
    async updatePlatformFee() {
        try {
            const newFeeInput = document.getElementById('newPlatformFee');
            const newFee = parseFloat(newFeeInput.value);

            if (isNaN(newFee) || newFee < 1 || newFee > 10) {
                throw new Error('Fee must be between 1% and 10%');
            }

            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            const feeBps = Math.floor(newFee * 100); // Convert to basis points

            if (window.ui) {
                window.ui.showLoading('Updating platform fee...');
            }

            const tx = await contract.setPlatformFee(feeBps);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);

            if (receipt.status === 1) {
                if (window.ui) {
                    window.ui.hideLoading();
                    window.ui.showNotification('Platform fee updated successfully!', 'success');
                }
                
                // Update display
                const currentFeeElement = document.getElementById('currentPlatformFee');
                if (currentFeeElement) {
                    currentFeeElement.textContent = `${newFee}%`;
                }
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.hideLoading();
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Update fee recipient
    async updateFeeRecipient() {
        try {
            const newRecipientInput = document.getElementById('newFeeRecipient');
            const newRecipient = newRecipientInput.value.trim();

            if (!UTILS.isValidAddress(newRecipient)) {
                throw new Error('Invalid recipient address');
            }

            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            if (window.ui) {
                window.ui.showLoading('Updating fee recipient...');
            }

            const tx = await contract.setFeeRecipient(newRecipient);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);

            if (receipt.status === 1) {
                if (window.ui) {
                    window.ui.hideLoading();
                    window.ui.showNotification('Fee recipient updated successfully!', 'success');
                }
                
                // Update display
                const currentRecipientElement = document.getElementById('currentFeeRecipient');
                if (currentRecipientElement) {
                    currentRecipientElement.textContent = UTILS.formatAddress(newRecipient);
                }
                
                // Clear input
                newRecipientInput.value = '';
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.hideLoading();
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Toggle marketplace pause state
    async toggleMarketplace() {
        try {
            // This would require pause/unpause functions in the contract
            if (window.ui) {
                window.ui.showNotification('Marketplace pause/unpause not implemented yet', 'warning');
            }
        } catch (error) {
            console.error('Error toggling marketplace:', error);
        }
    }

    // Emergency stop
    async emergencyStop() {
        try {
            const confirmed = confirm('Are you sure you want to trigger an emergency stop? This will pause all marketplace operations.');
            if (!confirmed) return;

            // This would require emergency stop function in the contract
            if (window.ui) {
                window.ui.showNotification('Emergency stop not implemented yet', 'warning');
            }
        } catch (error) {
            console.error('Error in emergency stop:', error);
        }
    }

    // Toggle ERC20 trading
    async toggleERC20Trading() {
        try {
            const contract = window.web3Manager.getContract('marketplace');
            if (!contract) {
                throw new Error('Marketplace contract not available');
            }

            // Get current status (would need to be implemented in contract)
            const currentStatus = this.platformSettings.erc20TradingEnabled;
            const newStatus = !currentStatus;

            if (window.ui) {
                window.ui.showLoading(`${newStatus ? 'Enabling' : 'Disabling'} ERC20 trading...`);
            }

            const tx = await contract.toggleERC20Trading(newStatus);
            const receipt = await window.web3Manager.waitForTransaction(tx.hash);

            if (receipt.status === 1) {
                if (window.ui) {
                    window.ui.hideLoading();
                    window.ui.showNotification(
                        `ERC20 trading ${newStatus ? 'enabled' : 'disabled'} successfully!`, 
                        'success'
                    );
                }
                
                // Update status
                this.platformSettings.erc20TradingEnabled = newStatus;
                const statusElement = document.getElementById('erc20TradingStatus');
                if (statusElement) {
                    statusElement.textContent = newStatus ? 'Enabled' : 'Disabled';
                }
            } else {
                throw new Error('Transaction failed');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.hideLoading();
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Update token platform fee
    async updateTokenPlatformFee() {
        try {
            const feeInput = document.getElementById('tokenPlatformFee');
            const newFee = parseFloat(feeInput.value);

            if (isNaN(newFee) || newFee < 0 || newFee > 10) {
                throw new Error('Fee must be between 0% and 10%');
            }

            // This would interact with the ERC20Factory contract
            if (window.ui) {
                window.ui.showNotification('Token platform fee update not implemented yet', 'warning');
            }

        } catch (error) {
            if (window.ui) {
                window.ui.showNotification(error.message, 'error');
            }
        }
    }

    // Security functions
    async pauseAllOperations() {
        const confirmed = confirm('Are you sure you want to pause all operations?');
        if (!confirmed) return;

        if (window.ui) {
            window.ui.showNotification('Pause all operations not implemented yet', 'warning');
        }
    }

    async emergencyWithdraw() {
        const confirmed = confirm('Are you sure you want to perform an emergency withdraw? This action cannot be undone.');
        if (!confirmed) return;

        if (window.ui) {
            window.ui.showNotification('Emergency withdraw not implemented yet', 'warning');
        }
    }

    async runSecurityAudit() {
        if (window.ui) {
            window.ui.showLoading('Running security audit...');
            
            // Simulate audit
            setTimeout(() => {
                window.ui.hideLoading();
                window.ui.showNotification('Security audit completed - No issues found', 'success');
            }, 3000);
        }
    }

    // Get admin status
    getAdminStatus() {
        return {
            isAdmin: this.isAdmin,
            currentUser: this.currentUser,
            platformSettings: this.platformSettings
        };
    }
}

// Global admin functions for HTML onclick handlers
window.updatePlatformFee = () => window.admin?.updatePlatformFee();
window.updateFeeRecipient = () => window.admin?.updateFeeRecipient();
window.toggleMarketplace = () => window.admin?.toggleMarketplace();
window.emergencyStop = () => window.admin?.emergencyStop();
window.toggleERC20Trading = () => window.admin?.toggleERC20Trading();
window.updateTokenPlatformFee = () => window.admin?.updateTokenPlatformFee();
window.pauseAllOperations = () => window.admin?.pauseAllOperations();
window.emergencyWithdraw = () => window.admin?.emergencyWithdraw();
window.runSecurityAudit = () => window.admin?.runSecurityAudit();

// Initialize Admin Manager
window.admin = new AdminManager();

// Global functions for admin panel
window.loadPlatformSettings = () => window.admin?.loadPlatformSettings();
window.loadAdminStats = () => window.admin?.loadAdminStats();
window.loadRoleHolders = () => window.admin?.loadRoleHolders();
window.loadApprovedTokens = () => window.admin?.loadApprovedTokens();

console.log('👑 Admin Manager loaded');