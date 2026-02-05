/**
 * admin.js
 * Admin module for managing students, teachers, classes, and subjects.
 */

const AdminModule = {
    // Shared Modal Helper
    showModal(title, content, onSave) {
        let modal = document.getElementById('app-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'app-modal';
            modal.className = 'modal-overlay';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal-content glass-panel" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1.5rem;">
                    <h2>${title}</h2>
                    <button class="btn" onclick="AdminModule.closeModal()"><i class="fas fa-times"></i></button>
                </div>
                <div id="modal-body">${content}</div>
                <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 2rem;">
                    <button class="btn" onclick="AdminModule.closeModal()">Cancel</button>
                    <button class="btn btn-primary" id="modal-save-btn">Save Changes</button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        document.getElementById('modal-save-btn').onclick = onSave;
    },

    closeModal() {
        document.getElementById('app-modal').style.display = 'none';
    },

    adminDashboard(container) {
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE);
        const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);

        // Calculate statistics
        const maleCount = students.filter(s => s.gender === 'Male').length;
        const femaleCount = students.filter(s => s.gender === 'Female').length;
        const teacherStudentRatio = students.length > 0 ? (students.length / Math.max(teachers.length, 1)).toFixed(1) : 0;

        // Class-wise distribution
        const classDistribution = {};
        students.forEach(s => {
            const key = `${s.className} ${s.section}`;
            classDistribution[key] = (classDistribution[key] || 0) + 1;
        });
        const maxStudentsInClass = Math.max(...Object.values(classDistribution), 1);

        // Recent attendance rate
        const recentAttendance = attendance.slice(-10);
        let totalPresent = 0, totalRecords = 0;
        recentAttendance.forEach(a => {
            Object.values(a.data).forEach(status => {
                if (status === 'present') totalPresent++;
                totalRecords++;
            });
        });
        const attendanceRate = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

        container.innerHTML = `
            <!-- Stats Cards -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div class="glass-card" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Total Students</p>
                            <h3 style="font-size: 2rem; color: white;">${students.length}</h3>
                        </div>
                        <i class="fas fa-user-graduate fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
                <div class="glass-card" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Total Teachers</p>
                            <h3 style="font-size: 2rem; color: white;">${teachers.length}</h3>
                        </div>
                        <i class="fas fa-user-tie fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
                <div class="glass-card" style="background: linear-gradient(135deg, #10b981, #34d399); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Active Classes</p>
                            <h3 style="font-size: 2rem; color: white;">${classes.length}</h3>
                        </div>
                        <i class="fas fa-chalkboard fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
                <div class="glass-card" style="background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <p style="font-size: 0.875rem; opacity: 0.8;">Attendance Rate</p>
                            <h3 style="font-size: 2rem; color: white;">${attendanceRate}%</h3>
                        </div>
                        <i class="fas fa-chart-line fa-2x" style="opacity: 0.3;"></i>
                    </div>
                </div>
            </div>


            <!-- Gender Distribution -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
                <!-- Male Students Card -->
                <div class="glass-card" style="padding: 2rem; background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); color: white; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
                            <i class="fas fa-male fa-2x" style="opacity: 0.9;"></i>
                            <span style="font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Male Students</span>
                        </div>
                        <div style="font-size: 3rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem;">${maleCount}</div>
                        <div style="font-size: 0.875rem; opacity: 0.8;">${((maleCount / Math.max(students.length, 1)) * 100).toFixed(1)}% of total</div>
                        <div style="margin-top: 1.5rem; background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: white; height: 100%; width: ${(maleCount / Math.max(students.length, 1)) * 100}%; transition: width 0.6s ease;"></div>
                        </div>
                    </div>
                </div>

                <!-- Female Students Card -->
                <div class="glass-card" style="padding: 2rem; background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%); color: white; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: -30px; left: -30px; width: 120px; height: 120px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                    <div style="position: relative; z-index: 1;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 1rem;">
                            <i class="fas fa-female fa-2x" style="opacity: 0.9;"></i>
                            <span style="font-size: 0.875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; opacity: 0.9;">Female Students</span>
                        </div>
                        <div style="font-size: 3rem; font-weight: 800; line-height: 1; margin-bottom: 0.5rem;">${femaleCount}</div>
                        <div style="font-size: 0.875rem; opacity: 0.8;">${((femaleCount / Math.max(students.length, 1)) * 100).toFixed(1)}% of total</div>
                        <div style="margin-top: 1.5rem; background: rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
                            <div style="background: white; height: 100%; width: ${(femaleCount / Math.max(students.length, 1)) * 100}%; transition: width 0.6s ease;"></div>
                        </div>
                    </div>
                </div>
            </div>


            <!-- Bottom Section -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
                <!-- Recent Admissions -->
                <div class="glass-panel" style="padding: 1.5rem;">
                    <h3>Recent Admissions</h3>
                    <div style="margin-top: 1rem;">
                        ${students.slice(-5).reverse().map(s => `
                            <div style="display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--gray-100);">
                                <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gray-100); display: flex; align-items: center; justify-content: center;">
                                    ${s.photo ? `<img src="${s.photo}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : `<i class="fas fa-user"></i>`}
                                </div>
                                <div style="flex: 1;">
                                    <div style="font-size: 0.8125rem; font-weight: 600;">${s.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--gray-500);">Class ${s.className || 'N/A'}</div>
                                </div>
                                <div style="font-size: 0.75rem; color: var(--gray-400);">${new Date(s.createdAt).toLocaleDateString()}</div>
                            </div>
                        `).join('') || '<p style="color: var(--gray-400); font-size: 0.875rem;">No recent admissions.</p>'}
                    </div>
                </div>

                <!-- Key Metrics -->
                <div class="glass-panel" style="padding: 1.5rem;">
                    <h3>Key Metrics</h3>
                    <div style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
                        <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                            <span style="font-size: 0.875rem; color: var(--gray-600);">Teacher-Student Ratio</span>
                            <span style="font-weight: 700; color: var(--primary);">1:${teacherStudentRatio}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                            <span style="font-size: 0.875rem; color: var(--gray-600);">Total Subjects</span>
                            <span style="font-weight: 700; color: var(--primary);">${subjects.length}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; padding: 12px; background: var(--gray-50); border-radius: 8px;">
                            <span style="font-size: 0.875rem; color: var(--gray-600);">Avg. Class Size</span>
                            <span style="font-weight: 700; color: var(--primary);">${(students.length / Math.max(classes.length, 1)).toFixed(1)}</span>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="glass-panel" style="padding: 1.5rem;">
                    <h3>Quick Actions</h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 1.5rem;">
                        <button class="btn glass-card" onclick="loadModule('manageStudents', 'manage-students', 'Students')">
                            <i class="fas fa-user-plus"></i> Students
                        </button>
                        <button class="btn glass-card" onclick="loadModule('manageTeachers', 'manage-teachers', 'Teachers')">
                            <i class="fas fa-user-tie"></i> Teachers
                        </button>
                        <button class="btn glass-card" onclick="loadModule('manageClasses', 'manage-classes', 'Classes')">
                            <i class="fas fa-chalkboard"></i> Classes
                        </button>
                        <button class="btn glass-card" onclick="AdminModule.resetSystem()" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.2);">
                            <i class="fas fa-sync"></i> Reset
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    resetSystem() {
        if (confirm('Are you sure? This will wipe all current data and restore the system to its initial demo state.')) {
            localStorage.clear();
            sessionStorage.clear();
            alert('System has been reset. The page will now reload to initialize fresh demo data.');
            window.location.reload();
        }
    },

    // EXAM MARKS MANAGEMENT
    manageExamMarks(container) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const exams = Storage.get(STORAGE_KEYS.EXAM_TYPES);
        const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">Exam Marks Management</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 1rem; align-items: flex-end;">
                    <div class="form-group">
                        <label class="form-label">Exam Type</label>
                        <select id="admin-exam-type" class="form-control">
                            <option value="">Select Exam</option>
                            ${exams.map(e => `<option value="${e.name}">${e.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Class</label>
                        <select id="admin-exam-class" class="form-control">
                            <option value="">Select Class</option>
                            ${classes.map(c => `<option value="${c.id}">${c.name} - ${c.section}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Subject</label>
                        <select id="admin-exam-subject" class="form-control">
                            <option value="">Select Subject</option>
                            ${subjects.map(s => `<option value="${s.name}">${s.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <button class="btn btn-primary" onclick="AdminModule.loadAdminMarksList()">
                            <i class="fas fa-list"></i> Load Students
                        </button>
                    </div>
                </div>
            </div>
            <div id="admin-marks-list-container"></div>
        `;
    },

    loadAdminMarksList() {
        const classId = document.getElementById('admin-exam-class').value;
        const examType = document.getElementById('admin-exam-type').value;
        const subject = document.getElementById('admin-exam-subject').value;
        const container = document.getElementById('admin-marks-list-container');

        // Validation
        if (!examType) return alert('Please select an exam type');
        if (!classId) return alert('Please select a class');
        if (!subject) return alert('Please select a subject');

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const targetClass = classes.find(c => c.id === classId);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.className === targetClass.name && s.section === targetClass.section);

        const existingRecords = Storage.get(STORAGE_KEYS.MARKS).find(m =>
            m.examId === examType && m.classId === classId && m.subjectId === subject
        );
        const existingData = existingRecords ? existingRecords.data : {};

        container.innerHTML = `
            <div class="glass-panel" style="padding: 0;">
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
                <div style="padding: 1.5rem; text-align: right;">
                    <button class="btn btn-success" onclick="AdminModule.saveAdminMarks('${examType}', '${classId}', '${subject}')">
                        <i class="fas fa-save"></i> Save Marks
                    </button>
                </div>
            </div>
        `;
    },

    saveAdminMarks(examType, classId, subject) {
        const marksData = {};
        document.querySelectorAll('input[type="number"]').forEach(input => {
            const studentId = input.name.split('-')[1];
            if (input.value) marksData[studentId] = input.value;
        });

        Storage.saveMarks(examType, classId, subject, marksData);
        alert('Marks saved successfully!');
        this.loadAdminMarksList();
    },

    // CLASS MANAGEMENT
    manageClasses(container) {
        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem;">
                <h2>Classes & Sections</h2>
                <button class="btn btn-primary" onclick="AdminModule.showClassForm()">
                    <i class="fas fa-plus"></i> Add Class
                </button>
            </div>
            <div id="classes-list" class="glass-panel" style="padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Class Name</th>
                            <th style="padding: 1rem; text-align: left;">Section</th>
                            <th style="padding: 1rem; text-align: left;">Class Teacher</th>
                            <th style="padding: 1rem; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="classes-table-body"></tbody>
                </table>
            </div>
        `;
        this.renderClassesTable();
    },

    renderClassesTable() {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const tbody = document.getElementById('classes-table-body');
        if (!tbody) return;

        if (classes.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--gray-400);">No classes found.</td></tr>`;
            return;
        }

        tbody.innerHTML = classes.map(cls => `
            <tr style="border-bottom: 1px solid var(--gray-100);">
                <td style="padding: 1rem;">${cls.name}</td>
                <td style="padding: 1rem;">${cls.section}</td>
                <td style="padding: 1rem;">${cls.classTeacher || 'Not Assigned'}</td>
                <td style="padding: 1rem; text-align: center;">
                    <button class="btn" style="color: var(--primary);" onclick="AdminModule.showClassForm('${cls.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--danger);" onclick="AdminModule.deleteClass('${cls.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    showClassForm(classId = null) {
        const cls = classId ? Storage.getItemById(STORAGE_KEYS.CLASSES, classId) : { name: '', section: 'A', classTeacher: '' };
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);

        const content = `
            <form id="class-form">
                <div class="form-group">
                    <label class="form-label">Class Name (e.g., LKG, 5th, 12th)</label>
                    <input type="text" id="cls-name" class="form-control" value="${cls.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Section</label>
                    <select id="cls-section" class="form-control">
                        <option value="A" ${cls.section === 'A' ? 'selected' : ''}>A</option>
                        <option value="B" ${cls.section === 'B' ? 'selected' : ''}>B</option>
                        <option value="C" ${cls.section === 'C' ? 'selected' : ''}>C</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Class Teacher</label>
                    <select id="cls-teacher" class="form-control">
                        <option value="">Select Teacher</option>
                        ${teachers.map(t => `<option value="${t.name}" ${cls.classTeacher === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                    </select>
                </div>
            </form>
        `;

        this.showModal(classId ? 'Edit Class' : 'Add Class', content, () => {
            const data = {
                name: document.getElementById('cls-name').value,
                section: document.getElementById('cls-section').value,
                classTeacher: document.getElementById('cls-teacher').value
            };
            if (classId) {
                Storage.updateItem(STORAGE_KEYS.CLASSES, classId, data);
            } else {
                Storage.addItem(STORAGE_KEYS.CLASSES, data);
            }
            this.closeModal();
            this.manageClasses(document.getElementById('content-area'));
        });
    },

    deleteClass(id) {
        if (confirm('Are you sure you want to delete this class?')) {
            Storage.deleteItem(STORAGE_KEYS.CLASSES, id);
            this.renderClassesTable();
        }
    },

    // TEACHER MANAGEMENT
    manageTeachers(container) {
        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem;">
                <h2>Staff Management</h2>
                <button class="btn btn-primary" onclick="AdminModule.showTeacherForm()">
                    <i class="fas fa-plus"></i> Add Teacher
                </button>
            </div>
            <div id="teachers-list" class="glass-panel" style="padding: 0;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Teacher Name</th>
                            <th style="padding: 1rem; text-align: left;">Subject Specialty</th>
                            <th style="padding: 1rem; text-align: left;">Contact</th>
                            <th style="padding: 1rem; text-align: center;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="teachers-table-body"></tbody>
                </table>
            </div>
        `;
        this.renderTeachersTable();
    },

    renderTeachersTable() {
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const tbody = document.getElementById('teachers-table-body');
        if (!tbody) return;

        if (teachers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="4" style="padding: 2rem; text-align: center; color: var(--gray-400);">No teachers found.</td></tr>`;
            return;
        }

        tbody.innerHTML = teachers.map(t => `
            <tr style="border-bottom: 1px solid var(--gray-100);">
                <td style="padding: 1rem;">
                    <div style="font-weight: 600;">${t.name}</div>
                    <div style="font-size: 0.75rem; color: var(--gray-500);">${t.employeeId || 'EMP001'}</div>
                </td>
                <td style="padding: 1rem;">${t.subject || 'All Subjects'}</td>
                <td style="padding: 1rem;">${t.mobile || 'N/A'}</td>
                <td style="padding: 1rem; text-align: center;">
                    <button class="btn" style="color: var(--primary);" title="Edit Teacher" onclick="AdminModule.showTeacherForm('${t.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--danger);" title="Delete Teacher" onclick="AdminModule.deleteTeacher('${t.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    showTeacherForm(teacherId = null) {
        const t = teacherId ? Storage.getItemById(STORAGE_KEYS.TEACHERS, teacherId) : { name: '', subject: '', mobile: '', employeeId: '' };

        const content = `
            <form id="teacher-form">
                <div class="form-group">
                    <label class="form-label">Full Name</label>
                    <input type="text" id="t-name" class="form-control" value="${t.name}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Employee ID</label>
                    <input type="text" id="t-emp-id" class="form-control" value="${t.employeeId}" placeholder="e.g., TCH101">
                </div>
                <div class="form-group">
                    <label class="form-label">Subject Specialty</label>
                    <input type="text" id="t-subject" class="form-control" value="${t.subject}" placeholder="e.g., Mathematics">
                </div>
                <div class="form-group">
                    <label class="form-label">Mobile Number</label>
                    <input type="tel" id="t-mobile" class="form-control" value="${t.mobile}">
                </div>
                <div style="grid-column: span 2; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: var(--radius-md); margin-top: 0.5rem;">
                    <div class="form-group">
                        <label class="form-label">Login Username</label>
                        <input type="text" id="t-username" class="form-control" value="${t.username || ''}" placeholder="Set username" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Login Password</label>
                        <input type="password" id="t-password" class="form-control" value="${t.password || '123'}" placeholder="Set password" required>
                    </div>
                </div>
                
                <div style="grid-column: span 2; margin-top: 1rem; padding: 1rem; border: 1px solid var(--gray-200); border-radius: 8px;">
                    <label class="form-label" style="margin-bottom: 10px; display: block;">Access Permissions</label>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" class="perm-check" value="markAttendance" ${!t.permissions || t.permissions.includes('markAttendance') ? 'checked' : ''}> 
                            Attendance
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" class="perm-check" value="manageHomework" ${!t.permissions || t.permissions.includes('manageHomework') ? 'checked' : ''}> 
                            Homework
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" class="perm-check" value="enterMarks" ${!t.permissions || t.permissions.includes('enterMarks') ? 'checked' : ''}> 
                            Exam Marks
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" class="perm-check" value="manageStudents" ${!t.permissions || t.permissions.includes('manageStudents') ? 'checked' : ''}> 
                            Student Mgmt
                        </label>
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            <input type="checkbox" class="perm-check" value="manageNotices" ${!t.permissions || t.permissions.includes('manageNotices') ? 'checked' : ''}> 
                            Notices
                        </label>
                    </div>
                </div>
            </form>
        `;

        this.showModal(teacherId ? 'Edit Teacher' : 'Add Teacher', content, () => {
            const data = {
                name: document.getElementById('t-name').value,
                employeeId: document.getElementById('t-emp-id').value,
                subject: document.getElementById('t-subject').value,
                mobile: document.getElementById('t-mobile').value,
                username: document.getElementById('t-username').value,
                password: document.getElementById('t-password').value,
                role: 'teacher',
                permissions: Array.from(document.querySelectorAll('.perm-check:checked')).map(cb => cb.value)
            };

            if (teacherId) {
                Storage.updateItem(STORAGE_KEYS.TEACHERS, teacherId, data);
                // Sync users table
                const users = Storage.get(STORAGE_KEYS.USERS);
                const userIndex = users.findIndex(u => u.username === t.username);
                if (userIndex > -1) {
                    users[userIndex] = { ...users[userIndex], ...data, id: users[userIndex].id };
                    Storage.save(STORAGE_KEYS.USERS, users);
                }
            } else {
                const added = Storage.addItem(STORAGE_KEYS.TEACHERS, data);
                // Also add to users table for login
                const users = Storage.get(STORAGE_KEYS.USERS);
                users.push({ ...data, id: added.id });
                Storage.save(STORAGE_KEYS.USERS, users);
            }
            this.closeModal();
            this.manageTeachers(document.getElementById('content-area'));
        });
    },

    deleteTeacher(id) {
        if (confirm('Are you sure you want to delete this teacher? This will also remove their login account.')) {
            const teacher = Storage.getItemById(STORAGE_KEYS.TEACHERS, id);
            Storage.deleteItem(STORAGE_KEYS.TEACHERS, id);
            // Sync users table
            if (teacher) {
                const users = Storage.get(STORAGE_KEYS.USERS);
                const filteredUsers = users.filter(u => u.username !== teacher.username);
                Storage.save(STORAGE_KEYS.USERS, filteredUsers);
            }
            this.renderTeachersTable();
        }
    },

    // STUDENT MANAGEMENT (Indian format)
    manageStudents(container) {
        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem;">
                <h2>Student Admission</h2>
                <button class="btn btn-primary" onclick="AdminModule.showStudentForm()">
                    <i class="fas fa-plus"></i> New Admission
                </button>
            </div>
    <div id="students-list" class="glass-panel" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: var(--gray-50);">
                <tr>
                    <th style="padding: 1rem; text-align: left;">Student</th>
                    <th style="padding: 1rem; text-align: left;">Adm No.</th>
                    <th style="padding: 1rem; text-align: left;">Class</th>
                    <th style="padding: 1rem; text-align: left;">Guardian Name</th>
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
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const tbody = document.getElementById('students-table-body');
        if (!tbody) return;

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--gray-400);">No students enrolled.</td></tr>`;
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
                <td style="padding: 1rem;">${s.className}</td>
                <td style="padding: 1rem;">${s.guardianName}</td>
                <td style="padding: 1rem; text-align: center;">
                    <button class="btn" style="color: var(--primary);" onclick="AdminModule.showStudentForm('${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--accent);" title="Manage Documents" onclick="AdminModule.manageStudentDocuments('${s.id}')"><i class="fas fa-file-alt"></i></button>
                    <button class="btn" style="color: var(--danger);" onclick="AdminModule.deleteStudent('${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
    `).join('');
    },

    showStudentForm(studentId = null) {
        const s = studentId ? Storage.getItemById(STORAGE_KEYS.STUDENTS, studentId) : {
            name: '', admissionNo: '', className: '', section: '', gender: 'Male', dob: '',
            guardianName: '', guardianMobile: '', address: '', photo: ''
        };
        const classes = Storage.get(STORAGE_KEYS.CLASSES);

        const content = `
            <div id="student-form" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
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
                <div class="form-group">
                    <label class="form-label">Class</label>
                    <select id="s-class" class="form-control">
                        <option value="">Select Class</option>
                        ${Array.from(new Set(classes.map(c => c.name))).map(name => `<option value="${name}" ${s.className === name ? 'selected' : ''}>${name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Section</label>
                    <select id="s-section" class="form-control">
                        <option value="A" ${s.section === 'A' ? 'selected' : ''}>A</option>
                        <option value="B" ${s.section === 'B' ? 'selected' : ''}>B</option>
                        <option value="C" ${s.section === 'C' ? 'selected' : ''}>C</option>
                    </select>
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
                        <option value="Other" ${s.gender === 'Other' ? 'selected' : ''}>Other</option>
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

        this.showModal(studentId ? 'Edit Student' : 'New Admission', content, () => {
            const data = {
                name: document.getElementById('s-name').value,
                admissionNo: document.getElementById('s-adm-no').value,
                className: document.getElementById('s-class').value,
                section: document.getElementById('s-section').value,
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
                // Sync users table
                const users = Storage.get(STORAGE_KEYS.USERS);
                // Update student account
                const sUserIdx = users.findIndex(u => u.username === s.admissionNo);
                if (sUserIdx > -1) {
                    users[sUserIdx] = { ...users[sUserIdx], ...data, id: users[sUserIdx].id };
                }
                Storage.save(STORAGE_KEYS.USERS, users);
            } else {
                const added = Storage.addItem(STORAGE_KEYS.STUDENTS, data);
                // Add account for student
                const users = Storage.get(STORAGE_KEYS.USERS);
                users.push({ ...data, id: added.id }); // Student login
                Storage.save(STORAGE_KEYS.USERS, users);
            }
            this.closeModal();
            this.manageStudents(document.getElementById('content-area'));
        });

        // Photo Preview Logic
        document.getElementById('s-photo').onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (re) => {
                    document.getElementById('photo-preview').innerHTML = `< img src = "${re.target.result}" style = "width:100%; height:100%; object-fit:cover;" > `;
                };
                reader.readAsDataURL(file);
            }
        };
    },

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student and their associated login account?')) {
            const student = Storage.getItemById(STORAGE_KEYS.STUDENTS, id);
            Storage.deleteItem(STORAGE_KEYS.STUDENTS, id);
            // Sync users table
            if (student) {
                const users = Storage.get(STORAGE_KEYS.USERS);
                const filteredUsers = users.filter(u => u.username !== student.admissionNo);
                Storage.save(STORAGE_KEYS.USERS, filteredUsers);
            }
            this.renderStudentsTable();
        }
    },

    manageStudentDocuments(studentId) {
        const student = Storage.getItemById(STORAGE_KEYS.STUDENTS, studentId);
        // We now use Storage.getDocument() inside the map loop for dynamic checking
        const docTypes = [
            { id: 'aadhar', name: 'Aadhar Card' },
            { id: 'tc', name: 'Transfer Certificate' },
            { id: 'birth', name: 'Birth Certificate' }
        ];

        const content = `
    < div style = "padding: 1rem;" >
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
                    // Auto-detection logic script
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
                                <input type="file" style="display: none;" accept="image/*,application/pdf" onchange="AdminModule.handleAdminDocUpload(this, '${doc.id}', '${studentId}')">
                            </label>
                        </div>
                    </div>
                `).join('')
            }
            </div >
    `;

        this.showModal(`Documents: ${student.name} `, content, () => this.closeModal());
        // Hide the default save button since we save on upload
        document.getElementById('modal-save-btn').style.display = 'none';
    },

    handleAdminDocUpload(input, docType, studentId) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];

        if (file.size > 2 * 1024 * 1024) return alert('File size must be under 2MB');

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            const allDocs = Storage.get(STORAGE_KEYS.DOCUMENTS);
            let docIndex = allDocs.findIndex(d => d.studentId === studentId);

            if (docIndex === -1) {
                allDocs.push({ studentId, [docType]: base64, updatedAt: new Date().toISOString() });
            } else {
                allDocs[docIndex][docType] = base64;
                allDocs[docIndex].updatedAt = new Date().toISOString();
            }

            Storage.save(STORAGE_KEYS.DOCUMENTS, allDocs);
            alert('Document uploaded successfully!');
            this.manageStudentDocuments(studentId); // Refresh modal
        };
        reader.readAsDataURL(file);
    },

    // SUBJECT MANAGEMENT
    manageSubjects(container) {
        container.innerHTML = `
    < div class="top-bar" style = "border: none; margin-bottom: 1rem;" >
                <h2>Subject Management</h2>
                <button class="btn btn-primary" onclick="AdminModule.showSubjectForm()">
                    <i class="fas fa-plus"></i> Add Subject
                </button>
            </div >
    <div id="subjects-list" class="glass-panel" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead style="background: var(--gray-50);">
                <tr>
                    <th style="padding: 1rem; text-align: left;">Subject Name</th>
                    <th style="padding: 1rem; text-align: left;">Subject Code</th>
                    <th style="padding: 1rem; text-align: center;">Actions</th>
                </tr>
            </thead>
            <tbody id="subjects-table-body"></tbody>
        </table>
    </div>
`;
        this.renderSubjectsTable();
    },

    renderSubjectsTable() {
        const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);
        const tbody = document.getElementById('subjects-table-body');
        if (!tbody) return;

        if (subjects.length === 0) {
            tbody.innerHTML = `< tr > <td colspan="3" style="padding: 2rem; text-align: center; color: var(--gray-400);">No subjects added yet.</td></tr > `;
            return;
        }

        tbody.innerHTML = subjects.map(s => `
    < tr style = "border-bottom: 1px solid var(--gray-100);" >
                <td style="padding: 1rem; font-weight: 600;">${s.name}</td>
                <td style="padding: 1rem;">${s.code || 'N/A'}</td>
                <td style="padding: 1rem; text-align: center;">
                    <button class="btn" style="color: var(--primary);" onclick="AdminModule.showSubjectForm('${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--danger);" onclick="AdminModule.deleteSubject('${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr >
    `).join('');
    },

    showSubjectForm(subjectId = null) {
        const s = subjectId ? Storage.getItemById(STORAGE_KEYS.SUBJECTS, subjectId) : { name: '', code: '' };

        const content = `
    < form id = "subject-form" >
                <div class="form-group">
                    <label class="form-label">Subject Name</label>
                    <input type="text" id="subj-name" class="form-control" value="${s.name}" placeholder="e.g., Mathematics" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Subject Code</label>
                    <input type="text" id="subj-code" class="form-control" value="${s.code}" placeholder="e.g., MATH-101">
                </div>
            </form >
    `;

        this.showModal(subjectId ? 'Edit Subject' : 'Add Subject', content, () => {
            const data = {
                name: document.getElementById('subj-name').value,
                code: document.getElementById('subj-code').value
            };
            if (subjectId) {
                Storage.updateItem(STORAGE_KEYS.SUBJECTS, subjectId, data);
            } else {
                Storage.addItem(STORAGE_KEYS.SUBJECTS, data);
            }
            this.closeModal();
            this.manageSubjects(document.getElementById('content-area'));
        });
    },

    deleteSubject(id) {
        if (confirm('Are you sure you want to delete this subject?')) {
            Storage.deleteItem(STORAGE_KEYS.SUBJECTS, id);
            this.renderSubjectsTable();
        }
    },

    manageFees(container) {
        const structure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE);
        const payments = Storage.get(STORAGE_KEYS.FEES);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);

        const exams = [
            '1st Mid Term', 'Quarterly Exam', '2nd Mid Term',
            'Half Yearly Exam', '3rd Mid Term', 'Annual Exam'
        ];

        if (structure.length === 0) {
            const initial = exams.map(name => ({ name, amount: 1500 }));
            Storage.save(STORAGE_KEYS.FEE_STRUCTURE, initial);
        }

        const currentStructure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE);

        container.innerHTML = `
    < div style = "display: grid; grid-template-columns: 1fr 2.5fr; gap: 1.5rem;" >
                < !--Left: Fee Structure Settings-- >
                <div class="glass-panel" style="padding: 1.5rem;">
                    <h3>Fee Structure</h3>
                    <p style="color: var(--gray-500); font-size: 0.75rem; margin-bottom: 1.5rem;">Set standard amounts for each term.</p>
                    
                    <div style="display: grid; gap: 0.75rem;">
                        ${currentStructure.map((exam, index) => `
                            <div class="glass-card" style="padding: 0.75rem;">
                                <div style="font-size: 0.8125rem; font-weight: 600; margin-bottom: 5px;">${exam.name}</div>
                                <div style="display: flex; align-items: center; gap: 5px;">
                                    <span style="font-size: 0.75rem; color: var(--gray-400);">₹</span>
                                    <input type="number" class="form-control" style="width: 100%; height: 32px; font-size: 0.8125rem;" 
                                           value="${exam.amount}" 
                                           onchange="AdminModule.updateExamFee('${exam.name}', this.value)">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!--Right: Payment History & Reporting-- >
    <div class="glass-panel" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <div>
                <h3>Received Payments</h3>
                <p style="color: var(--gray-500); font-size: 0.75rem;">Global transaction log across all students.</p>
            </div>
            <button class="btn btn-primary" onclick="AdminModule.downloadFeeReport()">
                <i class="fas fa-file-download"></i> Download Report (CSV)
            </button>
        </div>

        <div style="overflow-x: auto; border-radius: 8px; border: 1px solid var(--gray-100);">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                <thead style="background: var(--gray-50);">
                    <tr>
                        <th style="padding: 12px; text-align: left;">Receipt</th>
                        <th style="padding: 12px; text-align: left;">Student</th>
                        <th style="padding: 12px; text-align: left;">Term</th>
                        <th style="padding: 12px; text-align: left;">Amount</th>
                        <th style="padding: 12px; text-align: left;">Date</th>
                        <th style="padding: 12px; text-align: left;">Method</th>
                    </tr>
                </thead>
                <tbody>
                    ${payments.reverse().map(p => {
            const student = students.find(s => s.id === p.studentId) || { name: 'Unknown' };
            return `
                                        <tr style="border-bottom: 1px solid var(--gray-100);">
                                            <td style="padding: 12px; font-weight: 600;">#${p.id}</td>
                                            <td style="padding: 12px;">${student.name}</td>
                                            <td style="padding: 12px;">${p.examName}</td>
                                            <td style="padding: 12px; font-weight: 600;">₹${p.amount}</td>
                                            <td style="padding: 12px;">${new Date(p.date).toLocaleDateString()}</td>
                                            <td style="padding: 12px;"><span class="badge" style="background: var(--success-light); color: var(--success); font-size: 0.7rem;">${p.method}</span></td>
                                        </tr>
                                    `;
        }).join('') || '<tr><td colspan="6" style="padding: 2rem; text-align: center; color: var(--gray-400);">No payment records found.</td></tr>'}
                </tbody>
            </table>
        </div>
    </div>
            </div >
    `;
    },

    downloadFeeReport() {
        const payments = Storage.get(STORAGE_KEYS.FEES);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);

        if (payments.length === 0) return alert('No payment records to download.');

        // Format CSV data
        const headers = ['Receipt ID', 'Student Name', 'Admission No', 'Exam Term', 'Amount (INR)', 'Date', 'Payment Method'];
        const csvRows = [headers.join(',')];

        payments.forEach(p => {
            const s = students.find(st => st.id === p.studentId) || { name: 'Unknown', admissionNo: 'N/A' };
            const row = [
                p.id,
                `"${s.name}"`,
                s.admissionNo,
                `"${p.examName}"`,
                p.amount,
                new Date(p.date).toLocaleDateString(),
                p.method
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `EduFlow_Fee_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Report downloaded successfully!');
    },

    manageExamTypes(container) {
        const exams = Storage.get(STORAGE_KEYS.EXAM_TYPES);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="margin: 0;">Examination Categories</h2>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">Manage the official list of exams for marks entry and report cards.</p>
                    </div>
                    <button class="btn btn-primary" onclick="AdminModule.showExamTypeForm()">
                        <i class="fas fa-plus"></i> Add New Exam
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1.5rem;">
                    ${exams.map((exam, index) => `
                        <div class="glass-card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <span style="font-size: 0.75rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">Term ${index + 1}</span>
                                <h4 style="margin: 4px 0 0 0;">${exam.name}</h4>
                            </div>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn" style="color: var(--primary);" onclick="AdminModule.showExamTypeForm('${exam.id}')"><i class="fas fa-edit"></i></button>
                                <button class="btn" style="color: var(--danger);" onclick="AdminModule.deleteExamType('${exam.id}')"><i class="fas fa-trash"></i></button>
                            </div>
                        </div>
                    `).join('') || '<p style="color: var(--gray-400);">No exam categories defined yet.</p>'}
                </div>
            </div>
        `;
    },

    showExamTypeForm(id = null) {
        const exam = id ? Storage.get(STORAGE_KEYS.EXAM_TYPES).find(e => e.id === id) : null;
        const content = `
            <form id="exam-type-form">
                <div class="form-group">
                    <label class="form-label">Exam Name</label>
                    <input type="text" id="et-name" class="form-control" value="${exam ? exam.name : ''}" placeholder="e.g., Mid-Term Exam" required>
                </div>
                <p style="font-size: 0.75rem; color: var(--gray-400); margin-top: 10px;">
                    <i class="fas fa-info-circle"></i> This name will appear in dropdowns for teachers and as column headers in student report cards.
                </p>
            </form>
        `;

        this.showModal(id ? 'Edit Exam Category' : 'Add New Exam Category', content, () => {
            const data = {
                name: document.getElementById('et-name').value
            };
            if (id) {
                Storage.updateItem(STORAGE_KEYS.EXAM_TYPES, id, data);
            } else {
                Storage.addItem(STORAGE_KEYS.EXAM_TYPES, data);
            }
            this.closeModal();
            this.manageExamTypes(document.getElementById('content-area'));
        });
    },

    deleteExamType(id) {
        if (confirm('Are you sure? Removing this category might affect how existing marks are displayed.')) {
            Storage.deleteItem(STORAGE_KEYS.EXAM_TYPES, id);
            this.manageExamTypes(document.getElementById('content-area'));
        }
    },

    manageAttendance(container) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        container.innerHTML = `
    < div class="glass-panel" style = "padding: 2rem;" >
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="margin: 0;">Attendance Analytics & Reports</h2>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">Generate and download monthly attendance summaries for any class.</p>
                    </div>
                </div>

                <div class="glass-card" style="padding: 1.5rem; max-width: 600px; margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">Select Class</label>
                            <select id="rep-class" class="form-control">
                                ${classes.map(c => `<option value="${c.id}">${c.name} - ${c.section}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Month</label>
                            <select id="rep-month" class="form-control">
                                ${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => `
                                    <option value="${i + 1}" ${i + 1 === currentMonth ? 'selected' : ''}>${m}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">Select Year</label>
                            <select id="rep-year" class="form-control">
                                <option value="${currentYear}">${currentYear}</option>
                                <option value="${currentYear - 1}">${currentYear - 1}</option>
                            </select>
                        </div>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;" onclick="AdminModule.downloadAttendanceReport()">
                        <i class="fas fa-file-download"></i> Download Monthly Report (CSV)
                    </button>
                </div>

                <div style="background: rgba(79, 70, 229, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 8px;">
                    <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">
                        <i class="fas fa-info-circle"></i> <strong>Report Contents:</strong> The CSV file will include student names, total working days, days present, days absent, and overall percentage for the selected month.
                    </p>
                </div>
            </div >
    `;
    },

    downloadAttendanceReport() {
        const classId = document.getElementById('rep-class').value;
        const month = parseInt(document.getElementById('rep-month').value);
        const year = parseInt(document.getElementById('rep-year').value);

        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE).filter(a => {
            const d = new Date(a.date);
            return a.classId === classId && (d.getMonth() + 1) === month && d.getFullYear() === year;
        });

        if (attendance.length === 0) return alert('No attendance records found for this period.');

        const headers = ['Admission No', 'Student Name', 'Total Days', 'Present', 'Absent', 'Percentage (%)'];
        const csvRows = [headers.join(',')];

        students.forEach(s => {
            const studentStats = attendance.reduce((acc, curr) => {
                const status = curr.data[s.id];
                if (status === 'present') acc.present++;
                else if (status === 'absent') acc.absent++;
                acc.total++;
                return acc;
            }, { present: 0, absent: 0, total: 0 });

            const percentage = studentStats.total > 0 ? ((studentStats.present / studentStats.total) * 100).toFixed(1) : '0.0';

            csvRows.push([
                s.admissionNo,
                `"${s.name}"`,
                studentStats.total,
                studentStats.present,
                studentStats.absent,
                percentage
            ].join(','));
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Attendance_Report_${classId}_${month}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert('Attendance report downloaded successfully!');
    },

    manageStorage(container) {
        const keys = Object.entries(STORAGE_KEYS);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="margin-bottom: 2rem;">
                    <h2>System Database (Local Storage)</h2>
                    <p style="color: var(--gray-500); font-size: 0.875rem;">Directly view and manage the underlying browser storage keys.</p>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${keys.map(([label, key]) => {
            const data = Storage.get(key);
            const count = Array.isArray(data) ? data.length : (data ? 1 : 0);
            return `
                            <div class="glass-card" style="padding: 1.5rem;">
                                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                                    <div>
                                        <div style="font-size: 0.65rem; color: var(--primary); font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;">${label}</div>
                                        <div style="font-weight: 700; font-size: 1.125rem; margin-top: 4px;">${key}</div>
                                    </div>
                                    <span class="badge" style="background: var(--primary-light); color: var(--primary);">${count} Items</span>
                                </div>
                                <div style="display: flex; gap: 10px;">
                                    <button class="btn btn-primary" style="flex: 1; padding: 0.5rem;" onclick="AdminModule.viewStorageData('${key}')">
                                        <i class="fas fa-eye"></i> View JSON
                                    </button>
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
    `;
    },

    viewStorageData(key) {
        const data = Storage.get(key);
        window.activeStorageData = data; // Store globally for easy access
        const isArray = Array.isArray(data);
        const hasData = isArray ? data.length > 0 : !!data;

        let tableHtml = '<p style="color: var(--gray-400);">No structured data available.</p>';
        if (isArray && hasData && typeof data[0] === 'object') {
            const columns = Object.keys(data[0]);
            tableHtml = `
    < div style = "overflow-x: auto; border: 1px solid var(--gray-100); border-radius: 8px;" >
        <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
            <thead style="background: var(--gray-50);">
                <tr>
                    ${columns.map(col => `<th style="padding: 10px; text-align: left; border-bottom: 1px solid var(--gray-100);">${col}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${data.map(row => `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    ${columns.map(col => {
                let val = row[col];
                if (typeof val === 'object') val = '{...}';
                if (typeof val === 'string' && val.startsWith('data:image')) val = '[Image Data]';
                return `<td style="padding: 10px; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${val}</td>`;
            }).join('')}
                                </tr>
                            `).join('')}
            </tbody>
        </table>
                </div >
    `;
        }

        const content = `
    < div id = "storage-viewer-container" >
                <div style="display: flex; gap: 10px; margin-bottom: 1.5rem;">
                    <button class="btn btn-primary" onclick="document.getElementById('tabular-view').style.display='block'; document.getElementById('json-view').style.display='none'">
                        <i class="fas fa-table"></i> Table View
                    </button>
                    <button class="btn glass-panel" onclick="document.getElementById('tabular-view').style.display='none'; document.getElementById('json-view').style.display='block'">
                        <i class="fas fa-code"></i> Raw JSON
                    </button>
                    <button class="btn" style="margin-left: auto;" onclick="navigator.clipboard.writeText(JSON.stringify(window.activeStorageData, null, 4)); alert('JSON copied to clipboard!')">
                        <i class="fas fa-copy"></i> Copy JSON
                    </button>
                </div>

                <div id="tabular-view">
                    ${tableHtml}
                </div>

                </div>

                <div id="json-view" style="display: none;">
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1.5rem; border-radius: 8px; font-family: 'Consolas', monospace; font-size: 0.75rem; max-height: 400px; overflow: auto; white-space: pre-wrap; margin: 0;">${JSON.stringify(data, null, 4)}</pre>
                </div>
            </div>
    `;

        this.showModal(`Database Explorer: ${key} `, content, () => {
            this.closeModal();
        });

        const saveBtn = document.getElementById('modal-save-btn');
        if (saveBtn) {
            saveBtn.textContent = 'Close';
            saveBtn.onclick = () => this.closeModal();
        }
    },

    updateExamFee(name, amount) {
        const structure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE);
        const index = structure.findIndex(s => s.name === name);
        if (index > -1) {
            structure[index].amount = parseInt(amount) || 0;
            Storage.save(STORAGE_KEYS.FEE_STRUCTURE, structure);
        }
    },

    // Notification Management
    manageNotifications(container) {
        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        
        // Group notifications by user
        const userMap = {};
        notifications.forEach(notif => {
            if (!userMap[notif.userId]) {
                userMap[notif.userId] = {
                    userId: notif.userId,
                    userRole: notif.userRole,
                    notifications: [],
                    unreadCount: 0
                };
            }
            userMap[notif.userId].notifications.push(notif);
            if (!notif.read) userMap[notif.userId].unreadCount++;
        });

        const stats = {
            totalNotifications: notifications.length,
            unreadNotifications: notifications.filter(n => !n.read).length,
            totalUsers: Object.keys(userMap).length,
            typeCount: {}
        };

        notifications.forEach(n => {
            stats.typeCount[n.type] = (stats.typeCount[n.type] || 0) + 1;
        });

        container.innerHTML = `
            <div class="glass-panel" style="margin-bottom: 2rem;">
                <h2 style="margin-top: 0;">📬 Notification Management</h2>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 2rem 0;">
                    <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1)); border-radius: 12px; border: 1px solid rgba(59, 130, 246, 0.2);">
                        <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Total Notifications</p>
                        <h3 style="margin: 0.5rem 0 0 0; color: #3b82f6; font-size: 2rem;">${stats.totalNotifications}</h3>
                    </div>
                    <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(244, 63, 94, 0.1)); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                        <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Unread</p>
                        <h3 style="margin: 0.5rem 0 0 0; color: #ef4444; font-size: 2rem;">${stats.unreadNotifications}</h3>
                    </div>
                    <div style="padding: 1.5rem; background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1)); border-radius: 12px; border: 1px solid rgba(34, 197, 94, 0.2);">
                        <p style="margin: 0; font-size: 0.875rem; color: #6b7280;">Users</p>
                        <h3 style="margin: 0.5rem 0 0 0; color: #22c55e; font-size: 2rem;">${stats.totalUsers}</h3>
                    </div>
                </div>

                <div style="margin: 2rem 0;">
                    <h4 style="margin-top: 0;">Notification Types</h4>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem;">
                        ${Object.entries(stats.typeCount).map(([type, count]) => {
                            const typeIcons = {
                                'homework': 'fas fa-book-open',
                                'notice': 'fas fa-bullhorn',
                                'attendance': 'fas fa-calendar-check',
                                'fees': 'fas fa-money-bill',
                                'marks': 'fas fa-file-invoice',
                                'system': 'fas fa-cog'
                            };
                            return `
                                <div style="padding: 1rem; background: #f9fafb; border-radius: 8px; text-align: center; border: 1px solid #e5e7eb;">
                                    <i class="${typeIcons[type] || 'fas fa-bell'}" style="font-size: 1.5rem; color: #6366f1; display: block; margin-bottom: 0.5rem;"></i>
                                    <p style="margin: 0; font-size: 0.875rem; color: #6b7280; text-transform: capitalize;">${type}</p>
                                    <h4 style="margin: 0.25rem 0 0 0; color: #111827;">${count}</h4>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <div style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button class="btn btn-primary" onclick="AdminModule.sendSystemNotification()">
                        <i class="fas fa-paper-plane"></i> Send System Notification
                    </button>
                    <button class="btn" onclick="AdminModule.clearOldNotifications()" style="background: #fef3c7; color: #92400e;">
                        <i class="fas fa-trash"></i> Clear Old Notifications
                    </button>
                </div>
            </div>

            <div class="glass-panel">
                <h3>Recent Notifications</h3>
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
                                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">User</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Type</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Title</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Status</th>
                                <th style="padding: 1rem; text-align: left; font-weight: 600; color: #374151;">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${notifications.slice(0, 20).map(notif => `
                                <tr style="border-bottom: 1px solid #e5e7eb; transition: all 0.2s;" onmouseover="this.style.background = '#f9fafb'" onmouseout="this.style.background = 'white'">
                                    <td style="padding: 1rem; color: #374151; font-size: 0.875rem;">
                                        <strong>${notif.userId}</strong><br>
                                        <span style="color: #9ca3af; text-transform: capitalize;">${notif.userRole}</span>
                                    </td>
                                    <td style="padding: 1rem; color: #374151; font-size: 0.875rem;">
                                        <span style="background: #f0f9ff; color: #0369a1; padding: 0.25rem 0.75rem; border-radius: 12px; text-transform: capitalize;">${notif.type}</span>
                                    </td>
                                    <td style="padding: 1rem; color: #374151; font-size: 0.875rem;">
                                        <div>${notif.title}</div>
                                        <div style="color: #9ca3af; font-size: 0.75rem; margin-top: 0.25rem;">${notif.message.substring(0, 50)}...</div>
                                    </td>
                                    <td style="padding: 1rem; color: #374151; font-size: 0.875rem;">
                                        <span style="background: ${notif.read ? '#f0fdf4' : '#fef2f2'}; color: ${notif.read ? '#15803d' : '#dc2626'}; padding: 0.25rem 0.75rem; border-radius: 12px;">
                                            ${notif.read ? '✓ Read' : '● Unread'}
                                        </span>
                                    </td>
                                    <td style="padding: 1rem; color: #9ca3af; font-size: 0.875rem;">
                                        ${new Date(notif.timestamp).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    sendSystemNotification() {
        const title = prompt('Enter notification title:');
        if (!title) return;

        const message = prompt('Enter notification message:');
        if (!message) return;

        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);

        let count = 0;

        // Send to all teachers
        teachers.forEach(teacher => {
            const notification = {
                id: `notif-sys-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                userId: teacher.username,
                userRole: 'teacher',
                type: 'system',
                title: title,
                message: message,
                icon: 'fas fa-cog',
                color: '#8b5cf6',
                timestamp: new Date().toISOString(),
                read: false,
                priority: 'normal'
            };

            const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
            notifications.unshift(notification);
            Storage.save(STORAGE_KEYS.NOTIFICATIONS, notifications);
            count++;
        });

        alert(`System notification sent to ${count} teachers and ${students.length} students!`);
    },

    clearOldNotifications() {
        if (!confirm('Delete notifications older than 30 days? This action cannot be undone.')) return;

        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const filtered = notifications.filter(n => new Date(n.timestamp) > thirtyDaysAgo);
        const removed = notifications.length - filtered.length;

        Storage.save(STORAGE_KEYS.NOTIFICATIONS, filtered);
        alert(`Deleted ${removed} old notifications!`);
    }
};

