// Access Control System for AlsaniaFX NFT Marketplace
class AccessControl {
    constructor() {
        this.currentUser = null;
        this.userRoles = [];
        this.init();
    }

    init() {
        console.log('🔐 Initializing Access Control...');
        this.checkUserAccess();
    }

    async checkUserAccess() {
        try {
            // Check if wallet is connected
            if (typeof window.ethereum === 'undefined') {
                console.log('No wallet detected');
                return false;
            }

            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length === 0) {
                console.log('No wallet connected');
                return false;
            }

            this.currentUser = accounts[0];
            console.log('User connected:', this.currentUser);

            // For demo purposes, we'll simulate admin access
            // In production, this would check actual roles on the blockchain
            this.userRoles = ['ADMIN_ROLE', 'TEAM_ROLE'];
            
            return true;
        } catch (error) {
            console.error('Error checking user access:', error);
            return false;
        }
    }

    hasRole(role) {
        return this.userRoles.includes(role);
    }

    isAdmin() {
        return this.hasRole('ADMIN_ROLE');
    }

    isTeam() {
        return this.hasRole('TEAM_ROLE');
    }

    canAccessAdminPanel() {
        return this.isAdmin() || this.isTeam();
    }

    async requireAdminAccess() {
        const hasAccess = await this.checkUserAccess();
        if (!hasAccess) {
            throw new Error('Wallet not connected');
        }

        if (!this.canAccessAdminPanel()) {
            throw new Error('Admin or Team access required');
        }

        return true;
    }

    showAccessDenied() {
        document.body.innerHTML = `
            <div class="container">
                <div class="access-denied">
                    <h1>🔒 Access Denied</h1>
                    <p>You need admin or team privileges to access this page.</p>
                    <a href="index.html" class="btn btn-primary">Return to Marketplace</a>
                </div>
            </div>
        `;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessControl;
} else {
    window.AccessControl = AccessControl;
} 