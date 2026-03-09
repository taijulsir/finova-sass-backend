import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import BillingEvent from '../src/modules/finance/billing-event.model';
import { Organization } from '../src/modules/organization/organization.model';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finova-sass';

const providers = ['stripe', 'paypal', 'manual', 'system'];
const eventTypes = [
  'payment_intent.succeeded',
  'payment_intent.failed',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'subscription.created',
  'subscription.cancelled'
];

async function seedBillingEvents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    // Delete existing billing events
    await BillingEvent.deleteMany({});
    console.log('Cleared existing billing events.');

    // Get an organization for reference
    const org = await Organization.findOne({});
    if (!org) {
      console.error('No organization found. Please run seed script for organizations first.');
      process.exit(1);
    }

    const events = [];

    for (let i = 0; i < 25; i++) {
      const provider = faker.helpers.arrayElement(providers);
      const eventType = faker.helpers.arrayElement(eventTypes);
      const status = faker.helpers.arrayElement(['received', 'processing', 'processed', 'failed']);
      
      const eventIdPrefix = provider === 'stripe' ? 'evt_' : provider === 'paypal' ? 'PAY-' : 'sys_';
      const referencePrefix = eventType.includes('invoice') ? 'inv_' : eventType.includes('sub') ? 'sub_' : 'pay_';

      const receivedAt = faker.date.recent({ days: 14 });
      const processedAt = status === 'processed' || status === 'failed' 
        ? new Date(receivedAt.getTime() + faker.number.int({ min: 1000, max: 10000 }))
        : undefined;

      events.push({
        eventId: `${eventIdPrefix}${faker.string.alphanumeric(12)}`,
        provider,
        eventType,
        organizationId: org._id,
        referenceId: `${referencePrefix}${faker.string.alphanumeric(8).toUpperCase()}`,
        status,
        payload: {
          id: faker.string.uuid(),
          amount: faker.number.int({ min: 1000, max: 10000 }),
          currency: 'usd',
          customer: faker.string.alphanumeric(10),
          metadata: {
            orgName: org.name,
            reason: faker.finance.transactionDescription()
          }
        },
        processingResult: status === 'processed' ? {
          success: true,
          action: 'subscription_updated',
          notified: true
        } : undefined,
        errorMessage: status === 'failed' ? faker.helpers.arrayElement([
          'Insufficient funds',
          'Expired card',
          'Webhook signature mismatch',
          'Stripe API connection error',
          'Customer not found'
        ]) : undefined,
        receivedAt,
        processedAt
      });
    }

    await BillingEvent.insertMany(events);
    console.log('Successfully seeded 25 billing events.');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding billing events:', error);
    process.exit(1);
  }
}

seedBillingEvents();
