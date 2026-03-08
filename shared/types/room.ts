import { User } from "./user";
import { CanvasElement } from "./canvasElement";

export interface Room {
  id: string;
  name: string;
  users: User[];
  adminId: User["id"];
  canvasElements: CanvasElement[];
}
