
<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Catálogo de Productos</h1>
        <p class="text-slate-400 mt-1">Servicios y artículos configurados con claves SAT.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="products" 
        :i18n="tableI18n"
        view-mode="table"
        surface-key="products"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProductsList',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const products = Vue.computed(() => {
      return props.state.data.products || [];
    });

    const tableI18n = {
      tableId: 'ID',
      tableDesc: 'Descripción',
      tableCategory: 'Categoría',
      tableStatus: 'Estado',
      tableTotalCost: 'Precio',
      tableAction: 'Acciones'
    };

    function handleRowAction(payload) {
      if(payload.action === 'open-record' || payload.action === 'row-click') {
        const router = window.fiax?._router;
        if (router) router.push('/products/' + payload.row.id);
      }
    }

    function createNew() {
      const router = window.fiax?._router;
      if (router) {
        router.push('/products/new');
        return;
      }
      alert('Nuevo Producto (Próximamente)');
    }

    return { products, tableI18n, handleRowAction, createNew };
  }
}
</script>
