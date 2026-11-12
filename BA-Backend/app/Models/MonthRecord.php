<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonthRecord extends Model
{
    use HasFactory;

    protected $fillable = [
    'business_id',
    'year', // <-- Add this line here too
    'month',
    'gross_revenue',
    'total_expense',
    'net_profit',
    'status',
    ];

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}