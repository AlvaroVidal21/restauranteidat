<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'cliente';
    protected $primaryKey = 'idcliente';
	public $timestamps=false;
	protected $fillable = [
    'dni',
    'nombres',
    'telefono',
    'correo',
    'password',
    'fecha_nacimiento',
    'fechasistema',
    'usuario',
    'estadocliente'
];
}
