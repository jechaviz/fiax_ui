
// Fiax Constants - Ported from facturamx-saas/types.ts
(() => {
    const FIAX = window.fiax || (window.fiax = {});
    
    FIAX.constants = {
        UserType: {
            Client: 'Client',
            Admin: 'Admin',
            Employee: 'Employee',
            Freelancer: 'Freelancer'
        },
        
        InvoiceStatus: {
            Vigente: 'Vigente',
            Cancelado: 'Cancelado'
        },
        
        PaymentStatus: {
            Paid: 'Paid',
            Unpaid: 'Unpaid',
            Overdue: 'Overdue',
            Partial: 'Partial'
        },
        
        NotificationType: {
            INVOICE_SENT: 'INVOICE_SENT',
            PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
            STAMP_BALANCE_LOW: 'STAMP_BALANCE_LOW',
            NEW_MESSAGE: 'NEW_MESSAGE',
            CONTEST_WINNER_SELECTED: 'CONTEST_WINNER_SELECTED',
            NEW_BID_PLACED: 'NEW_BID_PLACED',
            CONTEST_STARTED: 'CONTEST_STARTED',
            MILESTONE_FUNDED: 'MILESTONE_FUNDED',
            PAYMENT_REQUESTED: 'PAYMENT_REQUESTED',
            PAYMENT_RELEASED: 'PAYMENT_RELEASED',
            TIME_LOGGED: 'TIME_LOGGED',
            JOB_COMPLETED: 'JOB_COMPLETED',
            HIRED: 'HIRED',
        },
        
        JobStatus: {
            Draft: 'Draft',
            Open: 'Open',
            InProgress: 'In Progress',
            Completed: 'Completed',
            Cancelled: 'Cancelled',
            OnHold: 'On Hold',
            PendingApproval: 'Pending Approval',
            Rejected: 'Rejected',
            RFI: 'RFI',
        },
        
        TaskStatus: {
            New: 'New',
            InProgress: 'In Progress',
            Testing: 'Testing',
            AwaitingFeedback: 'Awaiting Feedback',
            Complete: 'Complete',
        },
        
        LeadStatus: {
            New: 'New',
            Contacted: 'Contacted',
            Qualified: 'Qualified',
            ProposalSent: 'Proposal Sent',
            Converted: 'Converted',
            Disqualified: 'Disqualified',
        },
        
        CfdiType: {
            Ingreso: 'I',
            Egreso: 'E',
            Traslado: 'T',
            Nomina: 'N',
            Pago: 'P'
        }
    };
})();
