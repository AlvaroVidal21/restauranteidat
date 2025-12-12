<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reserva;
use App\Models\Mesa;
use Illuminate\Support\Facades\DB;

class ReservaController extends Controller
{
    public function index()
    {
        // Eager load relationships
        $reservas = Reserva::with(['cliente', 'mesa'])->get(); 
        return response()->json($reservas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cliente_id' => 'required|exists:clientes,id',
            'mesa_id' => 'required|exists:mesas,id',
            'fecha' => 'required|date',
            'hora_inicio' => 'required',
            'hora_fin' => 'required',
            'cantidad_personas' => 'required|integer|min:1',
            'detalles_consumo' => 'nullable|array'
        ]);

        // Check availability logic
        $exists = Reserva::where('mesa_id', $request->mesa_id)
            ->where('fecha', $request->fecha)
            ->where(function ($query) use ($request) {
                $query->whereBetween('hora_inicio', [$request->hora_inicio, $request->hora_fin])
                      ->orWhereBetween('hora_fin', [$request->hora_inicio, $request->hora_fin])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('hora_inicio', '<=', $request->hora_inicio)
                            ->where('hora_fin', '>=', $request->hora_fin);
                      });
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'Mesa ocupada en este horario'], 422);
        }

        $reserva = Reserva::create([
            'cliente_id' => $request->cliente_id,
            'mesa_id' => $request->mesa_id,
            'fecha' => $request->fecha,
            'hora_inicio' => $request->hora_inicio,
            'hora_fin' => $request->hora_fin,
            'cantidad_personas' => $request->cantidad_personas,
            'motivo' => $request->motivo ?? 'Web',
            'estado' => $request->estado ?? 'pendiente',
            'detalles_consumo' => $request->detalles_consumo,
            'total' => $request->total ?? 0
        ]);

        return response()->json(['message' => 'Reserva creada', 'data' => $reserva], 201);
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora' => 'required',
            'cantidad_personas' => 'required|integer',
        ]);

        $horaInicio = $request->hora;
        // Default 2 hours duration
        $horaFin = date('H:i', strtotime($horaInicio) + 7200);

        // Get IDs of tables reserved during this time slot
        $mesasOcupadasIds = Reserva::where('fecha', $request->fecha)
            ->where(function ($query) use ($horaInicio, $horaFin) {
                // Logic: A reservation overlaps if it starts before our end AND ends after our start
                $query->where('hora_inicio', '<', $horaFin)
                      ->where('hora_fin', '>', $horaInicio);
            })
            ->where('estado', '!=', 'cancelada')
            ->pluck('mesa_id');

        // Filter tables compatible with group size
        $candidatas = Mesa::where('capacidad', '>=', $request->cantidad_personas)
            ->where('estado', '!=', 'mantenimiento')
            ->get();

        // Mark them as reserved or available
        $result = $candidatas->map(function ($mesa) use ($mesasOcupadasIds) {
            $mesa->reservada = $mesasOcupadasIds->contains($mesa->id);
            return $mesa;
        });

        return response()->json($result);
    }

    public function show($id)
    {
        $reserva = Reserva::with(['cliente', 'mesa'])->find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);
        return response()->json($reserva);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);

        $reserva->update($request->all());
        return response()->json(['message' => 'Actualizada', 'data' => $reserva]);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);
        $reserva->delete();
        return response()->json(['message' => 'Eliminada']);
    }
}
