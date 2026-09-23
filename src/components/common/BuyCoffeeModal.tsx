import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  X, 
  Heart, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';
import { RichIcon } from '../../utils/richIcons';
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
    tagline: 'Most Popular Choice',
    impact: 'Covers 1 month of CDN & offline asset hosting'
  },
  {
    id: 'roaster',
    name: 'Roaster Pack',
    price: 10,
    tagline: 'Rocket Fuel',
    impact: 'Funds new PDF styling & KaTeX studio engineering'
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-neutral-200/90 dark:border-neutral-800 overflow-hidden z-10 flex flex-col max-h-[92vh]"
          >
            {/* Ambient Warm Gradient Accent Top */}
            <div className="h-2 w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3 shrink-0 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/25 shadow-xs">
                  <RichIcon icon="☕" size="1.6em" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      Fuel MD Writer
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-900/40">
                      Independent Software
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    100% free, private, and open-source. Powered by supporters.
                  </p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-3 overflow-y-auto space-y-4 relative z-10">
              {!isSuccess ? (
                <>
                  {/* Tier Selector */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Choose Support Tier</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {TIERS.map((tier) => {
                        const isSelected = !isCustom && selectedTier === tier.id;
                        return (
                          <div
                            key={tier.id}
                            onClick={() => {
                              setSelectedTier(tier.id);
                              setIsCustom(false);
                            }}
                            className={`relative p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                              isSelected
                                ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-xs'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-white dark:bg-neutral-900'
                            }`}
                          >
                            {tier.popular && (
                              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                Popular
                              </div>
                            )}

                            <div className="text-xl font-black text-neutral-900 dark:text-white mt-1">
                              ${tier.price}
                            </div>
                            <div className="text-xs font-bold text-neutral-800 dark:text-neutral-200 mt-0.5">
                              {tier.name}
                            </div>
                            <div className="text-[10px] text-neutral-400 mt-1 leading-tight line-clamp-1">
                              {tier.tagline}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Impact Note Banner */}
                  <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200/60 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="text-[11px] leading-relaxed">
                      <strong>Impact:</strong> {isCustom ? 'Every dollar fuels continuous independent development.' : currentTier.impact}
                    </span>
                  </div>

                  {/* Custom Amount & Note */}
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                          Custom Amount ($)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 15"
                          value={customAmount}
                          onChange={(e) => {
                            setCustomAmount(e.target.value);
                            setIsCustom(true);
                          }}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 mb-1">
                          Your Name (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Friendly Writer"
                          value={supporterName}
                          onChange={(e) => setSupporterName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Leave a short encouraging message or feature wish..."
                        value={supporterNote}
                        onChange={(e) => setSupporterNote(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Payment Portals */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                      Support via Platform
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <a
                        href={BMC_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-[#FFDD00] hover:bg-[#ffe633] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                      >
                        <BmcCoffeeCupIcon className="w-4 h-4 shrink-0" />
                        <span>Buy Me a Coffee</span>
                      </a>

                      <a
                        href="https://ko-fi.com"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-rose-400 dark:hover:border-rose-500 bg-rose-500/10 text-neutral-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
                        <span>Ko-fi</span>
                      </a>

                      <a
                        href="https://github.com/sponsors"
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:border-purple-400 dark:hover:border-purple-500 bg-purple-500/10 text-neutral-900 dark:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-purple-500" />
                        <span>GitHub Sponsors</span>
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                /* Celebratory Success State */
                <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-rose-400 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                    <Heart className="w-8 h-8 fill-current animate-pulse" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-neutral-950 dark:text-white tracking-tight">
                    Thank You for Fueling MD Writer!
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed">
                    {supporterName ? `Thank you, ${supporterName}!` : 'Thank you so much!'} Your contribution of <strong className="text-neutral-900 dark:text-white">${getActiveAmount()}</strong> helps keep this app completely free, private, and continually improving.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-100 dark:text-neutral-950 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back to Writing
                  </button>
                </div>
              )}
            </div>

            {/* Footer / Instant Pledge Action */}
            {!isSuccess && (
              <div className="p-4 px-6 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-900/60 flex items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Direct creator support</span>
                </div>

                <a
                  href={BMC_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsSuccess(true)}
                  className="px-6 py-2.5 rounded-xl bg-[#FFDD00] hover:bg-[#ffe633] text-black font-extrabold text-xs transition-all flex items-center gap-2 shadow-sm hover:shadow-md hover:scale-105 active:scale-95 cursor-pointer border border-black/15 font-sans"
                >
                  <BmcCoffeeCupIcon className="w-4 h-4 shrink-0" />
                  <span>Buy me a coffee (${getActiveAmount()})</span>
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
