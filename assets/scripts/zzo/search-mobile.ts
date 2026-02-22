export const initSearchMobile = () => {
  var mobileSearchInputElem = document.querySelector<HTMLElement>(
    "#search-mobile",
  );
  var mobileSearchClassElem = document.querySelector(".mobile-search");
  var mobileSearchContainer = document.querySelector(
    "#search-mobile-container",
  );
  var mobileSearchResultsElem = document.querySelector(
    "#search-mobile-results",
  );
  var htmlElem = document.querySelector("html");

  if (mobileSearchClassElem) {
    mobileSearchClassElem.style.display = "none";
  }

  document.querySelectorAll(".navbar-search").forEach(function (elem, idx) {
    elem.addEventListener("click", function () {
      if (mobileSearchContainer) {
        mobileSearchContainer.style.display = "block";
      }

      if (mobileSearchInputElem) {
        mobileSearchInputElem.focus();
      }

      if (htmlElem) {
        htmlElem.style.overflowY = "hidden";
      }
    });
  });

  document.getElementById("search-mobile-close")?.addEventListener(
    "click",
    function () {
      if (mobileSearchContainer) {
        mobileSearchContainer.style.display = "none";
      }

      if (mobileSearchInputElem) {
        mobileSearchInputElem.value = "";
      }

      if (mobileSearchResultsElem) {
        while (mobileSearchResultsElem.firstChild) {
          mobileSearchResultsElem.removeChild(
            mobileSearchResultsElem.firstChild,
          );
        }
      }

      if (htmlElem) {
        htmlElem.style.overflowY = "visible";
      }
    },
  );

  mobileSearchInputElem
    ? mobileSearchInputElem.addEventListener("keydown", function (e) {
      var keyCode = e.which || e.keyCode;
      if (e.key === "Escape" || keyCode === 27) {
        if (mobileSearchContainer) {
          mobileSearchContainer.style.display = "none";
        }

        if (mobileSearchInputElem) {
          mobileSearchInputElem.value = "";
        }

        if (mobileSearchResultsElem) {
          while (mobileSearchResultsElem.firstChild) {
            mobileSearchResultsElem.removeChild(
              mobileSearchResultsElem.firstChild,
            );
          }
        }
        if (htmlElem) {
          htmlElem.style.overflowY = "visible";
        }
      }
    })
    : null;
};
