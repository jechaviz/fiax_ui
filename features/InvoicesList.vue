
<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">{{ title }}</h1>
        <p class="text-slate-400 mt-1">Gestión de comprobantes fiscales tipo {{ typeLabel }}.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="filteredInvoices" 
        :i18n="tableI18n"
        view-mode="table"
        surface-key="invoices"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'InvoicesList',
  props: {
    state: { type: Object, required: true },
    type: { type: String, default: 'I' } // I: Ingreso, E: Egreso, T: Traslado
  },
  setup(props) {
    const title = Vue.computed(() => {
      if (props.type === 'E') return 'Notas de Crédito';
      if (props.type === 'T') return 'Cartas Porte';
      return 'Facturas de Ingreso';
    });

    const typeLabel = Vue.computed(() => {
      if (props.type === 'E') return 'Egreso';
      if (props.type === 'T') return 'Traslado';
      return 'Ingreso';
    });

    const filteredInvoices = Vue.computed(() => {
      // Get core data
      const source = props.state?.data?.invoices || [];
      return source.filter(inv => inv.tipoDeComprobante === props.type);
    });

    const tableI18n = {
      tableId: 'ID',
      tableFolio: 'Folio Externo',
      tableClient: 'Nombre del Cliente',
      tableRfc: 'Razón Social RFC',
      tableStatus: 'Estatus del CFDI',
      tableTotalCost: 'Importe Total',
      tableType: 'Tipo',
      tableDate: 'Fecha y Hora',
      tableAction: 'Acciones'
    };

    function createNew() {
      const router = window.fiax?._router;
      if (router) router.push('/cfdi/ingresos/new');
      else window.location.href = '/cfdi/ingresos/new';
    }

    function handleRowAction(payload) {
      if(payload.action === 'open-record' || payload.action === 'row-click') {
        const router = window.fiax?._router;
        if (!router) return;
        
        let basePath = '/cfdi/ingresos/';
        if (props.type === 'E') basePath = '/cfdi/egresos/';
        if (props.type === 'T') basePath = '/cfdi/traslado/';
        
        router.push(basePath + payload.row.id);
      }
    }

    return { title, typeLabel, filteredInvoices, tableI18n, createNew, handleRowAction };
  }
}
</script>
