import { RentalHistory } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { mockRentalHistory } from '@/data/mockData';

const STORAGE_KEY = 'imobiliaria-rental-history';

export function useRentalHistory() {
  const [rentalHistory, setRentalHistory] = useLocalStorage<RentalHistory[]>(STORAGE_KEY, mockRentalHistory);

  const addRental = (rental: RentalHistory) => {
    setRentalHistory(prev => [...prev, rental]);
  };

  const updateRental = (rental: RentalHistory) => {
    setRentalHistory(prev => prev.map(r => r.id === rental.id ? rental : r));
  };

  const getByPropertyId = (propertyId: string) => {
    return rentalHistory.filter(r => r.propertyId === propertyId);
  };

  const getActiveByPropertyId = (propertyId: string) => {
    return rentalHistory.find(r => r.propertyId === propertyId && !r.endDate);
  };

  return {
    rentalHistory,
    setRentalHistory,
    addRental,
    updateRental,
    getByPropertyId,
    getActiveByPropertyId,
  };
}
