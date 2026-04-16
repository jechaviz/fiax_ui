<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Contratos</h1>
        <p class="text-slate-400 mt-1">Gestión de acuerdos legales y suplementos de servicio.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="contracts" 
        :i18n="tableI18n"
        view-mode="table"
        surface-key="contracts"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContractsList',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const contracts = Vue.computed(() => props.state.data.contracts || []);

    const tableI18n = {
      tableId: 'ID',
      tableTitle: 'Título del Contrato',
      tableClient: 'Cliente',
      tableStatus: 'Estado',
      tableStartDate: 'Inicio',
      tableEndDate: 'Vencimiento',
      tableAction: 'Acciones'
    };

    function createNew() {
      const router = window.fiax?._router;
      if (router) router.push('/contracts/new');
    }

    function handleRowAction(payload) {
      if(payload.action === 'open-record' || payload.action === 'row-click') {
        const router = window.fiax?._router;
        if (router) router.push('/contracts/' + payload.row.id);
      }
    }

    return { contracts, tableI18n, createNew, handleRowAction };
  }
}
</script>
