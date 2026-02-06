/**
 * notifications.js
 * Real-time Notification System for School Management System
 * Features: Browser notifications, in-app bell, notification history, filtering
 */

const NotificationSystem = {
    // Initialize notification system
    init() {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        // Setup notification listeners
        this.setupEventListeners();

        // Create toast container if not exists
        this.createToastContainer();

        // Update notification bell periodically
        setInterval(() => this.updateNotificationBell(), 10000);

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const dropdown = document.getElementById('notification-dropdown');
            const bell = document.getElementById('notification-bell');
            if (dropdown && !dropdown.contains(e.target) && !bell.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    },

    // Create toast container
    createToastContainer() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    },

    // Show toast notification
    showToast(title, message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type] || icons.info}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    // Setup event listeners for notification actions
    setupEventListeners() {
        // Listen for attendance marked events
        document.addEventListener('attendanceMarked', (e) => {
            if (Auth.getCurrentUser().role === 'teacher') {
                this.createNotification({
                    type: 'attendance',
                    title: 'Attendance Marked',
                    message: `Attendance recorded for class ${e.detail.className}`,
                    icon: 'fas fa-calendar-check',
                    color: '#10b981'
                });
            }
        });

        // Listen for homework assigned events
        document.addEventListener('homeworkAssigned', (e) => {
            if (Auth.getCurrentUser().role === 'student') {
                this.createNotification({
                    type: 'homework',
                    title: 'New Homework',
                    message: e.detail.message,
                    icon: 'fas fa-book-open',
                    color: '#3b82f6'
                });
            }
        });

        // Listen for notice/announcement events
        document.addEventListener('noticePosted', (e) => {
            this.createNotification({
                type: 'notice',
                title: 'New Announcement',
                message: e.detail.message,
                icon: 'fas fa-bullhorn',
                color: '#f59e0b'
            });
        });

        // Listen for fee notification events
        document.addEventListener('feeNotification', (e) => {
            if (Auth.getCurrentUser().role === 'student') {
                this.createNotification({
                    type: 'fees',
                    title: 'Fee Payment Due',
                    message: e.detail.message,
                    icon: 'fas fa-money-bill',
                    color: '#ef4444'
                });
            }
        });
    },

    // Create and store a new notification
    createNotification(data) {
        const user = Auth.getCurrentUser();
        if (!user) return;

        const notification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId: user.username,
            userRole: user.role,
            type: data.type, // 'homework', 'notice', 'attendance', 'fees', 'marks', 'system'
            title: data.title,
            message: data.message,
            icon: data.icon || 'fas fa-bell',
            color: data.color || '#6366f1',
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: data.actionUrl || null,
            priority: data.priority || 'normal' // 'low', 'normal', 'high', 'urgent'
        };

        // Save to storage
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        notifications.unshift(notification);

        // Keep only last 100 notifications per user
        const userNotifications = notifications.filter(n => n.userId === user.username);
        if (userNotifications.length > 100) {
            const otherNotifications = notifications.filter(n => n.userId !== user.username);
            notifications.splice(0, notifications.length, ...otherNotifications.concat(userNotifications.slice(0, 100)));
        }

        Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);

        // Show toast
        const toastType = data.type === 'fees' || data.priority === 'urgent' ? 'warning' : 'info';
        this.showToast(data.title, data.message, toastType);

        // Send browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            this.sendBrowserNotification(notification);
        }

        // Update notification bell
        this.updateNotificationBell();

        // Dispatch custom event for other modules
        window.dispatchEvent(new CustomEvent('notificationCreated', { detail: notification }));

        return notification;
    },

    // Send browser notification
    sendBrowserNotification(notification) {
        const options = {
            icon: 'assets/images/logo.png', // Fallback to a real icon if available
            badge: 'assets/images/logo.png',
            tag: `notification-${notification.type}`,
            requireInteraction: notification.priority === 'urgent'
        };

        try {
            new Notification(notification.title, {
                body: notification.message,
                ...options
            });
        } catch (error) {
            console.warn('Browser notification failed:', error);
        }
    },

    // Get unread notification count
    getUnreadCount() {
        const user = Auth.getCurrentUser();
        if (!user) return 0;
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        return notifications.filter(n => n.userId === user.username && !n.read).length;
    },

    // Get all notifications for current user
    getNotifications(filters = {}) {
        const user = Auth.getCurrentUser();
        if (!user) return [];
        let notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];

        // Filter by user
        notifications = notifications.filter(n => n.userId === user.username);

        // Apply type filter
        if (filters.type && filters.type !== 'all') {
            notifications = notifications.filter(n => n.type === filters.type);
        }

        return notifications;
    },

    // Mark notification as read
    markAsRead(notificationId) {
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        const notification = notifications.find(n => n.id === notificationId);

        if (notification) {
            notification.read = true;
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
            this.updateNotificationBell();
            return true;
        }
        return false;
    },

    // Update notification bell display
    updateNotificationBell() {
        const unreadCount = this.getUnreadCount();
        const badge = document.getElementById('notification-badge');

        if (badge) {
            if (unreadCount > 0) {
                badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    },

    // Show notification dropdown
    showNotificationBell() {
        let dropdown = document.getElementById('notification-dropdown');
        if (!dropdown) {
            dropdown = this.createNotificationDropdown();
        }

        const isVisible = dropdown.style.display === 'flex';
        dropdown.style.display = isVisible ? 'none' : 'flex';

        if (!isVisible) {
            this.renderNotificationList();
        }
    },

    // Create notification dropdown
    createNotificationDropdown() {
        const dropdown = document.createElement('div');
        dropdown.id = 'notification-dropdown';
        dropdown.className = 'notification-dropdown';

        dropdown.innerHTML = `
            <div class="dropdown-header">
                <h3>Notifications</h3>
                <div class="dropdown-actions">
                    <button onclick="NotificationSystem.markAllAsRead(); NotificationSystem.renderNotificationList();" class="text-btn">Mark all read</button>
                    <button onclick="NotificationSystem.clearAllNotifications()" class="text-btn danger">Clear</button>
                </div>
            </div>
            <div class="dropdown-filters">
                <button onclick="NotificationSystem.filterNotifications('all', this)" class="filter-chip active">All</button>
                <button onclick="NotificationSystem.filterNotifications('homework', this)" class="filter-chip">Homework</button>
                <button onclick="NotificationSystem.filterNotifications('notice', this)" class="filter-chip">Notices</button>
                <button onclick="NotificationSystem.filterNotifications('attendance', this)" class="filter-chip">Attendance</button>
            </div>
            <div id="dropdown-list" class="dropdown-list"></div>
            <div class="dropdown-footer">
                <button onclick="AdminModule.manageNotifications(document.getElementById('content-area'))" class="btn-block">View All History</button>
            </div>
        `;

        // Position it relative to the bell
        const bell = document.getElementById('notification-bell');
        if (bell) {
            const rect = bell.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + 10}px`;
            dropdown.style.right = `${window.innerWidth - rect.right}px`;
        }

        document.body.appendChild(dropdown);
        return dropdown;
    },

    // Render notification list
    renderNotificationList(filterType = 'all') {
        const container = document.getElementById('dropdown-list');
        if (!container) return;

        const notifications = this.getNotifications({ type: filterType });

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-notif">
                    <i class="fas fa-bell-slash"></i>
                    <p>No new notifications</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.slice(0, 10).map(notif => `
            <div class="notif-item ${notif.read ? 'read' : 'unread'}" onclick="NotificationSystem.handleNotifClick('${notif.id}')">
                <div class="notif-icon" style="background: ${notif.color}">
                    <i class="${notif.icon}"></i>
                </div>
                <div class="notif-body">
                    <div class="notif-title">${notif.title}</div>
                    <div class="notif-text">${notif.message}</div>
                    <div class="notif-time">${this.getRelativeTime(new Date(notif.timestamp))}</div>
                </div>
                ${!notif.read ? '<div class="unread-dot"></div>' : ''}
            </div>
        `).join('');
    },

    // Handle clicking a notification
    handleNotifClick(id) {
        this.markAsRead(id);
        this.renderNotificationList();
        // Here you could redirect based on actionUrl if present
    },

    // Filter notifications
    filterNotifications(type, btn) {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        this.renderNotificationList(type);
    },

    // Mark all as read
    markAllAsRead() {
        const user = Auth.getCurrentUser();
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        notifications.forEach(n => {
            if (n.userId === user.username) n.read = true;
        });
        Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
        this.updateNotificationBell();
    },

    // Clear all
    clearAllNotifications() {
        if (confirm('Clear all notification history?')) {
            const user = Auth.getCurrentUser();
            const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
            const filtered = notifications.filter(n => n.userId !== user.username);
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, filtered);
            this.updateNotificationBell();
            this.renderNotificationList();
        }
    },

    // Get relative time
    getRelativeTime(date) {
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isAuthenticated()) {
        NotificationSystem.init();
    }
});
