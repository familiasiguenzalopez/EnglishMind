// Personalización del personaje 2D (look). Cosmético y local al dispositivo:
// se guarda en localStorage (no necesita migración ni sesión).
export type AvatarLook = {
  id: string;
  name: string;
  skin: string;
  hair: string;
  shirt: string;
};

export const LOOKS: AvatarLook[] = [
  { id: "calido", name: "Cálido", skin: "#e6ac82", hair: "#3b2a21", shirt: "#ff6b3d" },
  { id: "oliva", name: "Oliva", skin: "#cf9b6b", hair: "#211a15", shirt: "#27e0c4" },
  { id: "claro", name: "Claro", skin: "#f1c9a8", hair: "#7a5230", shirt: "#9b6bff" },
  { id: "profundo", name: "Profundo", skin: "#8a5638", hair: "#0e0b09", shirt: "#f5b544" },
];

export const DEFAULT_LOOK = LOOKS[0];

const LS = "em_avatar";

export function loadLook(): AvatarLook {
  try {
    const id = typeof window !== "undefined" ? localStorage.getItem(LS) : null;
    return LOOKS.find((l) => l.id === id) ?? DEFAULT_LOOK;
  } catch {
    return DEFAULT_LOOK;
  }
}

export function saveLook(id: string): void {
  try {
    localStorage.setItem(LS, id);
  } catch {
    /* sin storage */
  }
}
