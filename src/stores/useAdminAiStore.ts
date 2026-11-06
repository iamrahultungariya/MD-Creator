/**
 * Backward compatibility layer.
 * AI Engine configuration has moved from Admin to User Settings (useUserAiStore).
 */
import { useUserAiStore } from './useUserAiStore';
import { OPENROUTER_DEFAULT_MODEL } from '../types/userAi';

export const OPENROUTER_CROUTON_MODEL = OPENROUTER_DEFAULT_MODEL;

export const useAdminAiStore = useUserAiStore;
