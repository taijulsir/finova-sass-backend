import { Request, Response } from 'express';
import { ContactSubmissionService } from './contact-submission.service';
import { SubmissionStatus } from './contact-submission.model';

export class ContactSubmissionController {
  /**
   * ADMIN: List all submissions with optional filtering
   */
  static async listAdminSubmissions(req: Request, res: Response) {
    try {
      const submissions = await ContactSubmissionService.getSubmissions(req.query);
      res.json({
        success: true,
        data: submissions.data,
        total: submissions.total,
        page: submissions.page,
        totalPages: submissions.totalPages,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Get single submission details
   */
  static async getAdminSubmission(req: Request, res: Response) {
    try {
      const submission = await ContactSubmissionService.getSubmissionById(req.params.id);
      if (!submission) {
        return res.status(404).json({ success: false, message: 'Submission not found' });
      }
      res.json({ success: true, data: submission });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Update submission status
   */
  static async updateAdminStatus(req: Request, res: Response) {
    try {
      const submission = await ContactSubmissionService.updateStatus(
        req.params.id,
        req.body.status as SubmissionStatus
      );
      res.json({ success: true, data: submission });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Delete submission
   */
  static async deleteAdminSubmission(req: Request, res: Response) {
    try {
      await ContactSubmissionService.deleteSubmission(req.params.id);
      res.json({ success: true, message: 'Submission deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Export submissions to CSV
   */
  static async exportAdminCsv(_req: Request, res: Response) {
    try {
      const data = await ContactSubmissionService.getDataForExport();
      
      // Construct CSV header
      let csv = 'Name,Email,Type,Subject,Status,Source,Date\n';
      
      data.forEach((item: any) => {
        const row = [
          `"${item.name.replace(/"/g, '""')}"`,
          `"${item.email.replace(/"/g, '""')}"`,
          `"${item.type}"`,
          `"${item.subject.replace(/"/g, '""')}"`,
          `"${item.status}"`,
          `"${item.source}"`,
          `"${item.createdAt.toISOString()}"`
        ];
        csv += row.join(',') + '\n';
      });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=submissions_export.csv');
      res.status(200).send(csv);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Convert feedback to support ticket
   */
  static async convertAdminToTicket(req: Request, res: Response) {
    try {
      const ticket = await ContactSubmissionService.convertToTicket(req.params.id, {
        priority: req.body.priority || 'medium',
        assignedAdmin: req.body.assignedAdmin,
        organizationId: req.body.organizationId,
      });
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * PUBLIC: Create new submission (Landing Page)
   */
  static async createPublicSubmission(req: Request, res: Response) {
    try {
      const submission = await ContactSubmissionService.createSubmission({
        ...req.body,
        source: req.body.source || 'landing_page',
        ipAddress: req.ip,
      });
      res.json({ success: true, data: submission });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
