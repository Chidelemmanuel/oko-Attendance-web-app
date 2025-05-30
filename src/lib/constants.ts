import { LayoutDashboard, Users, ClipboardCheck, MapPin, Settings, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchSegments?: string[]; // For highlighting active link based on path segments
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    matchSegments: [''], // Matches root path
  },
  {
    href: '/students',
    label: 'Students',
    icon: Users,
    matchSegments: ['students'],
  },
  {
    href: '/attendance/submit',
    label: 'Submit Attendance',
    icon: ClipboardCheck,
    matchSegments: ['attendance', 'submit'],
  },
  {
    href: '/tools/location-verifier',
    label: 'Location Verifier',
    icon: MapPin,
    matchSegments: ['tools', 'location-verifier'],
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
