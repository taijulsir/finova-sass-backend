import { Types } from 'mongoose';
import SupportTicket, { ISupportTicket } from './support-ticket.model';
import SupportTicketMessage from './support-ticket-message.model';

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  organizationId?: string;
  search?: string;
}

export class SupportTicketService {
  /**
   * Generates a ticket ID like FIN-10023
   */
  private static async generateTicketId(): Promise<string> {
    const count = await SupportTicket.countDocuments();
    return `FIN-${10000 + count + 1}`;
  }

  /**
   * Create a new ticket (Organization flow)
   */
  static async createTicket(data: {
    organizationId: string;
    createdBy: string;
    subject: string;
    description: string;
    priority?: string;
    attachments?: string[];
  }) {
    const ticketId = await this.generateTicketId();
    
    const ticket = await SupportTicket.create({
      ...data,
      ticketId,
      status: 'open',
    });

    return ticket;
  }

  /**
   * List tickets with filters (Admin flow)
   */
  static async getTickets(filters: TicketFilters) {
    const { page = 1, limit = 10, status, priority, organizationId, search } = filters;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (organizationId) query.organizationId = organizationId;
    if (search) {
      query.$or = [
        { ticketId: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const [data, total] = await Promise.all([
      SupportTicket.find(query)
        .populate('organizationId', 'name')
        .populate('assignedAdmin', 'name email')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SupportTicket.countDocuments(query),
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  /**
   * Get ticket by ID with details
   */
  static async getTicketById(id: string) {
    return await SupportTicket.findById(id)
      .populate('organizationId', 'name logo')
      .populate('createdBy', 'name email avatar')
      .populate('assignedAdmin', 'name email avatar');
  }

  /**
   * Assign ticket to admin
   */
  static async assignTicket(id: string, adminId: string) {
    return await SupportTicket.findByIdAndUpdate(
      id,
      { assignedAdmin: new Types.ObjectId(adminId), status: 'in_progress' },
      { new: true }
    );
  }

  /**
   * Update ticket status with flow validation
   */
  static async updateTicketStatus(id: string, status: ISupportTicket['status']) {
    const validTransitions: Record<string, string[]> = {
      open: ['in_progress', 'resolved', 'closed'],
      in_progress: ['resolved', 'closed'],
      resolved: ['closed', 'in_progress'],
      closed: ['open'], // Re-opening
    };

    const ticket = await SupportTicket.findById(id);
    if (!ticket) throw new Error('Ticket not found');

    if (!validTransitions[ticket.status].includes(status)) {
      throw new Error(`Invalid status transition from ${ticket.status} to ${status}`);
    }

    ticket.status = status;
    return await ticket.save();
  }

  /**
   * Add a message/reply to a ticket
   */
  static async addMessage(data: {
    ticketId: string;
    senderType: 'admin' | 'organization';
    senderId: string;
    message: string;
    attachments?: string[];
  }) {
    const message = await SupportTicketMessage.create(data);
    
    // Update ticket's last reply timestamp
    await SupportTicket.findByIdAndUpdate(data.ticketId, {
      lastReplyAt: new Date(),
    });

    return message;
  }

  /**
   * Get messages for a ticket
   */
  static async getTicketMessages(ticketId: string) {
    return await SupportTicketMessage.find({ ticketId })
      .populate('senderId', 'name email avatar')
      .sort({ createdAt: 1 });
  }

  /**
   * Delete ticket (Hard delete or soft delete depending on policy, here hard delete for module)
   */
  static async deleteTicket(id: string) {
    await SupportTicketMessage.deleteMany({ ticketId: new Types.ObjectId(id) });
    return await SupportTicket.findByIdAndDelete(id);
  }
}
