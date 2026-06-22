/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  // Base
  background: string;
  foreground: string;
  // Card
  card: string;
  cardForeground: string;
  // Popover
  popover: string;
  popoverForeground: string;
  // Primary
  primary: string;
  primaryForeground: string;
  // Secondary
  secondary: string;
  secondaryForeground: string;
  // Muted
  muted: string;
  mutedForeground: string;
  // Accent
  accent: string;
  accentForeground: string;
  // Destructive
  destructive: string;
  destructiveForeground: string;
  // Border / Input / Ring
  border: string;
  input: string;
  ring: string;
  // Charts
  chart1?: string;
  chart2?: string;
  chart3?: string;
  chart4?: string;
  chart5?: string;
  // Navbar
  navbarBackground: string;
  // Sidebar
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
};

export type TFont = {
  headingFont: string;
  textFont: string;
};

export type TVoiceAssistant = {
  name: string;
  wakeWord: string;
  language: string;
  voiceGender: string;
  speakResponses?: boolean;
  autoListen?: boolean;
  speechRate?: number;
};

export type TAgenda = {
  dayStartHour: number;
  dayEndHour: number;
  slotMinutes: number;
};

export type TTreatmentType = {
  name: string;
  durationMinutes: number;
  color?: string;
};

export type TFeatures = {
  enableVoiceAssistant?: boolean;
  showProfessionalColumns?: boolean;
  enablePatientRegistry?: boolean;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  clinicTagline?: string;
  welcomeMessage?: string;
  voiceAssistant: TVoiceAssistant;
  agenda: TAgenda;
  treatmentTypes?: TTreatmentType[];
  features: TFeatures;
  font: TFont;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "LEIRE DENTAL Y CLÍNICA",
  logoUrl: "",
  brandColor: {
    // Base
    background:        "#f7fafb",
    foreground:        "#1f2a37",
    // Card
    card:              "#ffffff",
    cardForeground:    "#1f2a37",
    // Popover
    popover:           "#ffffff",
    popoverForeground: "#1f2a37",
    // Primary — calm medical teal
    primary:           "#0e9c95",
    primaryForeground: "#ffffff",
    // Secondary — soft teal tint
    secondary:           "#e6f6f5",
    secondaryForeground: "#0e5a56",
    // Muted
    muted:           "#eef3f4",
    mutedForeground: "#64748b",
    // Accent — warm coral ("Leire is listening")
    accent:           "#ff8a6b",
    accentForeground: "#3d1408",
    // Destructive
    destructive:           "#e15b5b",
    destructiveForeground: "#ffffff",
    // Border / Input / Ring
    border: "#dce5e7",
    input:  "#dce5e7",
    ring:   "#0fb8b0",
    // Charts
    chart1: "#0fb8b0",
    chart2: "#34c0b8",
    chart3: "#ff8a6b",
    chart4: "#f5b945",
    chart5: "#5aa9e6",
    // Navbar
    navbarBackground: "#ffffff",
    // Sidebar
    sidebarBackground:        "#ffffff",
    sidebarForeground:        "#475569",
    sidebarPrimary:           "#0e9c95",
    sidebarPrimaryForeground: "#ffffff",
    sidebarAccent:            "#e6f6f5",
    sidebarAccentForeground:  "#0e5a56",
    sidebarBorder:            "#e4ecee",
    sidebarRing:              "#0fb8b0",
  },
  clinicTagline: "Gestión clínica con voz. Leire siempre a tu lado.",
  welcomeMessage: "Hola, soy Leire. Dime «Leire» y te ayudo con tu agenda.",
  voiceAssistant: {
    name: "Leire",
    wakeWord: "Leire",
    language: "es-ES",
    voiceGender: "female",
    speakResponses: true,
    autoListen: true,
    speechRate: 1,
  },
  agenda: {
    dayStartHour: 8,
    dayEndHour: 20,
    slotMinutes: 30,
  },
  treatmentTypes: [
    { name: "Revisión", durationMinutes: 30, color: "#0fb8b0" },
    { name: "Limpieza dental", durationMinutes: 45, color: "#34c0b8" },
    { name: "Empaste", durationMinutes: 45, color: "#5aa9e6" },
    { name: "Endodoncia", durationMinutes: 60, color: "#f5b945" },
    { name: "Ortodoncia", durationMinutes: 30, color: "#9b8cff" },
    { name: "Estética facial", durationMinutes: 60, color: "#ff8a6b" },
    { name: "Implante", durationMinutes: 90, color: "#0e9c95" },
  ],
  features: {
    enableVoiceAssistant: true,
    showProfessionalColumns: true,
    enablePatientRegistry: true,
  },
  font: {
    headingFont: "Plus Jakarta Sans",
    textFont: "Inter",
  },
};
