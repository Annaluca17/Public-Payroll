
import { EmploymentArea, SalaryTableEntry } from './types';

export const SALARY_DATABASE: Record<EmploymentArea, SalaryTableEntry> = {
  [EmploymentArea.FUNZIONARI_EQ]: {
    indennitaComparto: 36.33 * 12,
    ivcAnnual: 139.0 * 12,
    positions: {
      'D1': { baseAnnual: 23212.35 },
      'D2': { baseAnnual: 24200.00 },
      'D3': { baseAnnual: 26500.00 },
      'D4': { baseAnnual: 27800.00 },
      'D5': { baseAnnual: 29100.00 },
      'D6': { baseAnnual: 30500.00 },
      'D7': { baseAnnual: 31800.00 },
    }
  },
  [EmploymentArea.ISTRUTTORI]: {
    indennitaComparto: 32.06 * 12,
    ivcAnnual: 125.0 * 12,
    positions: {
      'C1': { baseAnnual: 21392.87 },
      'C2': { baseAnnual: 22100.00 },
      'C3': { baseAnnual: 23000.00 },
      'C4': { baseAnnual: 24100.00 },
      'C5': { baseAnnual: 25200.00 },
    }
  },
  [EmploymentArea.OPERATORI_ESPERTI]: {
    indennitaComparto: 27.52 * 12,
    ivcAnnual: 115.0 * 12,
    positions: {
      'B1': { baseAnnual: 19034.51 },
      'B2': { baseAnnual: 19600.00 },
      'B3': { baseAnnual: 20400.00 },
      'B4': { baseAnnual: 21200.00 },
      'B5': { baseAnnual: 22100.00 },
      'B6': { baseAnnual: 22900.00 },
      'B7': { baseAnnual: 23800.00 },
    }
  },
  [EmploymentArea.OPERATORI]: {
    indennitaComparto: 22.68 * 12,
    ivcAnnual: 111.0 * 12,
    positions: {
      'A1': { baseAnnual: 18283.31 },
      'A2': { baseAnnual: 18800.00 },
      'A3': { baseAnnual: 19400.00 },
      'A4': { baseAnnual: 19900.00 },
      'A5': { baseAnnual: 20600.00 },
    }
  },
};

export const PREV_RATES = {
  CPDEL: 0.0885, // 8.85%
  FONDO_CREDITO: 0.0035, // 0.35%
  IRAP_ENTE: 0.085, // 8.5%
};

export const IRPEF_BRACKETS = [
  { limit: 28000, rate: 0.23 },
  { limit: 50000, rate: 0.35 },
  { limit: Infinity, rate: 0.43 },
];

export const REGIONS = [
  { name: 'Lazio', rate: 0.0333 },
  { name: 'Lombardia', rate: 0.0158 },
  { name: 'Campania', rate: 0.0203 },
  { name: 'Veneto', rate: 0.0123 },
  { name: 'Piemonte', rate: 0.0203 },
];
