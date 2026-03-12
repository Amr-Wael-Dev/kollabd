export interface Point {
  x: number;
  y: number;
  pressure?: number;
  timestamp?: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ellipse {
  centerX: number;
  centerY: number;
  radiusX: number;
  radiusY: number;
  rotation: number;
}

export interface Line {
  start: Point;
  end: Point;
}

export interface Arrow {
  tipSize: number;
  start: Point;
  end: Point;
}

interface ShapeGeometryMap {
  rectangle: Rect;
  ellipse: Ellipse;
  line: Line;
  arrow: Arrow;
}

interface BaseElement {
  id: string;
  color: string;
  opacity: number;
}

interface ShapeElement<
  ShapeType extends keyof ShapeGeometryMap = keyof ShapeGeometryMap,
> extends BaseElement {
  type: "shape";
  shapeType: ShapeType;
  geometry: ShapeGeometryMap[ShapeType];
  strokeStyle: string;
  strokeWidth: number;
}

export interface DrawingElement extends BaseElement {
  type: "drawing";
  points: Point[];
}

interface TextElement extends BaseElement {
  type: "text";
  position: { x: number; y: number };
  value: string;
  fontSize: number;
  alignment: "left" | "center" | "right";
}

export type CanvasElement = ShapeElement | DrawingElement | TextElement;
