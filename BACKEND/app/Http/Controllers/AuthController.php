<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Cliente;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dni' => 'required|string|max:20|unique:clientes',
            'nombres' => 'required|string|max:200',
            'telefono' => 'nullable|string|max:20',
            'correo' => 'required|string|email|max:100|unique:clientes',
            'password' => 'required|string|min:4',
            'fecha_nacimiento' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $cliente = Cliente::create([
                'dni' => $request->dni,
                'nombres' => $request->nombres,
                'telefono' => $request->telefono,
                'correo' => $request->correo,
                'password' => Hash::make($request->password),
                'fecha_nacimiento' => $request->fecha_nacimiento,
                'activo' => true
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Usuario registrado exitosamente',
                'user' => $cliente
            ], 201);
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

        // Check if input is email or DNI
        $loginInput = $request->dni;

        if (strtolower($loginInput) === 'admin') {
            $user = Cliente::where('correo', 'admin@restaurant.com')->first();
        } else {
            $field = filter_var($loginInput, FILTER_VALIDATE_EMAIL) ? 'correo' : 'dni';
            $user = Cliente::where($field, $loginInput)->first();
        }
        
        // Check password (hash) or plaintext (for old seeded admin if any, but new seeder hashes it)
        if (!$user || !Hash::check($request->password, $user->password)) {
             // Fallback for plain text '123' if somehow seeder didn't hash it, though it did.
             if (!$user || $request->password !== $user->password) {
                return response()->json(['message' => 'Credenciales inválidas'], 401);
             }
        }

        if (!$user->activo) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        return response()->json([
            'message' => 'Login exitoso',
            'user' => $user
        ], 200);
    }
}
