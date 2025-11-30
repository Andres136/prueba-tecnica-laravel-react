<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProviderController;
use App\Http\Controllers\Api\ProviderContactController;

// ✅ Login público (sin token)
Route::post('auth/login', [AuthController::class, 'login']);

// 🔒 Todo lo demás requiere token (Sanctum)
Route::middleware('auth:sanctum')->group(function () {

    // Usuario autenticado (opcional)
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Auth
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);

    // Proveedores
    Route::apiResource('providers', ProviderController::class);

    // Contactos:
    // GET/POST   /api/providers/{provider}/contacts
    // GET/PUT/DEL /api/contacts/{contact}
    Route::apiResource('providers.contacts', ProviderContactController::class)->shallow();
});
