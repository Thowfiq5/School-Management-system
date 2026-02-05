/**
 * auth.js
 * Handles login, logout, role-based access, and session management.
 */

const DEFAULT_USERS = [
    { username: 'admin@eduflow.com', password: '123', role: 'admin', name: 'System Administrator' },
    { username: 'teacher', password: '123', role: 'teacher', name: 'Dr. John Doe' },
    { username: 'student', password: '123', role: 'student', name: 'Aditya Kumar', classId: 'c1' },
    { username: 'student', password: '123', role: 'student', name: 'Aditya Kumar', classId: 'c1' }
];

const Auth = {
    // Initialize users if not present
    init() {
        if (localStorage.getItem('sms_users') === null) {
            localStorage.setItem('sms_users', JSON.stringify(DEFAULT_USERS));
        }
    },

    login(username, password, role) {
        const users = JSON.parse(localStorage.getItem('sms_users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            return { success: false, message: 'Invalid username or password' };
        }

        if (role && user.role !== role) {
            return { success: false, message: `Access denied: Account is not registered as ${role}` };
        }

        if (user) {
            // Store session in sessionStorage
            const sessionData = {
                ...user,
                loginTime: new Date().toISOString()
            };
            delete sessionData.password; // Remove password from session
            sessionStorage.setItem('sms_session', JSON.stringify(sessionData));
            return { success: true, user: sessionData };
        }
        return { success: false, message: 'Invalid username or password' };
    },

    logout() {
        sessionStorage.removeItem('sms_session');
        window.location.href = 'login.html';
    },

    getCurrentUser() {
        const session = sessionStorage.getItem('sms_session');
        return session ? JSON.parse(session) : null;
    },

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    checkAccess(allowedRoles) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            alert('Access Denied: You do not have permission to view this page.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Initialize on load
Auth.init();
