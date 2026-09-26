import { useState } from 'react';

export function useEditorModals() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = useState(false);
  const [isTableBuilderOpen, setIsTableBuilderOpen] = useState(false);
  const [isOutlineOpen, setIsOutlineOpen] = useState(false);
  const [isUpdatesOpen, setIsUpdatesOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const [isToolsMenuOpen, setIsToolsMenuOpen] = useState(false);
  const [isSprintPopoverOpen, setIsSprintPopoverOpen] = useState(false);
  const [isMathStudioOpen, setIsMathStudioOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isLocalFolderOpen, setIsLocalFolderOpen] = useState(false);

  return {
    isDrawerOpen,
    setIsDrawerOpen,
    isSwitcherOpen,
    setIsSwitcherOpen,
    isExportMenuOpen,
    setIsExportMenuOpen,
    isExportModalOpen,
    setIsExportModalOpen,
    isPdfStudioOpen,
    setIsPdfStudioOpen,
    isTableBuilderOpen,
    setIsTableBuilderOpen,
    isOutlineOpen,
    setIsOutlineOpen,
    isUpdatesOpen,
    setIsUpdatesOpen,
    isTemplatesOpen,
    setIsTemplatesOpen,
    isRevisionsOpen,
    setIsRevisionsOpen,
    isToolsMenuOpen,
    setIsToolsMenuOpen,
    isSprintPopoverOpen,
    setIsSprintPopoverOpen,
    isMathStudioOpen,
    setIsMathStudioOpen,
    isImageModalOpen,
    setIsImageModalOpen,
    isPublishModalOpen,
    setIsPublishModalOpen,
    isLocalFolderOpen,
    setIsLocalFolderOpen,
  };
}
