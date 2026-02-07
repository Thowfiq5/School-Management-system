/**
 * teacher.js
 * Teacher module for attendance, marks, and homework.
 */

const TeacherModule = {
    checkPermission(permission) {
        const user = Auth.getCurrentUser();
        const teacher = Storage.get(STORAGE_KEYS.TEACHERS).find(t => t.username === user.username);
        // If permissions array exists, check it. If undefined, assume full access (legacy support)
        if (teacher && teacher.permissions) {
            return teacher.permissions.includes(permission);
        }
        return true;
    },

    teacherDashboard(container) {
        const currentUser = Auth.getCurrentUser();
        const classes = Storage.get(STORAGE_KEYS.CLASSES);

        // Class Selection Flow
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            // If no class selected, force redirect to Profile Page
            return this.viewMyProfile(container);
        }

        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const allTeachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const teacherRecord = allTeachers.find(t => t.username === currentUser.username);

        // Strict Check: Ensure teacher is assigned to this class
        if (teacherRecord && teacherRecord.assignedClassIds && !teacherRecord.assignedClassIds.includes(classId)) {
            sessionStorage.removeItem('selectedTeacherClassId');
            return this.teacherDashboard(container);
        }

        const activeClass = classes.find(c => c.id === classId);
        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE);
        const today = new Date().toISOString().split('T')[0];
        const markedToday = attendance.some(a => a.date === today && a.classId === classId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);

        container.innerHTML = `
            <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0;">Classroom Dashboard</h2>
                    <p style="color: var(--primary); font-weight: 600;">Class ${activeClass.name} ${activeClass.section} • Room ${activeClass.room}</p>
                </div>
                <button class="btn glass-panel" onclick="sessionStorage.removeItem('selectedTeacherClassId'); if (typeof renderSidebar === 'function') renderSidebar(); TeacherModule.teacherDashboard(document.getElementById('content-area'))">
                    <i class="fas fa-exchange-alt"></i> Switch Class
                </button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="glass-card" style="background: linear-gradient(135deg, ${markedToday ? '#10b981, #34d399' : '#f59e0b, #fbbf24'}); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Attendance Status</p>
                            <h3 style="font-size: 1.5rem; color: white;">${markedToday ? 'Synchronized' : 'Action Required'}</h3>
                        </div>
                        <i class="fas ${markedToday ? 'fa-check-circle' : 'fa-exclamation-circle'} fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
                <div class="glass-card" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Class Strength</p>
                            <h3 style="font-size: 2rem; color: white;">${students.length}</h3>
                        </div>
                        <i class="fas fa-users fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
            
            <div class="glass-panel" style="padding: 1.5rem;">
                <h3>Today's Focus</h3>
                <div style="margin-top: 1.5rem; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
                    ${this.checkPermission('markAttendance') ? `
                        <div class="glass-card" style="padding: 1.25rem; text-align: center; cursor: pointer;" onclick="loadModule('markAttendance', 'mark-attendance', 'Attendance')">
                            <i class="fas fa-calendar-check fa-2x" style="color: var(--primary); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 600; margin: 0;">Daily Attendance</p>
                        </div>
                    ` : ''}
                    
                    ${this.checkPermission('manageHomework') ? `
                        <div class="glass-card" style="padding: 1.25rem; text-align: center; cursor: pointer;" onclick="loadModule('manageHomework', 'homework', 'Homework')">
                            <i class="fas fa-book fa-2x" style="color: var(--accent); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 600; margin: 0;">Post Homework</p>
                        </div>
                    ` : ''}

                    ${this.checkPermission('manageHomework') ? `
                        <div class="glass-card" style="padding: 1.25rem; text-align: center; cursor: pointer;" onclick="loadModule('checkHomeworkStatus', 'check-homework', 'Check Homework')">
                            <i class="fas fa-check-circle fa-2x" style="color: #10b981; margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 600; margin: 0;">Check Homework</p>
                        </div>
                    ` : ''}
                    
                    ${this.checkPermission('enterMarks') ? `
                        <div class="glass-card" style="padding: 1.25rem; text-align: center; cursor: pointer;" onclick="loadModule('enterMarks', 'enter-marks', 'Exam Marks')">
                            <i class="fas fa-file-invoice fa-2x" style="color: #10b981; margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 600; margin: 0;">Enter Results</p>
                        </div>
                    ` : ''}

                    ${this.checkPermission('manageStudents') ? `
                        <div class="glass-card" style="padding: 1.25rem; text-align: center; cursor: pointer;" onclick="loadModule('manageStudents', 'students', 'My Students')">
                            <i class="fas fa-user-graduate fa-2x" style="color: var(--primary); margin-bottom: 0.5rem;"></i>
                            <p style="font-weight: 600; margin: 0;">My Students</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    confirmTeacherClassSelection() {
        const classId = document.getElementById('teacher-class-select').value;
        if (!classId) return NotificationSystem.showToast('Input Error', 'Please select a class to proceed.', 'warning');

        sessionStorage.setItem('selectedTeacherClassId', classId);

        // Refresh sidebar to show all menu items
        if (typeof renderSidebar === 'function') {
            renderSidebar();
        }

        this.teacherDashboard(document.getElementById('content-area'));
    },

    markAttendance(container) {
        if (!this.checkPermission('markAttendance')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to view attendance.</p></div>';

        // Check if class is selected
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            return this.viewMyProfile(container);
        }

        const user = Auth.getCurrentUser();
        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const selectedClass = classes.find(c => c.id === classId);
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const today = new Date().toISOString().split('T')[0];

        container.innerHTML = `
            <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                    <div>
                        <h2 style="margin: 0;">Student Attendance</h2>
                        <p style="color: var(--gray-600); font-size: 0.875rem; margin-top: 0.5rem;">Manage attendance for ${selectedClass.name} ${selectedClass.section}</p>
                    </div>
                </div>

                <div class="glass-card" style="padding: 1.5rem; background: var(--gray-50); border: 1px solid var(--gray-200); margin-bottom: 2rem;">
                    <h4 style="margin-top: 0; margin-bottom: 1rem; color: var(--primary);">Take / Edit Attendance</h4>
                    <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                        <div class="form-group" style="flex: 1; min-width: 200px;">
                            <label class="form-label">Select Date</label>
                            <input type="date" id="attendance-date" class="form-control" value="${today}" max="${today}">
                        </div>
                        <button class="btn btn-primary" onclick="TeacherModule.loadAttendanceForEditing()">
                            <i class="fas fa-edit"></i> Edit Attendance
                        </button>
                    </div>
                </div>

                <h4 style="margin-bottom: 1rem; color: var(--gray-600);">View Monthly Summary</h4>
                <div class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr auto; gap: 1rem; align-items: flex-end;">
                    <div class="form-group">
                        <label class="form-label">Month</label>
                        <select id="attn-month" class="form-control">
                            ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => `
                                <option value="${i + 1}" ${i + 1 === currentMonth ? 'selected' : ''}>${m}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Year</label>
                        <select id="attn-year" class="form-control">
                            <option value="${currentYear - 1}">${currentYear - 1}</option>
                            <option value="${currentYear}" selected>${currentYear}</option>
                            <option value="${currentYear + 1}">${currentYear + 1}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <button class="btn" style="background: var(--gray-800); color: white;" onclick="TeacherModule.loadTeacherAttendance()">
                            <i class="fas fa-search"></i> View Summary
                        </button>
                    </div>
                </div>
            </div>
            <div id="attendance-list-container"></div>
        `;

        // Load summary by default
        this.loadTeacherAttendance();
    },

    loadAttendanceForEditing() {
        const date = document.getElementById('attendance-date').value;
        if (!date) return NotificationSystem.showToast('Select Date', 'Please select a date to edit attendance.', 'warning');

        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const container = document.getElementById('attendance-list-container');
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);

        // Find existing record for this date
        const attendanceRecords = Storage.get(STORAGE_KEYS.ATTENDANCE);
        const existingRecord = attendanceRecords.find(a => a.classId === classId && a.date === date);
        const attendanceData = existingRecord ? existingRecord.data : {};

        if (students.length === 0) {
            container.innerHTML = `<div class="glass-panel" style="text-align: center; color: var(--gray-500);">No students found in this class.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="glass-panel" style="padding: 1.5rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0;">Attendance for ${new Date(date).toLocaleDateString()}</h3>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn" style="padding: 5px 10px; font-size: 0.8rem;" onclick="TeacherModule.markAllAttendance('present')">Mark All Present</button>
                        <button class="btn" style="padding: 5px 10px; font-size: 0.8rem; background: #fee2e2; color: #991b1b;" onclick="TeacherModule.markAllAttendance('absent')">Mark All Absent</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--gray-50);">
                            <tr>
                                <th style="padding: 12px; text-align: left;">Roll No</th>
                                <th style="padding: 12px; text-align: left;">Student Name</th>
                                <th style="padding: 12px; text-align: center;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${students.map(s => {
            const status = attendanceData[s.id] || 'present'; // Default to present
            return `
                                    <tr style="border-bottom: 1px solid var(--gray-100);">
                                        <td style="padding: 12px; font-weight: 600;">${s.admissionNo}</td>
                                        <td style="padding: 12px;">${s.name}</td>
                                        <td style="padding: 12px; text-align: center;">
                                            <div style="display: inline-flex; background: var(--gray-100); padding: 4px; border-radius: 8px;">
                                                <label style="cursor: pointer; padding: 6px 12px; border-radius: 6px; background: ${status === 'present' ? 'var(--success)' : 'transparent'}; color: ${status === 'present' ? 'white' : 'var(--gray-600)'}; transition: all 0.2s;" onclick="this.parentNode.querySelector('input[value=present]').click(); TeacherModule.updateAttendanceUI(this, 'present')">
                                                    Present
                                                    <input type="radio" name="attn_${s.id}" value="present" ${status === 'present' ? 'checked' : ''} style="display: none;">
                                                </label>
                                                <label style="cursor: pointer; padding: 6px 12px; border-radius: 6px; background: ${status === 'absent' ? 'var(--danger)' : 'transparent'}; color: ${status === 'absent' ? 'white' : 'var(--gray-600)'}; transition: all 0.2s;" onclick="this.parentNode.querySelector('input[value=absent]').click(); TeacherModule.updateAttendanceUI(this, 'absent')">
                                                    Absent
                                                    <input type="radio" name="attn_${s.id}" value="absent" ${status === 'absent' ? 'checked' : ''} style="display: none;">
                                                </label>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 2rem; text-align: right;">
                    <button class="btn btn-primary" onclick="TeacherModule.saveAttendance('${classId}', '${date}')" style="padding: 12px 30px; font-size: 1rem;">
                        <i class="fas fa-save"></i> Save Attendance
                    </button>
                </div>
            </div>
        `;
    },

    updateAttendanceUI(label, status) {
        const parent = label.parentNode;
        const labels = parent.querySelectorAll('label');
        labels.forEach(l => {
            l.style.background = 'transparent';
            l.style.color = 'var(--gray-600)';
        });

        label.style.background = status === 'present' ? 'var(--success)' : 'var(--danger)';
        label.style.color = 'white';
    },

    markAllAttendance(status) {
        const radios = document.querySelectorAll(`input[value="${status}"]`);
        radios.forEach(r => {
            r.checked = true;
            this.updateAttendanceUI(r.parentNode, status);
        });
    },

    loadTeacherAttendance() {
        const month = parseInt(document.getElementById('attn-month').value);
        const year = parseInt(document.getElementById('attn-year').value);
        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const container = document.getElementById('attendance-list-container');

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const selectedClass = classes.find(c => c.id === classId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);

        // Get all attendance records for this class and month/year
        const attendanceRecords = Storage.get(STORAGE_KEYS.ATTENDANCE).filter(a => {
            const d = new Date(a.date);
            return a.classId === classId && (d.getMonth() + 1) === month && d.getFullYear() === year;
        });

        if (attendanceRecords.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="padding: 2rem; text-align: center; background: #fef3c7; border: 1px solid #fcd34d;">
                    <i class="fas fa-calendar-times" style="color: #d97706; font-size: 2rem; margin-bottom: 1rem;"></i>
                    <h3 style="color: #92400e; margin: 0;">No Attendance Records</h3>
                    <p style="color: #b45309; margin: 0.5rem 0 0 0;">No attendance has been taken for this month yet.</p>
                </div>
            `;
            return;
        }

        if (students.length === 0) {
            container.innerHTML = `
                <div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--gray-500);">
                    <p>No students found in this class.</p>
                </div>
            `;
            return;
        }

        // Calculate stats for each student
        const studentStats = students.map(student => {
            let present = 0;
            let absent = 0;
            const total = attendanceRecords.length;

            attendanceRecords.forEach(record => {
                const status = record.data[student.id];
                if (status === 'present') present++;
                else if (status === 'absent') absent++;
            });

            return {
                ...student,
                present,
                absent,
                total,
                percentage: total > 0 ? ((present / total) * 100).toFixed(1) : '0.0'
            };
        });

        container.innerHTML = `
            <div class="glass-panel" style="padding: 0;">
                <div class="table-responsive">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--gray-50);">
                            <tr>
                                <th style="padding: 12px; text-align: left;">Roll No</th>
                                <th style="padding: 12px; text-align: left;">Student Name</th>
                                <th style="padding: 12px; text-align: center;">Working Days</th>
                                <th style="padding: 12px; text-align: center;">Present</th>
                                <th style="padding: 12px; text-align: center;">Absent</th>
                                <th style="padding: 12px; text-align: center;">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${studentStats.map(s => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 12px; font-weight: 600;">${s.admissionNo}</td>
                                    <td style="padding: 12px;">${s.name}</td>
                                    <td style="padding: 12px; text-align: center;">${s.total}</td>
                                    <td style="padding: 12px; text-align: center; color: var(--success); font-weight: 600;">${s.present}</td>
                                    <td style="padding: 12px; text-align: center; color: var(--danger); font-weight: 600;">${s.absent}</td>
                                    <td style="padding: 12px; text-align: center;">
                                        <span class="badge" style="background: ${s.percentage >= 75 ? 'var(--success-light)' : '#fee2e2'}; color: ${s.percentage >= 75 ? 'var(--success)' : '#991b1b'};">
                                            ${s.percentage}%
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    saveAttendance(classId, date) {
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const data = {};

        students.forEach(s => {
            const status = document.querySelector(`input[name="attn_${s.id}"]:checked`).value;
            data[s.id] = status;
        });

        const attendanceRecords = Storage.get(STORAGE_KEYS.ATTENDANCE);
        // Remove existing record for this date if exists
        const filteredRecords = attendanceRecords.filter(a => !(a.classId === classId && a.date === date));

        filteredRecords.push({
            id: Date.now().toString(),
            classId: classId,
            date: date,
            data: data,
            markedBy: Auth.getCurrentUser().id,
            timestamp: new Date().toISOString()
        });

        Storage.save(STORAGE_KEYS.ATTENDANCE, filteredRecords);
        NotificationSystem.showToast('Success', 'Attendance saved successfully!', 'success');

        // Return to summary view
        this.loadTeacherAttendance();
    },

    enterMarks(container) {
        if (!this.checkPermission('enterMarks')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to manage marks.</p></div>';

        // Check if class is selected
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            return this.viewMyProfile(container);
        }

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const exams = Storage.get(STORAGE_KEYS.EXAM_TYPES);
        const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">Enter Exam Marks</h3>
                <div class="responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: flex-end;">
                    <div class="form-group">
                        <label class="form-label">Exam Type</label>
                        <select id="exam-type" class="form-control">
                            <option value="">Select Exam</option>
                            ${exams.map(e => `<option value="${e.name}">${e.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select id="exam-class" class="form-control">
                            <option value="">Select Class</option>
                            ${classes.map(c => `<option value="${c.id}" ${sessionStorage.getItem('selectedTeacherClassId') === c.id ? 'selected' : ''}>${c.name} - ${c.section}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <select id="exam-subject" class="form-control">
                            <option value="">Select Subject</option>
                            ${subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" onclick="TeacherModule.loadMarksList()">
                            <i class="fas fa-list"></i> Load Students
                        </button>
                    </div>
                </div>
            </div>
            <div id="marks-list-container"></div>
        `;
    },

    loadMarksList() {
        const classId = document.getElementById('exam-class').value;
        const examType = document.getElementById('exam-type').value;
        const subject = document.getElementById('exam-subject').value;
        const container = document.getElementById('marks-list-container');

        // Validation
        if (!examType) return NotificationSystem.showToast('Input Error', 'Please select an exam type', 'warning');
        if (!classId) return NotificationSystem.showToast('Input Error', 'Please select a class', 'warning');
        if (!subject) return NotificationSystem.showToast('Input Error', 'Please select a subject', 'warning');

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const targetClass = classes.find(c => c.id === classId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.className === targetClass.name && s.section === targetClass.section);

        const existingRecords = Storage.get(STORAGE_KEYS.MARKS).find(m =>
            m.examId === examType && m.classId === classId && m.subjectId === subject
        );
        const existingData = existingRecords ? existingRecords.data : {};

        container.innerHTML = `
            <div class="glass-panel" style="padding: 0;">
                <div class="table-responsive">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Adm No</th>
                            <th style="padding: 1rem; text-align: left;">Student Name</th>
                            <th style="padding: 1rem; text-align: center;">Marks (out of 100) ${existingRecords ? '<span class="badge" style="background: var(--success-light); color: var(--success); margin-left:10px;">Already Saved</span>' : ''}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr style="border-bottom: 1px solid var(--gray-100);">
                                <td style="padding: 1rem;">${s.admissionNo}</td>
                                <td style="padding: 1rem;">${s.name}</td>
                                <td style="padding: 1rem; text-align: center;">
                                    <input type="number" name="marks-${s.id}" class="form-control" 
                                           style="width: 80px; margin: 0 auto;" min="0" max="100"
                                           value="${existingData[s.id] || ''}">
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                </div>
                <div style="padding: 1.5rem; text-align: right;">
                    <button class="btn btn-success" onclick="TeacherModule.saveMarks('${examType}', '${classId}', '${subject}')">
                        <i class="fas fa-save"></i> Save Marks
                    </button>
                </div>
            </div>
        `;
    },

    saveMarks(examType, classId, subject) {
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const marks = Storage.get(STORAGE_KEYS.MARKS);

        // Find existing record or create new
        let markRecord = marks.find(m => m.examId === examType && m.classId === classId && m.subjectId === subject);

        if (!markRecord) {
            markRecord = {
                id: Date.now().toString(),
                examId: examType,
                classId: classId,
                subjectId: subject,
                data: {}
            };
            marks.push(markRecord);
        }

        students.forEach(s => {
            const input = document.querySelector(`input[name="marks-${s.id}"]`); // Changed to querySelector by name
            if (input) markRecord.data[s.id] = input.value;
        });

        Storage.save(STORAGE_KEYS.MARKS, marks);
        NotificationSystem.showToast('Success', 'Marks saved successfully', 'success');
    },

    manageMarksheets(container) {
        const classId = sessionStorage.getItem('selectedTeacherClassId');
        if (!classId) return container.innerHTML = '<p>Please select a class first.</p>';

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const teacherClass = classes.find(c => c.id === classId);
        const exams = Storage.get(STORAGE_KEYS.EXAM_TYPES);

        container.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #bulk-marksheet-results, #bulk-marksheet-results * { visibility: visible; }
                    #bulk-marksheet-results { position: absolute; left: 0; top: 0; width: 100%; border: none; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; border: none !important; padding: 0 !important; margin: 0 !important; }
                }
                .marksheet-card { background: white; color: #1a1a1a; padding: 2.5rem; margin-bottom: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
                .marks-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
                .marks-table th, .marks-table td { padding: 12px; border: 1px solid #e5e7eb; text-align: left; font-size: 0.875rem; }
                .marks-table th { background: #f9fafb; font-weight: 700; color: #374151; }
                .grade-badge { padding: 4px 10px; border-radius: 6px; font-weight: 800; font-size: 0.75rem; border: 1px solid rgba(0,0,0,0.05); }
                .grade-A { background: #dcfce7; color: #166534; }
                .grade-B { background: #dbeafe; color: #1e40af; }
                .grade-C { background: #fef9c3; color: #854d0e; }
                .grade-D { background: #ffedd5; color: #9a3412; }
                .grade-E { background: #fee2e2; color: #991b1b; }
            </style>

            <div class="glass-panel no-print" style="padding: 1.5rem; margin-bottom: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <h3 style="margin: 0;">Bulk Marksheet: ${teacherClass.name} - ${teacherClass.section}</h3>
                        <p style="margin: 5px 0 0 0; font-size: 0.8125rem; color: var(--gray-500);">Generate report cards for the entire class at once.</p>
                    </div>
                    <div style="display: flex; gap: 1rem; align-items: flex-end; flex-wrap: wrap;">
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label" style="font-size: 0.75rem;">Select Exam</label>
                            <select id="bulk-ms-exam" class="form-control" style="min-width: 150px;">
                                <option value="all">Annual Summary</option>
                                ${exams.map(e => `<option value="${e.name}">${e.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label" style="font-size: 0.75rem;">Page Size</label>
                            <select id="bulk-ms-size" class="form-control" style="min-width: 100px;">
                                <option value="A4">A4</option>
                                <option value="A3">A3</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label" style="font-size: 0.75rem;">File Type</label>
                            <select id="bulk-ms-type" class="form-control" style="min-width: 100px;">
                                <option value="pdf">PDF</option>
                                <option value="word">Word</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin: 0;">
                            <label class="form-label" style="font-size: 0.75rem;">View Mode</label>
                            <select id="bulk-ms-view" class="form-control" style="min-width: 120px;">
                                <option value="cards">Cards</option>
                                <option value="broadsheet">Single Sheet</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" onclick="TeacherModule.generateBulkMarksheets()">
                            <i class="fas fa-magic"></i> Generate
                        </button>
                        <button class="btn" id="btn-ms-download" onclick="TeacherModule.downloadMarksheets()" style="background: var(--gray-800); color: white; display: none;">
                            <i class="fas fa-download"></i> Save/Print
                        </button>
                    </div>
                </div>
            </div>

            <div id="bulk-marksheet-results">
                <div class="glass-panel" style="padding: 4rem; text-align: center; color: var(--gray-400); border: 2px dashed var(--gray-200);">
                    <i class="fas fa-file-invoice fa-4x" style="margin-bottom: 1.5rem; opacity: 0.3;"></i>
                    <h3>Ready to Generate</h3>
                    <p>Select an exam type and click "Generate" to preview all student marksheets.</p>
                </div>
            </div>
        `;
    },

    downloadMarksheets() {
        const fileType = document.getElementById('bulk-ms-type').value;
        const pageSize = document.getElementById('bulk-ms-size').value;
        const results = document.getElementById('bulk-marksheet-results');

        if (fileType === 'pdf') {
            const style = document.createElement('style');
            style.id = 'print-page-size-style-teacher';
            style.innerHTML = `@page { size: ${pageSize}; margin: 10mm; }`;
            document.head.appendChild(style);
            window.print();
            setTimeout(() => style.remove(), 1000);
        } else if (fileType === 'word') {
            const html = `
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                <head><meta charset='utf-8'><title>Marksheets</title>
                <style>
                    .marksheet-card { border: 1px solid #ccc; padding: 20px; margin-bottom: 30px; page-break-after: always; font-family: sans-serif; }
                    .marks-table { width: 100%; border-collapse: collapse; }
                    .marks-table th, .marks-table td { border: 1px solid #000; padding: 5px; }
                </style>
                </head>
                <body>${results.innerHTML}</body>
                </html>`;
            const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Marksheets_${new Date().getTime()}.doc`;
            link.click();
            URL.revokeObjectURL(url);
        }
    },

    generateBulkMarksheets() {
        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const examType = document.getElementById('bulk-ms-exam').value;
        const viewMode = document.getElementById('bulk-ms-view').value;
        const resultsContainer = document.getElementById('bulk-marksheet-results');
        const downloadBtn = document.getElementById('btn-ms-download');

        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const marks = Storage.get(STORAGE_KEYS.MARKS);
        const allExamTypes = Storage.get(STORAGE_KEYS.EXAM_TYPES);

        if (students.length === 0) {
            resultsContainer.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center;">No students found in this class.</div>';
            return;
        }

        const calculateGrade = (score, totalMarks = 100) => {
            const percentage = (score / totalMarks) * 100;
            if (percentage >= 91) return 'A1';
            if (percentage >= 81) return 'A2';
            if (percentage >= 71) return 'B1';
            if (percentage >= 61) return 'B2';
            if (percentage >= 51) return 'C1';
            if (percentage >= 41) return 'C2';
            if (percentage >= 33) return 'D';
            return 'E';
        };

        const getExamTotal = (name) => {
            const totalMarksMap = {
                'Unit Test I': 20, 'Unit Test II': 20, 'Unit Test III': 20,
                'Quarterly Exam': 100, 'Half Yearly Exam': 100, 'Annual Exam': 100
            };
            if (totalMarksMap[name]) return totalMarksMap[name];
            if (name.toLowerCase().includes('unit')) return 20;
            return 100;
        };

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const selectedClass = classes.find(c => c.id === classId);
        const classSubjects = getSubjectsByGrade(selectedClass.name);
        const allSubjects = Storage.get(STORAGE_KEYS.SUBJECTS);
        const filteredSubjects = allSubjects.filter(s => classSubjects.includes(s.name));

        let html = '';

        if (viewMode === 'broadsheet') {
            html = this.renderConsolidatedSheet(students, marks, examType, allExamTypes, getExamTotal, calculateGrade, filteredSubjects);
        } else {
            students.forEach((student, index) => {
                const studentMarks = marks.filter(m => m.data && m.data[student.id]);

                html += `
                    <div class="marksheet-card ${index < students.length - 1 ? 'page-break' : ''}">
                        <!-- School Header -->
                        <div style="text-align: center; margin-bottom: 2rem; border-bottom: 3px double var(--primary); padding-bottom: 1.5rem;">
                            <h1 style="margin: 0; color: var(--primary); font-size: 2.2rem; letter-spacing: -1px;">SCHOOL MANAGEMENT SYSTEM</h1>
                            <p style="margin: 5px 0; font-size: 0.9rem; font-weight: 700; color: var(--gray-600); letter-spacing: 4px;">INTERNATIONAL SCHOOL</p>
                            <div style="margin-top: 15px; display: inline-block; background: var(--gray-900); color: white; padding: 4px 15px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">SESSION 2025-26</div>
                            <h2 style="margin-top: 15px; font-size: 1.25rem; font-weight: 800; text-decoration: none; background: #f3f4f6; display: inline-block; padding: 5px 20px; border-radius: 4px;">${examType === 'all' ? 'ANNUAL PROGRESS REPORT' : examType.toUpperCase() + ' REPORT CARD'}</h2>
                        </div>

                        <!-- Student Info -->
                        <div style="display: grid; grid-template-columns: 1fr 1.5fr 1fr; gap: 1rem; margin-bottom: 2rem; font-size: 0.9rem;">
                            <div style="border-right: 1px solid #eee; padding-right: 1.5rem;">
                                <strong style="font-size: 0.7rem; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px;">Student Name</strong>
                                <span style="font-size: 1.1rem; font-weight: 800; color: #111827;">${student.name}</span>
                            </div>
                            <div style="border-right: 1px solid #eee; padding-right: 1.5rem; text-align: center;">
                                <div style="display: flex; justify-content: center; gap: 2rem;">
                                    <div>
                                        <strong style="font-size: 0.7rem; color: #6b7280; text-transform: uppercase;">Class</strong><br>
                                        <span style="font-weight: 700;">${student.className}</span>
                                    </div>
                                    <div>
                                        <strong style="font-size: 0.7rem; color: #6b7280; text-transform: uppercase;">Section</strong><br>
                                        <span style="font-weight: 700;">${student.section}</span>
                                    </div>
                                </div>
                            </div>
                            <div style="text-align: right;">
                                <strong style="font-size: 0.7rem; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 4px;">Admission No</strong>
                                <span style="font-weight: 700; color: #111827;">${student.admissionNo}</span>
                            </div>
                        </div>

                        <!-- Marks Table -->
                        <div class="table-responsive">
                            ${examType === 'all' ? this.renderBulkCumulativeTable(student, studentMarks, allExamTypes) : this.renderBulkDetailedTable(student, studentMarks, examType, getExamTotal, calculateGrade)}
                        </div>

                        <!-- Remarks -->
                        <div style="margin-top: 2rem; background: #f9fafb; padding: 1.25rem; border-radius: 10px; border: 1px solid #f3f4f6;">
                            <strong style="font-size: 0.7rem; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 8px;">Academic Remarks</strong>
                            <p style="margin: 0; font-style: italic; color: #374151; font-size: 0.875rem; line-height: 1.5;">
                                ${index % 3 === 0 ? "Outstanding performance! Keep up the excellent work and maintain this momentum." :
                        index % 3 === 1 ? "Very good progress. Strategic focus on consistency will lead to even better results." :
                            "Satisfactory progress. Encouraged to participate more actively in classroom discussions."}
                            </p>
                        </div>

                        <!-- Signatures -->
                        <div style="margin-top: 4rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 3rem; text-align: center; font-size: 0.7rem; font-weight: 700; color: #4b5563;">
                            <div><div style="border-bottom: 1px solid #9ca3af; margin-bottom: 10px; height: 30px;"></div>CLASS TEACHER</div>
                            <div><div style="border-bottom: 1px solid #9ca3af; margin-bottom: 10px; height: 30px;"></div>PRINCIPAL</div>
                            <div><div style="border-bottom: 1px solid #9ca3af; margin-bottom: 10px; height: 30px;"></div>PARENT/GUARDIAN</div>
                        </div>
                    </div>
                `;
            });
        }

        resultsContainer.innerHTML = html;
        downloadBtn.style.display = 'block';
        NotificationSystem.showToast('Success', `Generated ${viewMode === 'broadsheet' ? 'consolidated sheet' : students.length + ' marksheets'}.`, 'success');
    },

    renderConsolidatedSheet(students, marks, examType, allExamTypes, getExamTotal, calculateGrade, subjects) {
        // const subjects = Storage.get(STORAGE_KEYS.SUBJECTS); // Now passed as argument
        const examTotal = examType === 'all' ? 100 : getExamTotal(examType);

        let html = `
            <div class="marksheet-card" style="padding: 2.5rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <h1 style="margin: 0; color: var(--primary); font-size: 1.8rem;">CONSOLIDATED RESULT SHEET</h1>
                    <p style="margin: 5px 0; font-weight: 700; color: var(--gray-600);">Class: ${students[0].className} - ${students[0].section} | Exam: ${examType === 'all' ? 'Annual Summary' : examType}</p>
                </div>
                <div class="table-responsive">
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Adm No</th>
                                <th>Student Name</th>
                                ${subjects.map(s => `<th style="text-align:center; font-size: 0.7rem;">${s.name}</th>`).join('')}
                                <th style="text-align:center;">Total</th>
                                <th style="text-align:center;">%</th>
                                <th style="text-align:center;">Grade</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        students.forEach((student, idx) => {
            let studentTotal = 0;
            let subjectCount = 0;
            const studentMarks = marks.filter(m => m.data && m.data[student.id]);

            const subScores = subjects.map(s => {
                let score = 0;
                if (examType === 'all') {
                    const subjMarks = studentMarks.filter(m => m.subjectId === s.name);
                    if (subjMarks.length > 0) {
                        const sum = subjMarks.reduce((acc, m) => acc + (parseFloat(m.data[student.id]) || 0), 0);
                        score = sum / subjMarks.length;
                    }
                } else {
                    const mark = studentMarks.find(m => m.subjectId === s.name && m.examId === examType);
                    score = mark ? parseFloat(mark.data[student.id]) || 0 : 0;
                }
                studentTotal += score;
                subjectCount++;
                return `<td style="text-align:center;">${score > 0 ? score.toFixed(1) : '-'}</td>`;
            }).join('');

            const maxTotal = subjectCount * examTotal;
            const percentage = maxTotal > 0 ? (studentTotal / maxTotal) * 100 : 0;
            const grade = calculateGrade(studentTotal, maxTotal);

            html += `
                <tr>
                    <td>${idx + 1}</td>
                    <td style="font-size: 0.8rem;">${student.admissionNo}</td>
                    <td style="font-weight: 700;">${student.name}</td>
                    ${subScores}
                    <td style="text-align:center; font-weight: 800; color: var(--primary);">${studentTotal.toFixed(1)}</td>
                    <td style="text-align:center; font-weight: 600;">${percentage.toFixed(1)}%</td>
                    <td style="text-align:center;"><span class="grade-badge grade-${grade.charAt(0)}">${grade}</span></td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        return html;
    },

    renderBulkDetailedTable(student, studentMarks, examType, getExamTotal, calculateGrade) {
        const examMarks = studentMarks.filter(m => m.examId === examType);
        const totalMaxMarks = getExamTotal(examType);

        let grandTotalObtained = 0;
        let grandTotalPossible = 0;

        const rows = examMarks.map(m => {
            const score = parseFloat(m.data[student.id]) || 0;
            const percentage = (score / totalMaxMarks) * 100;
            const grade = calculateGrade(score, totalMaxMarks);
            grandTotalObtained += score;
            grandTotalPossible += totalMaxMarks;

            return `
                <tr>
                    <td style="font-weight: 600;">${m.subjectId}</td>
                    <td style="text-align: center; font-weight: 700; color: var(--primary);">${score}</td>
                    <td style="text-align: center; color: #6b7280;">${totalMaxMarks}</td>
                    <td style="text-align: center;">${percentage.toFixed(1)}%</td>
                    <td style="text-align: center;"><span class="grade-badge grade-${grade.charAt(0)}">${grade}</span></td>
                </tr>
            `;
        }).join('');

        const overallPercentage = grandTotalPossible > 0 ? (grandTotalObtained / grandTotalPossible) * 100 : 0;
        const overallGrade = calculateGrade(grandTotalObtained / (grandTotalPossible / 100));

        return `
            <table class="marks-table">
                <thead>
                    <tr>
                        <th style="width: 40%;">SUBJECTS</th>
                        <th style="text-align: center;">OBTAINED</th>
                        <th style="text-align: center;">MAX MARKS</th>
                        <th style="text-align: center;">PERCENT %</th>
                        <th style="text-align: center;">GRADE</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="text-align:center; padding: 2rem; color: #9ca3af;">No marks recorded for this student.</td></tr>'}
                </tbody>
                <tfoot>
                    <tr style="background: #f3f4f6; font-weight: 800;">
                        <td style="text-transform: uppercase; letter-spacing: 1px;">Aggregate Result</td>
                        <td style="text-align: center; font-size: 1.1rem; color: var(--primary);">${grandTotalObtained.toFixed(1)}</td>
                        <td style="text-align: center;">${grandTotalPossible}</td>
                        <td style="text-align: center;">${overallPercentage.toFixed(1)}%</td>
                        <td style="text-align: center;"><span class="grade-badge grade-${overallGrade.charAt(0)}" style="font-size: 0.9rem; padding: 4px 15px;">${overallGrade}</span></td>
                    </tr>
                </tfoot>
            </table>
        `;
    },

    renderBulkCumulativeTable(student, studentMarks, allExamTypes) {
        const subjects = [...new Set(studentMarks.map(m => m.subjectId))];
        const examNames = allExamTypes.map(e => e.name);

        return `
            <table class="marks-table">
                <thead>
                    <tr>
                        <th style="width: 30%;">SUBJECT</th>
                        ${examNames.map(name => `<th style="text-align:center; font-size: 0.65rem;">${name.toUpperCase()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${subjects.map(sub => `
                        <tr>
                            <td style="font-weight: 700;">${sub}</td>
                            ${examNames.map(exam => {
            const mark = studentMarks.find(m => m.subjectId === sub && m.examId === exam);
            return `<td style="text-align:center; font-weight: 600;">${mark ? mark.data[student.id] : '-'}</td>`;
        }).join('')}
                        </tr>
                    `).join('') || `<tr><td colspan="${examNames.length + 1}" style="text-align:center;">No performance data found.</td></tr>`}
                </tbody>
            </table>
        `;
    },

    manageHomework(container) {
        if (!this.checkPermission('manageHomework')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to manage homework.</p></div>';

        // Check if class is selected
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            return this.viewMyProfile(container);
        }

        const homework = Storage.get(STORAGE_KEYS.HOMEWORK);
        const classes = Storage.get(STORAGE_KEYS.CLASSES);

        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem;">
                <h2>Homework Management</h2>
                <button class="btn btn-primary" onclick="TeacherModule.showHomeworkForm()">
                    <i class="fas fa-plus"></i> Post Homework
                </button>
            </div>
            <div id="homework-list" class="glass-panel" style="padding: 0; margin-top: 1.5rem;">
                <div class="table-responsive">
                    <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Class</th>
                            <th style="padding: 1rem; text-align: left;">Subject</th>
                            <th style="padding: 1rem; text-align: left;">Due Date</th>
                            <th style="padding: 1rem; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="hw-table-body">
                        ${homework.reverse().map(hw => {
            // Calculate submission stats
            const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.homeworkId === hw.id);
            const totalStudents = Storage.get(STORAGE_KEYS.STUDENTS).filter(s =>
                Storage.get(STORAGE_KEYS.CLASSES).find(c => c.id === hw.classId)?.name === s.className
            ).length || 20;
            const submittedCount = submissions.length;
            const gradedCount = submissions.filter(s => s.status === 'Graded').length;
            const pendingCount = submittedCount - gradedCount;

            return `
                            <tr style="border-bottom: 1px solid var(--gray-100);">
                                <td style="padding: 1rem;">${hw.className}</td>
                                <td style="padding: 1rem;">${hw.subject}</td>
                                <td style="padding: 1rem;">${hw.dueDate}</td>
                                <td style="padding: 1rem; text-align: center;">
                                    <div style="display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap;">
                                        <button class="btn" style="color: #10b981; font-size: 0.85rem;" title="View all ${submittedCount}/${totalStudents} submissions" onclick="TeacherModule.viewSubmissions('${hw.id}', '${hw.subject}', ${totalStudents})">
                                            <i class="fas fa-file-alt"></i> ${submittedCount}/${totalStudents}
                                        </button>
                                        ${pendingCount > 0 ? `<span style="background: #fef3c7; color: #92400e; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">⏳ ${pendingCount} Pending</span>` : ''}
                                        ${gradedCount > 0 ? `<span style="background: #dcfce7; color: #166534; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">✓ ${gradedCount} Graded</span>` : ''}
                                        <button class="btn" style="color: var(--primary); font-size: 0.85rem;" onclick="TeacherModule.showHomeworkForm('${hw.id}')"><i class="fas fa-edit"></i></button>
                                        <button class="btn" style="color: var(--danger); font-size: 0.85rem;" onclick="TeacherModule.deleteHomework('${hw.id}')"><i class="fas fa-trash"></i></button>
                                    </div>
                                </td>
                            </tr>
                        `;
        }).join('') || '<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--gray-400);">No homework posted yet.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    showHomeworkForm(id = null) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const homework = id ? Storage.get(STORAGE_KEYS.HOMEWORK).find(h => h.id === id) : null;

        const content = `
            <form id="hw-form">
                <div class="form-group">
                    <label class="form-label">Select Class</label>
                    <select id="hw-class" class="form-control" required>
                        ${classes.map(c => {
            const selectedClassId = homework ? homework.classId : sessionStorage.getItem('selectedTeacherClassId');
            const isSelected = selectedClassId === c.id;
            return `<option value="${c.id}" ${isSelected ? 'selected' : ''}>${c.name} - ${c.section}</option>`;
        }).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Subject</label>
                    <input type="text" id="hw-subject" class="form-control" value="${homework ? homework.subject : ''}" placeholder="e.g. Mathematics" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Due Date</label>
                    <input type="date" id="hw-due-date" class="form-control" value="${homework ? homework.dueDate : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Homework Description</label>
                    <textarea id="hw-desc" class="form-control" rows="4" placeholder="Describe the assignment..." required>${homework ? homework.description : ''}</textarea>
                </div>
            </form>
        `;

        AdminModule.showModal(id ? 'Edit Homework' : 'Post New Homework', content, () => {
            const classId = document.getElementById('hw-class').value;
            const targetClass = classes.find(c => c.id === classId);

            const data = {
                classId: classId,
                className: targetClass ? targetClass.name : '',
                subject: document.getElementById('hw-subject').value,
                dueDate: document.getElementById('hw-due-date').value,
                description: document.getElementById('hw-desc').value,
                teacher: Auth.getCurrentUser().name
            };

            if (id) {
                Storage.updateItem(STORAGE_KEYS.HOMEWORK, id, data);
            } else {
                Storage.addItem(STORAGE_KEYS.HOMEWORK, data);
            }

            AdminModule.closeModal();
            this.manageHomework(document.getElementById('content-area'));
        });
    },

    deleteHomework(id) {
        if (confirm('Delete this homework?')) {
            Storage.deleteItem(STORAGE_KEYS.HOMEWORK, id);
            this.manageHomework(document.getElementById('content-area'));
        }
    },

    checkHomeworkStatus(container) {
        if (!this.checkPermission('manageHomework')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to check homework.</p></div>';

        // Check if class is selected
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            return this.viewMyProfile(container);
        }

        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const homework = Storage.get(STORAGE_KEYS.HOMEWORK).filter(hw => hw.classId === classId);
        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);

        // Calculate overall statistics
        const totalHomework = homework.length;
        const totalSubmissions = submissions.length;
        const totalPossibleSubmissions = homework.length * students.length;
        const completionRate = totalPossibleSubmissions > 0 ? Math.round((totalSubmissions / totalPossibleSubmissions) * 100) : 0;
        const averageScore = submissions.filter(s => s.score).length > 0
            ? Math.round(submissions.filter(s => s.score).reduce((sum, s) => sum + parseInt(s.score), 0) / submissions.filter(s => s.score).length)
            : 0;

        const content = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <!-- Total Homework Posted -->
                <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 700;">Total Homework</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #3b82f6; margin: 0.5rem 0;">${totalHomework}</div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">Posted assignments</div>
                </div>

                <!-- Overall Completion Rate -->
                <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 700;">Completion Rate</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #10b981; margin: 0.5rem 0;">${completionRate}%</div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">${totalSubmissions}/${totalPossibleSubmissions} submitted</div>
                </div>

                <!-- Average Score -->
                <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 700;">Average Score</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #d97706; margin: 0.5rem 0;">${averageScore}</div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">/100 across all submissions</div>
                </div>

                <!-- Students Count -->
                <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(139, 92, 246, 0.1)); border-radius: 12px; border: 1px solid rgba(168, 85, 247, 0.2);">
                    <div style="font-size: 0.75rem; text-transform: uppercase; color: #6b7280; font-weight: 700;">Students</div>
                    <div style="font-size: 2rem; font-weight: 800; color: #a855f7; margin: 0.5rem 0;">${students.length}</div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">In this class</div>
                </div>
            </div>

            <!-- Homework Status Grid -->
            <h3 style="margin-top: 2rem; margin-bottom: 1rem;">📚 All Homework Status</h3>
            <div style="display: grid; gap: 1.5rem;">
                ${homework.length > 0 ? homework.map(hw => {
            const hwSubmissions = submissions.filter(s => s.homeworkId === hw.id);
            const submittedCount = hwSubmissions.length;
            const notSubmittedCount = students.length - submittedCount;
            const gradedCount = hwSubmissions.filter(s => s.status === 'Graded').length;
            const pendingCount = submittedCount - gradedCount;
            const avgScore = hwSubmissions.filter(s => s.score).length > 0
                ? Math.round(hwSubmissions.filter(s => s.score).reduce((sum, s) => sum + parseInt(s.score), 0) / hwSubmissions.filter(s => s.score).length)
                : 0;
            const submissionRate = Math.round((submittedCount / students.length) * 100);
            const passCount = hwSubmissions.filter(s => s.score && parseInt(s.score) >= 40).length;
            const failCount = hwSubmissions.filter(s => s.score && parseInt(s.score) < 40).length;

            return `
                        <div class="glass-card" style="padding: 1.5rem; border-left: 4px solid #3b82f6;">
                            <div style="display: grid; grid-template-columns: 1fr auto; gap: 1rem; margin-bottom: 1.5rem; align-items: start;">
                                <div>
                                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1.1rem;">${hw.subject}</h4>
                                    <p style="margin: 0; font-size: 0.85rem; color: #6b7280;">Due: <strong>${hw.dueDate}</strong> • By: ${hw.teacher}</p>
                                </div>
                                <button class="btn btn-primary" style="white-space: nowrap;" onclick="TeacherModule.viewHomeworkDetails('${hw.id}', '${hw.subject}', ${students.length})">
                                    <i class="fas fa-eye"></i> View Details
                                </button>
                            </div>

                            <!-- Mini Stats Row -->
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.75rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--gray-200);">
                                <div style="padding: 0.75rem; background: #f3f4f6; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 0.7rem; text-transform: uppercase; color: #6b7280; font-weight: 600;">Submitted</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #3b82f6;">${submittedCount}/${students.length}</div>
                                    <div style="font-size: 0.65rem; color: #9ca3af;">${submissionRate}% rate</div>
                                </div>
                                <div style="padding: 0.75rem; background: #f3f4f6; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 0.7rem; text-transform: uppercase; color: #6b7280; font-weight: 600;">Graded</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #10b981;">${gradedCount}</div>
                                    <div style="font-size: 0.65rem; color: #9ca3af;">Reviewed</div>
                                </div>
                                <div style="padding: 0.75rem; background: #f3f4f6; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 0.7rem; text-transform: uppercase; color: #6b7280; font-weight: 600;">Pending</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #d97706;">${pendingCount}</div>
                                    <div style="font-size: 0.65rem; color: #9ca3af;">Awaiting grade</div>
                                </div>
                                <div style="padding: 0.75rem; background: #f3f4f6; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 0.7rem; text-transform: uppercase; color: #6b7280; font-weight: 600;">Avg Score</div>
                                    <div style="font-size: 1.5rem; font-weight: 700; color: #d97706;">${avgScore}</div>
                                    <div style="font-size: 0.65rem; color: #9ca3af;">/100</div>
                                </div>
                            </div>

                            <!-- Status Indicators -->
                            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                                ${submittedCount > 0 ? `
                                    <span style="background: #dbeafe; color: #1e40af; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                                        ✓ ${submittedCount} Submitted
                                    </span>
                                ` : ''}
                                ${notSubmittedCount > 0 ? `
                                    <span style="background: #fee2e2; color: #991b1b; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                                        ✗ ${notSubmittedCount} Not Submitted
                                    </span>
                                ` : ''}
                                ${passCount > 0 ? `
                                    <span style="background: #dcfce7; color: #166534; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                                        📈 ${passCount} Passed (≥40%)
                                    </span>
                                ` : ''}
                                ${failCount > 0 ? `
                                    <span style="background: #fecaca; color: #7f1d1d; padding: 0.4rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                                        📉 ${failCount} Below Pass (< 40%)
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    `;
        }).join('') : '<div style="text-align: center; padding: 3rem; color: var(--gray-400);"><i class="fas fa-inbox fa-3x"></i><p>No homework posted yet.</p></div>'}
            </div>
        `;

        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1.5rem;">
                <h2>Homework Verification Dashboard</h2>
                <p style="color: var(--gray-400); margin: 0.5rem 0 0 0; font-size: 0.9rem;">Check all homework submissions and verify if students completed them correctly</p>
            </div>
            ${content}
        `;
    },

    viewHomeworkDetails(hwId, subject, totalStudents) {
        const homework = Storage.get(STORAGE_KEYS.HOMEWORK).find(h => h.id === hwId);
        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.homeworkId === hwId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const notSubmittedIds = students.map(s => s.id).filter(sid => !submissions.find(sub => sub.studentId === sid));
        const notSubmittedStudents = students.filter(s => notSubmittedIds.includes(s.id));

        const gradedCount = submissions.filter(s => s.status === 'Graded').length;
        const pendingCount = submissions.length - gradedCount;
        const passCount = submissions.filter(s => s.score && parseInt(s.score) >= 40).length;
        const failCount = submissions.filter(s => s.score && parseInt(s.score) < 40).length;
        const avgScore = submissions.filter(s => s.score).length > 0
            ? Math.round(submissions.filter(s => s.score).reduce((sum, s) => sum + parseInt(s.score), 0) / submissions.filter(s => s.score).length)
            : 0;

        const content = `
            <!-- Statistics Header -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Total Submitted</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #3b82f6; font-size: 1.75rem;">${submissions.length}/${totalStudents}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">${Math.round((submissions.length / totalStudents) * 100)}% submission rate</p>
                </div>
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Graded</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #10b981; font-size: 1.75rem;">${gradedCount}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">Reviewed</p>
                </div>
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Average Score</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #d97706; font-size: 1.75rem;">${avgScore}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">/100</p>
                </div>
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1)); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Not Submitted</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #ef4444; font-size: 1.75rem;">${totalStudents - submissions.length}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">Missing</p>
                </div>
            </div>

            <!-- Tabs for Different Views -->
            <div style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--gray-200);">
                <button class="tab-btn" data-tab="all-submissions" onclick="TeacherModule.showHomeworkTab('all-submissions', '${hwId}')" style="padding: 0.75rem 1.25rem; background: #f3f4f6; border: none; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem;">
                    <i class="fas fa-list"></i> All Submissions (${submissions.length})
                </button>
                ${pendingCount > 0 ? `
                <button class="tab-btn" data-tab="pending" onclick="TeacherModule.showHomeworkTab('pending', '${hwId}')" style="padding: 0.75rem 1.25rem; background: #fffbeb; border: 1px solid #fbbf24; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; color: #92400e;">
                    <i class="fas fa-hourglass-end"></i> Pending (${pendingCount})
                </button>
                ` : ''}
                ${passCount > 0 ? `
                <button class="tab-btn" data-tab="passed" onclick="TeacherModule.showHomeworkTab('passed', '${hwId}')" style="padding: 0.75rem 1.25rem; background: #f0fdf4; border: 1px solid #86efac; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; color: #166534;">
                    <i class="fas fa-check-circle"></i> Passed (${passCount})
                </button>
                ` : ''}
                ${failCount > 0 ? `
                <button class="tab-btn" data-tab="failed" onclick="TeacherModule.showHomeworkTab('failed', '${hwId}')" style="padding: 0.75rem 1.25rem; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; color: #991b1b;">
                    <i class="fas fa-times-circle"></i> Below Pass (${failCount})
                </button>
                ` : ''}
                ${notSubmittedStudents.length > 0 ? `
                <button class="tab-btn" data-tab="not-submitted" onclick="TeacherModule.showHomeworkTab('not-submitted', '${hwId}')" style="padding: 0.75rem 1.25rem; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 20px; cursor: pointer; font-weight: 500; font-size: 0.9rem; color: #991b1b;">
                    <i class="fas fa-exclamation-circle"></i> Not Submitted (${notSubmittedStudents.length})
                </button>
                ` : ''}
            </div>

            <!-- Content Area -->
            <div id="homework-tab-content" style="min-height: 300px;">
                <!-- Content loaded by tab buttons -->
            </div>
        `;

        AdminModule.showModal(`📝 ${subject} - Detailed Verification`, content, () => {
            AdminModule.closeModal();
        });

        // Load first tab by default
        setTimeout(() => {
            TeacherModule.showHomeworkTab('all-submissions', hwId);
        }, 10);
    },

    showHomeworkTab(tabType, hwId) {
        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.homeworkId === hwId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const contentArea = document.getElementById('homework-tab-content');

        let fileredSubmissions = submissions;
        if (tabType === 'pending') {
            fileredSubmissions = submissions.filter(s => s.status !== 'Graded');
        } else if (tabType === 'passed') {
            fileredSubmissions = submissions.filter(s => s.status === 'Graded' && s.score >= 40);
        } else if (tabType === 'failed') {
            fileredSubmissions = submissions.filter(s => s.status === 'Graded' && s.score < 40);
        } else if (tabType === 'not-submitted') {
            const notSubmittedIds = students.map(s => s.id).filter(sid => !submissions.find(sub => sub.studentId === sid));
            const notSubmittedList = students.filter(s => notSubmittedIds.includes(s.id));
            contentArea.innerHTML = `
                <div style="display: grid; gap: 1rem;">
                    ${notSubmittedList.map(student => `
                        <div class="glass-card" style="padding: 1.25rem; border-left: 4px solid #ef4444;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${student.name}</h4>
                                    <span style="font-size: 0.7rem; color: var(--gray-400);">Admission: ${student.admissionNo}</span>
                                </div>
                                <span style="background: #fee2e2; color: #991b1b; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                    ✗ Not Submitted
                                </span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            return;
        }

        contentArea.innerHTML = `
            <div style="display: grid; gap: 1rem;">
                ${fileredSubmissions.map(s => {
            const student = students.find(st => st.id === s.studentId) || { name: 'Unknown', admissionNo: 'N/A' };
            const isGraded = s.status === 'Graded';
            const isPassed = isGraded && s.score >= 40;
            const isFailed = isGraded && s.score < 40;

            return `
                        <div class="glass-card" style="padding: 1.25rem; border-left: 4px solid ${isGraded ? (isPassed ? '#10b981' : '#ef4444') : '#f59e0b'};">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${student.name}</h4>
                                    <span style="font-size: 0.7rem; color: var(--gray-400);">Admission: ${student.admissionNo}</span>
                                </div>
                                <span style="background: ${isGraded ? (isPassed ? '#dcfce7' : '#fee2e2') : '#fef3c7'}; color: ${isGraded ? (isPassed ? '#15803d' : '#991b1b') : '#92400e'}; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                    ${isGraded ? (isPassed ? '✓ PASSED' : '✗ FAILED') : '⏳ Pending'}
                                </span>
                            </div>

                            ${isGraded ? `
                                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1rem; padding: 1rem; background: ${isPassed ? '#dcfce7' : '#fee2e2'}; border-radius: 8px; border: 1px solid ${isPassed ? '#86efac' : '#fca5a5'};">
                                    <div style="text-align: center; border-right: 1px solid ${isPassed ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'};">
                                        <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: ${isPassed ? '#15803d' : '#991b1b'};">Score</div>
                                        <div style="font-size: 1.5rem; font-weight: 800; color: ${isPassed ? '#15803d' : '#991b1b'};">${s.score}</div>
                                        <div style="font-size: 0.65rem; text-transform: uppercase; font-weight: 700; color: ${isPassed ? '#15803d' : '#991b1b'};">/100</div>
                                        ${isPassed ? '<div style="font-size: 0.7rem; color: #15803d; margin-top: 0.25rem;">✓ Pass</div>' : '<div style="font-size: 0.7rem; color: #991b1b; margin-top: 0.25rem;">✗ Fail</div>'}
                                    </div>
                                    <div>
                                        <div style="font-size: 0.65rem; text-transform: uppercase; color: ${isPassed ? '#15803d' : '#991b1b'}; font-weight: 700;">Teacher Feedback</div>
                                        <div style="font-size: 0.875rem; color: ${isPassed ? '#166534' : '#7f1d1d'}; margin-top: 0.25rem; line-height: 1.4;">${s.remarks || '—'}</div>
                                        <div style="font-size: 0.7rem; color: ${isPassed ? '#15803d' : '#991b1b'}; margin-top: 0.5rem;">Graded on ${new Date(s.gradedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            ` : ''}

                            <div style="padding: 0.75rem; background: #f9fafb; border-radius: 8px; margin-top: 1rem; font-size: 0.85rem; border: 1px solid var(--gray-200);">
                                <strong style="color: #374151;">Submission:</strong>
                                <p style="margin: 0.5rem 0 0 0; white-space: pre-wrap; line-height: 1.5; color: #6b7280;">${s.content}</p>
                                <div style="margin-top: 0.5rem; font-size: 0.75rem; color: #9ca3af;">Submitted: ${new Date(s.submittedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    viewSubmissions(hwId, subject, totalStudents = 20) {
        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.homeworkId === hwId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);

        // Calculate statistics
        const submittedCount = submissions.length;
        const gradedCount = submissions.filter(s => s.status === 'Graded').length;
        const pendingCount = submittedCount - gradedCount;
        const notSubmittedCount = totalStudents - submittedCount;
        const submissionRate = Math.round((submittedCount / totalStudents) * 100);

        const content = `
            <!-- Statistics Header -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1)); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Total Submitted</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #3b82f6; font-size: 1.75rem;">${submittedCount}/${totalStudents}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">${submissionRate}% submission rate</p>
                </div>
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Graded</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #10b981; font-size: 1.75rem;">${gradedCount}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">Reviewed</p>
                </div>
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1)); border-radius: 12px; border: 1px solid rgba(245, 158, 11, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Pending Review</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #d97706; font-size: 1.75rem;">${pendingCount}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">Awaiting grade</p>
                </div>
                <div style="padding: 1rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1)); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                    <p style="margin: 0; font-size: 0.75rem; color: #6b7280; font-weight: 600;">Not Submitted</p>
                    <h3 style="margin: 0.5rem 0 0 0; color: #ef4444; font-size: 1.75rem;">${notSubmittedCount}</h3>
                    <p style="margin: 0.5rem 0 0 0; font-size: 0.7rem; color: #9ca3af;">Missing</p>
                </div>
            </div>

            <!-- Filter and Sort Options -->
            <div style="display: flex; gap: 1rem; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--gray-200);">
                <button class="notif-filter-btn" data-filter="all" onclick="TeacherModule.filterSubmissions('all', '${hwId}', '${subject}', ${totalStudents})" style="padding: 0.5rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 20px; cursor: pointer; font-size: 0.875rem; transition: all 0.2s;">
                    <i class="fas fa-inbox"></i> All (${submittedCount})
                </button>
                ${pendingCount > 0 ? `
                <button class="notif-filter-btn" data-filter="pending" onclick="TeacherModule.filterSubmissions('pending', '${hwId}', '${subject}', ${totalStudents})" style="padding: 0.5rem 1rem; border: 1px solid #fbbf24; background: #fffbeb; border-radius: 20px; cursor: pointer; font-size: 0.875rem; color: #92400e; transition: all 0.2s;">
                    <i class="fas fa-hourglass-end"></i> Pending (${pendingCount})
                </button>
                ` : ''}
                ${gradedCount > 0 ? `
                <button class="notif-filter-btn" data-filter="graded" onclick="TeacherModule.filterSubmissions('graded', '${hwId}', '${subject}', ${totalStudents})" style="padding: 0.5rem 1rem; border: 1px solid #86efac; background: #f0fdf4; border-radius: 20px; cursor: pointer; font-size: 0.875rem; color: #166534; transition: all 0.2s;">
                    <i class="fas fa-check-circle"></i> Graded (${gradedCount})
                </button>
                ` : ''}
            </div>

            <!-- Submissions List -->
            <div id="submissions-container" style="max-height: 600px; overflow-y: auto; padding-right: 10px;">
                ${submissions.map(s => {
            const student = students.find(st => st.id === s.studentId) || { name: 'Unknown', admissionNo: 'N/A' };
            const isGraded = s.status === 'Graded';
            return `
                        <div class="glass-card submission-card" data-status="${isGraded ? 'graded' : 'pending'}" style="padding: 1.25rem; margin-bottom: 1.5rem; border-left: 4px solid ${isGraded ? '#10b981' : '#f59e0b'}; transition: all 0.2s;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                                <div>
                                    <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${student.name}</h4>
                                    <span style="font-size: 0.7rem; color: var(--gray-400);">Admission: ${student.admissionNo} | Submitted: ${new Date(s.submittedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <span class="badge" style="background: ${isGraded ? '#dcfce7' : '#fef3c7'}; color: ${isGraded ? '#15803d' : '#92400e'}; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                    ${isGraded ? '✓ Graded' : '⏳ Pending'}
                                </span>
                            </div>
                            
                            <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; border: 1px solid var(--gray-200); max-height: 150px; overflow-y: auto;">
                                <p style="margin: 0; white-space: pre-wrap; line-height: 1.5; color: #374151;">${s.content}</p>
                            </div>

                            ${isGraded ? `
                                <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1rem; align-items: start; background: #dcfce7; padding: 1rem; border-radius: 8px; border: 1px solid #86efac;">
                                    <div style="text-align: center; border-right: 1px solid rgba(34, 197, 94, 0.3);">
                                        <div style="font-size: 0.65rem; text-transform: uppercase; color: #15803d; font-weight: 700;">Score</div>
                                        <div style="font-size: 1.5rem; font-weight: 800; color: #15803d;">${s.score}</div>
                                        <div style="font-size: 0.65rem; text-transform: uppercase; color: #15803d; font-weight: 700;">/100</div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.65rem; text-transform: uppercase; color: #15803d; font-weight: 700;">Teacher's Feedback</div>
                                        <div style="font-size: 0.875rem; color: #166534; margin-top: 0.25rem;">${s.remarks || '—'}</div>
                                        <div style="font-size: 0.7rem; color: #15803d; margin-top: 0.5rem;">Graded on ${new Date(s.gradedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric' })}</div>
                                    </div>
                                </div>
                            ` : `
                                <div class="grading-form" style="display: grid; gap: 0.75rem; margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                                    <div style="display: grid; grid-template-columns: 80px 1fr; gap: 1rem; align-items: end;">
                                        <div class="form-group" style="margin: 0;">
                                            <label class="form-label" style="font-size: 0.7rem; font-weight: 600;">Score (0-100)</label>
                                            <input type="number" id="grade-score-${s.id}" class="form-control" min="0" max="100" placeholder="0" style="font-size: 0.9rem; padding: 0.5rem;">
                                        </div>
                                        <div class="form-group" style="margin: 0;">
                                            <label class="form-label" style="font-size: 0.7rem; font-weight: 600;">Feedback</label>
                                            <input type="text" id="grade-remarks-${s.id}" class="form-control" placeholder="Great work! Keep it up." style="font-size: 0.9rem; padding: 0.5rem;">
                                        </div>
                                    </div>
                                    <button class="btn btn-primary" style="width: 100%; border-radius: 8px; font-size: 0.85rem;" onclick="TeacherModule.saveGrade('${s.id}', '${hwId}', '${subject}', ${totalStudents})">
                                        <i class="fas fa-check"></i> Submit Grade
                                    </button>
                                </div>
                            `}
                        </div>
                    `;
        }).join('') || '<div style="text-align: center; padding: 3rem;"><i class="fas fa-inbox fa-3x" style="color: var(--gray-200); margin-bottom: 1rem;"></i><p style="color: var(--gray-400);">No submissions for this assignment yet.</p></div>'}
            </div>
        `;

        AdminModule.showModal(`📝 ${subject} - Submission Review (${submittedCount}/${totalStudents})`, content, () => {
            AdminModule.closeModal();
        });

        // Change Save button to Close
        setTimeout(() => {
            const saveBtn = document.getElementById('modal-save-btn');
            if (saveBtn) {
                saveBtn.textContent = 'Close';
                saveBtn.onclick = () => AdminModule.closeModal();
            }
        }, 10);
    },

    filterSubmissions(filterType, hwId, subject, totalStudents) {
        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS).filter(s => s.homeworkId === hwId);

        // Update active button
        document.querySelectorAll('.notif-filter-btn').forEach(btn => {
            btn.style.background = btn.dataset.filter === filterType ? (
                filterType === 'pending' ? '#fffbeb' :
                    filterType === 'graded' ? '#f0fdf4' : 'white'
            ) : 'white';
        });

        // Filter submissions
        let filtered = submissions;
        if (filterType === 'pending') {
            filtered = submissions.filter(s => s.status !== 'Graded');
        } else if (filterType === 'graded') {
            filtered = submissions.filter(s => s.status === 'Graded');
        }

        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const submissionsHtml = filtered.map(s => {
            const student = students.find(st => st.id === s.studentId) || { name: 'Unknown', admissionNo: 'N/A' };
            const isGraded = s.status === 'Graded';
            return `
                <div class="glass-card submission-card" data-status="${isGraded ? 'graded' : 'pending'}" style="padding: 1.25rem; margin-bottom: 1.5rem; border-left: 4px solid ${isGraded ? '#10b981' : '#f59e0b'}; transition: all 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <h4 style="margin: 0; font-size: 0.95rem; font-weight: 600;">${student.name}</h4>
                            <span style="font-size: 0.7rem; color: var(--gray-400);">Admission: ${student.admissionNo} | Submitted: ${new Date(s.submittedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span class="badge" style="background: ${isGraded ? '#dcfce7' : '#fef3c7'}; color: ${isGraded ? '#15803d' : '#92400e'}; padding: 0.4rem 0.8rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                            ${isGraded ? '✓ Graded' : '⏳ Pending'}
                        </span>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 1rem; border-radius: 8px; margin-bottom: 1rem; font-size: 0.875rem; border: 1px solid var(--gray-200); max-height: 150px; overflow-y: auto;">
                        <p style="margin: 0; white-space: pre-wrap; line-height: 1.5; color: #374151;">${s.content}</p>
                    </div>

                    ${isGraded ? `
                        <div style="display: grid; grid-template-columns: 100px 1fr; gap: 1rem; align-items: start; background: #dcfce7; padding: 1rem; border-radius: 8px; border: 1px solid #86efac;">
                            <div style="text-align: center; border-right: 1px solid rgba(34, 197, 94, 0.3);">
                                <div style="font-size: 0.65rem; text-transform: uppercase; color: #15803d; font-weight: 700;">Score</div>
                                <div style="font-size: 1.5rem; font-weight: 800; color: #15803d;">${s.score}</div>
                                <div style="font-size: 0.65rem; text-transform: uppercase; color: #15803d; font-weight: 700;">/100</div>
                            </div>
                            <div>
                                <div style="font-size: 0.65rem; text-transform: uppercase; color: #15803d; font-weight: 700;">Teacher's Feedback</div>
                                <div style="font-size: 0.875rem; color: #166534; margin-top: 0.25rem;">${s.remarks || '—'}</div>
                                <div style="font-size: 0.7rem; color: #15803d; margin-top: 0.5rem;">Graded on ${new Date(s.gradedAt).toLocaleString('en-IN', { month: 'short', day: 'numeric' })}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="grading-form" style="display: grid; gap: 0.75rem; margin-top: 1rem; padding: 1rem; background: #f0f9ff; border-radius: 8px; border: 1px solid #bfdbfe;">
                            <div style="display: grid; grid-template-columns: 80px 1fr; gap: 1rem; align-items: end;">
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 0.7rem; font-weight: 600;">Score (0-100)</label>
                                    <input type="number" id="grade-score-${s.id}" class="form-control" min="0" max="100" placeholder="0" style="font-size: 0.9rem; padding: 0.5rem;">
                                </div>
                                <div class="form-group" style="margin: 0;">
                                    <label class="form-label" style="font-size: 0.7rem; font-weight: 600;">Feedback</label>
                                    <input type="text" id="grade-remarks-${s.id}" class="form-control" placeholder="Great work! Keep it up." style="font-size: 0.9rem; padding: 0.5rem;">
                                </div>
                            </div>
                            <button class="btn btn-primary" style="width: 100%; border-radius: 8px; font-size: 0.85rem;" onclick="TeacherModule.saveGrade('${s.id}', '${hwId}', '${subject}', ${totalStudents})">
                                <i class="fas fa-check"></i> Submit Grade
                            </button>
                        </div>
                    `}
                </div>
            `;
        }).join('') || '<div style="text-align: center; padding: 3rem;"><i class="fas fa-inbox fa-3x" style="color: var(--gray-200); margin-bottom: 1rem;"></i><p style="color: var(--gray-400);">No submissions in this category.</p></div>';

        document.getElementById('submissions-container').innerHTML = submissionsHtml;
    },

    saveGrade(subId, hwId, subject, totalStudents = 20) {
        const scoreInput = document.getElementById(`grade-score-${subId}`);
        const remarksInput = document.getElementById(`grade-remarks-${subId}`);

        if (!scoreInput || !remarksInput) {
            console.error('Grade input fields not found');
            return;
        }

        const score = scoreInput.value;
        const remarks = remarksInput.value;

        // Validate score
        if (!score || isNaN(score) || score < 0 || score > 100) {
            return NotificationSystem.showToast('Input Error', 'Please enter a valid score (0-100).', 'warning');
        }

        const submissions = Storage.get(STORAGE_KEYS.SUBMISSIONS);
        const subIndex = submissions.findIndex(s => s.id === subId);

        if (subIndex !== -1) {
            // Update submission with grade details
            submissions[subIndex].score = parseInt(score);
            submissions[subIndex].remarks = remarks || 'No feedback provided';
            submissions[subIndex].status = 'Graded';
            submissions[subIndex].gradedAt = new Date().toISOString();

            // Save to storage
            Storage.save(STORAGE_KEYS.SUBMISSIONS, submissions);

            // Find student info for notification
            const submission = submissions[subIndex];
            const student = Storage.get(STORAGE_KEYS.STUDENTS).find(s => s.id === submission.studentId);

            // Create notification for student
            if (window.NotificationSystem && student) {
                NotificationSystem.createNotification({
                    userId: student.id,
                    type: 'homework',
                    title: 'Homework Graded',
                    message: `Your submission for "${subject}" has been graded. Score: ${score}/100`,
                    priority: 'medium',
                    relatedId: hwId,
                    relatedType: 'homework'
                });
            }

            // Visual feedback
            const btn = event.target;
            btn.style.opacity = '0.6';
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!';

            setTimeout(() => {
                // Re-open modal to refresh
                AdminModule.closeModal();
                setTimeout(() => this.viewSubmissions(hwId, subject, totalStudents), 100);
            }, 500);
        }
    },

    manageNotices(container) {
        if (!this.checkPermission('manageNotices')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to manage notices.</p></div>';

        // Check if class is selected
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            return this.viewMyProfile(container);
        }

        const notices = Storage.get(STORAGE_KEYS.NOTICES);

        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem;">
                <h2>Notices & Announcements</h2>
                <button class="btn btn-primary" onclick="TeacherModule.showNoticeForm()">
                    <i class="fas fa-bullhorn"></i> New Notice
                </button>
            </div>
            <div id="notices-list" class="glass-panel" style="padding: 0;">
            <div class="table-responsive">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Title</th>
                            <th style="padding: 1rem; text-align: left;">Date</th>
                            <th style="padding: 1rem; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="notice-table-body">
                        ${notices.reverse().map(n => `
                            <tr style="border-bottom: 1px solid var(--gray-100);">
                                <td style="padding: 1rem; font-weight: 500;">${n.title}</td>
                                <td style="padding: 1rem;">${new Date(n.createdAt).toLocaleDateString()}</td>
                                <td style="padding: 1rem; text-align: center;">
                                    <button class="btn" style="color: var(--primary);" onclick="TeacherModule.showNoticeForm('${n.id}')"><i class="fas fa-edit"></i></button>
                                    <button class="btn" style="color: var(--danger);" onclick="TeacherModule.deleteNotice('${n.id}')"><i class="fas fa-trash"></i></button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--gray-400);">No notices posted yet.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    showNoticeForm(id = null) {
        const notice = id ? Storage.get(STORAGE_KEYS.NOTICES).find(n => n.id === id) : null;

        const content = `
            <form id="notice-form">
                <div class="form-group">
                    <label class="form-label">Title</label>
                    <input type="text" id="notice-title" class="form-control" value="${notice ? notice.title : ''}" placeholder="e.g. Sports Day Announcement" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Content</label>
                    <textarea id="notice-content" class="form-control" rows="5" placeholder="Enter notice details..." required>${notice ? notice.content : ''}</textarea>
                </div>
            </form>
        `;

        AdminModule.showModal(id ? 'Edit Notice' : 'Post New Notice', content, () => {
            const data = {
                title: document.getElementById('notice-title').value,
                content: document.getElementById('notice-content').value,
                teacher: Auth.getCurrentUser().name
            };

            if (id) {
                Storage.updateItem(STORAGE_KEYS.NOTICES, id, data);
            } else {
                Storage.addItem(STORAGE_KEYS.NOTICES, data);
            }

            AdminModule.closeModal();
            this.manageNotices(document.getElementById('content-area'));
        });
    },

    deleteNotice(id) {
        if (confirm('Delete this notice?')) {
            Storage.deleteItem(STORAGE_KEYS.NOTICES, id);
            this.manageNotices(document.getElementById('content-area'));
        }
    },

    viewMyProfile(container) {
        const user = Auth.getCurrentUser();
        const allTeachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const teacherData = allTeachers.find(t => t.username === user.username) || {};

        // Class Selection Logic
        const availableClasses = teacherData && teacherData.assignedClassIds
            ? classes.filter(c => teacherData.assignedClassIds.includes(c.id))
            : classes;

        const currentClassId = sessionStorage.getItem('selectedTeacherClassId');

        // Get REAL attendance data for current month
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const attendanceRecords = Storage.get(STORAGE_KEYS.TEACHER_ATTENDANCE) || [];

        // Calculate attendance summary based on Admin's marking
        let daysPresent = 0;
        let daysAbsent = 0;
        let totalMarkedDays = 0;

        attendanceRecords.forEach(record => {
            const d = new Date(record.date);
            if ((d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear) {
                if (record.data && record.data[teacherData.id]) {
                    totalMarkedDays++;
                    if (record.data[teacherData.id] === 'present') {
                        daysPresent++;
                    } else {
                        daysAbsent++;
                    }
                }
            }
        });

        const attendancePercentage = totalMarkedDays > 0
            ? ((daysPresent / totalMarkedDays) * 100).toFixed(1)
            : '0.0';

        // Document Types
        const docTypes = [
            { id: 'resume', name: 'Resume / CV' },
            { id: 'id_proof', name: 'ID Proof (Aadhar/PAN)' },
            { id: 'contract', name: 'Employment Contract' }
        ];

        container.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 1rem;">
                <div style="display: grid; grid-template-columns: 350px 1fr; gap: 2rem; align-items: start;">
                    
                    <!-- LEFT COLUMN -->
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        
                        <!-- Profile Card -->
                        <div class="glass-panel" style="text-align: center; padding: 2rem;">
                            <div style="width: 100px; height: 100px; border-radius: 50%; background: var(--accent); color: white; display: flex; align-items: center; justify-content: center; font-size: 3rem; margin: 0 auto 1rem; font-weight: bold;">
                                ${user.name.charAt(0)}
                            </div>
                            <h2 style="margin: 0;">${user.name}</h2>
                            <p style="color: var(--gray-500); margin: 0.5rem 0 1rem;">${user.username}</p>
                            <span class="badge" style="background: #fef3c7; color: #92400e; text-transform: uppercase; font-size: 0.75rem;">${user.role}</span>
                        </div>

                        <!-- Attendance Summary -->
                        <div class="glass-panel" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(167, 243, 208, 0.05)); border-left: 4px solid #10b981;">
                            <h3 style="margin-top: 0; color: #059669; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem;">
                                <i class="fas fa-calendar-check"></i> Your Attendance
                            </h3>
                            <p style="font-size: 0.8rem; color: var(--gray-600); margin-bottom: 1rem;">
                                ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                            
                            <div style="display: flex; justify-content: space-between; text-align: center; margin-bottom: 1rem;">
                                <div>
                                    <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">${daysPresent}/${totalMarkedDays}</div>
                                    <div style="font-size: 0.75rem; color: var(--gray-500);">Days Present</div>
                                </div>
                                <div>
                                    <div style="font-size: 1.5rem; font-weight: bold; color: #059669;">${attendancePercentage}%</div>
                                    <div style="font-size: 0.75rem; color: var(--gray-500);">Percentage</div>
                                </div>
                            </div>
                            <div style="font-size: 0.75rem; color: var(--gray-500); background: rgba(255,255,255,0.5); padding: 0.5rem; border-radius: 4px;">
                                <i class="fas fa-info-circle"></i> Based on admin records.
                            </div>
                        </div>

                        <!-- My Documents Section -->
                        <div class="glass-panel" style="padding: 1.5rem;">
                            <h3 style="margin-top: 0; color: #2563eb; display: flex; align-items: center; gap: 0.75rem; font-size: 1.1rem; margin-bottom: 1rem;">
                                <i class="fas fa-folder-open"></i> My Documents
                            </h3>
                            
                            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                                ${docTypes.map(doc => {
            const docInfo = Storage.getTeacherDocument(teacherData.id, doc.id);
            const isUploaded = docInfo.type === 'manual';
            return `
                                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.5); border-radius: 8px; border: 1px solid var(--gray-200);">
                                            <div style="overflow: hidden;">
                                                <div style="font-size: 0.85rem; font-weight: 600; color: var(--gray-800); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${doc.name}</div>
                                                <div style="font-size: 0.7rem;">
                                                    ${isUploaded
                    ? `<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Available</span>`
                    : `<span style="color: var(--gray-400);">Missing</span>`
                }
                                                </div>
                                            </div>
                                            ${isUploaded
                    ? `<button class="btn-icon" style="color: var(--primary);" onclick="window.open('${docInfo.src}')" title="View"><i class="fas fa-eye"></i></button>`
                    : ``
                }
                                        </div>
                                    `;
        }).join('')}
                            </div>
                        </div>

                    </div>

                    <!-- RIGHT COLUMN -->
                    <div style="display: flex; flex-direction: column; gap: 1.5rem;">
                        
                        <!-- Class Selection Area -->
                        <div class="glass-panel" style="padding: 2rem; background: linear-gradient(to right, rgba(79, 70, 229, 0.05), rgba(168, 85, 247, 0.05)); border: 1px solid rgba(79, 70, 229, 0.1);">
                            <h3 style="margin-top: 0; color: var(--primary); margin-bottom: 0.5rem;">
                                <i class="fas fa-chalkboard-teacher"></i> Class Management
                            </h3>
                            <p style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1.5rem;">
                                Select the active class you want to manage.
                            </p>
                            <div style="display: flex; gap: 1rem; align-items: flex-end;">
                                <div style="flex: 1;">
                                    <label class="form-label">Assigned Classes</label>
                                    <select id="profile-class-select" class="form-control">
                                        <option value="">-- Select Class --</option>
                                        ${availableClasses.map(c => `
                                            <option value="${c.id}" ${currentClassId === c.id ? 'selected' : ''}>
                                                ${c.name} - ${c.section}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                <button class="btn btn-primary" onclick="TeacherModule.confirmProfileClassSelection()">
                                    Open Dashboard <i class="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>

                        <!-- Personal Details Grid -->
                        <div class="glass-panel" style="padding: 2rem;">
                            <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: var(--gray-800);">Personal Details</h3>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                                <div>
                                    <label style="font-size: 0.75rem; color: var(--gray-500); display: block; margin-bottom: 0.25rem;">Employee ID</label>
                                    <div style="font-size: 1rem; font-weight: 600; color: var(--gray-800);">${teacherData.employeeId || 'N/A'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.75rem; color: var(--gray-500); display: block; margin-bottom: 0.25rem;">Subject Specialty</label>
                                    <div style="font-size: 1rem; font-weight: 600; color: var(--gray-800);">${teacherData.subject || 'All Subjects'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.75rem; color: var(--gray-500); display: block; margin-bottom: 0.25rem;">Mobile Number</label>
                                    <div style="font-size: 1rem; font-weight: 600; color: var(--gray-800);">${teacherData.mobile || 'N/A'}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.75rem; color: var(--gray-500); display: block; margin-bottom: 0.25rem;">Email</label>
                                    <div style="font-size: 1rem; font-weight: 600; color: var(--gray-800);">${teacherData.email || user.username}</div>
                                </div>
                                <div>
                                    <label style="font-size: 0.75rem; color: var(--gray-500); display: block; margin-bottom: 0.25rem;">Joined Date</label>
                                    <div style="font-size: 1rem; font-weight: 600; color: var(--gray-800);">${teacherData.doj ? new Date(teacherData.doj).toLocaleDateString() : 'N/A'}</div>
                                </div>
                            </div>

                            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-100);">
                                <button class="btn" style="width: 100%; border: 1px dashed var(--gray-300); color: var(--gray-500);" onclick="NotificationSystem.showToast('Info', 'Contact Admin to update profile details', 'info')">
                                    <i class="fas fa-pen"></i> Request Profile Update
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
    },

    viewMyAttendance(container) {
        const user = Auth.getCurrentUser();
        const allTeachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const teacherData = allTeachers.find(t => t.username === user.username) || {};

        // Get REAL attendance data for current month
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();
        const attendanceRecords = Storage.get(STORAGE_KEYS.TEACHER_ATTENDANCE) || [];

        let daysPresent = 0;
        let totalMarkedDays = 0;

        attendanceRecords.forEach(record => {
            const d = new Date(record.date);
            if ((d.getMonth() + 1) === currentMonth && d.getFullYear() === currentYear) {
                if (record.data && record.data[teacherData.id]) {
                    totalMarkedDays++;
                    if (record.data[teacherData.id] === 'present') {
                        daysPresent++;
                    }
                }
            }
        });

        const attendancePercentage = totalMarkedDays > 0
            ? ((daysPresent / totalMarkedDays) * 100).toFixed(1)
            : '0.0';

        container.innerHTML = `
            <div style="max-width: 800px; margin: 2rem auto;">
                <div class="glass-panel" style="padding: 1.5rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(167, 243, 208, 0.05)); border-left: 4px solid #10b981;">
                    <h2 style="margin-top: 0; color: #059669; display: flex; align-items: center; gap: 0.75rem;">
                        <i class="fas fa-calendar-check"></i> Your Attendance Log
                    </h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">
                        Detailed attendance record for ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </p>
                    
                    <div style="display: flex; gap: 2rem; margin-bottom: 2rem;">
                        <div style="flex: 1; padding: 1.5rem; background: white; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 2rem; font-weight: bold; color: #059669;">${daysPresent}/${totalMarkedDays}</div>
                            <div style="font-size: 0.875rem; color: var(--gray-500);">Days Present</div>
                        </div>
                        <div style="flex: 1; padding: 1.5rem; background: white; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                            <div style="font-size: 2rem; font-weight: bold; color: #059669;">${attendancePercentage}%</div>
                            <div style="font-size: 0.875rem; color: var(--gray-500);">Percentage</div>
                        </div>
                    </div>

                     <div style="padding: 1rem; background: rgba(16, 185, 129, 0.05); border-radius: 6px; border-left: 4px solid #059669;">
                        <p style="margin: 0; font-size: 0.875rem; color: #047857;">
                            <i class="fas fa-info-circle"></i> This record is maintained by the School Administration.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    viewMyDocuments(container) {
        const user = Auth.getCurrentUser();
        const allTeachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const teacherData = allTeachers.find(t => t.username === user.username) || {};

        const docTypes = [
            { id: 'resume', name: 'Resume / CV' },
            { id: 'id_proof', name: 'ID Proof (Aadhar/PAN)' },
            { id: 'contract', name: 'Employment Contract' }
        ];

        container.innerHTML = `
            <div style="max-width: 800px; margin: 2rem auto;">
                <div class="glass-panel" style="padding: 1.5rem;">
                    <h2 style="margin-top: 0; color: #2563eb; display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
                        <i class="fas fa-folder-open"></i> My Documents
                    </h2>
                    <p style="color: var(--gray-600); margin-bottom: 2rem;">
                        Official documents on file.
                    </p>
                    
                    <div style="display: grid; gap: 1rem;">
                        ${docTypes.map(doc => {
            const docInfo = Storage.getTeacherDocument(teacherData.id, doc.id);
            const isUploaded = docInfo.type === 'manual';
            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; background: white; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                    <div style="display: flex; align-items: center; gap: 1rem;">
                                        <div style="width: 40px; height: 40px; background: ${isUploaded ? '#d1fae5' : '#f3f4f6'}; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                                            <i class="fas ${isUploaded ? 'fa-file-alt' : 'fa-exclamation'}" style="color: ${isUploaded ? '#059669' : '#9ca3af'}"></i>
                                        </div>
                                        <div>
                                            <strong style="color: var(--gray-800); font-size: 1.1rem; display: block;">${doc.name}</strong>
                                            <div style="font-size: 0.85rem; margin-top: 4px;">
                                                ${isUploaded
                    ? `<span style="color: var(--success);"><i class="fas fa-check-circle"></i> On File</span>`
                    : `<span style="color: var(--gray-400);">Not Uploaded</span>`
                }
                                            </div>
                                        </div>
                                    </div>
                                    ${isUploaded
                    ? `<button class="btn" style="color: var(--primary); border: 1px solid var(--primary-light);" onclick="window.open('${docInfo.src}')"><i class="fas fa-eye"></i> View Document</button>`
                    : ``
                }
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    confirmProfileClassSelection() {
        const classId = document.getElementById('profile-class-select').value;
        if (!classId) return NotificationSystem.showToast('Input Error', 'Please select a class to proceed to the dashboard.', 'warning');

        sessionStorage.setItem('selectedTeacherClassId', classId);
        // Refresh sidebar to show all menu items
        if (typeof renderSidebar === 'function') {
            renderSidebar();
        }
        // Navigate to dashboard
        loadModule('teacherDashboard', 'teacher-dash', 'Classroom Dashboard');
    },

    manageStudents(container) {
        if (!this.checkPermission('manageStudents')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to manage students.</p></div>';

        // Check if class is selected
        if (!sessionStorage.getItem('selectedTeacherClassId')) {
            return this.viewMyProfile(container);
        }

        const classId = sessionStorage.getItem('selectedTeacherClassId');
        if (!classId) return this.teacherDashboard(container);

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const targetClass = classes.find(c => c.id === classId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.className === targetClass.name && s.section === targetClass.section);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 0;">
                <div style="padding: 1.5rem; border-bottom: 1px solid var(--gray-100);">
                    <h3 style="margin: 0;">Class List: ${targetClass.name} - ${targetClass.section}</h3>
                </div>
            <div class="table-responsive">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Roll No</th>
                            <th style="padding: 1rem; text-align: left;">Name</th>
                            <th style="padding: 1rem; text-align: left;">Guardian</th>
                            <th style="padding: 1rem; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${students.map(s => `
                            <tr style="border-bottom: 1px solid var(--gray-100);">
                                <td style="padding: 1rem;">${s.admissionNo}</td>
                                <td style="padding: 1rem; font-weight: 600;">${s.name}</td>
                                <td style="padding: 1rem;">${s.guardianName}</td>
                                <td style="padding: 1rem; text-align: center;">
                                    <button class="btn" style="color: var(--accent);" title="Manage Documents" onclick="TeacherModule.manageStudentDocuments('${s.id}')">
                                        <i class="fas fa-file-alt"></i> Docs
                                    </button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" style="padding: 2rem; text-align: center;">No students found in this class.</td></tr>'}
                    </tbody>
                </table>
            </div>
        `;
    },

    manageStudentDocuments(studentId) {
        const student = Storage.getItemById(STORAGE_KEYS.STUDENTS, studentId);
        const docTypes = [
            { id: 'aadhar', name: 'Aadhar Card' },
            { id: 'tc', name: 'Transfer Certificate' },
            { id: 'birth', name: 'Birth Certificate' }
        ];

        const content = `
            <div style="padding: 1rem;">
                <p style="margin-bottom: 2rem; color: var(--gray-600);">Manage documents for <strong>${student.name}</strong></p>
                ${docTypes.map(doc => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px; margin-bottom: 1rem;">
                        <div>
                            <strong>${doc.name}</strong>
                            <div style="font-size: 0.75rem; margin-top: 4px;">
                                ${(() => {
                const docInfo = Storage.getDocument(studentId, doc.id);
                if (docInfo.type === 'manual') {
                    return `<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Uploaded</span>`;
                } else {
                    return `
                                            <span id="status-text-${doc.id}" style="color: var(--danger);"><i class="fas fa-times-circle"></i> Missing</span>
                                            <img src="${docInfo.src}" style="display:none;" onload="document.getElementById('status-text-${doc.id}').innerHTML='<span style=\\'color: var(--success);\\'><i class=\\'fas fa-check-circle\\'></i> Auto-Detected</span>'; document.getElementById('view-btn-${doc.id}').style.display='inline-block';" />
                                        `;
                }
            })()}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${(() => {
                const docInfo = Storage.getDocument(studentId, doc.id);
                return `
                                    <button id="view-btn-${doc.id}" class="btn" style="${docInfo.type === 'manual' ? '' : 'display:none;'}" onclick="window.open('${docInfo.src}')">View</button>
                                `;
            })()}
                            <label class="btn btn-primary" style="cursor: pointer;">
                                <i class="fas fa-upload"></i> ${Storage.getDocument(studentId, doc.id).type === 'manual' ? 'Update' : 'Upload'}
                                <input type="file" style="display: none;" accept="image/*,application/pdf" onchange="TeacherModule.handleTeacherDocUpload(this, '${doc.id}', '${studentId}')">
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // We reuse AdminModule's modal helper but scoped to our actions
        if (typeof AdminModule !== 'undefined' && AdminModule.showModal) {
            AdminModule.showModal(`Documents: ${student.name}`, content, () => AdminModule.closeModal());
            document.getElementById('modal-save-btn').style.display = 'none';
        } else {
            NotificationSystem.showToast('System Error', "Modal system not initialized. Please refresh.", 'error');
        }
    },

    handleTeacherDocUpload(input, docType, studentId) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];
        if (file.size > 2 * 1024 * 1024) return NotificationSystem.showToast('Error', 'File size must be under 2MB', 'error');

        const processFile = (base64) => {
            const allDocs = Storage.get(STORAGE_KEYS.DOCUMENTS);
            let docIndex = allDocs.findIndex(d => d.studentId === studentId);

            if (docIndex === -1) {
                allDocs.push({ studentId, [docType]: base64, updatedAt: new Date().toISOString() });
            } else {
                allDocs[docIndex][docType] = base64;
                allDocs[docIndex].updatedAt = new Date().toISOString();
            }

            Storage.save(STORAGE_KEYS.DOCUMENTS, allDocs);
            NotificationSystem.showToast('Success', 'Document uploaded successfully!', 'success');
            this.manageStudentDocuments(studentId);
        };

        if (file.type.startsWith('image/')) {
            Storage.resizeImage(file, 800, 800, (resizedBase64) => {
                processFile(resizedBase64);
            });
        } else {
            const reader = new FileReader();
            reader.onload = (e) => processFile(e.target.result);
            reader.readAsDataURL(file);
        }
    },

    // STUDENT MANAGEMENT
    manageStudents(container) {
        if (!this.checkPermission('manageStudents')) return container.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--danger);"><h3>Access Denied</h3><p>You do not have permission to manage students.</p></div>';

        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem;">
                <h2>My Students</h2>
                <button class="btn btn-primary" onclick="TeacherModule.showStudentForm()">
                    <i class="fas fa-plus"></i> Add Student
                </button>
            </div>
            <div id="students-list" class="glass-panel" style="padding: 0;">
            <div class="table-responsive">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Student</th>
                            <th style="padding: 1rem; text-align: left;">Adm No.</th>
                            <th style="padding: 1rem; text-align: left;">Contact</th>
                            <th style="padding: 1rem; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="students-table-body"></tbody>
                </table>
            </div>
        `;
        this.renderStudentsTable();
    },

    renderStudentsTable() {
        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);

        const tbody = document.getElementById('students-table-body');
        if (!tbody) return;

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--gray-400);">No students enrolled in this class.</td></tr>`;
            return;
        }

        tbody.innerHTML = students.map(s => `
            <tr style="border-bottom: 1px solid var(--gray-100);">
                <td style="padding: 1rem;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="width: 30px; height: 30px; border-radius: 50%; background: var(--gray-100); overflow: hidden;">
                            ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-user" style="padding: 7px;"></i>`}
                        </div>
                        <div style="font-weight: 600;">${s.name}</div>
                    </div>
                </td>
                <td style="padding: 1rem;">${s.admissionNo}</td>
                <td style="padding: 1rem;">${s.guardianName} (${s.mobile})</td>
                <td style="padding: 1rem; text-align: center;">
                    <button class="btn" style="color: var(--primary);" onclick="TeacherModule.showStudentForm('${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--danger);" onclick="TeacherModule.deleteStudent('${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    showStudentForm(studentId = null) {
        const s = studentId ? Storage.getItemById(STORAGE_KEYS.STUDENTS, studentId) : {
            name: '', admissionNo: '', gender: 'Male', dob: '',
            guardianName: '', guardianMobile: '', address: '', photo: ''
        };

        const classId = sessionStorage.getItem('selectedTeacherClassId');
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const activeClass = classes.find(c => c.id === classId);

        const content = `
            <div id="student-form" class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div class="form-group" style="grid-column: span 2; text-align: center;">
                    <div id="photo-preview" style="width: 100px; height: 100px; border-radius: 50%; background: #f0f0f0; margin: 0 auto 10px; overflow: hidden; border: 2px solid var(--primary);">
                        ${s.photo ? `<img src="${s.photo}" style="width:100%; height:100%; object-fit:cover;">` : `<i class="fas fa-camera fa-2x" style="margin-top: 30px; color: #ccc;"></i>`}
                    </div>
                    <input type="file" id="s-photo" accept="image/*" style="font-size: 0.75rem;">
                </div>
                <div class="form-group">
                    <label class="form-label">Student Name</label>
                    <input type="text" id="s-name" class="form-control" value="${s.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Admission Number</label>
                    <input type="text" id="s-adm-no" class="form-control" value="${s.admissionNo}" required>
                </div>
                
                <!-- Read-only Class Info -->
                <div class="form-group">
                    <label class="form-label">Class</label>
                    <input type="text" class="form-control" value="${activeClass.name}" disabled style="background: var(--gray-100);">
                </div>
                <div class="form-group">
                    <label class="form-label">Section</label>
                    <input type="text" class="form-control" value="${activeClass.section}" disabled style="background: var(--gray-100);">
                </div>

                <div class="form-group">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" id="s-dob" class="form-control" value="${s.dob}">
                </div>
                <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select id="s-gender" class="form-control">
                        <option value="Male" ${s.gender === 'Male' ? 'selected' : ''}>Male</option>
                        <option value="Female" ${s.gender === 'Female' ? 'selected' : ''}>Female</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Guardian Name</label>
                    <input type="text" id="s-guardian" class="form-control" value="${s.guardianName}">
                </div>
                <div class="form-group">
                    <label class="form-label">Mobile Number</label>
                    <input type="tel" id="s-mobile" class="form-control" value="${s.guardianMobile}">
                </div>
                <div class="form-group" style="grid-column: span 2;">
                    <label class="form-label">Address</label>
                    <textarea id="s-address" class="form-control" rows="2">${s.address}</textarea>
                </div>
                
                <!-- Credentials Section -->
                <div style="grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: var(--radius-md); margin-top: 0.5rem;">
                    <div class="form-group">
                        <label class="form-label">Login Username</label>
                        <input type="text" id="s-username" class="form-control" value="${s.username || ''}" placeholder="Set username" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Login Password</label>
                        <input type="password" id="s-password" class="form-control" value="${s.password || '123'}" placeholder="Set password" required>
                    </div>
                </div>
            </div>
        `;

        AdminModule.showModal(studentId ? 'Edit Student' : 'Add Student', content, () => {
            const data = {
                name: document.getElementById('s-name').value,
                admissionNo: document.getElementById('s-adm-no').value,
                className: activeClass.name,
                section: activeClass.section,
                classId: activeClass.id,
                dob: document.getElementById('s-dob').value,
                gender: document.getElementById('s-gender').value,
                guardianName: document.getElementById('s-guardian').value,
                guardianMobile: document.getElementById('s-mobile').value,
                address: document.getElementById('s-address').value,
                photo: document.getElementById('photo-preview').querySelector('img')?.src || '',
                username: document.getElementById('s-username').value,
                password: document.getElementById('s-password').value,
                role: 'student'
            };

            if (studentId) {
                Storage.updateItem(STORAGE_KEYS.STUDENTS, studentId, data);
                // Sync users
                const users = Storage.get(STORAGE_KEYS.USERS);
                const sUserIdx = users.findIndex(u => u.username === s.admissionNo || u.username === s.username);
                if (sUserIdx > -1) {
                    users[sUserIdx] = { ...users[sUserIdx], ...data, id: users[sUserIdx].id };
                } else {
                    // Check if username changed, might need to find by id if available, but Storage keys don't have consistent ID in USERS, mostly username.
                    // Just update based on index if found.
                }
                Storage.save(STORAGE_KEYS.USERS, users);
            } else {
                const added = Storage.addItem(STORAGE_KEYS.STUDENTS, data);
                // Add user
                const users = Storage.get(STORAGE_KEYS.USERS);
                users.push({ ...data, id: added.id });
                Storage.save(STORAGE_KEYS.USERS, users);
            }
            AdminModule.closeModal();
            this.manageStudents(document.getElementById('content-area'));
        });

        // Photo Preview Logic
        const photoInput = document.getElementById('s-photo');
        if (photoInput) {
            photoInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    Storage.resizeImage(file, 200, 200, (resizedSrc) => {
                        const preview = document.getElementById('photo-preview');
                        if (preview) preview.innerHTML = `<img src="${resizedSrc}" style="width:100%; height:100%; object-fit:cover;">`;
                    });
                }
            };
        }
    },

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            const student = Storage.getItemById(STORAGE_KEYS.STUDENTS, id);
            Storage.deleteItem(STORAGE_KEYS.STUDENTS, id);
            // Sync users
            if (student) {
                const users = Storage.get(STORAGE_KEYS.USERS);
                const filteredUsers = users.filter(u => u.username !== student.username);
                Storage.save(STORAGE_KEYS.USERS, filteredUsers);
            }
            this.renderStudentsTable();
        }
    }
};
