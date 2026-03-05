import { Router } from 'express';
import { ContactSubmissionController } from './contact-submission.controller';
import { authenticate, requireGlobalRole } from '../../middlewares/auth.middleware';
import { GlobalRole } from '../../types/enums';

const router = Router();

// ADMIN ROUTES (SuperAdmin and Admin roles can manage submissions)
const adminAccess = requireGlobalRole(GlobalRole.SUPER_ADMIN, GlobalRole.ADMIN);

router.get(
  '/admin/contact-submissions',
  authenticate,
  adminAccess,
  ContactSubmissionController.listAdminSubmissions
);

router.get(
  '/admin/contact-submissions/export',
  authenticate,
  adminAccess,
  ContactSubmissionController.exportAdminCsv
);

router.get(
  '/admin/contact-submissions/:id',
  authenticate,
  adminAccess,
  ContactSubmissionController.getAdminSubmission
);

router.patch(
  '/admin/contact-submissions/:id/status',
  authenticate,
  adminAccess,
  ContactSubmissionController.updateAdminStatus
);

router.post(
  '/admin/contact-submissions/:id/convert-to-ticket',
  authenticate,
  adminAccess,
  ContactSubmissionController.convertAdminToTicket
);

router.delete(
  '/admin/contact-submissions/:id',
  authenticate,
  requireGlobalRole(GlobalRole.SUPER_ADMIN), // Only SuperAdmin can delete
  ContactSubmissionController.deleteAdminSubmission
);

// PUBLIC ROUTE (LANDING PAGE)
router.post(
  '/contact',
  ContactSubmissionController.createPublicSubmission
);

export const contactSubmissionRoutes = router;
