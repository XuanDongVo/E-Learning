/**
 * Backwards-compatible Pipo entry point.
 * Visuals/controllers live in student-ui/visuals/pipo; existing feature imports stay valid.
 */
export { Pipo } from "@/components/student-ui/visuals/pipo/pipo";
export { PipoProvider, usePipo } from "@/components/student-ui/visuals/pipo/pipo-provider";
export { PIPO_LINES } from "@/components/student-ui/visuals/pipo/pipo.types";
export type { PipoMood, MascotColor, PipoStage, PipoProp } from "@/components/student-ui/visuals/pipo/pipo.types";
