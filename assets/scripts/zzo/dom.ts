export const requiredBySelector = <T extends Element>(selector: string) => {
  const elem = document.querySelector<T>(selector);
  if (elem) {
    return elem;
  }
  throw new Error(`Missing ${selector}`);
};
export const requiredById = <T extends Element>(id: string) => {
  const elem = document.getElementById(id);
  if (elem) {
    return elem as unknown as T;
  }
  throw new Error(`Missing ${id}`);
};
let cache: { navbar: HTMLElement };
export const getDom = () => {
  if (!cache) {
    cache = {
      navbar: requiredBySelector<HTMLElement>(".navbar"),
    };
  }
  return cache;
};
