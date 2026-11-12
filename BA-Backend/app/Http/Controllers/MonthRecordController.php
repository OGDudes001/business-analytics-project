<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MonthRecord;
use App\Models\Expense;
use Illuminate\Support\Facades\DB;

class MonthRecordController extends Controller
{


    public function store(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer',
            'month' => 'required|string',
            'gross_revenue' => 'required|numeric',
            'total_expense' => 'required|numeric',
            'net_profit' => 'required|numeric',
            'status' => 'required|string',
            'expenses' => 'array',
        ]);

        $user = $request->user();
        $business = $user->business;

        if (!$business) {
            return response()->json(['message' => 'No business found for this user.'], 404);
        }

        // Check if a record for this month and year already exists
        $existing = MonthRecord::where('business_id', $business->id)
            ->where('year', $request->year)
            ->where('month', $request->month)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'A record for this month already exists.'], 422);
        }

        $monthRecord = MonthRecord::create([
            'business_id' => $business->id,
            'year' => $request->year,
            'month' => $request->month,
            'gross_revenue' => $request->gross_revenue,
            'total_expense' => $request->total_expense,
            'net_profit' => $request->net_profit,
            'status' => $request->status,
        ]);

        if ($request->has('expenses')) {
            foreach ($request->expenses as $exp) {
                Expense::create([
                    'month_record_id' => $monthRecord->id,
                    'name' => $exp['name'],
                    'value' => $exp['value'],
                ]);
            }
        }

        return response()->json([
            'message' => 'Month record saved securely!',
            'record' => $monthRecord->load('expenses')
        ], 201);
    }

    public function index(Request $request)
    {
        $business = $request->user()->business;

        if (!$business) {
            return response()->json([], 200);
        }

        // Fetch records along with their individual expenses
        $records = MonthRecord::with('expenses')
            ->where('business_id', $business->id)
            ->get();

        return response()->json($records, 200);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'gross_revenue' => 'required|numeric',
            'total_expense' => 'required|numeric',
            'net_profit' => 'required|numeric',
            'status' => 'required|string',
            'expenses' => 'array',
        ]);

        $business = $request->user()->business;
        abort_unless($business, 404, 'No business found for this user.');

        $monthRecord = $business->monthRecords()->findOrFail($id);

        DB::transaction(function () use ($monthRecord, $validated): void {
            $monthRecord->update([
                'gross_revenue' => $validated['gross_revenue'],
                'total_expense' => $validated['total_expense'],
                'net_profit' => $validated['net_profit'],
                'status' => $validated['status'],
            ]);

            $monthRecord->expenses()->delete();
            foreach ($validated['expenses'] ?? [] as $exp) {
                Expense::create([
                    'month_record_id' => $monthRecord->id,
                    'name' => $exp['name'],
                    'value' => $exp['value'],
                ]);
            }
        });

        return response()->json([
            'message' => 'Month record updated successfully!',
            'record' => $monthRecord->load('expenses')
        ], 200);
    }

    


}