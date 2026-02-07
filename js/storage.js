/**
 * storage.js
 * Utility to handle all localStorage operations for the School Management System.
 */

const STORAGE_KEYS = {
    STUDENTS: 'sms_students',
    TEACHERS: 'sms_teachers',
    CLASSES: 'sms_classes',
    SUBJECTS: 'sms_subjects',
    ATTENDANCE: 'sms_attendance',
    HOMEWORK: 'sms_homework',
    MARKS: 'sms_marks',
    NOTICES: 'sms_notices',
    FEE_STRUCTURE: 'sms_fee_structure',
    FEES: 'sms_fees',
    DOCUMENTS: 'sms_documents',
    TEACHER_DOCUMENTS: 'sms_teacher_documents',
    TEACHER_ATTENDANCE: 'sms_teacher_attendance',
    USERS: 'sms_users', // For login system
    EXAM_TYPES: 'sms_exam_types',
    SUBMISSIONS: 'sms_submissions',
    NOTIFICATIONS: 'sms_notifications',
    PAYMENT_CONFIG: 'sms_payment_config'
};

const Storage = {
    // Generic methods
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            return [];
        }
    },

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error(`Error saving to storage (${key}):`, error);
            NotificationSystem.showToast('Storage Warning', 'Disk full or storage disabled! Data may not be saved.', 'warning');
        }
    },

    // Image Resize Helper
    resizeImage(file, maxWidth, maxHeight, callback) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                callback(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    // Helper to resolve document path (Local Storage Base64 OR Automatic File Discovery)
    getDocument(studentId, docType) {
        const allDocs = this.get(STORAGE_KEYS.DOCUMENTS);
        const record = allDocs.find(d => d.studentId === studentId);

        // 1. Priority: Manual Upload (Base64 in LocalStorage)
        if (record && record[docType]) {
            return { src: record[docType], type: 'manual' };
        }

        // 2. Fallback: Automatic Discovery (Standard Folder Path)
        // User must place file in: documents/{admissionNo}_{docType}.jpg
        // We use admissionNo because it's easier for users to name files than internal UUIDs
        const students = this.get(STORAGE_KEYS.STUDENTS);
        const student = students.find(s => s.id === studentId);
        const fileId = student ? student.admissionNo : studentId;

        return {
            src: `documents/${fileId}_${docType}.jpg`,
            type: 'auto'
        };
    },

    getTeacherDocument(teacherId, docType) {
        const allDocs = this.get(STORAGE_KEYS.TEACHER_DOCUMENTS);
        const record = allDocs.find(d => d.teacherId === teacherId);

        if (record && record[docType]) {
            return { src: record[docType], type: 'manual' };
        }

        return {
            src: `documents/teachers/${teacherId}_${docType}.jpg`,
            type: 'auto'
        };
    },

    // Specific CRUD operations
    addItem(key, item) {
        const items = this.get(key);
        item.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
        item.createdAt = new Date().toISOString();
        items.push(item);
        this.save(key, items);
        return item;
    },

    updateItem(key, id, updatedData) {
        let items = this.get(key);
        items = items.map(item => item.id === id ? { ...item, ...updatedData, updatedAt: new Date().toISOString() } : item);
        this.save(key, items);
    },

    deleteItem(key, id) {
        let items = this.get(key);
        items = items.filter(item => item.id !== id);
        this.save(key, items);
    },

    getItemById(key, id) {
        const items = this.get(key);
        return items.find(item => item.id === id);
    },

    // Attendance specific
    saveAttendance(classId, date, attendanceData) {
        const records = this.get(STORAGE_KEYS.ATTENDANCE);
        const recordIndex = records.findIndex(r => r.classId === classId && r.date === date);

        if (recordIndex > -1) {
            records[recordIndex].data = attendanceData;
            records[recordIndex].updatedAt = new Date().toISOString();
        } else {
            records.push({
                id: Date.now().toString(),
                classId,
                date,
                data: attendanceData,
                createdAt: new Date().toISOString()
            });
        }
        this.save(STORAGE_KEYS.ATTENDANCE, records);
    },

    // Marks specific
    saveMarks(examId, classId, subjectId, marksData) {
        const marks = this.get(STORAGE_KEYS.MARKS);
        const recordIndex = marks.findIndex(m =>
            m.examId === examId &&
            m.classId === classId &&
            m.subjectId === subjectId
        );

        if (recordIndex > -1) {
            marks[recordIndex].data = marksData;
            marks[recordIndex].updatedAt = new Date().toISOString();
        } else {
            marks.push({
                id: Date.now().toString(),
                examId,
                classId,
                subjectId,
                data: marksData,
                createdAt: new Date().toISOString()
            });
        }
        this.save(STORAGE_KEYS.MARKS, marks);
    },

    // Backup & Restore
    exportAllData() {
        const data = {};
        Object.keys(STORAGE_KEYS).forEach(key => {
            const storageKey = STORAGE_KEYS[key];
            const value = localStorage.getItem(storageKey);
            if (value) {
                try {
                    data[storageKey] = JSON.parse(value);
                } catch (e) {
                    data[storageKey] = value;
                }
            }
        });

        // Include login attempts and other non-standard keys if needed
        const extraKeys = ['sms_login_attempts', 'sms_backup_last_date'];
        extraKeys.forEach(key => {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    data[key] = JSON.parse(value);
                } catch (e) {
                    data[key] = value;
                }
            }
        });

        const blob = new Blob([JSON.stringify(data, null, 4)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const filename = `SMS_Backup_${new Date().toISOString().split('T')[0]}.json`;
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        localStorage.setItem('sms_backup_last_date', Date.now().toString());
        return true;
    },

    async importAllData(jsonFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);

                    // Basic validation
                    if (!data[STORAGE_KEYS.USERS] && !data[STORAGE_KEYS.STUDENTS]) {
                        throw new Error('Invalid backup file format');
                    }

                    // Clear and restore
                    // We keep a temporary backup in case user cancels? No, just clear and restore as requested.
                    // Important: notify user to refresh after import.

                    Object.keys(data).forEach(key => {
                        const value = data[key];
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    });

                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('File reading failed'));
            reader.readAsText(jsonFile);
        });
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, STORAGE_KEYS };
}
