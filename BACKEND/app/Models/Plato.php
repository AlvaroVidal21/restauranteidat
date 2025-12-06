<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plato extends Model
{
    protected $table = 'platos';
	protected $primaryKey = 'idplato';
	public $timestamps=false;
	protected $fillable = [
     'idplato',
	'nombreplato',
    'categoria',
    'precio',
    'estadoplato'
   ];
}
