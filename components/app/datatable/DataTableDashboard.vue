<template>
  <div class="app-table-dashboard">
    <section class="app-table-dashboard-grid">
      <article class="app-dashboard-mini-card" v-for="metric in metrics" :key="metric.key">
        <small>{{ metric.label }}</small>
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.meta }}</span>
      </article>
    </section>

    <section class="app-table-dashboard-groups">
      <article class="app-dashboard-group-card" v-for="bucket in buckets" :key="bucket.key">
        <header>
          <h4>{{ bucket.label }}</h4>
          <span>{{ bucket.rows.length }}</span>
        </header>
        <div class="app-dashboard-group-list">
          <button
            v-for="row in bucket.rows.slice(0, 3)"
            :key="row.id"
            type="button"
            class="app-dashboard-group-row"
            @click="$emit('open-row', row)"
          >
            <div>
              <strong>{{ primaryValue(row) }}</strong>
              <small>{{ referenceValue(row) }}</small>
            </div>
            <strong>{{ amountValue(row) }}</strong>
          </button>
        </div>
      </article>
    </section>
  </div>
</template>

<script>
const PREFERRED_PRIMARY_KEYS = ['clientName', 'name', 'title', 'description', 'employeeName', 'folio', 'id'];
const PREFERRED_AMOUNT_KEYS = ['total', 'amount', 'rate', 'salary'];

export default {
  name: 'DataTableDashboard',
  props: {
    rows: { type: Array, default: () => [] },
    buckets: { type: Array, default: () => [] },
    columns: { type: Array, default: () => [] },
    formatMoney: { type: Function, required: true },
    displayCellValue: { type: Function, required: true },
    i18n: { type: Object, default: () => ({}) },
  },
  emits: ['open-row'],
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
    metrics() {
      const totalAmount = this.rows.reduce((sum, row) => sum + this.numericAmount(row), 0);
      const active = this.rows.filter((row) => this.statusValue(row).toLowerCase() === 'vigente');
      const pending = this.rows.filter((row) => ['pendiente', 'borrador', 'pending', 'draft'].includes(this.statusValue(row).toLowerCase()));
      return [
        { key: 'records', label: 'Registros', value: String(this.rows.length), meta: this.i18n.tableStatus || 'Vista actual' },
        { key: 'amount', label: this.amountColumn?.label || 'Importe', value: this.formatMoney(totalAmount), meta: `${this.rows.length} registros` },
        { key: 'active', label: this.i18n.filterVigente || 'Vigentes', value: String(active.length), meta: this.formatMoney(active.reduce((sum, row) => sum + this.numericAmount(row), 0)) },
        { key: 'pending', label: this.i18n.filterPendiente || 'Pendientes', value: String(pending.length), meta: this.formatMoney(pending.reduce((sum, row) => sum + this.numericAmount(row), 0)) },
      ];
    },
  },
  methods: {
    numericAmount(row) {
      if (!this.amountColumn) return 0;
      const raw = row[this.amountColumn.key];
      const parsed = typeof raw === 'number' ? raw : Number(String(raw || '').replace(/[^\d.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    },
    primaryValue(row) {
      const value = this.displayCellValue(row, this.primaryColumn);
      return value === '-' ? this.referenceValue(row) : value;
    },
    amountValue(row) {
      return this.amountColumn ? this.displayCellValue(row, this.amountColumn) : this.formatMoney(0);
    },
    referenceValue(row) {
      const serie = row.serie || row.series;
      return [serie, row.folio].filter(Boolean).join('-') || row.id || '-';
    },
    statusValue(row) {
      return String(row.status || row.type || 'Borrador');
    },
  },
};
</script>
