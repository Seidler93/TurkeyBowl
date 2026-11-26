import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripePaymentLink } from './stripePaymentLink.js';

test('checkout stays unavailable until a real Stripe-hosted URL is configured', () => {
  for (const value of [undefined, '', 'not a url', 'http://buy.stripe.com/link', 'https://buy.stripe.com.attacker.example/link', 'https://example.com/link', 'https://buy.stripe.com/', 'https://user:secret@buy.stripe.com/link']) {
    assert.equal(stripePaymentLink(value), '');
  }
  assert.equal(stripePaymentLink(' https://buy.stripe.com/test_example '), 'https://buy.stripe.com/test_example');
});
