<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    private function providerId(): ?int
    {
        // Soporta: {provider} (apiResource), {id}, o route-model-binding
        $provider = $this->route('provider') ?? $this->route('id');

        if (is_object($provider) && isset($provider->id)) {
            return (int) $provider->id;
        }

        if (is_numeric($provider)) {
            return (int) $provider;
        }

        // Fallback: si llega en body (no ideal, pero evita romper)
        $id = $this->input('id');
        return is_numeric($id) ? (int) $id : null;
    }

    protected function prepareForValidation(): void
    {
        // Normaliza status si tu frontend manda "Activo/Inactivo"
        $status = $this->input('status');

        if (is_string($status)) {
            $s = mb_strtolower(trim($status));
            if ($s === 'activo') $status = 'active';
            if ($s === 'inactivo') $status = 'inactive';
        }

        $this->merge([
            'nit'    => is_string($this->nit) ? trim($this->nit) : $this->nit,
            'name'   => is_string($this->name) ? trim($this->name) : $this->name,
            'email'  => is_string($this->email) ? trim($this->email) : $this->email,
            'phone'  => is_string($this->phone) ? trim($this->phone) : $this->phone,
            'address'=> is_string($this->address) ? trim($this->address) : $this->address,
            'status' => $status,
        ]);
    }

    public function rules(): array
    {
        $providerId = $this->providerId();

        return [
            'nit'     => ['required', 'string', 'max:50', Rule::unique('providers', 'nit')->ignore($providerId)],
            'name'    => ['required', 'string', 'max:255'],
            'email'   => ['nullable', 'email', 'max:255'],
            'phone'   => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'status'  => ['required', Rule::in(['active', 'inactive'])],
        ];
    }

    public function messages(): array
    {
        return [
            'nit.required' => 'El NIT es obligatorio.',
            'nit.unique'   => 'Ese NIT ya está registrado.',
            'name.required'=> 'El nombre es obligatorio.',
            'status.in'    => 'El estado debe ser active o inactive.',
        ];
    }
}
