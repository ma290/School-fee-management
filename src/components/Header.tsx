import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ClassSection, Collection, FeeDemand, SchoolInfo, Student } from '../types';
import { formatCurrency } from '../utils/formatters';
import { resetToDemoData } from '../utils/storage';
import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  Plus,
  Receipt,
  RotateCcw,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

interface HeaderProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  collections: Collection[];
  feeDemands: FeeDemand[];
  classes: ClassSection[];
  onOpenAddStudent: () => void;
  onOpenCollectFee: (studentId?: string) => void;
  onSelectTab: (tab: string) => void;
  onSearchSelectStudent: (student: Student) => void;
}

export const Header: React.FC<HeaderProps> = ({
  schoolInfo,
  students,
  collections,
  feeDemands,
  onOpenAddStudent,
  onOpenCollectFee,
  onSelectTab,
  onSearchSelectStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Stats
  const totalStudents = students.filter((s) => s.active).length;

  const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g., "2026-07"
  const monthCollections = collections.reduce((acc, c) => acc + c.totalAmountPaid, 0);

  const totalOutstanding = feeDemands.reduce(
    (acc, d) => acc + Math.max(0, d.netDue - d.paidAmount),
    0
  );

  const filteredStudents = searchQuery.trim()
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.phone.includes(searchQuery)
      )
    : [];

  return (
    <header className="bg-slate-900/40 backdrop-blur-2xl text-white border-b border-white/10 sticky top-0 z-40 shadow-2xl print:hidden">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-4">
          
          {/* School Brand */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
              <Building2 className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-serif font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  {schoolInfo.name}
                </h1>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  AY {schoolInfo.academicYear}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{schoolInfo.tagline}</p>
            </div>
          </motion.div>

          {/* Quick Search Student */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student, roll no, adm no..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full bg-white/5 backdrop-blur-md text-sm text-slate-100 pl-10 pr-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition placeholder:text-slate-400"
              />
            </div>

            {/* Quick Search Dropdown */}
            {showSearchResults && filteredStudents.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full left-0 right-0 mt-2 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-64 overflow-y-auto divide-y divide-white/5">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => {
                      onSearchSelectStudent(student);
                      setSearchQuery('');
                      setShowSearchResults(false);
                    }}
                    className="p-3 hover:bg-slate-800 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{student.fullName}</div>
                      <div className="text-xs text-slate-400">
                        Adm: {student.admissionNo} | Roll: {student.rollNo} | Sec: {student.section}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCollectFee(student.id);
                        setSearchQuery('');
                        setShowSearchResults(false);
                      }}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg shadow cursor-pointer transition"
                    >
                      Collect Fee
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
            {showSearchResults && searchQuery.trim() && filteredStudents.length === 0 && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 text-xs text-slate-400 text-center z-50">
                No matching student found.
              </motion.div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenAddStudent}
              className="flex items-center gap-1.5 px-3.5 py-2 glass-button text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Student</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenCollectFee()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer glow-effect"
            >
              <Receipt className="w-4 h-4" />
              <span>Collect Fee</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (confirm('Reset system data to default sample demo state? All local edits will be replaced with fresh demo records.')) {
                  resetToDemoData();
                }
              }}
              title="Reset Demo Data"
              className="p-2 text-slate-400 glass-button rounded-xl transition cursor-pointer flex items-center justify-center h-[32px] w-[32px]"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </motion.div>

        </div>

        {/* Quick Summary Pill Bar */}
        <div className="grid grid-cols-3 gap-3 py-3 border-t border-white/5 text-xs">
          <div
            onClick={() => onSelectTab('students')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5 cursor-pointer transition-all duration-300"
          >
            <Users className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Active Students:</span>
            <span className="font-bold text-slate-100">{totalStudents}</span>
          </div>

          <div
            onClick={() => onSelectTab('collection-register')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5 cursor-pointer transition-all duration-300"
          >
            <CircleDollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-slate-400">Total Collected:</span>
            <span className="font-bold text-emerald-400">{formatCurrency(monthCollections, schoolInfo.currencySymbol)}</span>
          </div>

          <div
            onClick={() => onSelectTab('due-register')}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/5 cursor-pointer transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="text-slate-400">Total Outstanding:</span>
            <span className="font-bold text-rose-400">{formatCurrency(totalOutstanding, schoolInfo.currencySymbol)}</span>
          </div>
        </div>

      </div>
    </header>
  );
};
