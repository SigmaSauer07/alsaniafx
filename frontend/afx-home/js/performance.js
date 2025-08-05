// Performance Optimization Module for AlsaniaFX
class PerformanceOptimizer {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.intersectionObserver = null;
        this.virtualScroller = null;
        this.imageOptimizer = null;
    }

    // Image Optimization
    optimizeImages() {
        const images = document.querySelectorAll('img[data-src]');
        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    this.intersectionObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => this.intersectionObserver.observe(img));
    }

    // Virtual Scrolling for Large Lists
    initVirtualScroller(container, items, itemHeight = 100) {
        const visibleItems = Math.ceil(container.clientHeight / itemHeight);
        let startIndex = 0;
        let endIndex = visibleItems;

        const renderItems = () => {
            container.innerHTML = '';
            for (let i = startIndex; i < endIndex && i < items.length; i++) {
                const item = items[i];
                const element = this.createItemElement(item);
                container.appendChild(element);
            }
        };

        container.addEventListener('scroll', this.debounce(() => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            endIndex = startIndex + visibleItems;
            renderItems();
        }, 16));

        renderItems();
    }

    // Debounce Function
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.debounceTimers.get(func));
            this.debounceTimers.set(func, setTimeout(() => func.apply(this, args), wait));
        };
    }

    // Throttle Function
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Memory Management
    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > 300000) { // 5 minutes
                this.cache.delete(key);
            }
        }
    }

    // Service Worker for Caching
    initServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    }

    // Web Workers for Heavy Computations
    runInWorker(script, data) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([script], { type: 'application/javascript' });
            const worker = new Worker(URL.createObjectURL(blob));
            
            worker.onmessage = (event) => resolve(event.data);
            worker.onerror = reject;
            
            worker.postMessage(data);
        });
    }

    // Performance Monitoring
    startPerformanceMonitoring() {
        if ('performance' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'navigation') {
                        console.log('Page Load Time:', entry.loadEventEnd - entry.loadEventStart);
                    }
                }
            });
            observer.observe({ entryTypes: ['navigation', 'resource'] });
        }
    }
}

// Export for use in other modules
window.PerformanceOptimizer = PerformanceOptimizer; 