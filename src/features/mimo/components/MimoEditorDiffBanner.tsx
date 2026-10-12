import React from 'react';
import { GitPullRequest, Check, X, ArrowUpRight } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';
import { computeLineDiff } from '../services/diffService';

interface MimoEditorDiffBannerProps {
  content: string;
  setContent: (val: string) => void;
  executeSave: (val: string, title: string) => Promise<void> | void;
  title: string;
  onToast: (msg: string) => void;
}

export const MimoEditorDiffBanner: React.FC<MimoEditorDiffBannerProps> = ({
  content,
  setContent,
  executeSave,
  title,
  onToast,
}) => {
  const activeDiffHunk = useMimoStore((s) => s.activeDiffHunk);
  const applyActiveDiff = useMimoStore((s) => s.applyActiveDiff);
  const discardActiveDiff = useMimoStore((s) => s.discardActiveDiff);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);

  if (!activeDiffHunk || activeDiffHunk.isApplied || activeDiffHunk.isDiscarded) {
    return null;
  }

  const { additions, deletions } = computeLineDiff(
    activeDiffHunk.originalLines,
    activeDiffHunk.proposedLines
  );

  const handleAccept = () => {
    const res = applyActiveDiff(content);
    if (res.success) {
      setContent(res.nextContent);
      executeSave(res.nextContent, title);
      onToast('✨ Accepted and applied Mimo changes!');
    } else {
      onToast('Could not automatically apply diff.');
    }
  };

  const handleDiscard = () => {
    discardActiveDiff();
    onToast('Discarded Mimo changes.');
  };

  return (
    <div className="w-full bg-violet-950 text-white border-b border-violet-800 px-4 py-2 flex items-center justify-between text-xs font-sans shadow-md animate-in slide-in-from-top-2 duration-150">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-md bg-violet-800/80 text-violet-200">
          <GitPullRequest className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-violet-100">Mimo Proposed Changes:</span>
          <span className="font-mono text-emerald-400 font-bold">+{additions}</span>
          <span className="font-mono text-rose-400 font-bold">-{deletions}</span>
          <span className="text-violet-300 text-[11px] hidden sm:inline">
            (Reviewing modified lines)
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="text-violet-300 hover:text-white px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Open Chat</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <button
          onClick={handleDiscard}
          className="px-2.5 py-1 rounded-lg border border-violet-700 bg-violet-900/60 hover:bg-violet-800 text-violet-200 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Discard
        </button>

        <button
          onClick={handleAccept}
          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
        >
          <Check className="w-3.5 h-3.5" />
          Accept Changes
        </button>
      </div>
    </div>
  );
};
