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
  // El orden de esta lista define el orden de los pilares en la portada,
  // en las filas de la matriz de cobertura y en las pestañas del visor.
  categories: [
    { id: 'lubricantes',    name: 'Lubricantes' },
    { id: 'automatizacion', name: 'Automatización' },
    { id: 'servicio',       name: 'Servicio' },
    { id: 'tfm',            name: 'Total Fluid Management (TFM)', short: 'TFM' }   // transversal: siempre al final
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
        ▸ Carpeta de Google Drive: pega el enlace de la carpeta
          (…/drive/folders/…). Se muestra como lista de archivos.
          IMPORTANTE: compártela como "Cualquier persona con el vínculo".
        ▸ Página web (GitHub Pages u otra): cualquier https://… que permita
          mostrarse dentro de un iframe.
        Déjalo en '' si aún no existe: el visor mostrará "Dashboard en
        preparación".
     views[].urlPorPlanta → (opcional) una URL distinta para cada planta,
                   p. ej. la página de esa planta dentro del mismo informe.
                   Al cambiar de planta, el visor salta solo a esa página.
                   Las plantas que no aparezcan usan views[].url.
                   Si url queda en '' y hay urlPorPlanta, con "Todas las
                   plantas" el visor pide elegir una planta.
     views[].id  → identificador corto (se usa en enlaces directos:
                   #planta=molienda-sag&modulo=parametros&vista=mb3)

     coverage → estado por planta (usa los id de plantas):
                  'activo'        servicio disponible
                  'parcial'       disponible, con avance parcial
                  'proximamente'  aún sin avance (badge "Próximamente")
                Cualquier planta que NO aparezca aquí se muestra como
                "Próximamente".

     etiquetas → (opcional) cambia los textos de cada estado para ese
                módulo, p. ej. { activo: 'Implementadas',
                parcial: 'Avance parcial' }.
     ------------------------------------------------------------------------ */
  modules: [
    {
      id: 'aceite',
      category: 'lubricantes',
      name: 'Análisis de Aceite',
      description: 'Resultados de laboratorio por equipo y compartimento: desgaste, contaminación y condición del lubricante en el tiempo.',
      views: [
        // ▼▼▼ URL — Looker Studio · Análisis de Aceite
        { id: 'general', name: 'Análisis de Aceite',
          // Vista general (se usa con "Todas las plantas")
          url: 'https://datastudio.google.com/embed/reporting/53e0b950-6c81-4598-ae4a-ca9d1db824b5/page/p_mfeqkl7b0c',
          // Bitácora de análisis de aceite de cada planta
          urlPorPlanta: {
            'chancado-primario': 'https://datastudio.google.com/u/0/reporting/53e0b950-6c81-4598-ae4a-ca9d1db824b5/page/p_rfw1gy691d',
            'molienda-sag':      'https://datastudio.google.com/u/0/reporting/53e0b950-6c81-4598-ae4a-ca9d1db824b5/page/p_4humjdpthd',
            'confluencia':       'https://datastudio.google.com/u/0/reporting/53e0b950-6c81-4598-ae4a-ca9d1db824b5/page/p_vu9vfqsyqd'
          } }
      ],
      coverage: {
        'confluencia':       'activo',
        'molienda-sag':      'activo',
        'chancado-primario': 'activo'
      }
    },
    {
      id: 'parametros',
      category: 'lubricantes',
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
      id: 'consumos',
      category: 'lubricantes',
      name: 'Seguimiento de Consumos',
      description: 'Consumo de lubricantes por planta y por periodo, para controlar el gasto y detectar desviaciones.',
      views: [
        // ▼▼▼ URL — Looker Studio · Seguimiento de Consumos (un solo tablero para todas las plantas)
        { id: 'general', name: 'Seguimiento de Consumos',
          url: 'https://datastudio.google.com/u/0/reporting/707a51b0-6bd7-4f7c-a143-f0847b36e7cb/page/p_kl61a0kd8d' }
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
      id: 'lubricadores',
      category: 'automatizacion',
      name: 'Lubricadores Automáticos',
      description: 'Estado de cada lubricador instalado, recargas próximas y vencidas, y alertas de dispositivo por criticidad del equipo.',
      views: [
        // ▼▼▼ URL — Looker Studio · Lubricadores Automáticos
        { id: 'general', name: 'Lubricadores Automáticos',
          // Vista general (se usa con "Todas las plantas")
          url: 'https://datastudio.google.com/embed/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_piypaj1njd',
          // Página de Inspección de Lubricador Automático de cada planta
          urlPorPlanta: {
            'chancado-primario': 'https://datastudio.google.com/u/0/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_alofo8oh7d',
            'molienda-sag':      'https://datastudio.google.com/u/0/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_84z84bph7d',
            'confluencia':       'https://datastudio.google.com/u/0/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_eq1vygtm7d',
            'pre-chancado-cf':   'https://datastudio.google.com/u/0/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_gqqb80tm7d',
            'pre-chancado-sag':  'https://datastudio.google.com/u/0/reporting/536368c2-76fe-4dc1-a0bf-b32e06e2bd18/page/p_428v5j7x7d'
          } }
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
          // Vista general (se usa con "Todas las plantas")
          url: 'https://datastudio.google.com/embed/reporting/b8d78077-35ab-441a-95f3-4b9995313b67/page/p_5ht5aqmitd',
          urlPorPlanta: {
            'confluencia': 'https://datastudio.google.com/u/0/reporting/b8d78077-35ab-441a-95f3-4b9995313b67/page/p_j13qqpqitd'
          } }
      ],
      coverage: {
        'confluencia': 'activo'
      }
    },
    {
      id: 'reporte',
      category: 'servicio',
      name: 'Reporte del Servicio',
      description: 'Cumplimiento de actividades del contrato de lubricación, hallazgos y avance del servicio por periodo.',
      views: [
        // ▼▼▼ URL — Looker Studio · Reporte del Servicio
        { id: 'general', name: 'Reporte del Servicio',
          // Vista general (se usa con "Todas las plantas" y en las plantas sin enlace propio)
          url: 'https://datastudio.google.com/embed/reporting/483bfb33-cfd1-4a19-9e9f-c2699c30359c/page/p_qxs1f4y62c',
          urlPorPlanta: {
            // Informe propio de Pre-Chancado CF (otro informe de Looker)
            'pre-chancado-cf': 'https://datastudio.google.com/reporting/352df8e7-084b-4931-b920-46192b5cfdcc'
          } }
      ],
      coverage: {
        'confluencia':       'activo',
        'molienda-sag':      'activo',
        'chancado-primario': 'activo',
        'pre-chancado-cf':   'activo'
      }
    },
    {
      id: 'mapa-calor',
      category: 'servicio',
      name: 'Mapa de Calor de Actividades',
      description: 'Concentración de las actividades del servicio por planta y por periodo, en formato de mapa de calor.',
      views: [
        // ▼▼▼ URL — Looker Studio · Mapa de calor actividades servicio
        { id: 'general', name: 'Mapa de Calor de Actividades',
          // Overview de todas las plantas (se usa con "Todas las plantas")
          url: 'https://datastudio.google.com/u/0/reporting/7af5c98e-3a5a-4f4c-adf8-837c839942e7/page/p_x5mif33vyd/edit',
          urlPorPlanta: {
            'chancado-primario': 'https://datastudio.google.com/u/0/reporting/7af5c98e-3a5a-4f4c-adf8-837c839942e7/page/p_0czv7ukd8d/edit',
            'molienda-sag':      'https://datastudio.google.com/u/0/reporting/7af5c98e-3a5a-4f4c-adf8-837c839942e7/page/p_c9d2avkd8d/edit',
            'confluencia':       'https://datastudio.google.com/u/0/reporting/7af5c98e-3a5a-4f4c-adf8-837c839942e7/page/p_dnnb9ukd8d/edit',
            'pre-chancado-cf':   'https://datastudio.google.com/u/0/reporting/7af5c98e-3a5a-4f4c-adf8-837c839942e7/page/p_y2tkcvkd8d/edit',
            'pre-chancado-sag':  'https://datastudio.google.com/u/0/reporting/7af5c98e-3a5a-4f4c-adf8-837c839942e7/page/p_bx11dvkd8d/edit'
          } }
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
      id: 'mm-pp',
      category: 'servicio',
      name: 'Reportes MM/PP',
      description: 'Reportes de mantenciones mayores (MM) y paradas de planta (PP), uno por planta.',
      views: [
        // ▼▼▼ URL — Looker Studio · Reportes MM/PP (un informe por planta, sin vista general)
        { id: 'general', name: 'Reportes MM/PP',
          url: '',
          urlPorPlanta: {
            'chancado-primario': 'https://datastudio.google.com/u/0/reporting/3f2cfbb7-1e95-4efd-9a2e-b1b6188e5d32/page/p_qxs1f4y62c',
            'molienda-sag':      'https://datastudio.google.com/u/0/reporting/17d0bdfd-5af5-42a7-b690-6f1b859c416e/page/p_qxs1f4y62c',
            'confluencia':       'https://datastudio.google.com/u/0/reporting/72713421-9b45-4172-952c-db30bf586a39/page/p_qxs1f4y62c'
          } }
      ],
      coverage: {
        'chancado-primario': 'activo',
        'molienda-sag':      'activo',
        'confluencia':       'activo'
      }
    },
    {
      id: 'pautas',
      category: 'servicio',
      name: 'Pautas de Lubricación',
      description: 'Pautas de lubricación por equipo, disponibles en la carpeta de documentos de cada planta.',
      // Textos propios de este módulo
      etiquetas: { activo: 'Implementadas', parcial: 'Avance parcial' },
      views: [
        // ▼▼▼ URL — Carpetas de Google Drive (una por planta, sin vista general)
        { id: 'general', name: 'Pautas de Lubricación',
          url: '',
          urlPorPlanta: {
            'chancado-primario': 'https://drive.google.com/drive/folders/1nK7v5iOtqKUkcZ3GGvhMADTlIijWctkj',
            'confluencia':       'https://drive.google.com/drive/folders/12M9c2bzpy4--DD4w_x9BULvAElTDjshd'
          } }
      ],
      coverage: {
        'chancado-primario': 'activo',   // 100 % implementadas
        'confluencia':       'parcial'   // avance parcial
      }
    },
    {
      id: 'tfm',
      category: 'tfm',
      name: 'Tablero TFM',
      description: 'Programa Total Fluid Management: portada con la visión general y el detalle de avance de cada planta.',
      views: [
        // ▼▼▼ URL — Looker Studio · Total Fluid Management
        { id: 'general', name: 'Total Fluid Management',
          // Portada (se usa con "Todas las plantas")
          url: 'https://datastudio.google.com/u/0/reporting/8013298a-cc68-477a-a02e-c64f3368bbd0/page/p_650iftr5wc/edit',
          urlPorPlanta: {
            'chancado-primario': 'https://datastudio.google.com/u/0/reporting/8013298a-cc68-477a-a02e-c64f3368bbd0/page/p_zouov6v3wc/edit',
            'molienda-sag':      'https://datastudio.google.com/u/0/reporting/8013298a-cc68-477a-a02e-c64f3368bbd0/page/p_nsezfdrd9c/edit',
            'confluencia':       'https://datastudio.google.com/u/0/reporting/8013298a-cc68-477a-a02e-c64f3368bbd0/page/p_xrxio6v3wc/edit'
          } }
      ],
      coverage: {
        'chancado-primario': 'activo',
        'molienda-sag':      'activo',
        'confluencia':       'activo'
      }
    }
  ]
};
