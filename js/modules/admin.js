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
        const fees = Storage.get(STORAGE_KEYS.FEES);

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
            <div class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 2rem;">
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


            <!-- Statistics List -->
            <div class="responsive-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem;">
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

            <!-- Dashboard Analytics -->
            <div class="glass-panel" style="margin-top: 2rem; padding: 1.5rem;">
                <h3>System Analytics</h3>
                <div class="responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
                    <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200);">
                        <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem; text-align: center;">Gender Distribution</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="chart-gender"></canvas>
                        </div>
                    </div>
                    <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200);">
                        <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem; text-align: center;">Attendance Overview (Today)</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="chart-attendance"></canvas>
                        </div>
                    </div>
                    <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200);">
                        <h4 style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 1rem; text-align: center;">Fee Collection Status</h4>
                        <div style="height: 250px; position: relative;">
                            <canvas id="chart-fees"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Render charts after a short delay to ensure DOM is ready
        setTimeout(() => this.renderDashboardCharts(students, fees, attendance), 100);
    },

    renderDashboardCharts(students, fees, attendance) {
        // Gender Distribution
        const maleCount = students.filter(s => s.gender === 'Male').length;
        const femaleCount = students.filter(s => s.gender === 'Female').length;

        new Chart(document.getElementById('chart-gender'), {
            type: 'doughnut',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [maleCount, femaleCount],
                    backgroundColor: ['#3b82f6', '#ec4899'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Attendance (Mock data logic if no today's attendance)
        const totalActive = students.length;
        // In a real scenario, filter attendance for today. Here we simulate or use last known.
        // Let's check if there is any attendance for today
        const todayStr = new Date().toISOString().split('T')[0];
        const todayAttendance = attendance.filter(a => a.date === todayStr);
        let present = 0, absent = 0;

        if (todayAttendance.length > 0) {
            present = todayAttendance.filter(a => a.status === 'Present').length;
            absent = todayAttendance.filter(a => a.status === 'Absent').length;
        } else {
            // If no data for today, show a placeholder or "No Data" state?
            // Or just show total vs 0 to prompt taking attendance
            present = 0;
            absent = 0;
        }

        // If absolutely no attendance, maybe show a "Not Taken" slice
        const notTaken = totalActive - (present + absent);

        new Chart(document.getElementById('chart-attendance'), {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Pending'],
                datasets: [{
                    data: [present, absent, notTaken],
                    backgroundColor: ['#10b981', '#ef4444', '#e5e7eb'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });

        // Fee Collection
        const paidStudents = students.filter(s => {
            const studentFees = fees.filter(f => f.studentId === s.id);
            if (studentFees.length === 0) return false;
            // Simplified: check if last fee record is 'paid'
            // Better: Check balance. But for chart, let's categorize by status of total fee.
            // Actually, let's just use the fees array directly if possible.
            // Let's filter students by "fully paid", "partial", "unpaid"
            // We need to calculate total fee vs paid for each student.
            return false;
        });

        let fullyPaid = 0, partial = 0, unpaid = 0;

        students.forEach(s => {
            // Calculate totals similar to manageFees
            // This logic needs to match manageFees
            // For now, let's use a simpler metric from student objects if available, or re-calc.
            const sFees = fees.filter(f => f.studentId === s.id);
            const paid = sFees.reduce((sum, f) => sum + parseFloat(f.amount), 0);
            // We need total fee for the student's class
            const classes = Storage.get(STORAGE_KEYS.CLASSES);
            const sClass = classes.find(c => c.id === s.classId);
            const totalFee = sClass ? parseFloat(sClass.tuitionFee) : 0; // Assuming simple fee structure for now or 25000 default

            if (paid >= totalFee && totalFee > 0) fullyPaid++;
            else if (paid > 0) partial++;
            else unpaid++;
        });

        new Chart(document.getElementById('chart-fees'), {
            type: 'bar',
            data: {
                labels: ['Paid', 'Partial', 'Unpaid'],
                datasets: [{
                    label: 'Students',
                    data: [fullyPaid, partial, unpaid],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { precision: 0 } }
                }
            }
        });
    },

    resetSystem() {
        if (confirm('Are you sure? This will wipe all current data and restore the system to its initial demo state.')) {
            localStorage.clear();
            sessionStorage.clear();
            NotificationSystem.showToast('System Reset', 'System has been reset. The page will now reload.', 'success');
            setTimeout(() => window.location.reload(), 2000);
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
                <div class="responsive-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: flex-end;">
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

    manageMarksheets(container) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const exams = Storage.get(STORAGE_KEYS.EXAM_TYPES);

        container.innerHTML = `
            <style>
                @media print {
                    body * { visibility: hidden; }
                    #bulk-marksheet-results, #bulk-marksheet-results * { visibility: visible; }
                    #bulk-marksheet-results { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; border: none !important; padding: 0 !important; margin: 0 !important; }
                }
                .marksheet-card { background: white; color: #1a1a1a; padding: 2rem; margin-bottom: 2rem; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .marks-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                .marks-table th, .marks-table td { padding: 10px; border: 1px solid #e5e7eb; text-align: left; font-size: 0.875rem; }
                .marks-table th { background: #f9fafb; font-weight: 600; }
                .grade-badge { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 0.75rem; }
                .grade-A { background: #dcfce7; color: #166534; }
                .grade-B { background: #dbeafe; color: #1e40af; }
                .grade-C { background: #fef9c3; color: #854d0e; }
                .grade-D { background: #ffedd5; color: #9a3412; }
                .grade-E { background: #fee2e2; color: #991b1b; }
            </style>

            <div class="glass-panel no-print" style="padding: 1.5rem; margin-bottom: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">Bulk Marksheet Generation</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: flex-end;">
                    <div class="form-group">
                        <label class="form-label">Select Class</label>
                        <select id="bulk-ms-class" class="form-control">
                            <option value="">-- Choose Class --</option>
                            ${classes.map(c => `<option value="${c.id}">${c.name} - ${c.section}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Select Exam</label>
                        <select id="bulk-ms-exam" class="form-control">
                            <option value="all">Annual Summary (Cumulative)</option>
                            ${exams.map(e => `<option value="${e.name}">${e.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Page Size</label>
                        <select id="bulk-ms-size" class="form-control">
                            <option value="A4">A4 (Standard)</option>
                            <option value="A3">A3 (Large)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">File Type</label>
                        <select id="bulk-ms-type" class="form-control">
                            <option value="pdf">PDF Document</option>
                            <option value="word">Word Document (.doc)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">View Mode</label>
                        <select id="bulk-ms-view" class="form-control">
                            <option value="cards">Individual Cards</option>
                            <option value="broadsheet">Consolidated Sheet</option>
                        </select>
                    </div>
                    <div style="display: flex; gap: 10px; grid-column: span 2;">
                        <button class="btn btn-primary" onclick="AdminModule.generateBulkMarksheets()" style="flex: 1;">
                            <i class="fas fa-magic"></i> Generate & Preview
                        </button>
                        <button class="btn" id="btn-ms-download" onclick="AdminModule.downloadMarksheets()" style="background: var(--gray-800); color: white; flex: 1; display: none;">
                            <i class="fas fa-download"></i> Download / Print
                        </button>
                    </div>
                </div>
            </div>

            <div id="bulk-marksheet-results">
                <div class="glass-panel" style="padding: 3rem; text-align: center; color: var(--gray-400);">
                    <i class="fas fa-file-invoice fa-3x" style="margin-bottom: 1rem; opacity: 0.5;"></i>
                    <p>Select a class and exam to generate marksheets for all students.</p>
                </div>
            </div>
        `;
    },

    downloadMarksheets() {
        const fileType = document.getElementById('bulk-ms-type').value;
        const pageSize = document.getElementById('bulk-ms-size').value;
        const results = document.getElementById('bulk-marksheet-results');

        if (fileType === 'pdf') {
            // Apply scale/size before printing
            const style = document.createElement('style');
            style.id = 'print-page-size-style';
            style.innerHTML = `@page { size: ${pageSize}; margin: 10mm; }`;
            document.head.appendChild(style);

            window.print();

            // Cleanup
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
        const classId = document.getElementById('bulk-ms-class').value;
        const examType = document.getElementById('bulk-ms-exam').value;
        const pageSize = document.getElementById('bulk-ms-size').value;
        const viewMode = document.getElementById('bulk-ms-view').value;
        const resultsContainer = document.getElementById('bulk-marksheet-results');
        const downloadBtn = document.getElementById('btn-ms-download');

        if (!classId) {
            return NotificationSystem.showToast('Required', 'Please select a class.', 'warning');
        }

        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const marks = Storage.get(STORAGE_KEYS.MARKS);
        const allExamTypes = Storage.get(STORAGE_KEYS.EXAM_TYPES);

        if (students.length === 0) {
            resultsContainer.innerHTML = '<div class="glass-panel" style="padding: 2rem; text-align: center;">No students found in this class.</div>';
            return;
        }

        const totalMarksMap = {
            'Unit Test I': 20, 'Unit Test II': 20, 'Unit Test III': 20,
            'Quarterly Exam': 100, 'Half Yearly Exam': 100, 'Annual Exam': 100
        };

        const getExamTotal = (name) => {
            if (totalMarksMap[name]) return totalMarksMap[name];
            if (name.toLowerCase().includes('unit')) return 20;
            return 100;
        };

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

        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const selectedClass = classes.find(c => c.id === classId);
        const classSubjects = getSubjectsByGrade(selectedClass.name);
        const allSubjects = Storage.get(STORAGE_KEYS.SUBJECTS);
        // Filter global subjects to only include those relevant to this class
        const filteredSubjects = allSubjects.filter(s => classSubjects.includes(s.name));

        let html = '';

        if (viewMode === 'broadsheet') {
            html = this.renderConsolidatedSheet(students, marks, examType, allExamTypes, getExamTotal, calculateGrade, filteredSubjects);
        } else {
            students.forEach((student, index) => {
                const studentMarks = marks.filter(m => m.data && m.data[student.id]);

                html += `
                    <div class="marksheet-card ${index < students.length - 1 ? 'page-break' : ''}">
                        <!-- Header -->
                        <div style="text-align: center; margin-bottom: 1.5rem; border-bottom: 2px solid var(--primary); padding-bottom: 1rem;">
                            <h2 style="margin: 0; color: var(--primary); font-size: 1.5rem;">SCHOOL MANAGEMENT SYSTEM</h2>
                            <p style="margin: 2px 0; font-size: 0.75rem; font-weight: 600; color: var(--gray-600);">Academic Session 2025-26</p>
                            <h3 style="margin-top: 10px; font-size: 1rem; text-decoration: underline;">PROGRESS REPORT</h3>
                        </div>

                        <!-- Info -->
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; font-size: 0.8125rem;">
                            <div>
                                <strong>Name:</strong> ${student.name}<br>
                                <strong>Admission No:</strong> ${student.admissionNo}
                            </div>
                            <div style="text-align: right;">
                                <strong>Class:</strong> ${student.className} - ${student.section}<br>
                                <strong>Exam:</strong> ${examType === 'all' ? 'Annual Summary' : examType}
                            </div>
                        </div>

                        <!-- Table -->
                        <div class="table-responsive">
                            ${examType === 'all' ? this.renderBulkCumulativeTable(student, studentMarks, allExamTypes) : this.renderBulkDetailedTable(student, studentMarks, examType, getExamTotal, calculateGrade)}
                        </div>

                        <!-- Footer -->
                        <div style="margin-top: 2rem; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; text-align: center; font-size: 0.65rem;">
                            <div><div style="border-bottom: 1px solid #ccc; margin-bottom: 5px;"></div>CLASS TEACHER</div>
                            <div><div style="border-bottom: 1px solid #ccc; margin-bottom: 5px;"></div>PRINCIPAL</div>
                            <div><div style="border-bottom: 1px solid #ccc; margin-bottom: 5px;"></div>PARENT</div>
                        </div>
                    </div>
                `;
            });
        }

        resultsContainer.innerHTML = html;
        downloadBtn.style.display = 'block';
        NotificationSystem.showToast('Generated', `Generated ${viewMode === 'broadsheet' ? 'consolidated sheet' : students.length + ' marksheets'}.`, 'success');
    },

    renderConsolidatedSheet(students, marks, examType, allExamTypes, getExamTotal, calculateGrade, subjects) {
        // const subjects = Storage.get(STORAGE_KEYS.SUBJECTS); // Now passed as argument
        const examTotal = examType === 'all' ? 100 : getExamTotal(examType);

        let html = `
            <div class="marksheet-card">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <h2 style="margin: 0; color: var(--primary);">CONSOLIDATED MARK SHEET</h2>
                    <p style="margin: 5px 0; font-weight: 600;">Exam: ${examType === 'all' ? 'Annual Summary' : examType}</p>
                </div>
                <div class="table-responsive">
                    <table class="marks-table">
                        <thead>
                            <tr>
                                <th>S.No</th>
                                <th>Adm No</th>
                                <th>Student Name</th>
                                ${subjects.map(s => `<th style="text-align:center;">${s.name}</th>`).join('')}
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
                    // Average of all exams for this subject
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
                    <td>${student.admissionNo}</td>
                    <td style="font-weight: 600;">${student.name}</td>
                    ${subScores}
                    <td style="text-align:center; font-weight: 700;">${studentTotal.toFixed(1)}</td>
                    <td style="text-align:center;">${percentage.toFixed(1)}%</td>
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
                    <td>${m.subjectId}</td>
                    <td style="text-align: center; font-weight: 600;">${score}</td>
                    <td style="text-align: center;">${totalMaxMarks}</td>
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
                        <th>Subject</th>
                        <th style="text-align: center;">Obtained</th>
                        <th style="text-align: center;">Max</th>
                        <th style="text-align: center;">%</th>
                        <th style="text-align: center;">Grade</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="text-align:center;">No marks entered.</td></tr>'}
                </tbody>
                <tfoot>
                    <tr style="background: #f3f4f6; font-weight: 700;">
                        <td>TOTAL</td>
                        <td style="text-align: center;">${grandTotalObtained.toFixed(1)}</td>
                        <td style="text-align: center;">${grandTotalPossible}</td>
                        <td style="text-align: center;">${overallPercentage.toFixed(1)}%</td>
                        <td style="text-align: center;"><span class="grade-badge grade-${overallGrade.charAt(0)}">${overallGrade}</span></td>
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
                        <th>Subject</th>
                        ${examNames.map(name => `<th style="text-align:center; font-size: 0.65rem;">${name}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${subjects.map(sub => `
                        <tr>
                            <td style="font-weight: 600;">${sub}</td>
                            ${examNames.map(exam => {
            const mark = studentMarks.find(m => m.subjectId === sub && m.examId === exam);
            return `<td style="text-align:center;">${mark ? mark.data[student.id] : '-'}</td>`;
        }).join('')}
                        </tr>
                    `).join('') || '<tr><td colspan="${examNames.length + 1}" style="text-align:center;">No data.</td></tr>'}
                </tbody>
            </table>
        `;
    },

    loadAdminMarksList() {
        const classId = document.getElementById('admin-exam-class').value;
        const examType = document.getElementById('admin-exam-type').value;
        const subject = document.getElementById('admin-exam-subject').value;
        const container = document.getElementById('admin-marks-list-container');

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
        NotificationSystem.showToast('Success', 'Marks saved successfully!', 'success');
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
                        <th style="padding: 1rem; text-align: center;">Subjects</th>
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
                    <span class="badge" style="background: var(--primary-light); color: var(--primary);">${getSubjectsByGrade(cls.name).length}</span>
                    <button class="btn btn-sm" style="font-size: 0.7rem; padding: 2px 6px;" onclick="AdminModule.showClassSubjects('${cls.id}')">View</button>
                </td>
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
            <div class="top-bar" style="border: none; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <h2>Staff Management</h2>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn" style="background: var(--warning); color: #78350f;" onclick="AdminModule.manageTeacherAttendance('${container.id}')">
                        <i class="fas fa-calendar-check"></i> Teacher Attendance
                    </button>
                    <button class="btn btn-primary" onclick="AdminModule.showTeacherForm()">
                        <i class="fas fa-plus"></i> Add Teacher
                    </button>
                </div>
            </div>
            <div id="teachers-list" class="glass-panel" style="padding: 0;">
            <div class="table-responsive">
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
                    <button class="btn" style="color: var(--primary); margin-right: 5px;" title="Documents" onclick="AdminModule.manageTeacherDocuments('${t.id}')"><i class="fas fa-folder-open"></i></button>
                    <button class="btn" style="color: var(--primary); margin-right: 5px;" title="Edit Teacher" onclick="AdminModule.showTeacherForm('${t.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--danger);" title="Delete Teacher" onclick="AdminModule.deleteTeacher('${t.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    },

    manageTeacherDocuments(teacherId) {
        const teacher = Storage.getItemById(STORAGE_KEYS.TEACHERS, teacherId);
        const docTypes = [
            { id: 'resume', name: 'Resume / CV' },
            { id: 'id_proof', name: 'ID Proof (Aadhar/PAN)' },
            { id: 'contract', name: 'Employment Contract' }
        ];

        const content = `
            <div style="padding: 1rem;">
                <p style="margin-bottom: 2rem; color: var(--gray-600);">Manage documents for <strong>${teacher.name}</strong></p>
                ${docTypes.map(doc => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--gray-50); border-radius: 8px; margin-bottom: 1rem;">
                        <div>
                            <strong>${doc.name}</strong>
                            <div style="font-size: 0.75rem; margin-top: 4px;">
                                ${(() => {
                const docInfo = Storage.getTeacherDocument(teacherId, doc.id);
                if (docInfo.type === 'manual') {
                    return `<span style="color: var(--success);"><i class="fas fa-check-circle"></i> Uploaded</span>`;
                } else {
                    return `<span style="color: var(--gray-400);">Not Uploaded</span>`;
                }
            })()}
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${(() => {
                const docInfo = Storage.getTeacherDocument(teacherId, doc.id);
                return `
                                    <button class="btn" style="${docInfo.type === 'manual' ? '' : 'display:none;'}" onclick="window.open('${docInfo.src}')">View</button>
                                `;
            })()}
                            <label class="btn btn-primary" style="cursor: pointer;">
                                <i class="fas fa-upload"></i> ${Storage.getTeacherDocument(teacherId, doc.id).type === 'manual' ? 'Update' : 'Upload'}
                                <input type="file" style="display: none;" accept="image/*,application/pdf" onchange="AdminModule.handleTeacherDocUpload(this, '${doc.id}', '${teacherId}')">
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.showModal(`Documents: ${teacher.name}`, content, () => this.closeModal());
        document.getElementById('modal-save-btn').style.display = 'none';
    },

    handleTeacherDocUpload(input, docType, teacherId) {
        if (!input.files || !input.files[0]) return;
        const file = input.files[0];

        if (file.size > 2 * 1024 * 1024) return NotificationSystem.showToast('Error', 'File size must be under 2MB', 'error');

        const processFile = (base64) => {
            const allDocs = Storage.get(STORAGE_KEYS.TEACHER_DOCUMENTS);
            let docIndex = allDocs.findIndex(d => d.teacherId === teacherId);

            if (docIndex === -1) {
                allDocs.push({ teacherId, [docType]: base64, updatedAt: new Date().toISOString() });
            } else {
                allDocs[docIndex][docType] = base64;
                allDocs[docIndex].updatedAt = new Date().toISOString();
            }

            Storage.save(STORAGE_KEYS.TEACHER_DOCUMENTS, allDocs);
            NotificationSystem.showToast('Success', 'Document uploaded successfully!', 'success');
            this.manageTeacherDocuments(teacherId); // Refresh modal
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

    manageTeacherAttendance(containerId) {
        const today = new Date().toISOString().split('T')[0];
        const container = document.getElementById(containerId);

        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2 style="margin: 0;">Teacher Attendance</h2>
                    <p style="color: var(--gray-600); margin: 5px 0 0 0;">Mark daily attendance for staff members.</p>
                </div>
                <button class="btn" onclick="AdminModule.manageTeachers(document.getElementById('${containerId}'))" style="border: 1px solid var(--gray-300);">
                    <i class="fas fa-arrow-left"></i> Back to List
                </button>
            </div>

            <div class="glass-panel" style="padding: 1.5rem;">
                <div style="display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 2rem; background: var(--gray-50); padding: 1.5rem; border-radius: 8px;">
                    <div class="form-group" style="flex: 1; max-width: 300px;">
                        <label class="form-label">Select Date</label>
                        <input type="date" id="t-attn-date" class="form-control" value="${today}" max="${today}">
                    </div>
                    <button class="btn btn-primary" onclick="AdminModule.loadTeacherAttendanceList()">
                        <i class="fas fa-search"></i> Load Records
                    </button>
                </div>

                <div id="teacher-attn-list"></div>
            </div>
        `;

        // Load default for today
        this.loadTeacherAttendanceList();
    },

    loadTeacherAttendanceList() {
        const date = document.getElementById('t-attn-date').value;
        const container = document.getElementById('teacher-attn-list');
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);

        // Find existing records
        const attendanceRecords = Storage.get(STORAGE_KEYS.TEACHER_ATTENDANCE);
        const record = attendanceRecords.find(a => a.date === date) || { data: {} };
        const data = record.data;

        if (teachers.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: var(--gray-500);">No teachers found in the system.</div>`;
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 1rem; text-align: left;">Teacher Name</th>
                            <th style="padding: 1rem; text-align: left;">Department</th>
                            <th style="padding: 1rem; text-align: center;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${teachers.map(t => {
            const status = data[t.id] || 'present';
            return `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 1rem; font-weight: 500;">${t.name}</td>
                                    <td style="padding: 1rem;">${t.subject || 'N/A'}</td>
                                    <td style="padding: 1rem; text-align: center;">
                                        <div style="display: inline-flex; background: var(--gray-100); padding: 4px; border-radius: 8px;">
                                            <label style="cursor: pointer; padding: 6px 12px; border-radius: 6px; background: ${status === 'present' ? 'var(--success)' : 'transparent'}; color: ${status === 'present' ? 'white' : 'var(--gray-600)'}; transition: all 0.2s;" onclick="AdminModule.toggleTeacherStatus(this, 'present')">
                                                Present
                                                <input type="radio" name="ta_${t.id}" value="present" ${status === 'present' ? 'checked' : ''} style="display: none;">
                                            </label>
                                            <label style="cursor: pointer; padding: 6px 12px; border-radius: 6px; background: ${status === 'absent' ? 'var(--danger)' : 'transparent'}; color: ${status === 'absent' ? 'white' : 'var(--gray-600)'}; transition: all 0.2s;" onclick="AdminModule.toggleTeacherStatus(this, 'absent')">
                                                Absent
                                                <input type="radio" name="ta_${t.id}" value="absent" ${status === 'absent' ? 'checked' : ''} style="display: none;">
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
                <button class="btn btn-primary" onclick="AdminModule.saveTeacherAttendance()" style="padding: 12px 30px;">
                    <i class="fas fa-save"></i> Save Attendance
                </button>
            </div>
        `;
    },

    toggleTeacherStatus(label, status) {
        label.parentNode.querySelectorAll('label').forEach(l => {
            l.style.background = 'transparent';
            l.style.color = 'var(--gray-600)';
        });
        label.style.background = status === 'present' ? 'var(--success)' : 'var(--danger)';
        label.style.color = 'white';
        label.querySelector('input').click();
    },

    saveTeacherAttendance() {
        const date = document.getElementById('t-attn-date').value;
        const teachers = Storage.get(STORAGE_KEYS.TEACHERS);
        const data = {};

        teachers.forEach(t => {
            const status = document.querySelector(`input[name="ta_${t.id}"]:checked`).value;
            data[t.id] = status;
        });

        const allRecords = Storage.get(STORAGE_KEYS.TEACHER_ATTENDANCE);
        const filtered = allRecords.filter(a => a.date !== date);

        filtered.push({
            id: Date.now().toString(),
            date,
            data,
            timestamp: new Date().toISOString()
        });

        Storage.save(STORAGE_KEYS.TEACHER_ATTENDANCE, filtered);
        NotificationSystem.showToast('Success', 'Teacher attendance saved successfully!', 'success');
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
            <div class="top-bar" style="border: none; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
                <div>
                    <h2>Student Admission</h2>
                    <p style="color: var(--gray-500); font-size: 0.75rem;">Manage all student enrollments and documents.</p>
                </div>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                    <div class="form-group" style="margin: 0; min-width: 200px;">
                        <select id="students-class-filter" class="form-control" onchange="AdminModule.renderStudentsTable()">
                            <option value="all">All Classes</option>
                            ${Storage.get(STORAGE_KEYS.CLASSES).map(cls => `
                                <option value="${cls.id}">${cls.name} - ${cls.section}</option>
                            `).join('')}
                        </select>
                    </div>
                    <button class="btn btn-primary" onclick="AdminModule.showStudentForm()">
                        <i class="fas fa-plus"></i> New Admission
                    </button>
                </div>
            </div>
    <div id="students-list" class="glass-panel" style="padding: 0;">
    <div class="table-responsive">
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
    </div>
        `;
        this.renderStudentsTable();
    },

    renderStudentsTable() {
        let students = Storage.get(STORAGE_KEYS.STUDENTS);
        const filterDropdown = document.getElementById('students-class-filter');
        const selectedClassId = filterDropdown ? filterDropdown.value : 'all';

        if (selectedClassId !== 'all') {
            students = students.filter(s => s.classId === selectedClassId);
        }

        const tbody = document.getElementById('students-table-body');
        if (!tbody) return;

        if (students.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="padding: 2rem; text-align: center; color: var(--gray-400);">
                ${selectedClassId === 'all' ? 'No students enrolled.' : 'No students found in this class.'}
            </td></tr>`;
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
            guardianName: '', contact: '', address: '', photo: null, classId: '',
            status: 'Active', rollNo: '', transport: 'Bus', bloodGroup: '',
            house: '', admissionDate: new Date().toISOString()
        };
        const classes = Storage.get(STORAGE_KEYS.CLASSES);

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
                    document.getElementById('photo-preview').innerHTML = `<img src="${re.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
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
            </div>
    `;

        this.showModal(`Documents: ${student.name} `, content, () => this.closeModal());
        // Hide the default save button since we save on upload
        document.getElementById('modal-save-btn').style.display = 'none';
    },

    handleAdminDocUpload(input, docType, studentId) {
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
            this.manageStudentDocuments(studentId); // Refresh modal
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

    // SUBJECT MANAGEMENT
    cleanupDuplicateSubjects() {
        const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);
        const uniqueSubjects = [];
        const seenNames = new Set();
        let hasDuplicates = false;

        subjects.forEach(s => {
            const lowerName = s.name.trim().toLowerCase();
            if (!seenNames.has(lowerName)) {
                seenNames.add(lowerName);
                uniqueSubjects.push(s);
            } else {
                hasDuplicates = true;
            }
        });

        if (hasDuplicates) {
            Storage.save(STORAGE_KEYS.SUBJECTS, uniqueSubjects);
            console.log('Cleaned up duplicate subjects.');
            if (document.getElementById('subjects-table-body')) {
                this.renderSubjectsTable();
            }
        }
    },

    manageSubjects(container) {
        this.cleanupDuplicateSubjects();
        container.innerHTML = `
            <div class="top-bar" style="border: none; margin-bottom: 1rem; display: flex; align-items: center; gap: 1rem;">
                <h2>Subject Management</h2>
                <div style="flex-grow: 1;">
                    <select id="filter-subject-grade" class="form-control" style="max-width: 250px;" onchange="AdminModule.renderSubjectsTable()">
                        <option value="all">All School Subjects</option>
                        <optgroup label="Levels">
                            <option value="Pre-Primary">Pre-Primary</option>
                            <option value="Primary">Primary</option>
                            <option value="Middle">Middle</option>
                            <option value="Secondary">Secondary</option>
                            <option value="Senior Secondary">Senior Secondary</option>
                        </optgroup>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="AdminModule.showSubjectForm()">
                    <i class="fas fa-plus"></i> Add Subject
                </button>
            </div>
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
        const filterVal = document.getElementById('filter-subject-grade')?.value || 'all';
        const tbody = document.getElementById('subjects-table-body');
        if (!tbody) return;

        let filteredSubjects = subjects;
        if (filterVal !== 'all') {
            // Get all subjects for this level/grade
            let subjectsInFilter = [];
            if (SCHOOL_CURRICULUM[filterVal]) {
                // It's a level
                for (const grade in SCHOOL_CURRICULUM[filterVal]) {
                    subjectsInFilter = [...subjectsInFilter, ...SCHOOL_CURRICULUM[filterVal][grade]];
                }
            } else {
                // It's a specific grade (future proofing)
                subjectsInFilter = getSubjectsByGrade(filterVal);
            }

            filteredSubjects = subjects.filter(s => subjectsInFilter.includes(s.name));
        }

        if (filteredSubjects.length === 0) {
            tbody.innerHTML = `<tr><td colspan="3" style="padding: 2rem; text-align: center; color: var(--gray-400);">No subjects found for this selection.</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredSubjects.map(s => `
            <tr style="border-bottom: 1px solid var(--gray-100);">
                <td style="padding: 1rem; font-weight: 600;">${s.name}</td>
                <td style="padding: 1rem;">${s.code || 'N/A'}</td>
                <td style="padding: 1rem; text-align: center;">
                    <button class="btn" style="color: var(--primary);" onclick="AdminModule.showSubjectForm('${s.id}')"><i class="fas fa-edit"></i></button>
                    <button class="btn" style="color: var(--danger);" onclick="AdminModule.deleteSubject('${s.id}')"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
    `).join('');
    },

    showClassSubjects(classId) {
        const cls = Storage.getItemById(STORAGE_KEYS.CLASSES, classId);
        const subjects = getSubjectsByGrade(cls.name);

        const content = `
            <div class="glass-panel" style="background: var(--gray-50); margin-bottom: 1rem;">
                <p><strong>Class:</strong> ${cls.name} - ${cls.section}</p>
                <p><strong>Total Subjects:</strong> ${subjects.length}</p>
            </div>
    <div class="glass-panel" style="padding: 0;">
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: var(--gray-100);">
                    <th style="padding: 10px; text-align: left;">#</th>
                    <th style="padding: 10px; text-align: left;">Subject Name</th>
                </tr>
            </thead>
            <tbody>
                ${subjects.map((s, i) => `
                            <tr style="border-bottom: 1px solid var(--gray-100);">
                                <td style="padding: 10px;">${i + 1}</td>
                                <td style="padding: 10px; font-weight: 500;">${s}</td>
                            </tr>
                        `).join('')}
            </tbody>
        </table>
    </div>
`;

        this.showModal(`Subjects for ${cls.name}`, content, () => this.closeModal());
    },

    showSubjectForm(subjectId = null) {
        const s = subjectId ? Storage.getItemById(STORAGE_KEYS.SUBJECTS, subjectId) : { name: '', code: '' };

        const content = `
            <form id="subject-form">
                <div class="form-group">
                    <label class="form-label">Subject Name</label>
                    <input type="text" id="subj-name" class="form-control" value="${s.name}" placeholder="e.g., Mathematics" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Subject Code</label>
                    <input type="text" id="subj-code" class="form-control" value="${s.code}" placeholder="e.g., MATH-101">
                </div>
            </form>
    `;

        this.showModal(subjectId ? 'Edit Subject' : 'Add Subject', content, () => {
            const data = {
                name: document.getElementById('subj-name').value.trim(),
                code: document.getElementById('subj-code').value.trim()
            };

            if (!data.name) return NotificationSystem.showToast('Error', 'Subject Name is required', 'error');

            const subjects = Storage.get(STORAGE_KEYS.SUBJECTS);
            const exists = subjects.find(s => s.name.toLowerCase() === data.name.toLowerCase() && s.id !== subjectId);

            if (exists) {
                return NotificationSystem.showToast('Error', 'Subject already exists!', 'error');
            }

            if (subjectId) {
                Storage.updateItem(STORAGE_KEYS.SUBJECTS, subjectId, data);
                NotificationSystem.showToast('Success', 'Subject updated successfully', 'success');
            } else {
                Storage.addItem(STORAGE_KEYS.SUBJECTS, data);
                NotificationSystem.showToast('Success', 'Subject added successfully', 'success');
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
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const feeStructure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE) || {};

        // Initialize/Enforce Minimum Fee of 15,000
        let modified = false;
        classes.forEach(cls => {
            if (!feeStructure[cls.id] || feeStructure[cls.id] < 15000) {
                feeStructure[cls.id] = 15000;
                modified = true;
            }
        });
        if (modified) {
            Storage.save(STORAGE_KEYS.FEE_STRUCTURE, feeStructure);
        }

        container.innerHTML = `
            <div class="glass-panel" style="margin-bottom: 1.5rem; padding: 10px;">
                <div style="display: flex; gap: 10px; background: var(--gray-50); padding: 5px; border-radius: 12px; max-width: 400px;">
                    <button class="btn fee-tab active" id="btn-revise-tab" onclick="AdminModule.switchFeeTab('revise')" style="flex: 1; font-weight: 600;">
                        <i class="fas fa-edit"></i> Revise Payment
                    </button>
                    <button class="btn fee-tab" id="btn-students-tab" onclick="AdminModule.switchFeeTab('students')" style="flex: 1; font-weight: 600;">
                        <i class="fas fa-history"></i> Students Payment
                    </button>
                </div>
            </div>

            <!-- Tab 1: Revise Payment (Structure) -->
            <div id="section-fee-revise" class="fee-section active">
                <div class="glass-panel" style="padding: 2rem;">
                    <div style="margin-bottom: 2rem;">
                        <h2>Class Fee Revision</h2>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">Set the total annual school fee for each grade. Minimum: ₹15,000.</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
                        ${classes.map(cls => `
                            <div class="glass-card" style="padding: 1.25rem; display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <div style="font-weight: 700; color: var(--gray-900);">${cls.name}</div>
                                    <div style="font-size: 0.75rem; color: var(--gray-500);">Section: ${cls.section}</div>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="font-weight: 600; color: var(--gray-400);">₹</span>
                                    <input type="number" class="form-control" style="width: 120px; font-weight: 700; text-align: right;" 
                                           value="${feeStructure[cls.id]}" 
                                           onchange="AdminModule.updateClassFee('${cls.id}', this.value)">
                                </div>
                            </div>
                        `).join('') || '<p style="text-align: center; color: var(--gray-400); grid-column: 1/-1;">No classes found.</p>'}
                    </div>
                </div>

                <!--New: Payment Configuration Settings-->
                <div class="glass-panel" style="padding: 1.5rem; margin-top: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                        <div>
                            <h3>Merchant Payment Settings</h3>
                            <p style="color: var(--gray-500); font-size: 0.75rem;">Configure the destination bank and UPI details for student fee collections.</p>
                        </div>
                        <button class="btn btn-primary" onclick="AdminModule.savePaymentConfig()">
                            <i class="fas fa-save"></i> Save Config
                        </button>
                    </div>

                    ${(() => {
                const config = Storage.get(STORAGE_KEYS.PAYMENT_CONFIG) || {
                    bankName: 'International School Bank',
                    accountNumber: '9182736455',
                    ifsc: 'SMS0001234',
                    upiId: 'school@upi',
                    merchantName: 'School Management System'
                };
                return `
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem;">
                            <div class="form-group">
                                <label class="form-label">Merchant/School Name</label>
                                <input type="text" id="pay-merchant" class="form-control" value="${config.merchantName}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">School UPI ID</label>
                                <input type="text" id="pay-upi" class="form-control" value="${config.upiId}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bank Name</label>
                                <input type="text" id="pay-bank" class="form-control" value="${config.bankName}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Account Number</label>
                                <input type="text" id="pay-acc" class="form-control" value="${config.accountNumber}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">IFSC Code</label>
                                <input type="text" id="pay-ifsc" class="form-control" value="${config.ifsc}">
                            </div>
                        </div>
                        `;
            })()}
                </div>
            </div>

            <!-- Tab 2: Students Payment (Logs) -->
            <div id="section-fee-students" class="fee-section" style="display: none;">
                <div class="glass-panel" style="padding: 2rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1.5rem;">
                        <div>
                            <h2>Student Payment Records</h2>
                            <p style="color: var(--gray-500); font-size: 0.875rem;">Track all fee transactions across the school.</p>
                        </div>
                        <div style="display: flex; gap: 1rem; align-items: center;">
                            <div class="form-group" style="margin: 0; min-width: 200px;">
                                <select id="fee-class-filter" class="form-control" onchange="AdminModule.filterFeePayments()">
                                    <option value="all">🔍 All Classes</option>
                                    ${classes.map(c => `<option value="${c.id}">${c.name} - ${c.section}</option>`).join('')}
                                </select>
                            </div>
                            <button class="btn btn-primary" onclick="AdminModule.downloadFeeReport()">
                                <i class="fas fa-file-download"></i> CSV Report
                            </button>
                        </div>
                    </div>

                    <div id="fee-payments-table-container" class="table-responsive" style="border-radius: 12px; border: 1px solid var(--gray-100);">
                        <!-- Table rendered here -->
                    </div>
                </div>
            </div>
        `;

        // Load initial table for Tab 2
        this.filterFeePayments();
    },

    savePaymentConfig() {
        const config = {
            merchantName: document.getElementById('pay-merchant').value,
            upiId: document.getElementById('pay-upi').value,
            bankName: document.getElementById('pay-bank').value,
            accountNumber: document.getElementById('pay-acc').value,
            ifsc: document.getElementById('pay-ifsc').value,
            updatedAt: new Date().toISOString()
        };
        Storage.save(STORAGE_KEYS.PAYMENT_CONFIG, config);
        NotificationSystem.showToast('Success', 'Payment gateway configuration updated!', 'success');
    },

    downloadFeeReport() {
        const payments = Storage.get(STORAGE_KEYS.FEES);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);

        if (payments.length === 0) return NotificationSystem.showToast('No Data', 'No payment records to download.', 'info');

        // Format CSV data
        const headers = ['Receipt ID', 'Student Name', 'Admission No', 'Details', 'Amount (INR)', 'Date', 'Payment Method'];
        const csvRows = [headers.join(',')];

        payments.forEach(p => {
            const s = students.find(st => st.id === p.studentId) || { name: 'Unknown', admissionNo: 'N/A' };
            const row = [
                p.id,
                `"${s.name}"`,
                s.admissionNo,
                `"${p.description || 'School Fee'}"`,
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
        link.setAttribute("download", `SMS_Fee_Report_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        NotificationSystem.showToast('Success', 'Report downloaded successfully!', 'success');
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
        const today = new Date().toISOString().split('T')[0];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <div>
                        <h2 style="margin: 0;">Attendance Analytics & Reports</h2>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">Generate reports or view live attendance analytics across a date range.</p>
                    </div>
                </div>

                <div class="glass-card" style="padding: 1.5rem; margin-bottom: 2rem;">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                        <div class="form-group">
                            <label class="form-label">Start Date</label>
                            <input type="date" id="rep-start-date" class="form-control" value="${thirtyDaysAgo}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">End Date</label>
                            <input type="date" id="rep-end-date" class="form-control" value="${today}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Select Class</label>
                            <select id="rep-class" class="form-control" onchange="AdminModule.toggleExportOptions(this.value)">
                                <option value="all">📁 All Classes</option>
                                ${classes.map(c => `<option value="${c.id}">${c.name} - ${c.section}</option>`).join('')}
                            </select>
                        </div>
                    </div>

                    <!-- Export Options Section (Conditional) -->
                    <div id="export-options-section" style="margin-bottom: 2rem; padding: 1rem; background: var(--gray-50); border-radius: 8px; border: 1px solid var(--gray-200);">
                        <label class="form-label" style="display: block; margin-bottom: 0.5rem; font-weight: 700;">Export Format</label>
                        <div style="display: flex; gap: 2rem;">
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="export-mode" value="single" checked> Single Combined File
                            </label>
                            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                                <input type="radio" name="export-mode" value="multiple"> Multiple Separate Files
                            </label>
                        </div>
                    </div>

                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-primary" style="flex: 1; min-width: 200px;" onclick="AdminModule.viewAttendanceAnalytics()">
                            <i class="fas fa-chart-bar"></i> View Analytics
                        </button>
                        <button class="btn" style="flex: 1; min-width: 200px; background: var(--success); color: white;" onclick="AdminModule.downloadAttendanceReport()">
                            <i class="fas fa-file-download"></i> Download Report (CSV)
                        </button>
                    </div>
                </div>

                <div id="attendance-results-container">
                    <div style="background: rgba(79, 70, 229, 0.05); border: 1px dashed var(--primary); padding: 1.5rem; border-radius: 8px;">
                        <p style="margin: 0; font-size: 0.875rem; color: var(--gray-600);">
                            <i class="fas fa-info-circle"></i> <strong>How it works:</strong> Select a date range and a class. Use <strong>View Analytics</strong> to see the data immediately, or <strong>Download Report</strong> to get a CSV file. For "All Classes", you can choose to get one large file or several individual ones.
                        </p>
                    </div>
                </div>
            </div>
        `;
    },

    toggleExportOptions(val) {
        const section = document.getElementById('export-options-section');
        if (section) {
            section.style.display = (val === 'all') ? 'block' : 'none';
        }
    },

    viewAttendanceAnalytics() {
        const classId = document.getElementById('rep-class').value;
        const startDate = document.getElementById('rep-start-date').value;
        const endDate = document.getElementById('rep-end-date').value;
        const container = document.getElementById('attendance-results-container');

        if (classId === 'all') {
            return NotificationSystem.showToast('Select a Class', 'Please select a specific class to view analytics.', 'warning');
        }

        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE).filter(a => {
            return a.classId === classId && a.date >= startDate && a.date <= endDate;
        });

        if (attendance.length === 0) {
            container.innerHTML = `<div class="glass-panel" style="padding: 2rem; text-align: center; color: var(--gray-400);">No attendance records found for this period.</div>`;
            return;
        }

        const stats = students.map(s => {
            const studentStats = attendance.reduce((acc, curr) => {
                const status = curr.data[s.id];
                if (status === 'present') acc.present++;
                else if (status === 'absent') acc.absent++;
                acc.total++;
                return acc;
            }, { present: 0, absent: 0, total: 0 });

            return {
                ...s,
                ...studentStats,
                percentage: studentStats.total > 0 ? ((studentStats.present / studentStats.total) * 100).toFixed(1) : '0.0'
            };
        });

        container.innerHTML = `
            <div class="glass-panel" style="margin-top: 2rem; overflow-x: auto;">
                <h3 style="margin-top: 0;">Analytics: ${startDate} to ${endDate}</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 0.875rem;">
                    <thead>
                        <tr style="background: var(--gray-50); border-bottom: 1px solid var(--gray-200);">
                            <th style="padding: 12px; text-align: left;">Roll No</th>
                            <th style="padding: 12px; text-align: left;">Student Name</th>
                            <th style="padding: 12px; text-align: center;">Total Days</th>
                            <th style="padding: 12px; text-align: center;">Present</th>
                            <th style="padding: 12px; text-align: center;">Absent</th>
                            <th style="padding: 12px; text-align: right;">Percentage</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(s => `
                            <tr style="border-bottom: 1px solid var(--gray-100);">
                                <td style="padding: 12px; font-weight: 600;">${s.admissionNo}</td>
                                <td style="padding: 12px;">${s.name}</td>
                                <td style="padding: 12px; text-align: center;">${s.total}</td>
                                <td style="padding: 12px; text-align: center; color: var(--success); font-weight: 600;">${s.present}</td>
                                <td style="padding: 12px; text-align: center; color: var(--danger); font-weight: 600;">${s.absent}</td>
                                <td style="padding: 12px; text-align: right;">
                                    <span class="badge" style="background: ${s.percentage >= 75 ? 'var(--success-light)' : '#fee2e2'}; color: ${s.percentage >= 75 ? 'var(--success)' : '#991b1b'};">
                                        ${s.percentage}%
                                    </span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    downloadAttendanceReport() {
        const classId = document.getElementById('rep-class').value;
        const startDate = document.getElementById('rep-start-date').value;
        const endDate = document.getElementById('rep-end-date').value;

        if (classId === 'all') {
            const mode = document.querySelector('input[name="export-mode"]:checked')?.value || 'single';
            if (mode === 'single') {
                this.generateCombinedAttendanceCSV(startDate, endDate);
            } else {
                this.exportAllAttendanceReports(startDate, endDate);
            }
            return;
        }

        this.generateAttendanceCSV(classId, startDate, endDate);
    },

    exportAllAttendanceReports(startDate, endDate) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        let count = 0;

        classes.forEach((cls, index) => {
            // Add a small delay between downloads to prevent browser blocking
            setTimeout(() => {
                this.generateAttendanceCSV(cls.id, startDate, endDate);
            }, index * 500);
            count++;
        });

        NotificationSystem.showToast('Export Started', `Downloading reports for ${count} classes (separate files)...`, 'success');
    },

    generateCombinedAttendanceCSV(startDate, endDate) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE).filter(a => a.date >= startDate && a.date <= endDate);

        if (attendance.length === 0) {
            return NotificationSystem.showToast('No Data', 'No attendance records found for this period.', 'info');
        }

        const headers = ['Class', 'Admission No', 'Student Name', 'Total Days', 'Present', 'Absent', 'Percentage (%)'];
        const csvRows = [headers.join(',')];

        classes.forEach(cls => {
            const classStudents = students.filter(s => s.classId === cls.id);
            const classAttendance = attendance.filter(a => a.classId === cls.id);

            if (classAttendance.length > 0) {
                classStudents.forEach(s => {
                    const studentStats = classAttendance.reduce((acc, curr) => {
                        const status = curr.data[s.id];
                        if (status === 'present') acc.present++;
                        else if (status === 'absent') acc.absent++;
                        acc.total++;
                        return acc;
                    }, { present: 0, absent: 0, total: 0 });

                    const percentage = studentStats.total > 0 ? ((studentStats.present / studentStats.total) * 100).toFixed(1) : '0.0';

                    csvRows.push([
                        `"${cls.name}"`,
                        s.admissionNo,
                        `"${s.name}"`,
                        studentStats.total,
                        studentStats.present,
                        studentStats.absent,
                        percentage
                    ].join(','));
                });
            }
        });

        const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Combined_Attendance_Report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        NotificationSystem.showToast('Success', 'Combined report downloaded successfully!', 'success');
    },

    generateAttendanceCSV(classId, startDate, endDate) {
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const students = Storage.get(STORAGE_KEYS.STUDENTS).filter(s => s.classId === classId);
        const cls = classes.find(c => c.id === classId) || { name: 'Unknown' };

        const attendance = Storage.get(STORAGE_KEYS.ATTENDANCE).filter(a => {
            return a.classId === classId && a.date >= startDate && a.date <= endDate;
        });

        if (attendance.length === 0) return; // Skip if no data for this class

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
        link.setAttribute("download", `Attendance_Report_${cls.name}_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        NotificationSystem.showToast('Success', 'Attendance report downloaded successfully!', 'success');
    },

    manageStorage(container) {
        const keys = Object.entries(STORAGE_KEYS);

        container.innerHTML = `
            <div class="glass-panel" style="padding: 2rem;">
                <div style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h2>System Database (Local Storage)</h2>
                        <p style="color: var(--gray-500); font-size: 0.875rem;">Directly view and manage the underlying browser storage keys.</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <button class="btn glass-panel" onclick="Storage.exportAllData(); NotificationSystem.showToast('Backup', 'System backup downloaded successfully!', 'success');">
                            <i class="fas fa-file-export"></i> Export System Backup
                        </button>
                        <label class="btn btn-primary" style="cursor: pointer;">
                            <i class="fas fa-file-import"></i> Import Restore File
                            <input type="file" id="restore-file-input" style="display: none;" accept=".json" onchange="AdminModule.handleRestore(this)">
                        </label>
                    </div>
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
                <div style="overflow-x: auto; border: 1px solid var(--gray-100); border-radius: 8px;">
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
                </div>
            `;
        }

        const content = `
            <div id="storage-viewer-container">
                <div style="display: flex; gap: 10px; margin-bottom: 1.5rem;">
                    <button class="btn btn-primary" onclick="document.getElementById('tabular-view').style.display='block'; document.getElementById('json-view').style.display='none'">
                        <i class="fas fa-table"></i> Table View
                    </button>
                    <button class="btn glass-panel" onclick="document.getElementById('tabular-view').style.display='none'; document.getElementById('json-view').style.display='block'">
                        <i class="fas fa-code"></i> Raw JSON
                    </button>
                    <button class="btn" style="margin-left: auto;" onclick="navigator.clipboard.writeText(JSON.stringify(window.activeStorageData, null, 4)); NotificationSystem.showToast('Copied', 'JSON copied to clipboard!', 'success')">
                        <i class="fas fa-copy"></i> Copy JSON
                    </button>
                </div>

                <div id="tabular-view">
                    ${tableHtml}
                </div>

                <div id="json-view" style="display: none;">
                    <pre style="background: #1e1e1e; color: #d4d4d4; padding: 1.5rem; border-radius: 8px; font-family: 'Consolas', monospace; font-size: 0.75rem; max-height: 400px; overflow: auto; white-space: pre-wrap; margin: 0;">${JSON.stringify(data, null, 4)}</pre>
                </div>
            </div>
    `;

        this.showModal(`Database Explorer: ${key}`, content, () => {
            this.closeModal();
        });

        const saveBtn = document.getElementById('modal-save-btn');
        if (saveBtn) {
            saveBtn.textContent = 'Close';
            saveBtn.onclick = () => this.closeModal();
        }
    },

    updateClassFee(classId, amount) {
        let structure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE);
        if (Array.isArray(structure) || typeof structure !== 'object') {
            structure = {};
        }

        const val = parseInt(amount) || 0;
        if (val < 15000) {
            NotificationSystem.showToast('Minimum Required', 'Annual fee cannot be less than ₹15,000.', 'warning');
            // Reset to 15000 in UI if user tries to set lower
            const container = document.getElementById('content-area');
            this.manageFees(container);
            return;
        }

        structure[classId] = val;
        Storage.save(STORAGE_KEYS.FEE_STRUCTURE, structure);
        NotificationSystem.showToast('Updated', 'Class fee updated successfully.', 'success');
    },

    switchFeeTab(tab) {
        // Update Buttons
        document.querySelectorAll('.fee-tab').forEach(b => b.classList.remove('active', 'btn-primary'));
        document.getElementById(`btn-${tab}-tab`).classList.add('active', 'btn-primary');

        // Update Sections
        document.querySelectorAll('.fee-section').forEach(s => s.style.display = 'none');
        document.getElementById(`section-fee-${tab}`).style.display = 'block';
    },

    filterFeePayments() {
        const classId = document.getElementById('fee-class-filter')?.value || 'all';
        const container = document.getElementById('fee-payments-table-container');
        if (!container) return;

        const payments = Storage.get(STORAGE_KEYS.FEES);
        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const classes = Storage.get(STORAGE_KEYS.CLASSES);
        const feeStructure = Storage.get(STORAGE_KEYS.FEE_STRUCTURE) || {};

        if (classId === 'all') {
            const filteredPayments = [...payments].reverse();
            container.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 12px; text-align: left;">Receipt ID</th>
                            <th style="padding: 12px; text-align: left;">Student Name</th>
                            <th style="padding: 12px; text-align: left;">Class</th>
                            <th style="padding: 12px; text-align: left;">Amount Paid</th>
                            <th style="padding: 12px; text-align: left;">Date</th>
                            <th style="padding: 12px; text-align: left;">Method</th>
                            <th style="padding: 12px; text-align: center;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredPayments.map(p => {
                const student = students.find(s => s.id === p.studentId) || { name: 'Unknown', classId: '' };
                const cls = classes.find(c => c.id === student.classId) || { name: 'N/A' };
                return `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 12px; font-weight: 600;">#${p.id}</td>
                                    <td style="padding: 12px;">${student.name}</td>
                                    <td style="padding: 12px;"><span class="badge" style="background: var(--primary-light); color: var(--primary);">${cls.name}</span></td>
                                    <td style="padding: 12px; font-weight: 700; color: var(--success);">₹${p.amount}</td>
                                    <td style="padding: 12px;">${new Date(p.date).toLocaleDateString()}</td>
                                    <td style="padding: 12px;"><span class="badge" style="background: var(--gray-50); color: var(--gray-600);">${p.method}</span></td>
                                    <td style="padding: 12px; text-align: center;">
                                        <button class="btn" style="color: var(--primary); padding: 5px 10px;" onclick="AdminModule.downloadReceipt('${p.id}')">
                                            <i class="fas fa-file-invoice"></i> Receipt
                                        </button>
                                    </td>
                                </tr>
                            `;
            }).join('') || '<tr><td colspan="7" style="padding: 3rem; text-align: center; color: var(--gray-400);">No payment records found.</td></tr>'}
                    </tbody>
                </table>
            `;
        } else {
            const classStudents = students.filter(s => s.classId === classId);
            const totalFee = feeStructure[classId] || 0;

            container.innerHTML = `
                <table style="width: 100%; border-collapse: collapse; font-size: 0.8125rem;">
                    <thead style="background: var(--gray-50);">
                        <tr>
                            <th style="padding: 12px; text-align: left;">Admission No</th>
                            <th style="padding: 12px; text-align: left;">Student Name</th>
                            <th style="padding: 12px; text-align: left;">Total Fee</th>
                            <th style="padding: 12px; text-align: left;">Paid</th>
                            <th style="padding: 12px; text-align: left;">Balance</th>
                            <th style="padding: 12px; text-align: left;">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${classStudents.map(s => {
                const studentPayments = payments.filter(p => p.studentId === s.id);
                const paid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
                const balance = totalFee - paid;
                let statusBadge = '';
                if (paid === 0) {
                    statusBadge = '<span class="badge" style="background: #fee2e2; color: #991b1b;">UNPAID</span>';
                } else if (balance <= 0) {
                    statusBadge = '<span class="badge" style="background: var(--success-light); color: var(--success);">FULLY PAID</span>';
                } else {
                    statusBadge = '<span class="badge" style="background: #fef3c7; color: #92400e;">PARTIAL</span>';
                }

                return `
                                <tr style="border-bottom: 1px solid var(--gray-100);">
                                    <td style="padding: 12px; font-weight: 600;">${s.admissionNo}</td>
                                    <td style="padding: 12px;">${s.name}</td>
                                    <td style="padding: 12px;">₹${totalFee}</td>
                                    <td style="padding: 12px; font-weight: 700; color: var(--success);">₹${paid}</td>
                                    <td style="padding: 12px; font-weight: 700; color: ${balance > 0 ? 'var(--danger)' : 'var(--success)'};">₹${balance}</td>
                                    <td style="padding: 12px;">${statusBadge}</td>
                                </tr>
                            `;
            }).join('') || '<tr><td colspan="6" style="padding: 3rem; text-align: center; color: var(--gray-400);">No students found in this class.</td></tr>'}
                    </tbody>
                </table>
            `;
        }
    },

    downloadReceipt(receiptId) {
        const payments = Storage.get(STORAGE_KEYS.FEES);
        const p = payments.find(pay => pay.id === receiptId);
        if (!p) return NotificationSystem.showToast('Error', 'Receipt not found.', 'error');

        const students = Storage.get(STORAGE_KEYS.STUDENTS);
        const student = students.find(s => s.id === p.studentId) || { name: 'Unknown', admissionNo: 'N/A', className: 'N/A', section: '' };

        const schoolName = "SCHOOL MANAGEMENT SYSTEM";
        const schoolAddress = "123 Education Lane, Knowledge City, State - 400001";

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Fee Receipt - ${p.id}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; background: #f4f4f4; }
                    .receipt-container { max-width: 700px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
                    .header { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #eee; padding-bottom: 2rem; }
                    .header h1 { margin: 0; color: #2563eb; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
                    .header p { margin: 5px 0 0; font-size: 14px; color: #666; }
                    .receipt-info { display: flex; justify-content: space-between; margin-bottom: 2rem; }
                    .info-group h4 { margin: 0 0 5px; font-size: 12px; color: #888; text-transform: uppercase; }
                    .info-group p { margin: 0; font-weight: 600; font-size: 16px; }
                    .bill-to { margin-bottom: 2rem; background: #f9fafb; padding: 20px; border-radius: 6px; }
                    .table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
                    .table th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; font-size: 13px; text-transform: uppercase; }
                    .table td { padding: 15px 12px; border-bottom: 1px solid #eee; font-size: 15px; }
                    .total-row td { border-top: 2px solid #2563eb; border-bottom: none; font-weight: 700; font-size: 18px; color: #2563eb; padding-top: 15px; }
                    .footer { text-align: center; margin-top: 3rem; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
                    .stamp { position: fixed; top: 40%; right: 10%; border: 3px solid #22c55e; color: #22c55e; font-size: 30px; font-weight: 800; padding: 10px 20px; text-transform: uppercase; letter-spacing: 3px; transform: rotate(-15deg); opacity: 0.2; pointer-events: none; border-radius: 8px; }
                    .print-btn { display: block; width: 100%; padding: 15px; background: #2563eb; color: white; border: none; font-size: 16px; font-weight: 600; cursor: pointer; border-radius: 6px; margin-top: 20px; }
                    .print-btn:hover { background: #1d4ed8; }
                    @media print {
                        body { background: white; padding: 0; }
                        .receipt-container { box-shadow: none; padding: 0; }
                        .print-btn { display: none; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt-container">
                    <div class="stamp">PAID</div>
                    
                    <div class="header">
                        <h1>${schoolName}</h1>
                        <p>${schoolAddress}</p>
                        <p>Tel: +91 98765 43210 | Email: office@school.edu</p>
                    </div>

                    <div class="receipt-info">
                        <div class="info-group">
                            <h4>Receipt No</h4>
                            <p>#${p.id}</p>
                        </div>
                        <div class="info-group" style="text-align: right;">
                            <h4>Date</h4>
                            <p>${new Date(p.date).toLocaleDateString()} ${new Date(p.date).toLocaleTimeString()}</p>
                        </div>
                    </div>

                    <div class="bill-to">
                        <div class="info-group">
                            <h4>Received From</h4>
                            <p>${student.name}</p>
                            <span style="font-size: 14px; color: #555;">Adm No: ${student.admissionNo} | Class: ${student.className} - ${student.section}</span>
                        </div>
                    </div>

                    <table class="table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${p.description || 'School Fee Payment'}</td>
                                <td style="text-align: right;">&#8377; ${p.amount.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td><span style="font-size: 13px; color: #888;">Payment Method: ${p.method}</span></td>
                                <td></td>
                            </tr>
                            <tr class="total-row">
                                <td>Total Paid</td>
                                <td style="text-align: right;">&#8377; ${p.amount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <div class="footer">
                        <p>This is a computer-generated receipt and does not require a signature.</p>
                        <p>Generated on ${new Date().toLocaleString()}</p>
                    </div>

                    <button class="print-btn" onclick="window.print()">Print Receipt</button>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (!win) {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.click();
        }
    },
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
                                        <div style="color: #9ca3af; font-size: 0.75rem; margin-top: 0.25rem;">${(notif.message || '').substring(0, 50)}...</div>
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
                id: `notif - sys - ${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
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

        NotificationSystem.showToast('Broadcast Sent', `System notification sent to ${count} teachers and ${students.length} students!`, 'success');
    },

    clearOldNotifications() {
        if (!confirm('Delete notifications older than 30 days? This action cannot be undone.')) return;

        const notifications = Storage.get(STORAGE_KEYS.NOTIFICATIONS) || [];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const filtered = notifications.filter(n => new Date(n.timestamp) > thirtyDaysAgo);
        const removed = notifications.length - filtered.length;

        Storage.save(STORAGE_KEYS.NOTIFICATIONS, filtered);
        NotificationSystem.showToast('Cleanup Done', `Deleted ${removed} old notifications!`, 'success');
    },

    async handleRestore(input) {
        if (!input.files || !input.files[0]) return;
        if (!confirm('WARNING: This will overwrite ALL existing data. Are you sure?')) return;

        try {
            await Storage.importAllData(input.files[0]);
            NotificationSystem.showToast('Restore Success', 'Data restored successfully! The page will now reload.', 'success');
            setTimeout(() => window.location.reload(), 2000);
        } catch (error) {
            NotificationSystem.showToast('Restore Failed', error.message, 'error');
        }
    },

    checkBackupReminder() {
        const lastBackup = localStorage.getItem('sms_backup_last_date');
        const now = Date.now();
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

        if (!lastBackup || (now - parseInt(lastBackup)) > sevenDaysMs) {
            const daysSince = lastBackup ? Math.floor((now - parseInt(lastBackup)) / (24 * 60 * 60 * 1000)) : 'many';
            NotificationSystem.showToast(
                'Backup Reminder',
                `It has been ${daysSince} days since your last system backup.We recommend exporting your data soon.`,
                'warning'
            );
        }
    }
};

// Periodic backup check
if (Auth.isAuthenticated() && Auth.getCurrentUser().role === 'admin') {
    setTimeout(() => AdminModule.checkBackupReminder(), 5000);
}

