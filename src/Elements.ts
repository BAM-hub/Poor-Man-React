import { appRouter } from "./main";

export function createLink({
  href,
  label,
}: {
  href?: string;
  label: string;
}): HTMLAnchorElement {
  const LinkElement = document.createElement("a");
  LinkElement.innerText = label;
  LinkElement.addEventListener("click", (event) => {
    event.preventDefault();
    if (href) {
      window.history.pushState({}, "", href);
      appRouter.navigate(href);
    }
  });
  return LinkElement;
}
