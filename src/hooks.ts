const stateMap = new WeakMap();
const hooks = [];

// type InProgress = {
//   current: number;
//   queue: Array<() => void>;
// };

function useState<T>(
  initialValue: T
): [(updater?: () => void) => T, (value: T) => void] {
  let state = initialValue;
  let subscribers: Array<(value: T) => void> = [];

  const startEvent = new CustomEvent("hookStart", {
    detail: {
      initialValue,
      state,
    },
  });

  document.dispatchEvent(startEvent);

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

    return initialValue;
  }

  document.addEventListener(
    "hookAssign",
    (event: CustomEvent) => {
      const { hookIndex, value } = event.detail;

      if (hookIndex < hooks.length) {
        hooks[hookIndex] = value;
      } else {
        hooks.push(value);
      }

      stateMap.set(hooks, state);
    },
    {
      once: true,
    }
  );

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
