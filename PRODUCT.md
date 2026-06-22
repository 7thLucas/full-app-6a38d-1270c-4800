## App: LEIRE DENTAL Y CLÍNICA — MVP

### What we are building (MVP scope)
A voice-interactive professional agenda for dental and aesthetic clinics, powered by a built-in voice assistant named **Leire**.

Core MVP features:
1. **Leire voice assistant** — wake-word activation ("Leire"), listens in the background after login, transcribes user speech in real time, and responds in a natural female voice in Spain Spanish (es-ES). Voice-first, but keyboard always available.
2. **Interactive Agenda** — central module: appointment scheduling and calendar management, operable by voice or by clicking/typing. Create, move, cancel, and view appointments.
3. **Professional coordination** — view and coordinate the agendas of multiple professionals (dentists / aesthetic specialists), assign appointments to a professional, see availability.
4. **Role / privilege-based access** — login with roles: Administrador, Dentista/Especialista, Recepcionista, Auxiliar, Director/Gestor. UI and actions filtered by role and granular privileges.

### Users
- Dentists / aesthetic specialists — manage agenda and patients by voice during consultation
- Receptionists — appointments and patient registration, voice or keyboard
- Assistants — quick voice access to info
- Administrators — manage users, reports, staff
- Directors / network managers — multi-clinic KPIs (post-MVP)

### Language & tone
- **UI language: Spanish (Spain).** All labels, buttons, messages in es-ES.
- Tone: professional, modern-clinical, warm — "Leire" feels like a virtual coworker, not a robot.
- Leire's spoken responses must sound natural and human; she is the daily primary touchpoint and the product's brand.

### Strategic principles
1. Voice first, keyboard always available — every operation reachable by voice, no feature voice-exclusive.
2. Role-based security — granular privilege system prevents data leakage between users.
3. Natural, human-grade voice — non-negotiable quality bar for Leire's TTS.

### Anti-references
- Do not make it feel robotic or like a generic admin CRUD panel.
- Avoid cold/sterile enterprise dashboards; keep it clinical-modern but warm and approachable.