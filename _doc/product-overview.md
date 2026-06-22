# Producto: Sistema Leire
> Nombre de trabajo — confirmar nombre comercial definitivo con el equipo.

## Qué es este producto

**Sistema Leire** es una suite integral de gestión clínica para clínicas dentales, clínicas estéticas y centros estéticos, incluyendo redes de policlínicas (multisede). Su diferenciador central es **Leire**, una asistente de voz activada por palabra clave que opera silenciosamente en segundo plano desde el inicio de sesión, permitiendo a todo el personal clínico gestionar citas, pacientes, informes y cualquier función del sistema con las manos libres, sin interrumpir procedimientos.

## Usuarios objetivo

| Perfil | Contexto de uso principal |
|--------|--------------------------|
| Dentistas / Especialistas estéticos | Agenda y pacientes por voz durante consulta |
| Recepcionistas | Citas, registro de pacientes, cobros — voz o teclado |
| Auxiliares / Asistentes clínicos | Acceso rápido a información por voz |
| Administradores | Usuarios, informes, inventario, personal |
| Directores / Gerentes de red | Vista multisede, KPIs, comparativa entre clínicas |

## Diferenciador principal: Leire, asistente de voz

Al iniciar sesión con los permisos adecuados, el micrófono se activa silenciosamente en segundo plano. Cuando el usuario pronuncia la palabra clave **"Leire"** seguida de cualquier consulta, el sistema:

1. Detecta la palabra clave al instante
2. Transcribe el habla del usuario en texto en tiempo real
3. Responde con voz femenina natural, humanizada y en perfecto español de España, en cuanto el usuario termina de hablar

### Modelos de voz disponibles

| Género | Idioma | Observación |
|--------|--------|-------------|
| Femenino | Español (España) | **Leire** — predeterminado del sistema |
| Femenino | Inglés | Modelo alternativo femenino |
| Masculino | Español | Modelo masculino en español |
| Masculino | Inglés | Modelo masculino en inglés |

- **Idiomas nativos del sistema:** Español (España) e Inglés
- Cada idioma tiene su voz Leire correspondiente en su respectivo idioma
- El modelo predeterminado global es Leire en español de España

## Arquitectura de despliegue

| Modo | Descripción |
|------|-------------|
| **Local** | Instalación standalone en un único equipo |
| **Red local (LAN)** | Servidor + puestos cliente en la misma red interna |
| **Internet / Remoto** | Acceso desde cualquier lugar; la aplicación móvil se conecta a la base de datos del servidor |

La aplicación móvil es un cliente companion que conecta de forma segura a la base de datos del servidor desde cualquier ubicación con acceso a internet.

## Hardware de audio Bluetooth y WiFi

- Compatible con **altavoz + micrófono Bluetooth** situado en otra habitación, conectado al ordenador host vía Bluetooth
- El dispositivo de audio Bluetooth puede conectarse también vía **WiFi**, permitiendo la interacción con Leire desde cualquier lugar de la clínica sin cableado — Leire puede escuchar y responder desde cualquier sala
- La activación y respuesta de voz es completamente transparente para el usuario: silenciosa, instantánea y continua

## Gestión de usuarios y privilegios

- Control de acceso basado en roles: filtrado por tipo de usuario y niveles de privilegio granulares
- Roles mínimos incluidos: Administrador, Dentista/Especialista, Recepcionista, Auxiliar, Director/Gestor
- En modo policlínica: acceso acotado por sede y visibilidad de datos entre sucursales configurable

## Módulos principales

1. **Agenda Interactiva** — módulo central; gestión de citas y horarios completamente por voz o texto
2. **Historia Clínica de Pacientes** — historial completo, tratamientos, archivos multimedia, notas
3. **Catálogo de Tratamientos y Procedimientos** — vinculado a agenda y facturación
4. **Facturación y Cobros** — tarifas, presupuestos, pagos, remesas
5. **Inventario y Stock** — materiales y consumibles de la clínica
6. **Gestión de Personal** — horarios, roles, comisiones
7. **Gestión Multisede (Policlínica)** — vistas por clínica y a nivel de red
8. **Motor de Informes y Analítica** — universal: cualquier módulo, cualquier combinación de datos

## Motor de informes universal

El motor de informes es universal — cualquier tabla de la base de datos es accesible y los informes pueden cruzar cualquier frontera de módulo. Funcionalidades clave:

- Plantillas de informes predefinidas para KPIs clínicos habituales
- Constructor de informes personalizados: campos de cualquier módulo(s), filtros, agrupaciones por cualquier dimensión
- Formatos de salida: tabla en pantalla, lista imprimible, gráficos visuales (barras, líneas, circular, área)
- Exportación y programación de informes

## Posicionamiento de marca y tono

- **Idioma principal:** Español (España); segundo idioma nativo: Inglés
- **Tono:** Profesional, clínico-moderno, cercano — "Leire" como colega de trabajo virtual
- **Identidad de voz:** "Leire" es el punto de contacto diario principal; el nombre es la marca del producto
- El sistema suena como un compañero de trabajo, no como un robot; la TTS naturalizada es un requisito no negociable

## Principios estratégicos

1. **Voz primero, teclado siempre disponible** — toda operación es alcanzable por voz; ninguna función es exclusiva de voz
2. **Despliegue flexible** — desde una consulta individual hasta una policlínica multisede, un único sistema
3. **Informes universales** — sin silos de datos; cualquier módulo integra con cualquier otro
4. **Seguridad por rol** — sistema de privilegios granular que previene fugas de datos entre usuarios y sedes
5. **Voz de grado humano** — Leire suena natural y humanizada; la calidad de voz es innegociable
6. **Alcance total** — local, red, internet y móvil desde una sola instalación, incluyendo audio Bluetooth WiFi
