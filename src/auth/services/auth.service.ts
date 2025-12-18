import {supabase} from "../../shared/utils/supabase";

export const logout = async () => {
    const {error} = await supabase.auth.signOut();

    if (error) throw error;
}

export const loginWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: window.location.origin
        }
    });

    if (error) throw error;
    return data;
}