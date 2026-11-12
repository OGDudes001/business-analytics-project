<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Business extends Model
{
    use HasFactory;

    protected $appends = ['business_image_url'];

    protected $fillable = [
        'user_id',
        'business_name',
        'business_type',
        'date_started',
        'business_image',
        'business_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getBusinessImageUrlAttribute(): ?string
    {
        return $this->business_image
            ? Storage::disk('public')->url($this->business_image)
            : null;
    }

    public function monthRecords()
    {
        return $this->hasMany(MonthRecord::class);
    }
}
