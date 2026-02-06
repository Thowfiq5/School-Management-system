/**
 * auth.js
 * Handles login, logout, role-based access, and session management.
 */

const DEFAULT_USERS = [
    { username: 'admin@smsportal.com', password: '123', role: 'admin', name: 'System Administrator' },
    { username: 'teacher', password: '123', role: 'teacher', name: 'Dr. John Doe' },
    { username: 'student', password: '123', role: 'student', name: 'Aditya Kumar', classId: 'c1' }
];

const Auth = {
    SESSION_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME_MS: 15 * 60 * 1000, // 15 minutes
    _initPromise: null,

    // Initialize users if not present
    async init() {
        if (this._initPromise) return this._initPromise;
        this._initPromise = (async () => {
            console.log('Auth: Initializing system...');
            let modified = false;
            let users = JSON.parse(localStorage.getItem('sms_users'));

            if (users === null) {
                users = DEFAULT_USERS;
                modified = true; // If users are null, they are initialized, so modified is true
            } else {
                // Migration: Update old admin email to new rebranded identity
                let migrationDone = false;
                users = users.map(u => {
                    if (u.role === 'admin' && u.username === 'admin@eduflow.com') {
                        migrationDone = true;
                        return { ...u, username: 'admin@smsportal.com' };
                    }
                    return u;
                });

                if (migrationDone) {
                    modified = true; // Ensure migrated users are saved
                    console.log('Auth: Migrated old admin credentials.');
                }

                // Safety: Ensure at least one admin exists
                const hasAdmin = users.some(u => u.role === 'admin');
                if (!hasAdmin) {
                    console.log('Auth: No admin found, restoring default admin.');
                    users.push(DEFAULT_USERS[0]);
                    modified = true;
                }

                // Clear login failures for admin to prevent lockouts during transition
                const attempts = JSON.parse(localStorage.getItem('sms_login_attempts') || '{}');
                delete attempts['admin@eduflow.com'];
                delete attempts['admin@smsportal.com'];
                delete attempts['admin'];
                localStorage.setItem('sms_login_attempts', JSON.stringify(attempts));
            }

            // Hash any plaintext passwords found in the users table
            const hashedUsers = await Promise.all(users.map(async u => {
                // SHA-256 hex result is 64 characters. If shorter, consider it plaintext.
                if (u.password && u.password.length < 60) {
                    modified = true;
                    return { ...u, password: await this.hashPassword(u.password) };
                }
                return u;
            }));

            if (modified || localStorage.getItem('sms_users') === null) {
                localStorage.setItem('sms_users', JSON.stringify(hashedUsers));
            }

            this.checkRememberMe();
            this.startSessionCheck();
            console.log('Auth: Initialization complete.');
        })();
        return this._initPromise;
    },

    async hashPassword(password) {
        const msgUint8 = new TextEncoder().encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async login(username, password, role, rememberMe = false) {
        // Ensure initialization is complete
        await this.init();

        // Normalize input
        let normalizedUser = (username || '').toLowerCase().trim();

        // Fallback: Support 'admin' as shorthand for rebranded admin email
        if (role === 'admin' && normalizedUser === 'admin') {
            normalizedUser = 'admin@smsportal.com';
        }

        // Check rate limiting
        const attempts = JSON.parse(localStorage.getItem('sms_login_attempts') || '{}');
        const userAttempts = attempts[normalizedUser] || { count: 0, lastAttempt: 0 };

        if (userAttempts.count >= this.MAX_LOGIN_ATTEMPTS) {
            const timeLeft = Math.ceil((this.LOCKOUT_TIME_MS - (Date.now() - userAttempts.lastAttempt)) / 1000 / 60);
            if (timeLeft > 0) {
                return { success: false, message: `Account locked. Try again in ${timeLeft} minutes.` };
            } else {
                // Reset after lockout
                userAttempts.count = 0;
            }
        }

        const users = JSON.parse(localStorage.getItem('sms_users') || '[]');
        const hashedPassword = await this.hashPassword(password);
        const user = users.find(u => u.username.toLowerCase() === normalizedUser && u.password === hashedPassword);

        if (!user) {
            // Track failed attempt
            userAttempts.count++;
            userAttempts.lastAttempt = Date.now();
            attempts[normalizedUser] = userAttempts;
            localStorage.setItem('sms_login_attempts', JSON.stringify(attempts));

            const remaining = this.MAX_LOGIN_ATTEMPTS - userAttempts.count;
            return {
                success: false,
                message: remaining > 0
                    ? `Invalid username or password. ${remaining} attempts remaining.`
                    : 'Account locked due to too many failed attempts.'
            };
        }

        if (role && user.role !== role) {
            return { success: false, message: `Access denied: Account is not registered as ${role}` };
        }

        // Reset attempts on success
        delete attempts[normalizedUser];
        localStorage.setItem('sms_login_attempts', JSON.stringify(attempts));

        // Store session
        const sessionData = {
            ...user,
            loginTime: new Date().toISOString(),
            lastActive: Date.now()
        };
        delete sessionData.password;

        sessionStorage.setItem('sms_session', JSON.stringify(sessionData));

        if (rememberMe) {
            localStorage.setItem('sms_remember_token', btoa(username)); // Simple token for demo
        } else {
            localStorage.removeItem('sms_remember_token');
        }

        return { success: true, user: sessionData };
    },

    logout() {
        sessionStorage.removeItem('sms_session');
        localStorage.removeItem('sms_remember_token');
        window.location.href = 'login.html';
    },

    getCurrentUser() {
        const session = sessionStorage.getItem('sms_session');
        if (!session) return null;

        const userData = JSON.parse(session);
        // Check session timeout
        if (Date.now() - userData.lastActive > this.SESSION_TIMEOUT_MS) {
            this.logout();
            return null;
        }

        // Update last activity
        userData.lastActive = Date.now();
        sessionStorage.setItem('sms_session', JSON.stringify(userData));
        return userData;
    },

    checkRememberMe() {
        const token = localStorage.getItem('sms_remember_token');
        if (token && !sessionStorage.getItem('sms_session')) {
            const username = atob(token);
            const users = JSON.parse(localStorage.getItem('sms_users') || '[]');
            const user = users.find(u => u.username === username);
            if (user) {
                const sessionData = { ...user, loginTime: new Date().toISOString(), lastActive: Date.now() };
                delete sessionData.password;
                sessionStorage.setItem('sms_session', JSON.stringify(sessionData));
            }
        }
    },

    startSessionCheck() {
        setInterval(() => {
            if (this.isAuthenticated()) {
                this.getCurrentUser(); // This triggers the timeout check and logout if needed
            }
        }, 60000); // Check every minute
    },

    isAuthenticated() {
        const session = sessionStorage.getItem('sms_session');
        return session !== null;
    },

    checkAccess(allowedRoles) {
        const user = this.getCurrentUser();
        if (!user) {
            window.location.href = 'login.html';
            return false;
        }
        if (allowedRoles && !allowedRoles.includes(user.role)) {
            // We'll replace this alert with NotificationSystem.showToast later
            NotificationSystem.showToast('Access Denied', 'You do not have permission to view this page.', 'error');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
};

// Initialize on load
Auth.init();
