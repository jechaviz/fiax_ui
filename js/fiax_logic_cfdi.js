/**
 * FIAX CFDI 4.0 LOGIC ENGINE - V2 (Parity with facturamx-saas)
 */
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    FIAX.logic = {
        cfdi: {
            /**
             * Aggregates totals including discounts and local taxes.
             */
            calculateTotals(lineItems = [], currency = 'MXN', exchangeRate = 1) {
                let subtotal = 0;
                let discountTotal = 0;
                let taxTotal = 0;
                let retainedTotal = 0;
                let localTaxTotal = 0;

                const taxesByRate = {}; // Aggregation for summary
                const localTaxesByRate = {};

                lineItems.forEach(item => {
                    const quantity = Number(item.quantity) || 0;
                    const price = Number(item.unitPrice || item.rate) || 0;
                    const discount = Number(item.discount) || 0;
                    
                    const itemSubtotal = quantity * price;
                    const itemBase = itemSubtotal - discount;
                    
                    subtotal += itemSubtotal;
                    discountTotal += discount;

                    (item.taxes || []).forEach(tax => {
                        const amount = Number(tax.amount) || 0;
                        if (tax.isLocal) {
                            localTaxTotal += amount;
                        } else if (tax.isRetention) {
                            retainedTotal += amount;
                        } else {
                            taxTotal += amount;
                        }
                    });
                });

                const total = subtotal - discountTotal + taxTotal - retainedTotal + localTaxTotal;

                return {
                    subtotal,
                    discount: discountTotal,
                    taxTotal,
                    retainedTotal,
                    localTaxTotal,
                    total,
                    currency,
                    exchangeRate
                };
            },

            /**
             * Strict CFDI 4.0 Validation based on SAT rules.
             */
            validate(invoice) {
                const errors = {};
                const addError = (field, msg) => {
                    if (!errors[field]) errors[field] = [];
                    errors[field].push(msg);
                };

                const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/;
                const cpRegex = /^\d{5}$/;

                // Issuer
                if (!invoice.issuer?.rfc) addError('issuer.rfc', 'El RFC del emisor es obligatorio.');
                else if (!rfcRegex.test(invoice.issuer.rfc)) addError('issuer.rfc', 'Formato de RFC de emisor inválido.');
                
                if (!invoice.issuer?.taxRegime) addError('issuer.taxRegime', 'El régimen fiscal del emisor es obligatorio.');
                if (!invoice.issuer?.postalCode) addError('issuer.postalCode', 'El código postal de expedición es obligatorio.');

                // Receiver
                if (!invoice.receiver?.rfc) addError('receiver.rfc', 'El RFC del receptor es obligatorio.');
                else if (invoice.receiver.rfc !== 'XAXX010101000' && !rfcRegex.test(invoice.receiver.rfc)) {
                    addError('receiver.rfc', 'Formato de RFC de receptor inválido.');
                }

                if (!invoice.receiver?.taxRegime) addError('receiver.taxRegime', 'El régimen fiscal del receptor es obligatorio.');
                if (!invoice.receiver?.postalCode) {
                    addError('receiver.postalCode', 'El código postal del domicilio fiscal del receptor es obligatorio.');
                } else if (!cpRegex.test(invoice.receiver.postalCode)) {
                    addError('receiver.postalCode', 'El código postal debe tener 5 dígitos.');
                }

                // Global Info
                if (invoice.receiver?.rfc === 'XAXX010101000') {
                    if (!invoice.informacionGlobal?.periodicidad) addError('informacionGlobal.periodicidad', 'Periodicidad obligatoria para factura global.');
                    if (!invoice.informacionGlobal?.meses) addError('informacionGlobal.meses', 'Meses obligatorios para factura global.');
                    if (!invoice.informacionGlobal?.año) addError('informacionGlobal.año', 'Año obligatorio para factura global.');
                }

                // Related CFDIs
                if (invoice.cfdiRelacionados?.tipoRelacion && (!invoice.cfdiRelacionados.uuids || invoice.cfdiRelacionados.uuids.length === 0)) {
                    addError('cfdiRelacionados', 'Debe especificar al menos un UUID relacionado si indica Tipo de Relación.');
                }

                // Line Items
                if (!invoice.lineItems?.length) {
                    addError('lineItems', 'Debe haber al menos un concepto.');
                } else {
                    invoice.lineItems.forEach((item, idx) => {
                        if (!item.productCode) addError(`lineItems[${idx}].productCode`, 'Falta clave SAT.');
                        if (!item.unitCode) addError(`lineItems[${idx}].unitCode`, 'Falta clave unidad SAT.');
                        if (!item.objetoImp) addError(`lineItems[${idx}].objetoImp`, 'El campo Objeto Impuesto es obligatorio en 4.0.');
                    });
                }

                return {
                    isValid: Object.keys(errors).length === 0,
                    errors
                };
            }
        }
    };
})();
