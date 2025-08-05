// Role Manager for AlsaniaFX NFT Marketplace
class RoleManager {
    constructor(web3) {
        this.web3 = web3;
        this.currentAccount = null;
        this.init();
    }

    init() {
        console.log('👥 Initializing Role Manager...');
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Role management event listeners will be set up by the admin panel
        console.log('✅ Role Manager event listeners setup');
    }

    async grantRole(role, account) {
        try {
            console.log(`🔐 Granting role ${role} to ${account}`);
            // Simulate role granting
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, transactionHash: "0x123..." };
        } catch (error) {
            console.error('Failed to grant role:', error);
            throw error;
        }
    }

    async revokeRole(role, account) {
        try {
            console.log(`🚫 Revoking role ${role} from ${account}`);
            // Simulate role revocation
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, transactionHash: "0x456..." };
        } catch (error) {
            console.error('Failed to revoke role:', error);
            throw error;
        }
    }

    async checkRole(role, account) {
        try {
            console.log(`🔍 Checking role ${role} for ${account}`);
            // Simulate role check
            await new Promise(resolve => setTimeout(resolve, 1000));
            return Math.random() > 0.5; // Random result for demo
        } catch (error) {
            console.error('Failed to check role:', error);
            throw error;
        }
    }

    async setPlatformFee(newFee) {
        try {
            console.log(`💰 Setting platform fee to ${newFee}%`);
            // Simulate fee setting
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, transactionHash: "0x789..." };
        } catch (error) {
            console.error('Failed to set platform fee:', error);
            throw error;
        }
    }

    async setFeeRecipient(newRecipient) {
        try {
            console.log(`🏦 Setting fee recipient to ${newRecipient}`);
            // Simulate recipient setting
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, transactionHash: "0xabc..." };
        } catch (error) {
            console.error('Failed to set fee recipient:', error);
            throw error;
        }
    }

    async approveERC20Token(tokenAddress) {
        try {
            console.log(`✅ Approving ERC20 token ${tokenAddress}`);
            // Simulate token approval
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, transactionHash: "0xdef..." };
        } catch (error) {
            console.error('Failed to approve ERC20 token:', error);
            throw error;
        }
    }

    async listERC20Token(tokenAddress) {
        try {
            console.log(`📋 Listing ERC20 token ${tokenAddress}`);
            // Simulate token listing
            await new Promise(resolve => setTimeout(resolve, 2000));
            return { success: true, transactionHash: "0xghi..." };
        } catch (error) {
            console.error('Failed to list ERC20 token:', error);
            throw error;
        }
    }

    // UI interaction methods
    async grantRoleFromUI() {
        try {
            const roleSelect = document.getElementById('grant-role-select');
            const accountInput = document.getElementById('grant-account-address');
            
            if (!roleSelect || !accountInput) {
                throw new Error('UI elements not found');
            }

            const role = roleSelect.value;
            const account = accountInput.value;

            if (!role || !account) {
                throw new Error('Please fill in all fields');
            }

            await this.grantRole(role, account);
            
            // Show success notification
            if (window.adminPanel) {
                window.adminPanel.showNotification('Role granted successfully!', 'success');
            }
            
            // Clear form
            accountInput.value = '';
            
        } catch (error) {
            console.error('Failed to grant role from UI:', error);
            if (window.adminPanel) {
                window.adminPanel.showNotification('Failed to grant role: ' + error.message, 'error');
            }
        }
    }

    async revokeRoleFromUI() {
        try {
            const roleSelect = document.getElementById('revoke-role-select');
            const accountInput = document.getElementById('revoke-account-address');
            
            if (!roleSelect || !accountInput) {
                throw new Error('UI elements not found');
            }

            const role = roleSelect.value;
            const account = accountInput.value;

            if (!role || !account) {
                throw new Error('Please fill in all fields');
            }

            await this.revokeRole(role, account);
            
            // Show success notification
            if (window.adminPanel) {
                window.adminPanel.showNotification('Role revoked successfully!', 'success');
            }
            
            // Clear form
            accountInput.value = '';
            
        } catch (error) {
            console.error('Failed to revoke role from UI:', error);
            if (window.adminPanel) {
                window.adminPanel.showNotification('Failed to revoke role: ' + error.message, 'error');
            }
        }
    }

    async setPlatformFeeFromUI() {
        try {
            const feeInput = document.getElementById('platform-fee-input');
            
            if (!feeInput) {
                throw new Error('Fee input not found');
            }

            const newFee = parseFloat(feeInput.value);

            if (isNaN(newFee) || newFee < 0 || newFee > 10) {
                throw new Error('Fee must be between 0 and 10%');
            }

            await this.setPlatformFee(newFee);
            
            // Show success notification
            if (window.adminPanel) {
                window.adminPanel.showNotification('Platform fee updated successfully!', 'success');
            }
            
            // Clear input
            feeInput.value = '';
            
        } catch (error) {
            console.error('Failed to set platform fee from UI:', error);
            if (window.adminPanel) {
                window.adminPanel.showNotification('Failed to set platform fee: ' + error.message, 'error');
            }
        }
    }

    async setFeeRecipientFromUI() {
        try {
            const recipientInput = document.getElementById('fee-recipient-input');
            
            if (!recipientInput) {
                throw new Error('Recipient input not found');
            }

            const newRecipient = recipientInput.value;

            if (!newRecipient || !this.web3.utils.isAddress(newRecipient)) {
                throw new Error('Please enter a valid Ethereum address');
            }

            await this.setFeeRecipient(newRecipient);
            
            // Show success notification
            if (window.adminPanel) {
                window.adminPanel.showNotification('Fee recipient updated successfully!', 'success');
            }
            
            // Clear input
            recipientInput.value = '';
            
        } catch (error) {
            console.error('Failed to set fee recipient from UI:', error);
            if (window.adminPanel) {
                window.adminPanel.showNotification('Failed to set fee recipient: ' + error.message, 'error');
            }
        }
    }

    async approveERC20TokenFromUI() {
        try {
            const tokenInput = document.getElementById('approve-token-address');
            
            if (!tokenInput) {
                throw new Error('Token input not found');
            }

            const tokenAddress = tokenInput.value;

            if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
                throw new Error('Please enter a valid token address');
            }

            await this.approveERC20Token(tokenAddress);
            
            // Show success notification
            if (window.adminPanel) {
                window.adminPanel.showNotification('Token approved successfully!', 'success');
            }
            
            // Clear input
            tokenInput.value = '';
            
        } catch (error) {
            console.error('Failed to approve token from UI:', error);
            if (window.adminPanel) {
                window.adminPanel.showNotification('Failed to approve token: ' + error.message, 'error');
            }
        }
    }

    async listERC20TokenFromUI() {
        try {
            const tokenInput = document.getElementById('list-token-address');
            
            if (!tokenInput) {
                throw new Error('Token input not found');
            }

            const tokenAddress = tokenInput.value;

            if (!tokenAddress || !this.web3.utils.isAddress(tokenAddress)) {
                throw new Error('Please enter a valid token address');
            }

            await this.listERC20Token(tokenAddress);
            
            // Show success notification
            if (window.adminPanel) {
                window.adminPanel.showNotification('Token listed successfully!', 'success');
            }
            
            // Clear input
            tokenInput.value = '';
            
        } catch (error) {
            console.error('Failed to list token from UI:', error);
            if (window.adminPanel) {
                window.adminPanel.showNotification('Failed to list token: ' + error.message, 'error');
            }
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RoleManager;
} else {
    window.RoleManager = RoleManager;
} 