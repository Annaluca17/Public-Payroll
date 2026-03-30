import { EmploymentArea, SalaryTableEntry } from './types';

// ---------------------------------------------------------------------------
// COMPANY INFO — Immedia S.p.A.
// ---------------------------------------------------------------------------
export const COMPANY_INFO = {
  primaryColorHex: '#00AECC',
  companyAddress: 'C.so Vittorio Emanuele III, 109 - 89127 Reggio Calabria (RC)',
  companyAddress2: 'Viale G. Lainò, 6 - 95126 Catania (CT)',
  companyPhone: '095 4035111',
  companyEmail: 'protocollo@immediaspa.com',
  companyPec: 'mail@pec.immediaspa.com',
} as const;

// ---------------------------------------------------------------------------
// TABELLE STIPENDIALI — CCNL Funzioni Locali 2019-2021 (firmato 16/11/2022)
// NB: Aggiornare con CCNL 2022-2024 non appena pubblicati i valori ufficiali.
// Fonte: Allegato A CCNL 16/11/2022 — importi annui lordi
// ---------------------------------------------------------------------------
export const SALARY_DATABASE: Record<EmploymentArea, SalaryTableEntry> = {
  [EmploymentArea.FUNZIONARI_EQ]: {
    label: 'Area dei Funzionari e dell\'Elevata Qualificazione (ex D)',
    // Indennità di comparto mensile — art. 56 CCNL 2019-2021
    indennitaCompartoMonthly: 36.33,
    // IVC mensile — ai sensi Accordo Quadro ARAN 2022
    ivcMonthly: 139.00,
    positions: {
      'F1': { baseAnnual: 23212.35, label: 'F1 (ex D1)' },
      'F2': { baseAnnual: 24200.00, label: 'F2 (ex D2)' },
      'F3': { baseAnnual: 26500.00, label: 'F3 (ex D3)' },
      'F4': { baseAnnual: 27800.00, label: 'F4 (ex D4)' },
      'F5': { baseAnnual: 29100.00, label: 'F5 (ex D5)' },
      'F6': { baseAnnual: 30500.00, label: 'F6 (ex D6)' },
      'F7': { baseAnnual: 31800.00, label: 'F7 (ex D7)' },
    },
  },
  [EmploymentArea.ISTRUTTORI]: {
    label: 'Area degli Istruttori (ex C)',
    indennitaCompartoMonthly: 32.06,
    ivcMonthly: 125.00,
    positions: {
      'I1': { baseAnnual: 21392.87, label: 'I1 (ex C1)' },
      'I2': { baseAnnual: 22100.00, label: 'I2 (ex C2)' },
      'I3': { baseAnnual: 23000.00, label: 'I3 (ex C3)' },
      'I4': { baseAnnual: 24100.00, label: 'I4 (ex C4)' },
      'I5': { baseAnnual: 25200.00, label: 'I5 (ex C5)' },
    },
  },
  [EmploymentArea.OPERATORI_ESPERTI]: {
    label: 'Area degli Operatori Esperti (ex B)',
    indennitaCompartoMonthly: 27.52,
    ivcMonthly: 115.00,
    positions: {
      'OE1': { baseAnnual: 19034.51, label: 'OE1 (ex B1)' },
      'OE2': { baseAnnual: 19600.00, label: 'OE2 (ex B2)' },
      'OE3': { baseAnnual: 20400.00, label: 'OE3 (ex B3)' },
      'OE4': { baseAnnual: 21200.00, label: 'OE4 (ex B4)' },
      'OE5': { baseAnnual: 22100.00, label: 'OE5 (ex B5)' },
      'OE6': { baseAnnual: 22900.00, label: 'OE6 (ex B6)' },
      'OE7': { baseAnnual: 23800.00, label: 'OE7 (ex B7)' },
    },
  },
  [EmploymentArea.OPERATORI]: {
    label: 'Area degli Operatori (ex A)',
    indennitaCompartoMonthly: 22.68,
    ivcMonthly: 111.00,
    positions: {
      'O1': { baseAnnual: 18283.31, label: 'O1 (ex A1)' },
      'O2': { baseAnnual: 18800.00, label: 'O2 (ex A2)' },
      'O3': { baseAnnual: 19400.00, label: 'O3 (ex A3)' },
      'O4': { baseAnnual: 19900.00, label: 'O4 (ex A4)' },
      'O5': { baseAnnual: 20600.00, label: 'O5 (ex A5)' },
    },
  },
};

// ---------------------------------------------------------------------------
// ALIQUOTE PREVIDENZIALI (Gestione Dipendenti Pubblici — ex INPDAP)
// Aggiornate al 2025
// ---------------------------------------------------------------------------
export const PREV_RATES = {
  CPDEL: 0.0885,         // 8.85% — aliquota base dipendente (GDP)
  FONDO_CREDITO: 0.0035, // 0.35% — Fondo Credito INPS
  INADEL: 0.0,           // TFS: non più operativo per nuovi assunti post-2001; placeholder
  // Perseo-Sirio: configurabile dall'utente (default 1%)
};

// ---------------------------------------------------------------------------
// SCAGLIONI IRPEF 2025 — L. 207/2024 (Legge di Bilancio 2025)
// INVARIATI rispetto alla riforma a 3 scaglioni (D.Lgs. 216/2023)
// ---------------------------------------------------------------------------
export const IRPEF_BRACKETS_2025 = [
  { from: 0,     to: 28000,    rate: 0.23 },
  { from: 28000, to: 50000,    rate: 0.35 },
  { from: 50000, to: Infinity, rate: 0.43 },
];

// ---------------------------------------------------------------------------
// DETRAZIONI LAVORO DIPENDENTE — art. 13 TUIR, aggiornate L. 207/2024
// ---------------------------------------------------------------------------
export const WORK_DEDUCTIONS = {
  // Per redditi ≤ 15.000: detrazione fissa 1.955€
  tier1_limit: 15000,
  tier1_amount: 1955,
  // Per redditi 15.001-28.000: formula proporzionale
  tier2_limit: 28000,
  tier2_base: 1910,
  tier2_extra: 1190,
  // Per redditi 28.001-50.000: decrescente fino a zero
  tier3_limit: 50000,
  tier3_base: 1910,
};

// ---------------------------------------------------------------------------
// CUNEO FISCALE 2025 — L. 207/2024 art. 1 cc. 4-9
// Struttura: bonus (≤20k) + ulteriore detrazione (20k-40k)
// ---------------------------------------------------------------------------
export const CUNEO_FISCALE_2025 = {
  BONUS_TIER1: { limit: 8500,  rate: 0.071 },  // 7.1%
  BONUS_TIER2: { limit: 15000, rate: 0.053 },  // 5.3%
  BONUS_TIER3: { limit: 20000, rate: 0.048 },  // 4.8%
  DETRAZIONE_PIENA: { from: 20000, to: 32000, amount: 1000 },
  DETRAZIONE_SLIDING: { from: 32000, to: 40000 }, // decrescente lineare → 0 a 40k
};

// ---------------------------------------------------------------------------
// ADDIZIONALI REGIONALI IRPEF 2025
// Fonte: MEF — aliquote deliberate dai Consigli Regionali
// Aggiornare annualmente da: https://www.finanze.gov.it
// ---------------------------------------------------------------------------
export const REGIONS = [
  { name: 'Calabria',         rate: 0.0230 }, // Aliquota base deliberata
  { name: 'Sicilia',          rate: 0.0223 },
  { name: 'Campania',         rate: 0.0203 },
  { name: 'Piemonte',         rate: 0.0203 },
  { name: 'Puglia',           rate: 0.0203 },
  { name: 'Basilicata',       rate: 0.0124 },
  { name: 'Toscana',          rate: 0.0173 },
  { name: 'Emilia-Romagna',   rate: 0.0133 },
  { name: 'Lazio',            rate: 0.0333 },
  { name: 'Lombardia',        rate: 0.0158 },
  { name: 'Veneto',           rate: 0.0123 },
  { name: 'Liguria',          rate: 0.0123 },
  { name: 'Marche',           rate: 0.0153 },
  { name: 'Umbria',           rate: 0.0093 },
  { name: 'Abruzzo',          rate: 0.0173 },
  { name: 'Sardegna',         rate: 0.0123 },
  { name: 'Friuli-V.G.',      rate: 0.0123 },
  { name: 'Trentino-A.A.',    rate: 0.0123 },
  { name: 'Valle d\'Aosta',   rate: 0.0123 },
  { name: 'Molise',           rate: 0.0203 },
];

// ---------------------------------------------------------------------------
// ADDIZIONALE COMUNALE MEDIA — variabile per comune
// Il valore 0.0080 è puramente indicativo; fornire campo input in UI
// ---------------------------------------------------------------------------
export const DEFAULT_MUNICIPAL_ADD_RATE = 0.0080;

// ---------------------------------------------------------------------------
// COSTANTI TEMPORALI
// ---------------------------------------------------------------------------
export const MONTHS_PER_YEAR = 12;
export const WORKING_DAYS_MONTHLY_5GG = 22; // media per settimana a 5 giorni
export const WORKING_DAYS_MONTHLY_6GG = 26; // media per settimana a 6 giorni
export const DAYS_PER_YEAR = 365;
