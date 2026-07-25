import React from 'react';
import { Collection, SchoolInfo } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CheckCircle2, Printer, X } from 'lucide-react';

interface ReceiptModalProps {
  collection: Collection | null;
  schoolInfo: SchoolInfo;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ collection, schoolInfo, onClose }) => {
  if (!collection) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="glass-panel text-slate-100 rounded-2xl border-white/10 w-full max-w-3xl overflow-hidden print:shadow-none print:border-none print:max-w-none print:rounded-none print:bg-white print:text-slate-900 my-8 print:my-0">
        
        {/* Modal Action Header - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-serif font-bold text-lg">Fee Receipt Issued</span>
            <span className="bg-emerald-950 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-mono border border-emerald-800/80">
              {collection.receiptNo}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm transition shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area - Rendered twice for Student Copy & School Copy */}
        <div className="p-8 print:p-4 space-y-8 print:space-y-6">
          
          {/* RECEIPT COPY 1: STUDENT COPY */}
          <div className="border border-slate-800 rounded-xl p-6 relative bg-slate-900/90 print:bg-white print:border-slate-300">
            <div className="absolute top-3 right-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase border border-slate-700 print:border-slate-300 px-2 py-0.5 rounded">
              STUDENT COPY
            </div>

            {/* School Header */}
            <div className="flex items-center justify-center gap-4 border-b border-slate-800 print:border-slate-200 pb-4 mb-4">
              <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
              <div className="text-center">
                <h1 className="text-2xl font-serif font-bold text-white print:text-slate-900 tracking-tight">{schoolInfo.name}</h1>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">{schoolInfo.tagline}</p>
                <p className="text-xs text-slate-400 print:text-slate-500 mt-0.5">{schoolInfo.address} | Ph: {schoolInfo.phone}</p>
                <div className="inline-block mt-2 bg-slate-800 print:bg-slate-100 text-slate-200 print:text-slate-800 font-semibold text-xs px-3 py-1 rounded-full border border-slate-700 print:border-slate-200 uppercase tracking-wider">
                  FEE PAYMENT RECEIPT ({schoolInfo.academicYear})
                </div>
              </div>
            </div>

            {/* Receipt & Student Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 print:bg-slate-50 p-3 rounded-lg border border-slate-800 print:border-slate-100 text-xs mb-4">
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Receipt No:</span>
                <span className="font-bold text-white print:text-slate-900 font-mono">{collection.receiptNo}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Date & Time:</span>
                <span className="font-semibold text-slate-200 print:text-slate-800">{formatDate(collection.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Admission No:</span>
                <span className="font-semibold text-slate-200 print:text-slate-800">{collection.admissionNo}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Roll No:</span>
                <span className="font-semibold text-slate-200 print:text-slate-800">{collection.rollNo}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Student Name:</span>
                <span className="font-bold text-white print:text-slate-900">{collection.studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Class & Sec:</span>
                <span className="font-semibold text-slate-200 print:text-slate-800">{collection.className} - {collection.section}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Payment Mode:</span>
                <span className="font-bold text-emerald-400 print:text-emerald-700">{collection.paymentMode}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Ref / Txn ID:</span>
                <span className="font-mono text-slate-300 print:text-slate-700">{collection.referenceNo || 'N/A'}</span>
              </div>
            </div>

            {/* Itemized Fee Breakdown Table */}
            <div className="overflow-hidden border border-slate-800 print:border-slate-200 rounded-lg mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/90 print:bg-slate-100 text-slate-300 print:text-slate-700 font-semibold border-b border-slate-800 print:border-slate-200">
                    <th className="py-2 px-3 border-r border-slate-800 print:border-slate-200">S.No</th>
                    <th className="py-2 px-3 border-r border-slate-800 print:border-slate-200">Fee Description / Head</th>
                    <th className="py-2 px-3 border-r border-slate-800 print:border-slate-200">Period / Month</th>
                    <th className="py-2 px-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-200 print:text-slate-800">
                  {collection.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 print:hover:bg-slate-50">
                      <td className="py-2 px-3 border-r border-slate-800 print:border-slate-200 text-slate-400 print:text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 border-r border-slate-800 print:border-slate-200 font-medium text-slate-200 print:text-slate-800">{item.feeTypeName}</td>
                      <td className="py-2 px-3 border-r border-slate-800 print:border-slate-200 text-slate-400 print:text-slate-600">{item.period}</td>
                      <td className="py-2 px-3 text-right font-semibold text-white print:text-slate-900">{formatCurrency(item.amountPaid, schoolInfo.currencySymbol)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950/80 print:bg-slate-100/80 font-bold border-t border-slate-800 print:border-slate-200">
                    <td colSpan={3} className="py-2 px-3 text-right border-r border-slate-800 print:border-slate-200 uppercase text-slate-300 print:text-slate-700">Total Paid Amount:</td>
                    <td className="py-2 px-3 text-right text-emerald-400 print:text-emerald-700 text-sm font-serif">
                      {formatCurrency(collection.totalAmountPaid, schoolInfo.currencySymbol)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Notes & Authorisation Footer */}
            <div className="flex justify-between items-end text-xs pt-2">
              <div className="max-w-xs space-y-1">
                {collection.notes && (
                  <p className="text-slate-300 print:text-slate-600">
                    <span className="font-semibold text-slate-200 print:text-slate-700">Remarks:</span> {collection.notes}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 print:text-slate-400 italic">
                  * System generated computer receipt. Subject to realization for cheques/transfers.
                </p>
              </div>
              <div className="text-center min-w-[140px]">
                <div className="h-8 border-b border-dashed border-slate-600 print:border-slate-400 mb-1"></div>
                <span className="font-semibold text-slate-200 print:text-slate-800 block">{collection.collectedBy}</span>
                <span className="text-[10px] text-slate-400 print:text-slate-500 uppercase">Authorized Accounts Signatory</span>
              </div>
            </div>
          </div>

          {/* DOTTED DIVIDER FOR PRINT */}
          <div className="hidden print:block border-b-2 border-dashed border-slate-300 my-4 text-center text-[10px] text-slate-400">
            ✂ Fold or tear here
          </div>

          {/* RECEIPT COPY 2: OFFICE COPY */}
          <div className="border border-slate-800 rounded-xl p-6 relative bg-slate-900/90 print:bg-white print:border-slate-300">
            <div className="absolute top-3 right-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase border border-slate-700 print:border-slate-300 px-2 py-0.5 rounded">
              OFFICE / ACCOUNTS COPY
            </div>

            {/* School Header */}
            <div className="flex items-center justify-center gap-3 border-b border-slate-800 print:border-slate-200 pb-4 mb-4">
              <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
              <div className="text-center">
                <h2 className="text-xl font-serif font-bold text-white print:text-slate-900 tracking-tight">{schoolInfo.name}</h2>
                <p className="text-xs text-slate-400 print:text-slate-500">{schoolInfo.address}</p>
                <div className="inline-block mt-1.5 bg-slate-800 print:bg-slate-100 text-slate-200 print:text-slate-800 font-semibold text-[11px] px-2.5 py-0.5 rounded-full border border-slate-700 print:border-slate-200 uppercase tracking-wider">
                  FEE PAYMENT RECEIPT ({schoolInfo.academicYear})
                </div>
              </div>
            </div>

            {/* Receipt Details */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/80 print:bg-slate-50 p-3 rounded-lg border border-slate-800 print:border-slate-100 text-xs mb-4">
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Receipt No:</span>
                <span className="font-bold text-white print:text-slate-900 font-mono">{collection.receiptNo}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Date:</span>
                <span className="font-semibold text-slate-200 print:text-slate-800">{formatDate(collection.date)}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Student:</span>
                <span className="font-bold text-white print:text-slate-900">{collection.studentName} ({collection.className}-{collection.section})</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-500 block">Admission / Roll:</span>
                <span className="font-semibold text-slate-200 print:text-slate-800">{collection.admissionNo} / {collection.rollNo}</span>
              </div>
            </div>

            {/* Itemized Fee Breakdown Table */}
            <div className="overflow-hidden border border-slate-800 print:border-slate-200 rounded-lg mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/90 print:bg-slate-100 text-slate-300 print:text-slate-700 font-semibold border-b border-slate-800 print:border-slate-200">
                    <th className="py-2 px-3 border-r border-slate-800 print:border-slate-200">Fee Head</th>
                    <th className="py-2 px-3 border-r border-slate-800 print:border-slate-200">Period</th>
                    <th className="py-2 px-3 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-200 print:text-slate-800">
                  {collection.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5 px-3 border-r border-slate-800 print:border-slate-200 font-medium text-slate-200 print:text-slate-800">{item.feeTypeName}</td>
                      <td className="py-1.5 px-3 border-r border-slate-800 print:border-slate-200 text-slate-400 print:text-slate-600">{item.period}</td>
                      <td className="py-1.5 px-3 text-right font-semibold text-white print:text-slate-900">{formatCurrency(item.amountPaid, schoolInfo.currencySymbol)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-950/80 print:bg-slate-100/80 font-bold border-t border-slate-800 print:border-slate-200">
                    <td colSpan={2} className="py-2 px-3 text-right border-r border-slate-800 print:border-slate-200 uppercase text-slate-300 print:text-slate-700">Total Collected:</td>
                    <td className="py-2 px-3 text-right text-emerald-400 print:text-emerald-700 text-sm font-serif">
                      {formatCurrency(collection.totalAmountPaid, schoolInfo.currencySymbol)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex justify-between items-center text-xs pt-2">
              <div className="text-slate-400 print:text-slate-500">
                Mode: <span className="font-semibold text-slate-200 print:text-slate-800">{collection.paymentMode}</span> {collection.referenceNo ? `(${collection.referenceNo})` : ''}
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 print:text-slate-500 block">Collected By: {collection.collectedBy}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions - Hidden during print */}
        <div className="bg-slate-900 px-6 py-4 border-t border-slate-800 flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-xl transition cursor-pointer"
          >
            Close Window
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Receipt</span>
          </button>
        </div>

      </div>
    </div>
  );
};
