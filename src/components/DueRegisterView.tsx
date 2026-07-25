import React, { useState } from 'react';
import { ClassSection, FeeDemand, FeeType, SchoolInfo, Student } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  AlertCircle,
  CalendarCheck2,
  CheckCircle2,
  Clock,
  Filter,
  Search,
} from 'lucide-react';

interface DueRegisterViewProps {
  schoolInfo: SchoolInfo;
  classes: ClassSection[];
  students: Student[];
  feeTypes: FeeType[];
  feeDemands: FeeDemand[];
  onOpenCollectFee: (studentId: string) => void;
}

export const DueRegisterView: React.FC<DueRegisterViewProps> = ({
  schoolInfo,
  classes,
  students,
  feeTypes,
  feeDemands,
  onOpenCollectFee,
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNPAID' | 'PARTIAL' | 'OVERDUE' | 'PAID'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculate Summary
  const totalBilled = feeDemands.reduce((sum, d) => sum + d.netDue, 0);
  const totalPaid = feeDemands.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalPaid);
  const overdueCount = feeDemands.filter((d) => d.status === 'OVERDUE' || d.status === 'UNPAID').length;

  const filteredDemands = feeDemands.filter((demand) => {
    if (statusFilter !== 'ALL' && demand.status !== statusFilter) return false;

    const student = students.find((s) => s.id === demand.studentId);
    if (!student) return false;

    if (classFilter !== 'ALL' && student.classId !== classFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = student.fullName.toLowerCase().includes(q);
      const matchRoll = student.rollNo.toLowerCase().includes(q);
      const matchAdm = student.admissionNo.toLowerCase().includes(q);
      const matchType = demand.feeTypeName.toLowerCase().includes(q);
      const matchPeriod = demand.period.toLowerCase().includes(q);

      if (!matchName && !matchRoll && !matchAdm && !matchType && !matchPeriod) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <CalendarCheck2 className="w-6 h-6 text-emerald-400" />
            <span>Master Fee Demand & Due Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit log of all fee demands issued to students, status of payments, concessions, and pending balances.
          </p>
        </div>
      </div>

      {/* Metric Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Billed Demands</span>
          <span className="text-xl font-serif font-bold text-slate-100 mt-1 block">{formatCurrency(totalBilled, schoolInfo.currencySymbol)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Collected</span>
          <span className="text-xl font-serif font-bold text-emerald-400 mt-1 block">{formatCurrency(totalPaid, schoolInfo.currencySymbol)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Total Outstanding Due</span>
          <span className="text-xl font-serif font-bold text-rose-400 mt-1 block">{formatCurrency(totalOutstanding, schoolInfo.currencySymbol)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Pending Demands Count</span>
          <span className="text-xl font-serif font-bold text-amber-400 mt-1 block">{overdueCount} Items</span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Status Filter Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-800">
            {(['ALL', 'UNPAID', 'PARTIAL', 'OVERDUE', 'PAID'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  statusFilter === st ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className} - Sec {c.section}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search student, adm, fee head..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Due Demands Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Fee Head / Period</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Net Due</th>
                <th className="py-3 px-4 text-right">Paid</th>
                <th className="py-3 px-4 text-right">Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDemands.map((demand) => {
                const student = students.find((s) => s.id === demand.studentId);
                const cls = classes.find((c) => c.id === student?.classId);
                const balance = demand.netDue - demand.paidAmount;

                return (
                  <tr key={demand.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{student?.fullName || 'Unknown Student'}</div>
                      <div className="text-[11px] text-slate-400">
                        Adm: {student?.admissionNo} | Roll: {student?.rollNo}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {cls?.className || 'Class'} - {student?.section}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-100">{demand.feeTypeName}</div>
                      <div className="text-[11px] text-slate-400">Period: {demand.period}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {formatDate(demand.dueDate)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-200">
                      {formatCurrency(demand.netDue, schoolInfo.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                      {formatCurrency(demand.paidAmount, schoolInfo.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-right font-serif font-bold text-rose-400">
                      {formatCurrency(balance, schoolInfo.currencySymbol)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        demand.status === 'PAID'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : demand.status === 'PARTIAL'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                      }`}>
                        {demand.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {balance > 0 && (
                        <button
                          onClick={() => onOpenCollectFee(demand.studentId)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Collect
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
