
// Fiax Demo Data - Rich Implementation for CFDI 4.0 Previews
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    FIAX.demo_data = {
        users: [
            { id: 'user-client-brenda', name: 'Brenda Smith', email: 'brenda@example.com', type: 'Client', companyName: 'Innovate Inc.', location: 'New York, USA', rfc: 'SABR890101ABC', taxRegime: '601', postalCode: '06500', 
              branches: [{ id: 'brenda-branch-1', name: 'Main Office', postalCode: '06500'}] },
            { id: 'user-freelancer-john', name: 'John Doe', email: 'john@example.com', type: 'Freelancer', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' }
        ],

        issuers: [
            {
                id: 'issuer-1',
                name: 'Servicios Profesionales John Doe',
                rfc: 'DOE880101CDE',
                taxRegime: '612',
                branches: [{ id: 'branch-1-1', name: 'Matriz', postalCode: '50226' }],
            }
        ],

        products: [
            { id: 'prod-1', description: 'Consultoría React', rate: 75, unit: 'Hora', productCode: '84111500', unitCode: 'E48', objetoImp: '02' }
        ],

        invoices: [
            {
                id: 'inv-101',
                uuid: 'E2B5A41C-5373-4109-8663-B624EDC9B071',
                serie: 'A',
                folio: '101',
                date: '2024-07-15T10:00:00Z',
                status: 'Vigente',
                tipoDeComprobante: 'I',
                issuerId: 'issuer-1',
                branchId: 'branch-1-1',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { userId: 'user-client-brenda', name: 'Innovate Inc.', rfc: 'SABR890101ABC', taxRegime: '601', postalCode: '06500', cfdiUse: 'G03' },
                expeditionPlace: '50226',
                paymentMethod: 'PUE',
                paymentType: '03',
                condicionesDePago: 'Contado',
                currency: 'USD',
                exchangeRate: 1,
                lineItems: [
                    {
                        id: 'item-1',
                        noIdentificacion: 'WEB-DEV-KIT-01',
                        productCode: '84111500',
                        unitCode: 'E48',
                        quantity: 20,
                        description: 'Desarrollo de componente de Calendario en React',
                        unitPrice: 75,
                        discount: 0,
                        amount: 1500,
                        objetoImp: '02',
                        taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 240, base: 1500 }]
                    },
                    {
                        id: 'item-2',
                        description: 'Librería de Calendario Core',
                        quantity: 1,
                        unitPrice: 500,
                        amount: 500,
                        productCode: '43231500',
                        unitCode: 'H87',
                        noIdentificacion: 'LIB-CAL-001',
                        taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 80, base: 500 }],
                        partes: [
                           { id: 'p1', description: 'Sub-módulo Gráficos', quantity: 1, unitPrice: 0, amount: 0, productCode: '43231500' }
                        ]
                    },
                    {
                        id: 'item-3',
                        description: 'Módulo de Autenticación Avanzada',
                        quantity: 1,
                        unitPrice: 200,
                        discount: 20,
                        amount: 180,
                        productCode: '43231502',
                        unitCode: 'H87',
                        noIdentificacion: 'LIB-AUTH-003',
                        taxes: [{ taxType: 'IVA', rate: 0.16, isRetention: false, amount: 28.8, base: 180 }]
                    }
                ],
                subtotal: 2000,
                discount: 50,
                taxTotal: 348.8,
                retainedTotal: 0,
                total: 2298.8,
                satSeal: 'mock_sat_seal==',
                issuerSeal: 'mock_issuer_seal=='
            }
        ],

        paymentReceipts: [
            {
                id: 'pay-1',
                uuid: 'P4Y-M3NT-UUID-1234',
                serie: 'P',
                folio: '1',
                date: '2024-07-16T10:00:00Z',
                paymentDate: '2024-07-16T00:00:00Z',
                status: 'Vigente',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE', taxRegime: '612', postalCode: '50226' },
                receiver: { name: 'Innovate Inc.', rfc: 'SABR890101ABC', postalCode: '06500' },
                paymentType: '03 (Transferencia)',
                currency: 'USD',
                total: 2217,
                relatedDocuments: [
                    { uuid: 'E2B5A41C-5373-4109-8663-B624EDC9B071', serie: 'A', folio: '101', amountPaid: 2217, previousBalance: 2217, remainingBalance: 0, currency: 'USD', installmentNumber: 1 }
                ]
            }
        ],

        payrollReceipts: [
            {
                id: 'payr-1',
                uuid: 'N0M-1N4-UUID-5678',
                serie: 'N',
                folio: '1',
                status: 'Vigente',
                issuer: { name: 'John Doe', rfc: 'DOE880101CDE' },
                employee: { name: 'Carlos Mendoza', rfc: 'MENC900101ABC', curp: 'MENC900101HDFLRS01', nss: '12345678901' },
                paymentDate: '2024-07-15',
                startDate: '2024-07-01',
                endDate: '2024-07-15',
                perceptions: [
                    { type: '001', clave: 'SUEL', concept: 'Sueldo Base', amountTaxable: 15000, amountExempt: 0 },
                    { type: '038', clave: 'BONO', concept: 'Bono Puntualidad', amountTaxable: 1000, amountExempt: 0 }
                ],
                deductions: [
                    { type: '001', clave: 'IMSS', concept: 'Cuota IMSS', amount: 450.50 },
                    { type: '002', clave: 'ISR', concept: 'Retención ISR', amount: 1540.20 }
                ],
                subtotal: 16000,
                discount: 1990.70,
                total: 14009.30
            }
        ]
    };
    
    // Catalogs
    FIAX.demo_data.catalogs = {
        useCfdi: [{id:'G01', name:'Adquisición de mercancías'}, {id:'G03', name:'Gastos en general'}, {id:'P01', name:'Por definir'}],
        paymentMethods: [{id:'PUE', name:'Pago en una sola exhibición'}, {id:'PPD', name:'Pago en parcialidades o diferido'}],
        paymentForms: [{id:'01', name:'Efectivo'}, {id:'03', name:'Transferencia electrónica de fondos'}, {id:'99', name:'Por definir'}],
        Exportacion: {'01': 'No aplica', '02': 'Definitiva'},
        ObjetoImp: {'01': 'No objeto de impuesto', '02': 'Sí objeto de impuesto', '03': 'Sí objeto de impuesto y no obligado al desglose'}
    };
})();
