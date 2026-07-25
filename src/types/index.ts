export type FeeFrequency = 'Monthly' | 'Quarterly' | 'Bi-Annually' | 'Annually' | 'One-Time';

export type PaymentMode = 'Cash' | 'UPI/Online' | 'Cheque' | 'Bank Transfer' | 'Card';

export type DueStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface SchoolInfo {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  academicYear: string;
  receiptPrefix: string;
  currencySymbol: string;
}

export interface ClassSection {
  id: string;
  className: string; // e.g. "Class 10"
  section: string;   // e.g. "A"
  classTeacher?: string;
  roomNo?: string;
  capacity?: number;
}

export interface FeeType {
  id: string;
  name: string; // e.g., "Tuition Fee", "Exam Fee", "Transport Fee"
  frequency: FeeFrequency;
  applicableClassIds: string[]; // ['ALL'] or specific class IDs
  isMandatory: boolean;
  defaultAmount: number;
  dueDayOfMonth: number; // e.g. 10th
  description?: string;
}

export interface Student {
  id: string;
  admissionNo: string;
  rollNo: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  phone: string;
  email: string;
  address: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  classId: string;
  section: string;
  academicYear: string;
  concessionPercent: number; // e.g., 0 for no discount, 10 for 10% concession
  active: boolean;
  admissionDate: string;
}

export interface FeeDemand {
  id: string;
  studentId: string;
  feeTypeId: string;
  feeTypeName: string;
  period: string; // e.g. "2026-04", "2026-Q1", "2026-2027"
  dueDate: string;
  amount: number;
  concessionAmount: number;
  netDue: number;
  paidAmount: number;
  status: DueStatus;
  createdAt: string;
}

export interface ReceiptItem {
  feeDemandId: string;
  feeTypeName: string;
  period: string;
  amountPaid: number;
}

export interface Collection {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  rollNo: string;
  className: string;
  section: string;
  date: string; // YYYY-MM-DD
  totalAmountPaid: number;
  paymentMode: PaymentMode;
  referenceNo?: string;
  notes?: string;
  collectedBy: string;
  items: ReceiptItem[];
}

export interface MonthlyReconciliationData {
  month: string; // e.g., "2026-04"
  targetDemand: number;
  totalCollected: number;
  cashCollected: number;
  upiCollected: number;
  chequeCollected: number;
  bankCollected: number;
  cardCollected: number;
  outstandingBalance: number;
  concessionsGranted: number;
  reconciliationStatus: 'Balanced' | 'Pending Review' | 'Discrepancy';
}
