<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Clientes
        Schema::create('clientes', function (Blueprint $table) {
            $table->id(); // id
            $table->string('dni', 20)->unique();
            $table->string('nombres');
            $table->string('telefono', 20)->nullable();
            $table->string('correo')->unique();
            $table->string('password');
            $table->date('fecha_nacimiento')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps(); // created_at, updated_at
        });

        // 2. Mesas
        Schema::create('mesas', function (Blueprint $table) {
            $table->id(); // id
            $table->string('codigo', 20)->unique(); // Ex: M-01
            $table->string('nombre', 50); // Mesa 1
            $table->string('descripcion')->nullable();
            $table->string('ubicacion', 100)->default('Salon Principal');
            $table->integer('capacidad'); // Sillas
            $table->string('tipo', 50)->default('general'); // Solitario, Pareja, Familiar
            $table->enum('estado', ['disponible', 'ocupada', 'reservada', 'mantenimiento'])->default('disponible');
            $table->timestamps();
        });

        // 3. Platos (Menú)
        Schema::create('platos', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('categoria', 50); // Entrada, Fondo, Postre, Bebida
            $table->decimal('precio', 10, 2);
            $table->string('descripcion')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 4. Experiencias (Eventos especiales, paquetes)
        Schema::create('experiencias', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->text('descripcion')->nullable();
            $table->decimal('precio', 10, 2);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });

        // 5. Reservas
        Schema::create('reservas', function (Blueprint $table) {
            $table->id();
            
            // Relaciones
            $table->foreignId('cliente_id')->constrained('clientes')->onDelete('cascade');
            $table->foreignId('mesa_id')->constrained('mesas')->onDelete('cascade');
            
            // Detalles Reserva
            $table->date('fecha');
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->integer('cantidad_personas');
            
            // Consumo y Estado
            $table->string('motivo')->nullable(); // Cumpleaños, Aniversario
            $table->enum('estado', ['pendiente', 'confirmada', 'completada', 'cancelada'])->default('pendiente');
            
            // Detalles JSON (Para guardar platos o experiencias elegidas sin tablas pivote complejas si no son necesarias)
            // Ejemplo: { "experiencia_id": 1, "platos": [3, 5], "bebidas": [] }
            $table->json('detalles_consumo')->nullable(); 
            
            $table->decimal('total', 10, 2)->nullable(); // Total calculado
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservas');
        Schema::dropIfExists('experiencias');
        Schema::dropIfExists('platos');
        Schema::dropIfExists('mesas');
        Schema::dropIfExists('clientes');
    }
};
