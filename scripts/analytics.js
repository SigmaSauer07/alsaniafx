// Analytics and Monitoring System for AlsaniaFX
class Analytics {
    constructor() {
        this.events = [];
        this.metrics = {
            pageViews: 0,
            transactions: 0,
            errors: 0,
            performance: {}
        };
        this.sessionId = this.generateSessionId();
        this.userId = this.getUserId();
    }

    // Event Tracking
    trackEvent(eventName, properties = {}) {
        const event = {
            eventName,
            properties,
            timestamp: Date.now(),
            sessionId: this.sessionId,
            userId: this.userId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        this.events.push(event);
        this.sendEvent(event);
    }

    // Page View Tracking
    trackPageView(pageName, properties = {}) {
        this.metrics.pageViews++;
        this.trackEvent('page_view', {
            pageName,
            ...properties
        });
    }

    // Transaction Tracking
    trackTransaction(txHash, amount, type, properties = {}) {
        this.metrics.transactions++;
        this.trackEvent('transaction', {
            txHash,
            amount,
            type,
            ...properties
        });
    }

    // Error Tracking
    trackError(error, context = {}) {
        this.metrics.errors++;
        this.trackEvent('error', {
            message: error.message,
            stack: error.stack,
            context
        });
    }

    // Performance Tracking
    trackPerformance(metric, value) {
        this.metrics.performance[metric] = value;
        this.trackEvent('performance', {
            metric,
            value
        });
    }

    // User Behavior Tracking
    trackUserAction(action, element, properties = {}) {
        this.trackEvent('user_action', {
            action,
            element: element?.tagName || 'unknown',
            elementId: element?.id || 'unknown',
            elementClass: element?.className || 'unknown',
            ...properties
        });
    }

    // NFT Interaction Tracking
    trackNFTInteraction(nftId, action, properties = {}) {
        this.trackEvent('nft_interaction', {
            nftId,
            action,
            ...properties
        });
    }

    // Marketplace Analytics
    trackMarketplaceEvent(eventType, data = {}) {
        this.trackEvent('marketplace_event', {
            eventType,
            ...data
        });
    }

    // Send Event to Analytics Service
    sendEvent(event) {
        // Send to internal analytics
        this.sendToInternalAnalytics(event);
        
        // Send to external services (Google Analytics, Mixpanel, etc.)
        this.sendToExternalAnalytics(event);
    }

    sendToInternalAnalytics(event) {
        // Store in localStorage for offline support
        const storedEvents = JSON.parse(localStorage.getItem('alsania_analytics') || '[]');
        storedEvents.push(event);
        localStorage.setItem('alsania_analytics', JSON.stringify(storedEvents));
        
        // Send to backend API
        fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(event)
        }).catch(error => {
            console.error('Analytics error:', error);
        });
    }

    sendToExternalAnalytics(event) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', event.eventName, event.properties);
        }

        // Mixpanel
        if (typeof mixpanel !== 'undefined') {
            mixpanel.track(event.eventName, event.properties);
        }
    }

    // Performance Monitoring
    startPerformanceMonitoring() {
        // Monitor page load times
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.trackPerformance('page_load_time', loadTime);
        });

        // Monitor resource loading
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.entryType === 'resource') {
                    this.trackPerformance('resource_load_time', entry.duration);
                }
            }
        });
        observer.observe({ entryTypes: ['resource'] });

        // Monitor user interactions
        this.monitorUserInteractions();
    }

    monitorUserInteractions() {
        // Track clicks
        document.addEventListener('click', (e) => {
            this.trackUserAction('click', e.target);
        });

        // Track form submissions
        document.addEventListener('submit', (e) => {
            this.trackUserAction('form_submit', e.target);
        });

        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', this.throttle(() => {
            const scrollPercent = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.trackPerformance('scroll_depth', maxScroll);
            }
        }, 1000));
    }

    // Error Monitoring
    startErrorMonitoring() {
        // Global error handler
        window.addEventListener('error', (e) => {
            this.trackError(e.error, {
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno
            });
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            this.trackError(new Error(e.reason), {
                type: 'promise_rejection'
            });
        });
    }

    // Real-time Analytics Dashboard
    createAnalyticsDashboard() {
        const dashboard = document.createElement('div');
        dashboard.className = 'analytics-dashboard';
        dashboard.innerHTML = `
            <div class="dashboard-header">
                <h3>Analytics Dashboard</h3>
                <button class="dashboard-close">&times;</button>
            </div>
            <div class="dashboard-content">
                <div class="metric">
                    <span class="metric-label">Page Views:</span>
                    <span class="metric-value" id="page-views">${this.metrics.pageViews}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Transactions:</span>
                    <span class="metric-value" id="transactions">${this.metrics.transactions}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Errors:</span>
                    <span class="metric-value" id="errors">${this.metrics.errors}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Session ID:</span>
                    <span class="metric-value" id="session-id">${this.sessionId}</span>
                </div>
            </div>
        `;

        document.body.appendChild(dashboard);
        return dashboard;
    }

    // Export Analytics Data
    exportAnalyticsData() {
        return {
            events: this.events,
            metrics: this.metrics,
            sessionId: this.sessionId,
            userId: this.userId,
            timestamp: Date.now()
        };
    }

    // Helper Methods
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getUserId() {
        let userId = localStorage.getItem('alsania_user_id');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('alsania_user_id', userId);
        }
        return userId;
    }

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
}

// Export for use in other modules
window.Analytics = Analytics; 