import {createClient} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonkey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const formatUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export const supabase = createClient(
    formatUrl(supabaseUrl),
    supabaseAnonkey
)