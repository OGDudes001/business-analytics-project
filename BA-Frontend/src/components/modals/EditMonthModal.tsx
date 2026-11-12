import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { Expense, PersistedMonthRecord } from '@/types/analytics';
import Loading from '@/components/common/Loading';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';

interface EditMonthModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: PersistedMonthRecord;
  year: number;
  onSave: () => void;
}

export default function EditMonthModal({ isOpen, onClose, record, year, onSave }: EditMonthModalProps) {
  const { showToast } = useToast();
  const [grossRevenue, setGrossRevenue] = useState<number>(() => record.grossRevenue);
  const [expenses, setExpenses] = useState<Expense[]>(() => [...record.expenses]);
  const [expenseName, setExpenseName] = useState("");
  const [expenseValue, setExpenseValue] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddExpense = () => {
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
        gross_revenue: grossRevenue,
        total_expense: totalExpense,
        net_profit: netProfit,
        status: status,
        expenses: expenses.map(ex => ({ name: ex.name, value: ex.value }))
      };

      const apiClient = api();
      await apiClient.put(`/api/month-records/${record.id}`, payload);

      onSave();
      showToast('success', 'Monthly record updated successfully.');
      onClose();
    } catch (err: unknown) {
      showToast('error', getApiErrorMessage(err, 'Failed to update monthly record.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-gray-800 border border-gray-700 w-full max-w-lg rounded-2xl p-6 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-bold text-orange-400">Edit {record.month} {year} Record</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Loading /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Year (Locked)</label>
              <input type="text" value={year} disabled className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Gross Revenue (₱)</label>
              <input type="number" value={grossRevenue} onChange={(e) => setGrossRevenue(Number(e.target.value))} className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-orange-500" required />
            </div>

            <div className="border-t border-gray-700 pt-3">
              <label className="block text-sm font-semibold text-orange-300 mb-2">Edit Expenses</label>
              <div className="flex gap-2 mb-2">
                <input type="text" placeholder="Expense Name" value={expenseName} onChange={(e) => setExpenseName(e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm" />
                <input type="number" placeholder="Value" value={expenseValue || ""} onChange={(e) => setExpenseValue(Number(e.target.value))} className="w-28 px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm" />
                <button type="button" onClick={handleAddExpense} className="bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1 cursor-pointer">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

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
              <button type="submit" className="px-5 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm font-semibold cursor-pointer">Save Changes</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}