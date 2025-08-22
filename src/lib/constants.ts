import { LayoutDashboard, Users, ClipboardCheck, MapPin, Settings, CheckCircle2, XCircle, AlertCircle, Info, KeyRound, Briefcase, Shield } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: string[]; // For highlighting active link based on path segments
  roles?: ('student' | 'lecturer' | 'admin')[]; // Role-based access control
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['student', 'lecturer'],
  },
  {
    href: '/admin/dashboard',
    label: 'Admin Dashboard',
    icon: Shield,
    roles: ['admin'],
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: Users,
    roles: ['admin'],
  },
  {
    href: '/admin/courses',
    label: 'Course Management',
    icon: Briefcase,
    roles: ['admin'],
  },
  {
    href: '/students',
    label: 'Students',
    icon: Users,
    roles: ['lecturer'], // Only lecturers can see the full student list
  },
  {
    href: '/attendance/submit',
    label: 'Submit Attendance',
    icon: ClipboardCheck,
    roles: ['student'],
  },
   {
    href: '/lecturer/set-code',
    label: 'Set Attendance Code',
    icon: KeyRound,
    roles: ['lecturer'],
  },
  {
    href: '/tools/location-verifier',
    label: 'Location Verifier',
    icon: MapPin,
    roles: ['student'],
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
