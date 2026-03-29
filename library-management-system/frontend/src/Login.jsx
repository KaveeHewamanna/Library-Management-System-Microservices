import React, { useState } from 'react';
import { BookOpen, User, Lock, Mail, Phone, MapPin, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from './api';

export default function Login({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', address: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let result;
      if (isLogin) {
        result = await loginUser(formData.email, formData.password);
      } else {
        result = await registerUser(formData);
      }
      
      if (result.success) {
        localStorage.setItem('library_token', result.token);
        localStorage.setItem('library_user_id', result.user.id);
        localStorage.setItem('library_user_name', result.user.name);
        localStorage.setItem('library_user_role', result.user.role);
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Check your API Gateway connection on port 3000');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-8 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 -m-16 w-32 h-32 bg-indigo-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 -m-16 w-32 h-32 bg-purple-500 rounded-full blur-3xl opacity-20" />
        
        <div className="relative">
          <div className="flex justify-center mb-8">
            <div className="bg-indigo-500/20 p-4 rounded-full border border-indigo-500/30">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2">
            {isLogin ? 'Welcome Back' : 'Join Library'}
          </h2>
          <p className="text-slate-400 text-center mb-8">
            {isLogin ? 'Login to access your dashboard' : 'Create an account to borrow books'}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  className="glass-input w-full pl-12"
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="glass-input w-full pl-12"
                required
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="glass-input w-full pl-12"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="glass-input w-full pl-12"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Address"
                    className="glass-input w-full pl-12"
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="glass-button w-full flex justify-center items-center mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors bg-transparent border-none p-0 cursor-pointer"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
