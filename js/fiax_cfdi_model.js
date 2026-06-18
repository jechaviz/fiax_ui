/**
 * CFDI model normalizer.
 * Keeps form, demo data, table rows, and PDF bands on a shared data contract.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    function clone(value) {
        return JSON.parse(JSON.stringify(value || {}));
    }

    function asNumber(value, fallback = 0) {
        const next = Number(value);
        return Number.isFinite(next) ? next : fallback;
    }

    function asIso(value) {
        if (!value) return new Date().toISOString();
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
    }

    function listClients(data = {}) {
        return [
            ...(Array.isArray(data.users) ? data.users.filter((item) => item.type === 'Client') : []),
            ...(Array.isArray(data.clients) ? data.clients : []),
            ...(Array.isArray(data.customers) ? data.customers : []),
        ];
    }

    function findIssuer(state, invoice) {
        const issuers = state?.data?.issuers || [];
        return issuers.find((item) => item.id === invoice.issuerId)
            || state?.currentIssuer
            || invoice.issuer
            || issuers[0]
            || {};
    }

    function findBranch(issuer, invoice) {
        const branches = issuer?.branches || [];
        return branches.find((item) => item.id === invoice.branchId)
            || branches[0]
            || {};
    }

    function findReceiver(state, invoice) {
        const embedded = invoice.receiver || {};
        const id = invoice.receiverId || invoice.receptorId || embedded.userId || embedded.id;
        const fromState = listClients(state?.data || {}).find((item) => String(item.id) === String(id));
        // Merge: state provides base fields; embedded (from detail endpoint) wins for CFDI-specific fields
        return fromState ? { ...fromState, ...embedded } : embedded;
    }

    function normalizeParty(raw = {}, branch = {}) {
        const name = raw.name || raw.companyName || raw.nombre || '';
        const postalCode = raw.postalCode || raw.codigoPostal || raw.cp || branch.postalCode || branch.codigoPostal || '';
        const taxRegime = raw.taxRegime || raw.regimenFiscal || raw.regimenFiscalReceptor || '';

        return {
            ...raw,
            name,
            nombre: raw.nombre || name,
            rfc: raw.rfc || raw.RFC || '',
            taxRegime,
            regimenFiscal: raw.regimenFiscal || taxRegime,
            regimenFiscalReceptor: raw.regimenFiscalReceptor || taxRegime,
            postalCode,
            codigoPostal: raw.codigoPostal || postalCode,
            cfdiUse: raw.cfdiUse || raw.usoCFDI || 'G03',
            usoCFDI: raw.usoCFDI || raw.cfdiUse || 'G03',
        };
    }

    function normalizeTaxes(item, base) {
        return (item.taxes || []).map((tax) => {
            const rate = asNumber(tax.rate ?? tax.tasa ?? tax.TasaOCuota, 0);
            const rawAmount = tax.amount ?? tax.importe;
            const parsedAmount = asNumber(rawAmount, 0);
            const amount = rawAmount == null || (parsedAmount === 0 && base !== 0 && rate !== 0)
                ? base * rate
                : parsedAmount;
            return {
                ...tax,
                rate,
                tasa: rate,
                base: asNumber(tax.base, base),
                amount,
                importe: amount,
                taxType: tax.taxType || tax.impuesto || 'IVA',
                isRetention: Boolean(tax.isRetention),
                isLocal: Boolean(tax.isLocal),
            };
        });
    }

    function normalizeItems(invoice) {
        return (invoice.lineItems || invoice.items || []).map((raw) => {
            const item = clone(raw);
            const quantity = asNumber(item.quantity ?? item.cantidad, 0);
            const unitPrice = asNumber(item.unitPrice ?? item.rate ?? item.valorUnitario, 0);
            const discount = asNumber(item.discount ?? item.descuento, 0);
            const amount = asNumber(item.amount ?? item.importe, quantity * unitPrice - discount);

            return {
                ...item,
                quantity,
                cantidad: quantity,
                unitPrice,
                valorUnitario: unitPrice,
                discount,
                descuento: discount,
                amount,
                importe: amount,
                productCode: item.productCode || item.claveProdServ || '01010101',
                claveProdServ: item.claveProdServ || item.productCode || '01010101',
                unitCode: item.unitCode || item.claveUnidad || 'E48',
                claveUnidad: item.claveUnidad || item.unitCode || 'E48',
                unit: item.unit || item.unidad || 'Servicio',
                unidad: item.unidad || item.unit || 'Servicio',
                description: item.description || item.descripcion || '',
                descripcion: item.descripcion || item.description || '',
                objetoImp: item.objetoImp || '02',
                taxes: normalizeTaxes(item, amount),
            };
        });
    }

    function buildTaxGroups(items) {
        const groups = new Map();
        for (const item of items) {
            for (const tax of item.taxes || []) {
                const key = [tax.taxType, tax.rate, tax.isRetention, tax.isLocal].join(':');
                const current = groups.get(key) || {
                    name: tax.taxType || 'IVA',
                    rate: tax.rate || 0,
                    isRetention: Boolean(tax.isRetention),
                    isLocal: Boolean(tax.isLocal),
                    amount: 0,
                    base: 0,
                };
                current.amount += asNumber(tax.amount, 0);
                current.base += asNumber(tax.base, item.amount || 0);
                groups.set(key, current);
            }
        }
        return Array.from(groups.values());
    }

    function calculateTotals(items, invoice) {
        const totals = FIAX.logic?.cfdi?.calculateTotals?.(items, invoice.currency || invoice.moneda || 'MXN', invoice.exchangeRate || invoice.tipoCambio || 1)
            || { subtotal: 0, discount: 0, taxTotal: 0, retainedTotal: 0, localTaxTotal: 0, total: 0 };
        const groups = buildTaxGroups(items);
        return {
            ...totals,
            groups,
            subTotal: totals.subtotal,
            totalImpuestosTrasladados: totals.taxTotal + totals.localTaxTotal,
            totalImpuestosRetenidos: totals.retainedTotal,
        };
    }

    function normalizeInvoice(source, state = FIAX.state?.ensureState?.()) {
        const invoice = clone(source);
        const issuerSource = findIssuer(state, invoice);
        const branch = findBranch(issuerSource, invoice);
        const receiverSource = findReceiver(state, invoice);
        const issuer = normalizeParty(issuerSource, branch);
        const receiver = normalizeParty(receiverSource);
        const items = normalizeItems(invoice);
        const totals = calculateTotals(items, invoice);
        const currency = invoice.currency || invoice.moneda || 'MXN';
        const date = asIso(invoice.date || invoice.fecha);

        return {
            ...invoice,
            issuer,
            receiver,
            items,
            lineItems: items,
            date,
            fecha: invoice.fecha || date,
            currency,
            moneda: invoice.moneda || currency,
            exchangeRate: asNumber(invoice.exchangeRate || invoice.tipoCambio, 1),
            tipoCambio: asNumber(invoice.tipoCambio || invoice.exchangeRate, 1),
            subtotal: totals.subtotal,
            subTotal: totals.subTotal,
            discount: totals.discount,
            taxTotal: totals.taxTotal,
            retainedTotal: totals.retainedTotal,
            localTaxTotal: totals.localTaxTotal,
            total: totals.total,
            taxes: { groups: totals.groups },
        };
    }

    FIAX.cfdiModel = Object.freeze({
        normalizeInvoice,
        normalizeItems,
        normalizeParty,
    });
})();
