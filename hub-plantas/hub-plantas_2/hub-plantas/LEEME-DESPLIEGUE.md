# HUB Plantas — Guía de despliegue y mantención

Portal de acceso a las soluciones del servicio de lubricación Bel-Ray Chile en las plantas de Anglo American Los Bronces.

Es un sitio **100 % estático**: no necesita base de datos, Node, PHP ni compilación. Tampoco depende de CDNs externos (la fuente va incluida), así que funciona aunque la red corporativa bloquee Tailwind, Google Fonts u otros servicios.

## Contenido de la carpeta

```
hub-plantas/
├── index.html              ← la página
├── config.js               ← ★ ÚNICO archivo que se edita: URLs, plantas, cobertura, logos
├── LEEME-DESPLIEGUE.md     ← esta guía
└── assets/
    ├── css/hub.css         ← estilos (colores en variables al inicio)
    ├── js/hub.js           ← lógica (no requiere cambios)
    ├── fonts/              ← fuente Archivo (licencia OFL incluida)
    └── img/                ← favicon y aquí van tus logos
```

## 1. Antes de publicar: habilitar la inserción en Looker Studio

Para cada informe de Looker Studio (Lubricadores, Gateway, Análisis de Aceite, Reporte del Servicio):

1. Abre el informe en modo edición.
2. **Archivo › Insertar informe** (*Embed report*) › marca **Habilitar inserción** › Listo.
3. **Compartir**: agrega a las personas o al dominio de Anglo American con permiso de *Lector*. Si el informe usa credenciales del propietario, los lectores verán los datos sin acceso directo a BigQuery.

Si un dashboard aparece en blanco dentro del HUB, casi siempre es uno de estos dos puntos. El botón **Abrir en pestaña nueva** del visor siempre funciona como respaldo.

> No necesitas convertir las URLs: puedes pegar el enlace tal como aparece en el navegador (`…/u/0/reporting/…/edit`), la URL `/embed/` o el código `<iframe …>` completo que entrega Looker. El HUB lo normaliza y aplica los mismos permisos de seguridad (`sandbox`) que recomienda Google.

## 2. Opciones de publicación

### A. Servidor web corporativo (IIS, Apache o Nginx)
1. Copia la carpeta `hub-plantas` completa al directorio publicado (p. ej. `C:\inetpub\wwwroot\hub-plantas` o `/var/www/html/hub-plantas`).
2. Abre `https://<servidor>/hub-plantas/` y listo.
3. **IIS**: verifica que el tipo MIME `.woff2` exista (`font/woff2`). Si no, agrégalo en *Tipos MIME* del sitio.
4. Si el servidor envía una cabecera **Content-Security-Policy**, debe permitir los iframes:
   `frame-src https://lookerstudio.google.com https://datastudio.google.com https://cloud-belray-jsep.github.io;`

### B. GitHub Pages (igual que tus tableros Synergy)
1. Crea un repositorio (p. ej. `HUB-Plantas`) en la organización `cloud-belray-jsep`.
2. Sube el **contenido** de la carpeta (que `index.html` quede en la raíz del repositorio).
3. *Settings › Pages › Branch: main / root* › Save.
4. Quedará en `https://cloud-belray-jsep.github.io/HUB-Plantas/`.

Ten presente que GitHub Pages es público para quien tenga el enlace: los dashboards de Looker siguen pidiendo sesión, pero las páginas web embebidas (Synergy) no.

### C. Probar en tu computador
Doble clic en `index.html` funciona, aunque algunos navegadores limitan iframes desde `file://`. Para una prueba fiel, en la carpeta ejecuta `python -m http.server 8000` y abre `http://localhost:8000`.

## 3. Mantención diaria (todo en `config.js`)

| Quiero… | Qué edito |
|---|---|
| Cambiar la URL de un dashboard | `modules[].views[].url` |
| Agregar un tablero a un módulo (ej. un nuevo molino) | Agregar un objeto `{ id, name, url }` dentro de `views` del módulo |
| Activar un módulo en otra planta | En `coverage`, agregar `'id-planta': 'activo'` |
| Anunciar que viene pronto | `'id-planta': 'proximamente'` |
| Poner los logos | Copiar el archivo a `assets/img/` y escribir la ruta en `brand.client.logo` / `brand.partner.logo` (opcional `logoDark` para modo oscuro) |

Después de guardar, sube `config.js` al servidor y recarga con **Ctrl + F5**.

## 4. Enlaces directos para compartir

Cada vista tiene su propia dirección; copia la barra del navegador y envíala por correo:

- Planta filtrada: `…/hub-plantas/#planta=confluencia`
- Módulo abierto: `…/hub-plantas/#planta=molienda-sag&modulo=aceite`
- Tablero específico: `…/hub-plantas/#planta=molienda-sag&modulo=parametros&vista=mb3`

IDs de planta: `chancado-primario`, `molienda-sag`, `confluencia`, `pre-chancado-cf`, `pre-chancado-sag`.
IDs de módulo: `lubricadores`, `gateway`, `aceite`, `parametros` (vistas `sag2`, `mb2`, `mb3`), `reporte`.

## 5. Compatibilidad

Chrome, Edge, Firefox y Safari actuales; escritorio, tablet y móvil. La transición circular al cambiar de tema usa la *View Transitions API* (Chrome/Edge/Safari recientes); en los demás el cambio es instantáneo. Si el sistema tiene activado "reducir movimiento", las animaciones se desactivan.
