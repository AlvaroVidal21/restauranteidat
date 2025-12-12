<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    protected $table = 'mesas';
    
    // Default primary key is 'id' and timestamps are true by default

    protected $fillable = [
        'codigo',
        'nombre',
        'descripcion',
        'ubicacion',
        'capacidad',
        'tipo',
        'estado'
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
