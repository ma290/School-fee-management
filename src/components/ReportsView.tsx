import React, { useState } from 'react';
import { ClassSection, Collection, FeeDemand, FeeType, MonthlyReconciliationData, SchoolInfo, Student } from '../types';
import { exportToCSV, formatCurrency, formatDate } from '../utils/formatters';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  Download,
  FileSpreadsheet,
  GraduationCap,
  MessageSquare,
  PhoneCall,
  PieChart as PieIcon,
  RefreshCw,
  Send,
  Users,
} from 'lucide-react';

interface ReportsViewProps {
  schoolInfo: SchoolInfo;
  classes: ClassSection[];
  students: Student[];
  feeTypes: FeeType[];
  feeDemands: FeeDemand[];
  collections: Collection[];
  onOpenCollectFee: (studentId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  schoolInfo,
  classes,
  students,
  feeTypes,
  feeDemands,
  collections,
  onOpenCollectFee,
}) => {
  const [activeReportSubtab, setActiveReportSubtab] = useState<
    'class-wise' | 'student-wise' | 'month-wise' | 'collection' | 'outstanding' | 'reconciliation'
  >('class-wise');

  // WhatsApp Reminder Modal State
  const [reminderStudent, setReminderStudent] = useState<Student | null>(null);

  // 1. CLASS-WISE REPORT DATA
  const classWiseData = classes.map((cls) => {
    const classStudents = students.filter((s) => s.classId === cls.id && s.active);
    const classStudentIds = classStudents.map((s) => s.id);

    const demands = feeDemands.filter((d) => classStudentIds.includes(d.studentId));
    const totalDemand = demands.reduce((sum, d) => sum + d.netDue, 0);
    const totalCollected = demands.reduce((sum, d) => sum + d.paidAmount, 0);
    const totalOutstanding = Math.max(0, totalDemand - totalCollected);
    const efficiencyPct = totalDemand > 0 ? Math.round((totalCollected / totalDemand) * 100) : 100;

    return {
      id: cls.id,
      className: `${cls.className} - Sec ${cls.section}`,
      studentCount: classStudents.length,
      totalDemand,
      totalCollected,
      totalOutstanding,
      efficiencyPct,
    };
  });

  // 2. STUDENT-WISE REPORT DATA
  const studentWiseData = students.map((st) => {
    const cls = classes.find((c) => c.id === st.classId);
    const stDemands = feeDemands.filter((d) => d.studentId === st.id);
    const totalBilled = stDemands.reduce((sum, d) => sum + d.netDue, 0);
    const totalPaid = stDemands.reduce((sum, d) => sum + d.paidAmount, 0);
    const balance = Math.max(0, totalBilled - totalPaid);

    const stCollections = collections.filter((c) => c.studentId === st.id);
    const lastPaymentDate = stCollections.length > 0
      ? stCollections.sort((a, b) => b.date.localeCompare(a.date))[0].date
      : 'No Payment Yet';

    return {
      student: st,
      className: `${cls?.className || 'Class'} - ${st.section}`,
      totalBilled,
      totalPaid,
      balance,
      lastPaymentDate,
    };
  });

  // 3. MONTH-WISE REPORT DATA
  const monthWiseMap: { [key: string]: { month: string; demand: number; collected: number } } = {};
  
  feeDemands.forEach((d) => {
    const key = d.period;
    if (!monthWiseMap[key]) monthWiseMap[key] = { month: key, demand: 0, collected: 0 };
    monthWiseMap[key].demand += d.netDue;
    monthWiseMap[key].collected += d.paidAmount;
  });

  const monthWiseList = Object.values(monthWiseMap).sort((a, b) => a.month.localeCompare(b.month));

  // 4. COLLECTION REPORT DATA
  const modeTotals: { [mode: string]: number } = { Cash: 0, 'UPI/Online': 0, Cheque: 0, 'Bank Transfer': 0, Card: 0 };
  collections.forEach((c) => {
    modeTotals[c.paymentMode] = (modeTotals[c.paymentMode] || 0) + c.totalAmountPaid;
  });

  // 5. OUTSTANDING REPORT DATA
  const outstandingStudents = studentWiseData.filter((item) => item.balance > 0);

  // 6. MONTHLY RECONCILIATION DATA
  const reconciliationData: MonthlyReconciliationData[] = monthWiseList.map((m) => {
    const monthCols = collections.filter((c) => c.date.startsWith(m.month.slice(0, 7)));

    const cashCollected = monthCols.filter((c) => c.paymentMode === 'Cash').reduce((s, c) => s + c.totalAmountPaid, 0);
    const upiCollected = monthCols.filter((c) => c.paymentMode === 'UPI/Online').reduce((s, c) => s + c.totalAmountPaid, 0);
    const chequeCollected = monthCols.filter((c) => c.paymentMode === 'Cheque').reduce((s, c) => s + c.totalAmountPaid, 0);
    const bankCollected = monthCols.filter((c) => c.paymentMode === 'Bank Transfer').reduce((s, c) => s + c.totalAmountPaid, 0);
    const cardCollected = monthCols.filter((c) => c.paymentMode === 'Card').reduce((s, c) => s + c.totalAmountPaid, 0);

    const totalCollected = cashCollected + upiCollected + chequeCollected + bankCollected + cardCollected;
    const targetDemand = m.demand;
    const outstandingBalance = Math.max(0, targetDemand - totalCollected);

    return {
      month: m.month,
      targetDemand,
      totalCollected,
      cashCollected,
      upiCollected,
      chequeCollected,
      bankCollected,
      cardCollected,
      outstandingBalance,
      concessionsGranted: 0,
      reconciliationStatus: outstandingBalance === 0 ? 'Balanced' : 'Pending Review',
    };
  });

  const handleExportReport = (title: string, rows: (string | number)[][]) => {
    exportToCSV(`${title}_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            <span>Financial Reports & Monthly Reconciliation</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Detailed class-wise, student-wise, month-wise collection breakdowns, pending fee registers, and bank reconciliation.
          </p>
        </div>
      </div>

      {/* Sub-Tab Navigation Bar */}
      <div className="glass-panel text-white p-2 rounded-2xl border border-slate-800 flex flex-wrap gap-1 text-xs font-semibold overflow-x-auto shadow-lg">
        {[
          { id: 'class-wise', label: 'Class-Wise Report', icon: GraduationCap },
          { id: 'student-wise', label: 'Student-Wise Report', icon: Users },
          { id: 'month-wise', label: 'Month-Wise Report', icon: Calendar },
          { id: 'collection', label: 'Collection Report', icon: CircleDollarSign },
          { id: 'outstanding', label: 'Outstanding Report', icon: AlertCircle },
          { id: 'reconciliation', label: 'Monthly Reconciliation', icon: RefreshCw },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReportSubtab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveReportSubtab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
                isActive ? 'bg-emerald-600 text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLASS-WISE REPORT */}
      {activeReportSubtab === 'class-wise' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() =>
                handleExportReport('Class_Wise_Fee_Report', [
                  ['Class & Sec', 'Students', 'Total Demand', 'Total Collected', 'Outstanding', 'Efficiency %'],
                  ...classWiseData.map((c) => [c.className, c.studentCount, c.totalDemand, c.totalCollected, c.totalOutstanding, `${c.efficiencyPct}%`]),
                ])
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Class Report (CSV)</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-serif font-bold text-slate-100 mb-4">Class-Wise Fee Collection Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                    <th className="py-2.5 px-3">Class & Section</th>
                    <th className="py-2.5 px-3">Students</th>
                    <th className="py-2.5 px-3 text-right">Total Demand</th>
                    <th className="py-2.5 px-3 text-right">Total Collected</th>
                    <th className="py-2.5 px-3 text-right">Outstanding</th>
                    <th className="py-2.5 px-3 text-center">Efficiency %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {classWiseData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3 font-bold text-white">{row.className}</td>
                      <td className="py-3 px-3 text-slate-400">{row.studentCount} Students</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-200">{formatCurrency(row.totalDemand, schoolInfo.currencySymbol)}</td>
                      <td className="py-3 px-3 text-right font-serif font-bold text-emerald-400">{formatCurrency(row.totalCollected, schoolInfo.currencySymbol)}</td>
                      <td className="py-3 px-3 text-right font-serif font-bold text-rose-400">{formatCurrency(row.totalOutstanding, schoolInfo.currencySymbol)}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          row.efficiencyPct >= 80 ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60' : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        }`}>
                          {row.efficiencyPct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENT-WISE REPORT */}
      {activeReportSubtab === 'student-wise' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() =>
                handleExportReport('Student_Wise_Fee_Report', [
                  ['Student Name', 'Admission No', 'Roll No', 'Class', 'Total Billed', 'Total Paid', 'Outstanding Balance', 'Last Payment'],
                  ...studentWiseData.map((item) => [
                    item.student.fullName,
                    item.student.admissionNo,
                    item.student.rollNo,
                    item.className,
                    item.totalBilled,
                    item.totalPaid,
                    item.balance,
                    item.lastPaymentDate,
                  ]),
                ])
              }
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Student Report (CSV)</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4 text-right">Total Billed</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right">Outstanding Balance</th>
                  <th className="py-3 px-4">Last Payment Date</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {studentWiseData.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.student.fullName}</div>
                      <div className="text-[11px] text-slate-400">Adm: {item.student.admissionNo}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">{item.className}</td>
                    <td className="py-3 px-4 text-right font-medium text-slate-200">{formatCurrency(item.totalBilled, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-serif font-bold">{formatCurrency(item.totalPaid, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-4 text-right text-rose-400 font-serif font-bold">{formatCurrency(item.balance, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{item.lastPaymentDate}</td>
                    <td className="py-3 px-4 text-center">
                      {item.balance > 0 && (
                        <button
                          onClick={() => onOpenCollectFee(item.student.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] cursor-pointer"
                        >
                          Collect
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MONTH-WISE REPORT */}
      {activeReportSubtab === 'month-wise' && (
        <div className="glass-panel rounded-2xl p-5 space-y-6">
          <h3 className="text-sm font-serif font-bold text-slate-100">Month-Wise Fee Collection Summary</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="py-2.5 px-3">Period / Month</th>
                  <th className="py-2.5 px-3 text-right">Target Demand</th>
                  <th className="py-2.5 px-3 text-right">Actual Collected</th>
                  <th className="py-2.5 px-3 text-right">Pending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {monthWiseList.map((m) => (
                  <tr key={m.month} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white">{m.month}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-200">{formatCurrency(m.demand, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-emerald-400">{formatCurrency(m.collected, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-rose-400">{formatCurrency(Math.max(0, m.demand - m.collected), schoolInfo.currencySymbol)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: COLLECTION REPORT */}
      {activeReportSubtab === 'collection' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-serif font-bold text-slate-100 mb-4">Payment Mode Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(modeTotals).map(([mode, amt]) => (
                <div key={mode} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <span className="font-bold text-slate-200 text-xs">{mode}</span>
                  <span className="font-serif font-bold text-emerald-400 text-sm">{formatCurrency(amt, schoolInfo.currencySymbol)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: OUTSTANDING REPORT */}
      {activeReportSubtab === 'outstanding' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-serif font-bold text-slate-100">Overdue Students & Reminder Counter</h3>
            <button
              onClick={() =>
                handleExportReport('Outstanding_Defaulter_List', [
                  ['Student Name', 'Admission No', 'Roll No', 'Class', 'Father Name', 'Phone', 'Pending Outstanding'],
                  ...outstandingStudents.map((o) => [
                    o.student.fullName,
                    o.student.admissionNo,
                    o.student.rollNo,
                    o.className,
                    o.student.fatherName,
                    o.student.phone,
                    o.balance,
                  ]),
                ])
              }
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Defaulter List</span>
            </button>
          </div>

          <div className="glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Father Name & Phone</th>
                  <th className="py-3 px-4 text-right">Outstanding Amount</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {outstandingStudents.map((item) => (
                  <tr key={item.student.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{item.student.fullName}</div>
                      <div className="text-[11px] text-slate-400">Adm: {item.student.admissionNo}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">{item.className}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-200">{item.student.fatherName}</div>
                      <div className="text-[11px] text-slate-400">{item.student.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-rose-400 text-sm">
                      {formatCurrency(item.balance, schoolInfo.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setReminderStudent(item.student)}
                          className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded text-[11px] cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <MessageSquare className="w-3 h-3" /> Reminder
                        </button>
                        <button
                          onClick={() => onOpenCollectFee(item.student.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-[11px] cursor-pointer shadow-xs"
                        >
                          Collect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: MONTHLY RECONCILIATION */}
      {activeReportSubtab === 'reconciliation' && (
        <div className="glass-panel rounded-2xl p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-100">Monthly Financial Reconciliation Register</h3>
              <p className="text-xs text-slate-400">Reconciling expected demands vs cash collections & bank deposits</p>
            </div>
            <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
              Audit Balanced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                  <th className="py-2.5 px-3">Month</th>
                  <th className="py-2.5 px-3 text-right">Target Demand</th>
                  <th className="py-2.5 px-3 text-right">Cash</th>
                  <th className="py-2.5 px-3 text-right">UPI / Online</th>
                  <th className="py-2.5 px-3 text-right">Cheque / Bank</th>
                  <th className="py-2.5 px-3 text-right">Total Collected</th>
                  <th className="py-2.5 px-3 text-right">Outstanding Roll-over</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {reconciliationData.map((rec) => (
                  <tr key={rec.month} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3 font-bold text-white">{rec.month}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-200">{formatCurrency(rec.targetDemand, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right text-slate-300">{formatCurrency(rec.cashCollected, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right text-sky-400 font-medium">{formatCurrency(rec.upiCollected, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right text-amber-400 font-medium">{formatCurrency(rec.chequeCollected + rec.bankCollected, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-emerald-400">{formatCurrency(rec.totalCollected, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-right font-serif font-bold text-rose-400">{formatCurrency(rec.outstandingBalance, schoolInfo.currencySymbol)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded">
                        {rec.reconciliationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHATSAPP REMINDER TEMPLATE MODAL */}
      {reminderStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl shadow-2xl border-white/10 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white">
              <h3 className="font-serif font-bold text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Fee Reminder Notice Generator</span>
              </h3>
              <button onClick={() => setReminderStudent(null)} className="text-slate-400 hover:text-white cursor-pointer">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300">
                Copy or click to send automated WhatsApp fee notice to parent <b className="text-white">{reminderStudent.fatherName}</b> ({reminderStudent.phone}):
              </p>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl font-mono text-[11px] space-y-2 text-slate-200">
                <p>Dear Parent,</p>
                <p>
                  Greetings from {schoolInfo.name}. This is a gentle reminder regarding pending fee dues for your ward <b className="text-emerald-400">{reminderStudent.fullName}</b> (Roll No: {reminderStudent.rollNo}, Admission No: {reminderStudent.admissionNo}).
                </p>
                <p>Please clear the pending fee at the earliest to ensure uninterrupted academic services.</p>
                <p>Thank you,<br />Accounts Dept, {schoolInfo.name}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setReminderStudent(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <a
                  href={`https://wa.me/91${reminderStudent.phone}?text=${encodeURIComponent(
                    `Dear Parent, Greetings from ${schoolInfo.name}. Gentle reminder regarding pending fee dues for ${reminderStudent.fullName} (Adm No: ${reminderStudent.admissionNo}). Thank you.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Open in WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
