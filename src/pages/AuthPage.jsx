import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BackgroundDots from '../components/BackgroundDots';
import WaveAnimation from '../components/WaveAnimation';
import waveLogo from '/wave.png';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [waveSpeed, setWaveSpeed] = useState(1);
  
  const { signIn, signUp, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (with transition check)
  useEffect(() => {
    if (user && !isTransitioning) {
      // Start transition animation
      startTransition();
    }
  }, [user]);

  // Transition animation sequence
  const startTransition = () => {
    setIsTransitioning(true);
    
    // Phase 1: Speed up waves
    setWaveSpeed(3);
    
    // Store transition state so PlayerPage knows we're coming from auth
    // Also store timestamp for wave continuity
    sessionStorage.setItem('wavetune_transition', JSON.stringify({
      active: true,
      startTime: Date.now()
    }));
    
    // Phase 2: Navigate after animation
    setTimeout(() => {
      navigate('/');
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        // Transition will be triggered by useEffect when user changes
      } else {
        const { error } = await signUp(email, password, { full_name: name });
        if (error) throw error;
        // Transition will be triggered by useEffect when user changes
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Transition will be triggered by useEffect when user changes
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-wave-darker flex items-center justify-center">
      {/* Background */}
      <BackgroundDots />
      <WaveAnimation isPlaying={isTransitioning} speedMultiplier={waveSpeed} />

      {/* Auth Card */}
      <div className={`relative z-10 w-full max-w-md mx-4 transition-all duration-700 ease-out ${
        isTransitioning 
          ? 'opacity-0 scale-95 blur-sm translate-y-4' 
          : 'opacity-100 scale-100 blur-0 translate-y-0'
      }`}>
        {/* Logo */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-3 mb-1">
            <div className="w-32 h-32 rounded-xl flex items-center justify-center">
              <img 
                src={waveLogo}
                alt="WaveTune Logo" 
                className="w-full h-full object-contain scale-150"
              />
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="relative rounded-2xl p-6 backdrop-blur-10xl overflow-hidden">
          {/* Darker background layer */}
          <div className="absolute inset-0 bg-black/40 rounded-2xl" />
          {/* Enhanced glass effect with multiple layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-tl from-wave-accent/15 via-transparent to-wave-purple/15" />
          <div className="absolute inset-0 border border-white/20 rounded-2xl" />
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(255,255,255,0.03)] rounded-2xl" />
          
          {/* Content container */}
          <div className="relative z-10">
          {/* Heading */}
          <h2 className="text-white text-xl font-semibold text-center mb-4 transition-all duration-300">
            {isLogin ? 'Sign in' : 'Create an account'}
          </h2>
          
          {/* Toggle */}
          <div className="flex rounded-xl bg-black/40 backdrop-blur-sm border border-white/15 p-1 mb-4">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                isLogin 
                  ? 'bg-gradient-to-r from-wave-accent to-wave-purple text-white shadow-lg shadow-wave-accent/30' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                !isLogin 
                  ? 'bg-gradient-to-r from-wave-accent to-wave-purple text-white shadow-lg shadow-wave-accent/30' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Name field (signup only) - with smooth height transition */}
            <div 
              className={`overflow-hidden transition-all duration-400 ease-out ${
                !isLogin ? 'max-h-20 opacity-100 mb-0' : 'max-h-0 opacity-0 -mb-4'
              }`}
            >
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-2.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-wave-accent/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                  required={!isLogin}
                  tabIndex={!isLogin ? 0 : -1}
                />
              </div>
            </div>

            {/* Email field */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-2.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-wave-accent/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                required
              />
            </div>

            {/* Password field */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50 group-focus-within:text-white/70 transition-colors" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-2.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-wave-accent/50 focus:bg-black/40 focus:shadow-[0_0_20px_rgba(99,102,241,0.15)] transition-all"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Forgot password (login only) - with smooth transition */}
            <div 
              className={`text-right overflow-hidden transition-all duration-400 ease-out ${
                isLogin ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <button
                type="button"
                className="text-sm text-wave-accent hover:text-wave-purple transition-colors"
                tabIndex={isLogin ? 0 : -1}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-wave-accent to-wave-purple text-white font-medium rounded-xl hover:opacity-90 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-wave-accent/25"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20" />
            </div>
            <div className="relative flex justify-center text-sm">
            </div>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-2.5 bg-black/30 backdrop-blur-md border border-white/15 rounded-xl text-white font-medium hover:bg-black/40 hover:border-white/25 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Terms */}
          <div 
            className={`overflow-hidden transition-all duration-400 ease-out ${
              !isLogin ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
            }`}
          >
            <p className="text-center text-xs text-white/40">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-wave-accent hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-wave-accent hover:underline">Privacy Policy</a>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
