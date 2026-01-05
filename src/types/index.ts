export type UtilityResponsible = 'holding' | 'tenant';

export interface UtilityConfig {
  enabled: boolean;
  responsible: UtilityResponsible;
}

export interface PropertyUtilities {
  water: UtilityConfig;
  electricity: UtilityConfig;
  gas: UtilityConfig;
  condo: UtilityConfig;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  type: 'apartment' | 'house' | 'commercial' | 'land' | 'kitnet';
  status: 'rented' | 'vacant' | 'renovation' | 'sale';
  totalArea: number;
  usefulArea: number;
  bedrooms: number;
  suites: number;
  bathrooms: number;
  parkingSpaces: number;
  acquisitionCost: number;
  renovationCost: number;
  currentMarketValue: number;
  monthlyRent: number;
  iptu: number;
  condoFee: number;
  acquisitionDate: string;
  currentTenantId?: string;
  imageUrl?: string;
  utilities?: PropertyUtilities;
}

export interface Tenant {
  id: string;
  name: string;
  document: string;
  documentType: 'cpf' | 'cnpj';
  email: string;
  phone: string;
  guarantorName?: string;
  guarantorDocument?: string;
  hasInsurance: boolean;
  rating: number;
  status: 'active' | 'former' | 'candidate';
  notes?: string;
}

export interface RentalHistory {
  id: string;
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  paymentHistory: PaymentRecord[];
}

export interface PaymentRecord {
  id: string;
  month: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  status: 'paid' | 'pending' | 'late';
}

export interface Furniture {
  id: string;
  propertyId: string;
  name: string;
  category: string;
  purchaseDate: string;
  purchaseValue: number;
  warrantyEndDate?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface Alert {
  id: string;
  type: 'delinquency' | 'vacancy' | 'maintenance' | 'contract';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  propertyId?: string;
  tenantId?: string;
  date: string;
  read: boolean;
}

export interface FinancialRecord {
  month: string;
  year: number;
  propertyId: string;
  grossRevenue: number;
  iptu: number;
  condoFee: number;
  maintenance: number;
  taxes: number;
  netRevenue: number;
}
