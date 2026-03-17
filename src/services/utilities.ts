import { UtilityPaymentRecord } from '@/types';
import { getItem, setItem, updateItem } from './storage';

const STORAGE_KEY = 'imobiliaria-utility-payments';

export const utilitiesService = {
  getAll(): UtilityPaymentRecord[] {
    return getItem<UtilityPaymentRecord[]>(STORAGE_KEY, []);
  },

  getByPropertyId(propertyId: string): UtilityPaymentRecord[] {
    return this.getAll().filter(p => p.propertyId === propertyId);
  },

  create(payment: UtilityPaymentRecord): UtilityPaymentRecord[] {
    return updateItem<UtilityPaymentRecord[]>(STORAGE_KEY, [], prev => [payment, ...prev]);
  },

  update(payment: UtilityPaymentRecord): UtilityPaymentRecord[] {
    return updateItem<UtilityPaymentRecord[]>(STORAGE_KEY, [], prev =>
      prev.map(p => p.id === payment.id ? payment : p)
    );
  },

  remove(id: string): UtilityPaymentRecord[] {
    return updateItem<UtilityPaymentRecord[]>(STORAGE_KEY, [], prev =>
      prev.filter(p => p.id !== id)
    );
  },

  save(payments: UtilityPaymentRecord[]): void {
    setItem(STORAGE_KEY, payments);
  },
};
