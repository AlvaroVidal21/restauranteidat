<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cliente extends Model
{
    protected $table = 'clientes';

    protected $fillable = [
        'dni',
        'nombres',
        'telefono',
        'correo',
        'password',
        'fecha_nacimiento',
        'activo'
    ];

    protected $hidden = [
        'password',
    ];

    public function reservas()
    {
        return $this->hasMany(Reserva::class);
    }
}
