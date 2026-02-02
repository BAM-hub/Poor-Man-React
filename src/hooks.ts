function useState<T>(
  initialValue: T
): [(updater?: () => void) => T, (value: T) => void] {
  let state = initialValue;
  let subscribers: Array<(value: T) => void> = [];
  const doHook = () => {
    const setState = (newState: T) => {
      state = newState;

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

  return doHook();
}

export const effectQueue: { doHook: () => void; dependencies: any[] }[] = [];

function useEffect(
  effect: () => void | (() => void),
  dependencies: any[] = []
): void {
  let didRun = false;
  function doHook() {
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

  effectQueue.push({ doHook, dependencies });

  if (!didRun) {
    doHook();
    didRun = true;
  }
}

export { useState, useEffect };
