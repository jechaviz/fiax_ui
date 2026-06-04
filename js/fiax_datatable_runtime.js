(() => {
  const ROOT = window.fiax || (window.fiax = {});
  ROOT.datatable = ROOT.datatable || {};

  const SCHEMA = ROOT.datatable.schema || {};
  const FILTERS = ROOT.datatable.filters || {};
  const VIEWS = ROOT.datatable.views || {};

  const {
    normalizeDate = (value) => value,
    normalizeFilterGroup = (group) => group,
    resolveCellValue = (row, column) => row?.[column?.key],
    toText = (value) => String(value ?? ''),
  } = SCHEMA;

  const {
    escapeCsvCell = (value) => `"${String(value ?? '')}"`,
    formatMoney = (value) => String(value ?? ''),
    statusLabel = (value) => String(value ?? ''),
  } = FILTERS;

  const {
    createView = (name, config) => ({ id: name, name, config }),
    loadJson = (_key, fallback) => fallback,
    normalizeViews = (list) => list || [],
    saveJson = () => {},
    storageKey = (name) => name,
  } = VIEWS;

  const TIPO_COMPROBANTE_LABELS = { I: 'Ingreso', E: 'Egreso', T: 'Traslado', P: 'Pago', N: 'Nomina' };
  const STATUS_CLASS_MAP = {
    vigente: 'app-status--vigente',
    cancelado: 'app-status--cancelado',
    pendiente: 'app-status--pendiente',
    borrador: 'app-status--borrador',
    paid: 'app-status--vigente',
    overdue: 'app-status--pendiente',
    pending: 'app-status--pendiente',
    draft: 'app-status--borrador',
  };

  function formatDateDisplay(value) {
    if (!value) return '-';
    const raw = String(value).slice(0, 10);
    const [year, month, day] = raw.split('-').map(Number);
    if (!year || !month || !day) return value;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function parseCsvLine(line) {
    const values = [];
    let current = '';
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && quoted && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current.trim());
    return values;
  }

  function createMethods() {
    return {
      isColumnEditable(column) {
        const schemaEditable = column?._schemaEditable ?? Boolean(column?.editable);
        if (!schemaEditable) return false;
        if (!Array.isArray(this.editableKeys) || !this.editableKeys.length) return true;
        return this.editableKeys.includes(column.key);
      },
      storageKeys() {
        return { views: storageKey(`datatable.views.${this.surfaceKey}`) };
      },
      defaultViewConfig() {
        return {
          columns: this.columns.map((column) => ({ ...column })),
          filterGroup: normalizeFilterGroup(this.filterGroup, this.columns[0]?.key || 'clientName'),
          sorting: this.sorting.map((entry) => ({ ...entry })),
          groupByKey: this.groupByKey,
          showColumnFilters: this.showColumnFilters,
        };
      },
      restoreViews() {
        const defaults = [{
          id: 'default',
          name: this.i18n.defaultViewName || 'Vista predeterminada',
          isDefault: true,
          config: this.defaultViewConfig(),
        }];
        const persisted = normalizeViews(loadJson(this.storageKeys().views, defaults));
        this.views = persisted.length ? persisted : defaults;
        this.applyNamedView(this.views[0].id, false);
      },
      persistViews() {
        saveJson(this.storageKeys().views, this.views);
      },
      applyNamedView(viewId, markClean = true) {
        const view = this.views.find((entry) => entry.id === viewId);
        if (!view) return;
        this.activeViewId = view.id;
        this.columns = (view.config.columns || []).map((column) => ({ ...column }));
        this.filterGroup = normalizeFilterGroup(view.config.filterGroup, this.columns[0]?.key || 'clientName');
        this.sorting = Array.isArray(view.config.sorting) && view.config.sorting.length
          ? view.config.sorting.map((entry) => ({ ...entry }))
          : [{ id: 'date', dir: 'desc' }];
        this.groupByKey = view.config.groupByKey || '';
        this.showColumnFilters = Boolean(view.config.showColumnFilters);
        this.activeGroupBucket = '';
        if (markClean) this.isDirty = false;
      },
      saveAsNewView(name) {
        this.views = [...this.views, createView(name, this.defaultViewConfig())];
        this.persistViews();
        this.showSaveView = false;
        this.isDirty = false;
      },
      updateCurrentView(name) {
        if (!this.activeView) return;
        this.views = this.views.map((view) => (
          view.id === this.activeView.id ? { ...view, name, config: this.defaultViewConfig() } : view
        ));
        this.persistViews();
        this.showSaveView = false;
        this.isDirty = false;
      },
      deleteCurrentView() {
        if (!this.activeView || this.activeView.isDefault) return;
        this.views = this.views.filter((view) => view.id !== this.activeView.id);
        this.persistViews();
        this.showSaveView = false;
        this.applyNamedView('default');
      },
      markDirty() {
        this.isDirty = true;
      },
      columnStyle(column) {
        return column.width ? { width: `${column.width}px`, minWidth: `${column.width}px` } : {};
      },
      handleSearch(value) {
        this.internalFilter = value;
        this.$emit('search', value);
        this.setPage(1);
      },
      handleHeaderFilter({ key, value }) {
        this.columnFilters = { ...this.columnFilters, [key]: value };
        this.markDirty();
        this.setPage(1);
      },
      toggleColumnFilters() {
        this.showColumnFilters = !this.showColumnFilters;
        this.markDirty();
        this.setPage(1);
      },
      setInternalView(v) {
        this.internalViewMode = v;
        this.$emit('update-view', v);
      },
      sortState(columnKey) {
        const rule = this.sorting.find((entry) => entry.id === columnKey);
        return rule ? rule.dir : 'none';
      },
      setSort(column) {
        if (!column?.sortable) return;
        const current = this.sorting.find((entry) => entry.id === column.key);
        if (!current) {
          this.sorting = [{ id: column.key, dir: 'asc' }, ...this.sorting.filter((entry) => entry.id !== column.key)];
        } else if (current.dir === 'asc') {
          this.sorting = [{ id: column.key, dir: 'desc' }, ...this.sorting.filter((entry) => entry.id !== column.key)];
        } else {
          this.sorting = this.sorting.filter((entry) => entry.id !== column.key);
        }
        this.markDirty();
      },
      handleColumnDrop({ sourceKey, targetKey }) {
        const activeSource = sourceKey || this.dragColumnKey;
        if (!activeSource || activeSource === targetKey) return;
        const next = this.columns.slice();
        const sourceIndex = next.findIndex((column) => column.key === activeSource);
        const targetIndex = next.findIndex((column) => column.key === targetKey);
        if (sourceIndex < 0 || targetIndex < 0) return;
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        this.columns = next;
        this.dragColumnKey = '';
        this.markDirty();
      },
      handleColumnResize({ key, width }) {
        this.columns = this.columns.map((column) => (column.key === key ? { ...column, width } : column));
        this.markDirty();
      },
      resolveCellValue(row, column) {
        return resolveCellValue(row, column);
      },
      displayCellValue(row, column) {
        const value = this.resolveCellValue(row, column);
        if (column.key === 'total' || column.key === 'amount' || column.key === 'rate') return this.formatMoney(value);
        if (Array.isArray(value)) return value.join(', ');
        if (column.key === 'date' || column.key === 'issuedDateIso' || column.key === 'dueDateIso' || column.key === 'paymentDate') {
          return formatDateDisplay(value);
        }
        if (column.key === 'tipoDeComprobante') {
          return TIPO_COMPROBANTE_LABELS[value] || value || '-';
        }
        return value == null || value === '' ? '-' : value;
      },
      statusLabel(type) {
        return statusLabel(type, this.i18n);
      },
      statusClass(statusText) {
        const key = toText(statusText || 'Borrador').toLowerCase().trim();
        return STATUS_CLASS_MAP[key] || 'app-status--borrador';
      },
      formatMoney(value) {
        return formatMoney(value);
      },
      editorOptions(column) {
        if (column.key === 'owner' || column.key === 'collaborators') {
          return ['Operaciones', 'Finanzas', 'Ventas', 'Precios', 'Cobranza', 'Campo'].map((value) => ({ value, label: value }));
        }
        return column.options || [];
      },
      isEditing(row, column) {
        return Boolean(this.editingCell && this.editingCell.rowId === row.id && this.editingCell.colKey === column.key);
      },
      startEdit(row, column) {
        if (!this.isColumnEditable(column)) return;
        this.editingCell = { rowId: row.id, colKey: column.key };
      },
      startRowInlineEdit(row) {
        const preferredOrder = ['billTo', 'contactEmail', 'paymentTerm', 'issuedDateIso', 'dueDateIso', 'owner'];
        const preferredEditable = preferredOrder
          .map((key) => this.visibleColumns.find((column) => column.key === key && this.isColumnEditable(column)))
          .find(Boolean);
        const firstEditable = preferredEditable || this.visibleColumns.find((column) => this.isColumnEditable(column));
        if (firstEditable) this.startEdit(row, firstEditable);
      },
      async saveEdit(row, column, nextValue) {
        const target = this.localRows.find((candidate) => candidate.id === row.id);
        if (!target) return;
        const previous = JSON.parse(JSON.stringify(target));
        let persistedValue;
        if (column.key === 'status') {
          target.status = nextValue;
          persistedValue = target.status;
        } else if (column.key === 'total' || column.key === 'amount' || column.key === 'rate') {
          const amount = Number(toText(nextValue).replace(/[^\d.-]/g, ''));
          target[column.key] = Number.isNaN(amount) ? 0 : amount;
          persistedValue = target[column.key];
        } else if (column.key === 'issuedDateIso' || column.key === 'dueDateIso' || column.key === 'date') {
          target[column.key] = normalizeDate(nextValue);
          persistedValue = target[column.key];
        } else {
          target[column.key] = Array.isArray(nextValue) ? [...nextValue] : nextValue;
          persistedValue = target[column.key];
        }
        this.editingCell = null;
        this.markDirty();
        const patch = { [column.key]: persistedValue };
        const api = ROOT.api;
        if (!api?.saveInline || !this.surfaceKey) {
          this.$emit('save-inline', { surfaceKey: this.surfaceKey, rowId: row.id, patch, result: { ok: true, localOnly: true } });
          return;
        }
        const result = await api.saveInline(this.surfaceKey, row.id, patch);
        this.$emit('save-inline', { surfaceKey: this.surfaceKey, rowId: row.id, patch, result });
        if (!result?.ok) Object.assign(target, previous);
      },
      cancelEdit() {
        this.editingCell = null;
      },
      openContextMenu(event, row) {
        this.contextMenu = { open: true, x: event.clientX + 8, y: event.clientY + 8, row };
      },
      handleOutsideContextMenu(event) {
        if (!this.contextMenu.open) return;
        if (this.$el.contains(event.target) && event.target.closest('.app-row-context-menu')) return;
        this.contextMenu.open = false;
      },
      handleContextAction(action) {
        const row = this.contextMenu.row;
        this.contextMenu.open = false;
        if (!row) return;
        if (action === 'edit') this.startRowInlineEdit(row);
        if (action === 'copy-id' && navigator.clipboard) navigator.clipboard.writeText(row.id || '');
        if (action === 'open') this.emitRowAction('open-record', row);
      },
      emitRowAction(action, row) {
        this.$emit('row-action', { action, rowId: row?.id, recordId: row?.recordId, model: row?.recordModel, row });
      },
      applyTableSettings(payload) {
        if (!payload) return;
        this.columns = (payload.columns || []).map((column) => ({ ...column }));
        this.filterGroup = normalizeFilterGroup(payload.filterGroup, this.columns[0]?.key || 'clientName');
        this.sorting = Array.isArray(payload.sorting) && payload.sorting.length ? payload.sorting : this.sorting;
        this.groupByKey = payload.groupByKey || '';
        this.activeGroupBucket = '';
        this.showSettings = false;
        this.markDirty();
        this.setPage(1);
      },
      setPage(page) {
        const next = Math.min(Math.max(page, 1), Math.max(this.pageCount, 1));
        this.$emit('update-page', next);
      },
      onPageSizeChange(ev) {
        const size = Math.max(1, Number(ev?.target?.value || this.pageSize));
        this.$emit('update-page-size', size);
        this.$emit('update-page', 1);
      },
      moveKanbanRecord({ rowId, bucketKey }) {
        const target = this.localRows.find((row) => row.id === rowId);
        if (!target) return;
        const groupKey = this.groupByKey || 'status';
        target[groupKey] = bucketKey;
        this.markDirty();
      },
      emitRefresh() {
        this.$emit('refresh');
      },
      exportVisibleRows() {
        const headers = this.visibleColumns.map((column) => escapeCsvCell(column.label));
        const lines = [headers.join(',')];
        this.sortedRows.forEach((row) => {
          const cells = this.visibleColumns.map((column) => escapeCsvCell(this.displayCellValue(row, column)));
          lines.push(cells.join(','));
        });
        const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = `fiax-${this.surfaceKey}-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(href);
      },
      openImportPicker() {
        this.$refs.importInput?.click();
      },
      importCsv(event) {
        const file = event?.target?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const raw = String(reader.result || '').trim();
          if (!raw) return;
          const [headerLine, ...bodyLines] = raw.split(/\r?\n/);
          const headers = parseCsvLine(headerLine);
          this.localRows = bodyLines.filter((line) => line.trim().length > 0).map((line, index) => {
            const values = parseCsvLine(line);
            const row = {
              id: `import-${Date.now()}-${index}`,
              serie: 'I',
              folio: String(index + 1).padStart(6, '0'),
              status: 'Borrador',
              total: 0,
              tags: [],
              collaborators: [],
              rating: 0,
              urgency: 0,
            };
            headers.forEach((header, cellIndex) => {
              const column = this.columns.find((entry) => entry.label === header);
              if (!column) return;
              row[column.key] = values[cellIndex] || '';
            });
            row.date = normalizeDate(row.date || new Date().toISOString().slice(0, 10));
            row.total = Number(toText(row.total).replace(/[^\d.-]/g, '')) || 0;
            return row;
          });
        };
        reader.readAsText(file);
        event.target.value = '';
      },
    };
  }

  ROOT.datatable.runtime = Object.freeze({ createMethods, formatDateDisplay, parseCsvLine });
})();
