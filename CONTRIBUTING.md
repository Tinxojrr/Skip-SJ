# Guía de Trabajo en Equipo - Skip SJ

Bienvenidos al repositorio principal de Skip SJ. 
Para asegurar que no sobreescribamos el código del otro y mantengamos el proyecto ordenado, utilizaremos el siguiente flujo de trabajo basado en Git Flow.

## Estructura de Ramas

1. **`main` (Producción)**
   * NUNCA debes programar ni hacer commits directamente en esta rama.
   * Contiene el código estable y finalizado.
   * Solo se actualiza mediante Pull Requests aprobados.

2. **`dev` (Desarrollo)**
   * Es el borrador oficial de la aplicación. Aquí se junta el trabajo de todo el equipo.
   * Debes hacer un `git pull origin dev` al inicio de tu jornada para tener el código más reciente de todos.
   * Tampoco debes programar directamente aquí.

3. **`feature/*` (Tu espacio de trabajo)**
   * Cuando tomes un ticket en Jira, debes crear una rama nueva partiendo de `dev`.
   * El nombre de la rama debe indicar lo que harás: `feature/login`, `feature/carrito`, `fix/boton-roto`.

---

## Flujo de Trabajo (Paso a Paso)

### 1. Sincroniza tu entorno
Antes de empezar a programar en tu PC, asegúrate de estar parado en la rama `dev` y descargar los últimos cambios que hicieron tus compañeros:
```bash
git checkout dev
git pull origin dev
```

### 2. Crea tu rama de trabajo
Crea la rama exclusiva para la tarea que elegiste en Jira:
```bash
git checkout -b feature/nombre-de-tu-tarea
```

### 3. Programar y Commit
Haz todos los cambios necesarios en el código y crea tus commits con mensajes claros:
```bash
git add .
git commit -m "feat: diseño inicial de la pantalla de login"
```

### 4. Sube tu rama a GitHub
Cuando termines tu tarea y todo funcione en tu PC, sube tu rama a la nube:
```bash
git push -u origin feature/nombre-de-tu-tarea
```

### 5. Abre un Pull Request (PR)
1. Entra a la página del repositorio en GitHub.
2. Te aparecerá un botón para crear un Pull Request desde tu rama `feature/...` hacia la rama `dev`.
3. Pide a un compañero que revise tu código y apruebe el PR.
4. Una vez aprobado, haz el Merge (unión) para que tu código forme parte oficial de `dev`.

### 6. Limpieza y a empezar de nuevo
Borra tu rama local y vuelve al Paso 1 para tu siguiente ticket.
