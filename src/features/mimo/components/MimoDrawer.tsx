import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useMimoStore } from '../stores/useMimoStore';
import { MimoChatMessage } from './MimoChatMessage';
import { MimoApiKeyModal } from './MimoApiKeyModal';
import { MimoPrivacyModal } from './MimoPrivacyModal';
import { MimoDrawerHeader } from './drawer/MimoDrawerHeader';
import { MimoStarterCards } from './drawer/MimoStarterCards';
import { MimoInputDock } from './drawer/MimoInputDock';
import { useMimoChatStream } from '../hooks/useMimoChatStream';
import { useMimoDocumentActions } from '../hooks/useMimoDocumentActions';
import { useMimoInactivityTimer } from '../hooks/useMimoInactivityTimer';

export interface MimoDrawerProps {
  docId: string;
  title: string;
  content: string;
  setContent: (val: string) => void;
  executeSave: (val: string, title: string) => Promise<void> | void;
  onToast: (msg: string) => void;
  isAiExcluded?: boolean;
  cursorLine?: number;
  getSelectedText?: () => string;
  onInsertSnippet?: (snippet: string) => void;
}

export const MimoDrawer: React.FC<MimoDrawerProps> = ({
  docId,
  title,
  content,
  setContent,
  executeSave,
  onToast,
  isAiExcluded = false,
  cursorLine = 1,
  getSelectedText,
  onInsertSnippet,
}) => {
  const isOpen = useMimoStore((s) => s.isOpen);
  const setIsOpen = useMimoStore((s) => s.setIsOpen);
  const syncActiveDocument = useMimoStore((s) => s.syncActiveDocument);
  const messages = useMimoStore((s) => s.messages);
  const clearMessages = useMimoStore((s) => s.clearMessages);
  const mascotState = useMimoStore((s) => s.mascotState);
  const activeActivity = useMimoStore((s) => s.activeActivity);
  const isKeyModalOpen = useMimoStore((s) => s.isKeyModalOpen);
  const setIsKeyModalOpen = useMimoStore((s) => s.setIsKeyModalOpen);
  const isPrivacyModalOpen = useMimoStore((s) => s.isPrivacyModalOpen);
  const setIsPrivacyModalOpen = useMimoStore((s) => s.setIsPrivacyModalOpen);
  const acceptPrivacyNotice = useMimoStore((s) => s.acceptPrivacyNotice);
  const thinkingLevel = useMimoStore((s) => s.thinkingLevel);
  const setThinkingLevel = useMimoStore((s) => s.setThinkingLevel);
  const selectedModel = useMimoStore((s) => s.selectedModel) || 'gemini-3.5-flash-lite';
  const setSelectedModel = useMimoStore((s) => s.setSelectedModel);
  const touchMimoActivity = useMimoStore((s) => s.touchMimoActivity);

  // Manage 30-second idle inactivity timer when drawer is open
  useMimoInactivityTimer();

  const [inputPrompt, setInputPrompt] = useState('');
  const [activeSelection, setActiveSelection] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync active document & restore per-document persistent chat history
  useEffect(() => {
    if (docId) {
      syncActiveDocument(docId, title || 'Untitled Document');
    }
  }, [docId, title, syncActiveDocument]);

  // Sync active selection whenever Mimo is opened or focused (guarded against re-render loop)
  useEffect(() => {
    if (isOpen && getSelectedText) {
      const sel = getSelectedText();
      const trimmed = sel ? sel.trim() : '';
      if (trimmed.length > 0) {
        setActiveSelection((prev) => (prev !== trimmed ? trimmed : prev));
      }
    }
  }, [isOpen, getSelectedText]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeActivity]);

  // Encapsulated document actions (apply diff, tool calls, undo)
  const {
    handleApplyDiff,
    handleDiscardDiff,
    handleInsertSnippet,
    handleApplyToolCall,
    handleDiscardToolCall,
    handleUndoToolCall,
  } = useMimoDocumentActions({
    content,
    setContent,
    executeSave,
    title,
    onToast,
    onInsertSnippet,
  });

  // Encapsulated streaming lifecycle & abort handling
  const { isGenerating, handleSendPrompt, handleStop } = useMimoChatStream({
    docId,
    title,
    content,
    cursorLine,
    isAiExcluded,
    onToast,
    getSelectedText,
    activeSelection,
    inputPrompt,
    setInputPrompt,
  });

  const handleClarificationSubmit = (formattedPrompt: string, messageId: string, answers: any) => {
    // Mark the message clarification as submitted with the chosen answers
    useMimoStore.getState().updateLastMessage((m) =>
      m.id === messageId && m.clarification
        ? { ...m, clarification: { ...m.clarification, isSubmitted: true, answers } }
        : m
    );
    // Submit the formatted clarification answers to trigger the final output
    handleSendPrompt(formattedPrompt);
  };

  if (!isOpen) return null;

  const isChatEmpty = messages.filter((m) => m.role === 'user').length === 0;

  return (
    <>
      <div
        onMouseMove={touchMimoActivity}
        onClick={touchMimoActivity}
        className="fixed inset-y-0 right-0 z-40 w-full sm:w-[460px] md:w-[490px] bg-white dark:bg-neutral-950 border-l border-neutral-200/80 dark:border-neutral-800/80 shadow-2xl flex flex-col font-sans select-text"
      >
        {/* Header */}
        <MimoDrawerHeader
          title={title}
          mascotState={mascotState}
          onClearMessages={clearMessages}
          onClose={() => setIsOpen(false)}
        />

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isAiExcluded && (
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-neutral-900 dark:text-neutral-100">AI scanning excluded</div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  Content is private and excluded from AI requests. Re-enable in Document Sidebar &gt; Info.
                </p>
              </div>
            </div>
          )}

          {isChatEmpty ? (
            <MimoStarterCards
              title={title}
              docContent={content}
              mascotState={mascotState}
              isGenerating={isGenerating}
              isAiExcluded={isAiExcluded}
              onSendPrompt={handleSendPrompt}
            />
          ) : (
            messages.map((msg) => (
              <MimoChatMessage
                key={msg.id}
                message={msg}
                onApplyDiff={handleApplyDiff}
                onDiscardDiff={handleDiscardDiff}
                onInsertSnippet={handleInsertSnippet}
                onApplyToolCall={handleApplyToolCall}
                onDiscardToolCall={handleDiscardToolCall}
                onUndoToolCall={handleUndoToolCall}
                onSubmitClarification={handleClarificationSubmit}
              />
            ))
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Dock */}
        <MimoInputDock
          docId={docId}
          docContent={content}
          inputPrompt={inputPrompt}
          setInputPrompt={setInputPrompt}
          activeSelection={activeSelection}
          setActiveSelection={setActiveSelection}
          isGenerating={isGenerating}
          isAiExcluded={isAiExcluded}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          thinkingLevel={thinkingLevel}
          setThinkingLevel={setThinkingLevel}
          onSend={handleSendPrompt}
          onStop={handleStop}
          onFocusTextarea={() => {
            if (getSelectedText && !activeSelection) {
              const sel = getSelectedText();
              if (sel && sel.trim().length > 0) {
                setActiveSelection(sel.trim());
              }
            }
          }}
        />
      </div>

      {/* BYOK Gemini API Key Modal */}
      <MimoApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />

      {/* First-Use Privacy & Offline Transparency Modal */}
      <MimoPrivacyModal
        isOpen={isPrivacyModalOpen}
        onAccept={acceptPrivacyNotice}
        onOpenByok={() => {
          setIsPrivacyModalOpen(false);
          setIsKeyModalOpen(true);
        }}
        onDecline={() => {
          setIsPrivacyModalOpen(false);
          setIsOpen(false);
        }}
      />
    </>
  );
};
