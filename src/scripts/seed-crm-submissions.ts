/**
 * seed-crm-submissions.ts
 * ---------------------
 * Script to seed the ContactSubmission collection with various types and statuses.
 *
 * Run:
 *   npx ts-node -r tsconfig-paths/register src/scripts/seed-crm-submissions.ts
 */

import mongoose from 'mongoose';
import { env } from '../config/env';
import { logger } from '../config/logger';
import ContactSubmission, { 
  SubmissionType, 
  SubmissionStatus, 
  SubmissionSource 
} from '../modules/crm/contact-submission.model';

const SEED_DATA = [
  // --- BUG REPORTS ---
  {
    type: SubmissionType.BUG_REPORT,
    name: 'Sarah Miller',
    email: 'sarah.m@enterprise.com',
    company: 'Miller Tech Solutions',
    subject: 'Dashboard loading slow on Safari',
    message: 'The analytics dashboard takes more than 10 seconds to load on the latest Safari version. Works fine on Chrome.',
    status: SubmissionStatus.NEW,
    source: SubmissionSource.DASHBOARD,
  },
  {
    type: SubmissionType.BUG_REPORT,
    name: 'David Chen',
    email: 'd.chen@startup.io',
    subject: 'API Authentication Error',
    message: 'Getting 401 Unauthorized even with valid bearer tokens in the staging environment.',
    status: SubmissionStatus.REVIEWED,
    source: SubmissionSource.DASHBOARD,
  },
  {
    type: SubmissionType.BUG_REPORT,
    name: 'Alex Rivera',
    email: 'alex.r@freelance.com',
    subject: 'PDF Export characters broken',
    message: 'When exporting invoices with special characters (UTF-8), the PDF shows garbled text.',
    status: SubmissionStatus.RESOLVED,
    source: SubmissionSource.DASHBOARD,
  },

  // --- FEATURE REQUESTS ---
  {
    type: SubmissionType.FEATURE_REQUEST,
    name: 'Marcus Aurelius',
    email: 'marcus@stoic-corp.com',
    company: 'Stoic Corp',
    subject: 'Add Dark Mode to the Admin UI',
    message: 'Our team works late hours, and a dedicated dark mode for the admin dashboard would be highly appreciated.',
    status: SubmissionStatus.NEW,
    source: SubmissionSource.DASHBOARD,
  },
  {
    type: SubmissionType.FEATURE_REQUEST,
    name: 'Elena Gilbert',
    email: 'elena@mystic.com',
    subject: 'Integration with Slack',
    message: 'It would be great if we could get real-time subscription notifications directly into our Slack channels.',
    status: SubmissionStatus.REVIEWED,
    source: SubmissionSource.DASHBOARD,
  },

  // --- CONTACT REQUESTS ---
  {
    type: SubmissionType.CONTACT,
    name: 'James Wilson',
    email: 'j.wilson@global.com',
    company: 'Global Industries',
    subject: 'Enterprise Plan Inquiry',
    message: 'We are looking to migrate 500+ users to your platform. Can we schedule a demo to discuss custom pricing?',
    status: SubmissionStatus.NEW,
    source: SubmissionSource.LANDING_PAGE,
  },
  {
    type: SubmissionType.CONTACT,
    name: 'Sophia Loren',
    email: 'sophia@marketing-pro.it',
    subject: 'Partnership Opportunity',
    message: 'I would like to discuss a potential co-marketing partnership between our platforms.',
    status: SubmissionStatus.RESOLVED,
    source: SubmissionSource.LANDING_PAGE,
  },

  // --- FEEDBACK ---
  {
    type: SubmissionType.FEEDBACK,
    name: 'Kevin Hart',
    email: 'kevin@comedy.com',
    subject: 'Great onboarding experience',
    message: 'Just wanted to say that the new onboarding flow is incredibly smooth. Great job team!',
    status: SubmissionStatus.RESOLVED,
    source: SubmissionSource.DASHBOARD,
  },
  {
    type: SubmissionType.FEEDBACK,
    name: 'Rachel Zane',
    email: 'rachel@pearson-specter.com',
    subject: 'Documentation could be better',
    message: 'The API documentation for webhooks is a bit outdated and missing some field descriptions.',
    status: SubmissionStatus.NEW,
    source: SubmissionSource.DASHBOARD,
  }
];

async function seedSubmissions() {
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(env.mongodbUri);
    logger.info('Connected.');

    logger.info(`Clearing existing test submissions...`);
    // Optional: Only clear if you want a fresh start every time
    // await ContactSubmission.deleteMany({});

    logger.info(`Seeding ${SEED_DATA.length} submissions...`);
    
    for (const data of SEED_DATA) {
      await ContactSubmission.findOneAndUpdate(
        { email: data.email, subject: data.subject },
        data,
        { upsert: true, new: true }
      );
    }

    logger.info('CRM Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding CRM submissions:', error);
    process.exit(1);
  }
}

seedSubmissions();
