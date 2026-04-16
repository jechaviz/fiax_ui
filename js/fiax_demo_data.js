
// Fiax Demo Data - Rich Implementation for CFDI 4.0 Previews
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    FIAX.demo_data = {
        users: [
            { id: 'user-client-brenda', name: 'Brenda Smith', email: 'brenda@innovate.com', type: 'Client',
              companyName: 'Innovate Inc.', location: 'Ciudad de México, MX', rfc: 'SABR890101ABC',
              taxRegime: '601', postalCode: '06500',
              branches: [{ id: 'brenda-branch-1', name: 'Oficina Principal', postalCode: '06500' }] },
            { id: 'user-client-carlos', name: 'Carlos Mendoza', email: 'carlos@geomex.mx', type: 'Client',
              companyName: 'Geomex Solutions SA de CV', location: 'Guadalajara, MX', rfc: 'GEM900515XYZ',
              taxRegime: '601', postalCode: '44100',
              branches: [{ id: 'carlos-branch-1', name: 'Sucursal GDL', postalCode: '44100' }] },
            { id: 'user-client-sofia', name: 'Sofía Ramírez', email: 'sofia@rltrade.com', type: 'Client',
              companyName: 'RL Trade & Consulting', location: 'Monterrey, MX', rfc: 'RASF880220MNO',
              taxRegime: '605', postalCode: '64000' },
            { id: 'user-client-grupo', name: 'Grupo Alfa SA de CV', email: 'contacto@grupoalfa.mx', type: 'Client',
              companyName: 'Grupo Alfa SA de CV', location: 'Monterrey, MX', rfc: 'GAL700101NL1',
              taxRegime: '601', postalCode: '66220' },
            { id: 'user-freelancer-john', name: 'John Doe', email: 'john@example.com', type: 'Freelancer',
              rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' }
        ],

        issuers: [
            {
                id: 'issuer-1',
                name: 'Servicios Profesionales John Doe',
                rfc: 'DOE880101CDE',
                taxRegime: '612',
                branches: [
                    { id: 'branch-1-1', name: 'Matriz', postalCode: '50226' },
                    { id: 'branch-1-2', name: 'Coworking CDMX', postalCode: '06600' }
                ],
            },
            {
                id: 'issuer-2',
                name: 'TECNOVISION SA de CV',
                rfc: 'TVI990301ABC',
                taxRegime: '601',
                branches: [{ id: 'branch-2-1', name: 'Oficina Central', postalCode: '11560' }],
            }
        ],

        products: [
            { id: 'prod-1', description: 'Consultoría React', rate: 75, unit: 'Hora', productCode: '84111500', unitCode: 'E48', objetoImp: '02', category: 'Servicios' },
            { id: 'prod-2', description: 'Desarrollo de API REST', rate: 85, unit: 'Hora', productCode: '81112101', unitCode: 'E48', objetoImp: '02', category: 'Servicios' },
            { id: 'prod-3', description: 'Licencia Software Fiax PRO', rate: 1200, unit: 'Pieza', productCode: '43231500', unitCode: 'H87', objetoImp: '02', category: 'Software' },
            { id: 'prod-4', description: 'Mantenimiento Mensual', rate: 500, unit: 'Mes', productCode: '73111600', unitCode: 'MO', objetoImp: '02', category: 'Servicios' },
            { id: 'prod-5', description: 'Capacitación Técnica (por sesión)', rate: 3500, unit: 'Servicio', productCode: '86101701', unitCode: 'E48', objetoImp: '02', category: 'Capacitación' },
        ],

        invoices: [
            {
                id: 'inv-101',
                uuid: 'E2B5A41C-5373-4109-8663-B624EDC9B071',
                serie: 'A', folio: '101',
                date: '2024-07-15',
                status: 'Vigente',
                tipoDeComprobante: 'I',
                issuerId: 'issuer-1', branchId: 'branch-1-1',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { userId: 'user-client-brenda', name: 'Innovate Inc.', rfc: 'SABR890101ABC', taxRegime: '601', postalCode: '06500', cfdiUse: 'G03' },
                clientName: 'Innovate Inc.', clientRfc: 'SABR890101ABC',
                expeditionPlace: '50226', paymentMethod: 'PUE', paymentType: '03',
                condicionesDePago: 'Contado', currency: 'USD', exchangeRate: 1,
                lineItems: [
                    { id: 'item-1-1', noIdentificacion: 'WEB-DEV-01', productCode: '84111500', unitCode: 'E48', quantity: 20, description: 'Desarrollo de componente Calendario en React', unitPrice: 75, discount: 0, amount: 1500, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 240, base: 1500 }] },
                    { id: 'item-1-2', noIdentificacion: 'LIB-CAL-001', productCode: '43231500', unitCode: 'H87', quantity: 1, description: 'Librería de Calendario Core', unitPrice: 500, discount: 0, amount: 500, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 80, base: 500 }] },
                    { id: 'item-1-3', noIdentificacion: 'LIB-AUTH-003', productCode: '43231502', unitCode: 'H87', quantity: 1, description: 'Módulo de Autenticación Avanzada', unitPrice: 200, discount: 20, amount: 180, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 28.8, base: 180 }] }
                ],
                subtotal: 2180, discount: 20, taxTotal: 348.8, retainedTotal: 0, total: 2508.8,
                satSeal: 'mock_sat_seal==', issuerSeal: 'mock_issuer_seal=='
            },
            {
                id: 'inv-102',
                uuid: 'F3C6B52D-6484-5210-9774-C735FED0C182',
                serie: 'A', folio: '102',
                date: '2024-07-22',
                status: 'Vigente',
                tipoDeComprobante: 'I',
                issuerId: 'issuer-1', branchId: 'branch-1-1',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { userId: 'user-client-carlos', name: 'Geomex Solutions SA de CV', rfc: 'GEM900515XYZ', taxRegime: '601', postalCode: '44100', cfdiUse: 'G03' },
                clientName: 'Geomex Solutions SA de CV', clientRfc: 'GEM900515XYZ',
                expeditionPlace: '50226', paymentMethod: 'PPD', paymentType: '99',
                currency: 'MXN', exchangeRate: 1,
                lineItems: [
                    { id: 'item-2-1', noIdentificacion: 'API-DEV-01', productCode: '81112101', unitCode: 'E48', quantity: 40, description: 'Desarrollo de API REST - Sistema de Inventarios', unitPrice: 85, discount: 0, amount: 3400, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 544, base: 3400 }] },
                    { id: 'item-2-2', noIdentificacion: 'MNTO-001', productCode: '73111600', unitCode: 'MO', quantity: 3, description: 'Mantenimiento Mensual Servidor', unitPrice: 500, discount: 0, amount: 1500, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 240, base: 1500 }] }
                ],
                subtotal: 4900, discount: 0, taxTotal: 784, retainedTotal: 0, total: 5684,
                satSeal: 'mock_sat_seal==', issuerSeal: 'mock_issuer_seal=='
            },
            {
                id: 'inv-103',
                uuid: 'A1D7E63E-7595-6321-0885-D846GFE1D293',
                serie: 'A', folio: '103',
                date: '2024-08-01',
                status: 'Cancelado',
                tipoDeComprobante: 'I',
                issuerId: 'issuer-1', branchId: 'branch-1-2',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '06600' },
                receiver: { userId: 'user-client-sofia', name: 'RL Trade & Consulting', rfc: 'RASF880220MNO', taxRegime: '605', postalCode: '64000', cfdiUse: 'G01' },
                clientName: 'RL Trade & Consulting', clientRfc: 'RASF880220MNO',
                expeditionPlace: '06600', paymentMethod: 'PUE', paymentType: '01',
                currency: 'MXN', exchangeRate: 1,
                lineItems: [
                    { id: 'item-3-1', noIdentificacion: 'LIC-PRO-001', productCode: '43231500', unitCode: 'H87', quantity: 1, description: 'Licencia Software Fiax PRO (Anual)', unitPrice: 1200, discount: 0, amount: 1200, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 192, base: 1200 }] }
                ],
                subtotal: 1200, discount: 0, taxTotal: 192, retainedTotal: 0, total: 1392,
                satSeal: 'mock_sat_seal==', issuerSeal: 'mock_issuer_seal=='
            },
            {
                id: 'inv-104',
                uuid: 'B2E8F74F-8606-7432-1996-E957HGF2E304',
                serie: 'A', folio: '104',
                date: '2024-08-10',
                status: 'Vigente',
                tipoDeComprobante: 'I',
                issuerId: 'issuer-2', branchId: 'branch-2-1',
                issuer: { name: 'TECNOVISION SA de CV', rfc: 'TVI990301ABC', taxRegime: '601', postalCode: '11560' },
                receiver: { userId: 'user-client-grupo', name: 'Grupo Alfa SA de CV', rfc: 'GAL700101NL1', taxRegime: '601', postalCode: '66220', cfdiUse: 'G03' },
                clientName: 'Grupo Alfa SA de CV', clientRfc: 'GAL700101NL1',
                expeditionPlace: '11560', paymentMethod: 'PPD', paymentType: '99',
                currency: 'MXN', exchangeRate: 1,
                lineItems: [
                    { id: 'item-4-1', noIdentificacion: 'CAP-001', productCode: '86101701', unitCode: 'E48', quantity: 5, description: 'Capacitación Técnica Vue 3 + TypeScript', unitPrice: 3500, discount: 0, amount: 17500, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 2800, base: 17500 }] }
                ],
                subtotal: 17500, discount: 0, taxTotal: 2800, retainedTotal: 560, total: 19740,
                satSeal: 'mock_sat_seal==', issuerSeal: 'mock_issuer_seal=='
            },
            {
                id: 'inv-105',
                uuid: 'C3F9G85G-9717-8543-2007-F068IHG3F415',
                serie: 'B', folio: '001',
                date: '2024-08-18',
                status: 'Pendiente',
                tipoDeComprobante: 'E',
                issuerId: 'issuer-1', branchId: 'branch-1-1',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { userId: 'user-client-brenda', name: 'Innovate Inc.', rfc: 'SABR890101ABC', taxRegime: '601', postalCode: '06500', cfdiUse: 'D01' },
                clientName: 'Innovate Inc.', clientRfc: 'SABR890101ABC',
                expeditionPlace: '50226', paymentMethod: 'PUE', paymentType: '03',
                currency: 'USD', exchangeRate: 1,
                lineItems: [
                    { id: 'item-5-1', noIdentificacion: 'NC-001', productCode: '84111500', unitCode: 'E48', quantity: 5, description: 'Nota de Crédito - Ajuste por error en facturación', unitPrice: 75, discount: 0, amount: 375, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 60, base: 375 }] }
                ],
                subtotal: 375, discount: 0, taxTotal: 60, retainedTotal: 0, total: 435,
                satSeal: 'mock_sat_seal==', issuerSeal: 'mock_issuer_seal=='
            },
            {
                id: 'inv-106',
                uuid: 'D4G0H96H-0828-9654-3118-G179JIH4G526',
                serie: 'A', folio: '105',
                date: '2024-08-25',
                status: 'Borrador',
                tipoDeComprobante: 'I',
                issuerId: 'issuer-2', branchId: 'branch-2-1',
                issuer: { name: 'TECNOVISION SA de CV', rfc: 'TVI990301ABC', taxRegime: '601', postalCode: '11560' },
                receiver: { userId: 'user-client-carlos', name: 'Geomex Solutions SA de CV', rfc: 'GEM900515XYZ', taxRegime: '601', postalCode: '44100', cfdiUse: 'G03' },
                clientName: 'Geomex Solutions SA de CV', clientRfc: 'GEM900515XYZ',
                expeditionPlace: '11560', paymentMethod: 'PUE', paymentType: '03',
                currency: 'MXN', exchangeRate: 1,
                lineItems: [
                    { id: 'item-6-1', noIdentificacion: 'API-DEV-02', productCode: '81112101', unitCode: 'E48', quantity: 60, description: 'Desarrollo de Módulo de Reportes', unitPrice: 85, discount: 850, amount: 4250, objetoImp: '02', taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 680, base: 4250 }] }
                ],
                subtotal: 5100, discount: 850, taxTotal: 680, retainedTotal: 0, total: 4930,
                satSeal: '', issuerSeal: ''
            }
        ],

        // Complementos de Recepción de Pagos — key debe ser "payments"
        payments: [
            {
                id: 'pay-1',
                uuid: 'P4Y-M3NT-UUID-0001',
                serie: 'P', folio: '1',
                date: '2024-07-20',
                paymentDate: '2024-07-20',
                status: 'Vigente',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { name: 'Innovate Inc.', rfc: 'SABR890101ABC', postalCode: '06500' },
                clientName: 'Innovate Inc.', clientRfc: 'SABR890101ABC',
                invoiceFolio: 'A-101', method: 'Transferencia electrónica',
                paymentType: '03', currency: 'USD', amount: 2508.8, total: 2508.8,
                relatedDocuments: [
                    { uuid: 'E2B5A41C-5373-4109-8663-B624EDC9B071', serie: 'A', folio: '101', amountPaid: 2508.8, previousBalance: 2508.8, remainingBalance: 0, currency: 'USD', installmentNumber: 1 }
                ]
            },
            {
                id: 'pay-2',
                uuid: 'P4Y-M3NT-UUID-0002',
                serie: 'P', folio: '2',
                date: '2024-08-05',
                paymentDate: '2024-08-05',
                status: 'Vigente',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { name: 'Geomex Solutions SA de CV', rfc: 'GEM900515XYZ', postalCode: '44100' },
                clientName: 'Geomex Solutions SA de CV', clientRfc: 'GEM900515XYZ',
                invoiceFolio: 'A-102', method: 'Transferencia electrónica',
                paymentType: '03', currency: 'MXN', amount: 2842, total: 2842,
                relatedDocuments: [
                    { uuid: 'F3C6B52D-6484-5210-9774-C735FED0C182', serie: 'A', folio: '102', amountPaid: 2842, previousBalance: 5684, remainingBalance: 2842, currency: 'MXN', installmentNumber: 1 }
                ]
            },
            {
                id: 'pay-3',
                uuid: 'P4Y-M3NT-UUID-0003',
                serie: 'P', folio: '3',
                date: '2024-08-20',
                paymentDate: '2024-08-20',
                status: 'Vigente',
                issuer: { name: 'TECNOVISION SA de CV', rfc: 'TVI990301ABC', taxRegime: '601', postalCode: '11560' },
                receiver: { name: 'Grupo Alfa SA de CV', rfc: 'GAL700101NL1', postalCode: '66220' },
                clientName: 'Grupo Alfa SA de CV', clientRfc: 'GAL700101NL1',
                invoiceFolio: 'A-104', method: 'Cheque nominativo',
                paymentType: '02', currency: 'MXN', amount: 19740, total: 19740,
                relatedDocuments: [
                    { uuid: 'B2E8F74F-8606-7432-1996-E957HGF2E304', serie: 'A', folio: '104', amountPaid: 19740, previousBalance: 19740, remainingBalance: 0, currency: 'MXN', installmentNumber: 1 }
                ]
            }
        ],

        // Recibos de Nómina — key debe ser "payroll"
        payroll: [
            {
                id: 'payr-1',
                uuid: 'N0M-1N4-UUID-0001',
                serie: 'N', folio: '1',
                date: '2024-07-15',
                status: 'Vigente',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE' },
                employee: { name: 'Carlos Mendoza', rfc: 'MENC900101ABC', curp: 'MENC900101HDFLRS01', nss: '12345678901' },
                employeeName: 'Carlos Mendoza',
                paymentDate: '2024-07-15', startDate: '2024-07-01', endDate: '2024-07-15',
                type: 'O', // Ordinaria
                currency: 'MXN',
                perceptions: [
                    { type: '001', clave: 'SUEL', concept: 'Sueldo Base', amountTaxable: 15000, amountExempt: 0 },
                    { type: '038', clave: 'BONO', concept: 'Bono Puntualidad', amountTaxable: 1000, amountExempt: 0 }
                ],
                deductions: [
                    { type: '001', clave: 'IMSS', concept: 'Cuota IMSS', amount: 450.50 },
                    { type: '002', clave: 'ISR', concept: 'Retención ISR', amount: 1540.20 }
                ],
                subtotal: 16000, discount: 1990.70, total: 14009.30
            },
            {
                id: 'payr-2',
                uuid: 'N0M-1N4-UUID-0002',
                serie: 'N', folio: '2',
                date: '2024-07-15',
                status: 'Vigente',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE' },
                employee: { name: 'Ana López García', rfc: 'LOGA950215FGH', curp: 'LOGA950215MDFPNM02', nss: '98765432100' },
                employeeName: 'Ana López García',
                paymentDate: '2024-07-15', startDate: '2024-07-01', endDate: '2024-07-15',
                type: 'O',
                currency: 'MXN',
                perceptions: [
                    { type: '001', clave: 'SUEL', concept: 'Sueldo Base', amountTaxable: 12000, amountExempt: 0 },
                    { type: '019', clave: 'HORA', concept: 'Horas Extra', amountTaxable: 800, amountExempt: 800 }
                ],
                deductions: [
                    { type: '001', clave: 'IMSS', concept: 'Cuota IMSS', amount: 360.00 },
                    { type: '002', clave: 'ISR', concept: 'Retención ISR', amount: 920.50 }
                ],
                subtotal: 12800, discount: 1280.50, total: 11519.50
            },
            {
                id: 'payr-3',
                uuid: 'N0M-1N4-UUID-0003',
                serie: 'N', folio: '3',
                date: '2024-07-31',
                status: 'Vigente',
                issuer: { name: 'TECNOVISION SA de CV', rfc: 'TVI990301ABC' },
                employee: { name: 'Roberto Juárez Hdez', rfc: 'JUHR880730IJK', curp: 'JUHR880730HDFZMB09', nss: '55544433322' },
                employeeName: 'Roberto Juárez Hdez',
                paymentDate: '2024-07-31', startDate: '2024-07-16', endDate: '2024-07-31',
                type: 'E', // Extraordinaria
                currency: 'MXN',
                perceptions: [
                    { type: '001', clave: 'SUEL', concept: 'Sueldo Base', amountTaxable: 18000, amountExempt: 0 },
                    { type: '002', clave: 'AGUI', concept: 'Aguinaldo', amountTaxable: 3000, amountExempt: 3000 }
                ],
                deductions: [
                    { type: '001', clave: 'IMSS', concept: 'Cuota IMSS', amount: 540.00 },
                    { type: '002', clave: 'ISR', concept: 'Retención ISR', amount: 2100.00 },
                    { type: '005', clave: 'FONACOT', concept: 'FONACOT', amount: 300.00 }
                ],
                subtotal: 21000, discount: 2940.00, total: 18060.00
            }
        ],

        dashboard: {
            stats: {
                totalInvoiced: 34299.8,
                activeClients: 4,
                pendingPayments: 8526,
                invoiceCount: 6,
                paidCount: 3,
                canceledCount: 1,
                growth: 14.2,
            },
            recentActivity: [
                { id: 'act-1', text: 'Factura A-105 creada como borrador para Geomex Solutions', time: 'Hace 2 horas' },
                { id: 'act-2', text: 'Pago P-3 registrado — Grupo Alfa SA de CV — $19,740 MXN', time: 'Hace 1 día' },
                { id: 'act-3', text: 'Factura A-104 timbrada exitosamente con PAC Facturama', time: 'Hace 2 días' },
                { id: 'act-4', text: 'Nómina N-3 emitida para Roberto Juárez Hdez', time: 'Hace 3 días' },
                { id: 'act-5', text: 'Factura A-103 cancelada — motivo: error en datos del receptor', time: 'Hace 4 días' },
            ]
        }
    };
    
    // Catalogs
    FIAX.demo_data.catalogs = {
        useCfdi: [
            { id: 'G01', name: 'Adquisición de mercancías' },
            { id: 'G03', name: 'Gastos en general' },
            { id: 'D01', name: 'Honorarios médicos, dentales y gastos hospitalarios' },
            { id: 'P01', name: 'Por definir' }
        ],
        paymentMethods: [
            { id: 'PUE', name: 'Pago en una sola exhibición' },
            { id: 'PPD', name: 'Pago en parcialidades o diferido' }
        ],
        paymentForms: [
            { id: '01', name: 'Efectivo' },
            { id: '02', name: 'Cheque nominativo' },
            { id: '03', name: 'Transferencia electrónica de fondos' },
            { id: '99', name: 'Por definir' }
        ],
        Exportacion: { '01': 'No aplica', '02': 'Definitiva', '03': 'Temporal' },
        ObjetoImp: {
            '01': 'No objeto de impuesto',
            '02': 'Sí objeto de impuesto',
            '03': 'Sí objeto de impuesto y no obligado al desglose'
        },
        taxRegimes: {
            '601': 'General de Ley Personas Morales',
            '603': 'Personas Morales con Fines no Lucrativos',
            '605': 'Sueldos y Salarios',
            '606': 'Arrendamiento',
            '612': 'Personas Físicas con Actividades Empresariales y Profesionales',
            '616': 'Sin obligaciones fiscales',
            '621': 'Incorporación Fiscal',
            '625': 'Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
            '626': 'Régimen Simplificado de Confianza - RESICO'
        },
        tipoDeComprobante: {
            'I': 'Ingreso',
            'E': 'Egreso',
            'T': 'Traslado',
            'P': 'Pago',
            'N': 'Nómina'
        }
    };
})();
