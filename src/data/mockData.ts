import { Property, Tenant, Alert, FinancialRecord, RentalHistory, Furniture, PaymentRecord } from '@/types';

// Increment this version whenever mock data changes to invalidate localStorage cache
export const MOCK_DATA_VERSION = 3;
export const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Edifício Aurora - Apt 1201',
    address: 'Av. Atlântica, 1500',
    city: 'Rio de Janeiro',
    type: 'apartment',
    status: 'rented',
    totalArea: 120,
    usefulArea: 98,
    bedrooms: 3,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 2,
    acquisitionCost: 850000,
    renovationCost: 45000,
    currentMarketValue: 1250000,
    monthlyRent: 5500,
    iptu: 380,
    condoFee: 1200,
    acquisitionDate: '2015-03-15',
    currentTenantId: '1',
  },
  {
    id: '2',
    name: 'Casa Jardim Europa',
    address: 'Rua das Palmeiras, 280',
    city: 'São Paulo',
    type: 'house',
    status: 'rented',
    totalArea: 350,
    usefulArea: 280,
    bedrooms: 4,
    suites: 2,
    bathrooms: 4,
    parkingSpaces: 4,
    acquisitionCost: 2200000,
    renovationCost: 180000,
    currentMarketValue: 3500000,
    monthlyRent: 15000,
    iptu: 850,
    condoFee: 0,
    acquisitionDate: '2018-08-20',
    currentTenantId: '2',
  },
  {
    id: '3',
    name: 'Sala Comercial Torre Norte',
    address: 'Av. Faria Lima, 3000',
    city: 'São Paulo',
    type: 'commercial',
    status: 'vacant',
    totalArea: 80,
    usefulArea: 75,
    bedrooms: 0,
    suites: 0,
    bathrooms: 2,
    parkingSpaces: 2,
    acquisitionCost: 650000,
    renovationCost: 35000,
    currentMarketValue: 920000,
    monthlyRent: 4500,
    iptu: 420,
    condoFee: 950,
    acquisitionDate: '2019-11-10',
  },
  {
    id: '4',
    name: 'Apartamento Beira Mar',
    address: 'Av. Beira Mar, 850',
    city: 'Florianópolis',
    type: 'apartment',
    status: 'rented',
    totalArea: 95,
    usefulArea: 82,
    bedrooms: 2,
    suites: 1,
    bathrooms: 2,
    parkingSpaces: 1,
    acquisitionCost: 720000,
    renovationCost: 95000,
    currentMarketValue: 980000,
    monthlyRent: 4200,
    iptu: 290,
    condoFee: 780,
    acquisitionDate: '2020-06-25',
    currentTenantId: '6',
  },
  {
    id: '5',
    name: 'Cobertura Duplex Leblon',
    address: 'Rua Dias Ferreira, 200',
    city: 'Rio de Janeiro',
    type: 'apartment',
    status: 'rented',
    totalArea: 280,
    usefulArea: 240,
    bedrooms: 4,
    suites: 3,
    bathrooms: 5,
    parkingSpaces: 3,
    acquisitionCost: 4500000,
    renovationCost: 250000,
    currentMarketValue: 6200000,
    monthlyRent: 28000,
    iptu: 1200,
    condoFee: 2800,
    acquisitionDate: '2016-12-01',
    currentTenantId: '3',
  },
  {
    id: '6',
    name: 'Kitnet Centro Histórico',
    address: 'Rua da Quitanda, 45',
    city: 'Rio de Janeiro',
    type: 'kitnet',
    status: 'rented',
    totalArea: 35,
    usefulArea: 30,
    bedrooms: 1,
    suites: 0,
    bathrooms: 1,
    parkingSpaces: 0,
    acquisitionCost: 280000,
    renovationCost: 15000,
    currentMarketValue: 380000,
    monthlyRent: 1800,
    iptu: 120,
    condoFee: 450,
    acquisitionDate: '2021-04-10',
    currentTenantId: '7',
  },
  {
    id: '7',
    name: 'Loja Comercial Copacabana',
    address: 'Av. N.S. de Copacabana, 680',
    city: 'Rio de Janeiro',
    type: 'commercial',
    status: 'rented',
    totalArea: 120,
    usefulArea: 110,
    bedrooms: 0,
    suites: 0,
    bathrooms: 2,
    parkingSpaces: 0,
    acquisitionCost: 1200000,
    renovationCost: 80000,
    currentMarketValue: 1650000,
    monthlyRent: 9500,
    iptu: 650,
    condoFee: 1100,
    acquisitionDate: '2017-09-15',
    currentTenantId: '8',
  },
  {
    id: '8',
    name: 'Casa de Praia Búzios',
    address: 'Rua das Pedras, 150',
    city: 'Búzios',
    type: 'house',
    status: 'rented',
    totalArea: 200,
    usefulArea: 170,
    bedrooms: 3,
    suites: 2,
    bathrooms: 3,
    parkingSpaces: 2,
    acquisitionCost: 1500000,
    renovationCost: 120000,
    currentMarketValue: 2200000,
    monthlyRent: 8000,
    iptu: 480,
    condoFee: 0,
    acquisitionDate: '2019-02-20',
    currentTenantId: '9',
  },
];

export const mockTenants: Tenant[] = [
  {
    id: '1',
    name: 'Maria Silva Santos',
    document: '123.456.789-00',
    documentType: 'cpf',
    email: 'maria.silva@email.com',
    phone: '(21) 98765-4321',
    guarantorName: 'José Carlos Santos',
    guarantorDocument: '987.654.321-00',
    hasInsurance: true,
    rating: 5,
    status: 'active',
    notes: 'Excelente inquilina, sempre pontual.',
  },
  {
    id: '2',
    name: 'Tech Solutions Ltda',
    document: '12.345.678/0001-90',
    documentType: 'cnpj',
    email: 'contato@techsolutions.com.br',
    phone: '(11) 3456-7890',
    hasInsurance: true,
    rating: 4,
    status: 'active',
  },
  {
    id: '3',
    name: 'Roberto Almeida',
    document: '456.789.123-00',
    documentType: 'cpf',
    email: 'roberto.almeida@email.com',
    phone: '(21) 99876-5432',
    guarantorName: 'Ana Almeida',
    guarantorDocument: '654.321.987-00',
    hasInsurance: false,
    rating: 4,
    status: 'active',
  },
  {
    id: '4',
    name: 'Carlos Eduardo Lima',
    document: '789.123.456-00',
    documentType: 'cpf',
    email: 'carlos.lima@email.com',
    phone: '(48) 98765-1234',
    hasInsurance: true,
    rating: 3,
    status: 'former',
    notes: 'Alguns atrasos nos últimos meses.',
  },
  {
    id: '5',
    name: 'Startup Inovação SA',
    document: '98.765.432/0001-10',
    documentType: 'cnpj',
    email: 'financeiro@startupinovacao.com',
    phone: '(11) 2345-6789',
    hasInsurance: true,
    rating: 5,
    status: 'candidate',
  },
  {
    id: '6',
    name: 'Fernanda Costa Oliveira',
    document: '321.654.987-00',
    documentType: 'cpf',
    email: 'fernanda.costa@email.com',
    phone: '(48) 99123-4567',
    guarantorName: 'Ricardo Costa',
    guarantorDocument: '147.258.369-00',
    hasInsurance: true,
    rating: 4,
    status: 'active',
  },
  {
    id: '7',
    name: 'Lucas Pereira Mendes',
    document: '654.987.321-00',
    documentType: 'cpf',
    email: 'lucas.mendes@email.com',
    phone: '(21) 97654-3210',
    hasInsurance: false,
    rating: 3,
    status: 'active',
    notes: 'Inquilino desde 2022, pagamentos geralmente em dia.',
  },
  {
    id: '8',
    name: 'Gourmet Express Ltda',
    document: '45.678.901/0001-23',
    documentType: 'cnpj',
    email: 'contato@gourmetexpress.com.br',
    phone: '(21) 3344-5566',
    hasInsurance: true,
    rating: 5,
    status: 'active',
    notes: 'Restaurante estabelecido, contrato de 5 anos.',
  },
  {
    id: '9',
    name: 'Ana Beatriz Ferreira',
    document: '987.321.654-00',
    documentType: 'cpf',
    email: 'ana.ferreira@email.com',
    phone: '(22) 98877-6655',
    guarantorName: 'Paulo Ferreira',
    guarantorDocument: '369.258.147-00',
    hasInsurance: true,
    rating: 4,
    status: 'active',
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: 'vacancy',
    severity: 'high',
    title: 'Vacância Crítica',
    message: 'Sala Comercial Torre Norte está vaga há 45 dias, acima da média regional de 30 dias.',
    propertyId: '3',
    date: '2024-01-15',
    read: false,
  },
  {
    id: '2',
    type: 'maintenance',
    severity: 'medium',
    title: 'Manutenção Programada',
    message: 'Vencimento do seguro do Edifício Aurora em 15 dias.',
    propertyId: '1',
    date: '2024-01-18',
    read: false,
  },
  {
    id: '3',
    type: 'contract',
    severity: 'low',
    title: 'Reajuste Anual',
    message: 'Contrato da Casa Jardim Europa elegível para reajuste IGPM em 30 dias.',
    propertyId: '2',
    date: '2024-01-20',
    read: true,
  },
  {
    id: '4',
    type: 'delinquency',
    severity: 'high',
    title: 'Pagamento Atrasado',
    message: 'Aluguel de Janeiro da Cobertura Leblon não registrado após vencimento.',
    propertyId: '5',
    tenantId: '3',
    date: '2024-01-10',
    read: false,
  },
];

export const generateFinancialHistory = (): FinancialRecord[] => {
  const records: FinancialRecord[] = [];
  const properties = mockProperties;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  for (let year = 2014; year <= currentYear; year++) {
    for (let month = 1; month <= 12; month++) {
      if (year === currentYear && month > currentMonth) break;
      
      properties.forEach(property => {
        const baseRent = property.monthlyRent * (1 - (currentYear - year) * 0.03);
        const variation = 0.95 + Math.random() * 0.1;
        
        records.push({
          month: `${year}-${month.toString().padStart(2, '0')}`,
          year,
          propertyId: property.id,
          grossRevenue: Math.round(baseRent * variation),
          iptu: property.iptu,
          condoFee: property.condoFee,
          maintenance: Math.round(Math.random() * 500),
          taxes: Math.round(baseRent * 0.05),
          netRevenue: Math.round(baseRent * variation - property.iptu - property.condoFee - Math.random() * 500 - baseRent * 0.05),
        });
      });
    }
  }
  
  return records;
};

export const mockFinancialHistory = generateFinancialHistory();

// Generate payment records for a rental period
const generatePayments = (
  startDate: string,
  endDate: string | undefined,
  monthlyRent: number,
  lateChance = 0.1,
  pendingRecentMonths = 0
): PaymentRecord[] => {
  const payments: PaymentRecord[] = [];
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  let id = 1;

  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  while (cur <= end) {
    const year = cur.getFullYear();
    const month = cur.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const dueDate = `${year}-${String(month).padStart(2, '0')}-05`;

    const monthsFromEnd = (end.getFullYear() - year) * 12 + (end.getMonth() + 1 - month);
    let status: 'paid' | 'late' | 'pending';
    let paidDate: string | undefined;

    if (!endDate && monthsFromEnd < pendingRecentMonths) {
      status = 'pending';
    } else if (Math.random() < lateChance) {
      status = 'late';
      const lateDay = 15 + Math.floor(Math.random() * 15);
      paidDate = `${year}-${String(month).padStart(2, '0')}-${String(Math.min(lateDay, 28)).padStart(2, '0')}`;
    } else {
      status = 'paid';
      const payDay = 1 + Math.floor(Math.random() * 5);
      paidDate = `${year}-${String(month).padStart(2, '0')}-${String(payDay).padStart(2, '0')}`;
    }

    const variation = 0.98 + Math.random() * 0.04;
    payments.push({
      id: String(id++),
      month: monthStr,
      dueDate,
      paidDate,
      amount: Math.round(monthlyRent * variation),
      status,
    });

    cur.setMonth(cur.getMonth() + 1);
  }
  return payments;
};

export const mockRentalHistory: RentalHistory[] = [
  {
    id: '1',
    propertyId: '1',
    tenantId: '1',
    startDate: '2022-03-01',
    monthlyRent: 5500,
    paymentHistory: generatePayments('2022-03-01', undefined, 5500, 0.05, 1),
  },
  {
    id: '2',
    propertyId: '1',
    tenantId: '4',
    startDate: '2019-06-01',
    endDate: '2022-02-28',
    monthlyRent: 4800,
    paymentHistory: generatePayments('2019-06-01', '2022-02-28', 4800, 0.15),
  },
  {
    id: '3',
    propertyId: '2',
    tenantId: '2',
    startDate: '2020-01-01',
    monthlyRent: 15000,
    paymentHistory: generatePayments('2020-01-01', undefined, 15000, 0.03, 0),
  },
  {
    id: '4',
    propertyId: '4',
    tenantId: '6',
    startDate: '2023-07-01',
    monthlyRent: 4200,
    paymentHistory: generatePayments('2023-07-01', undefined, 4200, 0.08, 1),
  },
  {
    id: '5',
    propertyId: '4',
    tenantId: '4',
    startDate: '2021-01-01',
    endDate: '2023-06-30',
    monthlyRent: 3800,
    paymentHistory: generatePayments('2021-01-01', '2023-06-30', 3800, 0.2),
  },
  {
    id: '6',
    propertyId: '5',
    tenantId: '3',
    startDate: '2021-06-01',
    monthlyRent: 28000,
    paymentHistory: generatePayments('2021-06-01', undefined, 28000, 0.12, 2),
  },
  {
    id: '7',
    propertyId: '6',
    tenantId: '7',
    startDate: '2022-05-01',
    monthlyRent: 1800,
    paymentHistory: generatePayments('2022-05-01', undefined, 1800, 0.18, 1),
  },
  {
    id: '8',
    propertyId: '7',
    tenantId: '8',
    startDate: '2019-10-01',
    monthlyRent: 9500,
    paymentHistory: generatePayments('2019-10-01', undefined, 9500, 0.02, 0),
  },
  {
    id: '9',
    propertyId: '8',
    tenantId: '9',
    startDate: '2023-01-15',
    monthlyRent: 8000,
    paymentHistory: generatePayments('2023-01-15', undefined, 8000, 0.07, 1),
  },
  {
    id: '10',
    propertyId: '7',
    tenantId: '5',
    startDate: '2017-09-15',
    endDate: '2019-09-30',
    monthlyRent: 7500,
    paymentHistory: generatePayments('2017-09-15', '2019-09-30', 7500, 0.1),
  },
  {
    id: '11',
    propertyId: '5',
    tenantId: '4',
    startDate: '2017-01-01',
    endDate: '2021-05-31',
    monthlyRent: 22000,
    paymentHistory: generatePayments('2017-01-01', '2021-05-31', 22000, 0.25),
  },
];

export const mockFurniture: Furniture[] = [
  {
    id: '1',
    propertyId: '1',
    name: 'Ar Condicionado Split 18000 BTU',
    category: 'Climatização',
    purchaseDate: '2022-01-15',
    purchaseValue: 2800,
    warrantyEndDate: '2025-01-15',
    condition: 'excellent',
  },
  {
    id: '2',
    propertyId: '1',
    name: 'Sofá 3 Lugares Couro',
    category: 'Mobília',
    purchaseDate: '2021-06-20',
    purchaseValue: 4500,
    condition: 'good',
  },
  {
    id: '3',
    propertyId: '2',
    name: 'Geladeira Inverse 460L',
    category: 'Eletrodomésticos',
    purchaseDate: '2020-11-10',
    purchaseValue: 5200,
    warrantyEndDate: '2023-11-10',
    condition: 'good',
  },
];
