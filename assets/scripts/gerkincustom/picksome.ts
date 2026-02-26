const initPickSome = (element: HTMLDivElement) => {
  const countStr = element.getAttribute("data-count");
  if (!countStr) {
    return;
  }
  const count = parseInt(countStr);
  if (isNaN(count) || count < 1) {
    console.error("Invalid count %i from %o", count, element);
    return;
  }
  const checkboxes = element.querySelectorAll<HTMLInputElement>(
    'li>input[type="checkbox"]',
  );
  let checkedElements: HTMLInputElement[] = [];
  function onCheckboxChange(this: HTMLInputElement) {
    const checked = this.checked;
    const othersChecked = [...checkedElements.filter((el) => el !== this)];
    if (checked) {
      checkedElements = [...othersChecked, this];
      const toDisable = checkedElements.slice(0, -count);
      toDisable.forEach((other) => {
        other.click();
      });
    } else {
      checkedElements = othersChecked;
    }
  }
  checkboxes.forEach((checkbox) => {
    checkbox.removeAttribute("disabled");
    checkbox.addEventListener("change", onCheckboxChange);
    onCheckboxChange.call(checkbox);
  });
};

document.querySelectorAll<HTMLDivElement>(".picksome").forEach(initPickSome);
