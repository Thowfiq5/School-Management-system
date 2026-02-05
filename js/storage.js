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
    USERS: 'sms_users', // For login system
    EXAM_TYPES: 'sms_exam_types',
    SUBMISSIONS: 'sms_submissions',
    NOTIFICATIONS: 'sms_notifications'
};

const Storage = {
    // Generic methods
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },

    save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
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
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Storage, STORAGE_KEYS };
}
