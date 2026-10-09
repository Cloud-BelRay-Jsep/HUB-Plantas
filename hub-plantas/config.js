/* ==========================================================================
   HUB PLANTAS · CONFIGURACIÓN
   --------------------------------------------------------------------------
   Este es el ÚNICO archivo que necesitas editar en el día a día:
     1. Pegar las URLs de los dashboards de Looker Studio   → modules[].url
     2. Cambiar la cobertura de un módulo por planta         → modules[].coverage
     3. Cambiar logos, textos o el orden de las plantas      → brand / plants

   No hace falta compilar nada: guarda el archivo, súbelo al servidor y
   recarga la página (Ctrl+F5 para saltar la caché).
   ========================================================================== */

window.HUB_CONFIG = {

  /* ------------------------------------------------------------------------
     MARCA
     Deja logo vacío ('') para mostrar el recuadro de reemplazo con texto.
     Para usar un logo: copia el archivo a assets/img/ y escribe la ruta,
     p. ej. 'assets/img/logo-anglo-american.svg'. Se recomienda SVG o PNG
     con fondo transparente, ~40 px de alto. Si el logo es oscuro, añade
     logoDark con una versión clara para el modo oscuro.
     ------------------------------------------------------------------------ */
  brand: {
    title: 'HUB Plantas',
    subtitle: 'Soluciones de lubricación en Los Bronces',
    client:  { name: 'Anglo American', logo: 'assets/img/logo-anglo-american.png', logoDark: 'assets/img/logo-anglo-american-dark.png' },
    partner: { name: 'Bel-Ray Chile',  logo: 'assets/img/logo-belray.png',         logoDark: '' },
    statusText: 'Sistema operativo',
    siteText: 'Los Bronces, alta cordillera',
    timeZone: 'America/Santiago'
  },

  /* ------------------------------------------------------------------------
     PLANTAS
     id     → identificador interno (sin espacios ni tildes). No lo cambies
              una vez publicado: se usa en los enlaces directos.
     name   → nombre visible.
     short  → abreviatura para la matriz de cobertura (pantallas angostas).
     ------------------------------------------------------------------------ */
  plants: [
    { id: 'chancado-primario', name: 'Chancado Primario', short: 'Ch. Primario' },
    { id: 'molienda-sag',      name: 'Molienda SAG',      short: 'SAG' },
    { id: 'confluencia',       name: 'Confluencia',       short: 'Confluencia' },
    { id: 'pre-chancado-cf',   name: 'Pre-Chancado CF',   short: 'Pre CF' },
    { id: 'pre-chancado-sag',  name: 'Pre-Chancado SAG',  short: 'Pre SAG' }
  ],

  /* ------------------------------------------------------------------------
     CATEGORÍAS (agrupan los módulos en la portada)
     ------------------------------------------------------------------------ */
  categories: [
    { id: 'automatizacion', name: 'Automatización' },
    { id: 'tribologia',     name: 'Tribología y monitoreo' },
    { id: 'contrato',       name: 'Gestión de contrato' }
  ],

  /* ------------------------------------------------------------------------
     MÓDULOS
     Cada módulo tiene una o más VISTAS (tableros). Si tiene una sola vista,
     se abre directo; si tiene varias, el visor muestra una fila de pestañas
     (ej. Parámetros Operacionales → un tablero por molino).

     views[].url → enlace del tablero:
        ▸ Looker Studio: puedes pegar el enlace tal como aparece en el
          navegador (…/u/0/reporting/…/edit), la URL de inserción
          (…/embed/reporting/…) o incluso el código <iframe …> completo
          que entrega Archivo › Insertar informe. El HUB lo normaliza solo.
          IMPORTANTE: en Looker Studio activa Archivo › Insertar informe ›
          "Habilitar inserción" y comparte el informe con los usuarios.
        ▸ Página web (GitHub Pages u otra): cualquier https://… que permita
          mostrarse dentro de un iframe.
        Déjalo en '' si aún no existe: el visor mostrará "Dashboard en
        preparación".
     views[].id  → identificador corto (se usa en enlaces directos:
                   #planta=molienda-sag&modulo=parametros&vista=mb3)

     coverage → estado por planta (usa los id de plantas):
                  'activo'        servicio disponible
                  'proximamente'  se mostrará con badge "Próximamente"
                Cualquier planta que NO aparezca aquí se muestra como
                "No aplica".
     ------------------------------------------------------------------------ */
  modules: [
    {
      id: 'lubricadores',
      category: 'automatizacion',
      name: 'Lubricadores Automáticos',
      description: 'Estado de cada lubricador instalado, recargas próximas y vencidas, y alertas de dispositivo por criticidad del equipo.',
      views: [
        // ▼▼▼ URL — Looker Studio · Lubricadores Automáticos
        { id: 'general', name: 'Lubricadores Automáticos',
          url: 'https://datastudio.google.com/embed/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_piypaj1njd' }
      ],
      coverage: {
        'chancado-primario': 'activo',
        'molienda-sag':      'activo',
        'confluencia':       'activo',
        'pre-chancado-cf':   'activo',
        'pre-chancado-sag':  'activo'
      }
    },
    {
      id: 'gateway',
      category: 'automatizacion',
      name: 'Gateway',
      description: 'Conectividad y transmisión de datos de los lubricadores hacia la nube, por gateway y zona de cobertura.',
      views: [
        // ▼▼▼ URL — Looker Studio · Gateway
        { id: 'general', name: 'Gateway',
          url: 'https://datastudio.google.com/embed/reporting/b8d78077-35ab-441a-95f3-4b9995313b67/page/p_5ht5aqmitd' }
      ],
      coverage: {
        'confluencia': 'activo'
      }
    },
    {
      id: 'aceite',
      category: 'tribologia',
      name: 'Análisis de Aceite',
      description: 'Resultados de laboratorio por equipo y compartimento: desgaste, contaminación y condición del lubricante en el tiempo.',
      views: [
        // ▼▼▼ URL — Looker Studio · Análisis de Aceite
        { id: 'general', name: 'Análisis de Aceite',
          url: 'https://datastudio.google.com/embed/reporting/53e0b950-6c81-4598-ae4a-ca9d1db824b5/page/p_mfeqkl7b0c' }
      ],
      coverage: {
        'confluencia':       'activo',
        'molienda-sag':      'activo',
        'chancado-primario': 'activo'
      }
    },
    {
      id: 'parametros',
      category: 'tribologia',
      name: 'Parámetros Operacionales',
      description: 'Seguimiento de variables de operación de los molinos para relacionarlas con la condición de lubricación. Un tablero por equipo.',
      views: [
        // ▼▼▼ URL — Página web · Molino SAG 2
        { id: 'sag2', name: 'Molino SAG 2',
          url: 'https://cloud-belray-jsep.github.io/Molino_SAG2_Synergy220/' },
        // ▼▼▼ URL — Página web · Molino de Bolas 2
        { id: 'mb2', name: 'Molino de Bolas 2',
          url: 'https://cloud-belray-jsep.github.io/Synergy-220/' },
        // ▼▼▼ URL — Página web · Molino de Bolas 3
        { id: 'mb3', name: 'Molino de Bolas 3',
          url: 'https://cloud-belray-jsep.github.io/MB03_Synergy_220/' }
      ],
      coverage: {
        'molienda-sag': 'activo'
      }
    },
    {
      id: 'reporte',
      category: 'contrato',
      name: 'Reporte del Servicio',
      description: 'Cumplimiento de actividades del contrato de lubricación, hallazgos y avance del servicio por periodo.',
      views: [
        // ▼▼▼ URL — Looker Studio · Reporte del Servicio
        { id: 'general', name: 'Reporte del Servicio',
          url: 'https://datastudio.google.com/embed/reporting/483bfb33-cfd1-4a19-9e9f-c2699c30359c/page/p_qxs1f4y62c' }
      ],
      coverage: {
        'confluencia':       'activo',
        'molienda-sag':      'activo',
        'chancado-primario': 'activo'
      }
    }
  ]
};
