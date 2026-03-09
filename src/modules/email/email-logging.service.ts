import { EmailLog, IEmailLog } from './email-log.model';
import { Types } from 'mongoose';

export class EmailLoggingService {
  /**
   * Create an initial log entry for a queued email.
   */
  static async createEmailLog(data: {
    emailId: string;
    recipient: string;
    subject: string;
    type: IEmailLog['type'];
    provider?: IEmailLog['provider'];
    organizationId?: Types.ObjectId;
    userId?: Types.ObjectId;
    metadata?: Record<string, any>;
  }) {
    return await EmailLog.create({
      ...data,
      status: 'queued',
    });
  }

  /**
   * Update the status of an existing email log.
   */
  static async updateEmailStatus(
    emailId: string,
    status: IEmailLog['status'],
    additionalData: { deliveredAt?: Date; sentAt?: Date; errorMessage?: string } = {}
  ) {
    return await EmailLog.findOneAndUpdate(
      { emailId },
      {
        $set: {
          status,
          ...additionalData,
        },
      },
      { new: true }
    );
  }

  /**
   * Specifically record a failure with an error message.
   */
  static async recordEmailFailure(emailId: string, errorMessage: string) {
    return await this.updateEmailStatus(emailId, 'failed', { errorMessage });
  }

  /**
   * Helper to handle the "sent" transition.
   */
  static async markAsSent(emailId: string) {
    return await this.updateEmailStatus(emailId, 'sent', { sentAt: new Date() });
  }

  /**
   * Helper to handle the "delivered" transition from webhooks.
   */
  static async markAsDelivered(emailId: string) {
    return await this.updateEmailStatus(emailId, 'delivered', { deliveredAt: new Date() });
  }
}
