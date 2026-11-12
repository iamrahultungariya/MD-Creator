import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { useCheckoutModalStore } from '../../src/stores/useCheckoutModalStore';
import {
  SUBSCRIPTION_PLANS,
  reserveEarlyBirdSpot,
  initiateStripeCheckout,
  initiateRazorpayCheckout,
} from '../../src/services/paymentService';

describe('Locked-Plan Checkout Flow', () => {
  it('locks entryPlanGroup based on the clicked pricing plan', () => {
    useCheckoutModalStore.getState().openCheckout('lifetime');
    let state = useCheckoutModalStore.getState();
    assert.strictEqual(state.isOpen, true);
    assert.strictEqual(state.selectedPlanId, 'lifetime');
    assert.strictEqual(state.entryPlanGroup, 'lifetime');

    useCheckoutModalStore.getState().openCheckout('pro_annual');
    state = useCheckoutModalStore.getState();
    assert.strictEqual(state.selectedPlanId, 'pro_annual');
    assert.strictEqual(state.entryPlanGroup, 'pro');

    useCheckoutModalStore.getState().openCheckout('pro_monthly');
    state = useCheckoutModalStore.getState();
    assert.strictEqual(state.selectedPlanId, 'pro_monthly');
    assert.strictEqual(state.entryPlanGroup, 'pro');

    useCheckoutModalStore.getState().closeCheckout();
    assert.strictEqual(useCheckoutModalStore.getState().isOpen, false);
  });

  it('provides gateway-ready plan pricing metadata and staged adapters', async () => {
    assert.strictEqual(SUBSCRIPTION_PLANS.lifetime.amountCentsUSD, 4900);
    assert.strictEqual(SUBSCRIPTION_PLANS.lifetime.billingInterval, 'one_time');
    assert.strictEqual(SUBSCRIPTION_PLANS.pro_monthly.amountCentsUSD, 800);
    assert.strictEqual(SUBSCRIPTION_PLANS.pro_monthly.billingInterval, 'monthly');
    assert.strictEqual(SUBSCRIPTION_PLANS.pro_annual.amountCentsUSD, 7200);
    assert.strictEqual(SUBSCRIPTION_PLANS.pro_annual.billingInterval, 'annual');

    const invalidEmail = await reserveEarlyBirdSpot('not-an-email', 'lifetime');
    assert.strictEqual(invalidEmail.success, false);

    const stripeRes = await initiateStripeCheckout('lifetime', 'writer@studio.dev');
    assert.strictEqual(stripeRes.success, false);
    assert.strictEqual(stripeRes.status, 'staged');

    const razorpayRes = await initiateRazorpayCheckout('pro_annual', 'writer@studio.dev');
    assert.strictEqual(razorpayRes.success, false);
    assert.strictEqual(razorpayRes.status, 'staged');
  });

  it('does not use legacy broken feedbacks insert in paymentService', () => {
    const serviceCode = fs.readFileSync('src/services/paymentService.ts', 'utf-8');
    assert.ok(!serviceCode.includes("from('feedbacks')"), 'Must not write reservations to feedbacks table');
    assert.ok(serviceCode.includes('reserve_early_bird_spot'), 'Must call reserve_early_bird_spot RPC');
  });

  it('implements native accessible dialog without plan switcher or decorative icons in CheckoutModal', () => {
    const modalCode = fs.readFileSync('src/components/checkout/CheckoutModal.tsx', 'utf-8');
    assert.ok(modalCode.includes('<dialog'), 'CheckoutModal must use native <dialog>');
    assert.ok(modalCode.includes('closedby="any"'), 'CheckoutModal must support light-dismiss');
    assert.ok(!modalCode.includes('backdrop-blur'), 'CheckoutModal must not use glassmorphism');
    assert.ok(!modalCode.includes('<Sparkles'), 'No decorative Sparkles icon');
    assert.ok(!modalCode.includes('<CreditCard'), 'No decorative CreditCard icon');
    assert.ok(!modalCode.includes('<Gift'), 'No decorative Gift icon');
    assert.ok(!modalCode.includes('<Lock'), 'No decorative Lock icon');
    assert.ok(!modalCode.includes('<CheckCircle2'), 'No decorative CheckCircle2 icon');
    assert.ok(modalCode.includes("import { X } from 'lucide-react'"), 'Only close X icon should be imported');
    assert.ok(!modalCode.includes("setSelectedPlanId('lifetime')"), 'Must not let user switch between Lifetime and Pro inside modal');
    assert.ok(modalCode.includes("entryPlanGroup === 'pro'"), 'Pro interval toggle must only show when entryPlanGroup is pro');
  });

  it('persists lifetime reservation and locks modal against repeated email prompts', async () => {
    const modalCode = fs.readFileSync('src/components/checkout/CheckoutModal.tsx', 'utf-8');
    const serviceCode = fs.readFileSync('src/services/paymentService.ts', 'utf-8');

    // paymentService must provide reservation lookup functions
    assert.ok(
      serviceCode.includes('getSavedEarlyBirdReservation') || serviceCode.includes('checkEarlyBirdReservation'),
      'paymentService must export function to check saved reservation'
    );

    // CheckoutModal must verify existing reservation on open and display locked state
    assert.ok(
      modalCode.includes('isExistingReservation') || modalCode.includes('savedReservation'),
      'CheckoutModal must inspect existing reservations on modal open'
    );
    assert.ok(
      modalCode.includes('Use a different email') || modalCode.includes('Change email'),
      'CheckoutModal must allow switching email if already locked'
    );
  });
});
