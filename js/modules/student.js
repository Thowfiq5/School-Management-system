/**
 * student.js
 * Student and Parent module for viewing attendance, marks, homework, and fees.
 */

const StudentModule = {
    // Shared Helper to get student data (either for self or for parent's ward)
    getStudentData(user) {
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        console.log('Fetching student data for user:', user.username, 'Total students in DB:', students.length);

        if (user.role === 'student') {
            const student = students.find(s => s.admissionNo === user.username);
            if (!student) {
                console.warn('Student record not found by admissionNo! Attempting fallback by name/username...');
                return students.find(s => s.username === user.username || s.name === user.name);
            }
            return student;
        } else if (user.role === 'parent') {
            return students.find(s => 'p_' + s.admissionNo === user.username);
        }
        return null;
    },

    schoolPortal(container, user) {
        const notices = Storage.get(STORAGE_KEYS.NOTICES);
        this.markAllNoticesAsRead(false); // Mark all as read silently when entering notices page

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2.5rem; text-align: center; margin-bottom: 2rem; background: linear-gradient(rgba(79, 70, 229, 0.05), rgba(79, 70, 229, 0.05)); border: 1px solid var(--primary);">
                <i class="fas fa-school fa-3x" style="color: var(--primary); margin-bottom: 1rem;"></i>
                <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Welcome to Portal</h2>
                
                ${(() => {
                const student = this.getStudentData(user);
                if (!student) return '';
                const allHomework = Storage.get(STORAGE_KEYS.HOMEWORK).filter(hw => hw.classId === student.classId);
                const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS);
                const notices = Storage.get(STORAGE_KEYS.NOTICES);
                const userNotifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS).find(n => n.userId === user.username) || { userId: user.username, readNoticeIds: [] };

                const pendingHw = allHomework.filter(hw => !submissions.some(s => s.homeworkId === hw.id && s.studentId === student.id));
                const newNotices = notices.filter(n => !userNotifications.readNoticeIds.includes(n.id));

                if (pendingHw.length > 0 || newNotices.length > 0) {
                    return `
                        <div style="background: var(--danger); color: white; padding: 6px 16px; border-radius: 20px; display: inline-flex; align-items: center; gap: 12px; font-size: 0.75rem; margin-bottom: 1.5rem; animation: pulse 2s infinite; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                            <i class="fas fa-bell"></i>
                            <div style="display: flex; align-items: center; gap: 8px;">
                                ${newNotices.length > 0 ? `<strong>${newNotices.length}</strong> New Notice${newNotices.length > 1 ? 's' : ''}` : ''}
                                ${newNotices.length > 0 && pendingHw.length > 0 ? '<span style="opacity: 0.5;">|</span>' : ''}
                                ${pendingHw.length > 0 ? `<strong>${pendingHw.length}</strong> Pending Task${pendingHw.length > 1 ? 's' : ''}` : ''}
                            </div>
                            <button onclick="StudentModule.markAllNoticesAsRead()" style="background: rgba(255,255,255,0.2); border: none; color: white; cursor: pointer; padding: 2px 8px; border-radius: 10px; font-size: 0.65rem; transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                                <i class="fas fa-check-all"></i> Dismiss All
                            </button>
                        </div>
                    `;
                }
                return '';
            })()}

                <p style="color: var(--gray-600); max-width: 600px; margin: 0 auto;">Your one-stop destination for school news, updates, and academic records. Please review the latest notices below before proceeding to your class.</p>
                
                <div style="margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;">
                    <button class="btn btn-primary" onclick="loadModule('studentDashboard', 'student-dash', 'My Classroom')">
                        <i class="fas fa-sign-in-alt"></i> Enter My Classroom
                    </button>
                    <button class="btn glass-panel" onclick="loadModule('viewNotices', 'view-notices', 'School Notices')">
                        <i class="fas fa-bullhorn"></i> View All Notices
                    </button>
                </div>
            </div>

            <div class="responsive-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <div>
                    <h3>Latest School Notices</h3>
                    <div style="margin-top: 1rem; display: grid; gap: 1rem;">
                        ${notices.slice(-3).reverse().map(n => `
                            <div class="glass-card" style="padding: 1rem;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h4 style="margin: 0;">${n.title}</h4>
                                    <span style="font-size: 0.7rem; color: var(--gray-400);">${new Date(n.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style="font-size: 0.8125rem; color: var(--gray-600); margin-top: 5px;">${n.content.substring(0, 100)}...</p>
                            </div>
                        `).join('') || '<p style="color: var(--gray-400);">No recent notices.</p>'}
                    </div>
                </div>
                <div>
                    <h3>School Info</h3>
                    <div class="glass-panel" style="margin-top: 1rem; padding: 1rem; font-size: 0.875rem;">
                        <p><strong>Session:</strong> 2025-26</p>
                        <p><strong>Affiliation:</strong> CBSE #1234567</p>
                        <p><strong>Contact:</strong> +91 98765 43210</p>
                        <p><strong>Address:</strong> 123, School Road, New Delhi, India</p>
                    </div>
                </div>
            </div>
        `;
    },

    studentDashboard(container, user) {
        const student = this.getStudentData(user);
        if (!student) return container.innerHTML = '<p>Student records not found in the system.</p>';

        // Auto-select class for students
        if (user.role === 'student' && student.classId) {
            sessionStorage.setItem('selectedClassId', student.classId);
        }

        const classes = Storage.get(STORAGE_KEYS.CLASSES);

        // This is the "Select the Class" part the user requested
        if (!sessionStorage.getItem('selectedClassId')) {
            container.innerHTML = `
                <div class="glass-panel" style="padding: 2.5rem; text-align: center; max-width: 500px; margin: 4rem auto;">
                    <i class="fas fa-chalkboard fa-3x" style="color: var(--accent); margin-bottom: 1rem;"></i>
                    <h3>Select Your Class to Continue</h3>
                    <p style="color: var(--gray-500); margin-bottom: 2rem;">Please confirm which class and section you are entering for this session.</p>
                    
                    <div class="form-group" style="text-align: left;">
                        <label class="form-label">Available Classes</label>
                        <select id="student-class-select" class="form-control">
                            <option value="">-- Choose Your Class --</option>
                            ${classes.map(c => `<option value="${c.id}" ${student.className === c.name && student.section === c.section ? 'selected' : ''}>${c.name} - ${c.section}</option>`).join('')}
                        </select>
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%; margin-top: 1rem;" onclick="StudentModule.confirmClassSelection()">
                        Continue to Dashboard
                    </button>
                    
                    <p style="font-size: 0.75rem; color: var(--gray-400); margin-top: 1.5rem;">
                        <i class="fas fa-info-circle"></i> In demo mode, your assigned class is pre-selected for convenience.
                    </p>
                </div>
            `;
            return;
        }

        const selectedClassId = sessionStorage.getItem('selectedClassId');
        const selectedClass = classes.find(c => c.id === selectedClassId);
        const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const allHomework = Storage.get(STORAGE_KEYS.HOMEWORK).filter(hw => hw.classId === selectedClassId);
        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS);
        const notices = Storage.get(STORAGE_KEYS.NOTICES);
        const userNotifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS).find(n => n.userId === user.username) || { userId: user.username, readNoticeIds: [] };

        // Notification Logic
        const pendingHomework = allHomework.filter(hw => !submissions.some(s => s.homeworkId === hw.id && s.studentId === student.id));
        const newNotices = notices.filter(n => !userNotifications.readNoticeIds.includes(n.id));

        let notificationsHtml = '';

        // Notice Alerts
        newNotices.forEach(n => {
            notificationsHtml += `
                <div class="glass-panel" style="background: rgba(79, 70, 229, 0.1); border: 1px solid var(--primary); padding: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem; position: relative;">
                    <i class="fas fa-bullhorn fa-lg" style="color: var(--primary);"></i>
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: var(--primary);">New Announcement</h4>
                        <p style="margin: 0; font-size: 0.8125rem;">${n.title}</p>
                    </div>
                    <button class="btn" style="font-size: 0.75rem; color: var(--primary);" onclick="StudentModule.markNoticeAsRead('${n.id}')">Dismiss</button>
                    <button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.75rem;" onclick="loadModule('viewNotices', 'view-notices', 'Notices')">View</button>
                </div>
            `;
        });

        // Homework Alerts
        if (pendingHomework.length > 0) {
            notificationsHtml += `
                <div class="glass-panel" style="background: rgba(245, 158, 11, 0.1); border: 1px solid var(--accent); padding: 1rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-tasks fa-lg" style="color: var(--accent);"></i>
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: var(--accent);">Pending Homework</h4>
                        <p style="margin: 0; font-size: 0.8125rem;">You have ${pendingHomework.length} assignments to finish (e.g., ${pendingHomework[0].subject}).</p>
                    </div>
                    <button class="btn btn-primary" style="background: var(--accent); border: none;" onclick="loadModule('viewHomework', 'homework', 'My Homework')">Complete Now</button>
                </div>
            `;
        }

        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE);
        const studentAttendance = attendance.filter(a => a.data[student.id]).map(a => ({ date: a.date, status: a.data[student.id] }));
        const presentCount = studentAttendance.filter(a => a.status === 'present').length;
        const totalDays = studentAttendance.length;
        const percentage = totalDays > 0 ? ((presentCount / totalDays) * 100).toFixed(1) : 0;

        // Fee Alert Logic
        const feeStructure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE);
        const classFee = (feeStructure && typeof feeStructure === 'object') ? (feeStructure[student.classId] || 0) : 0;
        const payments = Storage.get(STORAGE_KEYS.FEES).filter(p => p.studentId === student.id);
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
        const balance = classFee - totalPaid;

        let feeAlertHtml = '';
        if (balance > 0) {
            feeAlertHtml = `
                <div class="glass-panel" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); padding: 1rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 1rem;">
                    <i class="fas fa-exclamation-circle fa-2x" style="color: var(--danger);"></i>
                    <div style="flex: 1;">
                        <h4 style="margin: 0; color: var(--danger);">Pending Fee detected</h4>
                        <p style="margin: 0; font-size: 0.8125rem;">You have a pending balance of <strong>₹ ${balance}</strong>. Please clear your dues to ensure uninterrupted access to school services.</p>
                    </div>
                    <button class="btn btn-primary" style="background: var(--danger); border: none;" onclick="loadModule('viewFees', 'view-fees', 'Fee Status')">Pay Now</button>
                </div>
            `;
        }

        container.innerHTML = `
            ${feeAlertHtml}
            ${notificationsHtml}
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="glass-card" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Overall Attendance</p>
                            <h3 style="font-size: 2rem; color: white;">${percentage}%</h3>
                        </div>
                        <i class="fas fa-user-check fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
                <div class="glass-card" style="background: linear-gradient(135deg, #10b981, #34d399); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Class Grade</p>
                            <h3 style="font-size: 2rem; color: white;">A1</h3>
                        </div>
                        <i class="fas fa-star fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
                <div class="glass-card" style="background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Pending Tasks</p>
                            <h3 style="font-size: 2rem; color: white;">${allHomework.length}</h3>
                        </div>
                        <i class="fas fa-clock fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
            
            <div class="responsive-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
                <div>
                    <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3>My Subjects & Teachers</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
                            ${(() => {
                const allSubjects = Storage.get(STORAGE_KEYS.SUBJECTS);
                const classSubjectNames = getSubjectsByGrade(selectedClass.name);
                const classSubjects = allSubjects.filter(s => classSubjectNames.includes(s.name));

                return classSubjects.map(sub => {
                    // Find a teacher who teaches this subject AND is assigned to this class
                    const teacher = teachers.find(t => t.subject === sub.name && t.assignedClassIds.includes(selectedClassId)) || { name: 'Assigned' };
                    return `
                                    <div class="glass-card" style="padding: 1rem; border-left: 3px solid var(--primary); display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
                                        <div style="font-weight: 700; color: var(--gray-900);">${sub.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--gray-500); margin-top: 8px; display: flex; align-items: center; gap: 4px;">
                                            <i class="fas fa-chalkboard-teacher" style="font-size: 0.65rem;"></i> ${teacher.name}
                                        </div>
                                    </div>
                                `;
                }).join('');
            })()}
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 1.5rem;">
                        <h3>Recent Activity</h3>
                        <div style="margin-top: 1rem;">
                            ${studentAttendance.slice(-3).reverse().map(a => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--gray-100);">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${a.status === 'present' ? 'var(--success)' : 'var(--danger)'};"></div>
                                    <div style="flex: 1; font-size: 0.8125rem;">Attendance for <strong>${new Date(a.date).toLocaleDateString()}</strong>: <strong style="color: ${a.status === 'present' ? 'var(--success)' : 'var(--danger)'}">${a.status.toUpperCase()}</strong></div>
                                </div>
                            `).join('')}
                            ${allHomework.slice(-2).reverse().map(hw => `
                                <div style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--gray-100);">
                                    <div style="width: 8px; height: 8px; border-radius: 50%; background: var(--primary);"></div>
                                    <div style="flex: 1; font-size: 0.8125rem;">New Homework: <strong>${hw.subject}</strong> - Due ${hw.dueDate}</div>
                                </div>
                            `).join('')}
                            ${(studentAttendance.length === 0 && allHomework.length === 0) ? '<p style="color: var(--gray-400); font-size: 0.875rem;">No recent activities found.</p>' : ''}
                        </div>
                    </div>
                </div>

                <div>
                    <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                        <h3>My Identity</h3>
                        <div style="text-align: center; margin-top: 1.5rem;">
                            <div style="width: 80px; height: 80px; border-radius: 50%; background: var(--gray-100); margin: 0 auto 1rem auto; display: flex; align-items: center; justify-content: center; overflow: hidden; font-size: 2rem; color: var(--primary); font-weight: 800;">
                                ${student.photo ? `<img src="${student.photo}" style="width:100%; height:100%; object-fit:cover;">` : student.name.charAt(0)}
                            </div>
                            <h4 style="margin: 0;">${student.name}</h4>
                            <p style="font-size: 0.8125rem; color: var(--gray-500);">${student.admissionNo}</p>
                            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-100); text-align: left; font-size: 0.8125rem;">
                                <p><strong>Class:</strong> ${selectedClass.name} ${selectedClass.section}</p>
                                <p><strong>Room:</strong> ${selectedClass.room || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    <div class="glass-panel" style="padding: 1.5rem;">
                        <h3>Tools</h3>
                        <div style="display: grid; gap: 10px; margin-top: 1rem;">
                            <button class="btn glass-card" style="width: 100%;" onclick="loadModule('viewReportCard', 'view-marks', 'Report Card')">
                                <i class="fas fa-medal"></i> Academic Result
                            </button>
                            <button class="btn glass-card" style="width: 100%;" onclick="loadModule('manageDocuments', 'my-docs', 'My Documents')">
                                <i class="fas fa-file-alt"></i> Document Vault
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    confirmClassSelection() {
        const classId = document.getElementById('student-class-select').value;
        if (!classId) return NotificationSystem.showToast('Selection Required', 'Please select a class to continue.', 'warning');

        sessionStorage.setItem('selectedClassId', classId);

        // Reload dashboard
        const user = Auth.getCurrentUser();
        const container = document.getElementById('content-area');
        this.studentDashboard(container, user);
    },

    viewAttendance(container, user) {
        const student = this.getStudentData(user);
        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE);

        // Initialize with current date or stored state
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth();
        let currentYear = currentDate.getFullYear();

        const renderCalendar = (month, year) => {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay(); // 0 = Sunday

            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            // Filter attendance for this month
            // Attendance stored as YYYY-MM-DD
            const monthAttendance = attendance.filter(a => {
                const d = new Date(a.date);
                return d.getMonth() === month && d.getFullYear() === year && a.data[student.id];
            });

            let calendarHtml = `
                <div class="glass-panel" style="padding: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                        <button class="btn" onclick="StudentModule.changeMonth(-1)">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 style="margin: 0;">${monthNames[month]} ${year}</h3>
                        <button class="btn" onclick="StudentModule.changeMonth(1)">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px; text-align: center; font-weight: bold; color: var(--gray-500); margin-bottom: 1rem;">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>

                    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 10px;">
            `;

            // Empty slots for days before start of month
            for (let i = 0; i < startingDay; i++) {
                calendarHtml += `<div></div>`;
            }

            // Days
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const record = monthAttendance.find(a => a.date === dateStr);
                let statusColor = 'var(--gray-100)'; // Default / No Data
                let statusText = '';
                let textColor = 'var(--gray-800)';

                if (record) {
                    const status = record.data[student.id];
                    if (status === 'present') {
                        statusColor = '#dcfce7'; // Green bg
                        textColor = '#166534';
                        statusText = 'P';
                    } else if (status === 'absent') {
                        statusColor = '#fee2e2'; // Red bg
                        textColor = '#991b1b';
                        statusText = 'A';
                    }
                } else {
                    // Check if it's a weekend (Sunday)
                    const checkDate = new Date(year, month, day);
                    if (checkDate.getDay() === 0) {
                        statusColor = '#f3f4f6';
                        textColor = '#9ca3af';
                        statusText = 'Sun';
                    }
                }

                calendarHtml += `
                    <div style="aspect-ratio: 1; background: ${statusColor}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                        <span style="font-size: 0.9rem; font-weight: 600; color: ${textColor};">${day}</span>
                        ${statusText ? `<span style="font-size: 0.7rem; color: ${textColor}; font-weight: bold;">${statusText}</span>` : ''}
                    </div>
                `;
            }

            calendarHtml += `</div>
                <div style="margin-top: 1.5rem; display: flex; gap: 1.5rem; justify-content: center; font-size: 0.8rem; color: var(--gray-600);">
                    <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 12px; height: 12px; background: #dcfce7; border-radius: 2px;"></div> Present</div>
                    <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 12px; height: 12px; background: #fee2e2; border-radius: 2px;"></div> Absent</div>
                    <div style="display: flex; align-items: center; gap: 5px;"><div style="width: 12px; height: 12px; background: var(--gray-100); border-radius: 2px;"></div> No Info</div>
                </div>
            </div>`;

            return calendarHtml;
        };

        // We store state in the module instance to handle navigation
        this.currentAttendanceDate = this.currentAttendanceDate || new Date();

        // Helper to update view
        this.changeMonth = (offset) => {
            this.currentAttendanceDate.setMonth(this.currentAttendanceDate.getMonth() + offset);
            this.viewAttendance(container, user); // Re-render
        };

        container.innerHTML = renderCalendar(this.currentAttendanceDate.getMonth(), this.currentAttendanceDate.getFullYear());
    },

    viewReportCard(container, user) {
        const student = this.getStudentData(user);
        if (!student) return container.innerHTML = '<p>Student records not found.</p>';

        const marks = Storage.get(STORAGE_KEYS.MARKS);
        const allExamTypes = Storage.get(STORAGE_KEYS.EXAM_TYPES);
        const allSubjects = Storage.get(STORAGE_KEYS.SUBJECTS);

        const selectedExam = sessionStorage.getItem('reportFilterExam') || 'all';

        // Filter marks for this student
        const studentMarks = marks.filter(m => m.data && m.data[student.id]);

        const totalMarksMap = {
            'Unit Test I': 20,
            'Unit Test II': 20,
            'Unit Test III': 20,
            'Quarterly Exam': 100,
            'Half Yearly Exam': 100,
            'Annual Exam': 100
        };

        const getExamTotal = (name) => {
            if (totalMarksMap[name]) return totalMarksMap[name];
            if (name.toLowerCase().includes('unit')) return 20;
            if (name.toLowerCase().includes('monthly')) return 50;
            return 100;
        };

        container.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #report-card-print, #report-card-print * { visibility: visible; }
                    #report-card-print { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; padding: 0 !important; }
                    .btn-print-hide, .filter-controls, .nav-sidebar, .top-bar { display: none !important; }
                }
                .marks-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
                .marks-table th, .marks-table td { padding: 12px; border: 1px solid var(--gray-200); text-align: left; }
                .marks-table th { background: var(--gray-50); color: var(--gray-700); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; }
                .marks-table tfoot { font-weight: 700; background: var(--gray-50); }
                .grade-badge { padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 0.75rem; }
                .grade-A { background: #dcfce7; color: #166534; }
                .grade-B { background: #dbeafe; color: #1e40af; }
                .grade-C { background: #fef9c3; color: #854d0e; }
                .grade-D { background: #ffedd5; color: #9a3412; }
                .grade-E { background: #fee2e2; color: #991b1b; }
            </style>

            <div class="glass-panel filter-controls" style="padding: 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <div class="form-group" style="margin: 0; min-width: 200px;">
                            <label class="form-label" style="font-size: 0.75rem;">Select Exam Type</label>
                            <select id="filter-exam" class="form-control" onchange="StudentModule.applyReportFilters()">
                                <option value="all" ${selectedExam === 'all' ? 'selected' : ''}>Cumulative View (All Exams)</option>
                                ${allExamTypes.map(e => `<option value="${e.name}" ${selectedExam === e.name ? 'selected' : ''}>${e.name}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary" onclick="window.print()">
                        <i class="fas fa-print"></i> Print Marksheet
                    </button>
                </div>
            </div>

            <div class="glass-panel" style="padding: 3rem; max-width: 900px; margin: 0 auto; background: white; color: #1a1a1a;" id="report-card-print">
                <div style="text-align: center; margin-bottom: 2.5rem; border-bottom: 2px solid var(--primary); padding-bottom: 1.5rem;">
                    <h1 style="margin: 0; color: var(--primary); font-size: 2.5rem; letter-spacing: -1px;">SCHOOL MANAGEMENT SYSTEM</h1>
                    <p style="margin: 5px 0; font-weight: 600; letter-spacing: 3px; color: var(--gray-600);">INTERNATIONAL SCHOOL</p>
                    <p style="font-size: 0.8125rem; color: var(--gray-400);">Academic Session 2025-26</p>
                    <h2 style="margin-top: 15px; font-size: 1.25rem; text-decoration: underline;">PROGRESS REPORT</h2>
                </div>

                <div class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2.5rem; font-size: 0.875rem;">
                    <div style="display: grid; gap: 10px;">
                        <div><strong style="color: var(--gray-400); font-size: 0.7rem; text-transform: uppercase;">Student Name</strong><br><span style="font-size: 1.125rem; font-weight: 700;">${student.name}</span></div>
                        <div><strong style="color: var(--gray-400); font-size: 0.7rem; text-transform: uppercase;">Admission No</strong><br><span>${student.admissionNo}</span></div>
                    </div>
                    <div style="display: grid; gap: 10px; text-align: right;">
                        <div><strong style="color: var(--gray-400); font-size: 0.7rem; text-transform: uppercase;">Class & Section</strong><br><span style="font-weight: 600;">${student.className} - ${student.section}</span></div>
                        <div><strong style="color: var(--gray-400); font-size: 0.7rem; text-transform: uppercase;">Exam Type</strong><br><span style="color: var(--primary); font-weight: 700;">${selectedExam === 'all' ? 'Annual Summary' : selectedExam}</span></div>
                    </div>
                </div>

                <div class="table-responsive">
                    ${selectedExam === 'all' ? this.renderCumulativeTable(student, studentMarks, allExamTypes) : this.renderDetailedTable(student, studentMarks, selectedExam, getExamTotal)}
                </div>

                <div style="margin-top: 3rem; background: var(--gray-50); padding: 1.5rem; border-radius: 8px;">
                    <p style="font-size: 0.7rem; color: var(--gray-400); text-transform: uppercase; margin-bottom: 5px;">Class Teacher's Remarks</p>
                    <p style="margin: 0; font-style: italic; color: var(--gray-700);">"Excellent performance overall. Keeping a consistent effort will ensure even better results in the future."</p>
                </div>

                <div class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 2rem; margin-top: 5rem; text-align: center;">
                    <div><div style="border-bottom: 1px solid var(--gray-300); margin-bottom: 8px;"></div><span style="font-size: 0.65rem; text-transform: uppercase;">Class Teacher</span></div>
                    <div><div style="border-bottom: 1px solid var(--gray-300); margin-bottom: 8px;"></div><span style="font-size: 0.65rem; text-transform: uppercase;">Principal</span></div>
                    <div><div style="border-bottom: 1px solid var(--gray-300); margin-bottom: 8px;"></div><span style="font-size: 0.65rem; text-transform: uppercase;">Parent</span></div>
                </div>
            </div>
        `;
    },

    renderDetailedTable(student, studentMarks, selectedExam, getExamTotal) {
        const examMarks = studentMarks.filter(m => m.examId === selectedExam);
        const totalMaxMarks = getExamTotal(selectedExam);

        let grandTotalObtained = 0;
        let grandTotalPossible = 0;

        const rows = examMarks.map(m => {
            const score = parseFloat(m.data[student.id]) || 0;
            const percentage = (score / totalMaxMarks) * 100;
            const grade = this.calculateGrade(score, totalMaxMarks);
            grandTotalObtained += score;
            grandTotalPossible += totalMaxMarks;

            return `
                <tr>
                    <td>${m.subjectId}</td>
                    <td style="text-align: center; font-weight: 600;">${score}</td>
                    <td style="text-align: center;">${totalMaxMarks}</td>
                    <td style="text-align: center;">${percentage.toFixed(1)}%</td>
                    <td style="text-align: center;"><span class="grade-badge grade-${grade.charAt(0)}">${grade}</span></td>
                </tr>
            `;
        }).join('');

        const overallPercentage = grandTotalPossible > 0 ? (grandTotalObtained / grandTotalPossible) * 100 : 0;
        const overallGrade = this.calculateGrade(grandTotalObtained / (grandTotalPossible / 100)); // Normalize to 100 scale

        return `
            <table class="marks-table">
                <thead>
                    <tr>
                        <th>Scholastic Areas</th>
                        <th style="text-align: center;">Marks Obtained</th>
                        <th style="text-align: center;">Max Marks</th>
                        <th style="text-align: center;">Percentage</th>
                        <th style="text-align: center;">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: var(--gray-400);">No results available for this exam.</td></tr>'}
                </tbody>
                <tfoot>
                    <tr>
                        <td>GRAND TOTAL</td>
                        <td style="text-align: center; color: var(--primary);">${grandTotalObtained.toFixed(1)}</td>
                        <td style="text-align: center;">${grandTotalPossible}</td>
                        <td style="text-align: center; color: var(--primary);">${overallPercentage.toFixed(1)}%</td>
                        <td style="text-align: center;"><span class="grade-badge grade-${overallGrade.charAt(0)}">${overallGrade}</span></td>
                    </tr>
                </tfoot>
            </table>
        `;
    },

    renderCumulativeTable(student, studentMarks, allExamTypes) {
        const subjects = [...new Set(studentMarks.map(m => m.subjectId))];
        const examNames = allExamTypes.map(e => e.name);

        return `
            <table class="marks-table">
                <thead>
                    <tr>
                        <th>Subject</th>
                        ${examNames.map(name => `<th style="text-align:center; font-size: 0.7rem;">${name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${subjects.map(sub => {
            return `
                            <tr>
                                <td style="font-weight: 600;">${sub}</td>
                                ${examNames.map(exam => {
                const mark = studentMarks.find(m => m.subjectId === sub && m.examId === exam);
                return `<td style="text-align:center;">${mark ? mark.data[student.id] : '-'}</td>`;
            }).join('')}
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    },

    calculateGrade(score, totalMarks = 100) {
        const percentage = (score / totalMarks) * 100;
        if (percentage >= 91) return 'A1';
        if (percentage >= 81) return 'A2';
        if (percentage >= 71) return 'B1';
        if (percentage >= 61) return 'B2';
        if (percentage >= 51) return 'C1';
        if (percentage >= 41) return 'C2';
        if (percentage >= 33) return 'D';
        return 'E';
    },

    viewHomework(container, user) {
        const student = this.getStudentData(user);
        const homework = Storage.get(STORAGE_KEYS.HOMEWORK).filter(hw => hw.classId === student.classId);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 1.5rem;">
                <h3>Homework & Assignments</h3>
                <div style="margin-top: 1.5rem; display: grid; gap: 1rem;">
                    ${homework.reverse().map(hw => `
                        <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid var(--primary);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                                <h4 style="margin: 0;">${hw.subject}</h4>
                                <span style="font-size: 0.75rem; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 4px;">Due: ${hw.dueDate}</span>
                            </div>
                            <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem;">${hw.description}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                                <div style="font-size: 0.75rem; color: var(--gray-400);">Posted by ${hw.teacher}</div>
                                ${(() => {
                const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS);
                const sub = submissions.find(s => s.homeworkId === hw.id && s.studentId === student.id);
                if (sub) {
                    const isGraded = sub.status === 'Graded';
                    return `
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 5px;">
                            <span class="badge" style="background: ${isGraded ? 'var(--success-light)' : 'var(--primary-light)'}; color: ${isGraded ? 'var(--success)' : 'var(--primary)'};">
                                <i class="fas ${isGraded ? 'fa-check-double' : 'fa-check-circle'}"></i> 
                                ${isGraded ? 'Graded' : 'Submitted'} on ${new Date(sub.submittedAt).toLocaleDateString()}
                            </span>
                            ${isGraded ? `
                                <div style="font-size: 0.75rem; color: var(--success); font-weight: 600;">
                                    Score: ${sub.score}/100 
                                    <i class="fas fa-info-circle" style="cursor: pointer;" title="${sub.remarks}" onclick="NotificationSystem.showToast('Teacher Feedback', 'Feedback: ${sub.remarks}', 'info')"></i>
                                </div>
                            ` : ''}
                        </div>
                    `;
                } else {
                    return `<button class="btn btn-primary" style="padding: 4px 12px; font-size: 0.75rem;" onclick="StudentModule.showSubmissionForm('${hw.id}', '${hw.subject}')">Submit Now</button>`;
                }
            })()}
                            </div>
                        </div>
                    `).join('') || '<p style="text-align: center; color: var(--gray-400);">No homework assigned to your class yet.</p>'}
                </div>
            </div>
        `;
    },

    showSubmissionForm(hwId, subject) {
        const content = `
            <form id="submission-form">
                <div class="form-group">
                    <label class="form-label">Submission Content / Links</label>
                    <textarea id="sub-content" class="form-control" rows="4" placeholder="Type your assignment answer here or paste links to documents..."></textarea>
                </div>
                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">Attach File (Optional)</label>
                    <input type="file" id="sub-file" class="form-control" accept="image/*,application/pdf">
                </div>
            </form>
        `;

        // Use AdminModule.showModal temporarily if it's available globally, or implement local modal if needed.
        // Since AdminModule might not be loaded, I'll use a simple prompt/confirm or check if there's a global modal helper.
        // Actually, looking at index.html, AdminModule is loaded as a script. But let's check if we have a generic modal helper.

        // I'll use a direct modal implementation here for robustness
        const modalHtml = `
            <div id="sub-modal" class="modal-overlay" style="display: flex;">
                <div class="glass-panel" style="width: 450px; padding: 2rem; position: relative; animation: slideIn 0.3s ease;">
                    <h3 style="margin-bottom: 1.5rem;">Submit: ${subject}</h3>
                    ${content}
                    <div style="display: flex; gap: 10px; margin-top: 2rem;">
                        <button class="btn glass-panel" style="flex: 1;" onclick="document.getElementById('sub-modal').remove()">Cancel</button>
                        <button class="btn btn-primary" style="flex: 1;" onclick="StudentModule.handleSubmission('${hwId}')">Submit Assignment</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    },

    handleSubmission(hwId) {
        const content = document.getElementById('sub-content').value;
        const fileInput = document.getElementById('sub-file');
        const student = this.getStudentData(Auth.getCurrentUser());

        if (!content && (!fileInput.files || !fileInput.files[0])) {
            return NotificationSystem.showToast('Input Error', 'Please provide some content or attach a file.', 'warning');
        }

        const submit = () => {
            const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS);
            submissions.push({
                id: 'SUB' + Date.now().toString(36).toUpperCase(),
                homeworkId: hwId,
                studentId: student.id,
                content,
                submittedAt: new Date().toISOString()
            });
            Storage.save(STORAGE_KEYS.SUBMISSIONS, submissions);
            document.getElementById('sub-modal').remove();
            NotificationSystem.showToast('Success', 'Homework submitted successfully!', 'success');
            this.viewHomework(document.getElementById('content-area'), Auth.getCurrentUser());
        };

        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // In a real app we'd save the file, here we'll just mock it
                submit();
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            submit();
        }
    },

    viewFees(container, user) {
        const student = this.getStudentData(user);
        const feeStructure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE);
        const classFee = (feeStructure && typeof feeStructure === 'object') ? (feeStructure[student.classId] || 0) : 0;
        const allPayments = Storage.get(STORAGE_KEYS.FEES);
        const studentPayments = allPayments.filter(p => p.studentId === student.id);
        const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
        const balance = classFee - totalPaid;

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h2 style="margin: 0;">School Fee Status</h2>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">Session: 2025-26 | Student: ${student.name}</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 0.75rem; color: var(--gray-400); text-transform: uppercase;">Total Balance</div>
                        <h2 style="margin: 0; color: ${balance > 0 ? 'var(--danger)' : 'var(--success)'};">₹ ${balance}</h2>
                    </div>
                </div>

                <div class="responsive-grid" style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem;">
                    <!-- Fee Summary Card -->
                    <div class="glass-card" style="padding: 2rem; border-top: 5px solid var(--primary);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                            <h3 style="margin: 0;">Class-wise Fee Payment</h3>
                            <span class="badge" style="background: ${balance <= 0 ? 'var(--success-light)' : '#fee2e2'}; color: ${balance <= 0 ? 'var(--success)' : '#991b1b'}; font-size: 0.8rem;">
                                ${balance <= 0 ? 'FULLY PAID' : 'PENDING'}
                            </span>
                        </div>
                        
                        <div style="display: grid; gap: 1.5rem;">
                            <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--gray-100);">
                                <span style="color: var(--gray-600);">Annual School Fee</span>
                                <span style="font-weight: 700;">₹ ${classFee}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; padding-bottom: 10px; border-bottom: 1px solid var(--gray-100);">
                                <span style="color: var(--gray-600);">Total Paid to Date</span>
                                <span style="font-weight: 700; color: var(--success);">₹ ${totalPaid}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; font-size: 1.1rem; padding-top: 10px;">
                                <span style="font-weight: 700;">Remaining Dues</span>
                                <span style="font-weight: 800; color: ${balance > 0 ? 'var(--danger)' : 'var(--success)'};">₹ ${balance}</span>
                            </div>
                        </div>

                        ${balance > 0 ? `
                            <div style="margin-top: 2rem; background: var(--gray-50); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--gray-300);">
                                <label class="form-label">Payment Amount</label>
                                <div style="display: flex; gap: 10px; align-items: center;">
                                    <div style="flex: 1; position: relative;">
                                        <span style="position: absolute; left: 12px; top: 11px; color: var(--gray-400);">₹</span>
                                        <input type="number" id="manual-pay-amount" class="form-control" value="${balance}" max="${balance}" style="padding-left: 25px;">
                                    </div>
                                    <button class="btn btn-primary" onclick="StudentModule.payClassFee()">Pay Now</button>
                                </div>
                                <p style="font-size: 0.75rem; color: var(--gray-400); margin-top: 10px;"><i class="fas fa-info-circle"></i> You can pay the full amount or a partial installment.</p>
                            </div>
                        ` : `
                            <div style="margin-top: 2rem; text-align: center; padding: 2rem; background: var(--success-light); border-radius: 12px; color: var(--success);">
                                <i class="fas fa-check-circle fa-3x" style="margin-bottom: 1rem;"></i>
                                <h4 style="margin: 0;">Fee Successfully Paid</h4>
                                <p style="margin: 5px 0 0 0; font-size: 0.8125rem;">No pending dues for this session.</p>
                            </div>
                        `}
                    </div>

                    <!-- Payment Records -->
                    <div class="glass-panel" style="padding: 1.5rem;">
                        <h4 style="margin-top: 0; margin-bottom: 1.5rem;">Recent Receipts</h4>
                        <div style="display: grid; gap: 10px;">
                            ${studentPayments.reverse().map(p => `
                                <div class="glass-card" style="padding: 1rem; font-size: 0.8125rem; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 700;">#${p.id}</div>
                                        <div style="color: var(--gray-500); font-size: 0.7rem;">${new Date(p.date).toLocaleDateString()}</div>
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="font-weight: 700; color: var(--success);">₹${p.amount}</div>
                                        <button class="btn" style="padding: 0; font-size: 0.7rem; color: var(--primary);" onclick="StudentModule.downloadReceipt('${p.id}')">Download</button>
                                    </div>
                                </div>
                            `).join('') || '<p style="color: var(--gray-400); text-align: center; font-size: 0.875rem;">No payments yet.</p>'}
                        </div>
                    </div>
                </div>

                <div class="glass-panel" style="margin-top: 3rem; background: var(--gray-50); border: 1px solid var(--gray-200); padding: 1.5rem;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1.5rem;">
                        <i class="fas fa-university" style="color: var(--primary); font-size: 1.25rem;"></i>
                        <h3 style="margin: 0;">Official School Payment Details</h3>
                    </div>
                    
                    ${(() => {
                const config = Storage.get(STORAGE_KEYS.PAYMENT_CONFIG) || {
                    merchantName: 'School Management System',
                    upiId: 'school@upi',
                    bankName: 'Official School Bank',
                    accountNumber: '9182736455',
                    ifsc: 'EDUF0001234'
                };
                return `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem;">
                            <div>
                                <p style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Bank Transfer</p>
                                <p style="font-size: 0.875rem; margin: 2px 0;"><strong>Bank:</strong> ${config.bankName}</p>
                                <p style="font-size: 0.875rem; margin: 2px 0;"><strong>A/C No:</strong> ${config.accountNumber}</p>
                                <p style="font-size: 0.875rem; margin: 2px 0;"><strong>IFSC:</strong> ${config.ifsc}</p>
                            </div>
                            <div>
                                <p style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">UPI Payment</p>
                                <p style="font-size: 1.1rem; font-weight: 700; color: var(--primary); margin: 0;">${config.upiId}</p>
                                <p style="font-size: 0.75rem; color: var(--gray-400); margin-top: 5px;">Scan QR in payment portal for instant credit.</p>
                            </div>
                            <div>
                                <p style="font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; font-weight: 700; margin-bottom: 5px;">Security</p>
                                <p style="font-size: 0.8125rem; color: var(--gray-600); line-height: 1.4;">Instant receipt generation on successful authorization. All transactions are SSL secured via Secure Gateway.</p>
                            </div>
                        </div>
                    `;
            })()}
                </div>
            </div>
        `;
    },

    downloadReceipt(receiptId) {
        const payments = Storage.get(STORAGE_KEYS.FEES);
        const p = payments.find(pay => pay.id === receiptId);
        if (!p) return NotificationSystem.showToast('Error', 'Receipt not found.', 'error');

        const user = Auth.getCurrentUser();
        const student = this.getStudentData(user);

        const receiptContent = `
==========================================
        SCHOOL MANAGEMENT SYSTEM
            OFFICIAL RECEIPT
==========================================
Receipt ID: ${p.id}
Date:       ${new Date(p.date).toLocaleString()}
------------------------------------------
Student Name:  ${student.name}
Admission No:  ${student.admissionNo}
------------------------------------------
DESCRIPTION                    AMOUNT
------------------------------------------
${(p.description || 'School Fee').padEnd(30)} ₹${p.amount.toString().padStart(8)}
------------------------------------------
TOTAL PAID:                   ₹${p.amount.toString().padStart(8)}
------------------------------------------
Payment Method: ${p.method}
Status:         COMPLETED
==========================================
        Thank you for your payment!
==========================================
        `;

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt_${p.id}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },

    payClassFee() {
        const amount = parseInt(document.getElementById('manual-pay-amount').value);
        if (!amount || amount <= 0) return NotificationSystem.showToast('Invalid Amount', 'Please enter a valid amount to pay.', 'warning');

        const user = Auth.getCurrentUser();
        const config = Storage.get(STORAGE_KEYS.PAYMENT_CONFIG) || {
            merchantName: 'School Management System',
            upiId: 'school@upi',
            bankName: 'Official School Bank',
            accountNumber: '9182736455',
            ifsc: 'SMS0001234'
        };

        const modalContent = `
            <div style="max-height: 80vh; overflow-y: auto; padding: 10px;">
                <div class="glass-panel" style="background: var(--primary-light); border: 1px solid var(--primary); padding: 1rem; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <p style="font-size: 0.75rem; color: var(--primary); font-weight: 700; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Order Summary</p>
                        <h3 style="margin: 0; color: var(--gray-900);">Class-wise School Fee</h3>
                    </div>
                    <h2 style="margin: 0; color: var(--primary);">₹ ${amount}</h2>
                </div>

                <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; background: var(--gray-50); padding: 5px; border-radius: 12px;">
                    <button class="btn payment-tab active" id="tab-upi" onclick="StudentModule.switchPaymentTab('upi')" style="flex: 1; padding: 10px; font-weight: 600;">UPI</button>
                    <button class="btn payment-tab" id="tab-card" onclick="StudentModule.switchPaymentTab('card')" style="flex: 1; padding: 10px; font-weight: 600;">Card</button>
                    <button class="btn payment-tab" id="tab-bank" onclick="StudentModule.switchPaymentTab('bank')" style="flex: 1; padding: 10px; font-weight: 600;">Bank</button>
                </div>

                <!-- UPI Section -->
                <div id="section-upi" class="payment-section active">
                    <div style="text-align: center; padding: 2rem 0;">
                        <i class="fas fa-mobile-alt fa-3x" style="color: var(--primary); margin-bottom: 1rem;"></i>
                        <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1.5rem;">Pay using any UPI app (GPay, PhonePe, Paytm)</p>
                        
                        <div class="form-group" style="max-width: 300px; margin: 0 auto 1.5rem;">
                            <label class="form-label" style="text-align: left;">Enter your UPI ID</label>
                            <input type="text" id="upi-id" class="form-control" placeholder="username@bank" style="text-align: center;">
                        </div>
                        
                        <div style="padding: 1rem; border: 2px dashed var(--gray-200); border-radius: 12px; margin-bottom: 1.5rem; display: inline-block;">
                            <p style="font-size: 0.75rem; color: var(--gray-400); margin-bottom: 5px;">Scan QR to pay directly</p>
                            <div style="width: 150px; height: 150px; background: #eee; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 8px;">
                                <i class="fas fa-qrcode fa-5x" style="color: #333;"></i>
                            </div>
                            <p style="font-size: 0.875rem; font-weight: 700; margin-top: 10px; color: var(--primary);">${config.upiId}</p>
                        </div>
                    </div>
                </div>

                <!-- Card Section -->
                <div id="section-card" class="payment-section" style="display: none;">
                    <div style="padding: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Card Number</label>
                            <div style="position: relative;">
                                <input type="text" class="form-control" placeholder="XXXX XXXX XXXX XXXX" maxlength="19">
                                <i class="fab fa-cc-visa" style="position: absolute; right: 10px; top: 12px; color: #1a1f71;"></i>
                            </div>
                        </div>
                        <div class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                            <div class="form-group">
                                <label class="form-label">Expiry Date</label>
                                <input type="text" class="form-control" placeholder="MM/YY" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label class="form-label">CVV</label>
                                <input type="password" class="form-control" placeholder="***" maxlength="3">
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Card Holder Name</label>
                            <input type="text" class="form-control" placeholder="As shown on card">
                        </div>
                    </div>
                </div>

                <!-- Bank Section -->
                <div id="section-bank" class="payment-section" style="display: none;">
                    <div style="padding: 1rem; background: var(--gray-50); border-radius: 12px;">
                        <h4 style="margin-top: 0; color: var(--primary);"><i class="fas fa-university"></i> Direct Bank Transfer</h4>
                        <p style="font-size: 0.8125rem; color: var(--gray-600); margin-bottom: 1.5rem;">Transfer the amount to the school account and enter the Transaction Ref ID below.</p>
                        
                        <div style="display: grid; gap: 1rem; font-size: 0.875rem; border: 1px solid var(--gray-200); padding: 1rem; border-radius: 8px; background: white;">
                            <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">Receiver:</span> <strong style="color: var(--gray-900);">${config.merchantName}</strong></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">Bank:</span> <strong style="color: var(--gray-900);">${config.bankName}</strong></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">Account No:</span> <strong style="color: var(--gray-900);">${config.accountNumber}</strong></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: var(--gray-500);">IFSC Code:</span> <strong style="color: var(--gray-900);">${config.ifsc}</strong></div>
                        </div>
                        
                        <div class="form-group" style="margin-top: 1.5rem;">
                            <label class="form-label">Transaction Reference (UTR) No.</label>
                            <input type="text" id="bank-ref" class="form-control" placeholder="e.g., 214536789012">
                        </div>
                    </div>
                </div>

                <div style="margin-top: 2rem; border-top: 1px solid var(--gray-100); padding-top: 1.5rem; text-align: center;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: var(--gray-400); font-size: 0.75rem; margin-bottom: 1rem;">
                        <i class="fas fa-shield-alt"></i> 256-Bit SSL Secure Encryption
                    </div>
                    <button class="btn btn-primary" id="final-pay-btn" onclick="StudentModule.processPayment(${amount})" style="width: 100%; height: 50px; font-size: 1.1rem; font-weight: 700; background: linear-gradient(to right, var(--primary), #8b5cf6);">
                        Authorize Payment ₹ ${amount}
                    </button>
                </div>
            </div>
        `;

        AdminModule.showModal(`<i class="fas fa-lock" style="color: #059669; margin-right: 8px;"></i> Secure Gateway`, modalContent);
    },

    switchPaymentTab(tabId) {
        // Toggle tabs
        document.querySelectorAll('.payment-tab').forEach(el => el.classList.remove('active', 'btn-primary'));
        document.getElementById(`tab-${tabId}`).classList.add('active', 'btn-primary');

        // Toggle sections
        document.querySelectorAll('.payment-section').forEach(el => el.style.display = 'none');
        document.getElementById(`section-${tabId}`).style.display = 'block';
    },

    processPayment(amount) {
        const btn = document.getElementById('final-pay-btn');
        const originalText = btn.innerHTML;

        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Securing Connection...`;

        setTimeout(() => {
            btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Authorizing with Bank...`;

            setTimeout(() => {
                const user = Auth.getCurrentUser();
                const student = this.getStudentData(user);
                const allPayments = Storage.get(STORAGE_KEYS.FEES);

                // Get selected method
                const activeTab = document.querySelector('.payment-tab.active').id.replace('tab-', '').toUpperCase();

                allPayments.push({
                    id: 'REC' + Date.now().toString(36).toUpperCase(),
                    studentId: student.id,
                    description: 'School Fee Payment',
                    amount,
                    date: new Date().toISOString(),
                    method: activeTab // Card, UPI, or Bank
                });

                Storage.save(STORAGE_KEYS.FEES, allPayments);
                AdminModule.closeModal();
                NotificationSystem.showToast('Payment Successful', `Receipt generated for your payment of ₹${amount}.`, 'success');
                this.viewFees(document.getElementById('content-area'), user);
            }, 2000);
        }, 1500);
    },

    viewNotices(container, user) {
        const notices = Storage.get(STORAGE_KEYS.NOTICES);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 1.5rem;">
                <h3>School Notices</h3>
                <div style="margin-top: 1.5rem; display: grid; gap: 1rem;">
                    ${notices.slice().reverse().map(n => `
                        <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid var(--accent);">
                            <h4 style="margin-bottom: 0.5rem;">${n.title}</h4>
                            <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem;">${n.content}</p>
                            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--gray-400);">
                                <span>Posted by ${n.teacher}</span>
                                <span>${new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    `).join('') || '<p style="text-align: center; color: var(--gray-400);">No school notices at this time.</p>'}
                </div>
            </div>
        `;

        // Automatically mark all as read when viewing this page
        notices.forEach(n => this.markNoticeAsRead(n.id, false));
    },

    markNoticeAsRead(noticeId, refresh = true) {
        const user = Auth.getCurrentUser();
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS);
        let userNotif = notifications.find(n => n.userId === user.username);

        if (!userNotif) {
            userNotif = { userId: user.username, readNoticeIds: [] };
            notifications.push(userNotif);
        }

        if (!userNotif.readNoticeIds.includes(noticeId)) {
            userNotif.readNoticeIds.push(noticeId);
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
            if (refresh) this.schoolPortal(document.getElementById('content-area'), user);
        }
    },

    markAllNoticesAsRead(refresh = true) {
        const user = Auth.getCurrentUser();
        const notices = Storage.get(STORAGE_KEYS.NOTICES);
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS);
        let userNotif = notifications.find(n => n.userId === user.username);

        if (!userNotif) {
            userNotif = { userId: user.username, readNoticeIds: [] };
            notifications.push(userNotif);
        }

        notices.forEach(n => {
            if (!userNotif.readNoticeIds.includes(n.id)) {
                userNotif.readNoticeIds.push(n.id);
            }
        });

        Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
        if (refresh) this.schoolPortal(document.getElementById('content-area'), user);
    },

    manageDocuments(container, user) {
        const student = this.getStudentData(user);
        const allDocs = Storage.get(STORAGE_KEYS.DOCUMENTS);
        const studentDocs = allDocs.find(d => d.studentId === student.id) || {
            studentId: student.id,
            aadhar: null,
            tc: null,
            birth: null
        };

        const docTypes = [
            { id: 'aadhar', name: 'Aadhar Card', icon: 'fas fa-id-card' },
            { id: 'tc', name: 'Transfer Certificate (TC)', icon: 'fas fa-file-export' },
            { id: 'birth', name: 'Birth Certificate', icon: 'fas fa-baby' }
        ];

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="margin-bottom: 2rem;">
                    <h2 style="margin: 0;">Documents Verification Portal</h2>
                    <p style="color: var(--gray-500); font-size: 0.875rem;">View your submitted documents below. For any updates, please contact the school office.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${docTypes.map(doc => `
                        <div class="glass-card" style="padding: 1.5rem; text-align: center;">
                            <div style="width: 60px; height: 60px; background: rgba(79, 70, 229, 0.1); color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem auto;">
                                <i class="${doc.icon} fa-2x"></i>
                            </div>
                            <h4 style="margin-bottom: 0.5rem;">${doc.name}</h4>
                            
                            <div id="status-${doc.id}" style="margin-bottom: 1.5rem;">
                                ${(() => {
                const docInfo = Storage.getDocument(student.id, doc.id);
                // We use a small inline script to verify the image for auto-discovery paths
                // Logic: If manual, show uploaded. If auto, check image load status.

                if (docInfo.type === 'manual') {
                    return `
                                            <div style="padding: 10px; background: #dcfce7; color: #166534; border-radius: 8px; font-size: 0.8125rem;">
                                                <i class="fas fa-check-circle"></i> Document Uploaded
                                            </div>
                                            <button class="btn" style="margin-top: 10px; font-size: 0.75rem; color: var(--primary);" onclick="window.open('${docInfo.src}')">
                                                <i class="fas fa-eye"></i> View Current
                                            </button>
                                        `;
                } else {
                    // For auto-discovery, we render a hidden image to check availability
                    const uniqueId = `check-${doc.id}-${Date.now()}`;
                    setTimeout(() => {
                        const img = document.getElementById(uniqueId);
                        const statusDiv = document.getElementById(`status-container-${uniqueId}`);
                        const viewBtn = document.getElementById(`view-btn-${uniqueId}`);

                        if (img) {
                            img.onload = () => {
                                statusDiv.innerHTML = '<div style="padding: 10px; background: #dcfce7; color: #166534; border-radius: 8px; font-size: 0.8125rem;"><i class="fas fa-check-circle"></i> Auto-Detected</div>';
                                viewBtn.style.display = 'inline-block';
                            };
                            img.onerror = () => {
                                statusDiv.innerHTML = '<div style="padding: 10px; background: #fee2e2; color: #991b1b; border-radius: 8px; font-size: 0.8125rem;"><i class="fas fa-exclamation-triangle"></i> Not Found</div>';
                                viewBtn.style.display = 'none';
                            };
                        }
                    }, 100);

                    return `
                                            <img id="${uniqueId}" src="${docInfo.src}" style="display:none;" />
                                            <div id="status-container-${uniqueId}">
                                                <div style="padding: 10px; background: #f3f4f6; color: #6b7280; border-radius: 8px; font-size: 0.8125rem;">
                                                    <i class="fas fa-spinner fa-spin"></i> Checking file...
                                                </div>
                                            </div>
                                            <button id="view-btn-${uniqueId}" class="btn" style="display: none; margin-top: 10px; font-size: 0.75rem; color: var(--primary);" onclick="window.open('${docInfo.src}')">
                                                <i class="fas fa-eye"></i> View File
                                            </button>
                                            <p style="font-size: 0.65rem; color: var(--gray-400); margin-top: 5px;">
                                                Path: ${docInfo.src}
                                            </p>
                                        `;
                }
            })()}
                            </div>

                            <p style="font-size: 0.7rem; color: var(--gray-400); margin-top: 10px;">Contact Admin/Staff to update documents.</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },

    // Exam / Results Filtering

    applyReportFilters() {
        const selectedExam = document.getElementById('filter-exam').value;

        // Save to session
        sessionStorage.setItem('reportFilterExam', selectedExam);

        // Reload report card
        const user = Auth.getCurrentUser();
        const container = document.getElementById('content-area');
        this.viewReportCard(container, user);
    }
};
