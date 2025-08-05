// IPFS Integration for AlsaniaFX NFT Marketplace
class IPFSIntegration {
    constructor() {
        this.ipfs = null;
        this.gateway = 'https://ipfs.io/ipfs/';
        this.init();
    }

    async init() {
        try {
            // Initialize IPFS client
            if (typeof window !== 'undefined' && window.IpfsHttpClient) {
                this.ipfs = window.IpfsHttpClient.create({
                    host: 'ipfs.infura.io',
                    port: 5001,
                    protocol: 'https'
                });
            }
        } catch (error) {
            console.warn('IPFS not available, using fallback storage');
        }
    }

    async uploadMetadata(metadata) {
        try {
            if (this.ipfs) {
                const result = await this.ipfs.add(JSON.stringify(metadata));
                return `ipfs://${result.path}`;
            } else {
                // Fallback to centralized storage
                return await this.uploadToFallback(metadata);
            }
        } catch (error) {
            console.error('IPFS upload failed:', error);
            return await this.uploadToFallback(metadata);
        }
    }

    async uploadImage(file) {
        try {
            if (this.ipfs) {
                const result = await this.ipfs.add(file);
                return `ipfs://${result.path}`;
            } else {
                // Fallback to centralized storage
                return await this.uploadImageToFallback(file);
            }
        } catch (error) {
            console.error('IPFS image upload failed:', error);
            return await this.uploadImageToFallback(file);
        }
    }

    async uploadToFallback(metadata) {
        // Simulate centralized storage
        const id = Math.random().toString(36).substring(7);
        return `https://api.alsaniafx.com/metadata/${id}`;
    }

    async uploadImageToFallback(file) {
        // Simulate image upload
        const id = Math.random().toString(36).substring(7);
        return `https://api.alsaniafx.com/images/${id}`;
    }

    async getMetadata(uri) {
        try {
            if (uri.startsWith('ipfs://')) {
                const hash = uri.replace('ipfs://', '');
                const response = await fetch(`${this.gateway}${hash}`);
                return await response.json();
            } else {
                const response = await fetch(uri);
                return await response.json();
            }
        } catch (error) {
            console.error('Failed to fetch metadata:', error);
            return null;
        }
    }

    async getImageUrl(uri) {
        if (uri.startsWith('ipfs://')) {
            const hash = uri.replace('ipfs://', '');
            return `${this.gateway}${hash}`;
        }
        return uri;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IPFSIntegration;
} else {
    window.IPFSIntegration = IPFSIntegration;
} 