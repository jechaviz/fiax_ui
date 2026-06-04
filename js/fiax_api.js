/**
 * FIAX Unified Data Access Layer (DAL)
 * Switched between Demo Mode (Local) and Production Mode (PocketBase).
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    const COLLECTION_ALIASES = {
        customers: 'clients',
        users: 'users'
    };

    function normalizeCollection(collection) {
        return COLLECTION_ALIASES[collection] || collection;
    }

    function ensureId(record, prefix) {
        return {
            ...record,
            id: record.id || `${prefix || 'rec'}-${Date.now()}-${Math.round(Math.random() * 1000)}`
        };
    }

    function demoList(state, collection) {
        if (collection === 'clients') {
            return (state.demoData.users || []).filter(user => user.type === 'Client');
        }
        if (!Array.isArray(state.demoData[collection])) {
            state.demoData[collection] = [];
        }
        return state.demoData[collection];
    }

    async function callConfiguredBackend(action, payload) {
        const endpoint = FIAX.config?.fiscal_backend_url;
        if (!endpoint) {
            return {
                ok: false,
                requiresBackend: true,
                message: 'No hay backend fiscal configurado para ejecutar esta accion.'
            };
        }

        try {
            const response = await fetch(`${endpoint.replace(/\/$/, '')}/${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json().catch(() => ({}));
            return response.ok ? { ok: true, data } : { ok: false, message: data.message || response.statusText };
        } catch (err) {
            return { ok: false, message: err?.message || 'No se pudo contactar el backend fiscal.' };
        }
    }

    FIAX.api = {
        /**
         * Generic list fetcher
         */
        async getList(collection, filter = '', sort = '-created') {
            const state = FIAX.state.ensureState();
            const normalizedCollection = normalizeCollection(collection);
            
            // DEMO MODE
            if (state.demoMode) {
                console.log(`[Fiax API] Fetching from Demo Data: ${normalizedCollection}`);
                return demoList(state, normalizedCollection);
            }

            // LIVE MODE (PocketBase)
            if (!FIAX.pb) return [];
            try {
                return await FIAX.pb.collection(normalizedCollection).getFullList({
                    filter: filter,
                    sort: sort
                });
            } catch (err) {
                console.error(`[Fiax API] DB Error (${normalizedCollection}):`, err);
                return [];
            }
        },

        // Helper methods for specific core collections
        async getInvoices() { return this.getList('invoices'); },
        async getIssuers() { return this.getList('issuers'); },
        async getClients() { return this.getList('clients'); },
        async getProducts() { return this.getList('products'); },

        async saveRecord(collection, data) {
            const state = FIAX.state.ensureState();
            const normalizedCollection = normalizeCollection(collection);
            const record = ensureId(data, normalizedCollection.slice(0, 3));

            if (state.demoMode) {
                const finalRecord = normalizedCollection === 'clients' ? { ...record, type: 'Client' } : record;
                state.upsertLocal?.(normalizedCollection, finalRecord);
                return { ok: true, record: finalRecord, localOnly: true };
            }

            if (!FIAX.pb) return { ok: false, message: 'PocketBase no esta disponible.' };
            try {
                const collectionRef = FIAX.pb.collection(normalizedCollection);
                const exists = record.id && await collectionRef.getOne(record.id).then(() => true).catch(() => false);
                const saved = exists ? await collectionRef.update(record.id, record) : await collectionRef.create(record);
                return { ok: true, record: saved };
            } catch (err) {
                return { ok: false, message: err?.message || `No se pudo guardar ${normalizedCollection}.` };
            }
        },

        async saveInline(surfaceKey, rowId, patch) {
            return this.saveRecord(surfaceKey, { id: rowId, ...patch });
        },

        async saveInvoice(invoice) {
            const state = FIAX.state.ensureState();
            const normalized = FIAX.cfdiModel?.normalizeInvoice(invoice, state) || invoice;
            const record = {
                ...normalized,
                status: normalized.status || 'Borrador'
            };
            const result = await this.saveRecord('invoices', record);
            if (result.ok) state.upsertLocal?.('invoices', result.record);
            return result;
        },

        async stampInvoice(invoice) {
            const state = FIAX.state.ensureState();
            const normalized = FIAX.cfdiModel?.normalizeInvoice(invoice, state) || invoice;
            const validation = FIAX.logic?.cfdi?.validate?.(normalized);
            if (validation && !validation.isValid) {
                return { ok: false, validation, message: 'El CFDI no paso validacion local.' };
            }
            return callConfiguredBackend('stamp', { invoice: normalized });
        },

        async sendInvoice(invoice, recipient) {
            const state = FIAX.state.ensureState();
            const normalized = FIAX.cfdiModel?.normalizeInvoice(invoice, state) || invoice;
            return callConfiguredBackend('send', { invoice: normalized, recipient });
        },

        async cancelInvoice(invoice, motive) {
            const state = FIAX.state.ensureState();
            const normalized = FIAX.cfdiModel?.normalizeInvoice(invoice, state) || invoice;
            return callConfiguredBackend('cancel', { invoice: normalized, motive });
        },

        /**
         * Sets the current invoice data programmatically.
         */
        setInvoiceData(data) {
            const state = FIAX.state.ensureState();
            if (!state) return false;
            state.upsertLocal?.('invoices', data);
            return true;
        },

        /**
         * Triggers a rule-based validation on a document.
         */
        validateDocument(docType, data) {
            console.log(`[Fiax API] Validating ${docType}...`);
            if (docType === 'cfdi' || docType === 'invoice') {
                const validation = FIAX.logic?.cfdi?.validate?.(FIAX.cfdiModel?.normalizeInvoice?.(data) || data);
                return { valid: Boolean(validation?.isValid), messages: validation?.errors || {} };
            }
            return { valid: true, messages: [] };
        }
    };
})();
