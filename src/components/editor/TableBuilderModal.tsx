import React, { useState } from 'react';
import { 
  Table2, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  X, 
  Check, 
  Columns, 
  Rows 
} from 'lucide-react';

interface TableBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (markdownTable: string) => void;
}

type Alignment = 'left' | 'center' | 'right';

export const TableBuilderModal: React.FC<TableBuilderModalProps> = ({
  isOpen,
  onClose,
  onInsert
}) => {
  const [headers, setHeaders] = useState<string[]>(['Feature', 'Starter', 'Pro Writer']);
  const [alignments, setAlignments] = useState<Alignment[]>(['left', 'center', 'center']);
  const [rows, setRows] = useState<string[][]>([
    ['Offline Storage', 'Unlimited', 'Unlimited'],
    ['Cloud Sync', 'No', 'Yes (Real-time)'],
    ['PDF Export Studio', 'Standard', 'Custom Branded']
  ]);

  if (!isOpen) return null;

  const addColumn = () => {
    const colNumber = headers.length + 1;
    setHeaders([...headers, `Column ${colNumber}`]);
    setAlignments([...alignments, 'left']);
    setRows(rows.map(row => [...row, '']));
  };

  const removeColumn = (colIdx: number) => {
    if (headers.length <= 1) return;
    setHeaders(headers.filter((_, idx) => idx !== colIdx));
    setAlignments(alignments.filter((_, idx) => idx !== colIdx));
    setRows(rows.map(row => row.filter((_, idx) => idx !== colIdx)));
  };

  const addRow = () => {
    const newRow = Array(headers.length).fill('');
    setRows([...rows, newRow]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length <= 1) return;
    setRows(rows.filter((_, idx) => idx !== rowIdx));
  };

  const updateHeader = (index: number, val: string) => {
    const next = [...headers];
    next[index] = val;
    setHeaders(next);
  };

  const updateCell = (rowIdx: number, colIdx: number, val: string) => {
    const next = rows.map((r, rI) => 
      rI === rowIdx ? r.map((c, cI) => (cI === colIdx ? val : c)) : r
    );
    setRows(next);
  };

  const toggleAlignment = (colIdx: number) => {
    const order: Alignment[] = ['left', 'center', 'right'];
    const current = alignments[colIdx] || 'left';
    const nextAlign = order[(order.indexOf(current) + 1) % order.length];
    const next = [...alignments];
    next[colIdx] = nextAlign;
    setAlignments(next);
  };

  // Generate markdown string
  const generateMarkdown = (): string => {
    const headerRow = `| ${headers.map(h => (h.trim() ? h.trim() : ' ')).join(' | ')} |`;
    const delimiterRow = `| ${alignments.map(align => {
      if (align === 'center') return ':---:';
      if (align === 'right') return '---:';
      return ':---';
    }).join(' | ')} |`;
    
    const bodyRows = rows.map(row => {
      return `| ${row.map(cell => (cell.trim() ? cell.trim() : ' ')).join(' | ')} |`;
    }).join('\n');

    return `${headerRow}\n${delimiterRow}\n${bodyRows}\n`;
  };

  const handleInsert = () => {
    const md = generateMarkdown();
    onInsert(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div 
        data-table-builder="true"
        className="w-full max-w-3xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150 font-sans"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shadow-2xs">
              <Table2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-950 dark:text-white">
                Markdown Table Builder
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Design formatted tables without manual pipe formatting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Controls & Grid */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 font-sans">
          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                Dimensions:
              </span>
              <span className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 font-mono text-[11px] border border-neutral-200/60 dark:border-neutral-700/60">
                {rows.length} rows × {headers.length} cols
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={addColumn}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Columns className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>Add Column</span>
              </button>
              <button
                type="button"
                onClick={addRow}
                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Rows className="w-3.5 h-3.5 text-emerald-500" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          {/* Interactive Grid Container */}
          <div className="overflow-x-auto border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-100/70 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800">
                  <th className="p-2.5 w-10 text-center text-neutral-400 font-mono text-[11px]">#</th>
                  {headers.map((h, colIdx) => (
                    <th key={colIdx} className="p-2 min-w-[140px]">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={h}
                            onChange={(e) => updateHeader(colIdx, e.target.value)}
                            placeholder={`Header ${colIdx + 1}`}
                            className="w-full px-2.5 py-1 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                          />
                          {headers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeColumn(colIdx)}
                              className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                              title="Delete column"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {/* Alignment Toggle Button */}
                        <button
                          type="button"
                          onClick={() => toggleAlignment(colIdx)}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center gap-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors cursor-pointer"
                          title="Cycle alignment (left / center / right)"
                        >
                          {alignments[colIdx] === 'left' && <AlignLeft className="w-3 h-3" />}
                          {alignments[colIdx] === 'center' && <AlignCenter className="w-3 h-3" />}
                          {alignments[colIdx] === 'right' && <AlignRight className="w-3 h-3" />}
                          <span className="capitalize">{alignments[colIdx]}</span>
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                    <td className="p-2.5 text-center text-neutral-400 font-mono text-[11px]">
                      {rowIdx + 1}
                    </td>
                    {row.map((cell, colIdx) => (
                      <td key={colIdx} className="p-2">
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                          placeholder="Empty cell..."
                          className={`w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                            alignments[colIdx] === 'center' ? 'text-center' : alignments[colIdx] === 'right' ? 'text-right' : 'text-left'
                          }`}
                        />
                      </td>
                    ))}
                    <td className="p-2 text-center">
                      {rows.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(rowIdx)}
                          className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Live Syntax Preview */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Generated Markdown Output Preview
            </label>
            <pre className="p-3 bg-neutral-900 text-neutral-200 dark:bg-neutral-950 rounded-lg font-mono text-[11px] overflow-x-auto border border-neutral-800">
              {generateMarkdown()}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/40 font-sans">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleInsert}
            className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Insert Table into Document</span>
          </button>
        </div>
      </div>
    </div>
  );
};
