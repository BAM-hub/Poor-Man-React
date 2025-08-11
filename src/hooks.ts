const stateMap = new WeakMap();

class HOOK_QUEUE {
  queue = [];
  clear() {
    this.queue = [];
  }
  push(fn: () => void) {
    this.queue.push(fn);
  }
}

export const hookQueue = new HOOK_QUEUE();

// type InProgress = {
//   current: number;
//   queue: Array<() => void>;
// };

function useState<T>(
  initialValue: T
): [(updater?: () => void) => T, (value: T) => void] {
  let state = initialValue;
  let subscribers: Array<(value: T) => void> = [];
  const doHook = () => {
    const setState = (newState: T) => {
      state = newState;

      // subscribers.forEach((subscriber) => {
      // subscriber(newState);
      // });
      const event = new Event("stateChange");
      document.dispatchEvent(event);
    };

    function bind(updater: any) {
      if (!updater) {
        return state;
      }

      subscribers.push(updater);

      return state;
    }
    return [bind, setState];
  };

  hookQueue.push(doHook);

  return doHook();
}

function useEffect(
  effect: () => void | (() => void),
  dependencies: any[] = []
): void {
  dependencies.forEach((dep) => {
    dep(() => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
      effect();
    });
  });
  const cleanup = effect();

  if (cleanup && typeof cleanup === "function") {
    cleanup();
  }
}

export { useState, useEffect };
