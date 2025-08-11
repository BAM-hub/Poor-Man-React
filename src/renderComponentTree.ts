import { nanoid } from "nanoid";
import { createElement } from "./createElement";
import { hookQueue } from "./hooks";
import { appContainer } from "./main";

type VTreeType =
  | {
      element?: HTMLElement | Text | null;
      tag: string;
      className: string | (() => string) | undefined;
      children: VTreeType[];
      innerText?: string | (() => any);
      onClick?: (e: Event) => void;
    }
  | (() => VTreeType);

type StripFunction<T> = T extends (...args: any) => any ? never : T;

type ResolvedVTree = StripFunction<VTreeType>;

type PartialVTree = Omit<StripFunction<VTreeType>, "children"> & {
  children: PartialVTree[];
};

const hooks = [];

document.addEventListener(
  "hookStart",
  (event) => {
    const { initialValue, state, bind } = event.detail;
    hooks.push(bind);
  }
  // {
  //   once: true,
  // }
);

const generateHash = (value: string) => {
  let hash = 0;
  for (const char of value) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash;
};

const execQueue = [];

function createVTree(tree: VTreeType, parent: VTreeType): PartialVTree {
  if (typeof tree === "function" && tree.name) {
    const id = nanoid();
    let placeholder = {
      className: "",
      tag: "div",
      children: [],
      id: `placeholder-${id}`,
      builder: tree,
    };

    execQueue.push(placeholder);
    return placeholder;
  } else {
    const treeObject = evaluate(tree);

    let childObjects: PartialVTree["children"] = [];

    const element = {
      tag: treeObject.tag,
      className: evaluate(treeObject.className),
      children: childObjects,
      innerText: evaluate(treeObject.innerText),
      onClick: treeObject.onClick,
    };

    if (treeObject.children!.length) {
      treeObject.children!.forEach((child) => {
        childObjects.push(createVTree(child, element));
      });
    }

    element.children = childObjects;

    return element;
  }
}

function runQueue() {
  if (execQueue.length) {
    const execItem = execQueue.shift();
  }
}

export function render(compoenents: VTreeType) {
  console.log({ hookQueue });
  console.log(compoenents);
  let vtree = createVTree(compoenents);
  console.log({ execQueue });
  execQueue.forEach((item) => {
    execQueue.shift();
    // console.log("executing", item.builder.name
    const newVTree = item.builder();
    item.placeholder = newVTree;
  });
  console.log(vtree);
  document.addEventListener("stateChange", (event) => {
    const newVT = createVTree(compoenents);
    console.log({ vtree, newVT });
    vtree = lazyUpdate(vtree, newVT);
  });

  return vtree;
}

function evaluate<T>(param: T): StripFunction<T> {
  const res = typeof param === "function" ? param() : param;
  return res as StripFunction<T>;
}

function shalowCompare(obj1: any, obj2: any) {
  if (Object.keys(obj1).length === Object.keys(obj2).length) return false;

  return Object.keys(obj1).every(
    (key) => ["children", "element"].includes(key) || obj1[key] === obj2[key]
  );
}

function* zipLongest(a, b, fill = null) {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    yield { a: a[i] ?? fill, b: b[i] ?? fill };
  }
}

function lazyUpdate(
  tree: ResolvedVTree,
  vtree: ResolvedVTree,
  parent: MixedElemnt
): ResolvedVTree {
  if (
    tree.tag !== vtree.tag ||
    JSON.stringify(tree.className) !==
      JSON.stringify(evaluate(vtree.className)) ||
    JSON.stringify(tree.innerText) !== JSON.stringify(evaluate(vtree.innerText))
  ) {
    console.log("diffed");

    if (!vtree.tag) {
      tree.element.remove();
      return null;
    }

    // this changes the tree reference so the old element ref is lost
    const newSubtree = renderComponentTree(vtree);
    if (tree.element && newSubtree) {
      // handle Node replacement
      const parent = tree.element.parentElement;
      const nextChildElem = tree.element.nextElementSibling;
      const prevChildElem = tree.element.previousElementSibling;
      parent?.append(newSubtree);
      parent?.insertBefore(newSubtree, nextChildElem);
      tree.element.remove();
      return {
        ...vtree,
        element: newSubtree,
      };
    } else if (!tree.element) {
      parent?.appendChild(newSubtree);
      return {
        ...vtree,
        element: newSubtree,
      };
    }
  }

  let children = [];

  for (const pair of zipLongest(tree.children, vtree.children, {})) {
    const newChild = lazyUpdate(pair.a, pair.b, tree.element);
    if (newChild) children.push(newChild);
  }

  return {
    ...tree,
    children,
  };
}

type MixedElemnt = HTMLElement | Text | null;

export default function renderComponentTree(tree: PartialVTree): MixedElemnt {
  if (typeof tree === "function") {
    console.log("excuting a function");
  }

  const value = evaluate(tree);
  let children: MixedElemnt[] = [];

  if (value.children.length) {
    children = value.children!.map((child) => {
      return renderComponentTree(child);
    });
  }

  // if(value.tag === 'Fragment') return children
  const { element } = createElement(value.tag, {
    className: evaluate(value.className),
    innerText: evaluate(value.innerText),
    onClick: value.onClick,
    children,
  });

  tree.element = element;

  return element;
}
