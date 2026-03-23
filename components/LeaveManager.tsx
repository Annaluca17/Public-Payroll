
import React from 'react';
import { PayrollState } from '../types';
import { getLeaveEntitlement } from '../payrollLogic';

interface Props {
  state: PayrollState;
}

export const LeaveManager: React.FC<Props> = ({ state }) => {
  const ferie = getLeaveEntitlement(state.isFiveDayWeek);

  const entitlements = [
    { label: 'Ferie Annuali', value: ferie, unit: 'gg', icon: 'fa-sun', color: 'text-orange-500' },
    { label: 'Festività Soppresse', value: 4, unit: 'gg', icon: 'fa-calendar-check', color: 'text-emerald-500' },
    { label: 'Permessi Art. 32 (CCNL)', value: 18, unit: 'h', icon: 'fa-clock', color: 'text-blue-500' },
    { label: 'Diritto allo Studio', value: 150, unit: 'h', icon: 'fa-graduation-cap', color: 'text-indigo-500' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i className="fas fa-umbrella-beach text-blue-600"></i>
        Piano Assenze e Permessi (Annuo)
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {entitlements.map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <i className={`fas ${item.icon} ${item.color}`}></i>
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{item.unit}</span>
            </div>
            <div className="text-2xl font-black text-slate-800">{item.value}</div>
            <div className="text-sm text-slate-600 leading-tight">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 border-t pt-4">
        <h4 className="text-sm font-bold text-slate-700 mb-2">Note Speciali:</h4>
        <ul className="text-xs text-slate-500 space-y-2">
          <li>• Lutto: 3gg per evento entro 7gg dal decesso.</li>
          <li>• Concorsi: 8gg annui (viaggio incluso).</li>
          <li>• Malattia: Trattenuta Brunetta applicata sui primi 10gg.</li>
        </ul>
      </div>
    </div>
  );
};
