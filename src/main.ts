// import { HomePage } from "./Home";
// import { Router } from "./router";
import { BAMDomHydrationRoot } from "./lib";
import "./style.css";
import test from "./test.bsx";
// test();

export const appContainer = document.querySelector<HTMLDivElement>("#app");
//  the old impl

// const router = new Router(appContainer);

// router.addRoutes([
//   {
//     url: "/",
//     component: () => {
//       return HomePage();
//     },
//   },
//   {
//     url: "/about",
//     component: () => {
//       const element = document.createElement("div");
//       element.innerHTML = "<h1>About Page</h1>";
//       return element;
//     },
//   },
// ]);

// router.init();
// end of the old impl
// export { router as appRouter };

const createRoot = new BAMDomHydrationRoot(appContainer!);

createRoot.render(test);
