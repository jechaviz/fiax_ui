<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col pb-10">
    
    <!-- Header -->
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <router-link to="/cfdi/ingresos" class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">
          <i class="fa-solid fa-arrow-left"></i>
        </router-link>
        <div>
          <h1 class="text-3xl font-black tracking-tighter text-white">{{ isEditing ? 'Editar' : 'Nueva' }} Factura</h1>
          <p class="text-slate-400 text-sm mt-1">CFDI v4.0 • Estandarizado • Neural-Glass Interface</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <div class="px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-shield-halved"></i> PAC Validado
        </div>
        <div class="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
          <i class="fa-solid fa-wand-magic-sparkles"></i> AI Enhanced
        </div>
      </div>
    </header>

    <!-- Main Form Layout -->
    <div class="grid grid-cols-1 xl:grid-cols-4 gap-8 flex-1 min-h-0 items-start">
      
      <!-- Center: Main Form Content -->
      <div class="xl:col-span-3 space-y-6">
        
        <!-- Section: Related CFDIs (Parity) -->
        <RelatedCfdiSection :invoice="invoice" @update="updateInvoice" />

        <!-- Section: Global Info (Parity 4.0) -->
        <GlobalInfoSection :invoice="invoice" @update="updateInvoice" @update-top="updateInvoiceTop" />

        <!-- Section: Issuer & Receiver -->
        <IssuerReceiverSection 
            :invoice="invoice" 
            :issuers="state.data.issuers" 
            :clients="clients" 
            @update="updateInvoice" 
        />

        <!-- Section: Invoice Basic Details (Serie, Folio, Moneda) -->
        <InvoiceDetailsSection :invoice="invoice" @update="updateInvoice" />

        <!-- Section: Line Items -->
        <div class="bg-white/2 border border-white/5 rounded-2xl p-6">
          <LineItemsSection 
            :line-items="invoice.lineItems" 
            :state="state"
            :currency="invoice.currency"
            @update="v => updateInvoice({ lineItems: v })"
            @open-tax-manager="idx => taxManager = { isOpen: true, index: idx }"
          />
        </div>

        <!-- Section: Advanced Metadata (Parity) -->
        <InvoiceOptionsSection :invoice="invoice" @update="updateInvoice" />

        <!-- Action Footer -->
        <InvoiceActions 
          :save-status="saveStatus" 
          :is-editing="isEditing" 
          @cancel="$router.push('/cfdi/ingresos')"
          @draft="handleSaveDraft"
          @stamp="handleStamp"
        />

      </div>

      <!-- Right: Summary Sidebar -->
      <aside class="xl:col-span-1 space-y-6 sticky top-0">
        <InvoiceTotals :totals="totals" :state="state" :currency="invoice.currency" />
        
        <!-- AI Tips Denormalized -->
        <div v-if="invoice.receiver?.rfc === 'XAXX010101000'" class="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl space-y-3">
           <div class="flex items-center gap-2 text-blue-400">
            <i class="fa-solid fa-wand-magic-sparkles"></i>
            <span class="text-xs font-black uppercase tracking-widest">Global AI Insight</span>
          </div>
          <p class="text-xs text-slate-400 leading-relaxed">
            Has activado el modo de <strong>Factura Global</strong>. El sistema ha ajustado automáticamente el RFC a Público en General. Recuerda que la periodicidad debe coincidir con tus registros de venta diarios/semanales.
          </p>
        </div>
      </aside>
    </div>

    <!-- Modals -->
    <TaxManagerModal 
      v-if="taxManager.isOpen"
      :is-open="taxManager.isOpen"
      :line-item="invoice.lineItems[taxManager.index]"
      :line-item-index="taxManager.index"
      :state="state"
      @close="taxManager.isOpen = false"
      @save="onTaxesSaved"
    />

  </div>
</template>

<script>
import IssuerReceiverSection from './invoice/form/IssuerReceiverSection.vue';
import GlobalInfoSection from './invoice/form/GlobalInfoSection.vue';
import RelatedCfdiSection from './invoice/form/RelatedCfdiSection.vue';
import InvoiceDetailsSection from './invoice/form/InvoiceDetailsSection.vue';
import InvoiceOptionsSection from './invoice/form/InvoiceOptionsSection.vue';
import LineItemsSection from './invoice/form/LineItemsSection.vue';
import InvoiceTotals from './invoice/form/InvoiceTotals.vue';
import InvoiceActions from './invoice/form/InvoiceActions.vue';
import TaxManagerModal from './invoice/form/TaxManagerModal.vue';

export default {
  name: 'InvoiceForm',
  components: {
    IssuerReceiverSection,
    GlobalInfoSection,
    RelatedCfdiSection,
    InvoiceDetailsSection,
    InvoiceOptionsSection,
    LineItemsSection,
    InvoiceTotals,
    InvoiceActions,
    TaxManagerModal
  },
  props: {
    state: { type: Object, required: true },
    id: { type: String, default: null }
  },
  setup(props) {
    const isEditing = Vue.ref(false);
    const saveStatus = Vue.ref('');
    const clients = Vue.computed(() => [
      ...((props.state.data.users || []).filter(u => u.type === 'Client')),
      ...(props.state.data.clients || []),
      ...(props.state.data.customers || [])
    ]);

    const invoice = Vue.reactive({
      id: props.id || `inv-draft-${Date.now()}`,
      version: '4.0',
      serie: 'A',
      folio: String(Math.floor(1000 + Math.random() * 9000)),
      date: new Date().toISOString(),
      status: 'Vigente',
      tipoDeComprobante: 'I',
      exportacion: '01',
      issuerId: props.state.data.issuers?.[0]?.id || '',
      branchId: props.state.data.issuers?.[0]?.branches?.[0]?.id || '',
      currency: 'MXN',
      exchangeRate: 1,
      paymentMethod: 'PUE',
      paymentType: '03',
      cfdiUse: 'G03',
      receiver: {
        userId: '',
        name: '',
        rfc: '',
        taxRegime: '',
        postalCode: '',
        cfdiUse: 'G03'
      },
      lineItems: [
        {
          id: `item-${Date.now()}`,
          productCode: '01010101',
          unitCode: 'E48',
          quantity: 1,
          unit: 'Servicio',
          description: '',
          unitPrice: 0,
          discount: 0,
          objetoImp: '02',
          taxes: [
            { taxType: 'IVA', rate: 0.16, isRetention: false, isLocal: false, base: 0, amount: 0 }
          ]
        }
      ]
    });

    // Hydration logic for Edit Mode
    Vue.onMounted(() => {
        if (props.id) {
            const found = props.state.data.invoices.find(i => i.id === props.id);
            if (found) {
                console.log(`[Fiax Form] Hydrating invoice: ${props.id}`);
                isEditing.value = true;
                Object.assign(invoice, JSON.parse(JSON.stringify(found))); // Deep copy for edit
            } else {
                console.warn(`[Fiax Form] Invoice not found for ID: ${props.id}`);
            }
        }
    });

    const taxManager = Vue.reactive({
      isOpen: false,
      index: 0
    });

    const updateInvoice = (updates) => { Object.assign(invoice, updates); };
    
    const updateInvoiceTop = (newInvoice) => {
        // Full replace for top level deletions
        Object.keys(invoice).forEach(key => delete invoice[key]);
        Object.assign(invoice, newInvoice);
    };

    const totals = Vue.computed(() => {
        return window.fiax.logic.cfdi.calculateTotals(invoice.lineItems, invoice.currency, invoice.exchangeRate);
    });

    const onTaxesSaved = (taxes) => {
        invoice.lineItems[taxManager.index].taxes = taxes;
        taxManager.isOpen = false;
    };

    const handleSaveDraft = async () => {
        saveStatus.value = 'saving';
        const result = await props.state.saveInvoice({ ...invoice, status: 'Borrador' });
        if (result?.ok === false) {
            saveStatus.value = 'error';
            alert(result.message || 'No se pudo guardar el borrador.');
            return;
        }
        if (result?.record) Object.assign(invoice, result.record);
        setTimeout(() => {
            saveStatus.value = 'saved';
            setTimeout(() => saveStatus.value = '', 3000);
        }, 300);
    };

    const handleStamp = async () => {
        const normalized = window.fiax?.cfdiModel?.normalizeInvoice?.(invoice, props.state) || invoice;
        const validation = window.fiax.logic.cfdi.validate(normalized);
        if (!validation.isValid) {
            const firstErrField = Object.keys(validation.errors)[0];
            const firstErr = validation.errors[firstErrField][0];
            alert(`⚠️ Error de Validación SAT [${firstErrField}]:\n${firstErr}`);
            return;
        }

        await props.state.saveInvoice({ ...normalized, status: normalized.status || 'Borrador' });
        const result = await window.fiax.api.stampInvoice(normalized);
        if (!result.ok) {
            alert(result.message || 'No se pudo timbrar: falta backend fiscal o PAC configurado.');
            return;
        }
        const stamped = result.data?.invoice || result.record || normalized;
        Object.assign(invoice, stamped);
        await props.state.saveInvoice(stamped);
        alert('Comprobante timbrado correctamente.');
    };

    return { 
      invoice, 
      isEditing, 
      saveStatus, 
      clients, 
      taxManager,
      totals,
      updateInvoice,
      updateInvoiceTop,
      onTaxesSaved,
      handleSaveDraft,
      handleStamp
    };
  }
}
</script>
