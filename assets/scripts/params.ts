var decodeEntities = (function () {
  // this prevents any overhead from creating the object each time
  var element = document.createElement("div");

  function decodeHTMLEntities(str: string) {
    if (str && typeof str === "string") {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, "");
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, "");
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = "";
    }

    return str;
  }

  return decodeHTMLEntities;
})();

export const loadParams = (): ParamGetter => {
  const dataAttrs = Array.from(document.currentScript!.attributes)
    .filter((attr) => attr.name.startsWith("data-"))
    .map((
      attr,
    ) => [
      attr.name.slice("data-".length).toLowerCase(),
      decodeEntities(attr.value),
    ]);
  const _ = new Map(
    dataAttrs
      .map(([name, value]) => [name, JSON.parse(value)]),
  );
  return (name: string) => _.get(name.toLowerCase());
};

export type ParamGetter = (name: string) => any;
