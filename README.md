# Guia express (modo dummies)

Haz exactamente esto para ver la misma app y los mismos datos que yo.

## 0. Requisitos previos
- Git
- PHP 8.2 o superior + Composer
- Node.js 18+ (npm viene incluido)
- Alguna base de datos. Si no tienes nada instalado usa SQLite.

## 1. Clonar el proyecto
```bash
git clone https://github.com/AlvaroVidal21/restauranteidat.git
cd restauranteidat
```

## 2. Backend Laravel
```bash
cd BACKEND
composer install
cp .env.example .env   # en Windows usa: copy .env.example .env
```

### 2.1 Configurar la base de datos
Escoge UNA de estas opciones:
1. **SQLite (mas facil)**: deja `DB_CONNECTION=sqlite` en `.env` y comenta las demas variables de DB. Laravel creara `database/database.sqlite` al vuelo.
2. **MySQL/Postgres**: completa `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` con tus credenciales.

### 2.2 Cargar los datos oficiales
```bash
php artisan key:generate
php artisan migrate --seed   # crea tablas + inserta datos de ejemplo
php artisan serve            # backend escuchando en http://127.0.0.1:8000
```
El seeder agrega clientes, mesas, platos, experiencias y reservas reales para que el dashboard nunca este vacio.

Credenciales rapidas:
- `admin@restaurant.com` / `123`

## 3. Frontend React
Abre otra terminal:
```bash
cd FRONTEND
npm install
npm start           # abre http://localhost:3000
```
Asegurate de que el backend siga activo; el frontend consume `http://127.0.0.1:8000/api`.

## 4. Tips de rescate
- Si rompes la data, corre `php artisan migrate:fresh --seed` para volver al estado inicial.
- Siempre levanta primero el backend y luego el frontend.
- Los cambios de React se ven al guardar, no necesitas reiniciar `npm start`.

Listo. Con esto cualquier compa puede clonar, correr dos comandos y ver exactamente lo mismo que tu.
