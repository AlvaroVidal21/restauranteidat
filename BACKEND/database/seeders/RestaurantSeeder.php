<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\Cliente;
use App\Models\Mesa;
use App\Models\Plato;
use App\Models\Experiencia;
use App\Models\Reserva;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Clientes (Admin y Usuario Demo)
        $clientes = [
            [
                'dni' => '00000000',
                'nombres' => 'ADMINISTRADOR DEL SISTEMA',
                'telefono' => '999999999',
                'correo' => 'admin@restaurant.com',
                'password' => Hash::make('123'), // CREDS: admin / 123
                'fecha_nacimiento' => '1990-01-01',
                'activo' => true
            ],
            [
                'dni' => '41322161',
                'nombres' => 'ARMANDO LOPEZ ALIAGA',
                'telefono' => '989898989',
                'correo' => 'aliaga@gmail.com',
                'password' => Hash::make('password'), 
                'fecha_nacimiento' => '1980-01-01',
                'activo' => true
            ]
        ];

        foreach ($clientes as $clienteData) {
            Cliente::updateOrCreate(
                ['correo' => $clienteData['correo']],
                $clienteData
            );
        }

        // 2. Mesas
        $mesas = [
            // Solitarios
            ['codigo' => 'M-001', 'nombre' => 'Solitario Ventana', 'descripcion' => 'Individual junto a la ventana', 'ubicacion' => 'Ventana', 'capacidad' => 1, 'tipo' => 'solitario', 'estado' => 'disponible'],
            ['codigo' => 'M-002', 'nombre' => 'Solitario Barra', 'descripcion' => 'Individual en barra', 'ubicacion' => 'Barra', 'capacidad' => 1, 'tipo' => 'solitario', 'estado' => 'disponible'],
            
            // Parejas
            ['codigo' => 'M-003', 'nombre' => 'Romántica Ventana', 'descripcion' => 'Pareja con vista', 'ubicacion' => 'Ventana', 'capacidad' => 2, 'tipo' => 'pareja', 'estado' => 'disponible'],
            ['codigo' => 'M-004', 'nombre' => 'Romántica Salón', 'descripcion' => 'Pareja en salón central', 'ubicacion' => 'Salon Principal', 'capacidad' => 2, 'tipo' => 'pareja', 'estado' => 'disponible'],
            
            // Familiares
            ['codigo' => 'M-005', 'nombre' => 'Familiar Terraza 4', 'descripcion' => 'Familiar terraza cubierta', 'ubicacion' => 'Terraza', 'capacidad' => 4, 'tipo' => 'familiar', 'estado' => 'disponible'],
            ['codigo' => 'M-006', 'nombre' => 'Familiar Salón 4', 'descripcion' => 'Familiar en salón', 'ubicacion' => 'Salon Principal', 'capacidad' => 4, 'tipo' => 'familiar', 'estado' => 'disponible'],
            ['codigo' => 'M-007', 'nombre' => 'Gran Familiar 6', 'descripcion' => 'Mesa amplia en salón', 'ubicacion' => 'Salon Principal', 'capacidad' => 6, 'tipo' => 'familiar', 'estado' => 'disponible'],
        ];

        foreach ($mesas as $mesa) {
            Mesa::updateOrCreate(
                ['codigo' => $mesa['codigo']],
                $mesa
            );
        }

        // 3. Platos
        $platos = [
            ['nombre' => 'Ceviche Clásico', 'categoria' => 'Entradas', 'precio' => 25.00, 'descripcion' => 'Pesca del día con leche de tigre.', 'activo' => true],
            ['nombre' => 'Lomo Saltado', 'categoria' => 'Fondos', 'precio' => 35.00, 'descripcion' => 'Trozos de lomo fino flambeados al wok.', 'activo' => true],
            ['nombre' => 'Suspiro Limeño', 'categoria' => 'Postres', 'precio' => 15.00, 'descripcion' => 'Clásico postre limeño.', 'activo' => true],
            ['nombre' => 'Causa de Langostinos', 'categoria' => 'Entradas', 'precio' => 22.00, 'descripcion' => 'Papa amarilla rellena de palta y langostinos.', 'activo' => true],
            ['nombre' => 'Ají de Gallina', 'categoria' => 'Fondos', 'precio' => 28.00, 'descripcion' => 'Pechuga deshilachada en crema de ají amarillo.', 'activo' => true],
        ];

        foreach ($platos as $plato) {
            Plato::updateOrCreate(
                ['nombre' => $plato['nombre']],
                $plato
            );
        }

        // 4. Experiencias
        $experiencias = [
            ['nombre' => 'Degustación Marina', 'descripcion' => 'Recorrido por los mejores sabores del mar peruano.', 'precio' => 120.00, 'activo' => true],
            ['nombre' => 'Cena Romántica', 'descripcion' => 'Menú de 3 tiempos con maridaje en zona reservada.', 'precio' => 250.00, 'activo' => true],
            ['nombre' => 'Experiencia Andina', 'descripcion' => 'Sabores autóctonos con técnicas milenarias.', 'precio' => 150.00, 'activo' => true],
        ];

        foreach ($experiencias as $exp) {
            Experiencia::updateOrCreate(
                ['nombre' => $exp['nombre']],
                $exp
            );
        }

        // 5. Reservas de Ejemplo
        $cliente = Cliente::where('correo', 'aliaga@gmail.com')->first();
        $mesa = Mesa::where('codigo', 'M-003')->first();
        $experiencia = Experiencia::first();
        $plato = Plato::first();

        if ($cliente && $mesa) {
            Reserva::updateOrCreate(
                [
                    'cliente_id' => $cliente->id,
                    'mesa_id' => $mesa->id,
                    'fecha' => '2025-12-15'
                ],
                [
                    'hora_inicio' => '20:00',
                    'hora_fin' => '22:00',
                    'cantidad_personas' => 2,
                    'motivo' => 'Aniversario',
                    'estado' => 'confirmada',
                    // Nuevo formato JSON limpio
                    'detalles_consumo' => [
                        'experiencia' => $experiencia->nombre,
                        'platos_adicionales' => [$plato->nombre]
                    ], 
                    'total' => 275.00
                ]
            );
        }
    }
}
