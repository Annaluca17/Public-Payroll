// =============================================================================
// PAYROLL LOGIC — Cedolino Enti Locali
// CCNL Funzioni Locali 2022-2024 | Legge 207/2024 | D.Lgs. 36/2023
// =============================================================================

import { PayrollState, PayrollResult } from './types';
import {
  SALARY_DATABASE,
  PREV_RATES,
  IRPEF_BRACKETS_2025,
  WORK_DEDUCTIONS,
  CUNEO_FISCALE_2025,
  REGIONS,
  DEFAULT_MUNICIPAL_ADD_RATE,
  MONTHS_PER_YEAR,
  WORKING_DAYS_MONTHLY_5GG,
  WORKING_DAYS_MONTHLY_6GG,
} from './constants';

// ---------------------------------------------------------------------------
// Helper: calcolo IRPEF lorda su base annua
// ---------------------------------------------------------------------------
const calcGrossIrpef = (taxableAnnual: number): number => {
  let gross = 0;
  let prev = 0;
  for (const bracket of IRPEF_BRACKETS_2025) {
    if (taxableAnnual <= prev) break;
    const slice = Math.min(taxableAnnual, bracket.to) - prev;
    gross += slice * bracket.rate;
    prev = bracket.to;
  }
  return gross;
};

// ---------------------------------------------------------------------------
// Helper: detrazioni lavoro dipendente annuali (art. 13 TUIR)
// ---------------------------------------------------------------------------
const calcWorkDeduction = (taxableAnnual: number): number => {
  const d = WORK_DEDUCTIONS;
  if (taxableAnnual <= 0) return 0;
  if (taxableAnnual <= d.tier1_limit) return d.tier1_amount;
  if (taxableAnnual <= d.tier2_limit) {
    return d.tier2_base + d.tier2_extra * ((d.tier2_limit - taxableAnnual) / (d.tier2_limit - d.tier1_limit));
  }
  if (taxableAnnual <= d.tier3_limit) {
    return d.tier3_base * ((d.tier3_limit - taxableAnnual) / (d.tier3_limit - d.tier2_limit));
  }
  return 0;
};

// ---------------------------------------------------------------------------
// Helper: detrazioni carichi di famiglia (art. 12 TUIR)
// NB: dal 2022 i figli under 21 → AUU INPS (non detrazione IRPEF).
//     Qui si gestiscono figli over 21 + coniuge + altri.
// ---------------------------------------------------------------------------
const calcFamilyDeductions = (
  taxableAnnual: number,
  coniuge: boolean,
  figli: number,
  altri: number
): number => {
  if (taxableAnnual <= 0) return 0;
  let total = 0;

  // Coniuge a carico — art. 12 co. 1 lett. a TUIR
  if (coniuge) {
    if (taxableAnnual <= 15000) total += 800;
    else if (taxableAnnual <= 29000) total += 690 + 110 * ((29000 - taxableAnnual) / 14000);
    else if (taxableAnnual <= 35000) total += 700 * ((35000 - taxableAnnual) / 6000);
    else if (taxableAnnual <= 40000) total += 710 * ((40000 - taxableAnnual) / 5000);
    // coefficiente correttivo per redditi specifici omesso per semplicità
  }

  // Figli over 21 a carico (under 21 → AUU, non IRPEF)
  for (let i = 0; i < figli; i++) {
    // 950€ per figlio; +200€ se minore di 3 anni (non gestito qui senza data nascita)
    const detr = 950;
    const coeff = Math.max(0, (95000 - taxableAnnual) / 95000);
    total += detr * coeff;
  }

  // Altri familiari a carico — 750€ ciascuno proporzionale
  for (let i = 0; i < altri; i++) {
    const coeff = Math.max(0, (80000 - taxableAnnual) / 80000);
    total += 750 * coeff;
  }

  return Math.max(0, total);
};

// ---------------------------------------------------------------------------
// Helper: Cuneo Fiscale 2025 — L. 207/2024
// ---------------------------------------------------------------------------
const calcCuneo2025 = (
  taxableAnnual: number
): { bonus: number; detrazioneUlteriore: number } => {
  const c = CUNEO_FISCALE_2025;
  let bonus = 0;
  let detrazioneUlteriore = 0;

  if (taxableAnnual <= c.BONUS_TIER1.limit) {
    bonus = taxableAnnual * c.BONUS_TIER1.rate;
  } else if (taxableAnnual <= c.BONUS_TIER2.limit) {
    bonus = taxableAnnual * c.BONUS_TIER2.rate;
  } else if (taxableAnnual <= c.BONUS_TIER3.limit) {
    bonus = taxableAnnual * c.BONUS_TIER3.rate;
  } else if (taxableAnnual <= c.DETRAZIONE_PIENA.to) {
    detrazioneUlteriore = c.DETRAZIONE_PIENA.amount;
  } else if (taxableAnnual <= c.DETRAZIONE_SLIDING.to) {
    detrazioneUlteriore = c.DETRAZIONE_PIENA.amount *
      ((c.DETRAZIONE_SLIDING.to - taxableAnnual) /
       (c.DETRAZIONE_SLIDING.to - c.DETRAZIONE_PIENA.to));
  }

  return { bonus, detrazioneUlteriore };
};

// ---------------------------------------------------------------------------
// Helper: Trattamento Integrativo — art. 1 D.L. 3/2020 conv. L. 21/2020
// Importo annuo 1.200€; fascia 15k-28k condizionato alla capienza fiscale.
// ---------------------------------------------------------------------------
const calcTrattamentoIntegrativo = (
  taxableAnnual: number,
  annualGrossIrpef: number,
  workDeduction: number
): number => {
  if (taxableAnnual <= 15000) {
    // Spetta se c'è capienza fiscale (IRPEF lorda > detrazione lavoro dipendente)
    return annualGrossIrpef > workDeduction ? 1200 : 0;
  }
  if (taxableAnnual <= 28000) {
    // Spetta se la somma detrazioni per oneri eccede IRPEF lorda.
    // Non verificabile senza dati oneri individuali: si assume spettante
    // con apposito warning in UI (stimato).
    return 1200;
  }
  return 0;
};

// ---------------------------------------------------------------------------
// MAIN — calculatePayroll
// ---------------------------------------------------------------------------
export const calculatePayroll = (state: PayrollState): PayrollResult => {
  const tableEntry = SALARY_DATABASE[state.area];
  const positionDetail =
    tableEntry.positions[state.positionKey] ??
    Object.values(tableEntry.positions)[0];

  const workingDaysPerMonth = state.isFiveDayWeek
    ? WORKING_DAYS_MONTHLY_5GG
    : WORKING_DAYS_MONTHLY_6GG;

  // ─────────────────────────────────────────────────────────────────────────
  // 1. COMPETENZE LORDE MENSILI
  // ─────────────────────────────────────────────────────────────────────────
  const baseMonthly        = positionDetail.baseAnnual / MONTHS_PER_YEAR;
  const compartoMonthly    = tableEntry.indennitaCompartoMonthly;
  const ivcMonthly         = tableEntry.ivcMonthly;

  // Voci accessorie (inserite dall'utente)
  const accessorioFissoMensile =
    state.monthlyPoIndennita +
    state.monthlyPoRisultato +
    state.monthlySpecificheResponsabilita +
    state.monthlyTurno +
    state.monthlyReperibilita +
    state.monthlyDisagio +
    state.monthlyBilingue;

  const accessorioVariabileMensile =
    state.monthlyPerformance +
    state.monthlyProgetto +
    state.monthlyIncentivi113 +
    state.monthlyOrdStraordinario;

  // ─────────────────────────────────────────────────────────────────────────
  // 2. PENALIZZAZIONE BRUNETTA (Art. 71 D.Lgs. 150/2009)
  // Riduzione pari alla retribuzione giornaliera per i giorni 1-10 di malattia.
  // Base: stipendio tabellare + IVC + comparto (esclusi accessori).
  // Retribuzione giornaliera = retribuzione mensile fissa / gg lavorativi mese
  // ─────────────────────────────────────────────────────────────────────────
  const dailyBaseRetrib = (baseMonthly + compartoMonthly + ivcMonthly) / workingDaysPerMonth;
  const brunettaDays = Math.max(0, Math.min(state.sickDays, 10));
  const brunettaPenaltyMonthly = brunettaDays * dailyBaseRetrib;

  // ─────────────────────────────────────────────────────────────────────────
  // 3. LORDO MENSILE E ANNUALE
  // Il lordo mensile comprende tutte le voci senza la trattenuta Brunetta.
  // Le somme accessorie del FRD NON concorrono alla base imponibile INPS
  // ai fini pensionistici (GDP/CPDEL), ma concorrono a quella IRPEF.
  // ─────────────────────────────────────────────────────────────────────────
  const grossMonthly =
    baseMonthly + compartoMonthly + ivcMonthly +
    accessorioFissoMensile + accessorioVariabileMensile -
    brunettaPenaltyMonthly;

  const grossAnnual = grossMonthly * MONTHS_PER_YEAR; // esclusa tredicesima

  // ─────────────────────────────────────────────────────────────────────────
  // 4. BASE IMPONIBILE INPS (GDP — ex INPDAP)
  //    Base previdenziale CPDEL = stipendio tabellare + IVC + comparto
  //    Le voci del FRD (accessori variabili) sono escluse ai fini pensionistici.
  //    Fonte: art. 2, D.Lgs. 181/1997 e circolari INPS GDP
  // ─────────────────────────────────────────────────────────────────────────
  const basePrevidenzialeAnnual =
    (baseMonthly + compartoMonthly + ivcMonthly) * MONTHS_PER_YEAR;

  const socialContributionsAnnual = basePrevidenzialeAnnual * PREV_RATES.CPDEL;
  const fcContributionsAnnual     = basePrevidenzialeAnnual * PREV_RATES.FONDO_CREDITO;

  // Perseo-Sirio: base = retribuzione utile TFR (≈ tabellare + IVC + comparto)
  const perseoContributionAnnual = state.isPerseoSirio
    ? basePrevidenzialeAnnual * state.perseoContribRate
    : 0;

  const totalPrevidenzialeAnnual =
    socialContributionsAnnual + fcContributionsAnnual + perseoContributionAnnual;

  // ─────────────────────────────────────────────────────────────────────────
  // 5. BASE IMPONIBILE IRPEF (TUIR)
  //    = Lordo annuo - Contributi previdenziali totali dipendente
  // ─────────────────────────────────────────────────────────────────────────
  const taxableAnnual = grossAnnual - totalPrevidenzialeAnnual;

  // ─────────────────────────────────────────────────────────────────────────
  // 6. IRPEF LORDA ANNUALE
  // ─────────────────────────────────────────────────────────────────────────
  const grossIrpefAnnual = calcGrossIrpef(taxableAnnual);

  // ─────────────────────────────────────────────────────────────────────────
  // 7. DETRAZIONI
  // ─────────────────────────────────────────────────────────────────────────
  const workDeductionAnnual = calcWorkDeduction(taxableAnnual);
  const familyDeductionAnnual = calcFamilyDeductions(
    taxableAnnual,
    state.coniugeACarico,
    state.figliACarico,
    state.altriCarichi
  );

  const standardDeductionAnnual = workDeductionAnnual + familyDeductionAnnual;

  // ─────────────────────────────────────────────────────────────────────────
  // 8. CUNEO FISCALE 2025
  // ─────────────────────────────────────────────────────────────────────────
  const { bonus: bonusCuneoAnnual, detrazioneUlteriore: ulterioreDetrazioneCuneoAnnual } =
    state.useNuovoCuneoFiscal
      ? calcCuneo2025(taxableAnnual)
      : { bonus: 0, detrazioneUlteriore: 0 };

  // ─────────────────────────────────────────────────────────────────────────
  // 9. TRATTAMENTO INTEGRATIVO
  // ─────────────────────────────────────────────────────────────────────────
  const trattamentoIntegrativoAnnual = state.useTrattamentoIntegrativo
    ? calcTrattamentoIntegrativo(taxableAnnual, grossIrpefAnnual, workDeductionAnnual)
    : 0;

  // ─────────────────────────────────────────────────────────────────────────
  // 10. IRPEF NETTA ANNUALE
  // ─────────────────────────────────────────────────────────────────────────
  const netIrpefAnnual = Math.max(
    0,
    grossIrpefAnnual - standardDeductionAnnual - ulterioreDetrazioneCuneoAnnual
  );

  // ─────────────────────────────────────────────────────────────────────────
  // 11. ADDIZIONALI (ritenuta annua — pagata in 11 rate / anno successivo)
  // ─────────────────────────────────────────────────────────────────────────
  const regionData = REGIONS.find(r => r.name === state.region) ?? REGIONS[0];
  const regionalAddAnnual  = taxableAnnual * regionData.rate;
  const municipalAddAnnual = taxableAnnual * state.municipalAddRate;

  // ─────────────────────────────────────────────────────────────────────────
  // 12. NETTO ANNUALE E MENSILE
  // ─────────────────────────────────────────────────────────────────────────
  const totalNetAnnual =
    taxableAnnual
    - netIrpefAnnual
    - regionalAddAnnual
    - municipalAddAnnual
    + trattamentoIntegrativoAnnual
    + bonusCuneoAnnual;

  return {
    baseMonthly,
    compartoMonthly,
    ivcMonthly,
    poIndennitaMonthly:            state.monthlyPoIndennita,
    poRisultatoMonthly:            state.monthlyPoRisultato,
    specificheResponsabilitaMonthly: state.monthlySpecificheResponsabilita,
    turnoMonthly:                  state.monthlyTurno,
    reperibilitaMonthly:           state.monthlyReperibilita,
    disagioMonthly:                state.monthlyDisagio,
    performanceMonthly:            state.monthlyPerformance,
    progettoMonthly:               state.monthlyProgetto,
    incentivi113Monthly:           state.monthlyIncentivi113,
    straordinarioMonthly:          state.monthlyOrdStraordinario,

    grossMonthly,
    grossAnnual,

    socialContributions:   socialContributionsAnnual  / MONTHS_PER_YEAR,
    fcContributions:       fcContributionsAnnual      / MONTHS_PER_YEAR,
    perseoContribution:    perseoContributionAnnual   / MONTHS_PER_YEAR,

    taxableIncome:  taxableAnnual / MONTHS_PER_YEAR,
    taxableAnnual,

    grossIrpefAnnual,
    standardDeductionAnnual,
    detrazioniCarichi: familyDeductionAnnual,
    irpef: netIrpefAnnual / MONTHS_PER_YEAR,

    regionalAdd:  regionalAddAnnual  / MONTHS_PER_YEAR,
    municipalAdd: municipalAddAnnual / MONTHS_PER_YEAR,

    trattamentoIntegrativo: trattamentoIntegrativoAnnual / MONTHS_PER_YEAR,
    bonusCuneo:             bonusCuneoAnnual             / MONTHS_PER_YEAR,
    ulterioreDetrazioneCuneo: ulterioreDetrazioneCuneoAnnual / MONTHS_PER_YEAR,
    ulterioreDetrazioneCuneoAnnual,

    brunettaPenaltyMonthly,
    netIncome: totalNetAnnual / MONTHS_PER_YEAR,
  };
};

// ---------------------------------------------------------------------------
// Ferie spettanti (art. 28 CCNL Funzioni Locali)
// ---------------------------------------------------------------------------
export const getLeaveEntitlement = (isFiveDayWeek: boolean): number => {
  return isFiveDayWeek ? 28 : 32;
};
