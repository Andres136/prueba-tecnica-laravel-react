<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProviderContact extends Model
{
    use HasFactory;

    protected $fillable = [
        'provider_id',
        'contact_name',
        'contact_email',
        'contact_phone',
        'position',
    ];

    // Un contacto pertenece a un proveedor
    public function provider()
    {
        return $this->belongsTo(Provider::class);
    }
}
