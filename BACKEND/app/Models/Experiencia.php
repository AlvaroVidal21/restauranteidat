<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Experiencia extends Model
{
    protected $table = 'experiencias';
    protected $primaryKey = 'idexperiencia';
    public $timestamps = false; 

    protected $fillable = [
        'nombre',
        'descripcion',
        'precio',
        'estado'
    ];
}
