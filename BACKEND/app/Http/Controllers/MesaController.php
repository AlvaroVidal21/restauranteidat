<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mesa;

class MesaController extends Controller
{
    
    public function index()
    {
       $mesas = Mesa::all();
        return response()->json($mesas, 200);
		
    }

  
    public function store(Request $request)
    {
        //
    }

    
    public function show(string $id)
    {
        //
    }

   
    public function update(Request $request, string $id)
    {
        //
    }

   
    public function destroy(string $id)
    {
        //
    }
	
	public function obtenerMesas()
{
   
}

	
}
