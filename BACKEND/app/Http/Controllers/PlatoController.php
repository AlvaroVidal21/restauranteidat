<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;

use App\Models\Plato;

class PlatoController extends Controller
{
    
    public function index()
    {
       $objplato = Plato::all();
       return response()->json($objplato, 200);
		
    }

  
    public function store(Request $request)
    {
        
		$fechasistema=date('Y-m-d');
		
		try{
			
	 //Validacion
        $request->validate([
            'nombreplato' => 'required|string|max:100|unique:platos,nombreplato',
            'categoria' => 'required|string',
            'precio' => 'required|numeric'
        ]);
	// Guardar los datos

		
		$objplato = Plato::create([
	    'nombreplato' => $request->nombreplato,
        'categoria' => $request->categoria,
        	'precio' => $request->precio,
           'estadoplato' => 1
		
			]);
		// Retorna Mensaje
		return response()->json([
        'success' => true,
        'message' => 'Plato registrado correctamente',
        'data' => $objplato,
		], 201);
			
		} // fin del Try
			 
			// Excepcion de validacion

		catch (\Illuminate\Validation\ValidationException $e) {
        // Error de validación
			return response()->json([
            'success' => false,
            'errors' => $e->errors(),
            'message' => 'Errores de validación',
				], 422);

			}
			 
			 
		 catch (\Exception $e) {
        // Otros errores
        return response()->json([
            'success' => false,
			'message' => 'Ocurrió un error al registrar el plato.',
            'error_detail' => $e->getMessage(), 
        ], 500);
    }
		
		
    }

    
 public function show($id)
{
    $plato = Plato::find($id);

    if (!$plato) {
        return response()->json(['message' => 'Plato no encontrado'], 404);
    }

    return response()->json($plato, 200);
}

public function update(Request $request, $id)
{
    $request->validate([
        'nombreplato' => 'required',
        'categoria' => 'required',
        'precio' => 'required|numeric'
    ]);

    $plato = Plato::find($id);

    if (!$plato) {
        return response()->json(['message' => 'Plato no encontrado'], 404);
    }

    $plato->update($request->all());

    return response()->json(['message' => 'Plato actualizado correctamente'], 200);
}


   
    public function destroy(string $id)
    {
        $plato = Plato::find($id);

    if (!$plato) {
        return response()->json(['message' => 'Plato no encontrado'], 404);
    }

    $plato->delete();

    return response()->json(['message' => 'Plato eliminado correctamente'], 200);
    }
	


	
}
