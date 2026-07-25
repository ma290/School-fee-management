import React, { useState } from 'react';
import { ClassSection, FeeDemand, FeeFrequency, FeeType, SchoolInfo, Student } from '../types';
import { formatCurrency } from '../utils/formatters';
import {
  Coins,
  Plus,
  Receipt,
  Sparkles,
  Zap,
  X,
  CheckCircle2,
} from 'lucide-react';

interface FeeManagementViewProps {
  schoolInfo: SchoolInfo;
  classes: ClassSection[];
  feeTypes: FeeType[];
  students: Student[];
  feeDemands: FeeDemand[];
  onSaveFeeType: (feeType: FeeType) => void;
  onGenerateBulkDemands: (newDemands: FeeDemand[]) => void;
}

export const FeeManagementView: React.FC<FeeManagementViewProps> = ({
  schoolInfo,
  classes,
  feeTypes,
  students,
  feeDemands,
  onSaveFeeType,
  onGenerateBulkDemands,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Fee Type Form
  const [formData, setFormData] = useState<Partial<FeeType>>({
    name: '',
    frequency: 'Monthly',
    applicableClassIds: ['ALL'],
    isMandatory: true,
    defaultAmount: 2000,
    dueDayOfMonth: 10,
    description: '',
  });

  // Bulk Generator State
  const [targetPeriod, setTargetPeriod] = useState('2026-08');
  const [targetClassId, setTargetClassId] = useState('ALL');
  const [selectedFeeTypeId, setSelectedFeeTypeId] = useState(feeTypes[0]?.id || 'ft_tuition');

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      frequency: 'Monthly',
      applicableClassIds: ['ALL'],
      isMandatory: true,
      defaultAmount: 2000,
      dueDayOfMonth: 10,
      description: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveFeeType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.defaultAmount) {
      alert('Please fill fee name and default amount.');
      return;
    }

    const newFeeType: FeeType = {
      id: `ft_${Date.now()}`,
      name: formData.name,
      frequency: (formData.frequency as FeeFrequency) || 'Monthly',
      applicableClassIds: formData.applicableClassIds || ['ALL'],
      isMandatory: formData.isMandatory ?? true,
      defaultAmount: Number(formData.defaultAmount || 0),
      dueDayOfMonth: Number(formData.dueDayOfMonth || 10),
      description: formData.description || '',
    };

    onSaveFeeType(newFeeType);
    setIsAddModalOpen(false);
  };

  // Bulk Demand Generation Engine
  const handleTriggerBulkGeneration = () => {
    const feeType = feeTypes.find((f) => f.id === selectedFeeTypeId);
    if (!feeType) return;

    // Active students in targeted class
    const targetStudents = students.filter((s) => {
      if (!s.active) return false;
      if (targetClassId !== 'ALL' && s.classId !== targetClassId) return false;

      // Check class applicability of fee type
      if (feeType.applicableClassIds.includes('ALL') || feeType.applicableClassIds.includes(s.classId)) {
        return true;
      }
      return false;
    });

    if (targetStudents.length === 0) {
      alert('No active eligible students found for this class and fee type.');
      return;
    }

    const newDemandsBatch: FeeDemand[] = [];

    targetStudents.forEach((st) => {
      // Check if demand already exists for this student + feeType + period
      const exists = feeDemands.some(
        (d) => d.studentId === st.id && d.feeTypeId === feeType.id && d.period === targetPeriod
      );

      if (!exists) {
        const grossAmount = feeType.defaultAmount;
        const concessionAmount = Math.round((grossAmount * (st.concessionPercent || 0)) / 100);
        const netDue = Math.max(0, grossAmount - concessionAmount);

        newDemandsBatch.push({
          id: `d_${st.id}_${feeType.id}_${targetPeriod}_${Date.now()}`,
          studentId: st.id,
          feeTypeId: feeType.id,
          feeTypeName: feeType.name,
          period: targetPeriod,
          dueDate: `${targetPeriod}-${feeType.dueDayOfMonth.toString().padStart(2, '0')}`,
          amount: grossAmount,
          concessionAmount,
          netDue,
          paidAmount: 0,
          status: 'UNPAID',
          createdAt: new Date().toISOString().slice(0, 10),
        });
      }
    });

    if (newDemandsBatch.length === 0) {
      alert(`Fee demands for ${feeType.name} in period ${targetPeriod} are already generated for all matching students.`);
      return;
    }

    onGenerateBulkDemands(newDemandsBatch);
    alert(`Successfully generated ${newDemandsBatch.length} new fee demands for period ${targetPeriod}!`);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-400" />
            <span>Fee Structure & Demand Generator</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure fee heads (Tuition, Exam, Transport, Lab), frequencies, class applicability, and auto-generate monthly/qtr due demands.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Fee Type</span>
        </button>
      </div>

      {/* BULK DEMAND GENERATOR TOOL */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0a0f1d] to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-serif font-bold">Generate Monthly / Quarterly Fee Demands</h3>
          <span className="bg-amber-400/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-400/30">
            Batch Demand Tool
          </span>
        </div>

        <p className="text-xs text-slate-400 max-w-3xl">
          Auto-calculate and issue fee demands to student accounts for upcoming months or quarters. Individual student concession discounts (e.g. 10% merit or sibling discount) will be auto-calculated.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Select Fee Head</label>
            <select
              value={selectedFeeTypeId}
              onChange={(e) => setSelectedFeeTypeId(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-2 font-medium"
            >
              {feeTypes.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({formatCurrency(f.defaultAmount, schoolInfo.currencySymbol)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Target Period (e.g. YYYY-MM)</label>
            <input
              type="text"
              placeholder="e.g. 2026-08 or 2026-Q3"
              value={targetPeriod}
              onChange={(e) => setTargetPeriod(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-2 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Target Class</label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg p-2 font-medium"
            >
              <option value="ALL">All Applicable Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.className} - Sec {c.section}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleTriggerBulkGeneration}
              className="w-full py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow cursor-pointer transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Dues</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEE TYPES CONFIGURED TABLE */}
      <div className="glass-panel rounded-2xl p-5">
        <h3 className="text-sm font-serif font-bold text-slate-200 mb-4">Master Fee Structure List</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                <th className="py-2.5 px-3">Fee Name</th>
                <th className="py-2.5 px-3">Frequency</th>
                <th className="py-2.5 px-3">Applicable Classes</th>
                <th className="py-2.5 px-3">Mandatory / Optional</th>
                <th className="py-2.5 px-3 text-right">Default Amount</th>
                <th className="py-2.5 px-3">Due Day</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {feeTypes.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{fee.name}</div>
                    <div className="text-[11px] text-slate-400">{fee.description || 'Standard school fee head'}</div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-300">
                    <span className="bg-slate-800 border border-slate-700/80 px-2 py-0.5 rounded text-[11px]">
                      {fee.frequency}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {fee.applicableClassIds.includes('ALL') ? (
                      <span className="bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                        ALL CLASSES
                      </span>
                    ) : (
                      <span>{fee.applicableClassIds.length} Classes Selected</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {fee.isMandatory ? (
                      <span className="text-emerald-300 font-bold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded text-[10px]">
                        Mandatory
                      </span>
                    ) : (
                      <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[10px]">
                        Optional
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-serif font-bold text-emerald-400 text-sm">
                    {formatCurrency(fee.defaultAmount, schoolInfo.currencySymbol)}
                  </td>
                  <td className="py-3 px-3 text-slate-400 font-mono">
                    Day {fee.dueDayOfMonth} of Month
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE FEE TYPE MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl shadow-2xl border-white/10 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                <span>Configure New Fee Head</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeType} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Fee Head Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuition Fee, Sports Charge, Transport Fee"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-bold text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Frequency *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as FeeFrequency })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Bi-Annually">Bi-Annually</option>
                    <option value="Annually">Annually</option>
                    <option value="One-Time">One-Time</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Default Amount ({schoolInfo.currencySymbol}) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.defaultAmount}
                    onChange={(e) => setFormData({ ...formData, defaultAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-bold text-emerald-400 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.dueDayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dueDayOfMonth: parseInt(e.target.value) || 10 })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Obligation</label>
                  <select
                    value={formData.isMandatory ? 'MANDATORY' : 'OPTIONAL'}
                    onChange={(e) => setFormData({ ...formData, isMandatory: e.target.value === 'MANDATORY' })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5"
                  >
                    <option value="MANDATORY">Mandatory for all students</option>
                    <option value="OPTIONAL">Optional (Opt-in)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details regarding this fee..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Fee Head
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
