(() => {
  const ROOT = window.fiax || (window.fiax = {});
  const STATUS_VALUES = ['Vigente', 'Cancelado', 'Borrador', 'Pendiente'];
  const FILTER_OPERATORS = ['contains', 'equals', 'starts_with', 'gt', 'lt', 'before', 'after'];

  function toText(value) {
    return String(value == null ? '' : value);
  }

  function normalizeDate(value) {
    const raw = toText(value).trim();
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw.slice(0, 10);
    return date.toISOString().slice(0, 10);
  }

  // ── Invoices schema (default) ───────────────────────────────────────
  function createInvoicesSchema(i18n = {}) {
    return [
      { key: 'id',                  label: i18n.tableId       || 'ID',        sortable: true,  filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'serie',               label: 'Serie',                           sortable: true,  filterable: true,  visible: true,  editable: false, width: 70  },
      { key: 'folio',               label: i18n.tableFolio    || 'Folio',     sortable: true,  filterable: true,  visible: true,  editable: false, width: 90  },
      { key: 'clientName',          label: i18n.tableClient   || 'Cliente',   sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text',   width: 220 },
      { key: 'clientRfc',           label: i18n.tableRfc      || 'RFC',       sortable: true,  filterable: true,  visible: true,  editable: false, width: 155 },
      { key: 'tipoDeComprobante',   label: i18n.tableType     || 'Tipo',      sortable: true,  filterable: true,  visible: true,  editable: false, width: 80  },
      { key: 'total',               label: i18n.tableTotalCost|| 'Total',     sortable: true,  filterable: false, visible: true,  editable: false, numeric: true, width: 130 },
      { key: 'currency',            label: 'Moneda',                          sortable: true,  filterable: true,  visible: true,  editable: false, width: 85  },
      { key: 'status',              label: i18n.tableStatus   || 'Estado',    sortable: true,  filterable: true,  visible: true,  editable: false, width: 120 },
      { key: 'date',                label: i18n.tableDate     || 'Fecha',     sortable: true,  filterable: false, visible: true,  editable: false, width: 150 },
    ];
  }

  // ── Clients schema ──────────────────────────────────────────────────
  function createPaymentsSchema(i18n = {}) {
    return [
      { key: 'id',           label: 'ID Pago',          sortable: true,  filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'date',         label: i18n.colDate || 'Fecha', sortable: true,  filterable: false, visible: true,  editable: false, type: 'date', width: 130 },
      { key: 'clientName',   label: 'Cliente',          sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 220 },
      { key: 'invoiceFolio', label: 'Factura',          sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 120 },
      { key: 'paymentType',  label: 'Forma de Pago',    sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 150 },
      { key: 'amount',       label: 'Monto',            sortable: true,  filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, type: 'currency', width: 130 },
      { key: 'currency',     label: 'Moneda',           sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 90 },
      { key: 'status',       label: i18n.colStatus || 'Estado', sortable: true, filterable: true, visible: true, editable: true, editorType: 'select', width: 120 },
    ];
  }

  function createPayrollSchema(i18n = {}) {
    return [
      { key: 'id',           label: 'ID Recibo',        sortable: true,  filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'date', label: i18n.colDate || 'Fecha Emisión', width: '130px', type: 'date' },
      { key: 'employeeName', label: 'Empleado',         sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 240 },
      { key: 'type', label: 'Tipo Nómina', width: '150px' },
      { key: 'total',        label: 'Neto',             sortable: true,  filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, type: 'currency', width: 140 },
      { key: 'currency',     label: 'Moneda',           sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 90 },
      { key: 'status',       label: i18n.colStatus || 'Estado', sortable: true, filterable: true, visible: true, editable: true, editorType: 'select', width: 120 },
    ];
  }

  function createClientsSchema(i18n = {}) {
    return [
      { key: 'id',          label: i18n.tableId     || 'ID',          sortable: true,  filterable: true,  visible: false, editable: false, width: 120 },
      { key: 'name',        label: i18n.tableClient || 'Nombre',      sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 220 },
      { key: 'companyName', label: 'Empresa',                         sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 230 },
      { key: 'rfc',         label: i18n.tableRfc    || 'RFC',         sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 170 },
      { key: 'taxRegime',   label: 'Régimen',                         sortable: true,  filterable: true,  visible: true,  editable: false, width: 90  },
      { key: 'postalCode',  label: 'C.P.',                            sortable: false, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 90  },
      { key: 'email',       label: 'Correo',                          sortable: false, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 220 },
      { key: 'type',        label: i18n.tableStatus || 'Tipo',        sortable: true,  filterable: true,  visible: true,  editable: false, width: 110 },
    ];
  }

  // ── Products schema ─────────────────────────────────────────────────
  function createProductsSchema(i18n = {}) {
    return [
      { key: 'id',          label: i18n.tableId       || 'ID',          sortable: false, filterable: false, visible: false, editable: false, width: 100 },
      { key: 'description', label: i18n.tableDesc     || 'Descripción', sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text',   width: 280 },
      { key: 'category',    label: i18n.tableCategory || 'Categoría',   sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text',   width: 140 },
      { key: 'productCode', label: 'Clave SAT',                         sortable: true,  filterable: true,  visible: true,  editable: false, width: 120 },
      { key: 'unitCode',    label: 'Unidad SAT',                        sortable: true,  filterable: true,  visible: true,  editable: false, width: 110 },
      { key: 'unit',        label: 'Unidad',                            sortable: false, filterable: true,  visible: true,  editable: true,  editorType: 'text',   width: 110 },
      { key: 'rate',        label: i18n.tableTotalCost|| 'Precio',      sortable: true,  filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, width: 130 },
    ];
  }

  // ── Expenses schema ─────────────────────────────────────────────────
  function createExpensesSchema(i18n = {}) {
    return [
      { key: 'id',          label: 'ID',          sortable: false, filterable: false, visible: false, editable: false, width: 100 },
      { key: 'date',        label: 'Fecha',       sortable: true,  filterable: false, visible: true,  editable: false, width: 130 },
      { key: 'description', label: 'Descripción', sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 280 },
      { key: 'category',    label: 'Categoría',   sortable: true,  filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 150 },
      { key: 'amount',      label: 'Monto',       sortable: true,  filterable: false, visible: true,  editable: false, numeric: true, width: 130 },
      { key: 'status',      label: 'Estado',      sortable: true,  filterable: true,  visible: true,  editable: false, width: 120 },
    ];
  }

  // ── Master dispatcher ───────────────────────────────────────────────
  function createLeadsSchema(i18n = {}) {
    return [
      { key: 'id',         label: i18n.tableId || 'ID',             sortable: true, filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'date',       label: i18n.tableDate || 'Creado el',    sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'date', type: 'date', width: 130 },
      { key: 'title',      label: i18n.tableTitle || 'Oportunidad', sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 240 },
      { key: 'clientName', label: i18n.tableContact || 'Contacto',  sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 220 },
      { key: 'total',      label: i18n.tableTotalCost || 'Valor',   sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, type: 'currency', width: 130 },
      { key: 'status',     label: i18n.tableStatus || 'Estado',     sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'select', width: 120 },
    ];
  }

  function createEstimatesSchema(i18n = {}) {
    return [
      { key: 'id',          label: i18n.tableId || 'ID',           sortable: true, filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'date',        label: i18n.tableDate || 'Fecha',      sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'date', type: 'date', width: 130 },
      { key: 'clientName',  label: i18n.tableClient || 'Cliente',  sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 240 },
      { key: 'description', label: 'Concepto',                    sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 260 },
      { key: 'total',       label: i18n.tableTotalCost || 'Total', sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, type: 'currency', width: 130 },
      { key: 'status',      label: i18n.tableStatus || 'Estado',   sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'select', width: 120 },
    ];
  }

  function createContractsSchema(i18n = {}) {
    return [
      { key: 'id',         label: i18n.tableId || 'ID',            sortable: true, filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'title',      label: i18n.tableTitle || 'Contrato',   sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 260 },
      { key: 'clientName', label: i18n.tableClient || 'Cliente',   sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 220 },
      { key: 'startDate',  label: i18n.tableStartDate || 'Inicio', sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'date', type: 'date', width: 130 },
      { key: 'endDate',    label: i18n.tableEndDate || 'Fin',      sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'date', type: 'date', width: 130 },
      { key: 'status',     label: i18n.tableStatus || 'Estado',    sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'select', width: 120 },
    ];
  }

  function createProjectsSchema(i18n = {}) {
    return [
      { key: 'id',         label: i18n.tableId || 'ID',               sortable: true, filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'name',       label: i18n.tableName || 'Proyecto',       sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 260 },
      { key: 'clientName', label: i18n.tableClient || 'Cliente',      sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 220 },
      { key: 'progress',   label: i18n.tableProgress || 'Progreso',   sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, width: 120 },
      { key: 'total',      label: i18n.tableTotalCost || 'Presupuesto', sortable: true, filterable: false, visible: true, editable: true, editorType: 'number', numeric: true, type: 'currency', width: 150 },
      { key: 'status',     label: i18n.tableStatus || 'Estado',       sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'select', width: 120 },
    ];
  }

  function createTransactionsSchema(i18n = {}) {
    return [
      { key: 'id',          label: i18n.tableId || 'ID',           sortable: true, filterable: true,  visible: false, editable: false, width: 110 },
      { key: 'date',        label: i18n.tableDate || 'Fecha',      sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'date', type: 'date', width: 130 },
      { key: 'description', label: i18n.tableDesc || 'Concepto',   sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 280 },
      { key: 'type',        label: i18n.tableType || 'Tipo',       sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'text', width: 120 },
      { key: 'amount',      label: i18n.tableTotalCost || 'Monto', sortable: true, filterable: false, visible: true,  editable: true,  editorType: 'number', numeric: true, type: 'currency', width: 130 },
      { key: 'status',      label: i18n.tableStatus || 'Estado',   sortable: true, filterable: true,  visible: true,  editable: true,  editorType: 'select', width: 120 },
    ];
  }

  function createColumnSchema(i18n = {}, surfaceKey = '') {
    const key = (surfaceKey || '').toLowerCase();
    if (key === 'customers' || key === 'clients')  return createClientsSchema(i18n);
    if (key === 'products')                        return createProductsSchema(i18n);
    if (key === 'expenses')                        return createExpensesSchema(i18n);
    if (key === 'payments' || key === 'paymentreceipts') return createPaymentsSchema(i18n);
    if (key === 'payroll' || key === 'payrollreceipts')  return createPayrollSchema(i18n);
    if (key === 'leads')                           return createLeadsSchema(i18n);
    if (key === 'estimates')                       return createEstimatesSchema(i18n);
    if (key === 'contracts')                       return createContractsSchema(i18n);
    if (key === 'projects')                        return createProjectsSchema(i18n);
    if (key === 'transactions')                    return createTransactionsSchema(i18n);
    return createInvoicesSchema(i18n); // default: invoices
  }

  function createRule(fallbackColumn) {
    return { id: `rule-${Date.now()}-${Math.round(Math.random() * 1000)}`, column: fallbackColumn || 'clientName', operator: 'contains', value: '' };
  }

  function createGroup(fallbackColumn) {
    return { id: `group-${Date.now()}-${Math.round(Math.random() * 1000)}`, logic: 'AND', filters: [createRule(fallbackColumn)] };
  }

  function normalizeRule(rule, fallbackColumn) {
    return {
      id: toText(rule?.id || `rule-${Date.now()}`),
      column: toText(rule?.column || fallbackColumn || 'clientName'),
      operator: FILTER_OPERATORS.includes(rule?.operator) ? rule.operator : 'contains',
      value: Array.isArray(rule?.value) ? [...rule.value] : toText(rule?.value || ''),
    };
  }

  function normalizeFilterGroup(group, fallbackColumn) {
    if (!group || typeof group !== 'object') return createGroup(fallbackColumn);
    const filters = Array.isArray(group.filters) ? group.filters : [];
    return {
      id: toText(group.id || `group-${Date.now()}`),
      logic: group.logic === 'OR' ? 'OR' : 'AND',
      filters: filters.map((entry) => (entry && typeof entry === 'object' && Array.isArray(entry.filters) ? normalizeFilterGroup(entry, fallbackColumn) : normalizeRule(entry, fallbackColumn))),
    };
  }

  function resolveCellValue(row, column) {
    const col = column || {};
    if (col.key === 'status') return toText(row.status || row.type || 'Borrador');
    if (col.key === 'clientName') return row.clientName || row.receiver?.name || row.client?.name || row.customerName;
    if (col.key === 'employeeName') return row.employeeName || row.employee?.name || row.workerName;
    if (col.key === 'invoiceFolio') {
      const doc = Array.isArray(row.relatedDocuments) ? row.relatedDocuments[0] : null;
      return row.invoiceFolio || (doc ? `${doc.serie || ''}${doc.folio || ''}`.trim() : '');
    }
    if (col.key === 'currency') return row.currency || row.moneda || 'MXN';
    if (col.key === 'name') return row.name || row.title || row.description;
    if (col.key === 'title') return row.title || row.name || row.description;
    if (col.key === 'total' || col.key === 'rate' || col.key === 'amount') {
      const raw = row[col.key];
      if (typeof raw === 'number') return raw;
      const parsed = Number(toText(raw).replace(/[^\d.-]/g, ''));
      return Number.isNaN(parsed) ? 0 : parsed;
    }
    return row[col.key];
  }

  ROOT.datatable = ROOT.datatable || {};
  ROOT.datatable.schema = Object.freeze({
    STATUS_VALUES,
    FILTER_OPERATORS,
    toText,
    normalizeDate,
    createColumnSchema,
    createRule,
    createGroup,
    normalizeRule,
    normalizeFilterGroup,
    resolveCellValue,
  });
})();
