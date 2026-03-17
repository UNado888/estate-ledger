import { Tenant } from '@/types';
import { getItem, setItem, updateItem } from './storage';
import { mockTenants } from '@/data/mockData';

const STORAGE_KEY = 'imobiliaria-tenants';

export const tenantsService = {
  getAll(): Tenant[] {
    return getItem<Tenant[]>(STORAGE_KEY, mockTenants);
  },

  getById(id: string): Tenant | undefined {
    return this.getAll().find(t => t.id === id);
  },

  create(tenant: Tenant): Tenant[] {
    return updateItem<Tenant[]>(STORAGE_KEY, mockTenants, prev => [...prev, tenant]);
  },

  update(tenant: Tenant): Tenant[] {
    return updateItem<Tenant[]>(STORAGE_KEY, mockTenants, prev =>
      prev.map(t => t.id === tenant.id ? tenant : t)
    );
  },

  remove(id: string): Tenant[] {
    return updateItem<Tenant[]>(STORAGE_KEY, mockTenants, prev =>
      prev.filter(t => t.id !== id)
    );
  },

  save(tenants: Tenant[]): void {
    setItem(STORAGE_KEY, tenants);
  },
};
