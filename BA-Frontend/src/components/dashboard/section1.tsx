import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Plus, ArrowUp, ArrowDown } from 'lucide-react';
import AddMonthModal from '@/components/modals/AddMonthModal';
import ViewMonthModal from '@/components/modals/ViewMonthModal';
import EditMonthModal from '@/components/modals/EditMonthModal';
import Loading from '@/components/common/Loading';
import api from '@/lib/axios';
import { getApiErrorMessage } from '@/lib/errors';
import { useToast } from '@/context/ToastContext';
import type { Expense, PersistedMonthRecord } from '@/types/analytics';

interface ApiMonthRecord {
  id: number;
  year: number;
  month: string;
  gross_revenue: string | number;
  total_expense: string | number;
  net_profit: string | number;
  status: 'Good' | 'Bad';
  expenses: Array<{
    id: number;
    name: string;
    value: string | number;
  }>;
}

const MONTH_ORDER = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

function mapMonthRecords(data: ApiMonthRecord[], fallbackYear: number): Record<number, PersistedMonthRecord[]> {
  const grouped: Record<number, PersistedMonthRecord[]> = {};

  data.forEach((item) => {
    const year = item.year || fallbackYear;
    if (!grouped[year]) grouped[year] = [];
    grouped[year].push({
      id: item.id,
      month: item.month,
      grossRevenue: Number(item.gross_revenue),
      totalExpense: Number(item.total_expense),
      netProfit: Number(item.net_profit),
      status: item.status,
      expenses: item.expenses.map((expense): Expense => ({
        id: expense.id.toString(),
        name: expense.name,
        value: Number(expense.value),
      })),
    });
  });

  return grouped;
}

export default function Section1() {
  const { showToast } = useToast();
  const currentActualYear = 2026;
  const [currentYear, setCurrentYear] = useState<number>(currentActualYear);
  const [isEditingYearInput, setIsEditingYearInput] = useState(false);
  const [yearInputVal, setYearInputVal] = useState(currentYear.toString());
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(false);

  const [recordsByYear, setRecordsByYear] = useState<Record<number, PersistedMonthRecord[]>>({});

  const fetchRecords = useCallback(async () => {
    try {
      const response = await api().get<ApiMonthRecord[]>('/api/month-records');
      setRecordsByYear(mapMonthRecords(response.data, currentActualYear));
    } catch (err) {
      showToast('error', getApiErrorMessage(err, 'Could not load monthly records.'));
    }
  }, [currentActualYear, showToast]);

  useEffect(() => {
    let active = true;
    api().get<ApiMonthRecord[]>('/api/month-records')
      .then(({ data }) => {
        if (!active) return;
        setRecordsByYear(mapMonthRecords(data, currentActualYear));
      })
      .catch((error: unknown) => {
        if (active) showToast('error', getApiErrorMessage(error, 'Could not load monthly records.'));
      });

    return () => {
      active = false;
    };
  }, [currentActualYear, showToast]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PersistedMonthRecord | null>(null);

  const currentYearRecords = recordsByYear[currentYear] || [];

  const totalAnnualRevenue = currentYearRecords.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const totalOperatingExpense = currentYearRecords.reduce((acc, curr) => acc + curr.totalExpense, 0);
  const totalNetProfit = totalAnnualRevenue - totalOperatingExpense;
  
  const annualBusinessStatus = 
    totalAnnualRevenue > totalOperatingExpense && totalNetProfit > 0 ? "Good" : "Bad";

  const sortedRecords = [...currentYearRecords].sort((a, b) => {
    const indexA = MONTH_ORDER.indexOf(a.month);
    const indexB = MONTH_ORDER.indexOf(b.month);
    return sortOrder === 'asc' ? indexA - indexB : indexB - indexA;
  });

  const handlePrevYear = () => {
    setIsLoading(true);
    setCurrentYear(prev => prev - 1);
    setTimeout(() => setIsLoading(false), 300);
  };

  const handleNextYear = () => {
    if (currentYear < currentActualYear) {
      setIsLoading(true);
      setCurrentYear(prev => prev + 1);
      setTimeout(() => setIsLoading(false), 300);
    }
  };

  const handleYearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(yearInputVal, 10);
    if (!isNaN(parsed) && parsed > 1900 && parsed <= currentActualYear) {
      setIsLoading(true);
      setCurrentYear(parsed);
      setTimeout(() => setIsLoading(false), 300);
    } else {
      showToast('error', `Enter a year between 1901 and ${currentActualYear}.`);
      setYearInputVal(currentYear.toString());
    }
    setIsEditingYearInput(false);
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <section className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Year Pagination */}
      <div className="flex items-center justify-center gap-4 py-2">
        <button onClick={handlePrevYear} className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white transition border border-gray-700 cursor-pointer">
          <ChevronLeft className="w-6 h-6" />
        </button>

        {isEditingYearInput ? (
          <form onSubmit={handleYearSubmit}>
            <input 
              type="number"
              max={currentActualYear}
              value={yearInputVal}
              onChange={(e) => setYearInputVal(e.target.value)}
              onBlur={handleYearSubmit}
              autoFocus
              className="w-24 text-center text-2xl font-bold bg-gray-800 text-orange-400 border border-orange-500 rounded-lg px-2 py-1 focus:outline-none"
            />
          </form>
        ) : (
          <span onClick={() => { setYearInputVal(currentYear.toString()); setIsEditingYearInput(true); }} className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-orange-500 transition px-4 py-1 rounded-lg hover:bg-gray-200">
            {currentYear}
          </span>
        )}

        <button onClick={handleNextYear} disabled={currentYear >= currentActualYear} className={`p-2 rounded-full transition border ${currentYear >= currentActualYear ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700 cursor-pointer'}`}>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Annual Record Card */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-xl font-bold text-orange-400 mb-4 border-b border-gray-700 pb-2">Annual Record ({currentYear})</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Annual Revenue</p>
            <p className="text-2xl font-bold text-green-400 mt-1">₱{totalAnnualRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Operating Expense</p>
            <p className="text-2xl font-bold text-red-400 mt-1">₱{totalOperatingExpense.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Net Profit</p>
            <p className={`text-2xl font-bold mt-1 ${totalNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>₱{totalNetProfit.toLocaleString()}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col justify-between">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Business Status</p>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold mt-1 ${annualBusinessStatus === 'Good' ? 'bg-green-900/80 text-green-300 border border-green-600' : 'bg-red-900/80 text-red-300 border border-red-600'}`}>
                {annualBusinessStatus}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Records Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-bold text-gray-900">Monthly Records</h3>
          <button onClick={() => { setIsAddOpen(true); showToast('info', 'Add a monthly business record.'); }} className="flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition cursor-pointer">
            <Plus className="w-4 h-4" /> Add This Month Record
          </button>
        </div>

        <div className="flex items-center gap-2 bg-white border border-gray-300 px-3 py-1.5 rounded-xl shadow-sm">
          <span className="text-sm font-semibold text-gray-700">Filter:</span>
          <button onClick={() => setSortOrder('asc')} className={`p-1.5 rounded-lg text-sm font-bold flex items-center transition cursor-pointer ${sortOrder === 'asc' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} title="Sort Jan to Dec">
            <ArrowUp className="w-4 h-4" />
          </button>
          <button onClick={() => setSortOrder('desc')} className={`p-1.5 rounded-lg text-sm font-bold flex items-center transition cursor-pointer ${sortOrder === 'desc' ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`} title="Sort Dec to Jan">
            <ArrowDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Month Cards List */}
      <div className="space-y-4">
        {sortedRecords.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 shadow-sm">
            No monthly records added for {currentYear} yet. Click <strong>"+ Add This Month Record"</strong> to get started!
          </div>
        ) : (
          sortedRecords.map((rec) => (
            <div key={rec.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-2 flex-1">
                <h4 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-1">{rec.month}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs">Gross Revenue:</span>
                    <span className="font-bold text-gray-900">₱{rec.grossRevenue.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Total Expense:</span>
                    <span className="font-bold text-gray-900">₱{rec.totalExpense.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Net Profit:</span>
                    <span className={`font-bold ${rec.netProfit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>₱{rec.netProfit.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs">Status:</span>
                    <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold mt-0.5 ${rec.status === 'Good' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {rec.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto justify-end border-t lg:border-t-0 border-gray-100 pt-3 lg:pt-0">
                <button onClick={() => { setSelectedRecord(rec); setIsEditOpen(true); showToast('info', `Editing the ${rec.month} record.`); }} className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-full transition cursor-pointer">
                  Edit
                </button>
                <button onClick={() => { setSelectedRecord(rec); setIsViewOpen(true); showToast('info', `Viewing the ${rec.month} record.`); }} className="px-4 py-1.5 border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-full transition cursor-pointer">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <AddMonthModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSave={fetchRecords}
        existingMonths={currentYearRecords.map(r => r.month)}
        year={currentYear}
      />

      <ViewMonthModal
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        record={selectedRecord}
        year={currentYear}
      />

      {selectedRecord && (
        <EditMonthModal
          key={`${selectedRecord.id}-${isEditOpen}`}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          record={selectedRecord}
          year={currentYear}
          onSave={fetchRecords}
        />
      )}

    </section>
  );
}