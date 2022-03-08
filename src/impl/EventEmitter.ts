export class EventEmitter {
  listeners: Map<string, Set<Listener>> = new Map();
  removeAllListeners(): void {
    this.listeners.clear();
  }
  removeListener(channel: string, listener: Listener): void {
    this.listeners.get(channel)?.delete(listener);
  }
  on(channel: string, listener: Listener) {
    const ls = this.listeners.get(channel);
    if (!ls) {
      this.listeners.set(channel, new Set([listener]));
    } else {
      ls.add(listener);
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  emit(channel: string, ...args: any[]) {
    const ls = this.listeners.get(channel);
    if (!ls) {
      return;
    } else {
      for (const f of ls.keys()) {
        try {
          f(...args);
        } catch {}
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Listener = (...args: any[]) => unknown;
