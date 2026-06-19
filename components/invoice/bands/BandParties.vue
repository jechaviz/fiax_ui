<template>
  <div class="band-parties">
    <!-- Receiver & Dates -->
    <div class="grid grid-cols-2 gap-12 mb-12 p-8 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700/50">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">{{ rules.resolvePattern('~Receptor~Recipient~') }}</p>
        <p class="font-bold text-xl text-slate-900 dark:text-white mb-2">{{ receiver.nombre }}</p>
        <div class="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">RFC:</span> {{ receiver.rfc }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Uso CFDI:</span> {{ rules.getConstant('uso_cfdi', receiver.cfdiUse || receiver.usoCFDI) || receiver.cfdiUse || receiver.usoCFDI }}</p>
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">Dom. Fiscal:</span> {{ receiver.codigoPostal }}</p>
          <p v-if="receiver.regimenFiscal"><span class="font-semibold text-slate-700 dark:text-slate-300">Régimen:</span> {{ rules.getConstant('regimenes', receiver.regimenFiscal) || receiver.regimenFiscal }}</p>
        </div>
      </div>
      <div class="text-right flex flex-col justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Fecha y Hora de Emisión</p>
          <p class="text-slate-800 dark:text-slate-200 font-medium">{{ invoice.fecha || invoice.date }}</p>
        </div>
        <div class="mt-6 space-y-3">
          <div class="grid grid-cols-2 gap-4 text-right">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Método de Pago</p>
              <p class="text-slate-800 dark:text-slate-200 text-sm font-semibold">{{ invoice.paymentMethod }}</p>
            </div>
            <div>
              <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Forma de Pago</p>
              <p class="text-slate-800 dark:text-slate-200 text-sm font-semibold">{{ invoice.paymentForm || invoice.formaDePago || invoice.paymentType }}</p>
            </div>
          </div>
          <div v-if="invoice.condicionesDePago" class="pt-2 border-t border-slate-200 dark:border-slate-700">
            <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Condiciones</p>
            <p class="text-slate-800 dark:text-slate-200 text-sm italic">{{ invoice.condicionesDePago }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['invoice', 'config'],
  setup(props) {
    const rules = window.fiax?.rules;
    const issuer = props.invoice.issuer || {};
    const receiver = props.invoice.receiver || {};
    
    // Check for "Customer ID" enrichment rule (Mannesmann specific)
    const internalId = rules.resolve('receiver_id.value.show_internal').value ? receiver.id_interno : null;

    return { rules, issuer, receiver, internalId };
  }
}
</script>
