<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('providers', function (Blueprint $table) {
            $table->id();
            $table->string('name');                  // Nombre proveedor
            $table->string('nit')->unique();         // NIT único
            $table->string('email')->nullable();     // Email proveedor
            $table->string('phone')->nullable();     // Teléfono proveedor
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();                    // created_at, updated_at
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('providers');
    }
};
