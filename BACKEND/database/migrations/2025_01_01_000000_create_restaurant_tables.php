<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cliente', function (Blueprint $table) {
            $table->id('idcliente');
            $table->string('dni', 8)->unique();
            $table->string('nombres', 200);
            $table->string('telefono', 20)->unique();
            $table->string('correo', 100)->unique();
            $table->string('password'); // Added password
            $table->date('fecha_nacimiento')->nullable(); // Added DOB
            $table->date('fechasistema');
            $table->integer('usuario')->default(1); // Default user value
            $table->integer('estadocliente')->default(1);
        });

        Schema::create('mesa', function (Blueprint $table) {
            $table->id('idmesa');
            $table->string('codigoinventario', 10)->unique();
            $table->string('nombremessa', 10)->unique();
            $table->string('descripcionmesa', 150);
            $table->string('ubicacionmesa', 100);
            $table->integer('cantidadsillas');
            $table->date('fecharegistro');
            $table->integer('usuario');
            $table->integer('estadouso');
            $table->integer('estadogeneral');
        });

        Schema::create('platos', function (Blueprint $table) {
            $table->id('idplato');
            $table->string('nombreplato', 100)->unique();
            $table->string('categoria', 100);
            $table->decimal('precio', 10, 2); // Added Price
            $table->integer('estadoplato');
        });

        Schema::create('experiencias', function (Blueprint $table) {
            $table->id('idexperiencia');
            $table->string('nombre', 100);
            $table->string('descripcion', 255)->nullable();
            $table->decimal('precio', 10, 2);
            $table->integer('estado')->default(1);
        });

        Schema::create('reserva', function (Blueprint $table) {
            $table->id('idreserva');
            $table->integer('cliente');
            $table->integer('mesa');
            $table->integer('plato_id')->nullable(); // Linked Dish
            $table->integer('experiencia_id')->nullable(); // Linked Experience
            $table->date('fechareserva');
            $table->string('horainicio', 20);
            $table->string('horafin', 20);
            $table->integer('cantidadpersonas');
            $table->string('motivo', 200)->nullable();
            $table->string('tipopago', 50)->nullable();
            $table->date('fechasistema');
            $table->integer('usuario')->default(1);
            $table->integer('estadoreserva')->default(1);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reserva');
        Schema::dropIfExists('platos');
        Schema::dropIfExists('mesa');
        Schema::dropIfExists('cliente');
    }
};
