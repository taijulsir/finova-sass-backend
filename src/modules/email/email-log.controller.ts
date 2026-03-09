import { Request, Response } from 'express';
import { EmailLog } from './email-log.model';

export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { status, type, provider, organizationId, search } = req.query;

    console.log('Fetching email logs with params:', { page, limit, status, type, provider, search });

    const query: any = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (provider) query.provider = provider;
    if (organizationId) query.organizationId = organizationId;

    if (search) {
      query.$or = [
        { recipient: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
      ];
    }

    const skipValue = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      EmailLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skipValue)
        .limit(limit)
        .lean(),
      EmailLog.countDocuments(query),
    ]);

    console.log(`Found ${total} logs`);

    return res.status(200).json({
      success: true,
      data: {
        data: logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error in getEmailLogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while fetching email logs',
    });
  }
};

export const getEmailLogDetails = async (req: Request, res: Response) => {
  const { id } = req.params;

  const log = await EmailLog.findById(id).lean();

  if (!log) {
    return res.status(404).json({
      success: false,
      message: 'Email log not found',
    });
  }

  return res.status(200).json({
    success: true,
    data: log,
  });
};
