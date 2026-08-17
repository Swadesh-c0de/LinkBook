"use client";

import { useEffect, useState, useCallback, useMemo, useDeferredValue } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { AuthGuard } from "@/components/AuthGuard";
import { AnimatePresence, motion } from "framer-motion";
import { FadeUp, StaggerContainer, StaggerItem, ScaleIn, FadeIn } from "@/components/motion";
import { Plus, Search, Mail, Phone, Loader2, User, UserPlus, SearchX, X, Pencil, Trash2, LayoutGrid, List, AlertCircle, ArrowUpDown } from "lucide-react";
import { Pagination } from "@/components/Pagination";

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone: string;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"name" | "email">("name");
  const [currentPage, setCurrentPage] = useState(1);
  const CONTACTS_PER_PAGE = 9;

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeContact, setActiveContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  const fetchContacts = useCallback(async () => {
    try {
      const { data } = await api.get("/contacts");
      setContacts(data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Could not load contacts.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForm = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    };
    if (!cleanForm.name || !cleanForm.email || !cleanForm.phone) {
      setFormError("Please fill out all fields.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.post("/contacts", cleanForm);
      setContacts([data, ...contacts]);
      setAddOpen(false);
      setForm({ name: "", email: "", phone: "" });
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to add contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact) return;
    const cleanForm = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    };
    if (!cleanForm.name || !cleanForm.email || !cleanForm.phone) {
      setFormError("Please fill out all fields.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await api.put(`/contacts/${activeContact._id}`, cleanForm);
      setContacts(contacts.map((c) => (c._id === data._id ? data : c)));
      setEditOpen(false);
      setActiveContact(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to update contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!activeContact) return;
    setSaving(true);
    try {
      await api.delete(`/contacts/${activeContact._id}`);
      setContacts(contacts.filter((c) => c._id !== activeContact._id));
      setDeleteOpen(false);
      setActiveContact(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message || "Failed to delete contact.");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: Contact) => { setForm({ name: c.name, email: c.email, phone: c.phone }); setActiveContact(c); setEditOpen(true); setFormError(null); };
  const openDelete = (c: Contact) => { setActiveContact(c); setDeleteOpen(true); setFormError(null); };

  // Keyboard accessibility: dismiss modals on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (addOpen) setAddOpen(false);
        if (editOpen) { setEditOpen(false); setActiveContact(null); }
        if (deleteOpen) { setDeleteOpen(false); setActiveContact(null); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addOpen, editOpen, deleteOpen]);

  // Deferred search: input stays snappy, card list catches up
  const deferredSearch = useDeferredValue(search);
  const isSearching = search !== deferredSearch;

  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, sortBy]);

  const filtered = useMemo(() => {
    let result = contacts;
    if (deferredSearch) {
      const q = deferredSearch.toLowerCase();
      result = contacts.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(deferredSearch)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "email") return a.email.localeCompare(b.email);
      return 0;
    });
  }, [contacts, deferredSearch, sortBy]);

  const totalPages = Math.ceil(filtered.length / CONTACTS_PER_PAGE);

  // Auto-clamp page index if contacts were deleted or filtered out
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * CONTACTS_PER_PAGE;
    return filtered.slice(start, start + CONTACTS_PER_PAGE);
  }, [filtered, currentPage]);

  return (
    <AuthGuard>
      {loading ? (
        <div className="min-h-screen flex flex-col items-center justify-center">
          <FadeIn>
            <div className="flex items-center mb-6">
              <span className="text-5xl font-cursive font-medium -ml-0.5 text-primary">Kontacts</span>
            </div>
            <div className="flex gap-1.5 justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-foreground/20"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                />
              ))}
            </div>
          </FadeIn>
        </div>
      ) : (
        <div className="min-h-screen pt-28 pb-32 relative">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">

            {/* Header */}
            <div className="mb-8 text-center flex flex-col items-center animate-float-up" style={{ animationDelay: '0s' }}>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1] mb-2">
                Manage Your<br />
                <span className="font-cursive font-normal text-primary">Connections</span>
              </h1>
              <p className="text-muted-foreground/80 max-w-xs leading-relaxed text-xs sm:text-sm">
                Your professional network, beautifully organized.
              </p>
            </div>

            {/* Toolbar */}
            {contacts.length > 0 && (
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-center gap-2 mb-8 animate-float-up" style={{ animationDelay: '0.1s' }}>

                <div className="relative flex-1 group w-full md:max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/30 group-focus-within:text-foreground transition-colors duration-300" />
                  <input
                    className="w-full h-11 glass border-border/40 rounded-2xl pl-10 pr-10 text-sm placeholder:text-muted-foreground/20 focus:outline-none focus:border-foreground/20 focus:bg-secondary/40 transition-all duration-300 shadow-sm"
                    placeholder="Search your contacts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && !isSearching && (
                    <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-foreground transition-all duration-300 active:scale-95">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  {isSearching && (
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      <Loader2 className="h-4 w-4 text-primary animate-spin" />
                    </div>
                  )}
                  {/* Animated Loading Bar */}
                  <AnimatePresence>
                    {isSearching && (
                      <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        exit={{ scaleX: 0, opacity: 0 }}
                        className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary origin-left rounded-full z-10"
                        transition={{ duration: 0.5, ease: "easeInOut", repeat: Infinity }}
                      />
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <div className="flex h-10 items-center gap-1 rounded-[1.25rem] border border-border/40 bg-secondary/30 p-1">
                    <button
                      onClick={() => setView("grid")}
                      className={`h-8 px-3 rounded-full text-xs font-bold transition-all duration-300 ${view === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setView("list")}
                      className={`h-8 px-3 rounded-full text-xs font-bold transition-all duration-300 ${view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="hidden md:flex h-10 items-center gap-1 rounded-[1.25rem] border border-border/40 bg-secondary/30 p-1 ml-1">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/40 px-2">Sort</span>
                    <button
                      onClick={() => setSortBy("name")}
                      className={`h-8 px-3 rounded-full text-xs font-bold transition-all duration-300 ${sortBy === "name" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Name
                    </button>
                    <button
                      onClick={() => setSortBy("email")}
                      className={`h-8 px-3 rounded-full text-xs font-bold transition-all duration-300 ${sortBy === "email" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Email
                    </button>
                  </div>

                  {/* Mobile Sort Toggle */}
                  <div className="md:hidden flex items-center justify-center">
                    <button
                      onClick={() => setSortBy(sortBy === "name" ? "email" : "name")}
                      className="h-10 px-4 flex items-center gap-2 rounded-xl border border-border/40 bg-secondary/30 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground active:scale-95 transition-all shadow-sm hover:border-border/60 hover:text-foreground"
                      aria-label="Toggle Sort"
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />
                      <span>{sortBy}</span>
                    </button>
                  </div>

                  <div className="hidden md:flex items-center h-10 px-4 rounded-[1.25rem] border border-border/40 bg-secondary/30 text-xs tabular-nums text-muted-foreground transition-colors duration-300 ml-1">
                    <span className="font-bold text-foreground mr-1.5">
                      {filtered.length > 0 ? `${(currentPage - 1) * CONTACTS_PER_PAGE + 1}-${Math.min(currentPage * CONTACTS_PER_PAGE, filtered.length)}` : "0"}
                    </span>
                    <span className="opacity-50 text-[10px] font-bold uppercase tracking-wider">of {filtered.length} {deferredSearch ? "found" : "total"}</span>
                  </div>

                  <Button onClick={() => { setForm({ name: "", email: "", phone: "" }); setAddOpen(true); setFormError(null); }} size="default" className="h-10 rounded-[1.25rem] px-5 ml-1 flex items-center gap-2 group">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="hidden md:inline text-xs font-bold">New Contact</span>
                  </Button>
                </div>
              </div>
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

            {/* Content */}
            <div className={`transition-opacity duration-150 ${isSearching ? "opacity-60" : "opacity-100"}`}>
              {contacts.length === 0 ? (
                <FadeUp className="flex flex-col items-center justify-center py-20 sm:py-28 text-center max-w-sm mx-auto">
                  <div className="relative mb-6">
                    <div className="h-20 w-20 rounded-full bg-secondary/30 flex items-center justify-center text-muted-foreground">
                      <UserPlus className="h-7 w-7 opacity-60" />
                    </div>
                  </div>

                  <h3 className="font-bold text-xl sm:text-2xl tracking-tight mb-2">
                    No contacts <span className="font-cursive font-normal text-primary text-2xl sm:text-3xl">yet</span>
                  </h3>
                  <p className="text-muted-foreground/80 text-xs sm:text-sm leading-relaxed mb-6 max-w-xs">
                    Your address book is empty. Add your first contact to start building your network.
                  </p>

                  <Button
                    onClick={() => { setForm({ name: "", email: "", phone: "" }); setAddOpen(true); setFormError(null); }}
                    className="h-11 px-6 rounded-full text-xs font-bold flex items-center gap-2 group shadow-sm hover:shadow-md"
                  >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>Create First Contact</span>
                  </Button>
                </FadeUp>
              ) : filtered.length === 0 ? (
                <FadeUp className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto">
                  <div className="h-16 w-16 rounded-full bg-secondary/40 border border-border/40 flex items-center justify-center mb-4 text-muted-foreground">
                    <SearchX className="h-6 w-6 opacity-60" />
                  </div>
                  <h3 className="font-bold text-base mb-1">No contacts found</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-5 max-w-xs leading-relaxed">
                    No results for &quot;<span className="text-foreground font-medium">{search}</span>&quot;. Try checking for typos or clear your search.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSearch("")} className="rounded-full px-5 h-9 text-xs font-bold">
                      Clear Search
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setForm({ name: search, email: "", phone: "" });
                        setAddOpen(true);
                        setFormError(null);
                      }}
                      className="rounded-full px-5 h-9 text-xs font-bold"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Contact
                    </Button>
                  </div>
                </FadeUp>
              ) : view === "grid" ? (
                <StaggerContainer key={`grid-${deferredSearch}-${currentPage}`} trigger="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {paginatedContacts.map((c) => (
                    <StaggerItem key={c._id}>
                      <div className="group relative rounded-[1.25rem] sm:rounded-[1.5rem] border border-border/40 bg-background/80 hover:bg-secondary/15 hover:border-border/60 p-3.5 sm:p-4 transition-all duration-300 shadow-xs hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full">
                        {/* Top Header: Avatar & Actions */}
                        <div>
                          <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs sm:text-sm font-bold tracking-tight ring-1 ring-inset ring-border/80 group-hover:bg-foreground group-hover:text-background transition-all duration-300 shadow-xs">
                              {c.name.charAt(0).toUpperCase()}
                            </div>

                            <div className="flex items-center gap-1 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={() => openEdit(c)}
                                className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                                aria-label={`Edit ${c.name}`}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => openDelete(c)}
                                className="flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                aria-label={`Delete ${c.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Contact Name */}
                          <h3 className="font-bold text-[15px] sm:text-base tracking-tight truncate text-foreground group-hover:text-primary transition-colors duration-200 mb-2 sm:mb-3" title={c.name}>
                            {c.name}
                          </h3>
                        </div>

                        {/* Bottom Contact Details */}
                        <div className="space-y-1.5 sm:space-y-2 pt-2.5 sm:pt-3 border-t border-border/30">
                          <a
                            href={`mailto:${c.email}`}
                            className="flex items-center gap-2 text-muted-foreground text-xs sm:text-[13px] font-medium hover:text-foreground transition-colors duration-200 min-w-0 group/link"
                            title={`Send email to ${c.email}`}
                          >
                            <Mail className="h-3.5 w-3.5 opacity-50 shrink-0 group-hover/link:opacity-100 transition-opacity" />
                            <span className="truncate group-hover/link:underline underline-offset-2">{c.email}</span>
                          </a>
                          <a
                            href={`tel:${c.phone}`}
                            className="flex items-center gap-2 text-muted-foreground text-xs sm:text-[13px] font-medium hover:text-foreground transition-colors duration-200 min-w-0 group/link"
                            title={`Call ${c.phone}`}
                          >
                            <Phone className="h-3.5 w-3.5 opacity-50 shrink-0 group-hover/link:opacity-100 transition-opacity" />
                            <span className="truncate group-hover/link:underline underline-offset-2">{c.phone}</span>
                          </a>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <StaggerContainer key={`list-${deferredSearch}-${currentPage}`} trigger="animate" className="flex flex-col gap-2 sm:gap-2.5">
                  {paginatedContacts.map((c) => (
                    <StaggerItem key={c._id}>
                      <div className="group relative flex items-center justify-between py-2 px-3 sm:py-2.5 sm:px-3.5 sm:pr-4 rounded-2xl sm:rounded-full border border-border/40 bg-background/80 hover:bg-secondary/15 hover:border-border/60 shadow-xs hover:shadow-sm transition-all duration-200 gap-3">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Compact Avatar */}
                          <div className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full bg-secondary text-foreground flex items-center justify-center text-xs sm:text-sm font-bold tracking-tight ring-1 ring-inset ring-border/80 group-hover:bg-foreground group-hover:text-background transition-colors duration-300 shadow-xs">
                            {c.name.charAt(0).toUpperCase()}
                          </div>

                          {/* Contact Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-6 min-w-0 flex-1">
                            <p className="font-bold text-sm sm:text-[15px] text-foreground truncate leading-tight sm:min-w-[140px] lg:min-w-[180px]">
                              {c.name}
                            </p>

                            <div className="flex items-center gap-2 sm:gap-6 min-w-0 flex-1 text-[12px] sm:text-[13px] text-muted-foreground leading-tight">
                              <a
                                href={`mailto:${c.email}`}
                                className="truncate hover:text-foreground transition-colors duration-200 hover:underline underline-offset-2 flex items-center gap-1.5 max-w-[160px] sm:max-w-none"
                                title={`Send email to ${c.email}`}
                              >
                                <Mail className="h-3 w-3 opacity-50 shrink-0 hidden sm:block" />
                                <span className="truncate">{c.email}</span>
                              </a>
                              <span className="opacity-30 sm:hidden">•</span>
                              <a
                                href={`tel:${c.phone}`}
                                className="truncate hover:text-foreground transition-colors duration-200 hover:underline underline-offset-2 flex items-center gap-1.5"
                                title={`Call ${c.phone}`}
                              >
                                <Phone className="h-3 w-3 opacity-50 shrink-0 hidden sm:block" />
                                <span className="truncate">{c.phone}</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => openEdit(c)}
                            className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            aria-label={`Edit ${c.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => openDelete(c)}
                            className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            aria-label={`Delete ${c.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              )}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>

          {/* Modals — all use AnimatePresence + ScaleIn for spring physics */}

          <AnimatePresence>
            {addOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  className="fixed inset-0 bg-background/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setAddOpen(false)}
                />
                <ScaleIn className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold tracking-tight">New Contact</h2>
                      <button onClick={() => setAddOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                    <form onSubmit={handleAdd} className="space-y-3.5">
                      {formError && (
                        <FadeIn className="rounded-lg border border-border/60 bg-secondary/80 px-3 py-2 text-xs text-foreground font-bold flex items-center gap-2 shadow-sm">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          {formError}
                        </FadeIn>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" required autoFocus />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                        <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 000 0000" required />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </ScaleIn>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {editOpen && activeContact && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  className="fixed inset-0 bg-background/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setEditOpen(false)}
                />
                <ScaleIn className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-xl">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h2 className="text-lg font-bold tracking-tight">Edit Contact</h2>
                      <button onClick={() => setEditOpen(false)} className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><X className="h-4 w-4" /></button>
                    </div>
                    <form onSubmit={handleEdit} className="space-y-3.5">
                      {formError && (
                        <FadeIn className="rounded-lg border border-border/60 bg-secondary/80 px-3 py-2 text-xs text-foreground font-bold flex items-center gap-2 shadow-sm">
                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          {formError}
                        </FadeIn>
                      )}
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</label>
                        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</label>
                        <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Phone</label>
                        <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={saving}>
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                        </Button>
                      </div>
                    </form>
                  </div>
                </ScaleIn>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {deleteOpen && activeContact && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                  className="fixed inset-0 bg-background/80"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setDeleteOpen(false)}
                />
                <ScaleIn className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-xl text-center">
                  <div className="p-6">
                    <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
                      <Trash2 className="h-5 w-5 text-foreground/70" />
                    </div>
                    <h2 className="font-bold text-lg mb-1">Delete contact?</h2>
                    <p className="text-sm text-muted-foreground mb-5">
                      <strong className="text-foreground">{activeContact.name}</strong> will be permanently removed.
                    </p>
                    {formError && (
                      <FadeIn className="mb-5 rounded-lg border border-border/60 bg-secondary/80 px-3 py-2 text-xs text-foreground font-bold text-left flex items-center gap-2 shadow-sm">
                        <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
                        {formError}
                      </FadeIn>
                    )}
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                      <Button variant="outline" onClick={handleDelete} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
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
