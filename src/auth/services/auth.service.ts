import {supabase} from "../../shared/utils/supabase";

export const login = async (email:string, password:string) => {
    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
    })

    if (error) throw error;

    return data;
}


export const register = async (email:string, password:string) => {
    const {data,error} = await supabase.auth.signUp({
        email,
        password
    })

    if (error) throw error;

    return data;
}


export const logout = async () => {
    const {error} = await supabase.auth.signOut();

    if (error) throw error;
}