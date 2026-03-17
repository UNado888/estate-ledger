import { Tenant } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { mockTenants } from '@/data/mockData';

const STORAGE_KEY = 'imobiliaria-tenants';

export function useTenants() {
  const [tenants, setTenants] = useLocalStorage<Tenant[]>(STORAGE_KEY, mockTenants);

  const addTenant = (tenant: Tenant) => {
    setTenants(prev => [...prev, tenant]);
  };

  const updateTenant = (tenant: Tenant) => {
    setTenants(prev => prev.map(t => t.id === tenant.id ? tenant : t));
  };

  const removeTenant = (id: string) => {
    setTenants(prev => prev.filter(t => t.id !== id));
  };

  return {
    tenants,
    setTenants,
    addTenant,
    updateTenant,
    removeTenant,
  };
}
