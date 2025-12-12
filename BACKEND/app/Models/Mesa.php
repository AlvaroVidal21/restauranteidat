<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    protected $table = 'mesa';
    protected $primaryKey = 'idmesa';
    public $timestamps = false; // Assuming typical setup in this project based on Reserva model


    protected $fillable = [
        'codigoinventario',
        'nombremessa',
        'descripcionmesa',
        'ubicacionmesa',
        'cantidadsillas',
        'fecharegistro',
        'usuario',
        'estadouso',
        'estadogeneral',
        'tipo',
        'zona',
        'sillas',
        'disponible',
    ];
}
