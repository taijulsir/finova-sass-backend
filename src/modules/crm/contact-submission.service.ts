import ContactSubmission, {
  IContactSubmission,
  SubmissionStatus,
} from './contact-submission.model';
import SupportTicket from '../support/support-ticket.model';
import { Types } from 'mongoose';

export class ContactSubmissionService {
  /**
   * Create a new submission (Public/Internal)
   */
  static async createSubmission(data: Partial<IContactSubmission>) {
    return await ContactSubmission.create(data);
  }

  /**
   * List submissions with advanced filtering
   */
  static async getSubmissions(query: any = {}) {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      search,
      dateFrom,
      dateTo,
    } = query;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    const [data, total] = await Promise.all([
      ContactSubmission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      ContactSubmission.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  /**
   * Get single submission
   */
  static async getSubmissionById(id: string) {
    return await ContactSubmission.findById(id);
  }

  /**
   * Update status
   */
  static async updateStatus(id: string, status: SubmissionStatus) {
    return await ContactSubmission.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
  }

  /**
   * Delete submission
   */
  static async deleteSubmission(id: string) {
    return await ContactSubmission.findByIdAndDelete(id);
  }

  /**
   * Convert feedback to support ticket
   */
  static async convertToTicket(
    submissionId: string,
    ticketData: {
      priority: string;
      assignedAdmin: string;
      organizationId?: string;
    }
  ) {
    const submission = await ContactSubmission.findById(submissionId);
    if (!submission) throw new Error('Submission not found');

    // Generate ticket ID (simplified here, reuse logic if possible)
    const count = await SupportTicket.countDocuments();
    const ticketId = `FIN-${10000 + count + 1}`;

    const ticket = await SupportTicket.create({
      ticketId,
      organizationId: ticketData.organizationId || submission.organizationId,
      createdBy: submission.organizationId ? submission.organizationId : null, // Or use a system user ID
      subject: `[SUBMISSION] ${submission.subject}`,
      description: `Message: ${submission.message}\nSubmittor: ${submission.name} (${submission.email})\nType: ${submission.type}`,
      priority: ticketData.priority,
      assignedAdmin: new Types.ObjectId(ticketData.assignedAdmin),
      status: 'open',
    });

    // Mark submission as resolved once converted to ticket
    submission.status = SubmissionStatus.RESOLVED;
    await submission.save();

    return ticket;
  }

  /**
   * Prepare data for Export CSV
   */
  static async getDataForExport() {
    return await ContactSubmission.find()
      .select('name email type subject status source createdAt')
      .sort({ createdAt: -1 });
  }
}
