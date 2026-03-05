import { Router } from 'express';
import { SupportTicketController } from './support-ticket.controller';
import { authenticate, requireGlobalRole } from '../../middlewares/auth.middleware';
import { GlobalRole } from '../../types/enums';

const router = Router();

// ADMIN ROUTES (SuperAdmin and Admin roles can manage tickets)
const adminAccess = requireGlobalRole(GlobalRole.SUPER_ADMIN, GlobalRole.ADMIN, GlobalRole.SUPPORT);

router.get(
  '/admin/support-tickets',
  authenticate,
  adminAccess,
  SupportTicketController.listTickets
);

router.get(
  '/admin/support-tickets/:id',
  authenticate,
  adminAccess,
  SupportTicketController.getTicket
);

router.patch(
  '/admin/support-tickets/:id/assign',
  authenticate,
  adminAccess,
  SupportTicketController.assignTicket
);

router.patch(
  '/admin/support-tickets/:id/status',
  authenticate,
  adminAccess,
  SupportTicketController.updateStatus
);

router.post(
  '/admin/support-tickets/:id/message',
  authenticate,
  adminAccess,
  SupportTicketController.addAdminMessage
);

router.get(
  '/admin/support-tickets/:id/messages',
  authenticate,
  adminAccess,
  SupportTicketController.getMessages
);

router.delete(
  '/admin/support-tickets/:id',
  authenticate,
  requireGlobalRole(GlobalRole.SUPER_ADMIN), // Only SuperAdmin can delete
  SupportTicketController.deleteTicket
);

// ORGANIZATION ROUTES
router.post(
  '/support-tickets',
  authenticate,
  SupportTicketController.createTicketByOrg
);

router.get(
  '/support-tickets',
  authenticate,
  SupportTicketController.listTicketsByOrg
);

router.post(
  '/support-tickets/:id/message',
  authenticate,
  SupportTicketController.addOrgMessage
);

export const supportTicketRoutes = router;
