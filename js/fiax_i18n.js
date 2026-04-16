
// Fiax I18n - Ported from facturamx-saas/i18n/es/common.ts
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    FIAX.i18n = {
        es: {
            "cancel": "Cancelar",
            "delete": "Eliminar",
            "edit": "Editar",
            "save": "Guardar",
            "add": "Añadir",
            "apply": "Aplicar",
            "table": {
                "previous": "Anterior",
                "next": "Siguiente",
                "rowsPerPage": "Filas por página",
                "page": "Página",
                "of": "de",
                "noResults": "No se encontraron resultados.",
                "selected": "{{count}} de {{total}} fila(s) seleccionadas.",
                "searchPlaceholder": "Buscar...",
                "actions": "Acciones",
                "columns": "Columnas",
                "kanban": "Kanban",
                "table": "Tabla",
                "cards": "Tarjetas",
            },
            "sidebar": {
                "dashboard": "Panel de Control",
                "invoices": "Facturación",
                "records": "Ingresos",
                "expenses": "Gastos",
                "deposits": "Pagos",
                "clients": "Clientes",
                "products": "Servicios",
                "payroll": "Nómina",
                "employees": "Empleados",
                "admin": "Admin",
                "issuers": "Emisores",
                "settings": "Configuración",
                "help": "Ayuda",
            },
            "header": {
                "create": "Crear Nuevo",
                "search": "Buscar en el sistema...",
                "notifications": "Notificaciones",
                "profile": "Mi Perfil",
                "billing": "Facturación y Plan",
                "logout": "Cerrar Sesión",
            },
            "dashboard": {
                "title": "Dashboard",
                "configure": "Configurar Dashboard",
                "empty": "Tu dashboard está vacío.",
                "stats": {
                    "totalInvoiced": "Total Facturado",
                    "activeClients": "Clientes Activos",
                    "pendingPayments": "Pagos Pendientes",
                    "growth": "Crecimiento"
                },
                "agg": {
                    "sum": "Suma Total",
                    "count": "Conteo",
                    "avg": "Promedio"
                },
                "ai": {
                    "initial": "¡Hola! ¿Cómo puedo ayudarte a visualizar tus datos hoy?",
                    "placeholder": "Ej: 'Muéstrame el valor total de leads por categoría'",
                    "thinking": "Pensando...",
                }
            },
            "invoice": {
                "new": "Nueva Factura",
                "title": "Facturas",
                "client": "Cliente",
                "date": "Fecha",
                "folio": "Folio",
                "total": "Total",
                "status": "Estado",
                "rfc": "RFC",
                "subtotal": "Subtotal",
                "taxes": "Impuestos",
                "concepts": "Conceptos",
                "generate": "Generar Factura",
            }
        }
    };
})();
