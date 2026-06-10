# mypocket

Extensión Manifest V3 para guardar y organizar enlaces localmente. Los datos viven en IndexedDB mediante Dexie y no salen del navegador.

## Desarrollo

```bash
npm install
npm run dev
```

## Cargar la extensión

```bash
npm run build
```

Después abre `chrome://extensions`, activa el modo desarrollador y usa **Cargar descomprimida** seleccionando la carpeta `dist`.

## Funciones

- Guardar manualmente un enlace o precargar la pestaña activa.
- Abrir una biblioteca amplia en una pestaña nueva.
- Editar y eliminar enlaces.
- Marcar favoritos.
- Buscar por título, URL o etiqueta.
- Filtrar por etiqueta y favoritos.
