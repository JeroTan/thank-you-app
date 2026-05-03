import {
  resolveKeyboardPanDelta,
  resolveWorldOffsetDeltaFromPixels,
  resolveWorldOffsetDeltaFromWheel,
  type MapPanInputMode,
  type MapPanInteractionState,
  type MapScaleSnapshot,
  type MapWorldOffset
} from "@/utils/map/scale";

type ScaleSource = () => Pick<MapScaleSnapshot, "scale">;
type WorldOffsetDeltaHandler = (delta: MapWorldOffset) => void;
type PanInteractionStateHandler = (state: Partial<MapPanInteractionState>) => void;

type PointerSession = {
  pointerId: number;
  inputMode: Extract<MapPanInputMode, "mouse" | "touch">;
  lastX: number;
  lastY: number;
};

export type PanInteractionController = {
  attach: () => void;
  detach: () => void;
};

type PanInteractionOptions = {
  element: HTMLElement;
  dragSensitivity: number;
  keyboardStep: number;
  preventDefaults: boolean;
  getScale: ScaleSource;
  onWorldOffsetDelta: WorldOffsetDeltaHandler;
  onInteractionStateChange: PanInteractionStateHandler;
};

function isKeyboardDirection(
  key: string
): key is "ArrowLeft" | "ArrowRight" | "ArrowUp" | "ArrowDown" {
  return key === "ArrowLeft" || key === "ArrowRight" || key === "ArrowUp" || key === "ArrowDown";
}

class BuiltPanInteractionController implements PanInteractionController {
  private attached = false;
  private animationFrameId = 0;
  private queuedPointerDelta: MapWorldOffset = { x: 0, y: 0 };
  private queuedWheelDelta: MapWorldOffset = { x: 0, y: 0 };
  private pointerSession: PointerSession | null = null;

  public constructor(private readonly options: PanInteractionOptions) {}

  public attach(): void {
    if (this.attached) {
      return;
    }

    this.attached = true;
    this.options.element.addEventListener("pointerdown", this.handlePointerDown);
    this.options.element.addEventListener("pointermove", this.handlePointerMove);
    this.options.element.addEventListener("pointerup", this.handlePointerEnd);
    this.options.element.addEventListener("pointercancel", this.handlePointerEnd);
    this.options.element.addEventListener("lostpointercapture", this.handlePointerCaptureLoss);
    this.options.element.addEventListener("wheel", this.handleWheel, { passive: false });
    this.options.element.addEventListener("keydown", this.handleKeyDown);
  }

  public detach(): void {
    if (!this.attached) {
      return;
    }

    this.attached = false;
    this.flushQueuedDeltas();
    this.options.element.removeEventListener("pointerdown", this.handlePointerDown);
    this.options.element.removeEventListener("pointermove", this.handlePointerMove);
    this.options.element.removeEventListener("pointerup", this.handlePointerEnd);
    this.options.element.removeEventListener("pointercancel", this.handlePointerEnd);
    this.options.element.removeEventListener("lostpointercapture", this.handlePointerCaptureLoss);
    this.options.element.removeEventListener("wheel", this.handleWheel);
    this.options.element.removeEventListener("keydown", this.handleKeyDown);

    if (this.pointerSession) {
      this.releaseCapturedPointer(this.pointerSession.pointerId);
    }

    this.pointerSession = null;
    this.options.onInteractionStateChange({
      isActive: false,
      inputMode: null,
      cursor: "grab"
    });
  }

  private readonly handlePointerDown = (event: PointerEvent) => {
    const inputMode = this.resolvePointerInputMode(event.pointerType);

    if (!inputMode || this.pointerSession || (inputMode === "mouse" && event.button !== 0)) {
      return;
    }

    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    this.focusSurface();
    this.pointerSession = {
      pointerId: event.pointerId,
      inputMode,
      lastX: event.clientX,
      lastY: event.clientY
    };
    this.capturePointer(event.pointerId);
    this.options.onInteractionStateChange({
      isActive: true,
      inputMode,
      cursor: "grabbing"
    });
  };

  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.pointerSession || event.pointerId !== this.pointerSession.pointerId) {
      return;
    }

    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    const deltaX = (event.clientX - this.pointerSession.lastX) * this.options.dragSensitivity;
    const deltaY = (event.clientY - this.pointerSession.lastY) * this.options.dragSensitivity;

    this.pointerSession.lastX = event.clientX;
    this.pointerSession.lastY = event.clientY;
    this.queuePointerDelta({ x: deltaX, y: deltaY });
  };

  private readonly handlePointerEnd = (event: PointerEvent) => {
    if (!this.pointerSession || event.pointerId !== this.pointerSession.pointerId) {
      return;
    }

    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    this.finishPointerSession(event.pointerId);
  };

  private readonly handlePointerCaptureLoss = (event: Event) => {
    const pointerEvent = event as PointerEvent;

    if (!this.pointerSession || pointerEvent.pointerId !== this.pointerSession.pointerId) {
      return;
    }

    this.finishPointerSession(pointerEvent.pointerId);
  };

  private readonly handleWheel = (event: WheelEvent) => {
    if (this.pointerSession || event.ctrlKey) {
      return;
    }

    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    this.focusSurface();
    this.queueWheelDelta({
      x: this.resolveWheelPixelDelta(event.deltaX, event.deltaMode),
      y: this.resolveWheelPixelDelta(event.deltaY, event.deltaMode)
    });
  };

  private readonly handleKeyDown = (event: KeyboardEvent) => {
    if (this.pointerSession || !isKeyboardDirection(event.key)) {
      return;
    }

    if (this.options.preventDefaults) {
      event.preventDefault();
    }

    const directionMap = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowUp: "up",
      ArrowDown: "down"
    } as const;

    this.options.onWorldOffsetDelta(
      resolveKeyboardPanDelta(
        directionMap[event.key],
        this.options.getScale(),
        this.options.keyboardStep
      )
    );
    this.options.onInteractionStateChange({
      isActive: false,
      inputMode: null,
      cursor: "grab"
    });
  };

  private finishPointerSession(pointerId: number): void {
    this.flushQueuedDeltas();

    this.releaseCapturedPointer(pointerId);

    this.pointerSession = null;
    this.options.onInteractionStateChange({
      isActive: false,
      inputMode: null,
      cursor: "grab"
    });
  }

  private focusSurface(): void {
    this.options.element.focus({ preventScroll: true });
  }

  private queuePointerDelta(delta: MapWorldOffset): void {
    this.queuedPointerDelta = {
      x: this.queuedPointerDelta.x + delta.x,
      y: this.queuedPointerDelta.y + delta.y
    };

    this.scheduleFlush();
  }

  private queueWheelDelta(delta: MapWorldOffset): void {
    this.queuedWheelDelta = {
      x: this.queuedWheelDelta.x + delta.x,
      y: this.queuedWheelDelta.y + delta.y
    };

    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.animationFrameId) {
      return;
    }

    this.animationFrameId = window.requestAnimationFrame(() => {
      this.animationFrameId = 0;
      this.flushQueuedDeltas();
    });
  }

  private flushQueuedDeltas(): void {
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = 0;
    }

    if (this.queuedPointerDelta.x !== 0 || this.queuedPointerDelta.y !== 0) {
      this.options.onWorldOffsetDelta(
        resolveWorldOffsetDeltaFromPixels(this.queuedPointerDelta, this.options.getScale())
      );
      this.queuedPointerDelta = { x: 0, y: 0 };
    }

    if (this.queuedWheelDelta.x !== 0 || this.queuedWheelDelta.y !== 0) {
      this.options.onWorldOffsetDelta(
        resolveWorldOffsetDeltaFromWheel(this.queuedWheelDelta, this.options.getScale())
      );
      this.queuedWheelDelta = { x: 0, y: 0 };
    }
  }

  private resolvePointerInputMode(
    pointerType: string
  ): Extract<MapPanInputMode, "mouse" | "touch"> | null {
    if (pointerType === "mouse") {
      return "mouse";
    }

    if (pointerType === "touch" || pointerType === "pen") {
      return "touch";
    }

    return null;
  }

  private resolveWheelPixelDelta(delta: number, deltaMode: number): number {
    if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
      return delta * 16;
    }

    if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
      return delta * this.options.element.clientHeight;
    }

    return delta;
  }

  private capturePointer(pointerId: number): void {
    try {
      this.options.element.setPointerCapture(pointerId);
    } catch {
      return;
    }
  }

  private releaseCapturedPointer(pointerId: number): void {
    try {
      if (this.options.element.hasPointerCapture(pointerId)) {
        this.options.element.releasePointerCapture(pointerId);
      }
    } catch {
      return;
    }
  }
}

export class PanInteractionBuilder {
  private dragSensitivity = 1;
  private element: HTMLElement | null = null;
  private getScale: ScaleSource = () => ({ scale: 1 });
  private keyboardStep = 48;
  private onInteractionStateChange: PanInteractionStateHandler = () => undefined;
  private onWorldOffsetDelta: WorldOffsetDeltaHandler = () => undefined;
  private preventDefaults = true;

  public attachElement(element: HTMLElement): this {
    this.element = element;

    return this;
  }

  public withDragSensitivity(dragSensitivity: number): this {
    if (Number.isFinite(dragSensitivity) && dragSensitivity > 0) {
      this.dragSensitivity = dragSensitivity;
    }

    return this;
  }

  public withKeyboardStep(keyboardStep: number): this {
    if (Number.isFinite(keyboardStep) && keyboardStep > 0) {
      this.keyboardStep = keyboardStep;
    }

    return this;
  }

  public withPreventDefaults(preventDefaults: boolean): this {
    this.preventDefaults = preventDefaults;

    return this;
  }

  public withScaleSource(getScale: ScaleSource): this {
    this.getScale = getScale;

    return this;
  }

  public withInteractionState(handler: PanInteractionStateHandler): this {
    this.onInteractionStateChange = handler;

    return this;
  }

  public withWorldOffsetDelta(handler: WorldOffsetDeltaHandler): this {
    this.onWorldOffsetDelta = handler;

    return this;
  }

  public build(): PanInteractionController {
    if (!this.element) {
      throw new Error("PanInteractionBuilder requires an element before build().");
    }

    return new BuiltPanInteractionController({
      element: this.element,
      dragSensitivity: this.dragSensitivity,
      keyboardStep: this.keyboardStep,
      preventDefaults: this.preventDefaults,
      getScale: this.getScale,
      onWorldOffsetDelta: this.onWorldOffsetDelta,
      onInteractionStateChange: this.onInteractionStateChange
    });
  }
}
