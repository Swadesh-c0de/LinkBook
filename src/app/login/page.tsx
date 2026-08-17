"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { GuestGuard } from "@/components/AuthGuard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FadeUp, FadeIn } from "@/components/motion";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const { data } = await api.post("/users/login", { email: cleanEmail, password });
      localStorage.setItem("token", data.accessToken);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => router.push("/"), 400);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GuestGuard>
      <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2 relative overflow-hidden">
        <div className="absolute top-4 right-4 z-50 lg:top-8 lg:right-8 text-primary-foreground lg:text-foreground">
          <ThemeToggle />
        </div>

        {/* Mobile/Tablet Header */}
        <div className="lg:hidden flex flex-col items-center justify-center py-12 px-6 bg-primary text-primary-foreground text-center space-y-4">
          <FadeIn delay={0}>
            <Link href="/" className="flex items-center drop-shadow-2xl">
              <span className="text-5xl font-cursive font-medium -ml-1 text-secondary drop-shadow-[0_0_20px_rgba(var(--secondary),0.4)]">Kontacts</span>
            </Link>
          </FadeIn>
          <FadeIn delay={0.1} className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight leading-tight">Simply organize<br />your network.</h1>
            <p className="text-sm text-primary-foreground/50 max-w-[240px] mx-auto leading-relaxed">A minimal and efficient way to manage your contacts with speed.</p>
          </FadeIn>
        </div>

        {/* Left — Branding (Desktop) */}
        <div className="relative hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground overflow-hidden">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          >
            <Link href="/" className="relative z-10 flex items-center drop-shadow-2xl">
              <span className="text-5xl font-cursive font-medium -ml-0.5 text-secondary drop-shadow-[0_0_25px_rgba(var(--secondary),0.4)]">Kontacts</span>
            </Link>
          </motion.div>

          <div className="relative z-10 my-auto max-w-lg">
            <FadeUp delay={0.1} className="text-5xl font-bold tracking-tighter leading-[1] mb-6">
              <span>Simply organize<br />your network.</span>
            </FadeUp>
            <FadeUp delay={0.2} className="text-xl text-primary-foreground/40 leading-relaxed max-w-sm font-medium">
              <span>A minimal and efficient way to manage your personal and professional contacts with speed.</span>
            </FadeUp>
          </div>

          <FadeUp delay={0.4}>
            <p className="text-xs font-bold text-primary-foreground/40 tracking-[0.2em] uppercase">
              SWADESH-C0DE &copy; {new Date().getFullYear()}
            </p>
          </FadeUp>
        </div>

        {/* Right — Form */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 lg:py-12 lg:px-16 bg-background relative overflow-y-auto">
          <div className="mx-auto w-full max-w-[360px] space-y-8">
            <FadeUp className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight lg:block hidden">Welcome back</h2>
              <p className="text-muted-foreground/80 text-sm lg:block hidden font-medium">Enter your credentials to access your directory.</p>
            </FadeUp>

            <FadeUp delay={0.1}>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <FadeIn className="rounded-lg border border-border/60 bg-secondary/80 px-4 py-3 text-sm text-foreground font-bold flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    {error}
                  </FadeIn>
                )}
                {success && (
                  <FadeIn className="rounded-lg border border-border/40 bg-secondary/40 px-4 py-3 text-sm text-muted-foreground font-bold flex items-center gap-2.5 shadow-sm">
                    <CheckCircle2 className="h-4 w-4 opacity-60" />
                    {success}
                  </FadeIn>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-sm font-medium">Password</label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Sign in <ArrowRight className="h-4 w-4" /></>}
                </Button>
              </form>
            </FadeUp>

            <FadeUp delay={0.2} className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">New here?</span>
              </div>
            </FadeUp>

            <FadeUp delay={0.3} className="text-center text-sm text-muted-foreground">
              <span>Don&apos;t have an account?{" "}
                <Link href="/register" className="font-medium text-foreground underline underline-offset-4 hover:text-foreground/80 transition-colors">
                  Create an account
                </Link>
              </span>
            </FadeUp>
          </div>
        </div>
      </div>
    </GuestGuard>
  );
}
