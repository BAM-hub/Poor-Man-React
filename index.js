function Welcome(props) {
  return React.createElement("h1", null, "Hello,", props.name);
}

const element = React.createElement("div", {
  className: "container",
  children: [
    React.createElement(Welcome, { name: "Sara" }),
    React.createElement("p", null, "Welcome to JSX!"),
  ],
});
