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
        $request->validate([
            'nombremessa' => 'required|string|max:100',
            'cantidadsillas' => 'required|integer|min:1',
            'ubicacionmesa' => 'nullable|string|max:100',
            'tipo' => 'nullable|string|in:solitario,pareja,familiar,romantica',
            'zona' => 'nullable|string|max:100',
            'disponible' => 'boolean'
        ]);

        $mesa = new Mesa();
        $mesa->nombremessa = $request->nombremessa;
        $mesa->descripcionmesa = $request->descripcionmesa ?? 'Mesa registrada desde dashboard';
        $mesa->ubicacionmesa = $request->ubicacionmesa ?? $request->zona ?? 'General';
        $mesa->cantidadsillas = $request->cantidadsillas;
        $mesa->sillas = $request->cantidadsillas; // Keep sync
        $mesa->tipo = $request->tipo;
        $mesa->zona = $request->zona ?? $request->ubicacionmesa ?? 'General';
        $mesa->disponible = $request->disponible ?? true;
        
        $mesa->codigoinventario = 'M-' . uniqid(); // Auto-generate
        $mesa->fecharegistro = date('Y-m-d H:i:s');
        $mesa->usuario = 1; // Default admin
        $mesa->estadouso = 1; 
        $mesa->estadogeneral = 1;

        $mesa->save();

        return response()->json(['message' => 'Mesa creada con éxito', 'data' => $mesa], 201);
    }

    public function show($id)
    {
        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['message' => 'Mesa no encontrada'], 404);
        }
        return response()->json($mesa, 200);
    }

    public function update(Request $request, $id)
    {
        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['message' => 'Mesa no encontrada'], 404);
        }

        $request->validate([
            'nombremessa' => 'sometimes|required|string|max:100',
            'cantidadsillas' => 'sometimes|required|integer|min:1',
            'tipo' => 'nullable|string|in:solitario,pareja,familiar,romantica',
            'disponible' => 'boolean'
        ]);

        if ($request->has('nombremessa')) $mesa->nombremessa = $request->nombremessa;
        if ($request->has('descripcionmesa')) $mesa->descripcionmesa = $request->descripcionmesa;
        if ($request->has('ubicacionmesa')) $mesa->ubicacionmesa = $request->ubicacionmesa;
        if ($request->has('cantidadsillas')) {
            $mesa->cantidadsillas = $request->cantidadsillas;
            $mesa->sillas = $request->cantidadsillas;
        }
        if ($request->has('tipo')) $mesa->tipo = $request->tipo;
        if ($request->has('zona')) $mesa->zona = $request->zona;
        if ($request->has('disponible')) $mesa->disponible = $request->disponible;

        $mesa->save();

        return response()->json(['message' => 'Mesa actualizada', 'data' => $mesa], 200);
    }

    public function destroy($id)
    {
        $mesa = Mesa::find($id);
        if (!$mesa) {
            return response()->json(['message' => 'Mesa no encontrada'], 404);
        }

        // Check for active reservations (today or future)
        $today = date('Y-m-d');
        $hasReservations = \App\Models\Reserva::where('mesa', $id)
            ->where('fechareserva', '>=', $today)
            ->where(function ($query) {
                // Check if status is NOT cancelled (assuming cancelled is 3 or similar)
                // If you use integers for status, ensure comparisons are correct.
                // Here we assume active reservations are those NOT marked as cancelled (3).
                $query->where('estadoreserva', '!=', 3);
            })
            ->exists();

        if ($hasReservations) {
            return response()->json(['message' => 'No se puede eliminar: Tiene reservas pendientes o futuras.'], 400);
        }

        try {
            $mesa->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            // Foreign Key Constraint Violation usually code 23000
            return response()->json(['message' => 'No se puede eliminar la mesa porque tiene historial de reservas (FK). Intente deshabilitarla.'], 409);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error interno al eliminar: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => 'Mesa eliminada'], 200);
    }

	
}
