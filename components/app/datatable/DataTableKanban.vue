<template>
  <div class="app-kanban-wrap">
    <div v-if="!buckets.length" class="app-kanban-empty">
      <i class="fa-solid fa-circle-info"></i>
      <span>No hay registros para esta vista.</span>
    </div>

    <article
      v-for="bucket in buckets"
      :key="bucket.key"
      class="app-kanban-column"
      @dragover.prevent
      @drop="handleDrop(bucket.key)"
    >
      <header class="app-kanban-head">
        <h4>{{ bucket.label }}</h4>
        <span>{{ bucket.rows.length }}</span>
      </header>

      <div class="app-kanban-stack">
        <div
          v-for="row in bucket.rows"
          :key="row.id"
          class="app-kanban-card"
          draggable="true"
          @dragstart="draggingId = row.id"
          @contextmenu.prevent="$emit('open-context', $event, row)"
          @click="$emit('open-row', row)"
        >
          <div class="app-kanban-card-head">
            <span class="mono">{{ referenceValue(row) }}</span>
            <span class="app-status-pill" :class="statusClass(statusValue(row))">{{ statusValue(row) }}</span>
          </div>
          <h5>{{ primaryValue(row) }}</h5>
          <p>{{ secondaryValue(row) }}</p>
          <footer>
            <strong>{{ amountValue(row) }}</strong>
            <span>{{ dateValue(row) }}</span>
          </footer>
        </div>
      </div>
    </article>
  </div>
</template>

<script>
const PREFERRED_PRIMARY_KEYS = ['clientName', 'name', 'title', 'description', 'employeeName', 'folio', 'id'];
const PREFERRED_SECONDARY_KEYS = ['description', 'companyName', 'clientRfc', 'invoiceFolio', 'category', 'type'];
const PREFERRED_AMOUNT_KEYS = ['total', 'amount', 'rate', 'salary'];
const PREFERRED_DATE_KEYS = ['date', 'paymentDate', 'startDate', 'endDate'];

export default {
  name: 'DataTableKanban',
  props: {
    buckets: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    formatMoney: { type: Function, required: true },
    displayCellValue: { type: Function, required: true },
    statusClass: { type: Function, required: true },
  },
  emits: ['move-record', 'open-context', 'open-row'],
  data() {
    return { draggingId: '' };
  },
  computed: {
    visibleColumns() {
      return this.columns.filter((column) => column.visible !== false);
    },
    primaryColumn() {
      return this.pickColumn(PREFERRED_PRIMARY_KEYS) || this.visibleColumns[0] || { key: 'id', label: 'ID' };
    },
    secondaryColumn() {
      return this.pickColumn(PREFERRED_SECONDARY_KEYS, [this.primaryColumn.key]);
    },
    amountColumn() {
      return this.pickColumn(PREFERRED_AMOUNT_KEYS) || this.visibleColumns.find((column) => column.numeric || column.type === 'currency');
    },
    dateColumn() {
      return this.pickColumn(PREFERRED_DATE_KEYS);
    },
  },
  methods: {
    pickColumn(keys, excluded = []) {
      return keys.map((key) => this.visibleColumns.find((column) => column.key === key && !excluded.includes(key))).find(Boolean);
    },
    handleDrop(bucketKey) {
      if (!this.draggingId) return;
      this.$emit('move-record', { rowId: this.draggingId, bucketKey });
      this.draggingId = '';
    },
    primaryValue(row) {
      const value = this.displayCellValue(row, this.primaryColumn);
      return value === '-' ? this.referenceValue(row) : value;
    },
    secondaryValue(row) {
      return this.secondaryColumn ? this.displayCellValue(row, this.secondaryColumn) : '-';
    },
    amountValue(row) {
      return this.amountColumn ? this.displayCellValue(row, this.amountColumn) : this.formatMoney(0);
    },
    dateValue(row) {
      return this.dateColumn ? this.displayCellValue(row, this.dateColumn) : '';
    },
    referenceValue(row) {
      const serie = row.serie || row.series;
      return [serie, row.folio].filter(Boolean).join('-') || row.id || '-';
    },
    statusValue(row) {
      return row.status || row.type || 'Borrador';
    },
  },
};
</script>
