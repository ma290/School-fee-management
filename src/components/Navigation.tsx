import React from 'react';
import {
  BarChart3,
  BookOpen,
  CalendarCheck2,
  Coins,
  CreditCard,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  Receipt,
  Users,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  unpaidCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab, unpaidCount }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'collect-fee', label: 'Collect Fee', icon: Receipt, highlight: true },
    { id: 'students', label: 'Student Directory', icon: Users },
    { id: 'fee-management', label: 'Fee Structure', icon: Coins },
    { id: 'classes', label: 'Classes & Sections', icon: GraduationCap },
    { id: 'due-register', label: 'Due Register', icon: CalendarCheck2, badge: unpaidCount > 0 ? unpaidCount : null },
    { id: 'collection-register', label: 'Collection Register', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports & Reconciliation', icon: BarChart3 },
  ];

  return (
    <nav className="bg-slate-900/40 backdrop-blur-xl border-b border-white/5 shadow-lg sticky top-[70px] z-30 print:hidden overflow-x-auto scrollbar-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-3 py-3 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer relative whitespace-nowrap ${
                  isActive
                    ? item.highlight
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/50'
                      : 'bg-white/10 text-white border border-white/20 shadow-sm backdrop-blur-md'
                    : item.highlight
                    ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-800/50 backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 glass-button border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${isActive ? (item.highlight ? 'text-white' : 'text-emerald-400') : ''}`} />
                <span>{item.label}</span>

                {item.badge && (
                  <span className="bg-rose-500/20 text-rose-300 text-[10px] font-mono px-2 py-0.5 rounded-full border border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
