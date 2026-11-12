import { create } from 'zustand';
import { SubscriptionPlanId } from '../services/paymentService';

export type PlanGroup = 'lifetime' | 'pro';

interface CheckoutModalState {
  isOpen: boolean;
  selectedPlanId: SubscriptionPlanId;
  entryPlanGroup: PlanGroup;
  openCheckout: (planId?: SubscriptionPlanId) => void;
  closeCheckout: () => void;
  setSelectedPlanId: (planId: SubscriptionPlanId) => void;
}

export const useCheckoutModalStore = create<CheckoutModalState>((set) => ({
  isOpen: false,
  selectedPlanId: 'lifetime',
  entryPlanGroup: 'lifetime',
  openCheckout: (planId = 'lifetime') =>
    set({
      isOpen: true,
      selectedPlanId: planId,
      entryPlanGroup: planId === 'lifetime' ? 'lifetime' : 'pro',
    }),
  closeCheckout: () => set({ isOpen: false }),
  setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),
}));
