// Advanced UI Features for AlsaniaFX
class AdvancedUI {
    constructor() {
        this.modals = new Map();
        this.tooltips = new Map();
        this.notifications = [];
        this.theme = 'light';
        this.animations = true;
    }

    // Advanced Modal System
    createModal(id, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'modal advanced-modal';
        modal.id = id;
        
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        
        const container = document.createElement('div');
        container.className = 'modal-container';
        
        const header = document.createElement('div');
        header.className = 'modal-header';
        
        const title = document.createElement('h3');
        title.textContent = options.title || 'Modal';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = () => this.closeModal(id);
        
        header.appendChild(title);
        header.appendChild(closeBtn);
        
        const body = document.createElement('div');
        body.className = 'modal-body';
        body.innerHTML = content;
        
        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        if (options.buttons) {
            options.buttons.forEach(btn => {
                const button = document.createElement('button');
                button.className = `btn ${btn.class || 'btn-primary'}`;
                button.textContent = btn.text;
                button.onclick = btn.onClick;
                footer.appendChild(button);
            });
        }
        
        container.appendChild(header);
        container.appendChild(body);
        container.appendChild(footer);
        
        modal.appendChild(backdrop);
        modal.appendChild(container);
        
        document.body.appendChild(modal);
        this.modals.set(id, modal);
        
        // Animation
        if (this.animations) {
            modal.classList.add('fade-in');
        }
        
        return modal;
    }

    closeModal(id) {
        const modal = this.modals.get(id);
        if (modal) {
            if (this.animations) {
                modal.classList.add('fade-out');
                setTimeout(() => {
                    modal.remove();
                    this.modals.delete(id);
                }, 300);
            } else {
                modal.remove();
                this.modals.delete(id);
            }
        }
    }

    // Advanced Tooltip System
    createTooltip(element, content, position = 'top') {
        const tooltip = document.createElement('div');
        tooltip.className = `tooltip tooltip-${position}`;
        tooltip.textContent = content;
        
        element.addEventListener('mouseenter', () => {
            document.body.appendChild(tooltip);
            this.positionTooltip(element, tooltip, position);
        });
        
        element.addEventListener('mouseleave', () => {
            tooltip.remove();
        });
        
        this.tooltips.set(element, tooltip);
    }

    positionTooltip(element, tooltip, position) {
        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        let left, top;
        
        switch (position) {
            case 'top':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.top - tooltipRect.height - 10;
                break;
            case 'bottom':
                left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
                top = rect.bottom + 10;
                break;
            case 'left':
                left = rect.left - tooltipRect.width - 10;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
            case 'right':
                left = rect.right + 10;
                top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
                break;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    }

    // Advanced Notification System
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.onclick = () => this.removeNotification(notification);
        
        document.body.appendChild(notification);
        this.notifications.push(notification);
        
        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        return notification;
    }

    removeNotification(notification) {
        if (notification.parentNode) {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                const index = this.notifications.indexOf(notification);
                if (index > -1) {
                    this.notifications.splice(index, 1);
                }
            }, 300);
        }
    }

    // Theme System
    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('alsania-theme', theme);
        
        // Update CSS variables
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--bg-primary', '#1a1a1a');
            root.style.setProperty('--text-primary', '#ffffff');
            root.style.setProperty('--border-color', '#333333');
        } else {
            root.style.setProperty('--bg-primary', '#ffffff');
            root.style.setProperty('--text-primary', '#000000');
            root.style.setProperty('--border-color', '#e0e0e0');
        }
    }

    // Animation System
    animate(element, animation, duration = 300) {
        element.style.animation = `${animation} ${duration}ms ease-in-out`;
        
        return new Promise(resolve => {
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration);
        });
    }

    // Drag and Drop System
    makeDraggable(element, handle = null) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        const dragHandle = handle || element;
        
        dragHandle.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            initialX = element.offsetLeft;
            initialY = element.offsetTop;
            
            element.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            element.style.left = `${initialX + deltaX}px`;
            element.style.top = `${initialY + deltaY}px`;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
            element.style.cursor = 'grab';
        });
    }

    // Virtual Scrolling for Large Lists
    createVirtualList(container, items, itemHeight = 100) {
        const visibleCount = Math.ceil(container.clientHeight / itemHeight);
        let startIndex = 0;
        let endIndex = visibleCount;
        
        const renderItems = () => {
            container.innerHTML = '';
            const fragment = document.createDocumentFragment();
            
            for (let i = startIndex; i < endIndex && i < items.length; i++) {
                const item = items[i];
                const element = this.createListItem(item);
                element.style.position = 'absolute';
                element.style.top = `${i * itemHeight}px`;
                element.style.height = `${itemHeight}px`;
                fragment.appendChild(element);
            }
            
            container.appendChild(fragment);
        };
        
        container.addEventListener('scroll', this.throttle(() => {
            const scrollTop = container.scrollTop;
            startIndex = Math.floor(scrollTop / itemHeight);
            endIndex = startIndex + visibleCount;
            renderItems();
        }, 16));
        
        renderItems();
    }

    // Helper Methods
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

    createListItem(item) {
        const element = document.createElement('div');
        element.className = 'virtual-list-item';
        element.innerHTML = item.content || item.toString();
        return element;
    }
}

// Export for use in other modules
window.AdvancedUI = AdvancedUI; 