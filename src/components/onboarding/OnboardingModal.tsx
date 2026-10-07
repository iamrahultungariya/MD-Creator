import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Globe, 
  Search, 
  MessageSquare, 
  Video, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Code2, 
  Microscope, 
  PenTool, 
  Briefcase, 
  Cloud, 
  HardDrive, 
  ShieldCheck, 
  FileText,
  Terminal,
  Layers,
  FileSpreadsheet,
  Sliders,
  Compass
} from 'lucide-react';
import { telemetryService } from '../../services/telemetryService';
import { APP_VERSION_LABEL } from '../../config/version';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenAuth,
}) => {
  const [step, setStep] = useState<number>(1);
  const [referralSource, setReferralSource] = useState<string>('');
  const [role, setRole] = useState<string>('');
  const [ageGroup, setAgeGroup] = useState<'10-18' | '18-40' | '40+'>('18-40');
  const [primaryFocus, setPrimaryFocus] = useState<string>('');

  if (!isOpen) return null;

  const totalSteps = 5;

  const referralOptions = [
    { id: 'X / Twitter', label: '𝕏 / Twitter', icon: Globe, desc: 'Technical posts, threads & discussions' },
    { id: 'Google / Web Search', label: 'Google / Web Search', icon: Search, desc: 'Searching for markdown editors & writing tools' },
    { id: 'Reddit / Communities', label: 'Reddit / Communities', icon: MessageSquare, desc: 'r/markdown, r/productivity, Discord forums' },
    { id: 'YouTube / Tech Creator', label: 'YouTube / Creator', icon: Video, desc: 'Video reviews & technical workflows' },
    { id: 'Friend / Colleague', label: 'Colleague / Friend', icon: Users, desc: 'Direct team or peer recommendation' },
    { id: 'GitHub / Web Discovery', label: 'GitHub / Other', icon: Compass, desc: 'Open-source directory, blogs & web search' },
  ];

  const roleOptions = [
    { id: 'Student', label: 'Student', icon: GraduationCap, desc: 'University, study notes, coursework & study material' },
    { id: 'Software Developer', label: 'Software Engineer', icon: Code2, desc: 'Technical documentation, architecture & READMEs' },
    { id: 'Teacher / Educator', label: 'Teacher / Educator', icon: BookOpen, desc: 'Course material, lecture plans & assessments' },
    { id: 'Researcher / Academic', label: 'Researcher / Academic', icon: Microscope, desc: 'Scientific drafts, formulas, papers & research' },
    { id: 'Technical Writer', label: 'Technical Writer', icon: PenTool, desc: 'Articles, handbooks, guides & publications' },
    { id: 'Other Professional', label: 'Professional / Other', icon: Briefcase, desc: 'Meeting minutes, project briefs & knowledge base' },
  ];

  const ageOptions: Array<{ id: '10-18' | '18-40' | '40+'; label: string; sub: string }> = [
    { id: '10-18', label: '10 – 18', sub: 'School & Student' },
    { id: '18-40', label: '18 – 40', sub: 'Professional & Daily Writer' },
    { id: '40+', label: '40+', sub: 'Senior Professional & Lead' },
  ];

  const focusOptions = [
    { id: 'Daily Notes & Study', label: 'Daily Notes & Study Material', icon: FileText, desc: 'Fast distraction-free note drafting with local auto-save' },
    { id: 'Technical Docs & Code Specs', label: 'Technical Docs & Code Specs', icon: Terminal, desc: 'Code blocks, syntax highlighting, tables & slash commands' },
    { id: 'Blog Posts & Articles', label: 'Blog Posts & Longform Articles', icon: BookOpen, desc: 'Rich typography, outline navigation & multi-format export' },
    { id: 'Presentations & Slides', label: 'Presentations & Slide Decks', icon: Layers, desc: 'Convert structured headers into interactive slide presentations' },
    { id: 'Reports & Research', label: 'Reports & Research Drafts', icon: FileSpreadsheet, desc: 'KaTeX math formulas, citations & structured documents' },
  ];

  // Auto-advance handlers with brief visual feedback
  const handleSelectReferral = (val: string) => {
    setReferralSource(val);
    setTimeout(() => setStep(2), 150);
  };

  const handleSelectRole = (val: string) => {
    setRole(val);
    setTimeout(() => setStep(3), 150);
  };

  const handleSelectAge = (val: '10-18' | '18-40' | '40+') => {
    setAgeGroup(val);
    setTimeout(() => setStep(4), 150);
  };

  const handleSelectFocus = (val: string) => {
    setPrimaryFocus(val);
    setTimeout(() => setStep(5), 150);
  };

  const handleFinish = (mode: 'cloud_sync' | 'offline') => {
    // Save survey response
    telemetryService.recordSurveyResponse({
      referralSource: referralSource || 'GitHub / Web Discovery',
      role: role || 'Other Professional',
      ageGroup: ageGroup || '18-40',
      primaryFocus: primaryFocus || 'Daily Notes & Study',
      mode,
    });

    // Mark onboarding complete in localStorage
    try {
      localStorage.setItem('md_writer_onboarding_completed', 'true');
    } catch {}

    onClose();

    if (mode === 'cloud_sync') {
      onOpenAuth();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md select-none font-sans animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white dark:bg-[#121118] border border-neutral-200/90 dark:border-neutral-800 rounded-2xl shadow-[0_24px_70px_-12px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_90px_-15px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col max-h-[90vh] text-neutral-900 dark:text-neutral-100 font-sans"
        role="dialog"
        aria-modal="true"
        aria-label="Welcome Setup"
      >
        {/* Subtle Violet Top Sheen */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-500/80 to-transparent shrink-0" />

        {/* Window Titlebar Header (Follows App Design Language) */}
        <div className="px-5 py-3.5 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between bg-neutral-50/70 dark:bg-[#181620] shrink-0">
          <div className="flex items-center gap-2.5">
            {/* macOS Window Controls */}
            <div className="flex items-center gap-1.5 mr-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] inline-block shadow-2xs" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] inline-block shadow-2xs" />
            </div>

            {/* Official App Logo & Brand Title */}
            <div className="flex items-center gap-2 pl-1 border-l border-neutral-200/60 dark:border-neutral-800">
              <img 
                src="/logo.png" 
                alt="MD Writer" 
                className="w-5 h-5 rounded-md object-contain shadow-2xs" 
              />
              <span className="font-semibold text-xs sm:text-sm text-neutral-900 dark:text-white tracking-tight">
                MD Writer
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                {APP_VERSION_LABEL}
              </span>
            </div>
          </div>

          {/* Step Pill (No skip button, No close button) */}
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-neutral-200/60 dark:bg-neutral-800 text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-400 border border-neutral-200/80 dark:border-neutral-700/60">
              Step {step} of {totalSteps}
            </span>
          </div>
        </div>

        {/* Dynamic 2px Progress Bar */}
        <div className="w-full h-[2px] bg-neutral-100 dark:bg-neutral-800 shrink-0">
          <div 
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <AnimatePresence mode="wait">
            
            {/* ── STEP 1: Referral Channel ────────────────────────────────────── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                    Where did you hear about MD Writer?
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Select an option below to proceed.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {referralOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = referralSource === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectReferral(opt.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 text-brand-950 dark:text-white ring-1 ring-brand-500/40 shadow-xs'
                            : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/20 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: Role ────────────────────────────────────────────────── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                    What best describes your role?
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Select your primary activity to optimize default editor views.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {roleOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = role === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectRole(opt.id)}
                        className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 text-brand-950 dark:text-white ring-1 ring-brand-500/40 shadow-xs'
                            : 'border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 bg-neutral-50/40 dark:bg-neutral-800/20 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected 
                            ? 'bg-brand-600 text-white' 
                            : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-neutral-900 dark:text-white flex items-center justify-between">
                            <span>{opt.label}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug mt-0.5">
                            {opt.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Age Bracket ─────────────────────────────────────────── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                    Select your age bracket
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Used to fine-tune typography scaling and interface legibility.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  {ageOptions.map((opt) => {
                    const isSelected = ageGroup === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAge(opt.id)}
                        className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'border-brand-500 bg-brand-600 text-white font-bold shadow-sm ring-1 ring-brand-500/40'
                            : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/20 hover:border-neutral-300 dark:hover:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className="text-lg font-bold">{opt.label}</div>
                        <div className={`text-[11px] mt-0.5 leading-snug ${isSelected ? 'text-white/90' : 'text-neutral-500 dark:text-neutral-400'}`}>
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Primary Writing Goal ────────────────────────────────── */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                    What will you write most often?
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Select your primary document type to configure templates.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {focusOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = primaryFocus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectFocus(opt.id)}
                        className={`w-full p-3 px-3.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/40 text-brand-950 dark:text-white ring-1 ring-brand-500/40 shadow-xs'
                            : 'border-neutral-200/80 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/20 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-brand-600 text-white' : 'bg-neutral-200/60 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold text-neutral-900 dark:text-white">{opt.label}</div>
                            <div className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{opt.desc}</div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── STEP 5: Mode Selection (Cloud Sync vs Offline) ─────────────── */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-950 dark:text-white tracking-tight">
                    Workspace Ready: Choose Storage Mode
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Your preferences are recorded. Select how you prefer to store your documents.
                  </p>
                </div>

                {/* Profile Summary Badge */}
                <div className="p-3 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-800 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                      <span>{role || 'Writer'} Profile</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Focus: {primaryFocus || 'Daily Notes'} • Age: {ageGroup} • Source: {referralSource || 'Web'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono font-medium text-[10px] border border-brand-500/20">
                    Ready
                  </span>
                </div>

                {/* Option 1: Cloud Sync (Primary) */}
                <div className="p-3.5 rounded-xl border border-brand-500/50 bg-brand-50/40 dark:bg-brand-950/20 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-950 dark:text-white">
                          Cloud Backup &amp; Device Sync
                        </h4>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-600 text-white">
                          Recommended
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5 leading-relaxed">
                        Protects notes against browser storage resets and enables continuous sync across multiple devices.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFinish('cloud_sync')}
                    className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Enable Cloud Sync &amp; Create Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Option 2: Use Offline (Secondary) */}
                <div className="p-3.5 rounded-xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/40 dark:bg-neutral-800/20 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0">
                      <HardDrive className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 dark:text-white">
                        Use Offline (Local Storage Only)
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                        Start writing immediately with zero signup. Your files remain stored strictly on this device.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFinish('offline')}
                    className="w-full py-2 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200 font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Continue Offline without Account</span>
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Bottom Window Footer (Back button available on Steps 2 to 5) */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between shrink-0 bg-neutral-50/50 dark:bg-[#181620]">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <span className="text-[11px] text-neutral-400">
              Select an option to proceed
            </span>
          )}

          <span className="text-[11px] text-neutral-400 font-mono">
            {step < 5 ? `Auto-advancing on click` : `Select storage mode to begin`}
          </span>
        </div>

      </div>
    </div>
  );
};
