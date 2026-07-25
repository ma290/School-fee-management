import React, { useState, useEffect } from 'react';
import { ClassSection, Collection, FeeDemand, PaymentMode, SchoolInfo, Student } from '../types';
import { formatCurrency, formatDate, generateReceiptNo } from '../utils/formatters';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Printer,
  Receipt,
  Search,
  User,
} from 'lucide-react';

interface CollectFeeViewProps {
  schoolInfo: SchoolInfo;
  students: Student[];
  classes: ClassSection[];
  feeDemands: FeeDemand[];
  collections: Collection[];
  initialStudentId?: string;
  onSaveCollection: (collection: Collection, updatedDemands: FeeDemand[]) => void;
  onViewReceipt: (collection: Collection) => void;
}

export const CollectFeeView: React.FC<CollectFeeViewProps> = ({
  schoolInfo,
  students,
  classes,
  feeDemands,
  collections,
  initialStudentId,
  onSaveCollection,
  onViewReceipt,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // Selected fee demand items for payment: map of feeDemandId -> paymentAmount
  const [paymentAmounts, setPaymentAmounts] = useState<{ [feeDemandId: string]: number }>({});
  const [selectedItems, setSelectedItems] = useState<{ [feeDemandId: string]: boolean }>({});

  // Payment Metadata
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState<string>('');
  const [collectedBy, setCollectedBy] = useState<string>('Accounts Dept');

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
    }
  }, [initialStudentId]);

  const activeStudent = students.find((s) => s.id === selectedStudentId);
  const studentClass = classes.find((c) => c.id === activeStudent?.classId);

  // Unpaid or Partial demands for selected student
  const studentPendingDemands = selectedStudentId
    ? feeDemands.filter(
        (d) => d.studentId === selectedStudentId && (d.status === 'UNPAID' || d.status === 'PARTIAL' || d.status === 'OVERDUE')
      )
    : [];

  // When student changes, default select all pending items
  useEffect(() => {
    const initSelected: { [key: string]: boolean } = {};
    const initAmounts: { [key: string]: number } = {};

    studentPendingDemands.forEach((d) => {
      initSelected[d.id] = true;
      initAmounts[d.id] = d.netDue - d.paidAmount;
    });

    setSelectedItems(initSelected);
    setPaymentAmounts(initAmounts);
  }, [selectedStudentId, feeDemands.length]);

  const toggleItemSelect = (demandId: string, balance: number) => {
    const nextState = !selectedItems[demandId];
    setSelectedItems((prev) => ({ ...prev, [demandId]: nextState }));
    if (nextState) {
      setPaymentAmounts((prev) => ({ ...prev, [demandId]: balance }));
    } else {
      setPaymentAmounts((prev) => ({ ...prev, [demandId]: 0 }));
    }
  };

  const handleAmountChange = (demandId: string, value: number, maxBalance: number) => {
    const cleanValue = Math.max(0, Math.min(value, maxBalance));
    setPaymentAmounts((prev) => ({ ...prev, [demandId]: cleanValue }));
    if (cleanValue > 0) {
      setSelectedItems((prev) => ({ ...prev, [demandId]: true }));
    }
  };

  // Calculate total amount to collect
  const totalPayableAmount = Object.keys(selectedItems)
    .filter((id) => selectedItems[id])
    .reduce((sum, id) => sum + (paymentAmounts[id] || 0), 0);

  // Search filtered students
  const filteredStudents = students.filter((s) => {
    if (!s.active) return false;
    if (selectedClassId !== 'ALL' && s.classId !== selectedClassId) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.rollNo.toLowerCase().includes(q) ||
      s.admissionNo.toLowerCase().includes(q) ||
      s.phone.includes(q)
    );
  });

  const handleSubmitCollection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudent || totalPayableAmount <= 0) return;

    const itemsToPay = studentPendingDemands
      .filter((d) => selectedItems[d.id] && (paymentAmounts[d.id] || 0) > 0)
      .map((d) => ({
        feeDemandId: d.id,
        feeTypeName: d.feeTypeName,
        period: d.period,
        amountPaid: paymentAmounts[d.id],
      }));

    if (itemsToPay.length === 0) {
      alert('Please select at least one fee head item to collect payment.');
      return;
    }

    const receiptNo = generateReceiptNo(collections.length, schoolInfo.receiptPrefix);

    const newCollection: Collection = {
      id: `col_${Date.now()}`,
      receiptNo,
      studentId: activeStudent.id,
      studentName: activeStudent.fullName,
      admissionNo: activeStudent.admissionNo,
      rollNo: activeStudent.rollNo,
      className: studentClass?.className || 'Class',
      section: activeStudent.section,
      date: paymentDate,
      totalAmountPaid: totalPayableAmount,
      paymentMode,
      referenceNo: referenceNo.trim() || undefined,
      notes: notes.trim() || undefined,
      collectedBy,
      items: itemsToPay,
    };

    // Update Fee Demand Statuses
    const updatedDemands = feeDemands.map((demand) => {
      if (selectedItems[demand.id] && (paymentAmounts[demand.id] || 0) > 0) {
        const paidNow = paymentAmounts[demand.id];
        const newPaidTotal = demand.paidAmount + paidNow;
        let newStatus = demand.status;

        if (newPaidTotal >= demand.netDue) {
          newStatus = 'PAID';
        } else {
          newStatus = 'PARTIAL';
        }

        return {
          ...demand,
          paidAmount: newPaidTotal,
          status: newStatus,
        };
      }
      return demand;
    });

    onSaveCollection(newCollection, updatedDemands);
    onViewReceipt(newCollection);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-400" />
            <span>Fee Collection & Receipt Counter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select student, inspect pending due fees, collect payment, and generate official printed receipt.
          </p>
        </div>

        {activeStudent && (
          <button
            onClick={() => {
              setSelectedStudentId('');
              setSearchQuery('');
            }}
            className="text-xs text-slate-300 hover:text-white bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition"
          >
            ← Select Different Student
          </button>
        )}
      </div>

      {!activeStudent ? (
        /* STEP 1: SELECT STUDENT */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Search Controls Sidebar */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <h3 className="text-sm font-serif font-bold text-slate-200">Find Student</h3>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Filter by Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Classes & Sections</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.className} - Section {c.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Search Keywords</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Name, Roll No, Adm No, Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-3">
              Showing {filteredStudents.length} active students
            </div>
          </div>

          {/* Student Grid / List Selection */}
          <div className="md:col-span-2 glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-serif font-bold text-slate-200 mb-3">Select Student for Payment</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredStudents.map((st) => {
                const cls = classes.find((c) => c.id === st.classId);
                const stDemands = feeDemands.filter((d) => d.studentId === st.id && d.status !== 'PAID');
                const pendingTotal = stDemands.reduce((sum, d) => sum + (d.netDue - d.paidAmount), 0);

                return (
                  <div
                    key={st.id}
                    onClick={() => setSelectedStudentId(st.id)}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/60 hover:bg-slate-800/80 cursor-pointer transition flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-100 group-hover:text-emerald-400 transition">
                        {st.fullName}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Roll: {st.rollNo} | Adm: {st.admissionNo}
                      </div>
                      <div className="text-xs font-medium text-slate-300 mt-1">
                        Class: {cls?.className || 'Class'} - {st.section}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Father: {st.fatherName}
                      </div>
                    </div>

                    <div className="text-right">
                      {pendingTotal > 0 ? (
                        <div className="bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs px-2.5 py-1 rounded-lg font-bold">
                          {formatCurrency(pendingTotal, schoolInfo.currencySymbol)}
                        </div>
                      ) : (
                        <div className="bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] px-2.5 py-1 rounded-lg font-semibold">
                          No Dues
                        </div>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500 ml-auto mt-2 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })}

              {filteredStudents.length === 0 && (
                <div className="col-span-2 text-center py-12 text-slate-500 text-xs">
                  No matching students found.
                </div>
              )}
            </div>
          </div>

        </div>
      ) : (
        /* STEP 2: COLLECT PAYMENT FOR SELECTED STUDENT */
        <form onSubmit={handleSubmitCollection} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Selected Student Profile & Unpaid Dues List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Info Card */}
            <div className="bg-gradient-to-r from-slate-900 to-[#0a0f1d] text-white rounded-2xl p-5 shadow-lg border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 text-slate-950 font-black text-xl rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                  {activeStudent.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-serif font-bold text-white">{activeStudent.fullName}</h3>
                    {activeStudent.concessionPercent > 0 && (
                      <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                        {activeStudent.concessionPercent}% Concession
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span>Class: <b>{studentClass?.className} - {activeStudent.section}</b></span>
                    <span>Roll No: <b>{activeStudent.rollNo}</b></span>
                    <span>Admission No: <b>{activeStudent.admissionNo}</b></span>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Father: {activeStudent.fatherName} | Phone: {activeStudent.phone}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800 text-right sm:text-right w-full sm:w-auto">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Unpaid Demand Balance</span>
                <span className="text-xl font-serif font-bold text-rose-400">
                  {formatCurrency(
                    studentPendingDemands.reduce((sum, d) => sum + (d.netDue - d.paidAmount), 0),
                    schoolInfo.currencySymbol
                  )}
                </span>
              </div>
            </div>

            {/* Dues Breakdown Item Table */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-serif font-bold text-slate-200">Select Pending Fee Demands</h3>
                  <p className="text-xs text-slate-400">Check fee items to include in this payment receipt</p>
                </div>
                <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2.5 py-1 rounded-lg">
                  {studentPendingDemands.length} Pending Dues
                </div>
              </div>

              {studentPendingDemands.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                        <th className="py-2.5 px-3 w-10 text-center">Select</th>
                        <th className="py-2.5 px-3">Fee Type</th>
                        <th className="py-2.5 px-3">Period</th>
                        <th className="py-2.5 px-3">Due Date</th>
                        <th className="py-2.5 px-3 text-right">Net Due</th>
                        <th className="py-2.5 px-3 text-right">Paid So Far</th>
                        <th className="py-2.5 px-3 text-right">Pay Now ({schoolInfo.currencySymbol})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {studentPendingDemands.map((demand) => {
                        const balance = demand.netDue - demand.paidAmount;
                        const isChecked = !!selectedItems[demand.id];

                        return (
                          <tr key={demand.id} className={isChecked ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'}>
                            <td className="py-3 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleItemSelect(demand.id, balance)}
                                className="w-4 h-4 text-emerald-500 rounded border-slate-700 bg-slate-900 focus:ring-emerald-500 cursor-pointer"
                              />
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-100">{demand.feeTypeName}</td>
                            <td className="py-3 px-3 text-slate-400">{demand.period}</td>
                            <td className="py-3 px-3 text-slate-400">{formatDate(demand.dueDate)}</td>
                            <td className="py-3 px-3 text-right font-medium text-slate-200">
                              {formatCurrency(demand.netDue, schoolInfo.currencySymbol)}
                            </td>
                            <td className="py-3 px-3 text-right text-slate-400">
                              {formatCurrency(demand.paidAmount, schoolInfo.currencySymbol)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <input
                                type="number"
                                min={0}
                                max={balance}
                                disabled={!isChecked}
                                value={paymentAmounts[demand.id] ?? 0}
                                onChange={(e) => handleAmountChange(demand.id, parseFloat(e.target.value) || 0, balance)}
                                className="w-24 text-right bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 font-bold text-white focus:ring-1 focus:ring-emerald-500 disabled:opacity-40"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-80" />
                  This student has zero pending dues. All fee demands are fully paid!
                </div>
              )}
            </div>

          </div>

          {/* Payment Checkout Panel */}
          <div className="glass-panel rounded-2xl p-5 space-y-5 h-fit">
            <h3 className="text-sm font-serif font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
              <CircleDollarSign className="w-5 h-5 text-emerald-400" />
              <span>Payment Details</span>
            </h3>

            {/* Total Summary */}
            <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 block">Total Collectable Amount</span>
              <div className="text-2xl font-serif font-bold text-emerald-400">
                {formatCurrency(totalPayableAmount, schoolInfo.currencySymbol)}
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">Mode of Payment</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Cash', 'UPI/Online', 'Cheque', 'Bank Transfer', 'Card'] as PaymentMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition cursor-pointer ${
                      paymentMode === mode
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Number */}
            {paymentMode !== 'Cash' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Reference / Transaction / Cheque No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/812391/HDFC or CHQ-00124"
                  value={referenceNo}
                  onChange={(e) => setReferenceNo(e.target.value)}
                  className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500 font-mono placeholder-slate-500"
                />
              </div>
            )}

            {/* Date */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Collector Name */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Collected By</label>
              <input
                type="text"
                value={collectedBy}
                onChange={(e) => setCollectedBy(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Remarks */}
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Remarks / Notes</label>
              <textarea
                rows={2}
                placeholder="Optional notes for receipt..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={totalPayableAmount <= 0}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-950/50 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Record Fee & Print Receipt</span>
            </button>

          </div>

        </form>
      )}

    </div>
  );
};
