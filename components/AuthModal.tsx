"use client";

import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState, useEffect } from "react";
import { createSupabaseClient } from "@/lib/supabase";

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

  const supabase = createSupabaseClient();

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
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/chat`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setMessage("Verification code sent to your email! Please check your inbox.");
        setMode("verify");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
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
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Verify the token (code) - Supabase sends a token in the email link
      // For code-based verification, we need to use the verifyOtp method
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: "email",
      });

      if (verifyError) throw verifyError;

      if (data.user) {
        setMessage("Email verified! Logging you in...");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error: googleError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/chat`,
        },
      });

      if (googleError) throw googleError;
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google.");
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
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
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter code from email"
                  className={`w-full ${themeClasses.input} rounded px-3 py-2 focus:outline-none focus:border-blue-500`}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${themeClasses.buttonPrimary} py-2 rounded-lg disabled:opacity-50`}
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={loading}
                className={`w-full ${themeClasses.button} py-2 rounded-lg text-sm disabled:opacity-50`}
              >
                Resend Code
              </button>
            </form>
          ) : (
            <>
              {/* Google Sign In */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className={`w-full ${themeClasses.buttonPrimary} py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50`}
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

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${themeClasses.border}`}></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`${themeClasses.bg} px-2 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Or continue with email
                  </span>
                </div>
              </div>

              <form onSubmit={mode === "login" ? handleSignIn : handleSignUp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Mail size={16} />
                    Email
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
