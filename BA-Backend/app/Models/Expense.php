<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'month_record_id',
        'name',
        'value',
    ];

    public function monthRecord()
    {
        return $this->belongsTo(MonthRecord::class);
    }
}