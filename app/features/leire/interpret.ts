import { invokeLLM } from "~/modules/agentic";
import type { AppointmentView, ProfessionalView } from "~/api/domain/domain.types";

export interface LeireContext {
  assistantName: string;
  professionals: ProfessionalView[];
  appointments: AppointmentView[];
}

export interface LeireReply {
  /** Spoken/displayed answer. */
  text: string;
  /** Optional navigation intent the UI can act on. */
  navigate?: "/agenda" | "/profesionales" | "/pacientes";
}

function timeLabel(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Strip the wake word from the start of an utterance.
 * e.g. "Leire, ¿qué citas tengo hoy?" -> "¿qué citas tengo hoy?"
 */
export function stripWakeWord(text: string, wakeWord: string): string {
  const n = normalize(text);
  const w = normalize(wakeWord);
  const idx = n.indexOf(w);
  if (idx === -1) return text.trim();
  let rest = text.slice(idx + wakeWord.length);
  rest = rest.replace(/^[\s,.:;¿¡!?-]+/, "");
  return rest.trim();
}

export function containsWakeWord(text: string, wakeWord: string): boolean {
  return normalize(text).includes(normalize(wakeWord));
}

/** Fast local intent matching for common agenda questions. Returns null if unmatched. */
function localInterpret(query: string, ctx: LeireContext): LeireReply | null {
  const q = normalize(query);
  if (!q) return null;

  const todayCount = ctx.appointments.length;

  // "¿cuántas citas hay hoy?" / "citas de hoy"
  if (
    (q.includes("cuant") || q.includes("cuent")) &&
    q.includes("cita")
  ) {
    if (todayCount === 0) {
      return { text: "Hoy no hay ninguna cita programada en la agenda." };
    }
    return {
      text: `Hoy hay ${todayCount} ${todayCount === 1 ? "cita programada" : "citas programadas"}.`,
    };
  }

  // "¿qué citas tengo hoy?" / "lee la agenda" / "muéstrame la agenda"
  if (
    q.includes("cita") ||
    q.includes("agenda") ||
    q.includes("hoy tengo") ||
    q.includes("tengo hoy")
  ) {
    if (todayCount === 0) {
      return {
        text: "La agenda de hoy está vacía. ¿Quieres que abra la agenda para añadir una cita?",
        navigate: "/agenda",
      };
    }
    const first = ctx.appointments
      .slice(0, 4)
      .map(
        (a) =>
          `a las ${timeLabel(a.start)}, ${a.patientName} con ${a.professionalName}`,
      )
      .join("; ");
    const more =
      todayCount > 4 ? ` y ${todayCount - 4} citas más` : "";
    return {
      text: `Hoy tienes ${todayCount} citas. ${first}${more}. Te muestro la agenda.`,
      navigate: "/agenda",
    };
  }

  // "¿quiénes son los profesionales?" / "lista de profesionales"
  if (q.includes("profesional") || q.includes("doctor") || q.includes("dentista")) {
    if (ctx.professionals.length === 0) {
      return {
        text: "Todavía no hay profesionales dados de alta.",
        navigate: "/profesionales",
      };
    }
    const names = ctx.professionals.map((p) => p.name).join(", ");
    return {
      text: `El equipo lo forman: ${names}. Abro la vista de profesionales.`,
      navigate: "/profesionales",
    };
  }

  // "abre la agenda" / "ve a pacientes"
  if (q.includes("abre") || q.includes("abrir") || q.includes("ve a") || q.includes("muestra") || q.includes("muestrame")) {
    if (q.includes("paciente")) return { text: "Abro los pacientes.", navigate: "/pacientes" };
    if (q.includes("profesional")) return { text: "Abro los profesionales.", navigate: "/profesionales" };
    return { text: "Abro la agenda.", navigate: "/agenda" };
  }

  // Greetings
  if (q.includes("hola") || q.includes("buenos dias") || q.includes("buenas")) {
    return { text: `Hola, soy ${ctx.assistantName}. ¿En qué te ayudo con la agenda?` };
  }

  if (q.includes("gracias")) {
    return { text: "A ti. Aquí sigo, di mi nombre cuando me necesites." };
  }

  return null;
}

const LEIRE_SCHEMA = {
  type: "object",
  properties: {
    text: { type: "string", description: "Respuesta breve en español de España." },
  },
  required: ["text"],
} as const;

/**
 * Interpret a user query. First tries fast local matching for agenda commands;
 * if unmatched, falls back to the agentic LLM with the agenda as context.
 */
export async function interpretQuery(
  query: string,
  ctx: LeireContext,
): Promise<LeireReply> {
  const local = localInterpret(query, ctx);
  if (local) return local;

  // LLM fallback for free-form questions.
  try {
    const agendaSummary = ctx.appointments
      .map(
        (a) =>
          `${timeLabel(a.start)} - ${a.patientName} (${a.treatment || "sin tratamiento"}) con ${a.professionalName} [${a.status}]`,
      )
      .join("\n");
    const proSummary = ctx.professionals
      .map((p) => `${p.name} - ${p.specialty || "general"}`)
      .join("\n");

    const result = await invokeLLM({
      message: query,
      schema: LEIRE_SCHEMA as unknown as Record<string, unknown>,
      systemPrompt:
        `Eres ${ctx.assistantName}, la asistente de voz de una clínica dental y estética. ` +
        `Respondes SIEMPRE en español de España, de forma natural, cálida y profesional, como una compañera de trabajo. ` +
        `Sé breve (1-3 frases). Si te preguntan por la agenda o los profesionales, usa estos datos:\n\n` +
        `AGENDA DE HOY:\n${agendaSummary || "(vacía)"}\n\nPROFESIONALES:\n${proSummary || "(ninguno)"}`,
    });

    const text =
      (result.response?.text as string | undefined) ??
      "Perdona, no he podido procesar esa consulta. ¿Puedes repetirla?";
    return { text };
  } catch {
    return {
      text: "Ahora mismo no puedo responder a esa consulta, pero sigo a tu disposición para gestionar la agenda.",
    };
  }
}
