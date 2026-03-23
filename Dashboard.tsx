
import React, { useState, useMemo } from 'react';
import { EmploymentArea, PayrollState } from './types';
import { REGIONS, SALARY_DATABASE } from './constants';
import { calculatePayroll } from './payrollLogic';
import { PayrollCharts } from './components/PayrollCharts';
import { LeaveManager } from './components/LeaveManager';

export const Dashboard: React.FC = () => {
  const [state, setState] = useState<PayrollState>({
    area: EmploymentArea.FUNZIONARI_EQ,
    formerPosition: 'D1',
    isPost2001: true,
    isPerseoSirio: false,
    region: 'Lombardia',
    isFiveDayWeek: true,
    sickDays: 0,
    monthlyPerformance: 300, 
    useTrattamentoIntegrativo: true,
    useNuovoCuneoFiscal: true,
  });

  const payrollResult = useMemo(() => calculatePayroll(state), [state]);

  const handleInputChange = (key: keyof PayrollState, value: any) => {
    setState(prev => {
      const newState = { ...prev, [key]: value };
      if (key === 'area') {
        const availablePositions = Object.keys(SALARY_DATABASE[value as EmploymentArea].positions);
        newState.formerPosition = availablePositions[0];
      }
      return newState;
    });
  };

  const availablePositions = useMemo(() => {
    return Object.keys(SALARY_DATABASE[state.area].positions);
  }, [state.area]);

  const isEligibleForIntegrativo = payrollResult.taxableAnnual <= 28000;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
      <header className="mb-8 lg:mb-12 text-center lg:text-left">
        <div className="flex flex-col lg:flex-row items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-200">
            <i className="fas fa-landmark text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">PublicGov Payroll</h1>
            <p className="text-slate-500 font-medium italic">Simulatore Enti Locali 2026 • CCNL Funzioni Locali</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Pannello Input */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <i className="fas fa-sliders text-blue-600"></i>
              Profilo Contrattuale
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Area Funzionale</label>
                <select 
                  value={state.area}
                  onChange={(e) => handleInputChange('area', e.target.value as EmploymentArea)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                >
                  {Object.values(EmploymentArea).map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Ex-Posizione Economica</label>
                <select 
                  value={state.formerPosition}
                  onChange={(e) => handleInputChange('formerPosition', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-700"
                >
                  {availablePositions.map(pos => (
                    <option key={pos} value={pos}>{pos}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Previdenza</label>
                <div className="flex bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => handleInputChange('isPost2001', false)}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${!state.isPost2001 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    TFS (&lt;2001)
                  </button>
                  <button
                    onClick={() => handleInputChange('isPost2001', true)}
                    className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${state.isPost2001 ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    TFR (&gt;2001)
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 p-4 bg-blue-50/40 rounded-2xl cursor-pointer border border-blue-100/50 hover:bg-blue-50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={state.isPerseoSirio} 
                    onChange={(e) => handleInputChange('isPerseoSirio', e.target.checked)}
                    className="w-5 h-5 accent-blue-600 rounded-lg"
                  />
                  <div>
                    <span className="block text-sm font-bold text-slate-700">Fondo Perseo-Sirio</span>
                    <span className="block text-[10px] text-slate-400 font-medium">Contribuzione 1% a carico dipendente.</span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Accessorio Mensile Lordo</label>
                <input 
                  type="range" 
                  min="0" max="2000" step="50"
                  value={state.monthlyPerformance}
                  onChange={(e) => handleInputChange('monthlyPerformance', Number(e.target.value))}
                  className="w-full accent-blue-600 mb-1"
                />
                <div className="text-right text-sm font-black text-blue-600 font-mono">€ {state.monthlyPerformance.toLocaleString('it-IT')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-800">
              <i className="fas fa-percent text-blue-600"></i>
              Agevolazioni Fiscali
            </h2>
            <div className="space-y-4">
              <label className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer border transition-all ${state.useTrattamentoIntegrativo ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <input 
                  type="checkbox" 
                  checked={state.useTrattamentoIntegrativo} 
                  onChange={(e) => handleInputChange('useTrattamentoIntegrativo', e.target.checked)}
                  className="w-5 h-5 mt-1 accent-indigo-600 rounded-lg"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Trattamento Integrativo</span>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">
                    Fascia &lt;15k: 1.200€ fisso.<br/>
                    Fascia 15k-28k: basato su oneri deducibili.<br/>
                    Fascia &gt;28k: non spettante.
                  </span>
                  {!isEligibleForIntegrativo && state.useTrattamentoIntegrativo && (
                    <span className="text-[10px] text-red-500 font-black mt-1">Soglia reddito superata!</span>
                  )}
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer border transition-all ${state.useNuovoCuneoFiscal ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                <input 
                  type="checkbox" 
                  checked={state.useNuovoCuneoFiscal} 
                  onChange={(e) => handleInputChange('useNuovoCuneoFiscal', e.target.checked)}
                  className="w-5 h-5 accent-emerald-600 rounded-lg"
                />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-700">Esonero Contributivo (Cuneo)</span>
                  <span className="text-[10px] text-slate-400 font-medium tracking-tight">Riforma 2025: Bonus &lt;20k / Detrazione 20-40k</span>
                </div>
              </label>
            </div>
          </div>
        </aside>

        {/* Pannello Risultati */}
        <main className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PayrollCharts result={payrollResult} />
            <LeaveManager state={state} />
          </div>

          <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h3 className="text-xl font-black flex items-center gap-2 text-slate-800 uppercase tracking-tight">
                <i className="fas fa-receipt text-blue-600"></i>
                Simulazione Cedolino 2026
              </h3>
              <div className="flex gap-2">
                <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider">
                  {state.isPost2001 ? 'Regime TFR' : 'Regime TFS'}
                </span>
                <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg shadow-blue-100">
                  {state.area}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Stipendio Base Annuo</span>
                    <span className="text-slate-800 font-bold">€ {payrollResult.grossAnnual.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Imponibile Fiscale Annuo</span>
                    <span className="text-slate-800 font-bold">€ {payrollResult.taxableAnnual.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <div className="space-y-2 border-l border-slate-100 pl-4">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>IRPEF Lorda Annuale</span>
                    <span className="text-red-500 font-bold">€ {payrollResult.grossIrpefAnnual.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Detrazioni Lavoro Dip.</span>
                    <span className="text-emerald-500 font-bold">€ {payrollResult.standardDeductionAnnual.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-left">Voci Mensili Medie</th>
                      <th className="px-6 py-4 text-right">Importo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    <tr>
                      <td className="px-6 py-4 text-slate-600 font-medium">Stipendio Tabellare + IVC + Comparto</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">€ {(payrollResult.baseMonthly + payrollResult.compartoMonthly + payrollResult.ivcMonthly).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-slate-600 font-medium">Somme Accessorie Lorde</td>
                      <td className="px-6 py-4 text-right font-bold text-slate-800">€ {payrollResult.accessoryMonthly.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="bg-red-50/20">
                      <td className="px-6 py-4 text-red-600 font-bold italic">Ritenute Previdenziali (CPDEL/FC)</td>
                      <td className="px-6 py-4 text-right font-black text-red-600">- € {(payrollResult.socialContributions + payrollResult.fcContributions).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    <tr className="bg-blue-50/30">
                      <td className="px-6 py-4 text-blue-700 font-black uppercase text-xs tracking-tighter">Imposta IRPEF Netta Mensile</td>
                      <td className="px-6 py-4 text-right font-black text-blue-700">- € {payrollResult.irpef.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                    </tr>
                    {payrollResult.trattamentoIntegrativo > 0 && (
                      <tr className="bg-emerald-50/40">
                        <td className="px-6 py-4 text-emerald-700 font-black flex items-center gap-2">
                          Trattamento Integrativo
                          <i className="fas fa-info-circle text-[10px] text-emerald-400" title="Ex Bonus Renzi 100 euro"></i>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">+ € {payrollResult.trattamentoIntegrativo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                    {payrollResult.bonusCuneo > 0 && (
                      <tr className="bg-amber-50/40">
                        <td className="px-6 py-4 text-amber-700 font-black">Bonus Cuneo Fiscale (2025)</td>
                        <td className="px-6 py-4 text-right font-black text-amber-600">+ € {payrollResult.bonusCuneo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-900 text-white">
                    <tr>
                      <td className="px-6 py-6 font-black uppercase tracking-widest text-xs">Netto Stimato in Busta</td>
                      <td className="px-6 py-6 text-right font-black text-3xl text-emerald-400">
                        € {payrollResult.netIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>
        </main>
      </div>
      
      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-[10px] font-medium uppercase tracking-widest pb-12">
        <p>© 2026 PublicGov Financial Systems • Enti Locali Simulator • Dati Fiscali Aggiornati</p>
        <p className="mt-2 text-slate-300">I calcoli sono indicativi e basati su una ripartizione annua di 12 mensilità.</p>
      </footer>
    </div>
  );
};
