<script>
  // Recibimos la URL de la imagen ya optimizada por Astro
  export let srcLogo;

  // Estado reactivo de Svelte para controlar si el menú móvil está abierto o cerrado
  let menuAbierto = false;

  // Arreglo de objetos con la información de cada ruta de navegación
  const enlaces = [
    { 
      texto: 'Congreso 2026', 
      ruta: '/congreso2026',
      desc: 'Información e Inscripciones',
      icono: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    { 
      texto: 'Nuestras Reuniones', 
      ruta: '#reuniones',
      desc: 'Conoce nuestros horarios',
      icono: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    { 
      texto: 'Diezmos y Ofrendas', 
      ruta: '/diezmosyofrendas',
      desc: 'Aportes y donaciones',
      icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
    }
  ];

  // Función para alternar la visibilidad del menú móvil
  function toggleMenu() {
    menuAbierto = !menuAbierto;
  }

  // Función para cerrar el menú móvil (se ejecuta al hacer clic fuera o en un enlace)
  function cerrarMenu() {
    menuAbierto = false;
  }
</script>

<!-- Backdrop Oscurecido con Desenfoque (Blur) -->
<!-- Fondo oscuro con blur que se activa solo cuando el menú está abierto y permite cerrarlo al presionar afuera -->
{#if menuAbierto}
  <div 
    tabindex="-1"
    class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity" 
    on:click={cerrarMenu}
    aria-hidden="true"
  ></div>
{/if}

<!-- Contenedor principal -->
<div class="sticky top-0 z-50 bg-linear-to-r from-[#3a7bd5] to-[#00d2ff] min-h-14 h-15 py-0 shadow-md text-white px-3 lg:px-5 grid grid-cols-[auto_1fr_auto] items-center gap-2 w-full">
  
  <!-- Logo -->
  <div class="flex items-center justify-start shrink-0 min-w-9 h-full">
    <a href="/" class="flex items-center hover:opacity-90 transition-opacity focus:outline-hidden" aria-label="Ir al inicio">
      <img src={srcLogo} alt="Logo Centro Mundial de Evangelismo" class="w-11 h-11 object-contain block" />
    </a>
  </div>

  <!-- Nombre "Centro Mundial de Evangelismo" -->
  <div class="flex items-center justify-center lg:justify-start min-w-0 w-full px-2 text-center h-full">
    <a href="/" class="flex items-center hover:opacity-90 transition-opacity no-underline focus:outline-hidden">
      <span class="text-[min(4vw,20px)] font-bold tracking-normal whitespace-nowrap text-white text-center block leading-none">
        Centro Mundial de Evangelismo
      </span>
    </a>
  </div>

  <!-- Menú / Navegación -->
  <!-- Columna 3 del Grid: Botón de menú en móvil o barra horizontal en escritorio -->
  <div class="flex items-center justify-end shrink-0 min-w-9 h-full">
    
    <!-- Botón Hamburguesa Móvil -->
    <div class="lg:hidden flex items-center">
      <!-- Botón que activa toggleMenu() al hacer clic -->
      <button 
        type="button"
        class="p-2 rounded-xl text-white hover:bg-white/20 active:scale-95 transition-all focus:outline-hidden" 
        on:click={toggleMenu}
        aria-label="Abrir Menú"
      >
        <!-- SVG condicional que renderiza la 'X' o las barras del menú hamburguesa -->
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d={menuAbierto ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
        </svg>
      </button>

      <!-- Menú Móvil Desplegable -->
      {#if menuAbierto}
        <div class="absolute top-full left-0 right-0 w-full bg-white text-slate-800 shadow-2xl border-b border-slate-200/80 p-4 z-50 lg:hidden flex flex-col gap-3 rounded-b-3xl animate-in slide-in-from-top duration-200">
          
          <!-- Encabezado "Menu Principal" -->
          <div class="pb-2 border-b border-slate-100 px-1">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menú Principal
            </span>
          </div>

          <!-- Iteración sobre el listado de enlaces para generar la lista móvil -->
          <div class="flex flex-col gap-1.5">
            {#each enlaces as enlace}
              <a 
                href={enlace.ruta} 
                on:click={cerrarMenu}
                class="flex items-center gap-3.5 p-3 rounded-2xl transition-all duration-150 hover:bg-slate-50 active:bg-blue-50/60 group border border-transparent hover:border-slate-100"
              >
                <!-- Icono con fondo azul estilizado -->
                <div class="w-10 h-10 rounded-xl bg-blue-50 text-[#3a7bd5] flex items-center justify-center shrink-0 group-hover:bg-[#3a7bd5] group-hover:text-white transition-colors shadow-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={enlace.icono} />
                  </svg>
                </div>

                <!-- Textos con descripción -->
                <div class="flex flex-col">
                  <span class="text-sm font-bold text-slate-800 group-hover:text-[#3a7bd5] transition-colors">
                    {enlace.texto}
                  </span>
                  <span class="text-xs text-slate-400 font-normal">
                    {enlace.desc}
                  </span>
                </div>

                <!-- Flechita indicadora -->
                <div class="ml-auto text-slate-300 group-hover:text-[#3a7bd5] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            {/each}
          </div>

          <!-- Botón de Acción destacado -->
          <!-- Botón directo de llamado a la acción para inscripciones -->
          <div class="pt-2">
            <a 
              href="/congreso-inscripcion" 
              on:click={cerrarMenu}
              class="w-full py-3 px-4 bg-linear-to-r from-[#3a7bd5] to-[#00d2ff] text-white font-bold text-center text-sm rounded-xl shadow-md hover:opacity-95 active:scale-[0.98] transition-all block"
            >
              Inscribirse al Congreso 2026
            </a>
          </div>

        </div>
      {/if}
    </div>

    <!-- Menú Escritorio -->
    <!-- Menú tradicional horizontal que solo es visible en pantallas grandes (lg) -->
    <div class="hidden lg:flex items-center h-full">
      <ul class="text-sm font-semibold gap-1 p-0 flex items-center list-none">
        {#each enlaces as enlace}
          <li>
            <a href={enlace.ruta} class="hover:bg-white/20 active:bg-white/30 rounded-lg py-1.5 px-3 flex items-center text-white">
              {enlace.texto}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>

</div>