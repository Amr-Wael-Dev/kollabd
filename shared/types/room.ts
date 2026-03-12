import type { User } from "./user";
import type { CanvasElement } from "./canvasElement";

export interface Room {
  id: string;
  name: string;
  users: User[];
  adminId: User["id"];
  canvasElements: CanvasElement[];
}
