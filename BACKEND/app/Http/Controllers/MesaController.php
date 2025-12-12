<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Mesa;

class MesaController extends Controller
{
    public function index()
    {
        return response()->json(Mesa::all(), 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:50',
            'capacidad' => 'required|integer|min:1',
            'ubicacion' => 'nullable|string|max:100',
            'tipo' => 'nullable|string',
            'estado' => 'nullable|in:disponible,ocupada,reservada,mantenimiento'
        ]);

        $mesa = Mesa::create([
            'codigo' => 'M-' . uniqid(),
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion ?? 'Mesa nueva',
            'ubicacion' => $request->ubicacion ?? 'Salon Principal',
            'capacidad' => $request->capacidad,
            'tipo' => $request->tipo ?? 'familiar',
            'estado' => $request->estado ?? 'disponible'
        ]);

        return response()->json(['message' => 'Mesa creada con éxito', 'data' => $mesa], 201);
    }

    public function show($id)
    {
        $mesa = Mesa::find($id);
        if (!$mesa) return response()->json(['message' => 'Mesa no encontrada'], 404);
        return response()->json($mesa, 200);
    }

    public function update(Request $request, $id)
    {
        $mesa = Mesa::find($id);
        if (!$mesa) return response()->json(['message' => 'Mesa no encontrada'], 404);

        $mesa->update($request->all());
        return response()->json(['message' => 'Mesa actualizada', 'data' => $mesa], 200);
    }

    public function destroy($id)
    {
        $mesa = Mesa::find($id);
        if (!$mesa) return response()->json(['message' => 'Mesa no encontrada'], 404);
        
        try {
            $mesa->delete();
            return response()->json(['message' => 'Mesa eliminada'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'No se puede eliminar mesa con reservas asociadas.'], 400);
        }
    }
}
