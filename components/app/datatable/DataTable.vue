<template>
  <div class="app-data-table-shell" :class="{ 'is-toolbar-expanded': toolbarExpanded }">
    <DataTableToolbar
      :views="views"
      :active-view-id="activeViewId"
      :i18n="i18n"
      :is-dirty="isDirty"
      :search="internalFilter"
      :toolbar-expanded="toolbarExpanded"
      :show-column-filters="showColumnFilters"
      :active-rule-count="activeAdvancedRuleCount"
      :favorite-active="hasSavedViews"
      :view-mode="internalViewMode"
      :group-by-key="groupByKey"
      @update:search="handleSearch"
      @toggle-toolbar="toolbarExpanded = !toolbarExpanded"
      @toggle-column-filters="toggleColumnFilters"
      @open-settings="showSettings = true"
      @open-save-view="showSaveView = true"
      @export="exportVisibleRows"
      @import="openImportPicker"
      @refresh="emitRefresh"
      @update-view="setInternalView"
      @new-record="$emit('new-record')"
      @select-view="applyNamedView"
    />

    <DataTableGroupTabs
      v-if="groupByKey"
      :group-key="groupByKey"
      :buckets="groupBuckets"
      :active-bucket="activeGroupBucket"
      :total-count="filteredRows.length"
      :i18n="i18n"
      @select-bucket="activeGroupBucket = $event"
    />

    <div class="app-table-content" :class="{ 'cards-view': internalViewMode === 'cards' }">
      <div v-if="loading" class="app-table-skeleton">
        <div class="app-table-skeleton__head">
          <Spinner size="sm" :label="loadingLabel" />
          <span>{{ loadingLabel }}</span>
        </div>
        <div v-for="idx in 5" :key="idx" class="app-skeleton-row"></div>
      </div>

      <template v-else-if="pagedRows.length || internalViewMode === 'kanban' || internalViewMode === 'dashboard'">
        <DataTableKanban
          v-if="internalViewMode === 'kanban'"
          :buckets="kanbanBuckets"
          :format-money="formatMoney"
          @move-record="moveKanbanRecord"
          @open-context="openContextMenu"
        />

        <div v-else-if="internalViewMode === 'table'" class="app-record-table-wrap">
          <table class="app-record-table">
            <thead>
              <tr>
                <DataTableHeaderCell
                  v-for="column in visibleColumns"
                  :key="column.key"
                  :column="column"
                  :sort-state="sortState(column.key)"
                  :filter-value="columnFilters[column.key] || ''"
                  :status-options="statusOptions"
                  :i18n="i18n"
                  @sort="setSort"
                  @drag-start="dragColumnKey = $event"
                  @drop-column="handleColumnDrop"
                  @resize-column="handleColumnResize"
                  @update-filter="handleHeaderFilter"
                />
                <th class="is-actions">{{ i18n.tableAction || 'Acciones' }}</th>
              </tr>

              <tr v-if="showColumnFilters" class="app-table-filter-row">
                <th v-for="column in visibleColumns" :key="`filter:${column.key}`">
                  <input
                    v-if="column.filterable && column.key !== 'status'"
                    v-model="columnFilters[column.key]"
                    class="app-column-filter-input"
                    :placeholder="`Filtrar ${column.label}`"
                    @input="setPage(1)"
                  />
                  <select v-else-if="column.key === 'status'" v-model="columnFilters[column.key]" class="app-column-filter-input" @change="setPage(1)">
                    <option value="">Todos</option>
                    <option v-for="status in statusOptions" :key="status" :value="status">{{ statusLabel(status) }}</option>
                  </select>
                  <span v-else class="app-table-filter-empty">-</span>
                </th>
                <th class="is-actions"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in pagedRows" :key="row.id" @contextmenu.prevent="openContextMenu($event, row)">
                <td
                  v-for="column in visibleColumns"
                  :key="`${row.id}:${column.key}`"
                  :class="[{ 'is-numeric': column.numeric }, 'app-cell']"
                  :style="columnStyle(column)"
                  @dblclick="startEdit(row, column)"
                >
                  <InlineCellEditor
                    v-if="isEditing(row, column)"
                    :model-value="resolveCellValue(row, column)"
                    :input-type="column.editorType || 'text'"
                    :options="column.options || editorOptions(column)"
                    @save="saveEdit(row, column, $event)"
                    @cancel="cancelEdit"
                  />

                  <template v-else>
                    <span v-if="column.key === 'status'" class="app-status-pill" :class="statusClass(row.status)">{{ row.status || 'Borrador' }}</span>
                    <div v-else-if="column.key === 'tags'" class="app-inline-chip-list"><span v-for="tag in (row.tags || [])" :key="tag" class="app-mini-chip">{{ tag }}</span></div>
                    <div v-else-if="column.key === 'collaborators'" class="app-inline-chip-list"><span v-for="user in (row.collaborators || [])" :key="user" class="app-mini-chip is-user">{{ user }}</span></div>
                    <div v-else-if="column.key === 'rating'" class="app-rating-readonly"><i v-for="star in 5" :key="star" class="fa-solid fa-star" :class="{ active: Number(row.rating || 0) >= star }"></i></div>
                    <div v-else-if="column.key === 'urgency'" class="app-urgency-readonly"><span>{{ row.urgency || 0 }}%</span><div class="app-urgency-track"><i :style="{ width: `${row.urgency || 0}%` }"></i></div></div>
                    <a v-else-if="column.key === 'id' || column.key === 'folio'" href="#" class="app-cell-link" @click.prevent="emitRowAction('open-record', row)">{{ displayCellValue(row, column) }}</a>
                    <span v-else>{{ displayCellValue(row, column) }}</span>
                  </template>
                </td>

                <td class="is-actions">
                  <button type="button" class="app-row-action" title="Ver" @click="emitRowAction('open-record', row)"><i class="fa-solid fa-eye"></i></button>
                  <button type="button" class="app-row-action" title="Editar" @click="startRowInlineEdit(row)"><i class="fa-solid fa-pen"></i></button>
                  <button type="button" class="app-row-action" title="Timbrar / Enviar" @click="emitRowAction('open-native', row)"><i class="fa-solid fa-paper-plane"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <DataTableDashboard
          v-else-if="internalViewMode === 'dashboard'"
          :rows="pagedRows"
          :buckets="kanbanBuckets"
          :format-money="formatMoney"
          :i18n="i18n"
        />

        <DataTableCards
          v-else-if="internalViewMode === 'cards'"
          :rows="pagedRows"
          :format-money="formatMoney"
          @open-context="openContextMenu"
          @edit-row="startRowInlineEdit"
        />
      </template>

      <div v-else class="app-empty-state">
        <i class="fa-solid fa-circle-info"></i>
        <p>{{ i18n.emptyStateTitle || 'No hay registros que coincidan con los filtros actuales.' }}</p>
      </div>
    </div>

    <DataTableFooter
      v-if="internalViewMode !== 'kanban' && internalViewMode !== 'dashboard'"
      :footer-label="footerLabel"
      :page-size="pageSize"
      :safe-page="safePage"
      :page-count="pageCount"
      :page-buttons="pageButtons"
      :i18n="i18n"
      @set-page="setPage"
      @change-page-size="onPageSizeChange"
    />

    <DataTableSettingsModal :open="showSettings" :columns="columns" :filter-group="filterGroup" :sorting="sorting" :group-by-key="groupByKey" :i18n="i18n" @close="showSettings = false" @apply="applyTableSettings" />
    <DataTableSaveViewModal :open="showSaveView" :current-view="activeView" :i18n="i18n" @close="showSaveView = false" @save-as-new="saveAsNewView" @update-current="updateCurrentView" @delete-current="deleteCurrentView" />
    <DataTableContextMenu :open="contextMenu.open" :x="contextMenu.x" :y="contextMenu.y" :i18n="i18n" @action="handleContextAction" />
    <input ref="importInput" class="app-hidden-import" type="file" accept=".csv,text/csv" @change="importCsv" />
  </div>
</template>

<script>
import DataTableToolbar from 'app/datatable/DataTableToolbar.vue';
import DataTableGroupTabs from 'app/datatable/DataTableGroupTabs.vue';
import DataTableKanban from 'app/datatable/DataTableKanban.vue';
import DataTableDashboard from 'app/datatable/DataTableDashboard.vue';
import DataTableHeaderCell from 'app/datatable/DataTableHeaderCell.vue';
import DataTableCards from 'app/datatable/DataTableCards.vue';
import DataTableFooter from 'app/datatable/DataTableFooter.vue';
import DataTableSaveViewModal from 'app/datatable/DataTableSaveViewModal.vue';
import DataTableContextMenu from 'app/datatable/DataTableContextMenu.vue';
import InlineCellEditor from 'app/datatable/InlineCellEditor.vue';
import DataTableSettingsModal from 'app/datatable/DataTableSettingsModal.vue';
import Spinner from 'app/primitives/Spinner.vue';

const SCHEMA = window.fiax?.datatable?.schema || {};
const FILTERS = window.fiax?.datatable?.filters || {};
const RUNTIME = window.fiax?.datatable?.runtime || { createMethods: () => ({}) };
const {
  STATUS_VALUES = ['Vigente', 'Cancelado', 'Pendiente', 'Borrador'],
  createColumnSchema = () => [],
  createGroup = () => ({ logic: 'AND', filters: [] }),
  toText = (value) => String(value ?? ''),
} = SCHEMA;
const {
  buildGroupBuckets = () => [],
  createColumnMap = () => ({}),
  filterRows = ({ rows }) => rows,
  paginateRows = (rows) => ({ pageCount: 1, safePage: 1, pageRows: rows, startIndex: rows.length ? 1 : 0, endIndex: rows.length }),
  sortRows = (rows) => rows,
} = FILTERS;

export default {
  name: 'DataTable',
  components: {
    DataTableToolbar,
    DataTableGroupTabs,
    DataTableKanban,
    DataTableDashboard,
    DataTableHeaderCell,
    DataTableCards,
    DataTableFooter,
    DataTableSaveViewModal,
    DataTableContextMenu,
    InlineCellEditor,
    DataTableSettingsModal,
    Spinner,
  },
  emits: ['search', 'update-view', 'new-record', 'update-page', 'update-page-size', 'refresh', 'save-inline', 'row-action'],
  props: {
    viewMode: { type: String, default: 'table' },
    rows: { type: Array, default: () => [] },
    i18n: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    pageSize: { type: Number, default: 10 },
    currentPage: { type: Number, default: 1 },
    surfaceKey: { type: String, default: 'records' },
    editableKeys: { type: Array, default: () => [] },
  },
  data() {
    const schemaColumns = createColumnSchema(this.i18n || {}, this.surfaceKey).map((column) => ({
      ...column,
      _schemaEditable: Boolean(column?.editable),
    }));
    return {
      internalFilter: '',
      toolbarExpanded: false,
      showColumnFilters: false,
      showSettings: false,
      showSaveView: false,
      internalViewMode: this.viewMode,
      localRows: [],
      columns: schemaColumns,
      sorting: [{ id: 'date', dir: 'desc' }],
      filterGroup: createGroup('clientName'),
      columnFilters: {},
      editingCell: null,
      groupByKey: '',
      activeGroupBucket: '',
      views: [],
      activeViewId: 'default',
      isDirty: false,
      dragColumnKey: '',
      contextMenu: { open: false, x: 0, y: 0, row: null },
    };
  },
  computed: {
    statusOptions() {
      return STATUS_VALUES;
    },
    columnMap() {
      return createColumnMap(this.columns);
    },
    visibleColumns() {
      return this.columns.filter((column) => column.visible !== false);
    },
    activeView() {
      return this.views.find((view) => view.id === this.activeViewId) || null;
    },
    hasSavedViews() {
      return this.views.length > 1;
    },
    activeAdvancedRuleCount() {
      const walk = (group) => (group.filters || []).reduce((count, entry) => count + (entry.filters ? walk(entry) : (toText(entry.value).trim() ? 1 : 0)), 0);
      return walk(this.filterGroup);
    },
    filteredRows() {
      const searchKeys = ['id', 'folio', 'clientName', 'clientRfc', 'companyName', 'description', 'category', 'tipoDeComprobante', 'status', 'date', 'employeeName'];
      return filterRows({
        rows: this.localRows,
        query: this.internalFilter,
        searchKeys,
        visibleColumns: this.visibleColumns,
        columnFilters: this.columnFilters,
        filterGroup: this.filterGroup,
        columnMap: this.columnMap,
      });
    },
    groupBuckets() {
      if (!this.groupByKey) return [];
      return buildGroupBuckets(this.filteredRows, this.groupByKey, this.columnMap, this.i18n);
    },
    groupScopedRows() {
      if (!this.groupByKey || !this.activeGroupBucket) return this.filteredRows;
      const bucket = this.groupBuckets.find((entry) => entry.key === this.activeGroupBucket);
      return bucket ? bucket.rows : this.filteredRows;
    },
    sortedRows() {
      return sortRows(this.groupScopedRows, this.sorting, this.columns);
    },
    paginationModel() {
      return paginateRows(this.sortedRows, this.currentPage, this.pageSize);
    },
    pageCount() {
      return this.paginationModel.pageCount;
    },
    safePage() {
      return this.paginationModel.safePage;
    },
    pagedRows() {
      return this.paginationModel.pageRows;
    },
    footerLabel() {
      return `Mostrando ${this.paginationModel.startIndex} a ${this.paginationModel.endIndex} de ${this.sortedRows.length} registros`;
    },
    pageButtons() {
      const total = this.pageCount;
      const current = this.safePage;
      if (total <= 5) return Array.from({ length: total }, (_, idx) => idx + 1);
      const start = Math.max(1, current - 1);
      const end = Math.min(total, start + 2);
      return Array.from({ length: end - start + 1 }, (_, idx) => start + idx);
    },
    kanbanBuckets() {
      const key = this.groupByKey || 'status';
      return buildGroupBuckets(this.sortedRows, key, this.columnMap, this.i18n);
    },
    loadingLabel() {
      return this.i18n.tableLoadingLabel || 'Cargando registros...';
    },
  },
  watch: {
    rows: {
      deep: true,
      immediate: true,
      handler(nextRows) {
        this.localRows = (Array.isArray(nextRows) ? nextRows : []).map((row) => ({ ...row }));
      },
    },
    i18n: {
      deep: true,
      immediate: true,
      handler() {
        const stateByKey = Object.fromEntries(this.columns.map((column) => [column.key, column]));
        this.columns = createColumnSchema(this.i18n, this.surfaceKey).map((column) => {
          const current = stateByKey[column.key] || {};
          return { ...column, ...current, _schemaEditable: Boolean(column?.editable) };
        });
      },
    },
    editableKeys: {
      immediate: true,
      handler() {
        this.columns = this.columns.map((column) => ({
          ...column,
          _schemaEditable: column._schemaEditable ?? Boolean(column?.editable),
          editable: this.isColumnEditable(column),
        }));
      },
    },
  },
  mounted() {
    this.restoreViews();
    document.addEventListener('click', this.handleOutsideContextMenu);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideContextMenu);
  },
  methods: RUNTIME.createMethods(),
};
</script>
