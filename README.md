
# Prueba Técnica Laravel + React

Repositorio para la prueba técnica:

- Backend: Laravel 10 (carpeta `backend/`)
- Frontend: React + Vite + Tailwind (se añadirá en `frontend/`)

## Requisitos

- PHP 8.2+
- Composer
- MySQL o MariaDB
- Node.js 18+

## Backend (Laravel)

```bash
cd backend
cp .env.example .env
php artisan key:generate
# Configurar conexión a base de datos en .env
php artisan migrate
php artisan serve
