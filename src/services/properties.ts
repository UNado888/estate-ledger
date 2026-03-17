import { Property } from '@/types';
import { getItem, setItem, updateItem } from './storage';
import { mockProperties } from '@/data/mockData';

const STORAGE_KEY = 'imobiliaria-properties';

export const propertiesService = {
  getAll(): Property[] {
    return getItem<Property[]>(STORAGE_KEY, mockProperties);
  },

  getById(id: string): Property | undefined {
    return this.getAll().find(p => p.id === id);
  },

  create(property: Property): Property[] {
    return updateItem<Property[]>(STORAGE_KEY, mockProperties, prev => [...prev, property]);
  },

  update(property: Property): Property[] {
    return updateItem<Property[]>(STORAGE_KEY, mockProperties, prev =>
      prev.map(p => p.id === property.id ? property : p)
    );
  },

  remove(id: string): Property[] {
    return updateItem<Property[]>(STORAGE_KEY, mockProperties, prev =>
      prev.filter(p => p.id !== id)
    );
  },

  save(properties: Property[]): void {
    setItem(STORAGE_KEY, properties);
  },
};
