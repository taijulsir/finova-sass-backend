import { Request, Response } from 'express';
import { SupportTicketService } from './support-ticket.service';

export class SupportTicketController {
  /**
   * ADMIN: List all tickets with optional filtering
   */
  static async listTickets(req: Request, res: Response) {
    try {
      const tickets = await SupportTicketService.getTickets(req.query);
      res.json({
        success: true,
        data: tickets.data,
        total: tickets.total,
        page: tickets.page,
        totalPages: tickets.totalPages,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Get single ticket details
   */
  static async getTicket(req: Request, res: Response) {
    try {
      const ticket = await SupportTicketService.getTicketById(req.params.id);
      if (!ticket) {
        return res.status(404).json({ success: false, message: 'Ticket not found' });
      }
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Assign ticket to admin
   */
  static async assignTicket(req: Request, res: Response) {
    try {
      const ticket = await SupportTicketService.assignTicket(req.params.id, req.body.adminId);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN/ORGANIZATION: Update ticket status
   */
  static async updateStatus(req: Request, res: Response) {
    try {
      const ticket = await SupportTicketService.updateTicketStatus(req.params.id, req.body.status);
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Reply to ticket
   */
  static async addAdminMessage(req: Request, res: Response) {
    try {
      const message = await SupportTicketService.addMessage({
        ticketId: req.params.id,
        senderType: 'admin',
        senderId: (req as any).user._id,
        message: req.body.message,
        attachments: req.body.attachments,
      });
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Get ticket messages
   */
  static async getMessages(req: Request, res: Response) {
    try {
      const messages = await SupportTicketService.getTicketMessages(req.params.id);
      res.json({ success: true, data: messages });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ADMIN: Delete ticket
   */
  static async deleteTicket(req: Request, res: Response) {
    try {
      await SupportTicketService.deleteTicket(req.params.id);
      res.json({ success: true, message: 'Ticket deleted' });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ORGANIZATION: Create new ticket
   */
  static async createTicketByOrg(req: Request, res: Response) {
    try {
      const ticket = await SupportTicketService.createTicket({
        organizationId: (req as any).user.organizationId,
        createdBy: (req as any).user._id,
        subject: req.body.subject,
        description: req.body.description,
        priority: req.body.priority,
        attachments: req.body.attachments,
      });
      res.json({ success: true, data: ticket });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ORGANIZATION: List org tickets
   */
  static async listTicketsByOrg(req: Request, res: Response) {
    try {
      const tickets = await SupportTicketService.getTickets({
        ...req.query,
        organizationId: (req as any).user.organizationId,
      });
      res.json({
        success: true,
        data: tickets.data,
        total: tickets.total,
        page: tickets.page,
        totalPages: tickets.totalPages,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  /**
   * ORGANIZATION: Reply to ticket
   */
  static async addOrgMessage(req: Request, res: Response) {
    try {
      const message = await SupportTicketService.addMessage({
        ticketId: req.params.id,
        senderType: 'organization',
        senderId: (req as any).user._id,
        message: req.body.message,
        attachments: req.body.attachments,
      });
      res.json({ success: true, data: message });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
