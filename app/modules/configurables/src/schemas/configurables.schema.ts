/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        // ── Base ────────────────────────────────────────────────────────────
        { fieldName: "background",        type: "color", required: true,  label: "Background" },
        { fieldName: "foreground",        type: "color", required: true,  label: "Foreground" },
        // ── Card ────────────────────────────────────────────────────────────
        { fieldName: "card",              type: "color", required: true,  label: "Card" },
        { fieldName: "cardForeground",    type: "color", required: true,  label: "Card Foreground" },
        // ── Popover ─────────────────────────────────────────────────────────
        { fieldName: "popover",           type: "color", required: true,  label: "Popover" },
        { fieldName: "popoverForeground", type: "color", required: true,  label: "Popover Foreground" },
        // ── Primary ─────────────────────────────────────────────────────────
        { fieldName: "primary",           type: "color", required: true,  label: "Primary" },
        { fieldName: "primaryForeground", type: "color", required: true,  label: "Primary Foreground" },
        // ── Secondary ───────────────────────────────────────────────────────
        { fieldName: "secondary",           type: "color", required: true,  label: "Secondary" },
        { fieldName: "secondaryForeground", type: "color", required: true,  label: "Secondary Foreground" },
        // ── Muted ───────────────────────────────────────────────────────────
        { fieldName: "muted",           type: "color", required: true,  label: "Muted" },
        { fieldName: "mutedForeground", type: "color", required: true,  label: "Muted Foreground" },
        // ── Accent ──────────────────────────────────────────────────────────
        { fieldName: "accent",           type: "color", required: true,  label: "Accent" },
        { fieldName: "accentForeground", type: "color", required: true,  label: "Accent Foreground" },
        // ── Destructive ─────────────────────────────────────────────────────
        { fieldName: "destructive",           type: "color", required: true,  label: "Destructive" },
        { fieldName: "destructiveForeground", type: "color", required: true,  label: "Destructive Foreground" },
        // ── Border / Input / Ring ────────────────────────────────────────────
        { fieldName: "border", type: "color", required: true, label: "Border" },
        { fieldName: "input",  type: "color", required: true, label: "Input" },
        { fieldName: "ring",   type: "color", required: true, label: "Ring" },
        // ── Charts ──────────────────────────────────────────────────────────
        { fieldName: "chart1", type: "color", required: false, label: "Chart 1" },
        { fieldName: "chart2", type: "color", required: false, label: "Chart 2" },
        { fieldName: "chart3", type: "color", required: false, label: "Chart 3" },
        { fieldName: "chart4", type: "color", required: false, label: "Chart 4" },
        { fieldName: "chart5", type: "color", required: false, label: "Chart 5" },
        // ── Navbar ──────────────────────────────────────────────────────────
        { fieldName: "navbarBackground", type: "color", required: true, label: "Navbar Background" },
        // ── Sidebar ─────────────────────────────────────────────────────────
        { fieldName: "sidebarBackground",        type: "color", required: true,  label: "Sidebar Background" },
        { fieldName: "sidebarForeground",        type: "color", required: true,  label: "Sidebar Foreground" },
        { fieldName: "sidebarPrimary",           type: "color", required: true,  label: "Sidebar Primary" },
        { fieldName: "sidebarPrimaryForeground", type: "color", required: true,  label: "Sidebar Primary Foreground" },
        { fieldName: "sidebarAccent",            type: "color", required: true,  label: "Sidebar Accent" },
        { fieldName: "sidebarAccentForeground",  type: "color", required: true,  label: "Sidebar Accent Foreground" },
        { fieldName: "sidebarBorder",            type: "color", required: true,  label: "Sidebar Border" },
        { fieldName: "sidebarRing",              type: "color", required: true,  label: "Sidebar Ring" },
      ],
    },

    // ── Branding copy ────────────────────────────────────────────────────────
    {
      fieldName: "clinicTagline",
      type: "string",
      required: false,
      label: "Eslogan de la clínica",
      maxLength: 160,
    },
    {
      fieldName: "welcomeMessage",
      type: "string",
      required: false,
      label: "Mensaje de bienvenida",
      maxLength: 200,
    },
    // ── Leire voice assistant ────────────────────────────────────────────────
    {
      fieldName: "voiceAssistant",
      type: "object",
      required: true,
      label: "Asistente de voz",
      fields: [
        { fieldName: "name", type: "string", required: true, label: "Nombre del asistente" },
        { fieldName: "wakeWord", type: "string", required: true, label: "Palabra de activación" },
        {
          fieldName: "language",
          type: "enum",
          required: true,
          label: "Idioma",
          options: ["es-ES", "es-MX", "en-US", "en-GB"],
        },
        {
          fieldName: "voiceGender",
          type: "enum",
          required: true,
          label: "Género de voz",
          options: ["female", "male"],
        },
        { fieldName: "speakResponses", type: "boolean", required: false, label: "Leer respuestas en voz alta" },
        { fieldName: "autoListen", type: "boolean", required: false, label: "Escuchar en segundo plano tras iniciar sesión" },
        { fieldName: "speechRate", type: "number", required: false, label: "Velocidad de voz", min: 0.5, max: 2 },
      ],
    },
    // ── Agenda ───────────────────────────────────────────────────────────────
    {
      fieldName: "agenda",
      type: "object",
      required: true,
      label: "Agenda",
      fields: [
        { fieldName: "dayStartHour", type: "number", required: true, label: "Hora de inicio", min: 0, max: 23 },
        { fieldName: "dayEndHour", type: "number", required: true, label: "Hora de fin", min: 1, max: 24 },
        { fieldName: "slotMinutes", type: "number", required: true, label: "Duración de franja (min)", min: 5, max: 120 },
      ],
    },
    // ── Catálogo de tratamientos ──────────────────────────────────────────────
    {
      fieldName: "treatmentTypes",
      type: "array",
      required: false,
      label: "Tipos de tratamiento",
      item: {
        type: "object",
        fields: [
          { fieldName: "name", type: "string", required: true, label: "Nombre" },
          { fieldName: "durationMinutes", type: "number", required: true, label: "Duración (min)" },
          { fieldName: "color", type: "color", required: false, label: "Color" },
        ],
      },
    },
    // ── Feature flags ─────────────────────────────────────────────────────────
    {
      fieldName: "features",
      type: "object",
      required: true,
      label: "Funcionalidades",
      fields: [
        { fieldName: "enableVoiceAssistant", type: "boolean", required: false, label: "Activar asistente de voz" },
        { fieldName: "showProfessionalColumns", type: "boolean", required: false, label: "Mostrar columnas por profesional" },
        { fieldName: "enablePatientRegistry", type: "boolean", required: false, label: "Activar registro de pacientes" },
      ],
    },

    {
      fieldName: "font",
      type: "object",
      required: true,
      label: "Typography",
      fields: [
        {
          fieldName: "headingFont",
          type: "enum",
          required: true,
          label: "Heading Font",
          options: [
            "Inter",
            "Inter Tight",
            "Plus Jakarta Sans",
            "Poppins",
            "Montserrat",
            "Raleway",
            "Playfair Display",
            "Lora",
            "Merriweather",
            "EB Garamond",
            "Cinzel",
            "Cormorant Garamond",
            "Libre Baskerville",
            "PT Serif",
            "Nunito",
            "Outfit",
            "DM Sans",
            "Sora",
            "Space Grotesk",
            "Josefin Sans",
            "Rubik",
            "Quicksand",
            "Figtree",
            "Lexend",
          ],
        },
        {
          fieldName: "textFont",
          type: "enum",
          required: true,
          label: "Text Font",
          options: [
            "Inter",
            "Inter Tight",
            "Plus Jakarta Sans",
            "Poppins",
            "Montserrat",
            "Raleway",
            "Lora",
            "Merriweather",
            "EB Garamond",
            "Libre Baskerville",
            "PT Serif",
            "Nunito",
            "Outfit",
            "DM Sans",
            "Sora",
            "Source Sans 3",
            "Noto Sans",
            "Lato",
            "Open Sans",
            "Roboto",
            "Rubik",
            "Quicksand",
            "Figtree",
            "Lexend",
          ],
        },
      ],
    },
  ],
};