import { supabase } from "../../shared/utils/supabase";
import { loginWithGoogle } from "../services/auth.service";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function Auth() {
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                // Check if user has a complete profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, bio')
                    .eq('id', session.user.id)
                    .single();

                // Smart Redirect: If name or bio is missing, go to setup
                if (!profile?.full_name || !profile?.bio) {
                    navigate("/profile-setup");
                } else {
                    navigate("/dashboard");
                }
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen p-4">
            {/* Organic Background Shape Blur */}
            <div className="fixed top-[-100px] left-[-100px] w-[500px] h-[500px] bg-[#E6E2D6] rounded-full blur-[100px] -z-10 opacity-60"></div>
            <div className="fixed bottom-[-100px] right-[-100px] w-[400px] h-[400px] bg-[#D4C5B0] rounded-full blur-[80px] -z-10 opacity-60"></div>

            {/* Main Card */}
            <div className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]">
                
                {/* Branding Logo */}
                <div className="flex justify-center mb-6">
                    <span className="text-4xl font-medium tracking-[0.2em] text-[#2C2C2C]">
                        Joint Venture
                    </span>
                </div>

                <h1 className="text-2xl font-light text-[#2C2C2C] mb-4 tracking-tight text-center">
                    Welcome
                </h1>
                <p className="text-[#888] mb-10 text-sm font-light text-center">
                    Log in to continue your adventure.
                </p>

                {/* Google Sign In */}
                <button 
                    onClick={() => loginWithGoogle()}
                    className="w-full bg-white border border-[#DDD] text-[#2C2C2C] text-base font-medium py-4 rounded-2xl mb-6 hover:bg-[#F9F9F9] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                    Continue with Google
                </button>
            </div>
        </div>
    )
}