import { create } from 'zustand';
import { SubscriptionPlanId } from '../services/paymentService';

interface CheckoutModalState {
  isOpen: boolean;
  selectedPlanId: SubscriptionPlanId;
  openCheckout: (planId?: SubscriptionPlanId) => void;
  closeCheckout: () => void;
  setSelectedPlanId: (planId: SubscriptionPlanId) => void;
}

export const useCheckoutModalStore = create<CheckoutModalState>((set) => ({
  isOpen: false,
  selectedPlanId: 'lifetime',
  openCheckout: (planId = 'lifetime') => set({ isOpen: true, selectedPlanId: planId }),
  closeCheckout: () => set({ isOpen: false }),
  setSelectedPlanId: (planId) => set({ selectedPlanId: planId }),
}));
