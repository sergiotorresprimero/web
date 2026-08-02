<script>
  import { onMount } from 'svelte';
  import { supabase } from '../../lib/supabase.js';
  
  // Importas tus vistas actuales
  import LoginForm from './LoginForm.svelte';
  import DashboardView from './DashboardView.svelte';

  let session = null;
  let loading = true;

  onMount(async () => {
    // Consulta inicial de sesión en el navegador
    const { data } = await supabase.auth.getSession();
    session = data.session;
    loading = false;

    // Escucha si el usuario inicia o cierra sesión en tiempo real
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
      session = _session;
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  });
</script>

{#if loading}
  <!-- Un estado de carga limpio mientras verifica -->
  <div class="min-h-screen bg-slate-950 flex items-center justify-center text-white">
    <p class="text-sm text-slate-400">Cargando panel...</p>
  </div>
{:else if !session}
  <!-- Si no está logueado, muestra el diseño de tu login -->
  <main class="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 flex items-center justify-center p-4 w-full">
    <div class="w-full max-w-md bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-700/60">
      <div class="text-center mb-8">
        <h1 class="text-xl font-bold text-white tracking-wide">Control de asistencia Congreso</h1>
        <p class="text-xs font-medium text-indigo-400 mt-1 uppercase tracking-wider">Uso exclusivo para administradores</p>
      </div>
      <LoginForm />
    </div>
  </main>
{:else}
  <!-- Si está logueado, muestra el dashboard directamente -->
  <div class="min-h-screen bg-slate-950 text-slate-100 w-full">
    <DashboardView />
  </div>
{/if}