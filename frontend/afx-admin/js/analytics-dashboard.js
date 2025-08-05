// Analytics Dashboard for AlsaniaFX NFT Marketplace
class AnalyticsDashboard {
    constructor() {
        this.data = {
            collections: {},
            marketplace: {},
            user: {}
        };
        this.init();
    }

    init() {
        this.setupDashboard();
        this.loadAnalytics();
        this.bindEvents();
    }

    setupDashboard() {
        const dashboardContainer = document.getElementById('analytics-dashboard');
        if (!dashboardContainer) return;

        dashboardContainer.innerHTML = `
            <div class="dashboard-header">
                <h2>Analytics Dashboard</h2>
                <div class="date-range">
                    <select id="analytics-period">
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="metric-card">
                    <h3>Total Volume</h3>
                    <div class="metric-value" id="total-volume">$0</div>
                    <div class="metric-change positive">+12.5%</div>
                </div>
                
                <div class="metric-card">
                    <h3>NFTs Sold</h3>
                    <div class="metric-value" id="nfts-sold">0</div>
                    <div class="metric-change positive">+8.3%</div>
                </div>
                
                <div class="metric-card">
                    <h3>Floor Price</h3>
                    <div class="metric-value" id="floor-price">$0</div>
                    <div class="metric-change negative">-2.1%</div>
                </div>
                
                <div class="metric-card">
                    <h3>Active Users</h3>
                    <div class="metric-value" id="active-users">0</div>
                    <div class="metric-change positive">+15.7%</div>
                </div>
            </div>
            
            <div class="charts-section">
                <div class="chart-container">
                    <h3>Sales Volume Over Time</h3>
                    <canvas id="volume-chart"></canvas>
                </div>
                
                <div class="chart-container">
                    <h3>Top Collections</h3>
                    <canvas id="collections-chart"></canvas>
                </div>
            </div>
            
            <div class="detailed-stats">
                <div class="stats-section">
                    <h3>Collection Performance</h3>
                    <div class="collection-stats" id="collection-stats">
                        <!-- Dynamic content -->
                    </div>
                </div>
                
                <div class="stats-section">
                    <h3>Market Trends</h3>
                    <div class="trend-stats" id="trend-stats">
                        <!-- Dynamic content -->
                    </div>
                </div>
            </div>
        `;
    }

    async loadAnalytics() {
        try {
            // Load marketplace analytics
            await this.loadMarketplaceAnalytics();
            
            // Load collection analytics
            await this.loadCollectionAnalytics();
            
            // Load user analytics
            await this.loadUserAnalytics();
            
            // Update UI
            this.updateDashboard();
            
        } catch (error) {
            console.error('Failed to load analytics:', error);
        }
    }

    async loadMarketplaceAnalytics() {
        // Simulate API call for marketplace data
        const period = document.getElementById('analytics-period')?.value || '30d';
        
        this.data.marketplace = {
            totalVolume: 1250000,
            nftsSold: 3420,
            floorPrice: 0.85,
            activeUsers: 15420,
            volumeChange: 12.5,
            salesChange: 8.3,
            floorChange: -2.1,
            usersChange: 15.7,
            volumeHistory: this.generateVolumeHistory(period),
            topCollections: this.generateTopCollections()
        };
    }

    async loadCollectionAnalytics() {
        // Simulate collection analytics
        this.data.collections = {
            totalCollections: 156,
            verifiedCollections: 23,
            averageFloorPrice: 1.2,
            totalSupply: 45000,
            averageRarity: 2.3
        };
    }

    async loadUserAnalytics() {
        // Simulate user analytics
        this.data.user = {
            totalUsers: 25430,
            activeUsers: 15420,
            newUsers: 1234,
            retentionRate: 68.5,
            averageSessionTime: 12.3
        };
    }

    generateVolumeHistory(period) {
        const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
        const data = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            data.push({
                date: date.toISOString().split('T')[0],
                volume: Math.random() * 50000 + 10000,
                sales: Math.floor(Math.random() * 100) + 20
            });
        }
        
        return data;
    }

    generateTopCollections() {
        return [
            { name: 'Alsania Punks', volume: 250000, sales: 450, floor: 2.5 },
            { name: 'Digital Art Gallery', volume: 180000, sales: 320, floor: 1.8 },
            { name: 'Gaming Collectibles', volume: 120000, sales: 280, floor: 0.9 },
            { name: 'Music NFTs', volume: 95000, sales: 150, floor: 1.2 },
            { name: 'Photography', volume: 75000, sales: 120, floor: 0.6 }
        ];
    }

    updateDashboard() {
        // Update metric cards
        document.getElementById('total-volume').textContent = `$${this.formatNumber(this.data.marketplace.totalVolume)}`;
        document.getElementById('nfts-sold').textContent = this.formatNumber(this.data.marketplace.nftsSold);
        document.getElementById('floor-price').textContent = `$${this.data.marketplace.floorPrice.toFixed(2)}`;
        document.getElementById('active-users').textContent = this.formatNumber(this.data.marketplace.activeUsers);
        
        // Update collection stats
        this.updateCollectionStats();
        
        // Update trend stats
        this.updateTrendStats();
        
        // Initialize charts
        this.initializeCharts();
    }

    updateCollectionStats() {
        const container = document.getElementById('collection-stats');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Total Collections:</span>
                <span class="stat-value">${this.data.collections.totalCollections}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Verified Collections:</span>
                <span class="stat-value">${this.data.collections.verifiedCollections}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Average Floor Price:</span>
                <span class="stat-value">$${this.data.collections.averageFloorPrice.toFixed(2)}</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Total Supply:</span>
                <span class="stat-value">${this.formatNumber(this.data.collections.totalSupply)}</span>
            </div>
        `;
    }

    updateTrendStats() {
        const container = document.getElementById('trend-stats');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-row">
                <span class="stat-label">Volume Change:</span>
                <span class="stat-value positive">+${this.data.marketplace.volumeChange}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Sales Change:</span>
                <span class="stat-value positive">+${this.data.marketplace.salesChange}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">Floor Change:</span>
                <span class="stat-value negative">${this.data.marketplace.floorChange}%</span>
            </div>
            <div class="stat-row">
                <span class="stat-label">User Growth:</span>
                <span class="stat-value positive">+${this.data.marketplace.usersChange}%</span>
            </div>
        `;
    }

    initializeCharts() {
        // Volume chart
        const volumeCtx = document.getElementById('volume-chart');
        if (volumeCtx) {
            this.createVolumeChart(volumeCtx);
        }
        
        // Collections chart
        const collectionsCtx = document.getElementById('collections-chart');
        if (collectionsCtx) {
            this.createCollectionsChart(collectionsCtx);
        }
    }

    createVolumeChart(ctx) {
        const labels = this.data.marketplace.volumeHistory.map(item => item.date);
        const volumes = this.data.marketplace.volumeHistory.map(item => item.volume);
        
        // Simple chart using canvas (in production, use Chart.js or similar)
        const canvas = ctx;
        const ctx2d = canvas.getContext('2d');
        
        // Clear canvas
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw chart
        const maxVolume = Math.max(...volumes);
        const width = canvas.width;
        const height = canvas.height;
        
        ctx2d.strokeStyle = '#6366f1';
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        
        volumes.forEach((volume, index) => {
            const x = (index / (volumes.length - 1)) * width;
            const y = height - (volume / maxVolume) * height;
            
            if (index === 0) {
                ctx2d.moveTo(x, y);
            } else {
                ctx2d.lineTo(x, y);
            }
        });
        
        ctx2d.stroke();
    }

    createCollectionsChart(ctx) {
        const collections = this.data.marketplace.topCollections;
        const labels = collections.map(c => c.name);
        const volumes = collections.map(c => c.volume);
        
        // Simple bar chart
        const canvas = ctx;
        const ctx2d = canvas.getContext('2d');
        
        // Clear canvas
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        
        const maxVolume = Math.max(...volumes);
        const barWidth = canvas.width / volumes.length;
        const maxBarHeight = canvas.height * 0.8;
        
        collections.forEach((collection, index) => {
            const barHeight = (collection.volume / maxVolume) * maxBarHeight;
            const x = index * barWidth;
            const y = canvas.height - barHeight;
            
            ctx2d.fillStyle = '#6366f1';
            ctx2d.fillRect(x, y, barWidth * 0.8, barHeight);
        });
    }

    bindEvents() {
        // Period selector
        document.getElementById('analytics-period')?.addEventListener('change', (e) => {
            this.loadAnalytics();
        });
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Public method to refresh analytics
    refresh() {
        this.loadAnalytics();
    }

    // Public method to get analytics data
    getAnalyticsData() {
        return this.data;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsDashboard;
} else {
    window.AnalyticsDashboard = AnalyticsDashboard;
} 