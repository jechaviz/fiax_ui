<template>
  <div class="flex items-center justify-between p-6 bg-white/2 border border-white/5 rounded-2xl">
    <div class="flex items-center gap-3">
       <div v-if="saveStatus" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 animate-in fade-in duration-300">
          <div v-if="saveStatus === 'saving'" class="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <i v-else class="fa-solid fa-check-circle text-green-400"></i>
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {{ saveStatus === 'saving' ? 'Guardando Borrador...' : 'Borrador Guardado' }}
          </span>
       </div>
    </div>

    <div class="flex items-center gap-4">
      <button @click="$emit('cancel')" class="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-colors">
        Cancelar
      </button>
      
      <div class="flex items-center gap-2">
        <AppButton 
          variant="secondary" 
          label="Guardar Borrador" 
          icon="fa-solid fa-floppy-disk" 
          @click="$emit('draft')" 
        />
        <AppButton 
          variant="primary" 
          label="Timbrar Comprobante" 
          icon="fa-solid fa-bolt" 
          @click="$emit('stamp')" 
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'InvoiceActions',
    props: {
        saveStatus: String,
        isEditing: Boolean
    },
    emits: ['cancel', 'draft', 'stamp']
}
</script>
