import { useEffect, useState } from "./hooks";
import { render } from "./renderComponentTree";

export const HomePage = () => {
  const [todos, setTodos] = useState<{ title: string; completed: boolean }[]>([
    {
      title: "Learn PMF",
      completed: false,
    },
    {
      title: "Learn PMF",
      completed: false,
    },
  ]);

  const [active, setActive] = useState(false);
  const [counter, setCounter] = useState(0);

  return render({
    tag: "div",
    className: "home-page",
    children: [
      // Counter,
      {
        tag: "button",
        onClick: () => setCounter(counter() + 1),
        children: [
          {
            tag: "text",
            innerText: counter,
            children: [],
          },
          {
            tag: "span",
            children: [
              {
                tag: "text",
                innerText: " Increment Counter",
                children: [],
              },
            ],
          },
        ],
      },
      {
        className: () => (active() ? "active" : ""),
        tag: "button",
        onClick: () => {
          setActive(!active());
        },
        children: [
          {
            tag: "text",
            innerText: "toggle",
            children: [],
          },
        ],
      },
      // {
      //   tag: "button",
      //   // innerText: counter,
      //   onClick: () => {
      //     setTodos([
      //       ...todos(),
      //       {
      //         completed: false,
      //         title: "some title",
      //       },
      //     ]);
      //     console.log(todos());
      //   },
      //   children: [
      //     {
      //       tag: "text",
      //       innerText: "add todo",
      //       children: [],
      //     },
      //   ],
      // },
      // ListRenderer({
      //   data: todos,
      //   renderItem: (todo, index) => ({
      //     key: index,
      //     tag: "div",
      //     children: [
      //       {
      //         tag: "span",
      //         children: [
      //           {
      //             tag: "text",
      //             innerText: todo.title,
      //             children: [],
      //           },
      //         ],
      //       },
      //       {
      //         tag: "span",
      //         children: [
      //           {
      //             tag: "text",
      //             innerText: todo.completed ? "Completed" : "Not Completed",
      //             children: [],
      //           },
      //         ],
      //       },
      //     ],
      //   }),
      // }),
    ],
  });
};

export const Counter = () => {
  const [counter, setCounter] = useState(0);
  // useEffect(() => {
  //   console.log("effect", counter());
  //   return () => {
  //     console.log("cleanup effect");
  //   };
  // }, [counter]);

  return {
    tag: "button",
    onClick: () => setCounter(counter() + 1),
    children: [
      {
        tag: "text",
        innerText: counter,
        children: [],
      },
      {
        tag: "span",
        children: [
          {
            tag: "text",
            innerText: " Increment Counter",
            children: [],
          },
        ],
      },
    ],
  };
};

function ListRenderer({
  data,
  renderItem,
}: {
  data: any[];
  renderItem: (item: any) => HTMLElement;
}) {
  return () => {
    return {
      tag: "Fragment",
      children: data().map((item, key) => {
        const element = renderItem(item, key);
        return element;
      }),
    };
  };
}
