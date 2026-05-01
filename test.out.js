import { createElement, useState } from "./lib/index.ts";

const test = (props) => {
  console.log("custom code in my ext", ",,ds");
  const [number, setNumber] = useState(0);
  return createElement({
    type: "div",
    props: { "aria-label": "test2", "data-data": "test2" },
    children: [
      " bashar ",
      createElement({
        type: "h2",
        props: {},
        children: ["this is not the page header "],
      }),
      createElement({
        type: "div",
        props: { className: "outer-class" },
        children: [
          createElement({
            type: "div",
            props: { className: "inner-class" },
            children: [
              createElement({
                type: "div",
                props: { className: "some" },
                children: [
                  createElement({
                    type: "p",
                    props: { className: "para" },
                    children: [
                      " hello ",
                      createElement({
                        type: "span",
                        props: {},
                        children: ["world"],
                      }),
                      createElement({
                        type: "span",
                        props: {},
                        children: ["hello"],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      createElement({ type: "p", props: {}, children: [] }),
      createElement({ type: "div", props: {}, children: ["wowwwww"] }),
      createElement({
        type: "section",
        props: {},
        children: [
          " Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci facere doloribus excepturi magnam error ducimus, at ipsum eum amet eius, totam blanditiis optio voluptas beatae temporibus accusamus illum dolorum natus. ",
        ],
      }),
    ],
  });
};

export default test;
