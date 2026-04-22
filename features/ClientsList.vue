
<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Directorio de Clientes</h1>
        <p class="text-slate-400 mt-1">Administra tus receptores de facturación y prospectos.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="clients" 
        :i18n="tableI18n"
        view-mode="table"
        surface-key="customers"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>

    <!-- Client Edit/Create Modal -->
    <ClientsFormModal
      v-if="modal.show"
      :client="modal.client"
      @close="modal.show = false"
      @save="onSaveClient"
    />
  </div>
</template>

<script>
export default {
  name: 'ClientsList',
  props: {
    state: { type: Object, required: true }
  },
  components: {
    ClientsFormModal: Vue.defineAsyncComponent(() => 
      window.fiax.loadModule('/components/ClientsFormModal.vue', window.fiax.loaderOptions)
    )
  },
  setup(props) {
    const modal = Vue.reactive({
      show: false,
      client: null
    });

    const clients = Vue.computed(() => {
      return (props.state.data.users || []).filter(u => u.type === 'Client');
    });

    const tableI18n = {
      tableId: 'ID',
      tableClient: 'Nombre',
      tableCompany: 'Compañía',
      tableRfc: 'RFC',
      tableStatus: 'Estado',
      tableTotalCost: 'Total',
      tableDate: 'Fecha',
      tableAction: 'Acciones'
    };

    function handleRowAction(payload) {
      if(payload.action === 'open-record' || payload.action === 'row-click' || payload.action === 'edit') {
        modal.client = JSON.parse(JSON.stringify(payload.row));
        modal.show = true;
      }
    }

    function createNew() {
      modal.client = null;
      modal.show = true;
    }

    function onSaveClient(updated) {
      props.state.saveClient(updated);
      modal.show = false;
    }

    return { clients, tableI18n, handleRowAction, createNew, modal, onSaveClient };
  }
}
</script>
