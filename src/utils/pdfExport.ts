import { Property, UtilityPaymentRecord, UtilityType } from '@/types';

const utilityLabels: Record<UtilityType, string> = {
  water: 'Água',
  electricity: 'Luz',
  gas: 'Gás',
  condo: 'Condomínio',
};

const statusLabels: Record<string, string> = {
  paid: 'Pago',
  pending: 'Pendente',
  late: 'Atrasado',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const formatMonth = (monthString: string) => {
  return new Date(monthString + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
};

interface ExportUtilityReportParams {
  property: Property;
  payments: UtilityPaymentRecord[];
}

export function exportUtilityReportPDF({ property, payments }: ExportUtilityReportParams) {
  // Calculate totals by utility type
  const totals: Record<UtilityType, { total: number; paid: number; pending: number; count: number }> = {
    water: { total: 0, paid: 0, pending: 0, count: 0 },
    electricity: { total: 0, paid: 0, pending: 0, count: 0 },
    gas: { total: 0, paid: 0, pending: 0, count: 0 },
    condo: { total: 0, paid: 0, pending: 0, count: 0 },
  };

  payments.forEach(p => {
    totals[p.utilityType].total += p.amount;
    totals[p.utilityType].count += 1;
    if (p.status === 'paid') {
      totals[p.utilityType].paid += p.amount;
    } else {
      totals[p.utilityType].pending += p.amount;
    }
  });

  const grandTotal = Object.values(totals).reduce((acc, t) => acc + t.total, 0);
  const grandPaid = Object.values(totals).reduce((acc, t) => acc + t.paid, 0);
  const grandPending = Object.values(totals).reduce((acc, t) => acc + t.pending, 0);

  // Sort payments by date descending
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.referenceMonth).getTime() - new Date(a.referenceMonth).getTime()
  );

  // Generate HTML content for PDF
  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Contas - ${property.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      padding: 40px; 
      color: #1a1a1a;
      line-height: 1.6;
    }
    .header { 
      text-align: center; 
      margin-bottom: 40px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
    }
    .header h1 { 
      color: #1e40af; 
      font-size: 28px; 
      margin-bottom: 8px;
    }
    .header p { 
      color: #64748b; 
      font-size: 14px;
    }
    .property-info {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .property-info h2 {
      color: #0f172a;
      font-size: 20px;
      margin-bottom: 10px;
    }
    .property-info p {
      color: #475569;
      font-size: 14px;
    }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .summary-card.water { border-color: #38bdf8; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
    .summary-card.electricity { border-color: #fbbf24; background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); }
    .summary-card.gas { border-color: #f97316; background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%); }
    .summary-card.condo { border-color: #a855f7; background: linear-gradient(135deg, #faf5ff 0%, #e9d5ff 100%); }
    .summary-card h3 {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .summary-card .value {
      font-size: 20px;
      font-weight: bold;
      color: #0f172a;
    }
    .summary-card .detail {
      font-size: 11px;
      color: #64748b;
      margin-top: 5px;
    }
    .totals-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .total-card {
      background: #0f172a;
      color: white;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
    }
    .total-card.paid { background: #16a34a; }
    .total-card.pending { background: #dc2626; }
    .total-card h3 {
      font-size: 12px;
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .total-card .value {
      font-size: 24px;
      font-weight: bold;
    }
    table { 
      width: 100%; 
      border-collapse: collapse; 
      margin-top: 20px;
      font-size: 13px;
    }
    th { 
      background: #1e293b; 
      color: white; 
      padding: 12px 15px; 
      text-align: left;
      font-weight: 600;
    }
    th:first-child { border-radius: 8px 0 0 0; }
    th:last-child { border-radius: 0 8px 0 0; }
    td { 
      padding: 12px 15px; 
      border-bottom: 1px solid #e2e8f0;
    }
    tr:hover td { background: #f8fafc; }
    tr:last-child td:first-child { border-radius: 0 0 0 8px; }
    tr:last-child td:last-child { border-radius: 0 0 8px 0; }
    .status { 
      padding: 4px 10px; 
      border-radius: 20px; 
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status.paid { background: #dcfce7; color: #166534; }
    .status.pending { background: #fef3c7; color: #92400e; }
    .status.late { background: #fee2e2; color: #991b1b; }
    .utility-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    .utility-badge.water { background: #e0f2fe; color: #0369a1; }
    .utility-badge.electricity { background: #fef3c7; color: #b45309; }
    .utility-badge.gas { background: #fed7aa; color: #c2410c; }
    .utility-badge.condo { background: #e9d5ff; color: #7c3aed; }
    .footer { 
      margin-top: 40px; 
      text-align: center; 
      color: #94a3b8;
      font-size: 12px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
    }
    @media print {
      body { padding: 20px; }
      .summary { grid-template-columns: repeat(4, 1fr); }
      .totals-row { grid-template-columns: repeat(3, 1fr); }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>📋 Relatório de Contas e Utilidades</h1>
    <p>Gerado em ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
  </div>

  <div class="property-info">
    <h2>${property.name}</h2>
    <p>📍 ${property.address}</p>
    <p>🏠 ${property.type === 'apartment' ? 'Apartamento' : property.type === 'house' ? 'Casa' : property.type === 'commercial' ? 'Comercial' : 'Terreno'} • ${property.status === 'rented' ? 'Alugado' : property.status === 'vacant' ? 'Vago' : 'Em Reforma'}</p>
  </div>

  <div class="summary">
    ${(['water', 'electricity', 'gas', 'condo'] as UtilityType[]).map(type => `
      <div class="summary-card ${type}">
        <h3>${utilityLabels[type]}</h3>
        <div class="value">${formatCurrency(totals[type].total)}</div>
        <div class="detail">${totals[type].count} pagamentos</div>
      </div>
    `).join('')}
  </div>

  <div class="totals-row">
    <div class="total-card">
      <h3>Total Geral</h3>
      <div class="value">${formatCurrency(grandTotal)}</div>
    </div>
    <div class="total-card paid">
      <h3>Total Pago</h3>
      <div class="value">${formatCurrency(grandPaid)}</div>
    </div>
    <div class="total-card pending">
      <h3>Total Pendente</h3>
      <div class="value">${formatCurrency(grandPending)}</div>
    </div>
  </div>

  <h3 style="margin-bottom: 10px; color: #0f172a;">📝 Histórico de Pagamentos</h3>
  
  ${sortedPayments.length > 0 ? `
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Referência</th>
          <th>Vencimento</th>
          <th>Pagamento</th>
          <th>Valor</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${sortedPayments.map(payment => `
          <tr>
            <td><span class="utility-badge ${payment.utilityType}">${utilityLabels[payment.utilityType]}</span></td>
            <td>${formatMonth(payment.referenceMonth)}</td>
            <td>${formatDate(payment.dueDate)}</td>
            <td>${payment.paidDate ? formatDate(payment.paidDate) : '-'}</td>
            <td><strong>${formatCurrency(payment.amount)}</strong></td>
            <td><span class="status ${payment.status}">${statusLabels[payment.status]}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<p style="text-align: center; color: #64748b; padding: 40px;">Nenhum pagamento registrado</p>'}

  <div class="footer">
    <p>Relatório gerado automaticamente pelo Sistema de Gestão Imobiliária</p>
    <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
  </div>
</body>
</html>
  `;

  // Create a blob and open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
}
