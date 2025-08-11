import renderComponentTree from "./renderComponentTree";

type Route = {
  url: string;
  component: any;
};

export class Router {
  private routes?: Route[];
  appContainer: HTMLDivElement | null = null;

  constructor(appContainer: HTMLDivElement | null) {
    this.appContainer = appContainer;
    this.init();
    return this;
  }

  addRoutes(routes: Route[]) {
    this.routes = routes;
    return this;
  }

  init() {
    if (this.appContainer) {
      window.addEventListener("popstate", () => {
        this.navigate(window.location.pathname);
      });

      this.navigate(window.location.pathname);
    } else {
      console.error("App container not found");
    }
  }

  navigate(url: string): void {
    if (!this.routes) {
      console.error("No routes defined");
      return;
    }

    const route = this.routes.find((route) => route.url === url);
    if (route) {
      const appElement = document.querySelector<HTMLDivElement>("#app");
      if (appElement) {
        // appElement.innerHTML = "";
        try {
          const element = renderComponentTree(route.component());
          appElement.appendChild(element);
        } catch (error) {
          console.error("Error rendering Route:", error);
        }
      }
    } else {
      console.error(`Route not found for URL: ${url}`);
    }
  }

  goBack(): void {
    // window.history.back();
  }
}
