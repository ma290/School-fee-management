import React, { useState } from 'react';
import { ClassSection, SchoolInfo, Student } from '../types';
import {
  GraduationCap,
  Plus,
  Users,
  X,
  BookOpen,
  DoorClosed,
} from 'lucide-react';

interface ClassManagementViewProps {
  classes: ClassSection[];
  students: Student[];
  onSaveClass: (cls: ClassSection) => void;
}

export const ClassManagementView: React.FC<ClassManagementViewProps> = ({
  classes,
  students,
  onSaveClass,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ClassSection>>({
    className: 'Class 1',
    section: 'A',
    classTeacher: '',
    roomNo: '',
    capacity: 40,
  });

  const handleOpenAddModal = () => {
    setFormData({
      className: 'Class 1',
      section: 'A',
      classTeacher: '',
      roomNo: '',
      capacity: 40,
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.className || !formData.section) {
      alert('Please enter Class Name and Section.');
      return;
    }

    const newClass: ClassSection = {
      id: `cls_${Date.now()}`,
      className: formData.className,
      section: formData.section.toUpperCase(),
      classTeacher: formData.classTeacher || 'Not Assigned',
      roomNo: formData.roomNo || 'N/A',
      capacity: Number(formData.capacity || 40),
    };

    onSaveClass(newClass);
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-emerald-400" />
            <span>Manage Classes & Sections</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure custom grade levels, section divisions, assign class teachers, room numbers, and track capacity.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class & Section</span>
        </button>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const enrolledCount = students.filter((s) => s.classId === cls.id && s.active).length;
          const occupancyPct = Math.round((enrolledCount / (cls.capacity || 40)) * 100);

          return (
            <div key={cls.id} className="glass-panel p-5 rounded-2xl hover:border-emerald-500/50 transition">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-emerald-950 border border-emerald-800/80 text-emerald-300 font-serif font-bold text-base rounded-xl flex items-center justify-center">
                    {cls.section}
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-100 text-base">{cls.className}</h3>
                    <span className="text-xs text-slate-400">Section {cls.section}</span>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                  {enrolledCount} Students
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" /> Class Teacher:
                  </span>
                  <span className="font-semibold text-slate-200">{cls.classTeacher || 'Unassigned'}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <DoorClosed className="w-3.5 h-3.5 text-slate-400" /> Room / Lab:
                  </span>
                  <span className="font-mono text-slate-200">{cls.roomNo || 'N/A'}</span>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                    <span>Capacity Occupancy</span>
                    <span>{enrolledCount} / {cls.capacity || 40} ({occupancyPct}%)</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE CLASS MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl shadow-2xl border-white/10 w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 text-white">
              <h3 className="font-serif font-bold text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                <span>Create Class & Section</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Class Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 6, Nursery, Class 11-Science"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 font-bold text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, C"
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5 font-bold uppercase focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 40 })}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Class Teacher Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ms. Ananya Sharma"
                  value={formData.classTeacher}
                  onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Room / Classroom No.</label>
                <input
                  type="text"
                  placeholder="e.g. Room 204, Wing B"
                  value={formData.roomNo}
                  onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-xl p-2.5 font-mono"
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
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
