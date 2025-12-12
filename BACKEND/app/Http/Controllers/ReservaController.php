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
            'hora_inicio' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'hora_fin' => ['nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'cantidad_personas' => 'required|integer|min:1',
            'detalles_consumo' => 'nullable|array'
        ]);

        $fecha = Carbon::parse($request->fecha)->toDateString();
        $horaInicio = substr((string) $request->hora_inicio, 0, 5);
        $inicio = Carbon::createFromFormat('H:i', $horaInicio);
        // Duración fija: 2 horas (se ignora cualquier hora_fin enviada por cliente)
        $fin = (clone $inicio)->addHours(2);
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

        $reserva = DB::transaction(function () use ($request, $fecha, $horaInicioDb, $horaFinDb) {
            // Lock de la mesa para evitar carreras (dos reservas simultáneas para la misma mesa)
            $mesa = Mesa::whereKey($request->mesa_id)->lockForUpdate()->first();
            if (!$mesa) {
                abort(422, 'Mesa no encontrada.');
            }

            if ($mesa->capacidad < intval($request->cantidad_personas)) {
                abort(422, 'La mesa no tiene suficientes sillas para la cantidad solicitada.');
            }

            if (in_array($mesa->tipo, ['pareja', 'romantica']) && intval($request->cantidad_personas) !== 2) {
                abort(422, 'Las mesas de tipo pareja/romántica solo permiten 2 personas.');
            }

            $conflict = Reserva::where('mesa_id', $request->mesa_id)
                ->whereDate('fecha', $fecha)
                ->where('estado', '!=', 'cancelada')
                ->where('hora_inicio', '<', $horaFinDb)
                ->where('hora_fin', '>', $horaInicioDb)
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                abort(422, 'Mesa ocupada en este horario');
            }

            return Reserva::create([
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
        });

        return response()->json(['message' => 'Reserva creada', 'data' => $reserva], 201);
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora' => ['required', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'cantidad_personas' => 'required|integer',
        ]);

        $fecha = Carbon::parse($request->fecha)->toDateString();
        $horaInicio = substr((string) $request->hora, 0, 5);
        $inicio = Carbon::createFromFormat('H:i', $horaInicio);
        $horaFin = (clone $inicio)->addHours(2)->format('H:i:s');
        $horaInicioDb = $inicio->format('H:i:s');

        // Get IDs of tables reserved during this time slot
        $mesasOcupadasIds = Reserva::whereDate('fecha', $fecha)
            ->where(function ($query) use ($horaInicioDb, $horaFin) {
                // Logic: A reservation overlaps if it starts before our end AND ends after our start
                $query->where('hora_inicio', '<', $horaFin)
                      ->where('hora_fin', '>', $horaInicioDb);
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
        $request->validate([
            'mesa_id' => 'sometimes|exists:mesas,id',
            'fecha' => 'sometimes|date',
            'hora_inicio' => ['sometimes', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
            'hora_fin' => ['sometimes', 'nullable', 'regex:/^\d{2}:\d{2}(:\d{2})?$/'],
        ]);

        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);

        // Allow only editing of mesa and fecha/hora (no cambios arbitrarios de cantidad_personas o detalles)
        $allowed = $request->only(['mesa_id', 'fecha', 'hora_inicio', 'hora_fin']);

        $updated = DB::transaction(function () use ($allowed, $id) {
            $reservaLocked = Reserva::whereKey($id)->lockForUpdate()->first();
            if (!$reservaLocked) {
                abort(404, 'No encontrada');
            }

            $fecha = Carbon::parse($allowed['fecha'] ?? $reservaLocked->fecha)->toDateString();
            $horaInicio = substr((string) ($allowed['hora_inicio'] ?? $reservaLocked->hora_inicio), 0, 5);
            $inicio = Carbon::createFromFormat('H:i', $horaInicio);
            // Duración fija: 2 horas (se ignora cualquier hora_fin enviada)
            $fin = (clone $inicio)->addHours(2);
            $horaInicioDb = $inicio->format('H:i:s');
            $horaFinDb = $fin->format('H:i:s');
            $mesaIdToCheck = $allowed['mesa_id'] ?? $reservaLocked->mesa_id;

            // Lock de la mesa destino para evitar carreras
            $newMesa = Mesa::whereKey($mesaIdToCheck)->lockForUpdate()->first();
            if (!$newMesa) {
                abort(422, 'Mesa no encontrada');
            }

            if ($newMesa->capacidad < intval($reservaLocked->cantidad_personas)) {
                abort(422, 'La nueva mesa no tiene suficientes sillas para la reserva.');
            }

            if (in_array($newMesa->tipo, ['pareja', 'romantica']) && intval($reservaLocked->cantidad_personas) !== 2) {
                abort(422, 'No puede asignarse una mesa de tipo pareja a una reserva con diferente número de personas.');
            }

            $conflict = Reserva::where('mesa_id', $mesaIdToCheck)
                ->where('id', '!=', $reservaLocked->id)
                ->whereDate('fecha', $fecha)
                ->where('estado', '!=', 'cancelada')
                ->where('hora_inicio', '<', $horaFinDb)
                ->where('hora_fin', '>', $horaInicioDb)
                ->lockForUpdate()
                ->exists();

            if ($conflict) {
                abort(422, 'La mesa está ocupada en el horario seleccionado.');
            }

            $reservaLocked->update([
                ...$allowed,
                'fecha' => $fecha,
                'hora_inicio' => $horaInicioDb,
                'hora_fin' => $horaFinDb,
            ]);

            return $reservaLocked->fresh(['cliente', 'mesa']);
        });

        return response()->json(['message' => 'Actualizada', 'data' => $updated]);
    }

    public function destroy(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);

        // No borrar reservas: cancelar para mantener auditoría.
        if ($reserva->estado !== 'cancelada') {
            $motivoCancelacion = $request->input('motivo_cancelacion');
            if (is_string($motivoCancelacion) && trim($motivoCancelacion) !== '') {
                $detalles = $reserva->detalles_consumo;
                if (!is_array($detalles)) {
                    $detalles = [];
                }
                $detalles['cancelacion'] = [
                    'motivo' => trim($motivoCancelacion),
                    'fecha' => Carbon::now()->toIso8601String(),
                ];
                $reserva->detalles_consumo = $detalles;
            }

            $reserva->estado = 'cancelada';
            $reserva->save();
        }

        return response()->json(['message' => 'Cancelada', 'data' => $reserva->fresh(['cliente', 'mesa'])]);
    }

    // Actualizar estado de una reserva (pendiente, confirmada, cancelada, atendida)
    public function updateStatus(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) return response()->json(['message' => 'No encontrada'], 404);

        $request->validate([
            'estado' => 'required|string|in:pendiente,confirmada,completada,cancelada,atendida,atendido'
        ]);

        if ($request->estado === 'cancelada') {
            $motivoCancelacion = $request->input('motivo_cancelacion');
            if (is_string($motivoCancelacion) && trim($motivoCancelacion) !== '') {
                $detalles = $reserva->detalles_consumo;
                if (!is_array($detalles)) {
                    $detalles = [];
                }
                $detalles['cancelacion'] = [
                    'motivo' => trim($motivoCancelacion),
                    'fecha' => Carbon::now()->toIso8601String(),
                ];
                $reserva->detalles_consumo = $detalles;
            }
        }

        $reserva->estado = $request->estado;
        $reserva->save();

        return response()->json(['message' => 'Estado actualizado', 'data' => $reserva->fresh(['cliente', 'mesa'])]);
    }
}
