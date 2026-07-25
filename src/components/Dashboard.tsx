import React from 'react';
import { motion } from 'motion/react';
import { ClassSection, Collection, FeeDemand, FeeType, SchoolInfo, Student } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
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
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  Clock,
  Coins,
  FileText,
  GraduationCap,
  Plus,
  Receipt,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  AlertCircle,
} from 'lucide-react';

interface DashboardProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  classes: ClassSection[];
  feeTypes: FeeType[];
  feeDemands: FeeDemand[];
  collections: Collection[];
  onOpenCollectFee: (studentId?: string) => void;
  onOpenAddStudent: () => void;
  onSelectTab: (tab: string) => void;
  onViewReceipt: (collection: Collection) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  schoolInfo,
  students,
  classes,
  feeTypes,
  feeDemands,
  collections,
  onOpenCollectFee,
  onOpenAddStudent,
  onSelectTab,
  onViewReceipt,
}) => {
  // Financial metrics
  const totalBilled = feeDemands.reduce((sum, d) => sum + d.netDue, 0);
  const totalCollected = collections.reduce((sum, c) => sum + c.totalAmountPaid, 0);
  const totalOutstanding = Math.max(0, totalBilled - totalCollected);
  const collectionEfficiency = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

  const totalActiveStudents = students.filter((s) => s.active).length;

  // Monthly trend chart data
  const monthMap: { [key: string]: { month: string; demand: number; collection: number } } = {};
  
  feeDemands.forEach((d) => {
    const key = d.period.startsWith('2026') ? d.period : '2026-04';
    if (!monthMap[key]) {
      monthMap[key] = { month: key, demand: 0, collection: 0 };
    }
    monthMap[key].demand += d.netDue;
  });

  collections.forEach((c) => {
    const monthKey = c.date.slice(0, 7);
    if (!monthMap[monthKey]) {
      monthMap[monthKey] = { month: monthKey, demand: 0, collection: 0 };
    }
    monthMap[monthKey].collection += c.totalAmountPaid;
  });

  const chartData = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month));

  // Payment Mode Distribution Pie Chart
  const modeCounts: { [key: string]: number } = {};
  collections.forEach((c) => {
    modeCounts[c.paymentMode] = (modeCounts[c.paymentMode] || 0) + c.totalAmountPaid;
  });

  const pieData = Object.entries(modeCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#6366f1', '#ec4899'];

  // Overdue students list snippet (Top 5)
  const overdueDemands = feeDemands.filter((d) => d.status === 'OVERDUE' || d.status === 'UNPAID');
  const overdueStudentIds = Array.from(new Set(overdueDemands.map((d) => d.studentId))).slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Hero Welcome & Quick Action Bar */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-2xl rounded-2xl p-6 border border-white/10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                School Dashboard
              </span>
              <span className="text-slate-400 text-xs">Academic Year {schoolInfo.academicYear}</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight mt-1">
              {schoolInfo.name} Management Portal
            </h2>
            <p className="text-slate-300 text-xs mt-1 max-w-2xl">
              Track real-time fee collections, student enrollments, overdue registers, and monthly reconciliation summaries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenCollectFee()}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer glow-effect"
            >
              <Receipt className="w-4 h-4" />
              <span>Collect Fee Receipt</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAddStudent}
              className="flex items-center gap-2 px-4 py-2.5 glass-button text-slate-100 font-semibold text-xs rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Student</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* KPI Key Metric Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        
        {/* Card 1: Total Collections */}
        <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Total Collections</span>
            <div className="w-9 h-9 bg-emerald-950/60 text-emerald-400 rounded-xl border border-emerald-800/50 flex items-center justify-center">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-serif font-bold text-white tracking-tight">
              {formatCurrency(totalCollected, schoolInfo.currencySymbol)}
            </div>
            <div className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{collections.length} Fee Receipts Issued</span>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Total Outstanding */}
        <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Outstanding Dues</span>
            <div className="w-9 h-9 bg-rose-950/60 text-rose-400 rounded-xl border border-rose-800/50 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-serif font-bold text-rose-400 tracking-tight">
              {formatCurrency(totalOutstanding, schoolInfo.currencySymbol)}
            </div>
            <div className="text-xs text-rose-400 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{feeDemands.filter((d) => d.status !== 'PAID').length} Pending Demands</span>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Collection Efficiency */}
        <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Collection Efficiency</span>
            <div className="w-9 h-9 bg-sky-950/60 text-sky-400 rounded-xl border border-sky-800/50 flex items-center justify-center">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-serif font-bold text-white tracking-tight">
              {collectionEfficiency}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, collectionEfficiency)}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                className="bg-emerald-400 h-2 rounded-full"
              ></motion.div>
            </div>
          </div>
        </motion.div>

        {/* Card 4: Active Students */}
        <motion.div variants={itemVariants} className="glass-panel p-5 rounded-2xl hover:bg-slate-800/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">Active Students</span>
            <div className="w-9 h-9 bg-indigo-950/60 text-indigo-400 rounded-xl border border-indigo-800/50 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-serif font-bold text-white tracking-tight">
              {totalActiveStudents}
            </div>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Across {classes.length} Classes & Sections</span>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Month-wise Demand vs Collection Bar Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-200">Monthly Demands vs Fee Collections</h3>
              <p className="text-xs text-slate-400">Comparing expected fee demand against actual collections</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTab('reports')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Report</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value), schoolInfo.currencySymbol), '']}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="demand" name="Total Demand" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="collection" name="Collected Amount" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Mode Distribution Pie */}
        <div className="glass-panel p-5 rounded-2xl">
          <h3 className="text-base font-serif font-bold text-slate-200 mb-1">Collection by Mode</h3>
          <p className="text-xs text-slate-400 mb-4">Cash, UPI, Cheque & Bank distribution</p>

          <div className="h-48 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => formatCurrency(Number(val), schoolInfo.currencySymbol)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No collections recorded yet.</div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-1.5 mt-2 text-xs border-t border-slate-800 pt-3">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="font-medium">{item.name}</span>
                </div>
                <span className="font-bold font-serif text-white">{formatCurrency(item.value, schoolInfo.currencySymbol)}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Tables Grid: Recent Receipts & Action Pending Overdues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Collection Receipts */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-200">Recent Collections</h3>
              <p className="text-xs text-slate-400">Latest fee receipts generated</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTab('collection-register')}
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900/80 text-slate-400 font-semibold border-b border-slate-800">
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {collections.slice(0, 5).map((col) => (
                  <tr key={col.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-200">{col.receiptNo}</td>
                    <td className="py-2.5 px-3 font-medium text-white">{col.studentName}</td>
                    <td className="py-2.5 px-3 text-slate-400">{col.className}-{col.section}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-400">{formatCurrency(col.totalAmountPaid, schoolInfo.currencySymbol)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onViewReceipt(col)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded text-[11px] transition cursor-pointer border border-slate-700/60"
                      >
                        Receipt
                      </motion.button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Priority Outstanding Reminders */}
        <div className="glass-panel rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-serif font-bold text-slate-200">Pending Fee Follow-ups</h3>
              <p className="text-xs text-slate-400">Students with unpaid or overdue demands</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectTab('due-register')}
              className="text-xs text-rose-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Due Register</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          <div className="space-y-3">
            {overdueStudentIds.map((stId) => {
              const student = students.find((s) => s.id === stId);
              if (!student) return null;

              const stDemands = feeDemands.filter((d) => d.studentId === stId && d.status !== 'PAID');
              const totalPending = stDemands.reduce((sum, d) => sum + (d.netDue - d.paidAmount), 0);
              const cls = classes.find((c) => c.id === student.classId);

              return (
                <div
                  key={stId}
                  className="flex items-center justify-between p-3 rounded-xl border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">{student.fullName}</span>
                      <span className="text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                        {cls?.className || 'Class'} - {student.section}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Father: {student.fatherName} | Ph: {student.phone}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Outstanding</span>
                      <span className="font-bold text-rose-400 text-sm">
                        {formatCurrency(totalPending, schoolInfo.currencySymbol)}
                      </span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onOpenCollectFee(student.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-sm transition cursor-pointer"
                    >
                      Collect
                    </motion.button>
                  </div>
                </div>
              );
            })}

            {overdueStudentIds.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                No outstanding dues! All students are up to date.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
