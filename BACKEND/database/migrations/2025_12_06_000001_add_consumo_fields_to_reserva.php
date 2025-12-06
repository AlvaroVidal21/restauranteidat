<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reserva', function (Blueprint $table) {
            $table->integer('drink_id')->nullable()->after('experiencia_id');
            $table->string('drink_name', 150)->nullable()->after('drink_id');
            $table->json('opcionales')->nullable()->after('cantidadpersonas');
            $table->json('opcionales_nombres')->nullable()->after('opcionales');
            $table->json('extras')->nullable()->after('opcionales_nombres');
        });
    }

    public function down(): void
    {
        Schema::table('reserva', function (Blueprint $table) {
            $table->dropColumn(['extras', 'opcionales_nombres', 'opcionales', 'drink_name', 'drink_id']);
        });
    }
};
