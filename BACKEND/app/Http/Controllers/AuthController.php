<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string|max:8|unique:cliente',
            'nombres' => 'required|string|max:200',
            'telefono' => 'required|string|max:20|unique:cliente',
            'correo' => 'required|string|email|max:100|unique:cliente',
            'password' => 'required|string|min:6',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::table('cliente')->insert([
                'dni' => $request->dni,
                'nombres' => $request->nombres,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'password' => Hash::make($request->password),
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'fechasistema' => now(),
                'usuario' => 1,
                'estadocliente' => 1
            ]);

            return response()->json(['message' => 'Usuario registrado exitosamente'], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al registrar usuario', 'error' => $e->getMessage()], 500);
        }
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = DB::table('cliente')->where('dni', $request->dni)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        // For simplicity, returning user data. In production, use Sanctum/Passport.
        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user
        ], 200);
    }
}
