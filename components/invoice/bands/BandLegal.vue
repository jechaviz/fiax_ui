<template>
  <div class="band-legal p-8 space-y-8 mt-12 mb-4 border-t border-slate-100 dark:border-slate-700">
    <!-- Automated Menciones (IMMEX, etc) -->
    <div v-if="mencion" class="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-slate-100 dark:border-slate-700">
       <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{{ rules.resolvePattern('~Mención Legal~Legal Mention~') }}</p>
       <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
         {{ mencion.pattern.replace('{rule}', mencion.rule || '').replace('{id}', mencion.id || '') }}
       </p>
    </div>

    <!-- Digital Seals (CFDI Logic) -->
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-[9px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-loose">
        <div class="space-y-2">
          <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Sello Digital del CFDI</p>
          <p class="break-all opacity-80 pt-1 leading-relaxed">{{ invoice.selloCFDI || invoice.satSeal || 'SAT-STAMP-PLACEHOLDER' }}</p>
        </div>
        <div class="space-y-2">
          <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Sello del Emisor</p>
          <p class="break-all opacity-80 pt-1 leading-relaxed">{{ invoice.selloSAT || invoice.issuerSeal || 'ISSUER-STAMP-PLACEHOLDER' }}</p>
        </div>
        
        <div class="col-span-1 md:col-span-2 space-y-2 mt-4">
          <p class="font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700 pb-1">Cadena Original de Certificación del SAT</p>
          <p class="break-all opacity-80 pt-1 leading-relaxed">||1.1|{{ invoice.uuid }}|{{ invoice.fechaTimbrado }}|...|00001000000504204441||</p>
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
    
    // Resolve dynamic mentions from rule engine enriched context
    const menciones = rules?.resolve('context_menciones', []).value
      || rules?.resolve('context_mentions', []).value
      || rules?.resolve('context_mennciones', []).value
      || [];
    const mencion = menciones && menciones.length ? menciones[0] : null;

    return { rules, mencion };
  }
}
</script>
