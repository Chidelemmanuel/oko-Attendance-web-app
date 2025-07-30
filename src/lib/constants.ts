import { LayoutDashboard, Users, ClipboardCheck, MapPin, Settings, CheckCircle2, XCircle, AlertCircle, Info, KeyRound, Briefcase } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: string[]; // For highlighting active link based on path segments
  roles?: ('student' | 'lecturer')[]; // Role-based access control
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['student', 'lecturer'],
  },
  {
    href: '/students',
    label: 'Students',
    icon: Users,
    roles: ['lecturer'], // Only lecturers can see the full student list
  },
  {
    href: '/tools/location-verifier',
    label: 'Submit Attendance',
    icon: ClipboardCheck,
    roles: ['student'],
    matchSegments: ['attendance', 'submit'], // Match /attendance/submit as well
  },
   {
    href: '/tools/location-verifier',
    label: 'Set Attendance Code',
    icon: KeyRound,
    roles: ['lecturer'],
    matchSegments: ['lecturer', 'set-code'], // Match /lecturer/set-code as well
  },
  {
    href: '/tools/location-verifier',
    label: 'Location Verifier',
    icon: MapPin,
    roles: ['student', 'lecturer'], 
  },
];

export type Student = {
  id: string;
  name: string;
  department: string;
  level: string;
  avatarUrl?: string;
};

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export type AttendanceRecord = {
  id: string;
  date: string; // ISO string
  courseCode: string;
  courseName: string;
  status: AttendanceStatus;
  verifiedLocation?: boolean;
  locationScore?: number; // 0-1
  remarks?: string;
};

export const ATTENDANCE_STATUS_ICON_MAP: Record<AttendanceStatus, LucideIcon | null> = {
  Present: CheckCircle2,
  Absent: XCircle,
  Late: AlertCircle,
  Excused: Info,
};
