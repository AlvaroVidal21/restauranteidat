<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('mesa', function (Blueprint $table) {
            $table->string('tipo', 20)->default('familiar'); // solitario | romantica | familiar
            $table->string('zona', 50)->default('salon');
            $table->integer('sillas')->default(2);
            $table->boolean('disponible')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('mesa', function (Blueprint $table) {
            $table->dropColumn(['tipo', 'zona', 'sillas', 'disponible']);
        });
    }
};
