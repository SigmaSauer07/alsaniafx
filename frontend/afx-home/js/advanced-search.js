// Advanced Search & Filter System for AlsaniaFX NFT Marketplace
class AdvancedSearch {
    constructor() {
        this.filters = {
            priceRange: { min: 0, max: null },
            traits: {},
            rarity: [],
            dateRange: { start: null, end: null },
            collections: [],
            status: 'all', // all, listed, sold, auction
            sortBy: 'latest'
        };
        this.init();
    }

    init() {
        this.setupFilterUI();
        this.bindEvents();
    }

    setupFilterUI() {
        const filterContainer = document.getElementById('advanced-filters');
        if (!filterContainer) return;

        filterContainer.innerHTML = `
            <div class="filter-section">
                <h3>Price Range</h3>
                <div class="price-range">
                    <input type="number" id="min-price" placeholder="Min Price" min="0">
                    <input type="number" id="max-price" placeholder="Max Price" min="0">
                </div>
            </div>
            
            <div class="filter-section">
                <h3>Traits</h3>
                <div class="traits-filter">
                    <div class="trait-group">
                        <label>Background</label>
                        <select id="background-trait">
                            <option value="">Any</option>
                            <option value="blue">Blue</option>
                            <option value="red">Red</option>
                            <option value="green">Green</option>
                        </select>
                    </div>
                    <div class="trait-group">
                        <label>Eyes</label>
                        <select id="eyes-trait">
                            <option value="">Any</option>
                            <option value="normal">Normal</option>
                            <option value="laser">Laser</option>
                            <option value="sunglasses">Sunglasses</option>
                        </select>
                    </div>
                    <div class="trait-group">
                        <label>Mouth</label>
                        <select id="mouth-trait">
                            <option value="">Any</option>
                            <option value="smile">Smile</option>
                            <option value="frown">Frown</option>
                            <option value="open">Open</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="filter-section">
                <h3>Rarity</h3>
                <div class="rarity-filter">
                    <label><input type="checkbox" value="common"> Common</label>
                    <label><input type="checkbox" value="uncommon"> Uncommon</label>
                    <label><input type="checkbox" value="rare"> Rare</label>
                    <label><input type="checkbox" value="legendary"> Legendary</label>
                </div>
            </div>
            
            <div class="filter-section">
                <h3>Date Range</h3>
                <div class="date-range">
                    <input type="date" id="start-date" placeholder="Start Date">
                    <input type="date" id="end-date" placeholder="End Date">
                </div>
            </div>
            
            <div class="filter-section">
                <h3>Status</h3>
                <div class="status-filter">
                    <label><input type="radio" name="status" value="all" checked> All</label>
                    <label><input type="radio" name="status" value="listed"> Listed</label>
                    <label><input type="radio" name="status" value="sold"> Sold</label>
                    <label><input type="radio" name="status" value="auction"> Auction</label>
                </div>
            </div>
            
            <div class="filter-section">
                <h3>Sort By</h3>
                <select id="sort-by">
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rarity">Rarity</option>
                    <option value="popularity">Popularity</option>
                </select>
            </div>
            
            <div class="filter-actions">
                <button id="apply-filters" class="btn btn-primary">Apply Filters</button>
                <button id="clear-filters" class="btn btn-secondary">Clear All</button>
            </div>
        `;
    }

    bindEvents() {
        // Price range filters
        document.getElementById('min-price')?.addEventListener('input', (e) => {
            this.filters.priceRange.min = e.target.value ? parseFloat(e.target.value) : 0;
        });

        document.getElementById('max-price')?.addEventListener('input', (e) => {
            this.filters.priceRange.max = e.target.value ? parseFloat(e.target.value) : null;
        });

        // Trait filters
        document.querySelectorAll('.traits-filter select').forEach(select => {
            select.addEventListener('change', (e) => {
                const traitName = e.target.id.replace('-trait', '');
                this.filters.traits[traitName] = e.target.value;
            });
        });

        // Rarity filters
        document.querySelectorAll('.rarity-filter input').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.filters.rarity.push(e.target.value);
                } else {
                    this.filters.rarity = this.filters.rarity.filter(r => r !== e.target.value);
                }
            });
        });

        // Date range filters
        document.getElementById('start-date')?.addEventListener('change', (e) => {
            this.filters.dateRange.start = e.target.value;
        });

        document.getElementById('end-date')?.addEventListener('change', (e) => {
            this.filters.dateRange.end = e.target.value;
        });

        // Status filters
        document.querySelectorAll('input[name="status"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
            });
        });

        // Sort by
        document.getElementById('sort-by')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
        });

        // Apply filters
        document.getElementById('apply-filters')?.addEventListener('click', () => {
            this.applyFilters();
        });

        // Clear filters
        document.getElementById('clear-filters')?.addEventListener('click', () => {
            this.clearFilters();
        });
    }

    applyFilters() {
        // Get all NFTs
        const allNFTs = window.app?.nfts || [];
        
        // Apply filters
        let filteredNFTs = this.filterNFTs(allNFTs);
        
        // Sort results
        filteredNFTs = this.sortNFTs(filteredNFTs);
        
        // Update UI
        if (window.app) {
            window.app.updateNFTGrid(filteredNFTs);
        }
        
        // Track filter usage
        this.trackFilterUsage();
    }

    filterNFTs(nfts) {
        return nfts.filter(nft => {
            // Price range filter
            if (this.filters.priceRange.min > 0 && parseFloat(nft.price) < this.filters.priceRange.min) {
                return false;
            }
            if (this.filters.priceRange.max && parseFloat(nft.price) > this.filters.priceRange.max) {
                return false;
            }

            // Traits filter
            for (const [trait, value] of Object.entries(this.filters.traits)) {
                if (value && nft.attributes && nft.attributes[trait] !== value) {
                    return false;
                }
            }

            // Rarity filter
            if (this.filters.rarity.length > 0) {
                const nftRarity = this.calculateRarity(nft);
                if (!this.filters.rarity.includes(nftRarity)) {
                    return false;
                }
            }

            // Date range filter
            if (this.filters.dateRange.start) {
                const nftDate = new Date(nft.createdAt);
                const startDate = new Date(this.filters.dateRange.start);
                if (nftDate < startDate) {
                    return false;
                }
            }
            if (this.filters.dateRange.end) {
                const nftDate = new Date(nft.createdAt);
                const endDate = new Date(this.filters.dateRange.end);
                if (nftDate > endDate) {
                    return false;
                }
            }

            // Status filter
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'listed' && !nft.isListed) {
                    return false;
                }
                if (this.filters.status === 'sold' && !nft.isSold) {
                    return false;
                }
                if (this.filters.status === 'auction' && !nft.isAuction) {
                    return false;
                }
            }

            return true;
        });
    }

    sortNFTs(nfts) {
        switch (this.filters.sortBy) {
            case 'latest':
                return nfts.sort((a, b) => b.id - a.id);
            case 'oldest':
                return nfts.sort((a, b) => a.id - b.id);
            case 'price-low':
                return nfts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            case 'price-high':
                return nfts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            case 'rarity':
                return nfts.sort((a, b) => this.calculateRarityScore(b) - this.calculateRarityScore(a));
            case 'popularity':
                return nfts.sort((a, b) => (b.views || 0) - (a.views || 0));
            default:
                return nfts;
        }
    }

    calculateRarity(nft) {
        // Simple rarity calculation based on traits
        const traitCount = Object.keys(nft.attributes || {}).length;
        if (traitCount <= 2) return 'common';
        if (traitCount <= 4) return 'uncommon';
        if (traitCount <= 6) return 'rare';
        return 'legendary';
    }

    calculateRarityScore(nft) {
        const rarity = this.calculateRarity(nft);
        const scores = { common: 1, uncommon: 2, rare: 3, legendary: 4 };
        return scores[rarity] || 1;
    }

    clearFilters() {
        // Reset all filter values
        this.filters = {
            priceRange: { min: 0, max: null },
            traits: {},
            rarity: [],
            dateRange: { start: null, end: null },
            collections: [],
            status: 'all',
            sortBy: 'latest'
        };

        // Reset UI
        document.getElementById('min-price').value = '';
        document.getElementById('max-price').value = '';
        document.querySelectorAll('.traits-filter select').forEach(select => {
            select.value = '';
        });
        document.querySelectorAll('.rarity-filter input').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        document.querySelector('input[name="status"][value="all"]').checked = true;
        document.getElementById('sort-by').value = 'latest';

        // Apply cleared filters
        this.applyFilters();
    }

    trackFilterUsage() {
        // Track analytics
        if (window.app?.analytics) {
            window.app.analytics.trackEvent('advanced_filter_applied', {
                filters: this.filters
            });
        }
    }

    // Public method to get current filters
    getCurrentFilters() {
        return this.filters;
    }

    // Public method to set filters programmatically
    setFilters(newFilters) {
        this.filters = { ...this.filters, ...newFilters };
        this.applyFilters();
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedSearch;
} else {
    window.AdvancedSearch = AdvancedSearch;
} 