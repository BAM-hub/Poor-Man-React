import { createElement } from "./createElement";
import type {
  MixedElemnt,
  PartialVTree,
  ResolvedVTree,
  StripFunction,
  VTreeType,
} from "./types";
import { zipLongest } from "./utils";

function createVTree(tree: VTreeType): PartialVTree {
  if (typeof tree === "function" && tree.name) {
    const res = evaluate(tree);
    return res;
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
        childObjects.push(createVTree(child));
      });
    }

    element.children = childObjects;

    return element;
  }
}

export function render(compoenents: VTreeType) {
  // console.log({ hookQueue });
  console.log(compoenents);
  let vtree: PartialVTree | null = createVTree(compoenents);

  document.addEventListener("stateChange", (event) => {
    const newVT = createVTree(compoenents);
    vtree = lazyUpdate(vtree!, newVT);
  });

  return vtree;
}

function evaluate<T>(param: T): StripFunction<T> {
  const res = typeof param === "function" ? param() : param;
  return res as StripFunction<T>;
}

function lazyUpdate(
  tree: ResolvedVTree,
  vtree: ResolvedVTree,
  parent: MixedElemnt = null
): PartialVTree | null {
  if (
    tree.tag !== vtree.tag ||
    JSON.stringify(tree.className) !==
      JSON.stringify(evaluate(vtree.className)) ||
    JSON.stringify(tree.innerText) !== JSON.stringify(evaluate(vtree.innerText))
  ) {
    console.log("diffed");

    if (!vtree.tag && tree.element) {
      tree.element.remove();
      return null;
    }

    // this changes the tree reference so the old element ref is lost
    const newSubtree = renderComponentTree(vtree as PartialVTree);
    console.log({ tree, newSubtree });
    if (tree.element && newSubtree) {
      // handle Node replacement
      const parent = tree.element.parentElement;
      const nextChildElem = tree.element.nextElementSibling;
      parent?.append(newSubtree);
      parent?.insertBefore(newSubtree, nextChildElem);
      tree.element.remove();
      return {
        ...vtree,
        element: newSubtree,
      } as PartialVTree;
    } else if (!tree.element) {
      parent?.appendChild(newSubtree!);
      return {
        ...vtree,
        element: newSubtree,
      } as PartialVTree;
    }
  }

  let children = [];

  for (const pair of zipLongest(tree.children, vtree.children, {})) {
    const newChild = lazyUpdate(
      pair.a as ResolvedVTree,
      pair.b as ResolvedVTree,
      tree.element
    );
    if (newChild) children.push(newChild);
  }

  return {
    ...tree,
    children,
  };
}

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

  const { element } = createElement(value.tag, {
    className: evaluate(value.className),
    innerText: evaluate(value.innerText),
    onClick: value.onClick,
    children,
  });

  tree.element = element;

  return element;
}
