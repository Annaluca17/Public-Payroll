// =============================================================================
// TYPES — Cedolino Enti Locali
// CCNL Funzioni Locali 2022-2024 compliant
// =============================================================================

export enum EmploymentArea {
  FUNZIONARI_EQ      = 'Funzionari ed EQ',
  ISTRUTTORI         = 'Istruttori',
  OPERATORI_ESPERTI  = 'Operatori Esperti',
  OPERATORI          = 'Operatori',
}

export interface SalaryDetail {
  baseAnnual: number;
  label: string;
}

export interface SalaryTableEntry {
  label: string;
  positions: Record<string, SalaryDetail>;
  indennitaCompartoMonthly: number;  // mensile
  ivcMonthly: number;                // mensile
}

// ---------------------------------------------------------------------------
// Stato input del simulatore
// ---------------------------------------------------------------------------
export interface PayrollState {
  // --- Inquadramento ---
  area: EmploymentArea;
  positionKey: string;                 // key nella tabella (es. 'F1')

  // --- Previdenza ---
  isPost2001: boolean;                 // false=TFS, true=TFR
  isPerseoSirio: boolean;
  perseoContribRate: number;           // percentuale aderente (0.01, 0.02, ...)

  // --- Voci fisse mensili lorde ---
  monthlyPoIndennita: number;          // Indennità Posizione Organizzativa
  monthlyPoRisultato: number;          // Indennità Risultato PO
  monthlySpecificheResponsabilita: number; // art. 70-bis CCNL
  monthlyTurno: number;                // Indennità di turno
  monthlyReperibilita: number;         // Indennità di reperibilità
  monthlyDisagio: number;              // Indennità disagio/rischio
  monthlyBilingue: number;             // Indennità bilinguismo

  // --- Voci variabili mensili lorde ---
  monthlyPerformance: number;          // Produttività/Performance individuale
  monthlyProgetto: number;             // Compenso progetto (PNRR, Eurofondi)
  monthlyIncentivi113: number;         // Incentivi art. 45 D.Lgs. 36/2023
  monthlyOrdStraordinario: number;     // Ore straordinario

  // --- Assenze e riduzioni ---
  sickDays: number;                    // Giorni malattia nel mese

  // --- Detrazioni familiari ---
  coniugeACarico: boolean;
  figliACarico: number;                // numero figli (ai fini TUIR, over 21 o senza AUU)
  altriCarichi: number;                // altri familiari a carico

  // --- Parametri fiscali ---
  region: string;
  municipalAddRate: number;            // aliquota addizionale comunale
  useTrattamentoIntegrativo: boolean;
  useNuovoCuneoFiscal: boolean;

  // --- Logistici ---
  isFiveDayWeek: boolean;
  mese: number;                        // 1-12 o 13 (tredicesima)
}

// ---------------------------------------------------------------------------
// Risultato elaborazione cedolino
// ---------------------------------------------------------------------------
export interface PayrollResult {
  // Competenze lorde
  baseMonthly: number;
  compartoMonthly: number;
  ivcMonthly: number;
  poIndennitaMonthly: number;
  poRisultatoMonthly: number;
  specificheResponsabilitaMonthly: number;
  turnoMonthly: number;
  reperibilitaMonthly: number;
  disagioMonthly: number;
  performanceMonthly: number;
  progettoMonthly: number;
  incentivi113Monthly: number;
  straordinarioMonthly: number;

  // Lordo totale (12 e 13° mensilità separati)
  grossMonthly: number;     // lordo mensile (÷12)
  grossAnnual: number;      // lordo annuo (×12) — esclusa 13a

  // Ritenute previdenziali
  socialContributions: number;   // CPDEL mensile
  fcContributions: number;       // Fondo Credito mensile
  perseoContribution: number;    // Perseo-Sirio mensile

  // Base imponibile
  taxableIncome: number;         // imponibile fiscale mensile
  taxableAnnual: number;         // imponibile fiscale annuo

  // IRPEF
  grossIrpefAnnual: number;
  standardDeductionAnnual: number;
  detrazioniCarichi: number;     // detrazioni per carichi di famiglia
  irpef: number;                 // IRPEF netta mensile

  // Addizionali (ritenuta mensile su 11 quote marzo-novembre)
  regionalAdd: number;
  municipalAdd: number;

  // Agevolazioni fiscali
  trattamentoIntegrativo: number;
  bonusCuneo: number;
  ulterioreDetrazioneCuneo: number;

  // Penalizzazioni
  brunettaPenaltyMonthly: number;

  // Netto
  netIncome: number;

  // Annuali di supporto
  ulterioreDetrazioneCuneoAnnual: number;
}

// ---------------------------------------------------------------------------
// Banca ore / ferie
// ---------------------------------------------------------------------------
export interface LeaveBank {
  ferieTotal: number;           // giorni spettanti (28 o 32)
  ferieResiduo: number;
  festivitaSoppresse: number;   // 4 giorni CCNL
  permessiPersonali: number;    // 18 ore
  studioHours: number;          // 150 ore concorsuali / 50 aggiornamento
  rolaHours: number;            // monte ore RSU/RSA
}
