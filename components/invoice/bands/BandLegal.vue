<template>
  <div class="band-legal p-8 space-y-8 mt-12 mb-4 border-t border-slate-100 dark:border-slate-700">
    <!-- Automated Menciones (IMMEX, etc) -->
    <div v-if="mencion" class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
       <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ rules.resolvePattern('~Mención Legal~Legal Mention~') }}</p>
       <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
         {{ mencion.pattern.replace('{rule}', mencion.rule || '').replace('{id}', mencion.id || '') }}
       </p>
    </div>

    <!-- Digital Seals — only shown when real stamp data is present -->
    <div v-if="selloCFDI || selloEmisor" class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
        <div v-if="selloCFDI" class="space-y-2">
          <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Sello Digital del CFDI</p>
          <p class="break-all opacity-80 pt-1 leading-relaxed">{{ selloCFDI }}</p>
        </div>
        <div v-if="selloEmisor" class="space-y-2">
          <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Sello del Emisor</p>
          <p class="break-all opacity-80 pt-1 leading-relaxed">{{ selloEmisor }}</p>
        </div>

        <div v-if="cadenaOriginal" class="col-span-1 md:col-span-2 space-y-2 mt-4">
          <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Cadena Original de Certificación del SAT</p>
          <p class="break-all opacity-80 pt-1 leading-relaxed">{{ cadenaOriginal }}</p>
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
    const inv = props.invoice || {};

    const menciones = rules?.resolve('context_menciones', []).value
      || rules?.resolve('context_mentions', []).value
      || rules?.resolve('context_mennciones', []).value
      || [];
    const mencion = menciones && menciones.length ? menciones[0] : null;

    const selloCFDI  = inv.selloCFDI  || inv.satSeal    || null;
    const selloEmisor = inv.selloSAT  || inv.issuerSeal  || null;
    const cadenaOriginal = inv.cadenaOriginal || null;

    return { rules, mencion, selloCFDI, selloEmisor, cadenaOriginal };
  }
}
</script>
