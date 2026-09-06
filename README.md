# APP-RECETAS
APP Implementación React Native
 App de Recetas - React Native & Expo

Aplicación móvil desarrollada en **React Native (Expo)** para la gestión y organización personal de recetas de cocina. Permite registrarse, crear, editar, buscar en tiempo real, filtrar y marcar recetas como favoritas, almacenando toda la información localmente mediante **SQLite**.

---

 Características Principales

- **Autenticación de Usuarios**: Control de acceso y sesiones locales seguras.
- **Gestión Completa de Recetas**:
  - Crear nuevas recetas con nombre, ingredientes, instrucciones y tiempo de preparación.
  - **Editar recetas existentes** con actualización instantánea en la base de datos.
  - Eliminar recetas con confirmación previa.
- **Búsqueda y Filtros en Tiempo Real**: Buscador dinámico por nombre o ingredientes, junto con filtros rápidos 
- **Base de Datos Local (SQLite)**: Persistencia de datos eficiente y offline utilizando `expo-sqlite`.
- **Interfaz Moderna (UI/UX)**: Diseño cuidado con paleta de colores morada y coral, tarjetas estilizadas y estados vacíos ilustrados.

---

 Tecnologías Utilizadas

- **React Native** / **Expo** (Framework principal)
- **React Navigation** (Navegación por pestañas y pilas: Stack & Bottom Tabs)
- **Expo SQLite** (Base de datos relacional local)
- **JavaScript (ES6+)**

---

 Instalación y Configuración Local

Sigue estos pasos para ejecutar el proyecto en tu entorno de desarrollo:

1. **Clona el repositorio**:
   ```bash
   git clone [https://github.com/tu-usuario/nombre-de-tu-repositorio.git](https://github.com/tu-usuario/nombre-de-tu-repositorio.git)
   cd nombre-de-tu-repositorio

   Instala las dependencias:
   npm install

   Inicia la aplicación con Expo:
   npx expo start

  Escanea el código QR con la aplicación Expo Go en tu dispositivo móvil o ejecuta un emulador de Android/iOS.
