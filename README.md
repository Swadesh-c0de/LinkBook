<div align="center">

# 📇 Kontacts

**A minimal, high-performance contact management workspace.**  
*Crafted with Next.js, TypeScript, Tailwind CSS, and Framer Motion.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-kontacts.vercel.app-black?style=for-the-badge&logo=vercel)](https://kontacts.vercel.app)
[![Backend Repo](https://img.shields.io/badge/Backend_API-Repository-24292e?style=for-the-badge&logo=github)](https://github.com/Swadesh-c0de/contacts-management-system-backend)

<br />

[![Next.js](https://img.shields.io/badge/Next.js-16_(Turbopack)-000000?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-12.0-FF0055?style=flat-square&logo=framer&logoColor=white)](https://framer.com/motion)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 🌟 Overview

**Kontacts** is a modern, responsive personal contacts manager engineered for speed, clean aesthetics, and fluid interactions. Built with Next.js App Router and TypeScript, it pairs an ultra-clean Swiss-inspired typography layout with spring-physics micro-interactions and secure JWT token lifecycle management.

---

## ✨ Key Features

- **⚡ Instant Search & Filtering**: Real-time multi-field search powered by React's `useDeferredValue` with animated search indicators and non-blocking input responsiveness.
- **📇 Complete Contact Management (CRUD)**: Seamlessly create, inspect, edit, and delete contacts with instantaneous UI feedback and optimistic state transitions.
- **🌊 Circular Wave Theme Transition**: Smooth circular ripple dark/light mode toggle powered by the native Web **View Transitions API** and `flushSync` DOM synchronization.
- **📱 Responsive & Mobile-First**: Adaptive dual layout featuring a floating desktop header, bottom navigation bar on mobile, and smooth view switching (Grid / List).
- **🔒 Secure Authentication & Token Rotation**: JWT-authenticated sessions with automated Axios response interceptors for silent token refresh and seamless session renewal.
- **🛡️ Server-Side Reverse Proxy**: Integrated Next.js API proxy (`/api/proxy/*`) for secure cookie handling, CORS mitigation, and HTTPS backend communication.
- **📄 Smart Dynamic Pagination**: Smooth pagination engine with active page sliding indicators and mobile-optimized controls.
- **🎨 Minimalist Empty States**: Clean, aesthetic zero-data and search-empty states with one-click quick actions.
- **👤 Comprehensive Profile Control**: Manage credentials, update usernames, change passwords, and permanently delete accounts with modal confirmation workflows.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict mode) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com/) with CSS variables & Glassmorphic tokens |
| **Motion & Physics** | [Framer Motion](https://framer.com/motion) (Spring animations, LayoutId transitions) |
| **Networking & HTTP** | [Axios](https://axios-http.com/) with Request/Response Interceptors |
| **State & Theme** | [next-themes](https://github.com/pacocoursey/next-themes), React Hooks (`useMemo`, `useCallback`, `useDeferredValue`) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Backend API** | [Node.js / Express / MongoDB](https://github.com/Swadesh-c0de/contacts-management-system-backend) |

---

## 🏗️ Architecture & Data Flow

```text
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│   (Next.js App Router • Framer Motion • Axios Interceptors) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP /api/proxy/*
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Next.js Server Proxy API                    │
│   (/app/api/proxy/[...path] • Cookie Forwarding • HTTPS)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Secure HTTPS Forwarding
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend REST API Service                  │
│    (Express • JWT Access/Refresh Tokens • MongoDB Atlas)    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```text
Kontacts/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── proxy/[...path]/ # Server-side CORS & Cookie Proxy
│   │   ├── login/               # Authentication - Sign In Page
│   │   ├── register/            # Authentication - Sign Up Page
│   │   ├── profile/             # User Account & Profile Settings
│   │   ├── globals.css          # Design Tokens, View Transitions & Global Styles
│   │   ├── layout.tsx           # Root Layout with Font & Theme Providers
│   │   └── page.tsx             # Main Contacts Dashboard
│   ├── components/
│   │   ├── AuthGuard.tsx        # Route Protection (AuthGuard & GuestGuard)
│   │   ├── Button.tsx           # Reusable Polymorphic Button Primitive
│   │   ├── Input.tsx            # Form Input Component with Focused States
│   │   ├── Navbar.tsx           # Floating Header & Mobile Navigation
│   │   ├── Pagination.tsx       # Smart Page Navigator with Sliding Indicators
│   │   ├── ThemeToggle.tsx      # View Transition Circular Ripple Theme Toggle
│   │   ├── ThemeProvider.tsx    # Next-Themes Wrapper
│   │   └── motion.tsx           # Framer Motion Primitives (FadeUp, ScaleIn, etc.)
│   └── lib/
│       └── api.ts               # Axios Client with Token Refresh Interceptor
├── public/                      # Static Assets & Icons
├── tailwind.config.ts           # Custom Tailwind Configuration & Keyframes
├── tsconfig.json                # TypeScript Configuration
└── package.json                 # Project Metadata & Dependencies
```

---

## 🔗 Related Repositories

- 🌐 **Frontend Application**: [https://github.com/Swadesh-c0de/kontacts](https://github.com/Swadesh-c0de/kontacts)
- ⚙️ **Backend REST API**: [https://github.com/Swadesh-c0de/contacts-management-system-backend](https://github.com/Swadesh-c0de/contacts-management-system-backend)

---

## 👤 Author

**Swadesh Patel**
- GitHub: [@Swadesh-c0de](https://github.com/Swadesh-c0de)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).