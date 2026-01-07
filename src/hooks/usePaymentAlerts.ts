import { useMemo } from 'react';
import { Alert, Property, RentalHistory, UtilityPaymentRecord } from '@/types';
import { isBefore, differenceInDays, format } from 'date-fns';

interface UsePaymentAlertsProps {
  properties: Property[];
  rentalHistory: RentalHistory[];
  utilityPayments?: UtilityPaymentRecord[];
}

const utilityLabels: Record<string, string> = {
  water: 'Água',
  electricity: 'Luz',
  gas: 'Gás',
  condo: 'Condomínio',
};

export function usePaymentAlerts({ properties, rentalHistory, utilityPayments = [] }: UsePaymentAlertsProps): Alert[] {
  const alerts = useMemo(() => {
    const generatedAlerts: Alert[] = [];
    const today = new Date();
    
    // Get active rentals (those without endDate)
    const activeRentals = rentalHistory.filter(rental => !rental.endDate);
    
    activeRentals.forEach(rental => {
      const property = properties.find(p => p.id === rental.propertyId);
      if (!property) return;
      
      // Check each payment in the rental history
      rental.paymentHistory.forEach(payment => {
        const dueDate = new Date(payment.dueDate);
        const daysUntilDue = differenceInDays(dueDate, today);
        
        // Late payment alert (past due and not paid)
        if (payment.status === 'late' || (payment.status === 'pending' && isBefore(dueDate, today))) {
          const daysLate = Math.abs(daysUntilDue);
          generatedAlerts.push({
            id: `late-${payment.id}`,
            type: 'delinquency',
            severity: daysLate > 30 ? 'high' : daysLate > 15 ? 'medium' : 'low',
            title: 'Pagamento Atrasado',
            message: `Aluguel de ${payment.month} do imóvel "${property.name}" está ${daysLate} dias atrasado. Valor: R$ ${payment.amount.toLocaleString('pt-BR')}`,
            propertyId: property.id,
            tenantId: rental.tenantId,
            date: today.toISOString(),
            read: false,
          });
        }
        
        // Upcoming due date alert (within 7 days)
        if (payment.status === 'pending' && daysUntilDue > 0 && daysUntilDue <= 7) {
          generatedAlerts.push({
            id: `upcoming-${payment.id}`,
            type: 'contract',
            severity: daysUntilDue <= 3 ? 'medium' : 'low',
            title: 'Vencimento Próximo',
            message: `Aluguel de ${payment.month} do imóvel "${property.name}" vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''} (${format(dueDate, 'dd/MM/yyyy')}). Valor: R$ ${payment.amount.toLocaleString('pt-BR')}`,
            propertyId: property.id,
            tenantId: rental.tenantId,
            date: today.toISOString(),
            read: false,
          });
        }
      });
      
      // Generate expected payment for current month if not exists
      const currentMonth = format(today, 'yyyy-MM');
      const hasCurrentMonthPayment = rental.paymentHistory.some(p => p.month === currentMonth);
      
      if (!hasCurrentMonthPayment && property.status === 'rented') {
        // Assume due date is day 5 of each month
        const dueDate = new Date(today.getFullYear(), today.getMonth(), 5);
        const daysUntilDue = differenceInDays(dueDate, today);
        
        if (isBefore(dueDate, today)) {
          // It's past due date and no payment registered
          const daysLate = Math.abs(daysUntilDue);
          generatedAlerts.push({
            id: `missing-${rental.id}-${currentMonth}`,
            type: 'delinquency',
            severity: daysLate > 15 ? 'high' : 'medium',
            title: 'Pagamento Não Registrado',
            message: `Pagamento de ${format(today, 'MMMM/yyyy')} do imóvel "${property.name}" não foi registrado. Venceu há ${daysLate} dias.`,
            propertyId: property.id,
            tenantId: rental.tenantId,
            date: today.toISOString(),
            read: false,
          });
        } else if (daysUntilDue <= 7 && daysUntilDue > 0) {
          // Upcoming payment
          generatedAlerts.push({
            id: `upcoming-new-${rental.id}-${currentMonth}`,
            type: 'contract',
            severity: 'low',
            title: 'Vencimento Próximo',
            message: `Aluguel de ${format(today, 'MMMM/yyyy')} do imóvel "${property.name}" vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''}.`,
            propertyId: property.id,
            tenantId: rental.tenantId,
            date: today.toISOString(),
            read: false,
          });
        }
      }
    });
    
    // Check for vacant properties (vacancy alerts)
    properties.forEach(property => {
      if (property.status === 'vacant') {
        generatedAlerts.push({
          id: `vacancy-${property.id}`,
          type: 'vacancy',
          severity: 'medium',
          title: 'Imóvel Vago',
          message: `"${property.name}" está sem inquilino. Potencial de receita: R$ ${property.monthlyRent.toLocaleString('pt-BR')}/mês.`,
          propertyId: property.id,
          date: today.toISOString(),
          read: false,
        });
      }
    });

    // Check utility payments for alerts
    utilityPayments.forEach(payment => {
      if (payment.status === 'paid') return;
      
      const property = properties.find(p => p.id === payment.propertyId);
      if (!property) return;
      
      const dueDate = new Date(payment.dueDate);
      const daysUntilDue = differenceInDays(dueDate, today);
      const utilityName = utilityLabels[payment.utilityType] || payment.utilityType;
      
      // Late utility payment
      if (payment.status === 'late' || (payment.status === 'pending' && isBefore(dueDate, today))) {
        const daysLate = Math.abs(daysUntilDue);
        generatedAlerts.push({
          id: `utility-late-${payment.id}`,
          type: 'delinquency',
          severity: daysLate > 15 ? 'high' : daysLate > 7 ? 'medium' : 'low',
          title: `${utilityName} Atrasada`,
          message: `Conta de ${utilityName} (${payment.referenceMonth}) do imóvel "${property.name}" está ${daysLate} dias atrasada. Valor: R$ ${payment.amount.toLocaleString('pt-BR')}`,
          propertyId: property.id,
          date: today.toISOString(),
          read: false,
        });
      }
      // Upcoming utility payment (within 7 days)
      else if (payment.status === 'pending' && daysUntilDue > 0 && daysUntilDue <= 7) {
        generatedAlerts.push({
          id: `utility-upcoming-${payment.id}`,
          type: 'contract',
          severity: daysUntilDue <= 3 ? 'medium' : 'low',
          title: `${utilityName} Próxima do Vencimento`,
          message: `Conta de ${utilityName} (${payment.referenceMonth}) do imóvel "${property.name}" vence em ${daysUntilDue} dia${daysUntilDue > 1 ? 's' : ''} (${format(dueDate, 'dd/MM/yyyy')}). Valor: R$ ${payment.amount.toLocaleString('pt-BR')}`,
          propertyId: property.id,
          date: today.toISOString(),
          read: false,
        });
      }
    });
    
    // Sort by severity (high first) and then by date
    return generatedAlerts.sort((a, b) => {
      const severityOrder = { high: 0, medium: 1, low: 2 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [properties, rentalHistory, utilityPayments]);
  
  return alerts;
}
