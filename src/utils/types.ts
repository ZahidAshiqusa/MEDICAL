export interface StaffMember {
  id: string;
  name: string;
  role: 'doctor' | 'sweeper' | 'dispensor' | 'ward_staff' | 'nurse' | 'admin';
  field?: string;
  phone?: string;
  joined: string;
}

export interface Appointment {
  tokenNumber: number;
  patientName: string;
  idCard?: string;
  age: number;
  phone: string;
  issue: string;
  doctor: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  field?: string;
  checkIn: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  patientName: string;
  issue: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export interface TokenCounter {
  nextToken: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type TimeFilter = 'day' | 'week' | 'month' | 'year';
