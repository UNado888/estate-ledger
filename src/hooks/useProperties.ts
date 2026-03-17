import { Property } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { mockProperties } from '@/data/mockData';

const STORAGE_KEY = 'imobiliaria-properties';

export function useProperties() {
  const [properties, setProperties] = useLocalStorage<Property[]>(STORAGE_KEY, mockProperties);

  const addProperty = (property: Property) => {
    setProperties(prev => [...prev, property]);
  };

  const updateProperty = (property: Property) => {
    setProperties(prev => prev.map(p => p.id === property.id ? property : p));
  };

  const removeProperty = (id: string) => {
    setProperties(prev => prev.filter(p => p.id !== id));
  };

  return {
    properties,
    setProperties,
    addProperty,
    updateProperty,
    removeProperty,
  };
}
