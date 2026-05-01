type InternalNodeHookType = { type: string; value: any };

class VNode {
  isRoot: boolean = false;
  hooks: InternalNodeHookType[] = [];
  type: any;
  constructor(isRoot: boolean) {
    this.isRoot = isRoot;
  }
  addHook(hook: InternalNodeHookType) {
    this.hooks.push(hook);
  }
}

type DispatchUnion =
  | "RENDER_ROOT"
  | "REGISTER_STATE"
  | "UPDATE_STATE"
  | undefined;

let root = new VNode(true);

class Dispatcher {
  events = [];
  type: DispatchUnion;
  subscribers: { nodeName: string; render: () => void }[] = [];
  isRoot = false;
  constructor() {}

  sub(nodeName: string, render: () => void) {
    this.subscribers.push({ nodeName, render });
  }

  dispatch(type: DispatchUnion, payload: any) {
    console.log("dispatching stuff", type, payload);
    if (this.isRoot) {
      root.addHook(payload);
    }
    console.log(root);
    if (type === "RENDER_ROOT") {
      this.isRoot = true;
    }
    this.subscribers.forEach((value) => {});
  }
}

const dispatcher = new Dispatcher();

export class BAMDomHydrationRoot {
  rootContainer: HTMLElement;
  fiberNode: VNode = root;

  constructor(rootElement: HTMLElement) {
    if (!rootElement) {
      throw new Error("Root element not found");
    }
    this.rootContainer = rootElement;
  }

  render(component: any) {
    if (!component) {
      throw new Error("Component is required");
    }

    this.fiberNode.type = component;

    dispatcher.dispatch("RENDER_ROOT", null);

    const html = component();

    this.rootContainer.appendChild(html);
  }

  rerender() {
    // todo later
    // this.root();
  }
}

export function createElement(args: any) {
  const { type, props, children } = args;

  if (typeof args === "string") {
    const element = document.createTextNode(args);
    return element;
  }

  const element = document.createElement(type) as HTMLElement;

  if (props) {
    // todo this thing
    Object.keys(props)?.forEach((key) => {
      if (key === "className") {
        const value = props[key];
        element.classList.add(value);
      } else {
        const value = props[key];
        element.setAttribute(key, value);
      }
    });
  }

  if (children && children.length > 0 && children instanceof Array) {
    children.forEach((child) => {
      if (typeof child === "function") {
        const childElement = child();
        element.appendChild(childElement);
      } else if (child) {
        element.append(child);
      }
    });
  }

  return element;
}

export function useState<T>(initialSate: T) {
  let init = initialSate || undefined;
  dispatcher.dispatch("REGISTER_STATE", {
    hookName: "state",
    value: initialSate,
  });

  return [initialSate, () => {}];
}
