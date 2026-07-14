<script>
  // Recibimos la URL de la imagen ya optimizada por Astro
  export let srcLogo;

  const enlaces = [
    { texto: 'Congreso 2026', ruta: '#congreso2026' },
    { texto: 'Nuestras Reuniones', ruta: '#reuniones' },
    { texto: 'Diezmos y Ofrendas', ruta: '#diezmosyofrendas' }
  ];
</script>

<div class="navbar bg-linear-to-r from-[#3a7bd5] to-[#00d2ff] min-h-16 shadow-sm text-white px-2 lg:px-4 grid grid-cols-[auto_1fr_auto] items-center gap-2">
  
  <div class="flex items-center justify-start shrink-0 min-w-10">
    <img src={srcLogo} alt="Logo" class="w-11 h-11 object-contain" />
  </div>

  <div class="flex items-center justify-center lg:justify-start min-w-0 w-full px-2 text-center">
    <span class="text-[min(4vw,21px)] font-bold tracking-normal whitespace-nowrap text-white text-center block">
      Centro Mundial de Evangelismo
    </span>
  </div>

  <div class="flex items-center justify-end shrink-0 min-w-10">
    <div class="dropdown dropdown-end lg:hidden">
      <div tabindex="0" role="button" class="btn btn-ghost text-white p-1" aria-label="Menu">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
        </svg>
      </div>

      <ul tabindex="-1" class="menu menu-md dropdown-content mt-3 z-1 p-3 shadow-xl bg-white text-gray-800 rounded-box w-64 gap-1.5 font-bold border border-gray-100">
        {#each enlaces as enlace}
          <li>
            <a href={enlace.ruta} class="hover:bg-gray-100 active:bg-gray-200 py-3 text-base rounded-lg block">
              {enlace.texto}
            </a>
          </li>
        {/each}
      </ul>
    </div>

    <div class="hidden lg:flex">
      <ul class="menu menu-horizontal text-sm font-semibold gap-2">
        {#each enlaces as enlace}
          <li>
            <a href={enlace.ruta} class="hover:bg-white/20 active:bg-white/30 rounded-lg">
              {enlace.texto}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>

</div>