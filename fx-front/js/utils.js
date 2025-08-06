// AlsaniaFX Utility Functions
// Common utility functions used across the marketplace

class Utils {
    // Format ETH values with proper decimals
    static formatEth(wei, decimals = 4) {
        if (!wei) return '0';
        const eth = parseFloat(ethers.formatEther(wei.toString()));
        return eth.toFixed(decimals);
    }

    // Format large numbers with K, M, B suffixes
    static formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Format addresses for display
    static formatAddress(address, length = 6) {
        if (!address) return '';
        return `${address.slice(0, length)}...${address.slice(-4)}`;
    }

    // Format dates
    static formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }

    // Copy text to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Show notification
    static showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, duration);
    }

    // Validate Ethereum address
    static isValidAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // Generate random ID
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle function
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Local storage helpers
    static setLocalStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Failed to set localStorage:', error);
            return false;
        }
    }

    static getLocalStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to get localStorage:', error);
            return defaultValue;
        }
    }

    // Wait for condition
    static async waitForCondition(condition, timeout = 5000, interval = 100) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            if (await condition()) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        return false;
    }

    // Error handling
    static handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'An unexpected error occurred';
        if (error.code === 4001) {
            message = 'Transaction rejected by user';
        } else if (error.code === -32002) {
            message = 'Request already pending';
        } else if (error.message) {
            message = error.message;
        }

        this.showNotification(message, 'error');
        return message;
    }

    // Loading states
    static showLoading(element, text = 'Loading...') {
        if (!element) return;
        element.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <span>${text}</span>
            </div>
        `;
        element.classList.add('loading');
    }

    static hideLoading(element, originalContent = '') {
        if (!element) return;
        element.classList.remove('loading');
        if (originalContent) {
            element.innerHTML = originalContent;
        }
    }

    // URL helpers
    static getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        const results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // File helpers
    static async readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Image helpers
    static createImageThumbnail(file, maxWidth = 300, maxHeight = 300) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(resolve, 'image/jpeg', 0.8);
            };

            img.src = URL.createObjectURL(file);
        });
    }
}

// Make Utils available globally
window.Utils = Utils;