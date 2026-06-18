<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">{{ title }}</h1>
        <p class="text-slate-400 mt-1">Gestion de comprobantes fiscales tipo {{ typeLabel }}.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable
        :rows="filteredInvoices"
        :i18n="tableI18n"
        view-mode="table"
        surface-key="invoices"
        :show-downloads="true"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
const LISTS = {
  I: { title: 'Facturas de Ingreso', label: 'Ingreso', basePath: '/cfdi/ingresos/' },
  E: { title: 'Notas de Credito', label: 'Egreso', basePath: '/cfdi/egresos/' },
  T: { title: 'Cartas Porte', label: 'Traslado', basePath: '/cfdi/traslado/' },
};

export default {
  name: 'InvoicesList',
  props: {
    state: { type: Object, required: true },
    type: { type: String, default: '' },
  },
  setup(props) {
    const route = VueRouter.useRoute();
    const resolvedType = Vue.computed(() => {
      if (props.type) return props.type;
      if (route.path.includes('/egresos')) return 'E';
      if (route.path.includes('/traslado')) return 'T';
      return 'I';
    });

    const currentList = Vue.computed(() => LISTS[resolvedType.value] || LISTS.I);
    const title = Vue.computed(() => currentList.value.title);
    const typeLabel = Vue.computed(() => currentList.value.label);
    const filteredInvoices = Vue.computed(() => {
      const source = props.state?.data?.invoices || [];
      return source.filter((invoice) => invoice.tipoDeComprobante === resolvedType.value);
    });

    const tableI18n = {
      tableId: 'ID',
      tableFolio: 'Folio Externo',
      tableClient: 'Nombre del Cliente',
      tableRfc: 'RFC',
      tableStatus: 'Estatus del CFDI',
      tableTotalCost: 'Importe Total',
      tableType: 'Tipo',
      tableDate: 'Fecha y Hora',
      tableAction: 'Acciones',
    };

    function createNew() {
      const router = window.fiax?._router;
      const target = `${currentList.value.basePath}new`;
      if (router) router.push(target);
      else window.location.href = target;
    }

    async function handleRowAction(payload) {
      const { action, row } = payload;
      if (action === 'open-record' || action === 'row-click' || action === 'open') {
        const router = window.fiax?._router;
        if (router) router.push(currentList.value.basePath + row.id);
        return;
      }
      if (action === 'download-xml') {
        try {
          const filename = `CFDI_${row.serie}${row.folio}_${row.uuid || row.id}.xml`;
          await window.fiax.api.downloadXml(row.id, filename);
        } catch (e) {
          alert(e.message || 'No se pudo descargar el XML.');
        }
        return;
      }
      if (action === 'download-pdf') {
        const router = window.fiax?._router;
        if (router) router.push(currentList.value.basePath + row.id + '?print=1');
        return;
      }
    }

    return { title, typeLabel, filteredInvoices, tableI18n, createNew, handleRowAction };
  },
};
</script>
