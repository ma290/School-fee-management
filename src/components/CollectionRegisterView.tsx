import React, { useState } from 'react';
import { Collection, PaymentMode, SchoolInfo } from '../types';
import { exportToCSV, formatCurrency, formatDate } from '../utils/formatters';
import {
  Download,
  FileSpreadsheet,
  Printer,
  Receipt,
  Search,
} from 'lucide-react';

interface CollectionRegisterViewProps {
  schoolInfo: SchoolInfo;
  collections: Collection[];
  onViewReceipt: (collection: Collection) => void;
}

export const CollectionRegisterView: React.FC<CollectionRegisterViewProps> = ({
  schoolInfo,
  collections,
  onViewReceipt,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('ALL');

  // Mode-wise collection breakdown
  const cashTotal = collections.filter((c) => c.paymentMode === 'Cash').reduce((sum, c) => sum + c.totalAmountPaid, 0);
  const upiTotal = collections.filter((c) => c.paymentMode === 'UPI/Online').reduce((sum, c) => sum + c.totalAmountPaid, 0);
  const bankTotal = collections.filter((c) => c.paymentMode === 'Bank Transfer' || c.paymentMode === 'Cheque').reduce((sum, c) => sum + c.totalAmountPaid, 0);
  const grandTotal = collections.reduce((sum, c) => sum + c.totalAmountPaid, 0);

  const filteredCollections = collections.filter((col) => {
    if (selectedMode !== 'ALL' && col.paymentMode !== selectedMode) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReceipt = col.receiptNo.toLowerCase().includes(q);
      const matchStudent = col.studentName.toLowerCase().includes(q);
      const matchAdm = col.admissionNo.toLowerCase().includes(q);
      const matchRef = (col.referenceNo || '').toLowerCase().includes(q);

      if (!matchReceipt && !matchStudent && !matchAdm && !matchRef) return false;
    }

    return true;
  });

  const handleExportCSV = () => {
    const rows = [
      ['Receipt No', 'Date', 'Student Name', 'Admission No', 'Class', 'Section', 'Payment Mode', 'Reference No', 'Amount Paid', 'Collected By'],
      ...filteredCollections.map((c) => [
        c.receiptNo,
        c.date,
        c.studentName,
        c.admissionNo,
        c.className,
        c.section,
        c.paymentMode,
        c.referenceNo || '',
        c.totalAmountPaid,
        c.collectedBy,
      ]),
    ];

    exportToCSV(`Fee_Collection_Register_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-400" />
            <span>Master Collection Register</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chronological audit log of all money collections, receipt numbers, payment modes, and cashier signatures.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export Register (CSV)</span>
        </button>
      </div>

      {/* Mode Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Grand Total Collected</span>
          <span className="text-xl font-serif font-bold text-emerald-400 mt-1 block">{formatCurrency(grandTotal, schoolInfo.currencySymbol)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Cash In Hand</span>
          <span className="text-xl font-serif font-bold text-slate-100 mt-1 block">{formatCurrency(cashTotal, schoolInfo.currencySymbol)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">UPI / Online</span>
          <span className="text-xl font-serif font-bold text-sky-400 mt-1 block">{formatCurrency(upiTotal, schoolInfo.currencySymbol)}</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl">
          <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Cheque & Bank</span>
          <span className="text-xl font-serif font-bold text-amber-400 mt-1 block">{formatCurrency(bankTotal, schoolInfo.currencySymbol)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          
          {/* Mode Selector */}
          <div className="flex bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-800">
            {['ALL', 'Cash', 'UPI/Online', 'Cheque', 'Bank Transfer', 'Card'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMode(m)}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                  selectedMode === m ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search receipt #, student, ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-emerald-500 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Collection Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Ref / Txn ID</th>
                <th className="py-3 px-4 text-right">Amount Paid</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredCollections.map((col) => (
                <tr key={col.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-100">{col.receiptNo}</td>
                  <td className="py-3 px-4 text-slate-400">{formatDate(col.date)}</td>
                  <td className="py-3 px-4 font-bold text-white">{col.studentName}</td>
                  <td className="py-3 px-4 font-medium text-slate-300">{col.className} - {col.section}</td>
                  <td className="py-3 px-4">
                    <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                      {col.paymentMode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400">{col.referenceNo || 'N/A'}</td>
                  <td className="py-3 px-4 text-right font-serif font-bold text-emerald-400 text-sm">
                    {formatCurrency(col.totalAmountPaid, schoolInfo.currencySymbol)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onViewReceipt(col)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-[11px] rounded-lg transition cursor-pointer"
                    >
                      View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
