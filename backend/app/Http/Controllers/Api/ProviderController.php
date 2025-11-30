<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderRequest;
use App\Http\Requests\UpdateProviderRequest;
use App\Models\Provider;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    /**
     * GET /api/providers?page=1&per_page=8&search=...&status=active|inactive
     */
    public function index(Request $request)
    {
        $search  = $request->query('search');
        $status  = $request->query('status');
        $perPage = (int) ($request->query('per_page', 10) ?? 10);
        $perPage = max(1, min($perPage, 100)); // límite sano

        $query = Provider::query();

        // search por nit, name, email, phone
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nit', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // status: active|inactive
        if ($status) {
            $query->where('status', $status);
        }

        $providers = $query
            ->orderByDesc('id')
            ->paginate($perPage);

        return response()->json([
            'status'  => true,
            'message' => 'Listado de proveedores.',
            'data'    => $providers,
        ]);
    }

    /**
     * POST /api/providers
     */
    public function store(StoreProviderRequest $request)
    {
        $provider = Provider::create($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Proveedor creado exitosamente.',
            'data'    => $provider,
        ], 201);
    }

    /**
     * GET /api/providers/{provider}
     */
    public function show(Provider $provider)
    {
        $provider->load('contacts');

        return response()->json([
            'status'  => true,
            'message' => 'Detalle del proveedor.',
            'data'    => $provider,
        ]);
    }

    /**
     * PUT/PATCH /api/providers/{provider}
     */
    public function update(UpdateProviderRequest $request, Provider $provider)
    {
        $provider->update($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Proveedor actualizado.',
            'data'    => $provider->fresh(), // devuelve lo último
        ]);
    }

    /**
     * DELETE /api/providers/{provider}
     */
    public function destroy(Provider $provider)
    {
        $provider->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Proveedor eliminado exitosamente.',
            'data'    => null,
        ]);
    }
}
