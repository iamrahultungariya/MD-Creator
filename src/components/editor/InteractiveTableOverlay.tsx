import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Copy, 
  Check,
  Edit3
} from 'lucide-react';
import { 
  ParsedTable, 
  addRowToTable, 
  removeRowFromTable, 
  addColumnToTable, 
  removeColumnFromTable, 
  updateTableCell, 
  cycleColumnAlignment,
  serializeMarkdownTable
} from '../../utils/markdownTable';

interface InteractiveTableOverlayProps {
  table: ParsedTable;
  onTableChange?: (updated: ParsedTable) => void;
  className?: string;
  isEditable?: boolean;
}

export const InteractiveTableOverlay: React.FC<InteractiveTableOverlayProps> = ({
  table,
  onTableChange,
  className = '',
  isEditable = true,
}) => {
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const [cellDraft, setCellDraft] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleStartEdit = (r: number, c: number, currentVal: string) => {
    if (!isEditable || !onTableChange) return;
    setEditingCell({ r, c });
    setCellDraft(currentVal);
  };

  const handleSaveCell = () => {
    if (!editingCell || !onTableChange) return;
    const { r, c } = editingCell;
    const updated = updateTableCell(table, r, c, cellDraft);
    onTableChange(updated);
    setEditingCell(null);
  };

  const handleCellKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveCell();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleSaveCell();
      if (!editingCell) return;
      const { r, c } = editingCell;
      const totalCols = table.headers.length;
      const totalRows = table.rows.length;
      if (e.shiftKey) {
        // Prev cell
        if (c > 0) {
          handleStartEdit(r, c - 1, r === -1 ? table.headers[c - 1] : table.rows[r][c - 1] || '');
        } else if (r > -1) {
          handleStartEdit(r - 1, totalCols - 1, r - 1 === -1 ? table.headers[totalCols - 1] : table.rows[r - 1][totalCols - 1] || '');
        }
      } else {
        // Next cell
        if (c < totalCols - 1) {
          handleStartEdit(r, c + 1, r === -1 ? table.headers[c + 1] : table.rows[r][c + 1] || '');
        } else if (r < totalRows - 1) {
          handleStartEdit(r + 1, 0, table.rows[r + 1][0] || '');
        }
      }
    }
  };

  const handleAddRow = () => {
    if (!onTableChange) return;
    onTableChange(addRowToTable(table));
  };

  const handleAddColumn = () => {
    if (!onTableChange) return;
    onTableChange(addColumnToTable(table));
  };

  const handleRemoveRow = () => {
    if (!onTableChange || table.rows.length <= 1) return;
    onTableChange(removeRowFromTable(table, table.rows.length - 1));
  };

  const handleRemoveCol = () => {
    if (!onTableChange || table.headers.length <= 1) return;
    onTableChange(removeColumnFromTable(table, table.headers.length - 1));
  };

  const handleCycleAlign = (colIdx: number) => {
    if (!onTableChange) return;
    onTableChange(cycleColumnAlignment(table, colIdx));
  };

  const handleCopyMarkdown = () => {
    const raw = serializeMarkdownTable(table);
    navigator.clipboard.writeText(raw);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  const getAlignClass = (align: string) => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group/table relative my-5 max-w-full ${className}`}
    >
      {/* Floating Notion-style Quick Table Action Toolbar */}
      {isEditable && onTableChange && (
        <div 
          className={`absolute -top-3.5 right-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-900/90 dark:bg-neutral-800/90 backdrop-blur-md text-white text-[11px] shadow-lg border border-neutral-700/60 transition-all duration-150 select-none ${
            isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleAddRow}
            className="hover:text-emerald-400 px-1 py-0.5 flex items-center gap-0.5 cursor-pointer font-medium"
            title="Add a new row at the bottom"
          >
            <Plus className="w-3 h-3" />
            <span>Row</span>
          </button>
          <span className="text-neutral-600">|</span>
          <button
            type="button"
            onClick={handleAddColumn}
            className="hover:text-emerald-400 px-1 py-0.5 flex items-center gap-0.5 cursor-pointer font-medium"
            title="Add a new column on the right"
          >
            <Plus className="w-3 h-3" />
            <span>Col</span>
          </button>
          {table.rows.length > 1 && (
            <>
              <span className="text-neutral-600">|</span>
              <button
                type="button"
                onClick={handleRemoveRow}
                className="hover:text-rose-400 px-1 py-0.5 flex items-center gap-0.5 cursor-pointer font-medium"
                title="Delete the bottom row"
              >
                <Trash2 className="w-3 h-3" />
                <span>Row</span>
              </button>
            </>
          )}
          {table.headers.length > 1 && (
            <>
              <span className="text-neutral-600">|</span>
              <button
                type="button"
                onClick={handleRemoveCol}
                className="hover:text-rose-400 px-1 py-0.5 flex items-center gap-0.5 cursor-pointer font-medium"
                title="Delete the rightmost column"
              >
                <Trash2 className="w-3 h-3" />
                <span>Col</span>
              </button>
            </>
          )}
          <span className="text-neutral-600">|</span>
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="hover:text-blue-400 px-1 py-0.5 flex items-center gap-0.5 cursor-pointer"
            title="Copy table as Markdown"
          >
            {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )}

      {/* Rendered Table Canvas */}
      <div className="overflow-x-auto rounded-xl border border-current/20 shadow-2xs max-w-full">
        <table className="min-w-full w-max text-left text-xs divide-y divide-current/15">
          {/* Table Header */}
          <thead className="bg-current/[0.04] text-inherit font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              {table.headers.map((header, cIdx) => {
                const isEditing = editingCell?.r === -1 && editingCell?.c === cIdx;
                const align = table.alignments[cIdx] || 'none';
                return (
                  <th 
                    key={`th_${cIdx}`}
                    className={`px-4 py-2.5 font-bold border-b border-current/20 whitespace-nowrap text-inherit relative group/th ${getAlignClass(align)}`}
                  >
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={cellDraft}
                        onChange={(e) => setCellDraft(e.target.value)}
                        onBlur={handleSaveCell}
                        onKeyDown={handleCellKeyDown}
                        className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-1.5 py-0.5 rounded border border-blue-500 font-bold text-[10px] w-full focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          onClick={() => handleStartEdit(-1, cIdx, header)}
                          className="cursor-pointer hover:underline decoration-dashed"
                          title="Click to rename header"
                        >
                          {header}
                        </span>
                        {isEditable && onTableChange && (
                          <button
                            type="button"
                            onClick={() => handleCycleAlign(cIdx)}
                            className="opacity-0 group-hover/th:opacity-80 hover:opacity-100 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5 rounded cursor-pointer"
                            title={`Alignment: ${align} (click to cycle)`}
                          >
                            {align === 'center' ? (
                              <AlignCenter className="w-3 h-3" />
                            ) : align === 'right' ? (
                              <AlignRight className="w-3 h-3" />
                            ) : (
                              <AlignLeft className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-current/10">
            {table.rows.map((row, rIdx) => (
              <tr key={`tr_${rIdx}`} className="hover:bg-current/[0.02] transition-colors">
                {row.map((cell, cIdx) => {
                  const isEditing = editingCell?.r === rIdx && editingCell?.c === cIdx;
                  const align = table.alignments[cIdx] || 'none';
                  return (
                    <td 
                      key={`td_${rIdx}_${cIdx}`}
                      onClick={() => !isEditing && handleStartEdit(rIdx, cIdx, cell)}
                      className={`px-4 py-2 text-inherit/90 whitespace-pre-wrap cursor-pointer relative group/td ${getAlignClass(align)}`}
                      title="Click to edit cell"
                    >
                      {isEditing ? (
                        <input
                          type="text"
                          autoFocus
                          value={cellDraft}
                          onChange={(e) => setCellDraft(e.target.value)}
                          onBlur={handleSaveCell}
                          onKeyDown={handleCellKeyDown}
                          className="bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white px-1.5 py-0.5 rounded border border-blue-500 text-xs w-full focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-1 min-h-[1.5rem]">
                          <span>{cell || <span className="opacity-30 italic text-[11px]">&lt;empty&gt;</span>}</span>
                          {isEditable && onTableChange && (
                            <Edit3 className="w-2.5 h-2.5 opacity-0 group-hover/td:opacity-40 text-neutral-400 shrink-0" />
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
