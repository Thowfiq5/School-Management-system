/**
 * curriculum_data.js
 * Structured mapping of subjects for different school levels and grades.
 */

const SCHOOL_CURRICULUM = {
    'Pre-Primary': {
        'Pre-KG': ['Play Activities', 'Pre-Reading Skills', 'Pre-Number Concepts', 'Art & Craft', 'Music & Movement', 'Physical Education'],
        'LKG': ['English (Phonics)', 'Mathematics (Basic)', 'Environmental Studies (EVS)', 'Art & Craft', 'Music & Dance', 'Physical Education', 'Moral Science'],
        'UKG': ['English (Writing)', 'Mathematics (Numbers 1-100)', 'Environmental Studies (EVS)', 'General Knowledge', 'Computer Basics', 'Art & Craft', 'Music & Dance', 'Physical Education', 'Moral Science']
    },
    'Primary': {
        '1st': ['English', 'Mathematics', 'Environmental Studies (EVS)', 'Hindi', 'Computer Science', 'General Knowledge', 'Art & Craft', 'Music', 'Physical Education', 'Moral Science'],
        '2nd': ['English', 'Mathematics', 'Environmental Studies (EVS)', 'Hindi', 'Computer Science', 'General Knowledge', 'Art & Craft', 'Music', 'Physical Education', 'Moral Science'],
        '3rd': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'General Knowledge', 'Art & Craft', 'Music', 'Physical Education', 'Moral Science', 'Sanskrit'],
        '4th': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'General Knowledge', 'Art & Craft', 'Music', 'Physical Education', 'Moral Science', 'Sanskrit'],
        '5th': ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Computer Science', 'General Knowledge', 'Art & Craft', 'Music', 'Physical Education', 'Moral Science', 'Sanskrit']
    },
    'Middle': {
        '6th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit', 'French', 'Computer Science', 'General Knowledge', 'Art Education', 'Music/Dance', 'Physical Education', 'Moral Science'],
        '7th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit', 'French', 'Computer Science', 'General Knowledge', 'Art Education', 'Music/Dance', 'Physical Education', 'Moral Science'],
        '8th': ['English', 'Mathematics', 'Science', 'Social Science', 'Hindi', 'Sanskrit', 'French', 'Computer Science', 'General Knowledge', 'Art Education', 'Music/Dance', 'Physical Education', 'Moral Science']
    },
    'Secondary': {
        '9th': ['English Language & Literature', 'Mathematics', 'Science (Physics/Chemistry/Biology)', 'Social Science', 'Hindi', 'Computer Applications', 'Physical Education', 'Art Education'],
        '10th': ['English Language & Literature', 'Mathematics', 'Science (Physics/Chemistry/Biology)', 'Social Science', 'Hindi', 'Computer Applications', 'Physical Education', 'Art Education']
    },
    'Senior Secondary': {
        '11th Science (PCM)': ['Physics', 'Chemistry', 'Mathematics', 'English Core', 'Computer Science'],
        '11th Science (PCB)': ['Physics', 'Chemistry', 'Biology', 'English Core', 'Psychology'],
        '11th Science (PCMB)': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English Core', 'Physical Education'],
        '11th Commerce': ['Accountancy', 'Business Studies', 'Economics', 'English Core', 'Mathematics'],
        '11th Humanities': ['History', 'Political Science', 'Geography', 'Economics', 'English Core'],
        '12th Science (PCM)': ['Physics', 'Chemistry', 'Mathematics', 'English Core', 'Computer Science'],
        '12th Science (PCB)': ['Physics', 'Chemistry', 'Biology', 'English Core', 'Psychology'],
        '12th Science (PCMB)': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English Core', 'Physical Education'],
        '12th Commerce': ['Accountancy', 'Business Studies', 'Economics', 'English Core', 'Mathematics'],
        '12th Humanities': ['History', 'Political Science', 'Geography', 'Economics', 'English Core']
    }
};

// Helper to get subjects by grade name
function getSubjectsByGrade(gradeName) {
    const searchName = gradeName.trim();

    for (const level in SCHOOL_CURRICULUM) {
        if (SCHOOL_CURRICULUM[level][searchName]) {
            return SCHOOL_CURRICULUM[level][searchName];
        }
    }

    // Check for 11th/12th stream specific matches (loose matching)
    if (searchName.startsWith('11') || searchName.startsWith('12')) {
        for (const key in SCHOOL_CURRICULUM['Senior Secondary']) {
            if (key === searchName || key.startsWith(searchName)) return SCHOOL_CURRICULUM['Senior Secondary'][key];
        }
    }

    return ['English', 'Mathematics', 'Science', 'Social Studies', 'Hindi', 'Physical Education']; // Generic fallback
}
