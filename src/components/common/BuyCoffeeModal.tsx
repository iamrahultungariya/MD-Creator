import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  Heart, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Coffee
} from 'lucide-react';
import { BmcCoffeeCupIcon, BMC_URL } from './BuyMeCoffeeButton';

export { openBuyCoffeeModal } from '../../utils/coffeeModalEvents';

interface BuyCoffeeModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface CoffeeTier {
  id: string;
  name: string;
  price: number;
  popular?: boolean;
  tagline: string;
  impact: string;
}

const TIERS: CoffeeTier[] = [
  {
    id: 'espresso',
    name: 'Espresso',
    price: 3,
    tagline: 'Quick caffeine boost',
    impact: 'Covers domain DNS & cloud health checks'
  },
  {
    id: 'latte',
    name: 'Creamy Latte',
    price: 5,
    popular: true,
    tagline: 'Most Popular',
    impact: 'Covers CDN & offline asset distribution'
  },
  {
    id: 'roaster',
    name: 'Roaster Pack',
    price: 10,
    tagline: 'Deep Work Fuel',
    impact: 'Funds new typography & export engine work'
  }
];

export const BuyCoffeeModal: React.FC<BuyCoffeeModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;

  const [selectedTier, setSelectedTier] = useState<string>('latte');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);
  const [supporterName, setSupporterName] = useState('');
  const [supporterNote, setSupporterNote] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleGlobalOpen = () => setInternalOpen(true);
    window.addEventListener('open-buy-coffee', handleGlobalOpen);
    return () => window.removeEventListener('open-buy-coffee', handleGlobalOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isModalOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  const handleClose = () => {
    if (propOnClose) propOnClose();
    setInternalOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setSupporterName('');
      setSupporterNote('');
    }, 200);
  };

  const getActiveAmount = (): number => {
    if (isCustom) {
      const parsed = parseFloat(customAmount);
      return !isNaN(parsed) && parsed > 0 ? parsed : 5;
    }
    const tier = TIERS.find(t => t.id === selectedTier);
    return tier ? tier.price : 5;
  };

  const currentTier = TIERS.find(t => t.id === selectedTier) || TIERS[1];

  return (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden z-10 flex flex-col text-neutral-900 dark:text-neutral-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-neutral-700 shadow-2xs">
                  <Coffee className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                      Support MD Writer
                    </h2>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                      Independent
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Free, private, and open-source for everyone.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4 space-y-4">
              {!isSuccess ? (
                <>
                  {/* Tier Selector */}
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Select Coffee Tier</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {TIERS.map((tier) => {
                        const isSelected = !isCustom && selectedTier === tier.id;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => {
                              setSelectedTier(tier.id);
                              setIsCustom(false);
                            }}
                            className={`relative p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-neutral-950 dark:border-white bg-neutral-50 dark:bg-neutral-800/80 shadow-2xs'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                            }`}
                          >
                            {tier.popular && (
                              <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 text-[9px] font-bold uppercase tracking-wider px-2 py-0.2 rounded-full">
                                Popular
                              </div>
                            )}

                            <div className="text-lg font-black text-neutral-950 dark:text-white mt-0.5">
                              ${tier.price}
                            </div>
                            <div className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mt-0.5">
                              {tier.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-0.5 leading-tight line-clamp-1">
                              {tier.tagline}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Impact Note Banner */}
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                    <span className="text-[11px] leading-relaxed">
                      <strong>Impact:</strong> {isCustom ? 'Every dollar fuels continuous independent development.' : currentTier.impact}
                    </span>
                  </div>

                  {/* Custom Amount & Note */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                          Custom ($)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 15"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setIsCustom(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Writer Name"
                          value={supporterName}
                          onChange={(e) => setSupporterName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Leave a short note or feedback..."
                        value={supporterNote}
                        onChange={(e) => setSupporterNote(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="py-8 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 flex items-center justify-center border border-neutral-200 dark:border-neutral-700">
                    <Heart className="w-7 h-7 text-rose-500 fill-current" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                    Thank You for Supporting MD Writer!
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-xs mx-auto leading-relaxed">
                    {supporterName ? `Thank you, ${supporterName}!` : 'Thank you so much!'} Your contribution helps keep this tool completely independent, private, and continuously refined.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-2 px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back to Writing
                  </button>
                </div>
              )}
            </div>

            {/* Footer Action */}
            {!isSuccess && (
              <div className="p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure &amp; direct</span>
                </div>

                <a
                  href={BMC_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsSuccess(true)}
                  className="px-5 py-2.5 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100 font-bold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <BmcCoffeeCupIcon className="w-4 h-4 shrink-0" />
                  <span>Support with ${getActiveAmount()}</span>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
