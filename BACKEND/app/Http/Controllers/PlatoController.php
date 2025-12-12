<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plato;

class PlatoController extends Controller
{
    public function index()
    {
       $platos = Plato::where('activo', true)->get();
       return response()->json($platos, 200);
    }

    public function store(Request $request)
    {
        try {
            $request->validate([
                'nombre' => 'required|string|max:100|unique:platos,nombre',
                'categoria' => 'required|string',
                'precio' => 'required|numeric',
                'descripcion' => 'nullable|string|max:1000'
            ]);

            $plato = Plato::create([
                'nombre' => $request->nombre,
                'categoria' => $request->categoria,
                'precio' => $request->precio,
                'descripcion' => $request->descripcion ?? null,
                'activo' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Plato registrado correctamente',
                'data' => $plato,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'errors' => $e->errors(),
                'message' => 'Errores de validación',
            ], 422);
        } catch (\Exception $e) {
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
        $plato = Plato::find($id);
        if (!$plato) {
            return response()->json(['message' => 'Plato no encontrado'], 404);
        }

        $request->validate([
            'nombre' => 'required|string|max:100',
            'categoria' => 'required',
            'precio' => 'required|numeric',
            'descripcion' => 'nullable|string|max:1000'
        ]);

        $plato->update([
            'nombre' => $request->nombre,
            'categoria' => $request->categoria,
            'precio' => $request->precio,
            'descripcion' => $request->descripcion ?? null,
        ]);

        return response()->json(['message' => 'Plato actualizado correctamente', 'data' => $plato], 200);
    }

    public function destroy($id)
    {
        $plato = Plato::find($id);
        if (!$plato) {
            return response()->json(['message' => 'Plato no encontrado'], 404);
        }

        // Soft delete logic or hard delete? Schema doesn't imply soft deletes, so hard or set active=false
        // Given previous logic was delete(), assume hard delete is OK or use active=false
        $plato->delete();

        return response()->json(['message' => 'Plato eliminado correctamente'], 200);
    }
}
