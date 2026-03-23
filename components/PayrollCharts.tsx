
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PayrollResult } from '../types';

interface Props {
  result: PayrollResult;
}

export const PayrollCharts: React.FC<Props> = ({ result }) => {
  const data = [
    { name: 'Netto in busta', value: result.netIncome, color: '#3b82f6' },
    { name: 'IRPEF Netta', value: result.irpef, color: '#ef4444' },
    { name: 'Contributi CPDEL/FC', value: result.socialContributions + result.fcContributions, color: '#f59e0b' },
    { name: 'Addizionali Reg/Com', value: result.regionalAdd + result.municipalAdd, color: '#8b5cf6' },
  ];

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <i className="fas fa-chart-pie text-blue-600"></i>
        Breakdown Stipendio Mensile (Medio)
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `€ ${value.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-slate-50 rounded-xl">
        <div className="flex justify-between items-center mb-2 text-xs uppercase font-bold text-slate-400 tracking-wider">
          <span>Stima Lordo Mensile (1/13)</span>
          <span className="text-slate-700">€ {result.grossMonthly.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between items-center text-blue-600 font-black text-2xl">
          <span>Netto Medio</span>
          <span>€ {result.netIncome.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
        </div>
        {(result.bonusCuneo > 0 || result.trattamentoIntegrativo > 0) && (
          <div className="mt-2 text-[10px] text-green-600 bg-green-50 p-2 rounded-lg border border-green-100 flex flex-col gap-1 font-medium">
            {result.bonusCuneo > 0 && (
              <div className="flex justify-between">
                <span>Incluso Bonus Cuneo Fiscale:</span>
                <span>+€ {result.bonusCuneo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {result.trattamentoIntegrativo > 0 && (
              <div className="flex justify-between">
                <span>Incluso Trattamento Integrativo:</span>
                <span>+€ {result.trattamentoIntegrativo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
