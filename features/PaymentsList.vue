<template>
  <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-white">Recibos de Pago (REP)</h1>
        <p class="text-slate-400 mt-1">Gestión de complementos de recepción de pagos.</p>
      </div>
    </header>

    <div class="flex-1 bg-[#0a1428] rounded-xl border border-white/5 overflow-hidden shadow-2xl relative min-h-[500px]">
      <DataTable 
        :rows="filteredPayments" 
        :i18n="{}"
        view-mode="table"
        surface-key="paymentReceipts"
        @row-action="handleRowAction"
        @new-record="createNew"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentsList',
  props: {
    state: { type: Object, required: true }
  },
  setup(props) {
    const filteredPayments = Vue.computed(() => {
      return props.state?.data?.paymentReceipts || [];
    });

    function createNew() {
      const router = window.fiax?._router;
      if (router) router.push('/cfdi/pagos/new');
    }

    function handleRowAction(payload) {
      if(payload.action === 'open-record' || payload.action === 'row-click') {
        const router = window.fiax?._router;
        if (router) router.push('/cfdi/pagos/' + payload.row.id);
      }
    }

    return { filteredPayments, createNew, handleRowAction };
  }
}
</script>
