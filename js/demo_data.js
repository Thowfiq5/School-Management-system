/**
 * demo_data.js
 * Comprehensive demo data initialization for the School Management System.
 */

const DemoData = {
    init() {
        console.log('Initializing demo data...');

        // 1. Define Classes (Pre-KG to 12th with Streams)
        const gradeNames = [
            'Pre-KG', 'LKG', 'UKG',
            '1st', '2nd', '3rd', '4th', '5th',
            '6th', '7th', '8th',
            '9th', '10th',
            '11th Science (PCM)', '11th Science (PCB)', '11th Science (PCMB)', '11th Commerce', '11th Humanities',
            '12th Science (PCM)', '12th Science (PCB)', '12th Science (PCMB)', '12th Commerce', '12th Humanities'
        ];
        const sections = ['A', 'B']; // Reduced sections to keep data size manageable
        const classes = [];
        let classIdCounter = 1;

        gradeNames.forEach((grade, gradeIndex) => {
            sections.forEach(section => {
                classes.push({
                    id: `c${classIdCounter}`,
                    name: grade,
                    section: section,
                    room: `${Math.floor(gradeIndex / 2) + 1}0${section.charCodeAt(0) - 64}`
                });
                classIdCounter++;
            });
        });
        Storage.save(STORAGE_KEYS.CLASSES, classes);

        // 2. Define Subjects from Curriculum
        const allUniqueSubjects = new Set();
        for (const level in SCHOOL_CURRICULUM) {
            for (const grade in SCHOOL_CURRICULUM[level]) {
                SCHOOL_CURRICULUM[level][grade].forEach(s => allUniqueSubjects.add(s));
            }
        }
        const subjects = Array.from(allUniqueSubjects).map((name, i) => ({
            id: `sub${i + 1}`,
            name: name,
            code: name.split(' ')[0].substring(0, 4).toUpperCase()
        }));
        Storage.save(STORAGE_KEYS.SUBJECTS, subjects);

        // 3. Define Teachers (Extensive Pool)
        const teacherNames = [
            'Rajesh Kumar', 'Priya Sharma', 'Amit Patel', 'Sneha Gupta', 'Vikram Singh', 'Anjali Verma',
            'Rahul Mehta', 'Kavita Reddy', 'Suresh Nair', 'Pooja Iyer', 'Manoj Joshi', 'Deepa Rao',
            'Arun Kumar', 'Meera Desai', 'Sanjay Pillai', 'Rekha Menon', 'Karthik Bhat', 'Swati Kulkarni',
            'Ramesh Agarwal', 'Nisha Kapoor', 'Ashok Pandey', 'Geeta Mishra', 'Vinod Tiwari', 'Sunita Jain',
            'Prakash Yadav', 'Ritu Saxena', 'Dinesh Chauhan', 'Lalita Sinha', 'Harish Dubey', 'Madhuri Trivedi',
            'Abhishek Das', 'Tanuja Nair', 'Siddharth Roy', 'Pallavi Ghosh', 'Sameer Kulkarni', 'Neha Shrivastava',
            'Rakesh Varma', 'Shilpa Shetty', 'Manish Pandey', 'Divya Bharti', 'Arjun Rampal', 'Kriti Sanon',
            'Varun Dhawan', 'Alia Bhatt', 'Ranbir Kapoor', 'Deepika Padukone', 'Shah Rukh Khan', 'Priyanka Chopra'
        ];

        const teachers = [];
        let teacherCounter = 1;

        // Ensure every subject in the entire school has at least one specialist teacher
        const subjectsList = Array.from(allUniqueSubjects);
        subjectsList.forEach((subjectName, i) => {
            const name = teacherNames[i % teacherNames.length];
            teachers.push({
                id: `t${teacherCounter}`,
                name: name,
                employeeId: `EMP${String(teacherCounter).padStart(3, '0')}`,
                subject: subjectName,
                mobile: `98765${String(43210 + teacherCounter).slice(-5)}`,
                username: `teacher${teacherCounter}`,
                password: '123',
                assignedClassIds: [], // Will be populated next
                permissions: ['markAttendance', 'manageHomework', 'enterMarks', 'manageStudents', 'manageNotices'],
                createdAt: new Date().toISOString()
            });
            teacherCounter++;
        });

        // Now assign these teachers to classes they teach in
        classes.forEach(cls => {
            const classSubjects = getSubjectsByGrade(cls.name);
            classSubjects.forEach(subName => {
                // Find a teacher who teaches this subject
                const teacher = teachers.find(t => t.subject === subName);
                if (teacher && !teacher.assignedClassIds.includes(cls.id)) {
                    teacher.assignedClassIds.push(cls.id);
                }
            });

            // Assign a class teacher (randomly from the teachers assigned to this class)
            const classStaff = teachers.filter(t => t.assignedClassIds.includes(cls.id));
            if (classStaff.length > 0) {
                cls.classTeacher = classStaff[Math.floor(Math.random() * classStaff.length)].name;
            }
        });

        Storage.save(STORAGE_KEYS.TEACHERS, teachers);
        Storage.save(STORAGE_KEYS.CLASSES, classes); // Save classes again to include classTeacher info

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
            { username: 'admin@smsportal.com', password: '123', role: 'admin', name: 'System Administrator' },
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
            { id: 'n1', title: 'New Curriculum Integrated', content: 'We have successfully updated our academic curriculum from Pre-KG to Grade 12. Check your classroom for the updated list of subjects.', author: 'Academic Dean', date: '2026-02-05', createdAt: new Date().toISOString() },
            { id: 'n2', title: 'Annual Sports Day 2026', content: 'We are excited to announce our Annual Sports Day on Feb 15th. All students must participate in at least one event.', author: 'Principal Office', date: '2026-01-20', createdAt: new Date().toISOString() },
            { id: 'n3', title: 'Half Yearly Result Declaration', content: 'Half Yearly Exam results will be declared this Friday at 10:00 AM in respective classrooms.', author: 'Examination Cell', date: '2026-01-22', createdAt: new Date().toISOString() },
            { id: 'n4', title: 'Science Fair Registration', content: 'Registration for the Science Fair is now open. Interested students from classes 10-12 can register in the lab.', author: 'Science HOD', date: '2026-01-21', createdAt: new Date().toISOString() }
        ];
        Storage.save(STORAGE_KEYS.NOTICES, notices);

        // 10. Define Homework
        const homework = [];
        classes.slice(0, 10).forEach((cls, i) => {
            const classSubjects = getSubjectsByGrade(cls.name);
            homework.push({
                id: `hw${i + 1}`,
                classId: cls.id,
                subject: classSubjects[0],
                title: `${classSubjects[0]} Weekly Assignment`,
                description: `Please complete the practice exercises from Chapter ${i + 1} and submit by the due date.`,
                dueDate: '2026-02-15',
                createdAt: new Date().toISOString()
            });
        });
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
        const marks = [];
        let markIdCounter = 1;

        // Generate marks for some students to show data
        const sampleClasses = classes.slice(0, 10);
        const examTypesList = ['Unit Test I', 'Quarterly Exam', 'Annual Exam'];

        sampleClasses.forEach(cls => {
            const classSubjects = getSubjectsByGrade(cls.name);
            const classStudents = students.filter(s => s.classId === cls.id);

            examTypesList.forEach(exam => {
                classSubjects.slice(0, 5).forEach(subject => {
                    const markData = {};
                    classStudents.forEach(stu => {
                        const max = (exam.includes('Unit')) ? 20 : 100;
                        markData[stu.id] = (Math.floor(Math.random() * (max * 0.4)) + (max * 0.6)).toString();
                    });

                    marks.push({
                        id: `m${markIdCounter++}`,
                        examId: exam,
                        classId: cls.id,
                        subjectId: subject,
                        data: markData,
                        createdAt: new Date().toISOString()
                    });
                });
            });
        });
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
