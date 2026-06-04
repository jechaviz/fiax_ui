<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col pb-10">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <router-link :to="config.backPath" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <i class="fa-solid fa-arrow-left"></i>
        </router-link>
        <div>
          <h1 class="text-3xl font-black tracking-tighter text-white">{{ config.title }}</h1>
          <p class="text-slate-400 text-sm mt-1">{{ config.subtitle }}</p>
        </div>
      </div>
    </header>

    <form class="app-generic-form" @submit.prevent="save">
      <section class="app-generic-form-grid">
        <label v-for="field in config.fields" :key="field.key" class="app-generic-field" :class="{ wide: field.wide }">
          <span>{{ field.label }}</span>
          <select v-if="field.type === 'select'" v-model="form[field.key]">
            <option v-for="option in field.options" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
          <textarea v-else-if="field.type === 'textarea'" v-model="form[field.key]" rows="4"></textarea>
          <input v-else v-model="form[field.key]" :type="field.type || 'text'" :step="field.step || null" />
        </label>
      </section>

      <footer class="app-generic-form-actions">
        <button type="button" class="app-button-secondary py-2 px-4" @click="router.push(config.backPath)">Cancelar</button>
        <button type="submit" class="app-button-primary py-2 px-6" :disabled="saving">
          <i class="fa-solid" :class="saving ? 'fa-circle-notch fa-spin' : 'fa-floppy-disk'"></i>
          {{ saving ? 'Guardando' : 'Guardar' }}
        </button>
      </footer>
    </form>
  </div>
</template>

<script>
const STATUS_OPTIONS = ['Borrador', 'Pendiente', 'Vigente'].map((value) => ({ value, label: value }));

const field = (key, label, type = 'text', extra = {}) => ({ key, label, type, ...extra });

const SURFACES = {
  paymentReceipts: {
    title: 'Nuevo Recibo de Pago',
    subtitle: 'Complemento REP',
    backPath: '/cfdi/pagos',
    prefix: 'pay',
    fields: [
      field('date', 'Fecha', 'date'),
      field('clientName', 'Cliente'),
      field('invoiceFolio', 'Factura relacionada'),
      field('paymentType', 'Forma de pago', 'text', { default: '03' }),
      field('amount', 'Monto', 'number', { default: 0, step: '0.01' }),
      field('currency', 'Moneda', 'text', { default: 'MXN' }),
      field('status', 'Estado', 'select', { default: 'Borrador', options: STATUS_OPTIONS }),
    ],
    transform(values) {
      return {
        ...values,
        amount: Number(values.amount || 0),
        total: Number(values.amount || 0),
        paymentDate: `${values.date}T12:00:00`,
        relatedDocuments: values.invoiceFolio ? [{ folio: values.invoiceFolio, amountPaid: Number(values.amount || 0) }] : [],
      };
    },
  },
  payrollReceipts: {
    title: 'Nuevo Recibo de Nomina',
    subtitle: 'CFDI de nomina',
    backPath: '/cfdi/nomina',
    prefix: 'pay-rec',
    fields: [
      field('date', 'Fecha', 'date'),
      field('employeeName', 'Empleado'),
      field('type', 'Tipo', 'text', { default: 'O' }),
      field('total', 'Neto', 'number', { default: 0, step: '0.01' }),
      field('currency', 'Moneda', 'text', { default: 'MXN' }),
      field('status', 'Estado', 'select', { default: 'Borrador', options: STATUS_OPTIONS }),
    ],
    transform(values) {
      return { ...values, total: Number(values.total || 0), employee: { name: values.employeeName } };
    },
  },
  leads: {
    title: 'Nuevo Prospecto',
    subtitle: 'CRM',
    backPath: '/leads',
    prefix: 'lead',
    fields: [
      field('date', 'Fecha', 'date'),
      field('title', 'Oportunidad'),
      field('clientName', 'Contacto'),
      field('total', 'Valor', 'number', { default: 0, step: '0.01' }),
      field('status', 'Estado', 'select', { default: 'Borrador', options: STATUS_OPTIONS }),
    ],
  },
  estimates: {
    title: 'Nueva Cotizacion',
    subtitle: 'Propuesta comercial',
    backPath: '/estimates',
    prefix: 'est',
    fields: [
      field('date', 'Fecha', 'date'),
      field('clientName', 'Cliente'),
      field('description', 'Concepto', 'textarea', { wide: true }),
      field('total', 'Total', 'number', { default: 0, step: '0.01' }),
      field('status', 'Estado', 'select', { default: 'Borrador', options: STATUS_OPTIONS }),
    ],
  },
  contracts: {
    title: 'Nuevo Contrato',
    subtitle: 'Acuerdo legal',
    backPath: '/contracts',
    prefix: 'ctr',
    fields: [
      field('title', 'Contrato'),
      field('clientName', 'Cliente'),
      field('startDate', 'Inicio', 'date'),
      field('endDate', 'Fin', 'date'),
      field('status', 'Estado', 'select', { default: 'Borrador', options: STATUS_OPTIONS }),
    ],
  },
  projects: {
    title: 'Nuevo Proyecto',
    subtitle: 'Operacion',
    backPath: '/projects',
    prefix: 'prj',
    fields: [
      field('name', 'Proyecto'),
      field('clientName', 'Cliente'),
      field('progress', 'Progreso', 'number', { default: 0, step: '1' }),
      field('total', 'Presupuesto', 'number', { default: 0, step: '0.01' }),
      field('status', 'Estado', 'select', { default: 'Borrador', options: STATUS_OPTIONS }),
    ],
  },
  expenses: {
    title: 'Nuevo Gasto',
    subtitle: 'Finanzas',
    backPath: '/expenses',
    prefix: 'exp',
    fields: [
      field('date', 'Fecha', 'date'),
      field('description', 'Descripcion'),
      field('category', 'Categoria'),
      field('amount', 'Monto', 'number', { default: 0, step: '0.01' }),
      field('status', 'Estado', 'select', { default: 'Pendiente', options: STATUS_OPTIONS }),
    ],
  },
  transactions: {
    title: 'Nueva Transaccion',
    subtitle: 'Bancos',
    backPath: '/transactions',
    prefix: 'txn',
    fields: [
      field('date', 'Fecha', 'date'),
      field('description', 'Concepto'),
      field('type', 'Tipo'),
      field('amount', 'Monto', 'number', { default: 0, step: '0.01' }),
      field('status', 'Estado', 'select', { default: 'Pendiente', options: STATUS_OPTIONS }),
    ],
  },
  products: {
    title: 'Nuevo Producto',
    subtitle: 'Catalogo',
    backPath: '/products',
    prefix: 'prod',
    fields: [
      field('description', 'Descripcion'),
      field('category', 'Categoria'),
      field('productCode', 'Clave SAT', 'text', { default: '01010101' }),
      field('unitCode', 'Unidad SAT', 'text', { default: 'E48' }),
      field('unit', 'Unidad', 'text', { default: 'Servicio' }),
      field('rate', 'Precio', 'number', { default: 0, step: '0.01' }),
    ],
    transform(values) {
      return { ...values, rate: Number(values.rate || 0) };
    },
  },
};

export default {
  name: 'GenericRecordForm',
  props: {
    state: { type: Object, required: true },
    surfaceKey: { type: String, default: '' },
  },
  setup(props) {
    const router = VueRouter.useRouter();
    const route = VueRouter.useRoute();
    const routeSurface = route.meta?.surfaceKey || route.path.split('/').filter(Boolean).at(-2) || route.path.split('/').filter(Boolean)[0];
    const surfaceKey = props.surfaceKey || routeSurface;
    const config = SURFACES[surfaceKey] || SURFACES.leads;
    const saving = Vue.ref(false);
    const today = new Date().toISOString().slice(0, 10);
    const form = Vue.reactive(Object.fromEntries(config.fields.map((item) => [item.key, item.default ?? (item.type === 'date' ? today : '')])));

    async function save() {
      saving.value = true;
      const base = Object.fromEntries(config.fields.map((item) => [item.key, form[item.key]]));
      const record = {
        id: `${config.prefix}-${Date.now()}`,
        status: base.status || 'Borrador',
        ...((config.transform || ((values) => values))(base)),
      };
      const result = await window.fiax?.api?.saveRecord?.(surfaceKey, record);
      if (result?.ok === false) {
        saving.value = false;
        alert(result.message || 'No se pudo guardar el registro.');
        return;
      }
      props.state.upsertLocal?.(surfaceKey, result?.record || record);
      saving.value = false;
      router.push(config.backPath);
    }

    return { config, form, router, saving, save };
  },
};
</script>
