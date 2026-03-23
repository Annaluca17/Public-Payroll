
import { PayrollState, PayrollResult } from './types';
import { SALARY_DATABASE, PREV_RATES, IRPEF_BRACKETS, REGIONS } from './constants';

export const calculatePayroll = (state: PayrollState): PayrollResult => {
  const tableEntry = SALARY_DATABASE[state.area];
  const positionDetail = tableEntry.positions[state.formerPosition] || Object.values(tableEntry.positions)[0];
  
  // 1. COMPONENTI LORDE ANNUALI
  const baseAnnual = positionDetail.baseAnnual;
  const compartoAnnual = tableEntry.indennitaComparto;
  const ivcAnnual = tableEntry.ivcAnnual;
  const accessoryAnnual = state.monthlyPerformance * 12;

  // Trattenuta Brunetta (penalizzazione accessorio primi 10gg malattia)
  const dailyAccessory = tableEntry.indennitaComparto / 365;
  const brunettaPenaltyAnnual = Math.min(state.sickDays, 10) * dailyAccessory;
  
  const totalAnnualGross = baseAnnual + compartoAnnual + ivcAnnual + accessoryAnnual - brunettaPenaltyAnnual;
  
  // 2. CONTRIBUTI PREVIDENZIALI (Ex-INPDAP)
  const annualSocialContrib = totalAnnualGross * PREV_RATES.CPDEL;
  const annualFcContrib = totalAnnualGross * PREV_RATES.FONDO_CREDITO;
  const annualPerseoContrib = state.isPerseoSirio ? (totalAnnualGross * 0.01) : 0;

  const annualTaxable = totalAnnualGross - annualSocialContrib - annualFcContrib - annualPerseoContrib;

  // 3. IRPEF LORDA (Annuale)
  let annualGrossIrpef = 0;
  let remainingTaxable = annualTaxable;
  let prevLimit = 0;

  for (const bracket of IRPEF_BRACKETS) {
    const amountInBracket = Math.max(0, Math.min(remainingTaxable, bracket.limit - prevLimit));
    annualGrossIrpef += amountInBracket * bracket.rate;
    remainingTaxable -= amountInBracket;
    prevLimit = bracket.limit;
    if (remainingTaxable <= 0) break;
  }

  // 4. DETRAZIONI LAVORO DIPENDENTE (Annuale)
  let standardDeductionAnnual = 0;
  if (annualTaxable <= 15000) {
    standardDeductionAnnual = 1955;
  } else if (annualTaxable <= 28000) {
    standardDeductionAnnual = 1910 + 1190 * ((28000 - annualTaxable) / 13000);
  } else if (annualTaxable <= 50000) {
    standardDeductionAnnual = 1910 * ((50000 - annualTaxable) / 22000);
  }

  // 5. TRATTAMENTO INTEGRATIVO (EX BONUS 100€)
  // Nota: Credito fiscale post-tax, non entra nel calcolo dell'imponibile.
  let trattamentoIntegrativoAnnual = 0;
  if (state.useTrattamentoIntegrativo) {
    if (annualTaxable <= 15000) {
      // Pieno diritto se l'imposta lorda supera la detrazione (capienza)
      if (annualGrossIrpef > standardDeductionAnnual) {
        trattamentoIntegrativoAnnual = 1200;
      }
    } else if (annualTaxable <= 28000) {
      // Per redditi tra 15k e 28k spetta se la somma di alcune detrazioni supera l'imposta lorda.
      // In un simulatore standard si assume che se attivato l'utente ha detrazioni per oneri che giustificano il bonus.
      // Calcoliamo la differenza teorica rispetto alla detrazione da lavoro dipendente.
      trattamentoIntegrativoAnnual = 1200; 
    }
  }

  // 6. NUOVO CUNEO FISCALE (RIFORMA 2025/2026)
  let bonusCuneoAnnual = 0;
  let ulterioreDetrazioneCuneoAnnual = 0;

  if (state.useNuovoCuneoFiscal) {
    if (annualTaxable <= 20000) {
      bonusCuneoAnnual = annualTaxable * 0.071;
    } else if (annualTaxable <= 32000) {
      ulterioreDetrazioneCuneoAnnual = 1000;
    } else if (annualTaxable <= 40000) {
      ulterioreDetrazioneCuneoAnnual = 1000 * ((40000 - annualTaxable) / 8000);
    }
  }

  // 7. CALCOLO FINALE TASSE E NETTO
  const netIrpefAnnual = Math.max(0, annualGrossIrpef - standardDeductionAnnual - ulterioreDetrazioneCuneoAnnual);
  
  const regionData = REGIONS.find(r => r.name === state.region) || REGIONS[1];
  const regionalAddAnnual = annualTaxable * regionData.rate;
  const municipalAddAnnual = annualTaxable * 0.008; 

  const totalNetAnnual = (annualTaxable - netIrpefAnnual - regionalAddAnnual - municipalAddAnnual) 
                        + trattamentoIntegrativoAnnual 
                        + bonusCuneoAnnual;

  // 8. RIPARTIZIONE MENSILE
  return {
    grossMonthly: totalAnnualGross / 13,
    grossAnnual: totalAnnualGross,
    baseMonthly: baseAnnual / 12,
    compartoMonthly: compartoAnnual / 12,
    ivcMonthly: ivcAnnual / 12,
    accessoryMonthly: state.monthlyPerformance,
    brunettaPenaltyMonthly: brunettaPenaltyAnnual / 12,
    socialContributions: annualSocialContrib / 12,
    fcContributions: annualFcContrib / 12,
    perseoContribution: annualPerseoContrib / 12,
    taxableIncome: annualTaxable / 12,
    taxableAnnual: annualTaxable,
    grossIrpefAnnual: annualGrossIrpef,
    standardDeductionAnnual,
    irpef: netIrpefAnnual / 12,
    regionalAdd: regionalAddAnnual / 12,
    municipalAdd: municipalAddAnnual / 12,
    netIncome: totalNetAnnual / 12,
    trattamentoIntegrativo: trattamentoIntegrativoAnnual / 12,
    bonusCuneo: bonusCuneoAnnual / 12,
    ulterioreDetrazioneCuneo: ulterioreDetrazioneCuneoAnnual / 12
  };
};

export const getLeaveEntitlement = (isFiveDayWeek: boolean): number => {
  return isFiveDayWeek ? 28 : 32;
};
