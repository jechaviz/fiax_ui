<template>
  <div :class="config.style" class="band-header">
    <div class="grid grid-cols-2 gap-12 mb-12 border-b border-slate-100 dark:border-slate-700/50 pb-12">
      <!-- Logo and Issuer Info -->
      <div class="space-y-4">
        <img v-if="config.show_logo" :src="issuer.logo || './logo.png'" class="h-14 object-contain mb-2" />
        <h2 class="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
          {{ issuer.nombre }}
        </h2>
        <div class="space-y-1 text-sm text-slate-500 dark:text-slate-400">
          <p><span class="font-semibold text-slate-700 dark:text-slate-300">RFC:</span> {{ issuer.rfc }}</p>
          <p v-if="issuer.telefono"><span class="font-semibold text-slate-700 dark:text-slate-300">TEL:</span> {{ issuer.telefono }}</p>
          <p v-if="issuerAddress" class="leading-relaxed">
            {{ rules.resolvePattern(config.text_pattern || '{address}').replace('{address}', issuerAddress) }}
          </p>
        </div>
      </div>

      <!-- Document Meta (Folio, Date, UUID) -->
      <div class="text-right">
        <h1 class="text-5xl font-black uppercase tracking-tighter text-slate-100 dark:text-slate-700/30 mb-2 leading-none">
          {{ rules.getConstant('docs', invoice.tipoDeComprobante || 'I') }}
        </h1>
        <p class="font-mono text-2xl font-bold text-slate-800 dark:text-slate-200">#{{ invoice.serie }}{{ invoice.folio }}</p>
        <div v-if="invoice.uuid" class="mt-6">
          <p class="text-[10px] font-mono text-slate-400 uppercase tracking-widest">UUID: {{ invoice.uuid }}</p>
        </div>
        <div class="mt-4 flex gap-4 justify-end text-sm text-slate-500">
           <div><span class="font-semibold text-slate-700 dark:text-slate-300">{{ rules.resolvePattern('~Fecha~Date~') }}:</span> {{ invoice.fecha || invoice.date }}</div>
           <div><span class="font-semibold text-slate-700 dark:text-slate-300">{{ rules.resolvePattern('~Moneda~Currency~') }}:</span> {{ invoice.moneda || 'MXN' }}</div>
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
    const i = issuer;
    const street = [i.calle, i.noExterior].filter(Boolean).join(' ');
    const parts = [street, i.colonia, i.municipio, i.codigoPostal ? `CP ${i.codigoPostal}` : ''].filter(Boolean);
    const issuerAddress = parts.join(', ');
    return { rules, issuer, issuerAddress };
  }
}
</script>
