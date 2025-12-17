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

export const loginWithPhone = async (phone: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
        phone
    });

    if (error) throw error;
    return data;
}

export const verifyPhone = async (phone: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
    });

    if (error) throw error;
    return data;
}