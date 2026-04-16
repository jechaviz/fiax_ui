<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Gastos</h1>
        <p class="text-slate-400 mt-1">Registro y control de egresos operativos.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="allExpenses" 
        :i18n="{}"
        view-mode="table"
        surface-key="expenses"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ExpensesList',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const allExpenses = Vue.computed(() => {
      // Use demo data + add more variety
      const base = props.state?.data?.expenses || [];
      // Augment with extra demo entries
      return [
        ...base,
        { id: 'exp-3', date: '2024-06-18', description: 'Google Ads Campaign', amount: 320, category: 'Marketing', billable: false, status: 'Approved' },
        { id: 'exp-4', date: '2024-07-02', description: 'Renta de oficina virtual', amount: 200, category: 'Operativo', billable: false, status: 'Invoiced' },
        { id: 'exp-5', date: '2024-07-10', description: 'Traducción de documentos legales', amount: 275, category: 'Legal', billable: true, status: 'Pending' },
        { id: 'exp-6', date: '2024-07-14', description: 'Hardware: teclado y mouse', amount: 85, category: 'Equipo', billable: false, status: 'Approved' },
      ];
    });

    function handleRowAction(payload) {
      console.log('Row Action', payload);
    }

    function createNew() {
      alert('Nuevo Gasto (Próximamente)');
    }

    return { allExpenses, handleRowAction, createNew };
  }
}
</script>
