import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

// ==================
// 1. READY-TO-USE FAKE CREDENTIALS
// ==================
const DEMO_EMAIL = "admin@flowcraft.ai";
const DEMO_PASSWORD = "admin123";

// ==================
// 2. COMPONENT
// ==================
const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(DEMO_EMAIL);
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================
  // 3. MOCK LOGIN HANDLER
  // ==================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Simulate network delay for realistic UX
      await new Promise(res => setTimeout(res, 1000));
      
      // Set the mock-user token that your backend expects
      localStorage.setItem("auth_token", "mock-user");
      
      // Optional: Set token type if your app expects it
      localStorage.setItem("tokenType", "bearer");
      
      // Log for debugging
      console.log("Login successful - token set:", localStorage.getItem("auth_token"));
      
      // Navigate to dashboard
      navigate("/dashboard");
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================
  // 4. RENDER
  // ==================
  return (
    <div className="min-h-screen gradient-background-dark flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
            FlowCraft AI
          </h1>
          <p className="text-muted-foreground mt-2">AI-Powered Document Processing</p>
        </div>

        <Card className="glass-card-dark border border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Sign in to your account
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/20 text-red-200 mb-6">
                <AlertCircle size={16} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/10 text-white placeholder:text-gray-400 focus:border-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-orange hover:gradient-orange-hover text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>

            {/* Debug Info */}
            <div className="mt-6 p-3 bg-gray-800/50 rounded-lg">
              <p className="text-xs text-gray-400 text-center">
                Demo Credentials: <b>{DEMO_EMAIL} / {DEMO_PASSWORD}</b>
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Just click Sign In—no real auth needed for dev.
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Token: mock-user | Backend: http://localhost:8000
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm">
            © 2024 FlowCraft AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
