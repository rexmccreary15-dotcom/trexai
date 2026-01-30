"use client";

import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  theme: "dark" | "light";
}

export default function AuthModal({ isOpen, onClose, onSuccess, theme }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setMode("login");
      setEmail("");
      setPassword("");
      setVerificationCode("");
      setError("");
      setMessage("");
    }
  }, [isOpen]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication service not available. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          // Disable email confirmation - auto-confirm user
          data: {
            email_confirm: true
          }
        },
      });

      if (signUpError) {
        // Check if email authentication is disabled
        if (signUpError.message.includes("email logins are disabled") || signUpError.message.includes("Email provider is disabled")) {
          setError("Email authentication is disabled in Supabase. Please enable it in your Supabase dashboard: Authentication → Providers → Email → Toggle ON. See FIX_EMAIL_LOGIN_DISABLED.md for detailed instructions.");
          setLoading(false);
          return;
        }
        throw signUpError;
      }

      if (data.user) {
        // If user is created, they're automatically confirmed
        setMessage("Account created successfully! Logging you in...");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication service not available. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Check if user needs to verify email
        if (signInError.message.includes("Email not confirmed")) {
          setError("Please verify your email first. Check your inbox for the verification code.");
          setMode("verify");
          return;
        }
        // Check if email authentication is disabled
        if (signInError.message.includes("email logins are disabled") || signInError.message.includes("Email provider is disabled")) {
          setError("Email authentication is disabled in Supabase. Please enable it in your Supabase dashboard: Authentication → Providers → Email → Toggle ON. See FIX_EMAIL_LOGIN_DISABLED.md for detailed instructions.");
          return;
        }
        throw signInError;
      }

      if (data.user) {
        setMessage("Login successful!");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication service not available. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Supabase sends a magic link by default, but if you configure it for OTP codes,
      // this will work. Otherwise, users click the link in their email.
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "email",
      });

      if (verifyError) {
        // If OTP verification fails, it might be because Supabase is using magic links
        setError("Please click the verification link in your email instead. If you received a code, make sure it's entered correctly.");
        return;
      }

      if (data.user) {
        setMessage("Email verified! Logging you in...");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please check your email for the verification link.");
    } finally {
      setLoading(false);
    }
  };


  const handleResendCode = async () => {
    if (!supabase) {
      setError("Authentication service not available. Please refresh the page.");
      return;
    }
    
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      if (resendError) throw resendError;

      setMessage("Verification code resent! Please check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const themeClasses = {
    bg: theme === "dark" ? "bg-gray-800" : "bg-white",
    text: theme === "dark" ? "text-white" : "text-gray-900",
    border: theme === "dark" ? "border-gray-700" : "border-gray-200",
    input: theme === "dark" ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-100 border-gray-300 text-gray-900",
    button: theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-200 hover:bg-gray-300",
    buttonPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className={`${themeClasses.bg} ${themeClasses.text} rounded-lg w-full max-w-md m-4`}>
        {/* Header */}
        <div className={`${themeClasses.bg} border-b ${themeClasses.border} p-4 flex items-center justify-between`}>
          <h2 className="text-xl font-semibold">
            {mode === "login" ? "Log In" : mode === "signup" ? "Create Account" : "Verify Email"}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 ${themeClasses.button} rounded`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-700 rounded-lg p-3 text-red-200 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-blue-900/50 border border-blue-700 rounded-lg p-3 text-blue-200 text-sm">
              {message}
            </div>
          )}

          {mode === "verify" ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm mb-4">
                  Supabase sends a verification link to your email. Please check your inbox and click the link to verify your account.
                </p>
                <p className="text-sm mb-4">
                  If you received a verification code instead, enter it below:
                </p>
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Verification Code (if you received one)
                    </label>
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter code from email"
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !verificationCode}
                    className={`w-full ${themeClasses.buttonPrimary} py-2 rounded-lg disabled:opacity-50`}
                  >
                    {loading ? "Verifying..." : "Verify Code"}
                  </button>
                </form>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={loading}
                  className={`w-full ${themeClasses.button} py-2 rounded-lg text-sm disabled:opacity-50 mt-2`}
                >
                  Resend Verification Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("After verifying your email, you can log in here.");
                  }}
                  className={`w-full ${themeClasses.button} py-2 rounded-lg text-sm mt-2`}
                >
                  I&apos;ve Verified - Go to Login
                </button>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={mode === "login" ? handleSignIn : handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className={`w-full ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Lock size={16} />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full ${themeClasses.input} rounded px-3 py-2 pr-10 focus:outline-none focus:border-blue-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${themeClasses.buttonPrimary} py-2 rounded-lg disabled:opacity-50`}
                >
                  {loading
                    ? mode === "login"
                      ? "Logging in..."
                      : "Creating account..."
                    : mode === "login"
                    ? "Log In"
                    : "Create Account"}
                </button>
              </form>

              <div className="text-center">
                <button
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setError("");
                    setMessage("");
                  }}
                  className={`text-sm ${theme === "dark" ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                >
                  {mode === "login"
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Log in"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
