<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reservas';

    protected $fillable = [
        'cliente_id',
        'mesa_id',
        'fecha',
        'hora_inicio',
        'hora_fin',
        'cantidad_personas',
        'motivo',
        'estado',
        'detalles_consumo',
        'total'
    ];

    protected $casts = [
        'detalles_consumo' => 'array',
        'fecha' => 'date:Y-m-d',
    ];

    public function cliente()
    {
        return $this->belongsTo(Cliente::class);
    }

    public function mesa()
    {
        return $this->belongsTo(Mesa::class);
    }
}
