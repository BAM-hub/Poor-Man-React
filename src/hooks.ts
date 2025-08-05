const stateMap = new WeakMap();

function useState<T>(
  initialValue: T
): [(updater?: () => void) => T, (value: T) => void] {
  let state = initialValue;
  let subscribers: Array<(value: T) => void> = [];

  const setState = (newState: T) => {
    console.log("Setting new state:", newState);
    state = newState;

    // subscribers.forEach((subscriber) => {
    // subscriber(newState);
    // });
    console.log("orgg", state);

    const event = new Event("stateChange");
    document.dispatchEvent(event);
  };

  function bind(updater: any) {
    if (!updater) {
      console.log("should return ", state);
      return state;
    }

    subscribers.push(updater);

    return initialValue;
  }

  return [bind, setState];
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
