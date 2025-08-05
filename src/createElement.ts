// function dispatcher() {}

import type { CreateElementProps } from "./types";

export function createElement(tag: string, props: CreateElementProps) {
  if (tag === "text") {
    const textNode = document.createTextNode(
      typeof props.innerText === "function"
        ? props.innerText((newValue: any) => {
            console.log("Updating text node with new value:", newValue);
            textNode.nodeValue = newValue.toString();
          })
        : props.innerText
    );

    return {
      element: textNode,
      remove: () => textNode.remove(),
      children: [],
    };
  }

  if (tag === "Fragment") {
    return {
      element: null,
      remove: () => {
        props.children.forEach((child) => {
          child.remove();
        });
      },
      children: props.children,
    };
  }

  const element = document.createElement(tag);
  if (props.className) {
    if (typeof props.className === "function") {
      console.log(
        "isFunction resultinng classnaem",
        props.className(),
        "should exec"
      );
      element.className = props.className();
    } else {
      element.className = props.className;
    }
  }

  if (props.onClick) {
    element.addEventListener("click", (e) => {
      props.onClick(e);
    });
  }

  // add children here
  if (props.children && Array.isArray(props.children)) {
    if (element instanceof HTMLElement) {
      console.log(props.children);
      element.append(...props.children);
      // props.children.forEach((child) => {
      //   if (!child) {
      //     element
      //       .append
      //       // ...child.subTree.children?.map((child) => child.element)
      //       ();
      //   } else {
      //     element.append(child);
      //   }
      // });
    }
  }

  function remove() {
    element.remove();
  }

  return { element, remove };
}
