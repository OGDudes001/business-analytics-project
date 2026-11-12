import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { MonthRecord, Expense } from '@/types/analytics';
import Loading from '@/components/common/Loading';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';

interface AddMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MonthRecord) => void;
  existingMonths: string[];
  year: number; // Added year prop so backend knows which year it belongs to
}

const ALL_MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function AddMonthModal({ isOpen, onClose, onSave, existingMonths, year }: AddMonthModalProps) {
  const { showToast } = useToast();
  const availableMonths = ALL_MONTHS.filter(m => !existingMonths.includes(m));
  
  const [selectedMonth, setSelectedMonth] = useState(availableMonths[0] || "");
  const [grossRevenue, setGrossRevenue] = useState<number>(0);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseValue, setExpenseValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddExpenseRow = () => {
    if (!expenseName.trim() || expenseValue <= 0) {
      showToast('error', 'Enter an expense name and an amount greater than zero.');
      return;
    }
    setExpenses([...expenses, { id: Date.now().toString(), name: expenseName, value: expenseValue }]);
    setExpenseName("");
    setExpenseValue(0);
    showToast('success', 'Expense added to this record.');
  };

  const handleRemoveExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
    showToast('info', 'Expense removed from this record.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalExpense = expenses.reduce((sum, item) => sum + item.value, 0);
      const netProfit = grossRevenue - totalExpense;
      const status = grossRevenue > totalExpense && netProfit > 0 ? "Good" : "Bad";

      const payload = {
        year: year,
        month: selectedMonth || availableMonths[0],
        gross_revenue: grossRevenue,
        total_expense: totalExpense,
        net_profit: netProfit,
        status: status,
        expenses: expenses.map(ex => ({ name: ex.name, value: ex.value }))
      };

      // Send to Laravel backend -> Neon Database
      const apiClient = api();
      await apiClient.post('/api/month-records', payload);

      const newRecord: MonthRecord = {
        month: payload.month,
        grossRevenue,
        expenses,
        totalExpense,
        netProfit,
        status,
      };

      onSave(newRecord);
      showToast('success', 'Monthly record added successfully.');
      onClose();
    } catch (err: unknown) {
      showToast('error', getApiErrorMessage(err, 'Failed to save monthly record.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-lg rounded-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-bold text-orange-400">Add This Month Record ({year})</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loading /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                required
              >
                {availableMonths.length === 0 ? (
                  <option value="">All months have records for this year</option>
                ) : (
                  availableMonths.map(m => <option key={m} value={m}>{m}</option>)
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gross Revenue (₱)</label>
              <input 
                type="number" 
                value={grossRevenue} 
                onChange={(e) => setGrossRevenue(Number(e.target.value))}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500"
                required 
              />
            </div>

            <div className="border-t border-gray-700 pt-3">
              <label className="block text-sm font-semibold text-orange-300 mb-2">Operating Expenses</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  placeholder="Expense Name (e.g. Electricity)" 
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm"
                />
                <input 
                  type="number" 
                  placeholder="Value" 
                  value={expenseValue || ""}
                  onChange={(e) => setExpenseValue(Number(e.target.value))}
                  className="w-28 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm"
                />
                <button 
                  type="button" 
                  onClick={handleAddExpenseRow}
                  className="bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {/* List of added expenses */}
              <div className="space-y-2 max-h-36 overflow-y-auto mb-3">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center bg-gray-900 px-3 py-1.5 rounded-lg text-sm border border-gray-700">
                    <span>{exp.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-red-400">₱{exp.value.toLocaleString()}</span>
                      <button type="button" onClick={() => handleRemoveExpense(exp.id)} className="text-gray-400 hover:text-red-500 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm cursor-pointer">Cancel</button>
              <button type="submit" disabled={availableMonths.length === 0} className="px-5 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-semibold cursor-pointer">Submit Record</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}