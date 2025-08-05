export type CreateElementProps = {
  className?: string;
  innerText?: string;
  children?: CreateElementProps[];
  onClick?: (e: Event) => void;
};
