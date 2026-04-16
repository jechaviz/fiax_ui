<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Prospectos (Leads)</h1>
        <p class="text-slate-400 mt-1">Gestión de oportunidades de venta y pipeline comercial.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="leads" 
        :i18n="tableI18n"
        view-mode="table"
        surface-key="leads"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LeadsList',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const leads = Vue.computed(() => props.state.data.leads || []);

    const tableI18n = {
      tableId: 'ID',
      tableContact: 'Contacto',
      tableTitle: 'Oportunidad',
      tableDate: 'Creado el',
      tableStatus: 'Estado',
      tableTotalCost: 'Valor Est.',
      tableAction: 'Acciones'
    };

    function createNew() {
      const router = window.fiax?._router;
      if (router) router.push('/leads/new');
    }

    function handleRowAction(payload) {
      if(payload.action === 'open-record' || payload.action === 'row-click') {
        const router = window.fiax?._router;
        if (router) router.push('/leads/' + payload.row.id);
      }
    }

    return { leads, tableI18n, createNew, handleRowAction };
  }
}
</script>
