
export enum EmploymentArea {
  FUNZIONARI_EQ = 'Funzionari ed EQ',
  ISTRUTTORI = 'Istruttori',
  OPERATORI_ESPERTI = 'Operatori Esperti',
  OPERATORI = 'Operatori'
}

export interface SalaryDetail {
  baseAnnual: number;
}

export interface SalaryTableEntry {
  positions: Record<string, SalaryDetail>;
  indennitaComparto: number;
  ivcAnnual: number;
}

export interface PayrollState {
  area: EmploymentArea;
  formerPosition: string;
  isPost2001: boolean; // false = TFS (pre-2001), true = TFR (post-2001)
  isPerseoSirio: boolean;
  region: string;
  isFiveDayWeek: boolean;
  sickDays: number;
  monthlyPerformance: number;
  // Fiscal Options
  useTrattamentoIntegrativo: boolean;
  useNuovoCuneoFiscal: boolean;
}

export interface PayrollResult {
  grossMonthly: number;
  grossAnnual: number;
  // Breakdown of Gross
  baseMonthly: number;
  compartoMonthly: number;
  ivcMonthly: number;
  accessoryMonthly: number;
  brunettaPenaltyMonthly: number;
  
  socialContributions: number;
  fcContributions: number;
  perseoContribution: number;
  taxableIncome: number;
  taxableAnnual: number;
  grossIrpefAnnual: number;
  standardDeductionAnnual: number;
  irpef: number;
  regionalAdd: number;
  municipalAdd: number;
  netIncome: number;
  // Fiscal Benefit Results
  trattamentoIntegrativo: number;
  bonusCuneo: number; // The "Bonus" part (<20k)
  ulterioreDetrazioneCuneo: number; // The "Detrazione" part (20k-40k)
}

export interface LeaveBank {
  ferieTotal: number;
  festivitaSoppresse: number;
  permessiPersonali: number;
  studioHours: number;
}
