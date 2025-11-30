<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $status = $this->input('status');

        if (is_string($status)) {
            $s = mb_strtolower(trim($status));
            if ($s === 'activo') $status = 'active';
            if ($s === 'inactivo') $status = 'inactive';
        }

        $this->merge([
            'nit'     => is_string($this->nit) ? trim($this->nit) : $this->nit,
            'name'    => is_string($this->name) ? trim($this->name) : $this->name,
            'email'   => is_string($this->email) ? trim($this->email) : $this->email,
            'phone'   => is_string($this->phone) ? trim($this->phone) : $this->phone,
            'address' => is_string($this->address) ? trim($this->address) : $this->address,
            'status'  => $status,
        ]);
    }

    public function rules(): array
    {
        return [
            'nit'     => ['required', 'string', 'max:50', Rule::unique('providers', 'nit')],
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
            'nit.required'  => 'El NIT es obligatorio.',
            'nit.unique'    => 'Ese NIT ya está registrado.',
            'name.required' => 'El nombre es obligatorio.',
            'status.in'     => 'El estado debe ser active o inactive.',
        ];
    }
}
