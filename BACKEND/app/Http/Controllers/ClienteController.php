<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Support\Facades\Hash;

class ClienteController extends Controller
{
    public function index()
    {
        // Exclude admin from list
        return response()->json(Cliente::where('dni', '!=', '00000000')->get(), 200);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'dni' => 'required|max:20|unique:clientes,dni',
                'nombres' => 'required|string',
                'telefono' => 'nullable|string',
                'correo' => 'required|email|unique:clientes,correo',
                'password' => 'required|string|min:6'
            ]);

            $cliente = Cliente::create([
                'dni' => $request->dni,
                'nombres' => $request->nombres,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'password' => Hash::make($request->password), // Hash password
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'activo' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cliente registrado correctamente',
                'data' => $cliente
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $cliente = Cliente::find($id);
        return $cliente ? response()->json($cliente) : response()->json(['message' => 'No encontrado'], 404);
    }

    public function update(Request $request, $id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) return response()->json(['message' => 'No encontrado'], 404);
        
        $data = $request->all();
        if ($request->has('password')) {
            $data['password'] = Hash::make($request->password);
        }
        
        $cliente->update($data);
        return response()->json(['message' => 'Actualizado', 'data' => $cliente]);
    }

    public function destroy($id)
    {
        $cliente = Cliente::find($id);
        if (!$cliente) return response()->json(['message' => 'No encontrado'], 404);
        
        $cliente->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}
