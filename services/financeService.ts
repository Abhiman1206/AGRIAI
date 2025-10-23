import { FarmerCreditProfile, CreditScore } from '../types';

export const calculateCreditScore = (profile: FarmerCreditProfile): CreditScore => {
  const { farmProductivityScore, transactionReliabilityScore, repaymentHistoryScore } = profile;

  // Simple weighted average to calculate a base score component.
  const scoreComponent =
    (farmProductivityScore * 0.35) +
    (transactionReliabilityScore * 0.45) +
    (repaymentHistoryScore * 0.20);
  
  // Scale score to the standard 300-900 credit score range.
  const score = Math.round(300 + scoreComponent * 600);
  
  let rating: CreditScore['rating'] = 'Poor';
  let eligibility = "Eligible for basic Agri-loans with potential for higher interest rates.";

  if (score > 800) {
      rating = 'Excellent';
      eligibility = "Eligible for premium loans with lowest interest rates and flexible terms.";
  } else if (score > 740) {
      rating = 'Good';
      eligibility = "Eligible for a wide range of loans with competitive interest rates.";
  } else if (score > 670) {
      rating = 'Fair';
      eligibility = "Eligible for standard loans. Some conditions may apply.";
  }
  
  return { score, rating, eligibility };
};

// Mock function to calculate insurance premium
export const calculateInsurancePremium = (crop: string, area: number, sumInsured: number): number => {
    if (!area || !sumInsured) return 0;
    // Base rate (e.g., 2% for Kharif, 1.5% for Rabi) - simplified
    const baseRate = crop.toLowerCase() === 'mustard' ? 0.015 : 0.02;
    // Simple calculation
    const premium = sumInsured * baseRate;
    return parseFloat(premium.toFixed(2));
};
