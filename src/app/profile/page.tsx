"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/Button";
import { AuthGuard } from "@/components/AuthGuard";
import { FadeUp, FadeIn, StaggerContainer, StaggerItem, ScaleIn } from "@/components/motion";
import { Input } from "@/components/Input";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Mail, ShieldCheck, Loader2, User, Calendar, Hash, Fingerprint, X, Key, Pencil, Trash2, AlertCircle, CheckCircle2 } from "lucide-react";

interface UserProfile {
  username: string;
  email: string;
  id: string;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Modal states
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // Status states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [editForm, setEditForm] = useState({ username: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get("/users/profile");
      setUser(data);
    } catch (err: any) {
      // AuthGuard handles initial check
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  // Keyboard accessibility: dismiss modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editOpen) setEditOpen(false);
        if (passwordOpen) setPasswordOpen(false);
        if (deleteOpen) setDeleteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editOpen, passwordOpen, deleteOpen]);

  const handleLogout = async () => {
    try { await api.get("/users/logout"); } catch { /* ignore */ }
    localStorage.removeItem("token");
    router.push("/login");
  };

  const openEdit = () => {
    setEditForm({ username: user?.username || "", email: user?.email || "" });
    setEditOpen(true);
    setError(null);
    setSuccess(null);
    setFormError(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForm = {
      username: editForm.username.trim(),
      email: editForm.email.trim().toLowerCase(),
    };
    if (!cleanForm.username || !cleanForm.email) {
      setFormError("Username and email cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFormError(null);
    try {
      const { data } = await api.put("/users/profile", cleanForm);
      setUser({ ...user, username: data.username, email: data.email } as UserProfile);
      setSuccess("Profile updated successfully!");
      setEditOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword.length < 6) {
      setFormError("New password must be at least 6 characters long.");
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFormError(null);
    try {
      await api.put("/users/change-password", passwordForm);
      setSuccess("Password changed successfully!");
      setPasswordOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    setFormError(null);
    try {
      await api.delete("/users/profile");
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || "Failed to delete account.");
      setSaving(false);
    }
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || "U";
  const profileDetails = [
    { label: "Username", value: user?.username || "—", icon: User },
    { label: "Email Address", value: user?.email || "—", icon: Mail },
    { label: "User ID", value: user?.id || "—", icon: Hash, mono: true },
    { label: "Account Status", value: "Verified & Secured", icon: ShieldCheck },
    { label: "Security", value: "JWT-authenticated session", icon: Fingerprint },
    { label: "Member Since", value: "2026", icon: Calendar },
  ];

  return (
    <AuthGuard>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center">
          <FadeIn>
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </FadeIn>
        </div>
      ) : (
        <div className="min-h-screen pt-28 pb-32 relative z-10">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <FadeUp className="mb-8 text-center flex flex-col items-center">
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1] mb-2">
                Your <span className="font-cursive font-normal text-primary drop-shadow-sm">Profile</span>
              </h1>
              <p className="text-muted-foreground/80 max-w-xs leading-relaxed text-sm font-medium">
                Account details and session management.
              </p>
            </FadeUp>

            {/* Alerts */}
            <AnimatePresence>
              {success && (
                <FadeUp className="mb-6 rounded-xl bg-secondary/40 border border-border/40 px-4 py-3 text-sm text-muted-foreground flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-4 w-4 opacity-60" />
                    <span className="font-medium">{success}</span>
                  </div>
                  <button onClick={() => setSuccess(null)} className="ml-4 text-xs font-semibold hover:underline shrink-0 opacity-60 hover:opacity-100">Dismiss</button>
                </FadeUp>
              )}
              {error && (
                <FadeUp className="mb-6 rounded-xl bg-secondary/80 border border-border/60 px-4 py-3 text-sm text-foreground flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{error}</span>
                  </div>
                  <button onClick={() => setError(null)} className="ml-4 text-xs font-semibold hover:underline shrink-0 opacity-60 hover:opacity-100">Dismiss</button>
                </FadeUp>
              )}
            </AnimatePresence>

            {/* Identity Hero Card */}
            <FadeUp delay={0.06} className="rounded-[2rem] border border-border/40 bg-gradient-to-b from-secondary/30 to-secondary/10 p-6 sm:p-8 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left min-w-0">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-foreground text-background flex items-center justify-center text-3xl font-bold tracking-tight shadow-md ring-4 ring-background">
                      {initial}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{user?.username || "—"}</h2>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm font-medium">
                      <Mail className="h-3.5 w-3.5 opacity-70" />
                      <span className="truncate">{user?.email || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Hero Actions */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                  <Button
                    onClick={openEdit}
                    variant="outline"
                    className="rounded-full h-10 px-4 text-xs font-bold flex-1 sm:flex-initial gap-2 bg-background/80 hover:bg-background"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    className="rounded-full h-10 px-4 text-xs font-bold flex-1 sm:flex-initial gap-2 text-muted-foreground hover:text-foreground hover:bg-background/60"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </FadeUp>

            {/* Account Settings & Security Section */}
            <div className="space-y-4 mb-6">
              {/* Account Information Card */}
              <FadeUp delay={0.12} className="rounded-[1.75rem] border border-border/40 bg-background/60 p-6 sm:p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/30">
                  <div className="h-9 w-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base tracking-tight">Account Information</h3>
                    <p className="text-xs text-muted-foreground font-medium">Personal account details and identifiers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Username</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user?.username || "—"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Email Address</p>
                    <p className="text-sm font-semibold text-foreground truncate">{user?.email || "—"}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Security Session</p>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" /> JWT-Authenticated
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                    <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Workspace</p>
                    <p className="text-sm font-semibold text-foreground">Personal Directory</p>
                  </div>
                </div>
              </FadeUp>

              {/* Password & Security Card */}
              <FadeUp delay={0.16} className="rounded-[1.75rem] border border-border/40 bg-background/60 p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-secondary/80 flex items-center justify-center text-muted-foreground shrink-0">
                      <Key className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base tracking-tight">Password & Authentication</h3>
                      <p className="text-xs text-muted-foreground font-medium">Keep your account secure with a strong password</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setPasswordOpen(true); setError(null); setSuccess(null); setFormError(null); }}
                    variant="outline"
                    className="rounded-full h-9 px-4 text-xs font-bold shrink-0 self-start sm:self-auto gap-2"
                  >
                    <Key className="h-3.5 w-3.5" />
                    Change Password
                  </Button>
                </div>
              </FadeUp>

              {/* Danger Zone */}
              <FadeUp delay={0.2} className="rounded-[1.75rem] border border-destructive/20 bg-destructive/[0.02] p-6 sm:p-7 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base tracking-tight text-destructive">Danger Zone</h3>
                      <p className="text-xs text-muted-foreground font-medium">Permanently delete your account and all associated contacts</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => { setDeleteOpen(true); setError(null); setSuccess(null); setFormError(null); }}
                    variant="outline"
                    className="rounded-full h-9 px-4 text-xs font-bold shrink-0 self-start sm:self-auto border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all"
                  >
                    Delete Account
                  </Button>
                </div>
              </FadeUp>
            </div>

          </div>

          {/* Modals */}
          <AnimatePresence>
            {editOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  className="fixed inset-0 bg-background/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setEditOpen(false)}
                />
                <ScaleIn className="relative w-full max-w-md rounded-[2rem] border border-border/60 bg-background shadow-2xl">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold tracking-tight">Edit Profile</h2>
                      <button type="button" onClick={() => setEditOpen(false)} className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors bg-secondary/50"><X className="h-4 w-4" /></button>
                    </div>
                    <form onSubmit={handleEdit} className="space-y-4">
                      {formError && (
                        <FadeIn className="rounded-lg border border-border/60 bg-secondary/80 px-4 py-3 text-sm text-foreground font-bold flex items-center gap-2.5 shadow-sm">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          {formError}
                        </FadeIn>
                      )}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Username</label>
                        <Input className="rounded-xl h-12 px-4" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })} required autoFocus />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Email</label>
                        <Input className="rounded-xl h-12 px-4" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" className="rounded-xl h-11" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button type="submit" className="rounded-xl h-11 px-6" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </ScaleIn>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {passwordOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  className="fixed inset-0 bg-background/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setPasswordOpen(false)}
                />
                <ScaleIn className="relative w-full max-w-md rounded-[2rem] border border-border/60 bg-background shadow-2xl">
                  <div className="p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold tracking-tight">Change Password</h2>
                      <button type="button" onClick={() => setPasswordOpen(false)} className="rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors bg-secondary/50"><X className="h-4 w-4" /></button>
                    </div>
                    <form onSubmit={handlePassword} className="space-y-4">
                      {formError && (
                        <FadeIn className="rounded-lg border border-border/60 bg-secondary/80 px-4 py-3 text-sm text-foreground font-bold flex items-center gap-2.5 shadow-sm">
                          <AlertCircle className="h-4 w-4 text-muted-foreground" />
                          {formError}
                        </FadeIn>
                      )}
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Current Password</label>
                        <Input className="rounded-xl h-12 px-4" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required autoFocus />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">New Password</label>
                        <Input className="rounded-xl h-12 px-4" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} required />
                      </div>
                      <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" className="rounded-xl h-11" onClick={() => setPasswordOpen(false)}>Cancel</Button>
                        <Button type="submit" className="rounded-xl h-11 px-6" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </ScaleIn>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {deleteOpen && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                  className="fixed inset-0 bg-background/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setDeleteOpen(false)}
                />
                <ScaleIn className="relative w-full max-w-sm rounded-[2rem] border border-border/60 bg-background shadow-2xl text-center">
                  <div className="p-6 sm:p-8">
                    <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 border border-destructive/20">
                      <Trash2 className="h-6 w-6 text-destructive" />
                    </div>
                    <h2 className="font-bold text-xl mb-2">Delete Account?</h2>
                    <p className="text-sm text-muted-foreground mb-8">
                      This action is <strong className="text-foreground">permanent</strong>. All your contacts and profile data will be permanently removed.
                    </p>
                    {formError && (
                      <FadeIn className="mb-6 rounded-lg border border-border/60 bg-secondary/80 px-4 py-3 text-sm text-foreground font-bold text-left flex items-center gap-2.5 shadow-sm">
                        <AlertCircle className="h-4 w-4 text-muted-foreground" />
                        {formError}
                      </FadeIn>
                    )}
                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <Button variant="outline" className="rounded-xl h-11 w-full" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                      <Button variant="outline" className="rounded-xl h-11 w-full border-destructive/40 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleDelete} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Delete Forever"}
                      </Button>
                    </div>
                  </div>
                </ScaleIn>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AuthGuard>
  );
}
