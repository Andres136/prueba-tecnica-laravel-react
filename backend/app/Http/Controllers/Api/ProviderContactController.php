<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProviderContactRequest;
use App\Http\Requests\UpdateProviderContactRequest;
use App\Models\Provider;
use App\Models\ProviderContact;

class ProviderContactController extends Controller
{
    // GET /api/providers/{provider}/contacts
    public function index(Provider $provider)
    {
        $contacts = $provider->contacts()->orderBy('id', 'desc')->get();

        return response()->json([
            'status'  => true,
            'message' => 'Listado de contactos.',
            'data'    => $contacts,
        ]);
    }

    // POST /api/providers/{provider}/contacts
    public function store(StoreProviderContactRequest $request, Provider $provider)
    {
        $contact = $provider->contacts()->create($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Contacto creado exitosamente.',
            'data'    => $contact,
        ], 201);
    }

    // GET /api/contacts/{contact}
    public function show(ProviderContact $contact)
    {
        return response()->json([
            'status'  => true,
            'message' => 'Detalle del contacto.',
            'data'    => $contact,
        ]);
    }

    // PUT/PATCH /api/contacts/{contact}
    public function update(UpdateProviderContactRequest $request, ProviderContact $contact)
    {
        $contact->update($request->validated());

        return response()->json([
            'status'  => true,
            'message' => 'Contacto actualizado.',
            'data'    => $contact->fresh(),
        ]);
    }

    // DELETE /api/contacts/{contact}
    public function destroy(ProviderContact $contact)
    {
        $contact->delete();

        return response()->json([
            'status'  => true,
            'message' => 'Contacto eliminado.',
            'data'    => null,
        ]);
    }
}
