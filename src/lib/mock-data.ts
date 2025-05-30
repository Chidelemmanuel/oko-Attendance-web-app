import type { Student, AttendanceRecord, AttendanceStatus } from './constants';

export const MOCK_STUDENTS: Student[] = [
  {
    id: 'FPO/CS/001',
    name: 'Adaobi Nwosu',
    department: 'Computer Science',
    level: 'ND II',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'FPO/EE/002',
    name: 'Chinedu Okeke',
    department: 'Electrical Engineering',
    level: 'HND I',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'FPO/ME/003',
    name: 'Fatima Bello',
    department: 'Mechanical Engineering',
    level: 'ND I',
    avatarUrl: 'https://placehold.co/100x100.png',
  },
  {
    id: 'FPO/SLT/004',
    name: 'John Doe',
    department: 'Science Laboratory Technology',
    level: 'HND II',
  },
];

const today = new Date();
const yesterday = new Date(today);
yesterday.setDate(today.getDate() - 1);
const dayBeforeYesterday = new Date(today);
dayBeforeYesterday.setDate(today.getDate() - 2);


export const MOCK_ATTENDANCE: Record<string, AttendanceRecord[]> = {
  'FPO/CS/001': [
    {
      id: 'att1',
      date: today.toISOString(),
      courseCode: 'COM211',
      courseName: 'Data Structures',
      status: 'Present',
      verifiedLocation: true,
      locationScore: 0.95,
      remarks: 'On time',
    },
    {
      id: 'att2',
      date: yesterday.toISOString(),
      courseCode: 'COM211',
      courseName: 'Data Structures',
      status: 'Present',
      verifiedLocation: true,
      locationScore: 0.88,
    },
    {
      id: 'att3',
      date: dayBeforeYesterday.toISOString(),
      courseCode: 'GNS201',
      courseName: 'Use of English II',
      status: 'Absent',
    },
  ],
  'FPO/EE/002': [
    {
      id: 'att4',
      date: today.toISOString(),
      courseCode: 'EEC311',
      courseName: 'Circuit Theory II',
      status: 'Late',
      verifiedLocation: true,
      locationScore: 0.75,
      remarks: 'Arrived 15 mins late',
    },
    {
      id: 'att5',
      date: yesterday.toISOString(),
      courseCode: 'EEC311',
      courseName: 'Circuit Theory II',
      status: 'Present',
      verifiedLocation: false,
      locationScore: 0.20,
      remarks: 'Location mismatch, manual override by lecturer.',
    },
  ],
  'FPO/ME/003': [
     {
      id: 'att6',
      date: today.toISOString(),
      courseCode: 'MEC121',
      courseName: 'Technical Drawing',
      status: 'Excused',
      remarks: 'Sick leave approved',
    },
  ],
   'FPO/SLT/004': [
    // No attendance records for John Doe yet to show empty state
  ],
};

export const getStudentById = (id: string): Student | undefined =>
  MOCK_STUDENTS.find((student) => student.id === id);

export const getAttendanceByStudentId = (studentId: string): AttendanceRecord[] =>
  MOCK_ATTENDANCE[studentId] || [];

export const OVERALL_STATS = {
  totalStudents: MOCK_STUDENTS.length,
  averageAttendance: 78.5, // Percentage
  todayPresent: MOCK_STUDENTS.length - 2, // Example
  todayAbsent: 1, // Example
   flaggedLocations: 1, // Example
};

export const MOCK_COURSES = [
    { code: 'COM211', name: 'Data Structures' },
    { code: 'GNS201', name: 'Use of English II' },
    { code: 'EEC311', name: 'Circuit Theory II' },
    { code: 'MEC121', name: 'Technical Drawing' },
    { code: 'PHY101', name: 'General Physics I'},
];
