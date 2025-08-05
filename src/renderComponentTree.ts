import { createElement } from "./createElement";
import { appContainer } from "./main";
import type { CreateElementProps } from "./types";

type TreeNode =
  | {
      tag: string;
      innerText?: string | (() => any);
      onClick?: (e: Event) => void;
      children: TreeNode[];
      className: string | (() => string) | undefined;
    }
  | (() => TreeNode);

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

type ComponentTree = TreeNode;

const generateHash = (value: string) => {
  let hash = 0;
  for (const char of value) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0; // Constrain to 32bit integer
  }
  return hash;
};

export class Node {
  id: number;
  tag: string;
  data: CreateElementProps;
  element?: HTMLElement | Text;
  // children: Node[] = [];
  constructor(data: CreateElementProps, tag: string) {
    this.data = data;
    // this.parent = parent;
    this.id = generateHash(JSON.stringify(data));
    this.tag = tag;
    this.data = {
      ...this.data,
      className:
        typeof this.data.className === "function"
          ? this.data.className()
          : this.data.className,
    };
  }

  addElement(element: HTMLElement | Text) {
    this.element = element;
  }
}

function createVTree(tree: ComponentTree): PartialVTree {
  const treeObject = evaluate<ComponentTree>(tree);
  let childObjects: PartialVTree["children"] = [];

  if (treeObject.children!.length) {
    childObjects = treeObject.children!.map((child) => {
      return createVTree(child);
    });
  }

  console.log(treeObject.innerText, evaluate(treeObject.innerText));

  return {
    tag: treeObject.tag,
    className: evaluate(treeObject.className),
    children: childObjects,
    innerText: evaluate(treeObject.innerText),
    onClick: treeObject.onClick,
  };
}

export function render(compoenents: ComponentTree) {
  const root = appContainer;
  let vtree = createVTree(compoenents);
  const element = renderComponentTree(vtree);
  if (element instanceof HTMLElement) root?.appendChild(element);

  document.addEventListener("stateChange", (event) => {
    // const { element, vt } = renderComponentTree(compoenents);
    const newVT = createVTree(compoenents);
    console.log({ vtree, newVT });
    vtree = lazyUpdate(vtree, newVT);
  });
}

function evaluate<T>(param: T): StripFunction<T> {
  const res = typeof param === "function" ? param() : param;
  return res as StripFunction<T>;
}

function lazyUpdate(tree: ResolvedVTree, vtree: ResolvedVTree): ResolvedVTree {
  if (
    tree.tag !== vtree.tag ||
    JSON.stringify(tree.className) !==
      JSON.stringify(evaluate(vtree.className)) ||
    JSON.stringify(tree.innerText) !== JSON.stringify(evaluate(vtree.innerText))
  ) {
    console.log("diffed");
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
    }
  }

  const children = vtree.children.map((child, index) => {
    const original = tree.children?.[index] ? tree.children[index] : null;
    if (!original) return child;
    return lazyUpdate(evaluate(original), child);
  });

  return {
    ...tree,
    children,
  };
}

type MixedElemnt = HTMLElement | Text | null;

export default function renderComponentTree(tree: PartialVTree): MixedElemnt {
  const value = evaluate(tree);
  let children: MixedElemnt[] = [];

  if (value.children.length) {
    children = value.children!.map((child) => {
      return renderComponentTree(child);
    });
  }

  const { element } = createElement(value.tag, {
    className: evaluate(value.className),
    innerText: evaluate(value.innerText),
    onClick: value.onClick,
    children,
  });

  tree.element = element;

  return element;
}
