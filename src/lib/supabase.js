import { createClient } from '@supabase/supabase-js';

// Leemos las variables del archivo .env que acabas de configurar
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

// Creamos e exportamos la instancia única del cliente
export const supabase = createClient(supabaseUrl, supabaseAnonKey);