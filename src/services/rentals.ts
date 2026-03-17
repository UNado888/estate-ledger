import { RentalHistory } from '@/types';
import { getItem, setItem, updateItem } from './storage';
import { mockRentalHistory } from '@/data/mockData';

const STORAGE_KEY = 'imobiliaria-rental-history';

export const rentalsService = {
  getAll(): RentalHistory[] {
    return getItem<RentalHistory[]>(STORAGE_KEY, mockRentalHistory);
  },

  getByPropertyId(propertyId: string): RentalHistory[] {
    return this.getAll().filter(r => r.propertyId === propertyId);
  },

  getActiveByPropertyId(propertyId: string): RentalHistory | undefined {
    return this.getAll().find(r => r.propertyId === propertyId && !r.endDate);
  },

  create(rental: RentalHistory): RentalHistory[] {
    return updateItem<RentalHistory[]>(STORAGE_KEY, mockRentalHistory, prev => [...prev, rental]);
  },

  update(rental: RentalHistory): RentalHistory[] {
    return updateItem<RentalHistory[]>(STORAGE_KEY, mockRentalHistory, prev =>
      prev.map(r => r.id === rental.id ? rental : r)
    );
  },

  save(rentals: RentalHistory[]): void {
    setItem(STORAGE_KEY, rentals);
  },
};
