/**
 * FIAX Unified Data Access Layer (DAL)
 * Three modes:
 *   1. Demo   — localStorage, no backend
 *   2. Odoo   — fiax1 Odoo addon JSON API (/fiax/api/*)
 *   3. Live   — PocketBase (legacy, kept for standalone use)
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

    // --- Detail prefetch cache ---
    const _detailCache = new Map(); // id → { data, ts }
    const _CACHE_TTL = 60_000;
    const _inflight = new Map();    // id → Promise (dedup concurrent fetches)

    // --- Odoo mode helpers ---

    function isOdooMode(state) {
        return !state.demoMode && (window.__FIAX_ODOO_MODE__ || FIAX.config?.odoo_mode);
    }

    async function _fetchWithToken(path, options, token) {
        return fetch(path, {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                ...(options.headers || {}),
            },
            ...options,
        });
    }

    async function odooFetch(path, options = {}) {
        const token = localStorage.getItem('fiax_token');
        try {
            let res = await _fetchWithToken(path, options, token);
            // On 401 (expired token), attempt silent refresh and retry once
            if (res.status === 401) {
                const refreshed = await FIAX.auth?.silentRefresh?.();
                if (refreshed) {
                    const newToken = localStorage.getItem('fiax_token');
                    res = await _fetchWithToken(path, options, newToken);
                }
            }
            const data = await res.json().catch(() => ({}));
            if (!res.ok || data.ok === false) {
                // After refresh attempt still 401 → redirect to login
                if (res.status === 401) {
                    localStorage.removeItem('fiax_token');
                    window.location.hash = '/login';
                    return { ok: false, message: 'Sesión expirada. Redirigiendo al login...' };
                }
                return { ok: false, message: data.message || res.statusText };
            }
            return { ok: true, ...data };
        } catch (err) {
            return { ok: false, message: err?.message || 'Error de conexión con Odoo.' };
        }
    }

    async function odooGet(path) {
        return odooFetch(path, { method: 'GET' });
    }

    async function odooPost(path, body) {
        return odooFetch(path, { method: 'POST', body: JSON.stringify(body) });
    }

    // --- Fiscal backend (stamp / send / cancel) ---

    async function callConfiguredBackend(action, payload) {
        const state = FIAX.state.ensureState();
        if (isOdooMode(state)) {
            return odooPost(`/fiax/api/${action}`, payload);
        }
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

    // --- Collection → Odoo endpoint map ---

    const ODOO_ENDPOINTS = {
        invoices:  '/fiax/api/facturas',
        issuers:   '/fiax/api/emisores',
        clients:   '/fiax/api/clientes',
        products:  '/fiax/api/productos',
    };

    FIAX.api = {

        async getList(collection, filter = '', sort = '-created') {
            const state = FIAX.state.ensureState();
            const col = normalizeCollection(collection);

            if (state.demoMode) {
                console.log(`[Fiax API] Demo: ${col}`);
                return demoList(state, col);
            }

            if (isOdooMode(state)) {
                const endpoint = ODOO_ENDPOINTS[col];
                if (!endpoint) return [];
                const result = await odooGet(endpoint);
                if (!result.ok) throw new Error(result.message || 'Error al conectar con el servidor backend.');
                return result.records || [];
            }

            // PocketBase
            if (!FIAX.pb) return [];
            try {
                return await FIAX.pb.collection(col).getFullList({ filter, sort });
            } catch (err) {
                console.error(`[Fiax API] DB Error (${col}):`, err);
                return [];
            }
        },

        async getInvoices() {
            const records = await this.getList('invoices');
            // prefetch top 5 most recent in background after a short delay
            if (records.length) {
                setTimeout(() => {
                    records.slice(0, 5).forEach(r => this.prefetchInvoiceDetail(r.id));
                }, 800);
            }
            return records;
        },
        async getIssuers()  { return this.getList('issuers'); },
        async getClients()  { return this.getList('clients'); },
        async getProducts() { return this.getList('products'); },

        async getInvoiceDetail(id) {
            const state = FIAX.state.ensureState();
            if (state.demoMode) {
                return (state.data.invoices || []).find(i => String(i.id) === String(id)) || null;
            }
            if (isOdooMode(state)) {
                const key = String(id);
                const hit = _detailCache.get(key);
                if (hit && Date.now() - hit.ts < _CACHE_TTL) return hit.data;
                // dedup: reuse in-flight promise if already fetching
                if (_inflight.has(key)) return _inflight.get(key);
                const promise = odooGet(`/fiax/api/facturas/${id}`)
                    .then(res => {
                        if (res.ok) _detailCache.set(key, { data: res.record, ts: Date.now() });
                        _inflight.delete(key);
                        return res.ok ? res.record : null;
                    })
                    .catch(() => { _inflight.delete(key); return null; });
                _inflight.set(key, promise);
                return promise;
            }
            return null;
        },

        prefetchInvoiceDetail(id) {
            const key = String(id);
            if (_detailCache.has(key) || _inflight.has(key)) return;
            const state = FIAX.state.ensureState();
            if (!isOdooMode(state)) return;
            this.getInvoiceDetail(id); // fire-and-forget
        },

        async printJrxmlPdf(id) {
            // Try JRXML template first; returns 404 if none is configured.
            const token = localStorage.getItem('fiax_token');
            const res = await fetch(`/fiax/api/facturas/${id}/jrxml-html`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (res.status === 404) return false;  // no template configured
            if (!res.ok) throw new Error('Error al renderizar plantilla JRXML.');
            const html = await res.text();
            const win = window.open('', '_blank');
            if (!win) throw new Error('El navegador bloqueó la ventana emergente.');
            win.document.open();
            win.document.write(html);
            win.document.close();
            return true;
        },

        async downloadPdf(id, filename) {
            const token = localStorage.getItem('fiax_token');
            const res = await fetch(`/fiax/api/facturas/${id}/pdf`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('PDF no disponible desde Odoo.');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `CFDI_${id}.pdf`;
            a.click();
            URL.revokeObjectURL(url);
        },

        async downloadXml(id, filename) {
            const token = localStorage.getItem('fiax_token');
            const res = await fetch(`/fiax/api/facturas/${id}/xml`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {},
            });
            if (!res.ok) {
                const msg = await res.json().catch(() => ({}));
                throw new Error(msg.message || 'XML no disponible.');
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename || `CFDI_${id}.xml`;
            a.click();
            URL.revokeObjectURL(url);
        },

        async saveRecord(collection, data) {
            const state = FIAX.state.ensureState();
            const col = normalizeCollection(collection);
            const record = ensureId(data, col.slice(0, 3));

            if (state.demoMode) {
                const finalRecord = col === 'clients' ? { ...record, type: 'Client' } : record;
                state.upsertLocal?.(col, finalRecord);
                return { ok: true, record: finalRecord, localOnly: true };
            }

            if (isOdooMode(state)) {
                const endpoint = ODOO_ENDPOINTS[col];
                if (!endpoint) return { ok: false, message: `No endpoint for ${col}.` };
                const result = await odooPost(endpoint, record);
                if (result.ok && result.record) state.upsertLocal?.(col, result.record);
                return result;
            }

            // PocketBase
            if (!FIAX.pb) return { ok: false, message: 'PocketBase no esta disponible.' };
            try {
                const collectionRef = FIAX.pb.collection(col);
                const exists = record.id && await collectionRef.getOne(record.id).then(() => true).catch(() => false);
                const saved = exists ? await collectionRef.update(record.id, record) : await collectionRef.create(record);
                return { ok: true, record: saved };
            } catch (err) {
                return { ok: false, message: err?.message || `No se pudo guardar ${col}.` };
            }
        },

        async saveInline(surfaceKey, rowId, patch) {
            return this.saveRecord(surfaceKey, { id: rowId, ...patch });
        },

        async saveInvoice(invoice) {
            const state = FIAX.state.ensureState();
            const normalized = FIAX.cfdiModel?.normalizeInvoice(invoice, state) || invoice;
            const record = { ...normalized, status: normalized.status || 'Borrador' };
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

        async getTimbres() {
            const state = FIAX.state.ensureState();
            if (isOdooMode(state)) {
                return odooGet('/fiax/api/timbres');
            }
            return { ok: false, message: 'Solo disponible en modo Odoo.' };
        },

        async getSession() {
            return odooGet('/fiax/api/session');
        },

        setInvoiceData(data) {
            const state = FIAX.state.ensureState();
            if (!state) return false;
            state.upsertLocal?.('invoices', data);
            return true;
        },

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
