<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;

class ClienteController extends Controller
{
    
    public function index()
    {
       $cliente = Cliente::where('dni', '!=', 'admin')->get();
       return response()->json($cliente, 200);
    }

    public function store(Request $request)
    {
		$fechasistema=date('Y-m-d');
	try{
        $request->validate([
		'dni' => 'required|string|max:8|unique:cliente,dni',
        'nombres' => 'required|string',
        'telefono' => 'required|string|max:20|unique:cliente,telefono',
		'correo' => 'required|string|max:100|unique:cliente,correo'
		]);
       
		$cliente = Cliente::create([
	    'dni' => $request->dni,
        'nombres' => $request->nombres,
        'telefono' => $request->telefono,
		'correo' => $request->correo,
		'fechasistema' =>$fechasistema,
		'usuario' => 1,
		'estadocliente' => 1
			]);

		return response()->json([
        'success' => true,
        'message' => 'Cliente registrado correctamente',
        'data' => $cliente,
		], 201);
	 }
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
            'message' => 'Ocurrió un error al registrar el cliente.',
            'error_detail' => $e->getMessage(), 
        ], 500);
    }
    }

    
    public function show(string $id)
    {
        $cliente = Cliente::find($id);
        if ($cliente) {
            return response()->json($cliente, 200);
        }
        return response()->json(['message' => 'Cliente no encontrado'], 404);
    }

    public function update(Request $request, string $id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) {
            return response()->json(['message' => 'Cliente no encontrado'], 404);
        }

        $cliente->update($request->all());
        return response()->json(['message' => 'Cliente actualizado correctamente', 'data' => $cliente], 200);
    }

    public function destroy(string $id)
    {
        try {
            $cliente = Cliente::find($id);
            if (!$cliente) {
                return response()->json(['message' => 'Cliente no encontrado'], 404);
            }
            
            // Delete associated reservations first (Cascade simulation)
            \Illuminate\Support\Facades\DB::table('reserva')->where('cliente', $id)->delete();
            
            $cliente->delete();
            return response()->json(['message' => 'Cliente eliminado correctamente'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se pudo eliminar el cliente.', 'error' => $e->getMessage()], 500);
        }
    }
	
	public function obtenerMesas()
{
   
}

	
}
