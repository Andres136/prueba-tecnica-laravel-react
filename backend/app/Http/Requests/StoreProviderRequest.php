<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProviderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'  => 'required|string|max:255',
            'nit'   => 'required|string|max:50|unique:providers,nit',
            'email' => 'required|email|unique:providers,email',
            'phone' => 'nullable|string|max:50',
            'status'=> 'required|in:active,inactive',
        ];
    }
}

