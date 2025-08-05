// UI Module for AlsaniaFX NFT Marketplace
class UI {
    constructor(app) {
        this.app = app;
        this.notifications = [];
        this.init();
    }

    init() {
        console.log('🎨 Initializing UI module...');
        this.setupNotifications();
        this.setupModals();
        this.setupLoading();
    }

    setupNotifications() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
    }

    setupModals() {
        // Setup modal functionality
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeModal(modal));
            }
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target);
            }
        });
    }

    setupLoading() {
        // Create loading overlay if it doesn't exist
        if (!document.getElementById('loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.id = 'loading-overlay';
            overlay.className = 'loading-overlay';
            overlay.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Processing...</p>
                </div>
            `;
            document.body.appendChild(overlay);
        }
    }

    showNotification(message, type = 'info', duration = 5000) {
        try {
            const container = document.getElementById('notification-container');
            if (!container) {
                console.warn('Notification container not found');
                return;
            }

            const notification = document.createElement('div');
            notification.className = `notification notification-${type}`;
            notification.innerHTML = `
                <div class="notification-content">
                    <span class="notification-message">${message}</span>
                    <button class="notification-close">&times;</button>
                </div>
            `;

            // Add close button functionality
            const closeBtn = notification.querySelector('.notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    notification.remove();
                });
            }

            container.appendChild(notification);

            // Auto remove after duration
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, duration);

            console.log(`📢 Notification: ${message} (${type})`);
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }

    showLoading(message = 'Loading...') {
        try {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.querySelector('p').textContent = message;
                overlay.classList.add('active');
            }
        } catch (error) {
            console.error('Failed to show loading:', error);
        }
    }

    hideLoading() {
        try {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                overlay.classList.remove('active');
            }
        } catch (error) {
            console.error('Failed to hide loading:', error);
        }
    }

    openModal(modalId) {
        try {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        } catch (error) {
            console.error('Failed to open modal:', error);
        }
    }

    closeModal(modal = null) {
        try {
            if (modal) {
                modal.classList.remove('active');
            } else {
                const activeModal = document.querySelector('.modal.active');
                if (activeModal) {
                    activeModal.classList.remove('active');
                }
            }
            document.body.style.overflow = '';
        } catch (error) {
            console.error('Failed to close modal:', error);
        }
    }

    updateSection(sectionId, content) {
        try {
            const section = document.getElementById(sectionId);
            if (section) {
                section.innerHTML = content;
            }
        } catch (error) {
            console.error('Failed to update section:', error);
        }
    }

    toggleElement(elementId) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.toggle('active');
            }
        } catch (error) {
            console.error('Failed to toggle element:', error);
        }
    }

    showElement(elementId) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'block';
            }
        } catch (error) {
            console.error('Failed to show element:', error);
        }
    }

    hideElement(elementId) {
        try {
            const element = document.getElementById(elementId);
            if (element) {
                element.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to hide element:', error);
        }
    }

    updateWalletDisplay(address, balance = null) {
        try {
            const walletAddress = document.getElementById('wallet-address');
            const walletBalance = document.getElementById('wallet-balance');
            const connectBtn = document.getElementById('connect-wallet');
            const disconnectBtn = document.getElementById('disconnect-wallet');

            if (address) {
                if (walletAddress) {
                    walletAddress.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
                }
                if (walletBalance && balance) {
                    walletBalance.textContent = `${balance} ETH`;
                }
                if (connectBtn) connectBtn.style.display = 'none';
                if (disconnectBtn) disconnectBtn.style.display = 'block';
            } else {
                if (walletAddress) walletAddress.textContent = 'Not Connected';
                if (walletBalance) walletBalance.textContent = '';
                if (connectBtn) connectBtn.style.display = 'block';
                if (disconnectBtn) disconnectBtn.style.display = 'none';
            }
        } catch (error) {
            console.error('Failed to update wallet display:', error);
        }
    }

    updateNFTGrid(nfts) {
        try {
            const grid = document.getElementById('nft-grid');
            if (!grid) {
                console.warn('NFT grid not found');
                return;
            }

            grid.innerHTML = '';
            
            if (nfts && nfts.length > 0) {
                nfts.forEach(nft => {
                    const card = this.createNFTCard(nft);
                    grid.appendChild(card);
                });
            } else {
                grid.innerHTML = '<div class="no-nfts">No NFTs found</div>';
            }
        } catch (error) {
            console.error('Failed to update NFT grid:', error);
        }
    }

    createNFTCard(nft) {
        const card = document.createElement('div');
        card.className = 'nft-card';
        card.innerHTML = `
            <div class="nft-image">
                <img src="${nft.image}" alt="${nft.name}">
                ${nft.isAuction ? '<span class="auction-badge">Auction</span>' : ''}
            </div>
            <div class="nft-info">
                <h3>${nft.name}</h3>
                <p>${nft.description}</p>
                <div class="nft-price">
                    <span class="price">${nft.price} ETH</span>
                    ${nft.isAuction ? `<span class="time-left">${this.getTimeLeft(nft.endTime)}</span>` : ''}
                </div>
                <div class="nft-actions">
                    <button class="btn btn-primary" onclick="window.app.openNFTModal(${nft.id})">
                        ${nft.isAuction ? 'Place Bid' : 'Buy Now'}
                    </button>
                </div>
            </div>
        `;
        return card;
    }

    getTimeLeft(endTime) {
        if (!endTime) return '';
        
        const now = Date.now();
        const timeLeft = endTime - now;
        
        if (timeLeft <= 0) return 'Ended';
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
} else {
    window.UI = UI;
} 