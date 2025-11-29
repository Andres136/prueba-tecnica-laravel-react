<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProviderController;
use App\Http\Controllers\Api\ProviderContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Aquí registras las rutas de tu API.
|--------------------------------------------------------------------------
*/

// ✅ Login público (sin token)
Route::post('auth/login', [AuthController::class, 'login']);

// 🔒 Todo lo demás requiere token (Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado (opcional, útil para probar)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Endpoints de auth
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Proveedores
    Route::apiResource('providers', ProviderController::class);

    // Contactos (nested + shallow)
    // - GET/POST /api/providers/{provider}/contacts
    // - GET/PUT/DELETE /api/contacts/{contact}
    Route::apiResource('providers.contacts', ProviderContactController::class)->shallow();
});

