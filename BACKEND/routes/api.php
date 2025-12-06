<?php

use App\Http\Controllers\PlatoController;
use App\Http\Controllers\MesaController;
use App\Http\Controllers\ClienteController;
use App\Http\Controllers\ReservaController;


use App\Http\Controllers\AuthController;

// RUTAS PARA LA CLASE PLATOS

Route::get('/listarplatos', [PlatoController::class, 'index']);
Route::post('/saveplatos', [PlatoController::class, 'store']);
Route::delete('/platos/{id}', [PlatoController::class, 'destroy']);
Route::get('/platos/{id}', [PlatoController::class, 'show']);   // Obtener datos
Route::put('/platos/{id}', [PlatoController::class, 'update']); // Actualizar

// RUTAS PARA EXPERIENCIAS
Route::get('/experiencias', function () {
    return \Illuminate\Support\Facades\DB::table('experiencias')->where('estado', 1)->get();
});

// RUTAS PARA AUTH
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// RUTAS PARA LA CLASE MESAS
Route::get('/mesas', [MesaController::class, 'index']);

// RUTAS PARA LA CLASE CLIENTES
Route::get('/clientes', [ClienteController::class, 'index']);
Route::post('/saveclientes', [AuthController::class, 'register']);
Route::delete('/clientes/{id}', [ClienteController::class, 'destroy']);
Route::get('/clientes/{id}', [ClienteController::class, 'show']);
Route::put('/clientes/{id}', [ClienteController::class, 'update']);

// RUTAS PARA LA CLASE RESERVAS
// RUTAS PARA LA CLASE RESERVAS
Route::get('/listareservas', [ReservaController::class, 'index']);
Route::post('/reservas', [ReservaController::class, 'store']);
Route::post('/check-availability', [ReservaController::class, 'checkAvailability']);
Route::put('/reservas/{id}', [ReservaController::class, 'update']);
Route::delete('/reservas/{id}', [ReservaController::class, 'destroy']);

Route::get('/test', function () {
    return 'api funcionando';
});
