import { Vehicle } from '../types';

// Fallback high-res vehicle placeholder image
export const DEFAULT_VEHICLE_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80';

// Safely parse vehicle images JSON or string array
export function getVehicleImages(vehicle: Vehicle): string[] {
  if (!vehicle.images) return [DEFAULT_VEHICLE_IMAGE];
  if (Array.isArray(vehicle.images)) {
    return vehicle.images.length > 0 ? vehicle.images : [DEFAULT_VEHICLE_IMAGE];
  }
  try {
    const parsed = JSON.parse(vehicle.images);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    if (typeof vehicle.images === 'string' && vehicle.images.startsWith('http')) {
      return [vehicle.images];
    }
  }
  return [DEFAULT_VEHICLE_IMAGE];
}

// Safely parse vehicle tags JSON or string array
export function getVehicleTags(vehicle: Vehicle): string[] {
  if (!vehicle.tags) return [];
  if (Array.isArray(vehicle.tags)) return vehicle.tags;
  try {
    const parsed = JSON.parse(vehicle.tags);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {
    if (typeof vehicle.tags === 'string' && vehicle.tags.trim()) {
      return [vehicle.tags.trim()];
    }
  }
  return [];
}

// Calculate EMI Monthly Financing Payment
// Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
export function calculateEMI(
  price: number,
  downPayment: number,
  annualInterestRate: number,
  loanMonths: number
): { monthlyPayment: number; totalInterest: number; totalLoanAmount: number } {
  const principal = Math.max(0, price - downPayment);
  if (principal <= 0 || loanMonths <= 0) {
    return { monthlyPayment: 0, totalInterest: 0, totalLoanAmount: 0 };
  }

  const monthlyRate = annualInterestRate / 12 / 100;
  if (monthlyRate === 0) {
    return {
      monthlyPayment: principal / loanMonths,
      totalInterest: 0,
      totalLoanAmount: principal,
    };
  }

  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, loanMonths);
  const denominator = Math.pow(1 + monthlyRate, loanMonths) - 1;
  const monthlyPayment = numerator / denominator;
  const totalPaid = monthlyPayment * loanMonths;
  const totalInterest = Math.max(0, totalPaid - principal);

  return {
    monthlyPayment,
    totalInterest,
    totalLoanAmount: principal,
  };
}
