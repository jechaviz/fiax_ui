<template>
  <div class="app-record-card-grid">
    <article v-for="row in rows" :key="row.id" class="app-record-card" @contextmenu.prevent="$emit('open-context', $event, row)">
      <header class="app-record-card-head">
        <div>
          <span class="app-record-card-id">{{ referenceValue(row) }}</span>
          <h4>{{ primaryValue(row) }}</h4>
        </div>
        <span class="app-status-pill" :class="statusClass(statusValue(row))">{{ statusValue(row) }}</span>
      </header>

      <div class="app-record-card-body">
        <div v-for="column in detailColumns" :key="`${row.id}:${column.key}`" class="app-record-card-field">
          <span>{{ column.label }}</span>
          <strong>{{ displayCellValue(row, column) }}</strong>
        </div>
      </div>

      <footer class="app-record-card-actions">
        <strong v-if="amountColumn">{{ amountValue(row) }}</strong>
        <span v-else class="app-record-card-id">{{ referenceValue(row) }}</span>
        <div>
          <button type="button" class="app-row-action" title="Open" @click="$emit('open-row', row)"><i class="fa-solid fa-eye"></i></button>
          <button type="button" class="app-row-action" title="Edit" @click="$emit('edit-row', row)"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="app-row-action" title="Send" @click="$emit('native-row', row)"><i class="fa-solid fa-paper-plane"></i></button>
        </div>
      </footer>
    </article>
  </div>
</template>

<script>
const PREFERRED_PRIMARY_KEYS = ['clientName', 'name', 'title', 'description', 'employeeName', 'folio', 'id'];
const PREFERRED_AMOUNT_KEYS = ['total', 'amount', 'rate', 'salary'];

export default {
  name: 'DataTableCards',
  props: {
    rows: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    formatMoney: { type: Function, required: true },
    displayCellValue: { type: Function, required: true },
    statusClass: { type: Function, required: true },
  },
  emits: ['open-context', 'open-row', 'edit-row', 'native-row'],
  computed: {
    visibleColumns() {
      return this.columns.filter((column) => column.visible !== false);
    },
    primaryColumn() {
      return PREFERRED_PRIMARY_KEYS.map((key) => this.visibleColumns.find((column) => column.key === key)).find(Boolean)
        || this.visibleColumns[0]
        || { key: 'id', label: 'ID' };
    },
    amountColumn() {
      return PREFERRED_AMOUNT_KEYS.map((key) => this.visibleColumns.find((column) => column.key === key)).find(Boolean)
        || this.visibleColumns.find((column) => column.numeric || column.type === 'currency');
    },
    detailColumns() {
      const hidden = new Set([this.primaryColumn.key, this.amountColumn?.key, 'status', 'id']);
      return this.visibleColumns.filter((column) => !hidden.has(column.key)).slice(0, 4);
    },
  },
  methods: {
    primaryValue(row) {
      const value = this.displayCellValue(row, this.primaryColumn);
      return value === '-' ? this.referenceValue(row) : value;
    },
    referenceValue(row) {
      const serie = row.serie || row.series;
      return [serie, row.folio].filter(Boolean).join('-') || row.id || '-';
    },
    statusValue(row) {
      return row.status || row.type || 'Borrador';
    },
    amountValue(row) {
      return this.amountColumn ? this.displayCellValue(row, this.amountColumn) : this.formatMoney(0);
    },
  },
};
</script>
