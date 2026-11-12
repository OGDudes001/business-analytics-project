export interface Expense {
  id: string;
  name: string;
  value: number;
}

export interface MonthRecord {
  month: string; // e.g., "January", "February"
  grossRevenue: number;
  expenses: Expense[];
  totalExpense: number;
  netProfit: number;
  status: "Good" | "Bad";
}

export interface PersistedMonthRecord extends MonthRecord {
  id: number;
}

export interface YearData {
  year: number;
  months: MonthRecord[];
}