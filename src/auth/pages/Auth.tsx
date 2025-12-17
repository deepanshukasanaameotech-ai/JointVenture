import { login, register } from "../services/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Auth() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(true);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSignUp) {
                await register(email, password);
                // New users go to profile setup
                navigate("/profile-setup");
            } else {
                await login(email, password);
                // Returning users go to dashboard (ideal world: check if profile is complete)
                navigate("/dashboard");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

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

                <h1 className="text-2xl font-light text-[#2C2C2C] mb-2 tracking-tight text-center">
                    {isSignUp ? "Join Us" : "Welcome"}
                </h1>
                <p className="text-[#888] mb-10 text-sm font-light text-center">
                    {isSignUp ? "Start your journey with us today." : "Log in to continue your adventure."}
                </p>

                <div className="space-y-5">
                    <div className="group">
                        <input 
                            type="email" 
                            placeholder="Email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] placeholder:text-[#AAA] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none"
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] placeholder:text-[#AAA] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-sm rounded-xl text-center">
                            {error}
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="w-full bg-[#1a1a1a] text-[#F2EFE9] text-base font-medium py-4 rounded-full mt-4 hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? (isSignUp ? "Creating Account..." : "Logging In...") : (isSignUp ? "Sign Up" : "Log In")}
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <button 
                        onClick={() => {
                            setIsSignUp(!isSignUp);
                            setError(null);
                        }} 
                        className="text-[#666] text-sm hover:text-[#1a1a1a] transition-colors underline decoration-transparent hover:decoration-[#1a1a1a] underline-offset-4"
                    >
                        {isSignUp ? "Already have an account? Log In" : "New here? Create Account"}
                    </button>
                </div>
            </div>
        </div>
    )
}