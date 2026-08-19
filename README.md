# Tamil Nadu Vetri Super App (TVS App)

The **Tamil Nadu Vetri Super App** is an ambitious, unified government-to-citizen (G2C) platform designed to consolidate government services, enhance operational transparency, and provide meticulous Service Level Agreement (SLA) monitoring across the state. 

This repository contains the completely refactored, robust 20-layer architecture spanning a Next.js App Router frontend, a high-performance Rust backend, and a Node.js data proxy for seamless MongoDB integration.

---

## 🏛️ System Architecture

The application is built on a highly modular 20-layer architecture. It distinctly separates presentation, business logic, domain services, and data access to guarantee extreme scalability and type-safety.

### 1. Frontend (Next.js 16 + React)
- **App Router & Server Actions**: Eliminates thick client-side data fetching. Server Components pre-render data directly from the backend API.
- **Layers**: 
  - `src/app/`: Routing and Pages (Server Components).
  - `src/components/`: Reusable React components (Forms, SLA Trackers).
  - `src/layers/`: Domain mapping, view models, and UI state handlers.
- **Styling**: Tailwind CSS with Institutional Brutalism design language.
- **Bottom Tab Bar**: A standard navigation menu positioned at the footer, providing quick access to four core modules: Home (currently active and highlighted in red), Services, Vault, and Settings.

### 2. Backend (Rust + Axum)
Located in `backend-rust/`.
- **Axum Web Framework**: Extremely fast routing and request handling.
- **Strict Domain Driven Design**: Divided into clear layers:
  - `l1_routing` -> `l2_controllers` -> `l3_request_validation` -> `l4_application_services` -> `l5_domain_services` -> `l8_data_access`.
- **Integrations**: Includes stubs for external systems like SFDB (State Family Database), eKYC Aadhaar Auth, and the Nambikkai Inaiyam Blockchain Ledger.

### 3. Database Proxy (Node.js + Express)
Located in `db-proxy/`.
- **Why a proxy?**: Acts as a robust bridge between the Rust backend and MongoDB, sidestepping Windows MSVC cryptography build limitations (`ring` / `rustls`).
- **Features**: Safely serializes BSON `ObjectId` and `Date` objects into JSON structures that Rust's `serde` can rigorously deserialize.

---

## 🚀 Getting Started

To run the full stack locally, you need to start all three services.

### Prerequisites
- Node.js (v18+)
- Rust & Cargo
- MongoDB (running locally on default port `27017`)

### 1. Start the Database Proxy
```bash
cd db-proxy
npm install
npm start
```
*Runs on http://localhost:27018*

### 2. Start the Rust Backend
Open a new terminal:
```bash
cd backend-rust
cargo run
```
*Runs on http://localhost:8080*

### 3. Start the Next.js Frontend
Open a new terminal:
```bash
# From the project root
npm install
npm run dev
```
*Runs on http://localhost:3000*

---

## 📂 Folder Structure

```text
vetri-tn-super-app/
├── backend-rust/            # Rust Axum backend (Layers 1-10)
│   ├── Cargo.toml
│   └── src/                 
├── db-proxy/                # Node.js MongoDB Express Proxy
│   ├── server.js            
│   └── package.json         
├── src/                     # Next.js Frontend
│   ├── app/                 # Next.js 16 App Router pages
│   ├── components/          # Reusable UI Components
│   ├── layers/              # Frontend domain & view logic
│   └── proxy.ts             # Next.js Server proxy and middleware routing
├── next.config.ts           # Next.js configuration (Proxies /api to Rust backend)
└── tailwind.config.ts       # Tailwind CSS styles
```

## 🔐 Authentication & SLA

- **Authentication Flow**: The app features a unified Sign In & Registration gateway at `/login`. Secure session management is handled entirely server-side via Next.js **Server Actions** (`loginAction`, `logoutAction`), which store HTTP-only cookies (`auth_token`). Unauthenticated users are strictly redirected by the Next.js middleware router (`proxy.ts`). Active users can securely log out via the "SIGN OUT" button in the global header.
- **SLA Engine**: Real-time SLA breach countdowns powered by `src/layers/6_ApplicationServices/engine.ts`, providing absolute transparency for service delivery timeframes.

## 🤝 Contributing
Please ensure all branches pass the following checks before merging:
- Frontend: `npm run build`
- Backend: `cargo check`
