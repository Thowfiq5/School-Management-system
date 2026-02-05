/**
 * demo_data.js
 * Comprehensive demo data initialization for the School Management System.
 */

const DemoData = {
    init() {
        console.log('Initializing demo data...');

        // 1. Define Classes (Pre-KG to 12th, Sections A-D)
        const gradeNames = ['Pre-KG', 'LKG', 'UKG', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
        const sections = ['A', 'B', 'C', 'D'];
        const classes = [];
        let classIdCounter = 1;

        gradeNames.forEach((grade, gradeIndex) => {
            sections.forEach(section => {
                classes.push({
                    id: `c${classIdCounter}`,
                    name: grade,
                    section: section,
                    room: `${gradeIndex + 1}0${section.charCodeAt(0) - 64}` // e.g., 101, 102, 103, 104
                });
                classIdCounter++;
            });
        });
        Storage.save(STORAGE_KEYS.CLASSES, classes);

        // 2. Define Subjects
        const subjects = [
            { id: 'sub1', name: 'Mathematics', code: 'MATH' },
            { id: 'sub2', name: 'Science', code: 'SCI' },
            { id: 'sub3', name: 'English', code: 'ENG' },
            { id: 'sub4', name: 'Social Studies', code: 'SST' },
            { id: 'sub5', name: 'Hindi', code: 'HIN' },
            { id: 'sub6', name: 'Computer Science', code: 'CS' },
            { id: 'sub7', name: 'Physical Education', code: 'PE' },
            { id: 'sub8', name: 'Art & Craft', code: 'ART' }
        ];
        Storage.save(STORAGE_KEYS.SUBJECTS, subjects);

        // 3. Define Teachers (1 per class = 60 teachers)
        const teacherNames = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh', 'Anjali Verma',
            'Rahul Mehta', 'Kavita Reddy', 'Suresh Nair', 'Pooja Iyer', 'Manoj Joshi', 'Deepa Rao',
            'Arun Kumar', 'Meera Desai', 'Sanjay Pillai', 'Rekha Menon', 'Karthik Bhat', 'Swati Kulkarni',
            'Ramesh Agarwal', 'Nisha Kapoor', 'Ashok Pandey', 'Geeta Mishra', 'Vinod Tiwari', 'Sunita Jain',
            'Prakash Yadav', 'Ritu Saxena', 'Dinesh Chauhan', 'Lalita Sinha', 'Harish Dubey', 'Madhuri Trivedi'
        ];
        const subjectPool = subjects.map(s => s.name);
        const teachers = [];

        classes.forEach((cls, index) => {
            const teacherName = teacherNames[index % teacherNames.length] + ` ${Math.floor(index / teacherNames.length) + 1}`;
            const subject = subjectPool[index % subjectPool.length];

            teachers.push({
                id: `t${index + 1}`,
                name: teacherName,
                employeeId: `EMP${String(index + 1).padStart(3, '0')}`,
                subject: subject,
                mobile: `98765${String(43210 + index).slice(-5)}`,
                username: `teacher${index + 1}`,
                password: '123',
                assignedClassIds: [cls.id],
                permissions: ['markAttendance', 'manageHomework', 'enterMarks', 'manageStudents', 'manageNotices'],
                createdAt: new Date().toISOString()
            });
        });
        Storage.save(STORAGE_KEYS.TEACHERS, teachers);

        // 4. Define Students (20 per class = 1,200 students)
        const firstNames = [
            'Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Arnav', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya',
            'Aadhya', 'Ananya', 'Pari', 'Anika', 'Diya', 'Ira', 'Kavya', 'Myra', 'Sara', 'Zara',
            'Rohan', 'Karan', 'Nikhil', 'Rahul', 'Varun', 'Yash', 'Dhruv', 'Kabir', 'Laksh', 'Reyansh'
        ];
        const lastNames = [
            'Kumar', 'Sharma', 'Patel', 'Gupta', 'Singh', 'Verma', 'Mehta', 'Reddy', 'Nair', 'Iyer',
            'Joshi', 'Rao', 'Desai', 'Pillai', 'Menon', 'Bhat', 'Kulkarni', 'Agarwal', 'Kapoor', 'Pandey'
        ];
        const students = [];
        let studentIdCounter = 1;

        classes.forEach(cls => {
            for (let i = 1; i <= 20; i++) {
                const firstName = firstNames[(studentIdCounter - 1) % firstNames.length];
                const lastName = lastNames[Math.floor((studentIdCounter - 1) / firstNames.length) % lastNames.length];
                const name = `${firstName} ${lastName}`;
                const admissionNo = `STU${String(studentIdCounter).padStart(4, '0')}`;
                const gender = (studentIdCounter % 2 === 0) ? 'Female' : 'Male';
                const guardianName = `Guardian of ${firstName}`;

                students.push({
                    id: `s${studentIdCounter}`,
                    name: name,
                    admissionNo: admissionNo,
                    classId: cls.id,
                    className: cls.name,
                    section: cls.section,
                    dob: `${2010 + Math.floor(Math.random() * 5)}-${String(Math.floor(Math.random() * 12) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
                    gender: gender,
                    guardianName: guardianName,
                    mobile: `99${String(10000000 + studentIdCounter).slice(-8)}`,
                    username: admissionNo.toLowerCase(),
                    password: '123',
                    createdAt: new Date(2025, 0, Math.floor(studentIdCounter / 20) + 1).toISOString()
                });
                studentIdCounter++;
            }
        });
        Storage.save(STORAGE_KEYS.STUDENTS, students);

        // 5. Update Users Table (Sync for authentication)
        const users = [
            { username: 'admin@eduflow.com', password: '123', role: 'admin', name: 'System Administrator' },
            ...teachers.map(t => ({ username: t.username, password: t.password, role: 'teacher', name: t.name })),
            ...students.map(s => ({ username: s.username, password: s.password, role: 'student', name: s.name, classId: s.classId }))
        ];
        Storage.save(STORAGE_KEYS.USERS, users);

        // 6. Define Demo Documents
        const demoDocs = [
            {
                studentId: 's1',
                aadhar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                tc: null,
                birth: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
                updatedAt: new Date().toISOString()
            }
        ];
        Storage.save(STORAGE_KEYS.DOCUMENTS, demoDocs);

        // 7. Define Fee Structure
        const feeStructure = [
            { name: '1st Mid Term', amount: 1500 },
            { name: 'Quarterly Exam', amount: 3500 },
            { name: '2nd Mid Term', amount: 1500 },
            { name: 'Half Yearly Exam', amount: 4500 },
            { name: '3rd Mid Term', amount: 1500 },
            { name: 'Annual Exam', amount: 5000 }
        ];
        Storage.save(STORAGE_KEYS.FEE_STRUCTURE, feeStructure);

        // 8. Define Some Paid Fees
        const fees = [
            {
                id: 'REC01',
                studentId: 's1',
                examName: '1st Mid Term',
                amount: 1500,
                date: new Date().toISOString(),
                method: 'Online Payment'
            },
            {
                id: 'REC02',
                studentId: 's1',
                examName: 'Quarterly Exam',
                amount: 3500,
                date: new Date().toISOString(),
                method: 'Mock Payment'
            }
        ];
        Storage.save(STORAGE_KEYS.FEES, fees);

        // 9. Define Notices
        const notices = [
            { id: 'n1', title: 'Annual Sports Day 2026', content: 'We are excited to announce our Annual Sports Day on Feb 15th. All students must participate in at least one event.', author: 'Principal Office', date: '2026-01-20', createdAt: new Date().toISOString() },
            { id: 'n2', title: 'Half Yearly Result Declaration', content: 'Half Yearly Exam results will be declared this Friday at 10:00 AM in respective classrooms.', author: 'Examination Cell', date: '2026-01-22', createdAt: new Date().toISOString() },
            { id: 'n3', title: 'Science Fair Registration', content: 'Registration for the Science Fair is now open. Interested students from classes 10-12 can register in the lab.', author: 'Science HOD', date: '2026-01-21', createdAt: new Date().toISOString() },
            { id: 'n4', title: 'Holiday Declaration', content: 'The school will remain closed this Saturday for teacher training workshops.', author: 'Admin Office', date: '2026-01-22', createdAt: new Date().toISOString() }
        ];
        Storage.save(STORAGE_KEYS.NOTICES, notices);

        // 10. Define Homework
        const homework = [
            { id: 'hw1', classId: 'c1', subject: 'Mathematics', title: 'Quadratic Equations Exercise', description: 'Complete Exercise 4.2 and 4.3 from NCERT textbook.', dueDate: '2026-01-25', createdAt: new Date().toISOString() },
            { id: 'hw2', classId: 'c1', subject: 'Physics', title: 'Optics Lab Report', description: 'Submit the lab report for the refraction experiment performed yesterday.', dueDate: '2026-01-24', createdAt: new Date().toISOString() },
            { id: 'hw3', classId: 'c2', subject: 'English', title: 'Shakespeare Essay', description: 'Write a 500-word essay on the themes of Macbeth.', dueDate: '2026-01-26', createdAt: new Date().toISOString() },
            { id: 'hw4', classId: 'c3', subject: 'Computer Sci', title: 'Data Structures Project', description: 'Implement a basic linked list in JavaScript.', dueDate: '2026-01-28', createdAt: new Date().toISOString() }
        ];
        Storage.save(STORAGE_KEYS.HOMEWORK, homework);

        // 11. Define Attendance History (Dynamic for Current Month)
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const attendance = [];

        // Generate attendance for the last 5 days including today
        for (let i = 0; i < 5; i++) {
            const d = new Date(year, month, today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            // Create attendance for all classes
            for (let classIdx = 1; classIdx <= 5; classIdx++) {
                attendance.push({
                    id: `att-${dateStr}-c${classIdx}`,
                    classId: `c${classIdx}`,
                    date: dateStr,
                    data: { 's1': 'present', 's2': i % 3 === 0 ? 'absent' : 'present', 's3': 'present' },
                    createdAt: new Date().toISOString()
                });
            }
        }
        Storage.save(STORAGE_KEYS.ATTENDANCE, attendance);

        // 12. Define Marks/Report Card Data
        const marks = [
            { id: 'm1', examId: 'Unit Test I', classId: 'c1', subjectId: 'Mathematics', data: { 's1': '18', 's2': '19' }, createdAt: new Date().toISOString() },
            { id: 'm2', examId: 'Unit Test I', classId: 'c1', subjectId: 'Physics', data: { 's1': '17', 's2': '18' }, createdAt: new Date().toISOString() },
            { id: 'm3', examId: 'Quarterly Exam', classId: 'c1', subjectId: 'Mathematics', data: { 's1': '85', 's2': '92' }, createdAt: new Date().toISOString() },
            { id: 'm4', examId: 'Quarterly Exam', classId: 'c1', subjectId: 'Physics', data: { 's1': '78', 's2': '88' }, createdAt: new Date().toISOString() },
            { id: 'm5', examId: 'Annual Exam', classId: 'c1', subjectId: 'Mathematics', data: { 's1': '92', 's2': '95' }, createdAt: new Date().toISOString() },
            { id: 'm6', examId: 'Annual Exam', classId: 'c1', subjectId: 'Physics', data: { 's1': '88', 's2': '91' }, createdAt: new Date().toISOString() },
            // Add marks for other students
            { id: 'm7', examId: 'Unit Test I', classId: 'c2', subjectId: 'English', data: { 's3': '15', 's4': '19' }, createdAt: new Date().toISOString() },
            { id: 'm8', examId: 'Annual Exam', classId: 'c2', subjectId: 'English', data: { 's3': '75', 's4': '92' }, createdAt: new Date().toISOString() }
        ];
        Storage.save(STORAGE_KEYS.MARKS, marks);

        // 13. Define Exam Types
        const examTypes = [
            { id: 'et1', name: 'Unit Test I' },
            { id: 'et2', name: 'Quarterly Exam' },
            { id: 'et3', name: 'Unit Test II' },
            { id: 'et4', name: 'Annual Exam' }
        ];
        Storage.save(STORAGE_KEYS.EXAM_TYPES, examTypes);

        // 14. Initialize Notifications Storage
        Storage.save(STORAGE_KEYS.NOTIFICATIONS, []);
        Storage.save(STORAGE_KEYS.SUBMISSIONS, []);

        // 15. Add sample items for testing notifications
        const currentHomework = Storage.get(STORAGE_KEYS.HOMEWORK);
        currentHomework.push({
            id: 'HW-NEW-1',
            classId: 'c1', // 10-A
            className: '10',
            subject: 'Mathematics',
            dueDate: 'Tomorrow',
            description: 'Please complete the Exercise 4.2 from the textbook and submit the answers here.',
            teacher: 'Mr. Sharma',
            createdAt: new Date().toISOString()
        });
        Storage.save(STORAGE_KEYS.HOMEWORK, currentHomework);

        const currentNotices = Storage.get(STORAGE_KEYS.NOTICES);
        currentNotices.push({
            id: 'NOT-NEW-1',
            title: 'Inter-School Sports Meet 2026',
            content: 'Register your names for the upcoming sports meet by Friday. All students are encouraged to participate.',
            teacher: 'Physical Education Dept',
            createdAt: new Date().toISOString()
        });
        Storage.save(STORAGE_KEYS.NOTICES, currentNotices);

        // 13. Initialize Demo Notifications
        const now = new Date();
        const notifications = [];

        // Sample notifications for teacher1
        notifications.push({
            id: `notif-teacher-1`,
            userId: 'teacher1',
            userRole: 'teacher',
            type: 'attendance',
            title: 'Attendance Recorded',
            message: 'Attendance for Class 1st A has been successfully recorded.',
            icon: 'fas fa-calendar-check',
            color: '#10b981',
            timestamp: new Date(now.getTime() - 2 * 60000).toISOString(),
            read: false,
            priority: 'normal'
        });

        notifications.push({
            id: `notif-teacher-2`,
            userId: 'teacher1',
            userRole: 'teacher',
            type: 'notice',
            title: 'Staff Meeting',
            message: 'Staff meeting scheduled for tomorrow at 3:00 PM in the conference room.',
            icon: 'fas fa-bullhorn',
            color: '#f59e0b',
            timestamp: new Date(now.getTime() - 1 * 60000).toISOString(),
            read: false,
            priority: 'high'
        });

        notifications.push({
            id: `notif-teacher-3`,
            userId: 'teacher1',
            userRole: 'teacher',
            type: 'system',
            title: 'New Student Enrollment',
            message: 'A new student has been enrolled in your class.',
            icon: 'fas fa-user-plus',
            color: '#3b82f6',
            timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
            read: true,
            priority: 'normal'
        });

        // Sample notifications for student1
        notifications.push({
            id: `notif-student-1`,
            userId: 's1',
            userRole: 'student',
            type: 'homework',
            title: 'New Homework Assignment',
            message: 'Mathematics: Complete Exercise 4.2 from the textbook.',
            icon: 'fas fa-book-open',
            color: '#3b82f6',
            timestamp: new Date(now.getTime() - 3 * 60000).toISOString(),
            read: false,
            priority: 'normal'
        });

        notifications.push({
            id: `notif-student-2`,
            userId: 's1',
            userRole: 'student',
            type: 'notice',
            title: 'Important Announcement',
            message: 'Sports meet registration closes on Friday. Submit your names at the office.',
            icon: 'fas fa-bullhorn',
            color: '#f59e0b',
            timestamp: new Date(now.getTime() - 10 * 60000).toISOString(),
            read: false,
            priority: 'high'
        });

        notifications.push({
            id: `notif-student-3`,
            userId: 's1',
            userRole: 'student',
            type: 'fees',
            title: 'Fee Payment Reminder',
            message: 'February fees payment is due by 10th of this month.',
            icon: 'fas fa-money-bill',
            color: '#ef4444',
            timestamp: new Date(now.getTime() - 30 * 60000).toISOString(),
            read: true,
            priority: 'urgent'
        });

        // Sample notifications for admin
        notifications.push({
            id: `notif-admin-1`,
            userId: 'admin',
            userRole: 'admin',
            type: 'system',
            title: 'Database Backup Complete',
            message: 'Daily database backup has been successfully completed.',
            icon: 'fas fa-database',
            color: '#8b5cf6',
            timestamp: new Date(now.getTime() - 1 * 3600000).toISOString(),
            read: true,
            priority: 'normal'
        });

        notifications.push({
            id: `notif-admin-2`,
            userId: 'admin',
            userRole: 'admin',
            type: 'notice',
            title: 'Pending Approvals',
            message: '5 new teacher registrations pending approval. Review them in Admin Panel.',
            icon: 'fas fa-user-check',
            color: '#6366f1',
            timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
            read: false,
            priority: 'high'
        });

        Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);

        console.log('Demo data successfully loaded!');
    }
};
