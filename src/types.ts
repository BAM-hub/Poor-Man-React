export type MixedElemnt = HTMLElement | Text | null;

export type CreateElementProps = {
  className?: string;
  innerText?: string;
  children?: MixedElemnt[];
  onClick?: (e: Event) => void;
};

export type VTreeType =
  | {
      element?: HTMLElement | Text | null;
      tag: string;
      className?: string | (() => string) | undefined;
      children: VTreeType[];
      innerText?: string | (() => any);
      onClick?: (e: Event) => void;
    }
  | (() => VTreeType);

export type StripFunction<T> = T extends (...args: any) => any ? never : T;

export type ResolvedVTree = StripFunction<VTreeType>;

export type PartialVTree = Omit<StripFunction<VTreeType>, "children"> & {
  children: PartialVTree[];
};
