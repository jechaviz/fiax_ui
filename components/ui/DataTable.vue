
<template>
  <div class="luxury-datatable space-y-6">
    <!-- Premium Toolbar -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-2">
      <div class="relative w-full lg:w-96 group">
        <i class="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors"></i>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Filtrar registros en tiempo real..." 
          class="app-input-glass w-full pl-12 py-3.5 text-xs font-bold tracking-wide placeholder:text-slate-600"
        />
      </div>
      
      <div class="flex items-center gap-4">
        <!-- View Toggler -->
        <div class="flex bg-white/5 p-1 rounded-2xl border border-white/5 shadow-inner">
          <button 
            v-for="view in ['table', 'cards']" 
            :key="view"
            @click="activeView = view"
            :class="[
              'p-2.5 rounded-xl transition-all duration-300',
              activeView === view ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' : 'text-slate-500 hover:text-white'
            ]"
          >
            <i :class="view === 'table' ? 'fa-solid fa-list-ul' : 'fa-solid fa-grid-2'"></i>
          </button>
        </div>

        <AppButton variant="ghost" label="Exportar" icon="fa-solid fa-file-export" />
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Main View Container -->
    <div class="relative">
      <!-- Table View (Precision) -->
      <div v-if="activeView === 'table'" class="app-glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div class="overflow-x-auto custom-scrollbar">
          <table class="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr class="bg-white/[0.02]">
                <th v-for="col in columns" :key="col.key" 
                    @click="toggleSort(col.key)"
                    class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-white transition-all select-none border-b border-white/5">
                  <div class="flex items-center gap-3">
                    {{ col.header }}
                    <div class="w-4 h-4 flex items-center justify-center rounded-md bg-white/5 border border-white/5 transition-all" :class="{ 'bg-blue-600 border-blue-500 text-white': sortKey === col.key }">
                       <i :class="['text-[8px]', sortKey === col.key ? (sortOrder === 'asc' ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down') : 'fa-solid fa-sort']"></i>
                    </div>
                  </div>
                </th>
                <th v-if="enableActions" class="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-right border-b border-white/5">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/[0.02]">
              <tr v-for="row in paginatedData" :key="row.id" class="hover:bg-blue-600/[0.03] transition-all group">
                <td v-for="col in columns" :key="col.key" class="px-8 py-6 text-sm relative">
                  <!-- Active row indicator -->
                  <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <slot :name="`cell-${col.key}`" :row="row" :value="row[col.key]">
                    <span class="text-slate-300 font-medium tracking-tight">{{ row[col.key] }}</span>
                  </slot>
                </td>
                <td v-if="enableActions" class="px-8 py-6 text-right">
                  <div class="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                     <button @click="$emit('edit', row)" class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><i class="fa-solid fa-pencil text-xs"></i></button>
                     <button @click="$emit('delete', row)" class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><i class="fa-solid fa-trash-can text-xs"></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Luxury Cards View -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div v-for="row in paginatedData" :key="row.id" class="app-glass rounded-[2rem] p-8 hover:bg-white/[0.05] transition-all group cursor-pointer border border-white/5 hover:border-blue-500/20 shadow-xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <slot name="card" :row="row">
             <div class="flex flex-col h-full gap-6">
               <div class="flex justify-between items-start">
                  <div>
                     <h4 class="font-black text-xl text-white italic tracking-tighter mb-1">{{ row[columns[0].key] }}</h4>
                     <p class="text-[10px] text-slate-500 font-black uppercase tracking-widest">{{ row[columns[1]?.key] }}</p>
                  </div>
                  <AppBadge variant="glass">{{ row.id.substring(0, 8) }}</AppBadge>
               </div>
               
               <div class="mt-auto pt-6 border-t border-white/5 flex justify-between items-center">
                  <span class="text-2xl font-black text-blue-400 tracking-tighter">
                    {{ row.total ? state.formatCurrency(row.total) : (row.price ? state.formatCurrency(row.price) : '---') }}
                  </span>
                  <div class="flex gap-2">
                     <button @click.stop="$emit('edit', row)" class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-blue-600 transition-all"><i class="fa-solid fa-arrow-right"></i></button>
                  </div>
               </div>
             </div>
          </slot>
        </div>
      </div>
    </div>

    <!-- Luxury Pagination -->
    <div class="flex items-center justify-between px-8 py-6 rounded-[2rem] bg-white/[0.02] border border-white/5">
      <div class="text-[10px] font-black text-slate-500 uppercase tracking-widest">
        Mostrando <span class="text-blue-400">{{ startIdx + 1 }}-{{ endIdx }}</span> de {{ filteredData.length }} registros
      </div>
      <div class="flex items-center gap-6">
        <button @click="page--" :disabled="page === 1" class="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl disabled:opacity-20 hover:bg-white/10 hover:border-white/20 transition-all">
          <i class="fa-solid fa-chevron-left text-xs"></i>
        </button>
        <div class="flex items-center gap-2">
           <span class="text-sm font-black text-white px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-xl shadow-lg shadow-blue-500/10">{{ page }}</span>
           <span class="text-xs text-slate-600 font-bold">de {{ maxPage }}</span>
        </div>
        <button @click="page++" :disabled="page >= maxPage" class="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/5 rounded-2xl disabled:opacity-20 hover:bg-white/10 hover:border-white/20 transition-all">
          <i class="fa-solid fa-chevron-right text-xs"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
const { ref, computed } = Vue;

export default {
  name: 'DataTable',
  props: {
    columns: { type: Array, required: true },
    data: { type: Array, required: true },
    pageSize: { type: Number, default: 9 },
    enableActions: Boolean,
    state: { type: Object, required: true }
  },
  setup(props) {
    const searchQuery = ref('');
    const sortKey = ref('');
    const sortOrder = ref('asc');
    const page = ref(1);
    const activeView = ref('cards'); // Luxury Cards by default

    const filteredData = computed(() => {
      let result = [...props.data];
      
      if (searchQuery.value) {
        const q = searchQuery.value.toLowerCase();
        result = result.filter(row => 
          Object.values(row).some(v => String(v).toLowerCase().includes(q))
        );
      }

      if (sortKey.value) {
        result.sort((a, b) => {
          const aVal = a[sortKey.value];
          const bVal = b[sortKey.value];
          if (aVal < bVal) return sortOrder.value === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortOrder.value === 'asc' ? 1 : -1;
          return 0;
        });
      }

      return result;
    });

    const paginatedData = computed(() => {
      const start = (page.value - 1) * props.pageSize;
      return filteredData.value.slice(start, start + props.pageSize);
    });

    const maxPage = computed(() => Math.ceil(filteredData.value.length / props.pageSize));
    const startIdx = computed(() => (page.value - 1) * props.pageSize);
    const endIdx = computed(() => Math.min(startIdx.value + props.pageSize, filteredData.value.length));

    function toggleSort(key) {
      if (sortKey.value === key) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortOrder.value = 'asc';
      }
    }

    return { 
      searchQuery, sortKey, sortOrder, page, activeView,
      filteredData, paginatedData, maxPage, startIdx, endIdx,
      toggleSort
    };
  }
}
</script>
