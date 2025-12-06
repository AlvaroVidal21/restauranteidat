<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reserva extends Model
{
    protected $table = 'reserva';
    protected $primaryKey = 'idreserva';
    public $timestamps = false; // Assuming no created_at/updated_at in migration

    protected $fillable = [
        'cliente',
        'mesa',
        'plato_id',
        'experiencia_id',
        'drink_id',
        'drink_name',
        'fechareserva',
        'horainicio',
        'horafin',
        'cantidadpersonas',
        'opcionales',
        'opcionales_nombres',
        'extras',
        'motivo',
        'tipopago',
        'fechasistema',
        'usuario',
        'estadoreserva'
    ];

    protected $casts = [
        'opcionales' => 'array',
        'opcionales_nombres' => 'array',
        'extras' => 'array',
    ];

    public function clienteInfo()
    {
        return $this->belongsTo(Cliente::class, 'cliente', 'idcliente');
    }

    public function mesaInfo()
    {
        return $this->belongsTo(Mesa::class, 'mesa', 'idmesa');
    }

    public function platoInfo()
    {
        return $this->belongsTo(Plato::class, 'plato_id', 'idplato');
    }

    public function experienciaInfo()
    {
        // Assuming you create an Experiencia model. If not, I can't relate it easily unless I create one.
        // I'll create a simple Experiencia model next.
        return $this->belongsTo(Experiencia::class, 'experiencia_id', 'idexperiencia');
    }
}
