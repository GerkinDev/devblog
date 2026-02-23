Array.from(
  document.querySelectorAll<HTMLElement>("[data-code-block-label-override]"),
)
  .forEach((element) => {
    const codeContainer = element.querySelector(".chroma td:nth-child(2) code");
    if (!codeContainer) {
      return;
    }
    const label = element.getAttribute("data-code-block-label-override");
    if (!label) {
      return;
    }
    codeContainer.setAttribute("data-lang", label);
  });
