<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class RestaurantSeeder extends Seeder
{
    public function run(): void
    {
        // Seed Client (Admin/User)
        $clientes = [
            [
                'dni' => 'admin',
                'nombres' => 'ADMINISTRADOR DEL SISTEMA',
                'telefono' => '0000000',
                'correo' => 'admin@restaurant.com',
                'password' => Hash::make('123'), // Requested password
                'fecha_nacimiento' => '1900-01-01',
                'fechasistema' => now(),
                'usuario' => 1,
                'estadocliente' => 1
            ],
            [
                'dni' => '41322161',
                'nombres' => 'ARMANDO LOPEZ ALIAGA',
                'telefono' => '9898989',
                'correo' => 'aliaga@gmail.com',
                'password' => Hash::make('password'), 
                'fecha_nacimiento' => '1980-01-01',
                'fechasistema' => now(),
                'usuario' => 1,
                'estadocliente' => 1
            ]
        ];

        foreach ($clientes as $cliente) {
            DB::table('cliente')->updateOrInsert(
                ['correo' => $cliente['correo']],
                $cliente
            );
        }

        // Seed Mesas
        $mesas = [
            // Solitario (1 silla)
            [
                'codigoinventario' => 'MESA-001',
                'nombremessa' => 'Solitario Ventana',
                'descripcionmesa' => 'Individual junto a la ventana',
                'ubicacionmesa' => 'Ventana',
                'cantidadsillas' => 1,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'solitario',
                'zona' => 'ventana',
                'sillas' => 1,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-002',
                'nombremessa' => 'Solitario Barra',
                'descripcionmesa' => 'Individual en barra',
                'ubicacionmesa' => 'Barra',
                'cantidadsillas' => 1,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'solitario',
                'zona' => 'barra',
                'sillas' => 1,
                'disponible' => true,
            ],

            // Romántica (2 sillas exactas)
            [
                'codigoinventario' => 'MESA-003',
                'nombremessa' => 'Romántica Ventana',
                'descripcionmesa' => 'Pareja con vista',
                'ubicacionmesa' => 'Ventana',
                'cantidadsillas' => 2,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'pareja',
                'zona' => 'ventana',
                'sillas' => 2,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-004',
                'nombremessa' => 'Romántica Salón',
                'descripcionmesa' => 'Pareja en salón central',
                'ubicacionmesa' => 'Salon',
                'cantidadsillas' => 2,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'pareja',
                'zona' => 'salon',
                'sillas' => 2,
                'disponible' => true,
            ],

            // Familiar (>2 sillas)
            [
                'codigoinventario' => 'MESA-005',
                'nombremessa' => 'Familiar Terraza 4',
                'descripcionmesa' => 'Familiar terraza cubierta',
                'ubicacionmesa' => 'Terraza',
                'cantidadsillas' => 4,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'familiar',
                'zona' => 'terraza',
                'sillas' => 4,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-006',
                'nombremessa' => 'Familiar Salón 4',
                'descripcionmesa' => 'Familiar en salón',
                'ubicacionmesa' => 'Salon',
                'cantidadsillas' => 4,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'familiar',
                'zona' => 'salon',
                'sillas' => 4,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-007',
                'nombremessa' => 'Familiar Salón 6',
                'descripcionmesa' => 'Mesa amplia en salón',
                'ubicacionmesa' => 'Salon',
                'cantidadsillas' => 6,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'familiar',
                'zona' => 'salon',
                'sillas' => 6,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-008',
                'nombremessa' => 'Familiar Terraza 6',
                'descripcionmesa' => 'Mesa amplia en terraza',
                'ubicacionmesa' => 'Terraza',
                'cantidadsillas' => 6,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'familiar',
                'zona' => 'terraza',
                'sillas' => 6,
                'disponible' => true,
            ],
            // Extra mesas para mayor disponibilidad
            [
                'codigoinventario' => 'MESA-009',
                'nombremessa' => 'Romántica Terraza',
                'descripcionmesa' => 'Pareja al aire libre',
                'ubicacionmesa' => 'Terraza',
                'cantidadsillas' => 2,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'pareja',
                'zona' => 'terraza',
                'sillas' => 2,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-010',
                'nombremessa' => 'Solitario Patio',
                'descripcionmesa' => 'Individual en patio interior',
                'ubicacionmesa' => 'Patio',
                'cantidadsillas' => 1,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'solitario',
                'zona' => 'patio',
                'sillas' => 1,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-011',
                'nombremessa' => 'Familiar Patio 4',
                'descripcionmesa' => 'Mesa familiar en patio',
                'ubicacionmesa' => 'Patio',
                'cantidadsillas' => 4,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'familiar',
                'zona' => 'patio',
                'sillas' => 4,
                'disponible' => true,
            ],
            [
                'codigoinventario' => 'MESA-012',
                'nombremessa' => 'Familiar Ventana 5',
                'descripcionmesa' => 'Mesa con vista y capacidad 5',
                'ubicacionmesa' => 'Ventana',
                'cantidadsillas' => 5,
                'fecharegistro' => now(),
                'usuario' => 'admin',
                'estadouso' => 'Libre',
                'estadogeneral' => 'Activo',
                'tipo' => 'familiar',
                'zona' => 'ventana',
                'sillas' => 5,
                'disponible' => true,
            ],
        ];

        foreach ($mesas as $mesa) {
            DB::table('mesa')->updateOrInsert(
                ['codigoinventario' => $mesa['codigoinventario']],
                $mesa
            );
        }

        // Seed Platos with Prices
        $platos = [
            ['nombreplato' => 'Ceviche Clásico', 'categoria' => 'Entradas', 'estadoplato' => 1, 'precio' => 25.00],
            ['nombreplato' => 'Lomo Saltado', 'categoria' => 'Fondos', 'estadoplato' => 1, 'precio' => 35.00],
            ['nombreplato' => 'Suspiro Limeño', 'categoria' => 'Postres', 'estadoplato' => 1, 'precio' => 15.00],
            ['nombreplato' => 'Causa de Langostinos', 'categoria' => 'Entradas', 'estadoplato' => 1, 'precio' => 22.00],
            ['nombreplato' => 'Ají de Gallina', 'categoria' => 'Fondos', 'estadoplato' => 1, 'precio' => 28.00],
        ];

        foreach ($platos as $plato) {
            DB::table('platos')->updateOrInsert(
                ['nombreplato' => $plato['nombreplato']],
                $plato
            );
        }

        // Seed Experiencias (New Table)
        $experiencias = [
            ['nombre' => 'Degustación Marina', 'descripcion' => 'Recorrido por los mejores sabores del mar peruano.', 'precio' => 120.00, 'estado' => 1],
            ['nombre' => 'Cena Romántica', 'descripcion' => 'Menú de 3 tiempos con maridaje en zona reservada.', 'precio' => 250.00, 'estado' => 1],
            ['nombre' => 'Experiencia Andina', 'descripcion' => 'Sabores autóctonos con técnicas milenarias.', 'precio' => 150.00, 'estado' => 1],
        ];

        foreach ($experiencias as $exp) {
            DB::table('experiencias')->updateOrInsert(
                ['nombre' => $exp['nombre']],
                $exp
            );
        }

        // Seed Reservas de ejemplo (visible en dashboard)
        $reservas = [
            [
                'cliente_correo' => 'aliaga@gmail.com',
                'mesa_codigo' => 'MESA-003',
                'fecha' => '2025-12-10',
                'horainicio' => '18:00',
                'horafin' => '20:00',
                'cantidad' => 2,
                'motivo' => 'Cena romántica aniversario',
                'tipopago' => 'Tarjeta',
                'estado' => 1,
                'experiencia' => 'Cena Romántica',
                'plato' => null,
            ],
            [
                'cliente_correo' => 'admin@restaurant.com',
                'mesa_codigo' => 'MESA-005',
                'fecha' => '2025-12-11',
                'horainicio' => '14:00',
                'horafin' => '16:00',
                'cantidad' => 4,
                'motivo' => 'Briefing con proveedores',
                'tipopago' => 'Cortesía',
                'estado' => 1,
                'experiencia' => null,
                'plato' => 'Lomo Saltado',
            ],
            [
                'cliente_correo' => 'aliaga@gmail.com',
                'mesa_codigo' => 'MESA-007',
                'fecha' => '2025-12-12',
                'horainicio' => '20:00',
                'horafin' => '22:00',
                'cantidad' => 6,
                'motivo' => 'Celebración familiar',
                'tipopago' => 'Efectivo',
                'estado' => 1,
                'experiencia' => 'Experiencia Andina',
                'plato' => null,
            ],
            [
                'cliente_correo' => 'admin@restaurant.com',
                'mesa_codigo' => 'MESA-001',
                'fecha' => '2025-12-09',
                'horainicio' => '16:00',
                'horafin' => '18:00',
                'cantidad' => 1,
                'motivo' => 'Cata interna de bebidas',
                'tipopago' => 'Interno',
                'estado' => 0,
                'experiencia' => null,
                'plato' => 'Causa de Langostinos',
            ],
        ];

        foreach ($reservas as $reserva) {
            $clienteId = DB::table('cliente')->where('correo', $reserva['cliente_correo'])->value('idcliente');
            $mesaId = DB::table('mesa')->where('codigoinventario', $reserva['mesa_codigo'])->value('idmesa');
            $platoId = $reserva['plato']
                ? DB::table('platos')->where('nombreplato', $reserva['plato'])->value('idplato')
                : null;
            $expId = $reserva['experiencia']
                ? DB::table('experiencias')->where('nombre', $reserva['experiencia'])->value('idexperiencia')
                : null;

            if (!$clienteId || !$mesaId) {
                continue;
            }

            DB::table('reserva')->updateOrInsert(
                [
                    'cliente' => $clienteId,
                    'mesa' => $mesaId,
                    'fechareserva' => $reserva['fecha'],
                    'horainicio' => $reserva['horainicio'],
                ],
                [
                    'horafin' => $reserva['horafin'],
                    'cantidadpersonas' => $reserva['cantidad'],
                    'motivo' => $reserva['motivo'],
                    'tipopago' => $reserva['tipopago'] ?? 'Efectivo',
                    'fechasistema' => now(),
                    'usuario' => 1,
                    'estadoreserva' => $reserva['estado'],
                    'plato_id' => $platoId,
                    'experiencia_id' => $expId,
                ]
            );
        }
    }
}
