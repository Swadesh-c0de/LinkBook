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
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await api.post("/contacts", form);
      setContacts([data, ...contacts]);
      setAddOpen(false); setForm({ name: "", email: "", phone: "" });
    } catch (err: any) { setFormError(err.response?.data?.message || "Failed to add contact."); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!activeContact) return; setSaving(true);
    try {
      const { data } = await api.put(`/contacts/${activeContact._id}`, form);
      setContacts(contacts.map((c) => (c._id === data._id ? data : c)));
      setEditOpen(false); setActiveContact(null);
    } catch (err: any) { setFormError(err.response?.data?.message || "Failed to update contact."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!activeContact) return; setSaving(true);
    try {
      await api.delete(`/contacts/${activeContact._id}`);
      setContacts(contacts.filter((c) => c._id !== activeContact._id));
      setDeleteOpen(false); setActiveContact(null);
    } catch (err: any) { setFormError(err.response?.data?.message || "Failed to delete contact."); }
    finally { setSaving(false); }
  };

  const openEdit = (c: Contact) => { setActiveContact(c); setForm({ name: c.name, email: c.email, phone: c.phone }); setEditOpen(true); setFormError(null); };
  const openDelete = (c: Contact) => { setActiveContact(c); setDeleteOpen(true); setFormError(null); };

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
        <div className="min-h-screen pt-28 pb-24 relative">
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
                <StaggerContainer key={`grid-${deferredSearch}-${currentPage}`} trigger="animate" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                  {paginatedContacts.map((c) => (
                    <StaggerItem key={c._id}>
                      <div className="group relative rounded-[1.5rem] border border-border/40 glass p-4 sm:p-5 transition-all duration-300 hover:bg-secondary/10 hover:border-border/60 shadow-sm hover:shadow-md hover:-translate-y-1 flex flex-col overflow-hidden h-full">
                        <div className="flex items-start justify-between mb-4">
                          <div className="h-10 w-10 rounded-full bg-secondary text-foreground flex items-center justify-center text-sm font-bold tracking-tight ring-1 ring-inset ring-border/80 group-hover:bg-foreground group-hover:text-background transition-all duration-500 shadow-sm">
                            {c.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex items-center gap-1.5 lg:opacity-0 lg:group-hover:opacity-100 transition-all duration-300 lg:-translate-y-1 lg:group-hover:translate-y-0 relative z-10 bg-background/50 sm:bg-transparent p-1 sm:p-0 rounded-full">
                            <button
                              onClick={() => openEdit(c)}
                              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full text-muted-foreground hover:text-foreground bg-secondary hover:bg-foreground/10 transition-colors shadow-sm sm:shadow-none"
                              aria-label="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDelete(c)}
                              className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-full text-muted-foreground hover:text-foreground bg-secondary hover:bg-foreground/10 transition-colors shadow-sm sm:shadow-none"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="font-bold text-lg tracking-tight truncate group-hover:text-primary transition-colors duration-300" title={c.name}>
                            {c.name}
                          </h3>
                        </div>

                        <div className="mt-auto space-y-3 pt-4 border-t border-border/40">
                          <div className="flex items-center gap-3 text-muted-foreground text-[14px] font-medium group-hover:text-foreground/80 transition-colors duration-300">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground transition-all duration-300">
                              <Mail className="h-4 w-4" />
                            </div>
                            <span className="truncate" title={c.email}>{c.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-muted-foreground text-[14px] font-medium group-hover:text-foreground/80 transition-colors duration-300">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary/80 text-muted-foreground group-hover:bg-foreground/10 group-hover:text-foreground transition-all duration-300">
                              <Phone className="h-4 w-4" />
                            </div>
                            <span className="truncate" title={c.phone}>{c.phone}</span>
                          </div>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <StaggerContainer key={`list-${deferredSearch}-${currentPage}`} trigger="animate" className="flex flex-col gap-3">
                  {paginatedContacts.map((c) => (
                    <StaggerItem key={c._id}>
                      <div className="group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-2 sm:pr-4 rounded-[1.5rem] sm:rounded-full border border-border/40 bg-background hover:bg-secondary/10 hover:border-border/60 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                          <div className="h-14 w-14 sm:h-12 sm:w-12 shrink-0 rounded-full bg-secondary text-foreground flex items-center justify-center text-lg sm:text-base font-bold tracking-tight ring-1 ring-inset ring-border/80 group-hover:bg-foreground group-hover:text-background transition-colors duration-500">
                            {c.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 min-w-0 flex-1">
                            <p className="font-bold text-[16px] sm:text-[15px] truncate sm:min-w-[160px] lg:min-w-[200px] mt-0.5 sm:mt-0">{c.name}</p>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-8 min-w-0 flex-1 text-[13px] text-muted-foreground font-medium mt-1 sm:mt-0">
                              <span className="flex items-center gap-2 truncate group-hover:text-foreground/80 transition-colors duration-300">
                                <Mail className="h-3.5 w-3.5 opacity-40 shrink-0 hidden sm:block" />
                                {c.email}
                              </span>
                              <span className="flex items-center gap-2 truncate group-hover:text-foreground/80 transition-colors duration-300">
                                <Phone className="h-3.5 w-3.5 opacity-40 shrink-0 hidden sm:block" />
                                {c.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 mt-4 sm:mt-0 border-t border-border/40 sm:border-0 pt-3 sm:pt-0 shrink-0">
                          <div className="flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                            <button
                              onClick={() => openEdit(c)}
                              className="flex items-center justify-center gap-1.5 px-4 sm:px-0 py-2 sm:py-0 sm:h-9 sm:w-9 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary/60 sm:bg-transparent hover:bg-secondary transition-all"
                            >
                              <Pencil className="h-3.5 w-3.5" /> <span className="sm:hidden">Edit</span>
                            </button>
                            <button
                              onClick={() => openDelete(c)}
                              className="flex items-center justify-center gap-1.5 px-4 sm:px-0 py-2 sm:py-0 sm:h-9 sm:w-9 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary/60 sm:bg-transparent hover:bg-secondary transition-all"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> <span className="sm:hidden">Delete</span>
                            </button>
                          </div>
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
