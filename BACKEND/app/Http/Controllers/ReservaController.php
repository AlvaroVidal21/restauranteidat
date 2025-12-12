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
        $reservas = Reserva::with(['clienteInfo', 'mesaInfo', 'platoInfo', 'experienciaInfo'])->get();
        return response()->json($reservas, 200);
    }

    public function store(Request $request)
    {
        $request->validate([
            'cliente' => 'required',
            'mesa' => 'required',
            'fechareserva' => 'required|date',
            'horainicio' => 'required',
            'horafin' => 'required',
            'cantidadpersonas' => 'required|integer',
            'plato_id' => 'nullable',
            'experiencia_id' => 'nullable',
            'drink_id' => 'nullable|integer',
            'drink_name' => 'nullable|string|max:150',
            'opcionales' => 'array|nullable',
            'opcionales_nombres' => 'array|nullable',
            'extras' => 'array|nullable'
        ]);

        if (empty($request->plato_id) && empty($request->experiencia_id)) {
            return response()->json(['message' => 'Debe seleccionar un plato o experiencia'], 422);
        }


        $exists = Reserva::where('mesa', $request->mesa)
            ->where('fechareserva', $request->fechareserva)
            ->where(function ($query) use ($request) {
                $query->whereBetween('horainicio', [$request->horainicio, $request->horafin])
                      ->orWhereBetween('horafin', [$request->horainicio, $request->horafin])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('horainicio', '<=', $request->horainicio)
                            ->where('horafin', '>=', $request->horafin);
                      });
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'La mesa no está disponible en ese horario.'], 422);
        }

        $reserva = new Reserva();
        $reserva->cliente = $request->cliente;
        $reserva->mesa = $request->mesa;
        $reserva->plato_id = $request->plato_id;
        $reserva->experiencia_id = $request->experiencia_id;
        $reserva->drink_id = $request->drink_id ?? $request->drinkId;
        $reserva->drink_name = $request->drink_name ?? $request->drinkName;
        $reserva->opcionales = $request->opcionales ?? $request->opcionalesIds;

        $reserva->opcionales_nombres = $request->opcionales_nombres ?? $request->opcionalesNombres;
        $reserva->extras = $request->extras ?? ($request->opcionales_nombres ?? $request->opcionalesNombres);
        $reserva->fechareserva = $request->fechareserva;
        $reserva->horainicio = $request->horainicio;
        $reserva->horafin = $request->horafin;
        $reserva->cantidadpersonas = $request->cantidadpersonas;
        $reserva->motivo = $request->motivo ?? 'Reserva Web';
        $reserva->tipopago = $request->tipopago ?? 'Pendiente';
        $reserva->fechasistema = date('Y-m-d');
        $reserva->usuario = 1;
        $reserva->estadoreserva = 1;
        $reserva->save();

        return response()->json(['message' => 'Reserva creada con éxito', 'data' => $reserva], 201);
    }

    public function checkAvailability(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'hora' => 'required',
            'cantidadpersonas' => 'required|integer|min:1',
            'experiencia_id' => 'nullable|integer',
            'zona' => 'nullable|string'
        ]);

        $fecha = $request->fecha;
        $hora = $request->hora;
        $personas = (int) $request->cantidadpersonas;
        $experienciaId = $request->experiencia_id;
        $zona = $request->zona;

        // Meterle 2 horas
        $horaFin = date('H:i', strtotime($hora) + 7200);

        $reservedTableIds = Reserva::where('fechareserva', $fecha)
            ->where(function ($query) use ($hora, $horaFin) {
                $query->where('horainicio', '<', $horaFin)
                      ->where('horafin', '>', $hora);
            })
            ->pluck('mesa');


        $mesasQuery = Mesa::query()
            ->where(function ($q) {
                $q->whereNull('disponible')->orWhere('disponible', true);
            });


        $expNombre = null;
        if (!empty($experienciaId)) {
            $expNombre = DB::table('experiencias')->where('idexperiencia', $experienciaId)->value('nombre');
        }

        $expEsRomantica = $expNombre && str_contains(strtolower($expNombre), 'romant');


        $capacidadExpr = 'COALESCE(sillas, cantidadsillas)';

        if ($personas <= 1) {

            $mesasQuery
                ->where(function ($q) {
                    $q->where('tipo', 'solitario')->orWhereNull('tipo');
                })
                ->whereRaw($capacidadExpr . ' = ?', [1]);
        } elseif ($personas === 2) {

            $mesasQuery
                ->where(function ($q) {
                    $q->where('tipo', 'pareja')->orWhere('tipo', 'romantica');
                })
                ->whereRaw($capacidadExpr . ' = ?', [2]);
        } else {
            // Familiar / general: capacidad igual o mayor al número de personas
            $mesasQuery
                ->where(function ($q) {
                    $q->where('tipo', 'familiar')->orWhereNull('tipo');
                })
                ->whereRaw($capacidadExpr . ' >= ?', [$personas]);
        }

        if (!empty($zona)) {
            $mesasQuery->where(function ($q) use ($zona) {
                $q->where('zona', $zona)->orWhere('ubicacionmesa', $zona);
            });
        }

        $candidatas = $mesasQuery->get();

        // Marcar cuales están reservadas en el turno
        $availableTables = $candidatas->map(function ($mesa) use ($reservedTableIds) {
            $mesa->reservada = $reservedTableIds->contains($mesa->idmesa);
            return $mesa;
        });

        return response()->json($availableTables);
    }

    public function destroy($id)
    {
        $reserva = Reserva::find($id);
        if ($reserva) {
            $reserva->delete();
            return response()->json(['message' => 'Reserva eliminada'], 200);
        }
        return response()->json(['message' => 'Reserva no encontrada'], 404);
    }

    public function updateStatus(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $request->validate([
            'estadoreserva' => 'required|integer|in:1,2'
        ]);

        $reserva->estadoreserva = $request->estadoreserva;
        $reserva->save();

        return response()->json([
            'message' => 'Estado actualizado',
            'data' => $reserva
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $reserva = Reserva::find($id);
        if (!$reserva) {
            return response()->json(['message' => 'Reserva no encontrada'], 404);
        }

        $request->validate([
            'fechareserva' => 'required|date',
            'horainicio' => 'required',
            'horafin' => 'required',
            'cantidadpersonas' => 'required|integer|min:1',
            'mesa' => 'required'
        ]);


        $exists = Reserva::where('mesa', $request->mesa)
            ->where('fechareserva', $request->fechareserva)
            ->where('idreserva', '!=', $id)
            ->where(function ($query) use ($request) {
                $query->whereBetween('horainicio', [$request->horainicio, $request->horafin])
                      ->orWhereBetween('horafin', [$request->horainicio, $request->horafin])
                      ->orWhere(function ($q) use ($request) {
                          $q->where('horainicio', '<=', $request->horainicio)
                            ->where('horafin', '>=', $request->horafin);
                      });
            })
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'La mesa no está disponible en ese horario.'], 422);
        }

        $reserva->fechareserva = $request->fechareserva;
        $reserva->horainicio = $request->horainicio;
        $reserva->horafin = $request->horafin;
        $reserva->cantidadpersonas = $request->cantidadpersonas;
        $reserva->mesa = $request->mesa;
        $reserva->drink_id = $request->drink_id ?? $request->drinkId ?? $reserva->drink_id;
        $reserva->drink_name = $request->drink_name ?? $request->drinkName ?? $reserva->drink_name;
        $reserva->opcionales = $request->opcionales ?? $request->opcionalesIds ?? $reserva->opcionales;
        $reserva->opcionales_nombres = $request->opcionales_nombres ?? $request->opcionalesNombres ?? $reserva->opcionales_nombres;
        $reserva->extras = $request->extras ?? ($request->opcionales_nombres ?? $request->opcionalesNombres ?? $reserva->extras);
        $reserva->motivo = $request->motivo ?? $reserva->motivo;
        $reserva->save();

        return response()->json(['message' => 'Reserva actualizada', 'data' => $reserva], 200);
    }
}
