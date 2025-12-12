<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reserva;
use App\Models\Mesa;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

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
            'hora_fin' => 'nullable',
            'cantidad_personas' => 'required|integer|min:1',
            'detalles_consumo' => 'nullable|array'
        ]);

        $fecha = Carbon::parse($request->fecha)->toDateString();
        $horaInicio = substr((string) $request->hora_inicio, 0, 5);
        $inicio = Carbon::createFromFormat('H:i', $horaInicio);
        $horaFinRaw = $request->hora_fin ? substr((string) $request->hora_fin, 0, 5) : null;
        $fin = $horaFinRaw ? Carbon::createFromFormat('H:i', $horaFinRaw) : (clone $inicio)->addHours(2);
        $horaInicioDb = $inicio->format('H:i:s');
        $horaFinDb = $fin->format('H:i:s');

        // Enforce romantic experience rule: if experiencia indicates 'romant' then cantidad_personas must be 2
        $detalles = $request->input('detalles_consumo', []);
        $experienciaNombre = mb_strtolower($detalles['experiencia'] ?? '');
        if ($experienciaNombre !== '' && mb_stripos($experienciaNombre, 'romant') !== false) {
            if (intval($request->cantidad_personas) !== 2) {
                return response()->json(['message' => 'Las experiencias románticas solo permiten reservas para 2 personas.'], 422);
            }
        }

        // Validate mesa capacity and type constraints
        $mesa = Mesa::find($request->mesa_id);
        if (!$mesa) {
            return response()->json(['message' => 'Mesa no encontrada.'], 422);
        }

        if ($mesa->capacidad < intval($request->cantidad_personas)) {
            return response()->json(['message' => 'La mesa no tiene suficientes sillas para la cantidad solicitada.'], 422);
        }

        if (in_array($mesa->tipo, ['pareja', 'romantica']) && intval($request->cantidad_personas) !== 2) {
            return response()->json(['message' => 'Las mesas de tipo pareja/romántica solo permiten 2 personas.'], 422);
        }

        // Check availability logic (REAL overlap) and ignore cancelled reservations.
        // Overlap condition: existing.start < new.end AND existing.end > new.start
        $conflict = DB::transaction(function () use ($request, $fecha, $horaInicioDb, $horaFinDb) {
            return Reserva::where('mesa_id', $request->mesa_id)
                ->whereDate('fecha', $fecha)
                ->where('estado', '!=', 'cancelada')
                ->where('hora_inicio', '<', $horaFinDb)
                ->where('hora_fin', '>', $horaInicioDb)
                ->lockForUpdate()
                ->exists();
        });

        if ($conflict) {
            return response()->json(['message' => 'Mesa ocupada en este horario'], 422);
        }

        $reserva = Reserva::create([
            'cliente_id' => $request->cliente_id,
            'mesa_id' => $request->mesa_id,
            'fecha' => $fecha,
            'hora_inicio' => $horaInicioDb,
            'hora_fin' => $horaFinDb,
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

        $fecha = Carbon::parse($request->fecha)->toDateString();
        $horaInicio = substr((string) $request->hora, 0, 5);
        $inicio = Carbon::createFromFormat('H:i', $horaInicio);
        $horaFin = (clone $inicio)->addHours(2)->format('H:i:s');
        $horaInicioDb = $inicio->format('H:i:s');

        // Get IDs of tables reserved during this time slot
        $mesasOcupadasIds = Reserva::whereDate('fecha', $fecha)
            ->where(function ($query) use ($horaInicio, $horaFin) {
                // Logic: A reservation overlaps if it starts before our end AND ends after our start
                $query->where('hora_inicio', '<', $horaFin)
                      ->where('hora_fin', '>', $horaInicio);
            })
            ->where('estado', '!=', 'cancelada')
            ->pluck('mesa_id');

        $cantidadPersonas = $request->cantidad_personas;

        // Filtrar mesas por capacidad exacta o con 1 silla adicional maximo
        // Ejemplo: 2 personas = mesas de 2 o 3 sillas
        $query = Mesa::where('estado', '!=', 'mantenimiento')
            ->where('capacidad', '>=', $cantidadPersonas)
            ->where('capacidad', '<=', $cantidadPersonas + 1)
            ->orderBy('capacidad', 'asc');
        
        $candidatas = $query->get();

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

        // Allow only editing of mesa and fecha/hora (no cambios arbitrarios de cantidad_personas o detalles)
        $allowed = $request->only(['mesa_id', 'fecha', 'hora_inicio', 'hora_fin']);

        if (isset($allowed['mesa_id'])) {
            $newMesa = Mesa::find($allowed['mesa_id']);
            if (!$newMesa) return response()->json(['message' => 'Mesa no encontrada'], 422);

            // Ensure mesa capacity suits the existing reservation cantidad_personas
            if ($newMesa->capacidad < intval($reserva->cantidad_personas)) {
                return response()->json(['message' => 'La nueva mesa no tiene suficientes sillas para la reserva.'], 422);
            }

            if (in_array($newMesa->tipo, ['pareja', 'romantica']) && intval($reserva->cantidad_personas) !== 2) {
                return response()->json(['message' => 'No puede asignarse una mesa de tipo pareja a una reserva con diferente número de personas.'], 422);
            }
        }

        // If time or mesa changes, check availability excluding current reservation id
        $fecha = Carbon::parse($allowed['fecha'] ?? $reserva->fecha)->toDateString();
        $horaInicio = substr((string) ($allowed['hora_inicio'] ?? $reserva->hora_inicio), 0, 5);
        $horaFinRaw = ($allowed['hora_fin'] ?? $reserva->hora_fin) ? substr((string) ($allowed['hora_fin'] ?? $reserva->hora_fin), 0, 5) : null;
        $inicio = Carbon::createFromFormat('H:i', $horaInicio);
        $fin = $horaFinRaw ? Carbon::createFromFormat('H:i', $horaFinRaw) : (clone $inicio)->addHours(2);
        $horaInicioDb = $inicio->format('H:i:s');
        $horaFinDb = $fin->format('H:i:s');
        $mesaIdToCheck = $allowed['mesa_id'] ?? $reserva->mesa_id;

        $conflict = Reserva::where('mesa_id', $mesaIdToCheck)
            ->where('id', '!=', $reserva->id)
            ->whereDate('fecha', $fecha)
            ->where('estado', '!=', 'cancelada')
            ->where(function ($query) use ($horaInicioDb, $horaFinDb) {
                $query->where('hora_inicio', '<', $horaFinDb)
                      ->where('hora_fin', '>', $horaInicioDb);
            })
            ->exists();

        if ($conflict) {
            return response()->json(['message' => 'La mesa está ocupada en el horario seleccionado.'], 422);
        }

        $reserva->update([
            ...$allowed,
            'fecha' => $fecha,
            'hora_inicio' => $horaInicioDb,
            'hora_fin' => $horaFinDb,
        ]);
        return response()->json(['message' => 'Actualizada', 'data' => $reserva]);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);
        $reserva->delete();
        return response()->json(['message' => 'Eliminada']);
    }

    // Actualizar estado de una reserva (pendiente, confirmada, cancelada, atendida)
    public function updateStatus(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);

        $request->validate([
            'estado' => 'required|string'
        ]);

        $reserva->estado = $request->estado;
        $reserva->save();

        return response()->json(['message' => 'Estado actualizado', 'data' => $reserva]);
    }
}
