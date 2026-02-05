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
        
        // Update notification bell periodically
        setInterval(() => this.updateNotificationBell(), 3000);
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
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75" fill="%236366f1">📚</text></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="%236366f1"/></svg>',
            tag: `notification-${notification.type}`,
            requireInteraction: notification.priority === 'urgent',
            actions: [
                { action: 'open', title: 'Open' },
                { action: 'close', title: 'Close' }
            ]
        };

        try {
            new Notification(notification.title, {
                body: notification.message,
                ...options,
                timestamp: new Date(notification.timestamp).getTime()
            });
        } catch (error) {
            console.warn('Browser notification failed:', error);
        }
    },

    // Get unread notification count
    getUnreadCount() {
        const user = Auth.getCurrentUser();
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        return notifications.filter(n => n.userId === user.username && !n.read).length;
    },

    // Get all notifications for current user
    getNotifications(filters = {}) {
        const user = Auth.getCurrentUser();
        let notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        
        // Filter by user
        notifications = notifications.filter(n => n.userId === user.username);

        // Apply type filter
        if (filters.type) {
            notifications = notifications.filter(n => n.type === filters.type);
        }

        // Apply read status filter
        if (filters.readStatus !== undefined) {
            notifications = notifications.filter(n => n.read === filters.readStatus);
        }

        // Apply priority filter
        if (filters.priority) {
            notifications = notifications.filter(n => n.priority === filters.priority);
        }

        // Apply date range filter
        if (filters.startDate && filters.endDate) {
            const start = new Date(filters.startDate).getTime();
            const end = new Date(filters.endDate).getTime();
            notifications = notifications.filter(n => {
                const notifTime = new Date(n.timestamp).getTime();
                return notifTime >= start && notifTime <= end;
            });
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

    // Mark multiple notifications as read
    markMultipleAsRead(notificationIds) {
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        let updated = false;

        notificationIds.forEach(id => {
            const notification = notifications.find(n => n.id === id);
            if (notification && !notification.read) {
                notification.read = true;
                updated = true;
            }
        });

        if (updated) {
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
            this.updateNotificationBell();
        }

        return updated;
    },

    // Mark all notifications as read
    markAllAsRead() {
        const user = Auth.getCurrentUser();
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        let updated = false;

        notifications.forEach(n => {
            if (n.userId === user.username && !n.read) {
                n.read = true;
                updated = true;
            }
        });

        if (updated) {
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
            this.updateNotificationBell();
        }

        return updated;
    },

    // Delete notification
    deleteNotification(notificationId) {
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        const index = notifications.findIndex(n => n.id === notificationId);
        
        if (index !== -1) {
            notifications.splice(index, 1);
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
            this.updateNotificationBell();
            return true;
        }
        return false;
    },

    // Delete multiple notifications
    deleteMultiple(notificationIds) {
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        
        notificationIds.forEach(id => {
            const index = notifications.findIndex(n => n.id === id);
            if (index !== -1) {
                notifications.splice(index, 1);
            }
        });

        Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
        this.updateNotificationBell();
        return true;
    },

    // Update notification bell display
    updateNotificationBell() {
        const unreadCount = this.getUnreadCount();
        const bell = document.getElementById('notification-bell');
        const badge = document.getElementById('notification-badge');

        if (bell) {
            if (unreadCount > 0) {
                bell.classList.add('has-notifications');
                if (badge) {
                    badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
                    badge.style.display = 'flex';
                }
            } else {
                bell.classList.remove('has-notifications');
                if (badge) {
                    badge.style.display = 'none';
                }
            }
        }
    },

    // Show notification bell popup
    showNotificationBell() {
        const modal = document.getElementById('notification-modal');
        if (!modal) {
            this.createNotificationModal();
        } else {
            modal.style.display = 'flex';
        }
        this.renderNotificationList();
    },

    // Create notification modal
    createNotificationModal() {
        const modal = document.createElement('div');
        modal.id = 'notification-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            backdrop-filter: blur(4px);
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            background: white;
            border-radius: 16px;
            width: 90%;
            max-width: 500px;
            max-height: 600px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            display: flex;
            flex-direction: column;
            animation: slideUp 0.3s ease-out;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 1.5rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <h3 style="margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-bell"></i> Notifications
            </h3>
            <button onclick="NotificationSystem.clearAllNotifications()" class="btn btn-sm" style="background: #f3f4f6; color: #374151; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                Clear All
            </button>
            <button onclick="document.getElementById('notification-modal').style.display = 'none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9ca3af;">
                ×
            </button>
        `;

        // Filter tabs
        const filterTabs = document.createElement('div');
        filterTabs.id = 'notification-filters';
        filterTabs.style.cssText = `
            padding: 1rem;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            gap: 0.5rem;
            overflow-x: auto;
            background: #f9fafb;
        `;
        filterTabs.innerHTML = `
            <button onclick="NotificationSystem.filterNotifications('all')" class="notif-filter-btn active" data-filter="all" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; transition: all 0.2s;">
                <i class="fas fa-inbox"></i> All
            </button>
            <button onclick="NotificationSystem.filterNotifications('homework')" class="notif-filter-btn" data-filter="homework" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; transition: all 0.2s;">
                <i class="fas fa-book-open"></i> Homework
            </button>
            <button onclick="NotificationSystem.filterNotifications('notice')" class="notif-filter-btn" data-filter="notice" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; transition: all 0.2s;">
                <i class="fas fa-bullhorn"></i> Notice
            </button>
            <button onclick="NotificationSystem.filterNotifications('attendance')" class="notif-filter-btn" data-filter="attendance" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; transition: all 0.2s;">
                <i class="fas fa-calendar-check"></i> Attendance
            </button>
            <button onclick="NotificationSystem.filterNotifications('fees')" class="notif-filter-btn" data-filter="fees" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; white-space: nowrap; transition: all 0.2s;">
                <i class="fas fa-money-bill"></i> Fees
            </button>
        `;

        // Notification list container
        const listContainer = document.createElement('div');
        listContainer.id = 'notification-list-container';
        listContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 0;
        `;

        panel.appendChild(header);
        panel.appendChild(filterTabs);
        panel.appendChild(listContainer);

        modal.appendChild(panel);
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };

        document.body.appendChild(modal);

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    },

    // Render notification list
    renderNotificationList(filterType = 'all') {
        const container = document.getElementById('notification-list-container');
        if (!container) return;

        const notifications = this.getNotifications({
            type: filterType === 'all' ? undefined : filterType
        });

        if (notifications.length === 0) {
            container.innerHTML = `
                <div style="padding: 3rem 2rem; text-align: center; color: #9ca3af;">
                    <i class="fas fa-inbox fa-3x" style="margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.map(notif => `
            <div class="notification-item ${notif.read ? 'read' : 'unread'}" data-id="${notif.id}" style="
                padding: 1rem 1.5rem;
                border-bottom: 1px solid #e5e7eb;
                cursor: pointer;
                transition: all 0.2s;
                background: ${notif.read ? 'white' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05)'};
                position: relative;
                display: flex;
                gap: 1rem;
                align-items: flex-start;
            ">
                <div style="
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: ${notif.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                    font-size: 1.25rem;
                ">
                    <i class="${notif.icon}"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.25rem;">
                        <h4 style="margin: 0; font-size: 0.95rem; color: #111827; font-weight: 600;">
                            ${notif.title}
                        </h4>
                        ${!notif.read ? '<span style="width: 8px; height: 8px; background: #6366f1; border-radius: 50%; flex-shrink: 0;"></span>' : ''}
                    </div>
                    <p style="margin: 0.25rem 0 0 0; font-size: 0.875rem; color: #6b7280; line-height: 1.4;">
                        ${notif.message}
                    </p>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.75rem; color: #9ca3af;">
                        ${this.getRelativeTime(new Date(notif.timestamp))}
                    </p>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                    <button onclick="event.stopPropagation(); NotificationSystem.markAsRead('${notif.id}'); NotificationSystem.renderNotificationList('${filterType}');" class="btn btn-sm" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0.25rem; font-size: 1rem; transition: all 0.2s;">
                        <i class="fas fa-${notif.read ? 'envelope-open' : 'envelope'}"></i>
                    </button>
                    <button onclick="event.stopPropagation(); NotificationSystem.deleteNotification('${notif.id}'); NotificationSystem.renderNotificationList('${filterType}');" class="btn btn-sm" style="background: none; border: none; color: #9ca3af; cursor: pointer; padding: 0.25rem; font-size: 1rem; transition: all 0.2s;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // Add hover effects
        const items = container.querySelectorAll('.notification-item');
        items.forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.background = item.classList.contains('unread') 
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1)'
                    : '#f9fafb';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = item.classList.contains('read') 
                    ? 'white'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05)';
            });
        });
    },

    // Filter notifications
    filterNotifications(type) {
        // Update active button
        document.querySelectorAll('.notif-filter-btn').forEach(btn => {
            btn.style.background = btn.dataset.filter === type ? '#6366f1' : 'white';
            btn.style.color = btn.dataset.filter === type ? 'white' : '#374151';
            btn.style.borderColor = btn.dataset.filter === type ? '#6366f1' : '#e5e7eb';
        });

        this.renderNotificationList(type);
    },

    // Clear all notifications
    clearAllNotifications() {
        if (confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
            const user = Auth.getCurrentUser();
            const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
            const filtered = notifications.filter(n => n.userId !== user.username);
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, filtered);
            this.updateNotificationBell();
            this.renderNotificationList();
        }
    },

    // Get relative time (e.g., "2 minutes ago")
    getRelativeTime(date) {
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.isAuthenticated()) {
        NotificationSystem.init();
    }
});
