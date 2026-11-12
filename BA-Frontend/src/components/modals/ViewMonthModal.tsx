import { X } from 'lucide-react';
import type { MonthRecord } from '@/types/analytics';

interface ViewMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MonthRecord | null;
  year: number;
}

export default function ViewMonthModal({ isOpen, onClose, record, year }: ViewMonthModalProps) {
  if (!isOpen || !record) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-2xl p-6 text-white shadow-2xl">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-bold text-orange-400">{record.month} {year} Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-900 p-3 rounded-lg border border-gray-700 flex justify-between">
            <span className="text-gray-400">Gross Revenue:</span>
            <span className="font-bold text-green-400">₱{record.grossRevenue.toLocaleString()}</span>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Expenses Breakdown:</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {record.expenses.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No individual expenses logged.</p>
              ) : (
                record.expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between bg-gray-900 px-3 py-1.5 rounded-lg text-sm border border-gray-700">
                    <span>{exp.name}</span>
                    <span className="text-red-400 font-medium">₱{exp.value.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-gray-700 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Expense:</span>
              <span className="font-bold text-red-400">₱{record.totalExpense.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Net Profit:</span>
              <span className={`font-bold ${record.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ₱{record.netProfit.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm items-center">
              <span className="text-gray-400">Status:</span>
              <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${record.status === 'Good' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {record.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold">Close</button>
        </div>
      </div>
    </div>
  );
}