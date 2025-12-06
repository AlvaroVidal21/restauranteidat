<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mesa extends Model
{
    protected $table = 'mesa';

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
