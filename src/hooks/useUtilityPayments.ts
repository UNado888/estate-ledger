import { UtilityPaymentRecord } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const STORAGE_KEY = 'imobiliaria-utility-payments';

export function useUtilityPayments() {
  const [utilityPayments, setUtilityPayments] = useLocalStorage<UtilityPaymentRecord[]>(STORAGE_KEY, []);

  const addPayment = (payment: UtilityPaymentRecord) => {
    setUtilityPayments(prev => [payment, ...prev]);
  };

  const updatePayment = (payment: UtilityPaymentRecord) => {
    setUtilityPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
  };

  const removePayment = (id: string) => {
    setUtilityPayments(prev => prev.filter(p => p.id !== id));
  };

  const getByPropertyId = (propertyId: string) => {
    return utilityPayments.filter(p => p.propertyId === propertyId);
  };

  return {
    utilityPayments,
    setUtilityPayments,
    addPayment,
    updatePayment,
    removePayment,
    getByPropertyId,
  };
}
