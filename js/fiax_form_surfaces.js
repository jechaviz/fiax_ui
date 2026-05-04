/**
 * Explicit FIAx adapters for common form surface contracts.
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});

    const normalizeAmount = (value) => {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : 0;
    };

    const buildTaxRows = (totals = {}) => {
        const rows = [];
        const append = (label, amount) => {
            const normalizedAmount = normalizeAmount(amount);
            if (Math.abs(normalizedAmount) > 0) {
                rows.push({ group_label: label, tax_amount_currency: normalizedAmount });
            }
        };

        append('Total Impuestos Trasladados', totals.taxTotal);
        append('Total Impuestos Retenidos', -normalizeAmount(totals.retainedTotal));
        append('Total Impuestos Locales', totals.localTaxTotal);
        return rows;
    };

    const toFormTotalsPayload = (totals = {}) => {
        const subtotal = normalizeAmount(totals.subtotal);
        const discount = normalizeAmount(totals.discount);
        const total = normalizeAmount(totals.total);

        return {
            fallback_amount: total,
            tax_totals: {
                amount_untaxed: subtotal,
                amount_total: total,
                subtotals: [
                    {
                        name: 'Subtotal',
                        amount: subtotal - discount,
                        tax_groups: buildTaxRows(totals),
                    },
                ],
            },
        };
    };

    FIAX.formSurfaces = {
        ...(FIAX.formSurfaces || {}),
        invoiceTotals: {
            buildTaxRows,
            toFormTotalsPayload,
        },
    };
})();
