/**
 * seed-support-tickets.ts
 * ---------------------
 * Script to seed the SupportTicket collection with 20 demo tickets.
 *
 * Run:
 *   npx ts-node -r tsconfig-paths/register src/scripts/seed-support-tickets.ts
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import SupportTicket from '../modules/support/support-ticket.model';
import { User } from '../modules/user/user.model';
import { Organization } from '../modules/organization/organization.model';

const SUBJECTS = [
  "Payment failed during checkout",
  "Unable to invite team members",
  "Dashboard loading error",
  "Subscription upgrade issue",
  "Email notifications not sending",
  "API rate limit exceeded",
  "Login session expired",
  "Feature request: Dark Mode",
  "Webhooks not firing for cancellations",
  "Unexpected charge on card",
  "Database connection intermittent",
  "Slow response on /api/v1/analytics",
  "SSO configuration help needed",
  "Custom domain SSL pending",
  "Mobile app crash on startup",
  "Invoice missing organization name",
  "Bulk upload of users failed",
  "Clarification on data retention policy",
  "Integration with HubSpot help",
  "Account deletion request"
];

const DESCRIPTIONS = [
  "Users report getting a 'Stripe Invalid Source' error during checkout.",
  "Invites send out but user sees 404 when clicking the link.",
  "The main analytics view hangs at 80% loading forever on Safari.",
  "Paid for Pro plan but account still showing Basic features.",
  "Customer didn't receive the password reset email multiple times.",
  "Getting 429 errors despite staying within documented limits.",
  "Logged in users are kicked out after 5 minutes of activity.",
  "Would like a toggle for dark mode in the admin panel.",
  "No POST requests reached our server for the last 3 churns.",
  "Charged $99 but I am on the $29 plan.",
  "Seeing occasional 'ECONNREFUSED' in the logs.",
  "Endpoint takes 5-12 seconds consistently.",
  "Need help mapping SAML claims correctly.",
  "Certificate has been in 'pending' for 24 hours.",
  "Crashes immediately after splash screen on Android 14.",
  "PDF invoice shows empty field where Org name should be.",
  "Uploading 500 users from CSV timed out with no error.",
  "Need to know if old audit logs are kept past 1 year.",
  "CRM sync is only pulling 10 records per hour.",
  "Please close my account and wipe all personal data."
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const TAG_POOLS = ['billing', 'bug', 'authentication', 'api', 'dashboard', 'email', 'feature', 'security'];

async function seedTickets() {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.mongodbUri);
    logger.info('Connected.');

    // Ensure at least one org exists
    let org = await Organization.findOne();
    if (!org) {
      logger.info('No Organization found. Creating a test organization...');
      org = await Organization.create({
        name: 'Finova Corp',
        slug: 'finova-corp',
        ownerId: new mongoose.Types.ObjectId(),
      });
    }

    // Ensure at least one user exists
    let user = await User.findOne({ email: /admin/ }) || await User.findOne();
    if (!user) {
      logger.info('No User found. Creating a test user...');
      user = await User.create({
        name: 'Test Admin',
        email: 'test-admin@finova.com',
        password: 'password123', // This will be hashed by model middleware if present
      });
    }

    logger.info('Clearing existing support tickets...');
    await SupportTicket.deleteMany({});

    logger.info('Seeding 20 support tickets...');
    
    for (let i = 0; i < 20; i++) {
        const priority = PRIORITIES[i % PRIORITIES.length];
        const status = STATUSES[i % STATUSES.length];
        
        // Random tags
        const tags = [
            TAG_POOLS[Math.floor(Math.random() * TAG_POOLS.length)],
            TAG_POOLS[Math.floor(Math.random() * TAG_POOLS.length)]
        ].filter((v, i, a) => a.indexOf(v) === i); // unique

        await SupportTicket.create({
            ticketId: `FIN-${1000 + i}`,
            organizationId: org._id,
            createdBy: user._id,
            subject: SUBJECTS[i],
            description: DESCRIPTIONS[i],
            priority,
            status,
            tags,
            attachments: i % 3 === 0 ? ["https://cdn.finova.com/support/sample-log.txt"] : [],
            lastReplyAt: new Date(Date.now() - Math.random() * 100000000),
            // history and slaDeadline are handled by Mongoose pre-save middleware
        });
    }

    logger.info('Support Ticket seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding support tickets:', error);
    process.exit(1);
  }
}

seedTickets();
