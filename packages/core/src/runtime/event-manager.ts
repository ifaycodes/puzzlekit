
import type { PuzzleEvent } from "../types";

type EventListener = (event: PuzzleEvent) => void;

export class EventManager {
  private listeners = new Map<string, Set<EventListener>>();
  private globalListeners = new Set<EventListener>();

  subscribe(
    listener: EventListener,
    instanceId?: string
  ): () => void {
    if (!instanceId) {
      this.globalListeners.add(listener);

      return () => {
        this.globalListeners.delete(listener);
      };
    }

    if (!this.listeners.has(instanceId)) {
      this.listeners.set(instanceId, new Set());
    }

    const instanceListeners = this.listeners.get(instanceId)!;

    instanceListeners.add(listener);

    return () => {
      instanceListeners.delete(listener);

      if (instanceListeners.size === 0) {
        this.listeners.delete(instanceId);
      }
    };
  }

  emit(event: PuzzleEvent): void {
    const instanceListeners = this.listeners.get(event.instanceId);

    instanceListeners?.forEach((listener) => {
      listener(event);
    });

    this.globalListeners.forEach((listener) => {
      listener(event);
    });
  }

  clear(instanceId: string): void {
    this.listeners.delete(instanceId);
  }

  clearAll(): void {
    this.listeners.clear();
    this.globalListeners.clear();
  }
}
