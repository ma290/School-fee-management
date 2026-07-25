import React, { useState } from 'react';
import { ClassSection, Collection, FeeDemand, SchoolInfo, Student } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  CheckCircle,
  Clock,
  Edit2,
  Eye,
  Filter,
  GraduationCap,
  Plus,
  Receipt,
  Search,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

interface StudentsViewProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  classes: ClassSection[];
  feeDemands: FeeDemand[];
  collections: Collection[];
  onSaveStudent: (student: Student) => void;
  onOpenCollectFee: (studentId: string) => void;
  onViewReceipt: (collection: Collection) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  schoolInfo,
  students,
  classes,
  feeDemands,
  collections,
  onSaveStudent,
  onOpenCollectFee,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    fullName: '',
    rollNo: '',
    admissionNo: '',
    fatherName: '',
    motherName: '',
    phone: '',
    email: '',
    address: '',
    gender: 'Male',
    dob: '2015-01-01',
    classId: classes[0]?.id || '',
    section: 'A',
    academicYear: schoolInfo.academicYear,
    concessionPercent: 0,
    active: true,
    admissionDate: new Date().toISOString().slice(0, 10),
  });

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setFormData({
      fullName: '',
      rollNo: (students.length + 101).toString(),
      admissionNo: `ADM-2026-${(students.length + 1).toString().padStart(3, '0')}`,
      fatherName: '',
      motherName: '',
      phone: '',
      email: '',
      address: '',
      gender: 'Male',
      dob: '2015-01-01',
      classId: classes[0]?.id || '',
      section: 'A',
      academicYear: schoolInfo.academicYear,
      concessionPercent: 0,
      active: true,
      admissionDate: new Date().toISOString().slice(0, 10),
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (st: Student) => {
    setEditingStudent(st);
    setFormData({ ...st });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.classId) {
      alert('Please fill student name and select class.');
      return;
    }

    const newStudent: Student = {
      id: editingStudent ? editingStudent.id : `st_${Date.now()}`,
      admissionNo: formData.admissionNo || `ADM-${Date.now()}`,
      rollNo: formData.rollNo || '1',
      fullName: formData.fullName || '',
      fatherName: formData.fatherName || '',
      motherName: formData.motherName || '',
      phone: formData.phone || '',
      email: formData.email || '',
      address: formData.address || '',
      gender: (formData.gender as 'Male' | 'Female' | 'Other') || 'Male',
      dob: formData.dob || '2015-01-01',
      classId: formData.classId || classes[0]?.id || '',
      section: formData.section || 'A',
      academicYear: formData.academicYear || schoolInfo.academicYear,
      concessionPercent: Number(formData.concessionPercent || 0),
      active: formData.active ?? true,
      admissionDate: formData.admissionDate || new Date().toISOString().slice(0, 10),
    };

    onSaveStudent(newStudent);
    setIsAddModalOpen(false);
  };

  // Filter students
  const filteredStudents = students.filter((s) => {
    if (activeTabFilter === 'ACTIVE' && !s.active) return false;
    if (activeTabFilter === 'INACTIVE' && s.active) return false;
    if (selectedClassFilter !== 'ALL' && s.classId !== selectedClassFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.fatherName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header & Search Bar */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>Student Directory & Fee Allocation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage student admissions, allocate class & sections, view month/qtr/annual due ledger, and update details.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {/* Class Filter */}
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.className} - Sec {c.section}
              </option>
            ))}
          </select>

          {/* Active Status Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-800">
            {(['ACTIVE', 'ALL', 'INACTIVE'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTabFilter(tab)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  activeTabFilter === tab ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search student, adm, roll, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Student List Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Adm No / Roll</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class & Sec</th>
                <th className="py-3 px-4">Parent Details</th>
                <th className="py-3 px-4">Concession</th>
                <th className="py-3 px-4 text-right">Fee Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredStudents.map((st) => {
                const cls = classes.find((c) => c.id === st.classId);
                const stDemands = feeDemands.filter((d) => d.studentId === st.id);
                const pendingSum = stDemands.reduce((sum, d) => sum + (d.netDue - d.paidAmount), 0);

                return (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono">
                      <span className="font-bold text-slate-100 block">{st.admissionNo}</span>
                      <span className="text-[11px] text-slate-400">Roll: {st.rollNo}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{st.fullName}</div>
                      <div className="text-[11px] text-slate-400">{st.gender} | DOB: {st.dob}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-800 border border-slate-700 text-slate-200 font-semibold px-2 py-0.5 rounded-md">
                        {cls?.className || 'Class'} - {st.section}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-medium">F: {st.fatherName}</div>
                      <div className="text-[11px] text-slate-400">Ph: {st.phone}</div>
                    </td>
                    <td className="py-3 px-4">
                      {st.concessionPercent > 0 ? (
                        <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                          {st.concessionPercent}% Off
                        </span>
                      ) : (
                        <span className="text-slate-500">Regular</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {pendingSum > 0 ? (
                        <div>
                          <span className="font-bold text-rose-400 block font-serif">
                            {formatCurrency(pendingSum, schoolInfo.currencySymbol)}
                          </span>
                          <span className="text-[10px] text-rose-400 font-medium">Pending Dues</span>
                        </div>
                      ) : (
                        <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Clear
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setViewingStudent(st)}
                          title="View Student Ledger"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(st)}
                          title="Edit Student"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenCollectFee(st.id)}
                          title="Collect Fee"
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-[11px] transition cursor-pointer shadow-xs"
                        >
                          Collect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-panel rounded-2xl shadow-2xl border-white/10 w-full max-w-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>{editingStudent ? 'Edit Student Details' : 'Add New Student Record'}</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Full Student Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admission Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ADM-2026-001"
                    value={formData.admissionNo}
                    onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 101"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Allocate Class & Section *</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 font-medium"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.className} - Section {c.section}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Father Name</label>
                  <input
                    type="text"
                    placeholder="Father / Guardian Name"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mother Name</label>
                  <input
                    type="text"
                    placeholder="Mother Name"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Parent Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 9811223344"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fee Concession (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0 for none, 10 for 10% discount"
                    value={formData.concessionPercent}
                    onChange={(e) => setFormData({ ...formData, concessionPercent: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  placeholder="Full home address..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Student Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT PROFILE & LEDGER DRAWER */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-y-auto">
            
            {/* Drawer Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase">Student Fee Ledger</span>
                <h3 className="text-xl font-bold">{viewingStudent.fullName}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Adm: {viewingStudent.admissionNo} | Roll: {viewingStudent.rollNo} | Sec: {viewingStudent.section}
                </p>
              </div>
              <button onClick={() => setViewingStudent(null)} className="text-slate-400 hover:text-white cursor-pointer p-2">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 text-xs flex-1 overflow-y-auto">
              
              {/* Profile Details Grid */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div><span className="text-slate-400 block">Father Name:</span> <b>{viewingStudent.fatherName}</b></div>
                <div><span className="text-slate-400 block">Phone:</span> <b>{viewingStudent.phone}</b></div>
                <div><span className="text-slate-400 block">Gender / DOB:</span> <b>{viewingStudent.gender} ({viewingStudent.dob})</b></div>
                <div><span className="text-slate-400 block">Concession:</span> <b className="text-emerald-700">{viewingStudent.concessionPercent}% Discount</b></div>
              </div>

              {/* Fee Demands Breakdown */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">Month / Qtr / Annual Fee Demands</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold border-b">
                        <th className="py-2 px-3">Fee Head</th>
                        <th className="py-2 px-3">Period</th>
                        <th className="py-2 px-3 text-right">Net Due</th>
                        <th className="py-2 px-3 text-right">Paid</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeDemands.filter((d) => d.studentId === viewingStudent.id).map((demand) => (
                        <tr key={demand.id}>
                          <td className="py-2 px-3 font-semibold text-slate-800">{demand.feeTypeName}</td>
                          <td className="py-2 px-3 text-slate-600">{demand.period}</td>
                          <td className="py-2 px-3 text-right font-medium">{formatCurrency(demand.netDue, schoolInfo.currencySymbol)}</td>
                          <td className="py-2 px-3 text-right text-emerald-700 font-bold">{formatCurrency(demand.paidAmount, schoolInfo.currencySymbol)}</td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              demand.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {demand.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment History Receipts */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-2">Receipt History</h4>
                <div className="space-y-2">
                  {collections.filter((c) => c.studentId === viewingStudent.id).map((col) => (
                    <div key={col.id} className="p-3 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-slate-900">{col.receiptNo}</div>
                        <div className="text-[11px] text-slate-500">{formatDate(col.date)} via {col.paymentMode}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-emerald-700 text-sm">
                          {formatCurrency(col.totalAmountPaid, schoolInfo.currencySymbol)}
                        </span>
                        <button
                          onClick={() => onViewReceipt(col)}
                          className="px-2.5 py-1 bg-slate-800 text-white text-[10px] font-semibold rounded-lg cursor-pointer"
                        >
                          Print Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  const stId = viewingStudent.id;
                  setViewingStudent(null);
                  onOpenCollectFee(stId);
                }}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                Collect Pending Fee
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
