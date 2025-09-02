import { getUnitsForAllocation } from './api/inventory';
import type { BloodGroup, InventoryItem } from '../types/database';

export interface FEFOAllocation {
  inventoryItems: InventoryItem[];
  totalVolume: number;
  canFulfill: boolean;
}

export const calculateFEFOAllocation = async (
  bloodGroup: BloodGroup,
  requestedUnits: number
): Promise<FEFOAllocation> => {
  try {
    // Get more units than requested to ensure we have options
    const availableUnits = await getUnitsForAllocation(bloodGroup, requestedUnits * 2);
    
    if (!availableUnits || availableUnits.length === 0) {
      return {
        inventoryItems: [],
        totalVolume: 0,
        canFulfill: false,
      };
    }

    // Take the earliest expiring units up to the requested quantity
    const selectedUnits = availableUnits.slice(0, requestedUnits);
    const totalVolume = selectedUnits.reduce((sum, unit) => sum + unit.volume_ml, 0);
    const canFulfill = selectedUnits.length === requestedUnits;

    return {
      inventoryItems: selectedUnits,
      totalVolume,
      canFulfill,
    };
  } catch (error) {
    console.error('Error calculating FEFO allocation:', error);
    return {
      inventoryItems: [],
      totalVolume: 0,
      canFulfill: false,
    };
  }
};

export const getExpiryPriority = (expiryDate: string): 'critical' | 'warning' | 'normal' => {
  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 7) return 'critical';
  if (daysUntilExpiry <= 14) return 'warning';
  return 'normal';
};

export const validateExpiryDate = (collectedDate: string, expiryDate: string): boolean => {
  const collected = new Date(collectedDate);
  const expiry = new Date(expiryDate);
  const diffDays = Math.floor((expiry.getTime() - collected.getTime()) / (1000 * 60 * 60 * 24));
  
  // Blood typically has a shelf life of 35-42 days
  return diffDays >= 1 && diffDays <= 42;
};