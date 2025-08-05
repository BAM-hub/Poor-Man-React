import { HomePage } from "./Home";
import { Router } from "./router";
import "./style.css";

export const appContainer = document.querySelector<HTMLDivElement>("#app");

const router = new Router(appContainer);

router.addRoutes([
  {
    url: "/",
    component: () => {
      HomePage();
    },
  },
  {
    url: "/about",
    component: () => {
      const element = document.createElement("div");
      element.innerHTML = "<h1>About Page</h1>";
      return element;
    },
  },
]);

router.init();

export { router as appRouter };
