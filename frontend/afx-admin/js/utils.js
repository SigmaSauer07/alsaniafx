// AlsaniaFX NFT Marketplace Utilities

class Utils {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = CONFIG.CACHE.DURATION;
    }

    // ====== FILE HANDLING ======
    
    /**
     * Validate file upload
     */
    validateFile(file) {
        const maxSize = CONFIG.IPFS.MAX_FILE_SIZE;
        const supportedTypes = CONFIG.IPFS.SUPPORTED_TYPES;

        if (file.size > maxSize) {
            throw new Error(CONFIG.ERRORS.FILE_TOO_LARGE);
        }

        if (!supportedTypes.includes(file.type)) {
            throw new Error(CONFIG.ERRORS.UNSUPPORTED_FILE);
        }

        return true;
    }

    /**
     * Convert file to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Create file preview
     */
    createFilePreview(file) {
        return new Promise((resolve, reject) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0);
                    resolve(canvas.toDataURL());
                };
                video.onerror = reject;
                video.src = URL.createObjectURL(file);
            } else {
                reject(new Error('Unsupported file type'));
            }
        });
    }

    // ====== IPFS INTEGRATION ======

    /**
     * Upload file to IPFS via Pinata
     */
    async uploadToIPFS(file, metadata = {}) {
        try {
            // For demo purposes, we'll simulate IPFS upload
            // In production, you would use Pinata or other IPFS service
            const fileHash = await this.simulateIPFSUpload(file);
            
            // Create metadata
            const nftMetadata = {
                name: metadata.name || CONFIG.DEFAULTS.NFT.NAME,
                description: metadata.description || CONFIG.DEFAULTS.NFT.DESCRIPTION,
                image: `ipfs://${fileHash}`,
                attributes: metadata.attributes || [],
                external_url: window.location.origin,
                ...metadata
            };

            // Upload metadata to IPFS
            const metadataHash = await this.simulateIPFSUpload(JSON.stringify(nftMetadata));
            
            return {
                fileHash: `ipfs://${fileHash}`,
                metadataHash: `ipfs://${metadataHash}`,
                metadata: nftMetadata
            };
        } catch (error) {
            console.error('IPFS upload failed:', error);
            throw new Error('Failed to upload to IPFS');
        }
    }

    /**
     * Simulate IPFS upload (replace with actual implementation)
     */
    async simulateIPFSUpload(content) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate a mock IPFS hash
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `Qm${timestamp}${random}`;
    }

    /**
     * Get IPFS gateway URL
     */
    getIPFSGatewayURL(ipfsHash) {
        if (!ipfsHash) return null;
        
        const hash = ipfsHash.replace('ipfs://', '');
        return `${CONFIG.IPFS.GATEWAY}${hash}`;
    }

    // ====== FORMATTING ======

    /**
     * Format ETH amount
     */
    formatETH(amount, decimals = 4) {
        if (!amount) return '0 ETH';
        
        const ethAmount = ethers.formatEther(amount.toString());
        return `${parseFloat(ethAmount).toFixed(decimals)} ETH`;
    }

    /**
     * Format address
     */
    formatAddress(address, length = 6) {
        if (!address) return '0x0000...0000';
        
        const start = address.substring(0, length);
        const end = address.substring(address.length - length);
        return `${start}...${end}`;
    }

    /**
     * Format date
     */
    formatDate(timestamp) {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Format time ago
     */
    formatTimeAgo(timestamp) {
        const now = Math.floor(Date.now() / 1000);
        const diff = now - timestamp;

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
        
        return this.formatDate(timestamp);
    }

    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // ====== VALIDATION ======

    /**
     * Validate ETH address
     */
    isValidAddress(address) {
        try {
            return ethers.isAddress(address);
        } catch {
            return false;
        }
    }

    /**
     * Validate price
     */
    validatePrice(price) {
        const numPrice = parseFloat(price);
        return numPrice >= CONFIG.MARKETPLACE.MIN_PRICE && 
               numPrice <= CONFIG.MARKETPLACE.MAX_PRICE;
    }

    /**
     * Validate royalty percentage
     */
    validateRoyalty(royalty) {
        const numRoyalty = parseFloat(royalty);
        return numRoyalty >= 0 && numRoyalty <= CONFIG.MARKETPLACE.MAX_ROYALTY;
    }

    // ====== CACHE MANAGEMENT ======

    /**
     * Set cache item
     */
    setCache(key, value, ttl = this.cacheTimeout) {
        const item = {
            value,
            timestamp: Date.now(),
            ttl
        };
        
        this.cache.set(key, item);
        
        // Clean up expired items
        this.cleanCache();
    }

    /**
     * Get cache item
     */
    getCache(key) {
        const item = this.cache.get(key);
        
        if (!item) return null;
        
        const now = Date.now();
        if (now - item.timestamp > item.ttl) {
            this.cache.delete(key);
            return null;
        }
        
        return item.value;
    }

    /**
     * Clean expired cache items
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now - item.timestamp > item.ttl) {
                this.cache.delete(key);
            }
        }
    }

    // ====== STORAGE ======

    /**
     * Set local storage item
     */
    setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    }

    /**
     * Get local storage item
     */
    getStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from localStorage:', error);
            return defaultValue;
        }
    }

    /**
     * Remove local storage item
     */
    removeStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    }

    // ====== NETWORK ======

    /**
     * Check if user is on correct network
     */
    async checkNetwork() {
        if (!window.ethereum) return false;
        
        try {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            const targetChainId = CONFIG.NETWORKS.AMOY.chainId;
            
            return chainId === targetChainId;
        } catch (error) {
            console.error('Failed to check network:', error);
            return false;
        }
    }

    /**
     * Switch to correct network
     */
    async switchNetwork() {
        if (!window.ethereum) {
            throw new Error('MetaMask not installed');
        }

        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: CONFIG.NETWORKS.AMOY.chainId }]
            });
        } catch (switchError) {
            // If the network doesn't exist, add it
            if (switchError.code === 4902) {
                await window.ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [{
                        chainId: CONFIG.NETWORKS.AMOY.chainId,
                        chainName: CONFIG.NETWORKS.AMOY.chainName,
                        rpcUrls: [CONFIG.NETWORKS.AMOY.rpcUrl],
                        blockExplorerUrls: [CONFIG.NETWORKS.AMOY.blockExplorer],
                        nativeCurrency: CONFIG.NETWORKS.AMOY.nativeCurrency
                    }]
                });
            } else {
                throw switchError;
            }
        }
    }

    // ====== ERROR HANDLING ======

    /**
     * Handle contract errors
     */
    handleContractError(error) {
        console.error('Contract error:', error);
        
        if (error.code === 4001) {
            return CONFIG.ERRORS.USER_REJECTED;
        }
        
        if (error.message.includes('insufficient funds')) {
            return CONFIG.ERRORS.INSUFFICIENT_BALANCE;
        }
        
        if (error.message.includes('execution reverted')) {
            return CONFIG.ERRORS.CONTRACT_ERROR;
        }
        
        return CONFIG.ERRORS.TRANSACTION_FAILED;
    }

    /**
     * Retry function with exponential backoff
     */
    async retry(fn, maxAttempts = 3, delay = 1000) {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) throw error;
                
                await new Promise(resolve => 
                    setTimeout(resolve, delay * Math.pow(2, attempt - 1))
                );
            }
        }
    }

    // ====== UI HELPERS ======

    /**
     * Show loading overlay
     */
    showLoading(message = 'Processing...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageEl = overlay.querySelector('p');
        
        if (messageEl) messageEl.textContent = message;
        overlay.classList.add('active');
    }

    /**
     * Hide loading overlay
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.classList.remove('active');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info', duration = CONFIG.UI.NOTIFICATIONS.DURATION) {
        const notifications = document.getElementById('notifications');
        const notification = document.createElement('div');
        
        notification.className = `alert alert-${type} animate-fade-in`;
        notification.textContent = message;
        
        notifications.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('animate-fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Debounce function
     */
    debounce(func, wait) {
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

    /**
     * Throttle function
     */
    throttle(func, limit) {
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
}

// Create global utils instance
window.Utils = new Utils();