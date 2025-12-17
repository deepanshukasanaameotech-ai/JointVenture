import { login, register, loginWithPhone, verifyPhone, loginWithGoogle } from "../services/auth.service";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


export default function Auth() {
    const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
    
    // Email State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Phone State
    const [countryCode, setCountryCode] = useState('+91');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [showOtpInput, setShowOtpInput] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(true);

    const navigate = useNavigate();

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        try {
            if (authMethod === 'email') {
                if (isSignUp) {
                    await register(email, password);
                    navigate("/profile-setup");
                } else {
                    await login(email, password);
                    navigate("/dashboard");
                }
            } else {
                // Phone Flow
                const fullPhone = `${countryCode}${phone}`;
                
                if (!showOtpInput) {
                    // Step 1: Send OTP
                    await loginWithPhone(fullPhone);
                    setShowOtpInput(true);
                } else {
                    // Step 2: Verify OTP
                    await verifyPhone(fullPhone, otp);
                    navigate("/profile-setup");
                }
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
                    {authMethod === 'phone' ? (showOtpInput ? "Enter Code" : "Phone Login") : (isSignUp ? "Join Us" : "Welcome")}
                </h1>
                <p className="text-[#888] mb-8 text-sm font-light text-center">
                    {authMethod === 'phone' 
                        ? (showOtpInput ? `We sent a code to ${countryCode} ${phone}` : "Enter your phone number to continue.") 
                        : (isSignUp ? "Start your journey with us today." : "Log in to continue your adventure.")
                    }
                </p>

                {/* Method Toggles */}
                 <div className="flex bg-[#F0EFEC] p-1.5 rounded-2xl mb-8">
                    <button 
                        onClick={() => { setAuthMethod('email'); setShowOtpInput(false); setError(null); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${authMethod === 'email' ? 'bg-white shadow-sm text-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'}`}
                    >
                        Email
                    </button>
                    <button 
                        onClick={() => { setAuthMethod('phone'); setShowOtpInput(false); setError(null); }}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${authMethod === 'phone' ? 'bg-white shadow-sm text-[#2C2C2C]' : 'text-[#888] hover:text-[#555]'}`}
                    >
                        Phone
                    </button>
                </div>

                {/* Google Sign In */}
                <button 
                    onClick={() => loginWithGoogle()}
                    className="w-full bg-white border border-[#DDD] text-[#2C2C2C] text-base font-medium py-3 rounded-2xl mb-6 hover:bg-[#F9F9F9] transition-all flex items-center justify-center gap-3 shadow-sm"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                </button>

                <div className="space-y-5">
                    
                    {authMethod === 'email' ? (
                        <>
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
                        </>
                    ) : (
                        <>
                             {!showOtpInput ? (
                                <div className="flex gap-3">
                                    <select
                                        value={countryCode}
                                        onChange={(e) => setCountryCode(e.target.value)}
                                        className="w-24 bg-[#F9F8F6] border-none text-[#2C2C2C] text-base px-3 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none appearance-none text-center"
                                    >
                                        <option value="+91">🇮🇳 +91</option>
                                        <option value="+1">🇺🇸 +1</option>
                                        <option value="+44">🇬🇧 +44</option>
                                        <option value="+61">🇦🇺 +61</option>
                                        <option value="+81">🇯🇵 +81</option>
                                    </select>
                                    <input 
                                        type="tel" 
                                        placeholder="9999999999" 
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)} 
                                        className="flex-1 bg-[#F9F8F6] border-none text-[#2C2C2C] placeholder:text-[#AAA] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none"
                                    />
                                </div>
                             ) : (
                                <div>
                                    <input 
                                        type="text" 
                                        placeholder="123456" 
                                        value={otp} 
                                        onChange={(e) => setOtp(e.target.value)} 
                                        maxLength={6}
                                        className="w-full bg-[#F9F8F6] border-none text-[#2C2C2C] placeholder:text-[#AAA] text-base px-6 py-4 rounded-2xl focus:ring-2 focus:ring-[#D4C5B0] focus:bg-white transition-all outline-none tracking-[0.5em] text-center font-medium"
                                    />
                                </div>
                             )}
                        </>
                    )}

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
                        {loading 
                            ? "Processing..." 
                            : (authMethod === 'phone' 
                                ? (showOtpInput ? "Verify Code" : "Send Code") 
                                : (isSignUp ? "Sign Up" : "Log In")
                              )
                        }
                    </button>
                </div>

                {authMethod === 'email' && (
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
                )}
                
                {authMethod === 'phone' && showOtpInput && (
                     <div className="mt-8 text-center">
                        <button 
                            onClick={() => setShowOtpInput(false)}
                            className="text-[#666] text-sm hover:text-[#1a1a1a]"
                        >
                            Change Number
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}