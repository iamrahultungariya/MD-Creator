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
      onToast('Applied proposed changes');
    } else {
      onToast('Could not automatically apply diff.');
    }
  };

  const handleDiscard = () => {
    discardActiveDiff();
    onToast('Discarded proposed changes.');
  };

  return (
    <div className="w-full bg-neutral-950 text-neutral-100 border-b border-neutral-800 px-4 py-2 flex items-center justify-between text-xs font-sans shadow-md">
      <div className="flex items-center gap-2.5">
        <div className="p-1 rounded-md bg-neutral-800 text-neutral-300">
          <GitPullRequest className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium text-neutral-200">Proposed modifications:</span>
          <span className="font-mono text-emerald-400 font-semibold">+{additions}</span>
          <span className="font-mono text-rose-400 font-semibold">-{deletions}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(true)}
          className="text-neutral-400 hover:text-white px-2 py-1 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>Open Chat</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>

        <button
          onClick={handleDiscard}
          className="px-2.5 py-1 rounded-md border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Discard
        </button>

        <button
          onClick={handleAccept}
          className="px-3 py-1 rounded-md bg-white text-neutral-950 hover:bg-neutral-100 text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <Check className="w-3.5 h-3.5" />
          Apply
        </button>
      </div>
    </div>
  );
};
