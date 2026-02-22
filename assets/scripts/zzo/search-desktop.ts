import { ParamGetter } from "../params";
import { requiredById, requiredBySelector } from "./dom";

type SearchResult = {
  item: {
    title: string;
    uri: string;
    description: string;
    content: string;
  };
  matches: {
    key: string;
    value: string;
    indices: [start: number, end: number][];
  }[];
};

function renderSearchResultsMain(
  searchText: string | null,
  results: SearchResult[],
) {
  const summaryContainer = document.querySelector(".summary__container");
  const searchResult = document.querySelector(".search-result");
  const originUl = document.querySelector(".search-result__body ul");
  const ul = document.createElement("ul");

  if (!searchText) {
    searchResult ? searchResult.setAttribute("data-display", "none") : null;
    summaryContainer
      ? summaryContainer.setAttribute("data-display", "block")
      : null;
  } else if (results) {
    if (results && results.length) {
      results.forEach(function (result) {
        makeLi(ul, result);
      });

      searchResult ? searchResult.setAttribute("data-display", "block") : null;
      summaryContainer
        ? summaryContainer.setAttribute("data-display", "none")
        : null;
    }
  }

  originUl.parentNode.replaceChild(ul, originUl);
}

function renderSearchHighlightResultsMain(
  searchText: string | null,
  results: SearchResult[],
) {
  const summaryContainer = document.querySelector(".summary__container");
  const searchResult = document.querySelector(".search-result");
  const originUl = document.querySelector(".search-result__body ul");
  const ul = document.createElement("ul");

  if (!searchText) {
    searchResult ? searchResult.setAttribute("data-display", "none") : null;
    summaryContainer
      ? summaryContainer.setAttribute("data-display", "block")
      : null;
  } else if (results) {
    if (results && results.length) {
      results.forEach(function (result) {
        makeHighlightLi(ul, result);
      });

      searchResult ? searchResult.setAttribute("data-display", "block") : null;
      summaryContainer
        ? summaryContainer.setAttribute("data-display", "none")
        : null;
    }
  }

  originUl.parentNode.replaceChild(ul, originUl);
}

function renderSearchResultsSide(
  searchText: string | null,
  results: SearchResult[],
) {
  const searchResults = requiredById("search-results");
  const searchMenu = requiredById("search-menu");
  searchResults.setAttribute("class", "dropdown is-active");

  var ul = document.createElement("ul");
  ul.setAttribute("class", "dropdown-content search-content");

  if (results.length) {
    results.forEach(function (result) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.setAttribute("href", result.item.uri);
      a.setAttribute("class", "dropdown-item");
      a.appendChild(li);

      var titleDiv = document.createElement("div");
      titleDiv.innerHTML = result.item.title;
      titleDiv.setAttribute("class", "menu-item__title");

      var descDiv = document.createElement("div");
      descDiv.setAttribute("class", "menu-item__desc");
      if (result.item.description) {
        descDiv.innerHTML = result.item.description;
      } else if (result.item.content) {
        descDiv.innerHTML = result.item.content.substring(0, 150);
      }

      li.appendChild(titleDiv);
      li.appendChild(descDiv);
      ul.appendChild(a);
    });
  } else {
    var li = document.createElement("li");
    li.setAttribute("class", "dropdown-item");
    li.innerText = "No results found";
    ul.appendChild(li);
  }

  while (searchMenu.hasChildNodes()) {
    searchMenu.removeChild(
      searchMenu.lastChild,
    );
  }

  searchMenu.appendChild(ul);
}

function renderSearchHighlightResultsSide(
  searchText: string | null,
  results: SearchResult[],
) {
  const searchResults = requiredById("search-results");
  const searchMenu = requiredById("search-menu");
  searchResults.setAttribute("class", "dropdown is-active");

  var ul = document.createElement("ul");
  ul.setAttribute("class", "dropdown-content search-content");

  if (results.length) {
    results.forEach(function (result) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      var descDiv = null;

      a.setAttribute("href", result.item.uri);
      a.setAttribute("class", "dropdown-item");
      a.appendChild(li);

      var titleDiv = document.createElement("div");
      titleDiv.innerHTML = result.item.title;
      titleDiv.setAttribute("class", "menu-item__title");

      if (result.matches && result.matches.length) {
        for (var i = 0; i < result.matches.length; i++) {
          if ("title" === result.matches[i].key) {
            titleDiv.innerHTML = generateHighlightedText(
              result.matches[i].value,
              result.matches[i].indices,
            );
          }

          if ("description" === result.matches[i].key) {
            descDiv = document.createElement("div");
            descDiv.setAttribute("class", "menu-item__desc");
            descDiv.innerHTML = generateHighlightedText(
              result.item.description,
              result.matches[i].indices,
            );
          } else if ("content" === result.matches[i].key) {
            if (!descDiv) {
              descDiv = document.createElement("div");
              descDiv.setAttribute("class", "menu-item__desc");
              descDiv.innerHTML = generateHighlightedText(
                result.item.content.substring(0, 150),
                result.matches[i].indices,
              );
            }
          } else {
            if (result.item.description) {
              descDiv = document.createElement("div");
              descDiv.setAttribute("class", "menu-item__desc");
              descDiv.innerHTML = result.item.description;
            } else {
              descDiv = document.createElement("div");
              descDiv.setAttribute("class", "menu-item__desc");
              descDiv.innerHTML = result.item.content.substring(0, 150);
            }
          }
        }

        li.appendChild(titleDiv);
        if (descDiv) {
          li.appendChild(descDiv);
        }
        ul.appendChild(a);
      }
    });
  } else {
    var li = document.createElement("li");
    li.setAttribute("class", "dropdown-item");
    li.innerText = "No results found";
    ul.appendChild(li);
  }

  while (searchMenu.hasChildNodes()) {
    searchMenu.removeChild(
      searchMenu.lastChild,
    );
  }
  searchMenu.appendChild(ul);
}

function renderSearchResultsMobile(
  searchText: string | null,
  results: SearchResult[],
) {
  const searchResults = requiredById("search-mobile-results");

  var content = document.createElement("div");
  content.setAttribute("class", "mobile-search__content");

  if (results.length > 0) {
    results.forEach(function (result) {
      var item = document.createElement("a");
      item.setAttribute("href", result.item.uri);
      item.innerHTML =
        '<div class="mobile-search__item"><div class="mobile-search__item--title">📄 ' +
        result.item.title + '</div><div class="mobile-search__item--desc">' +
        (result.item.description
          ? result.item.description
          : result.item.content) +
        "</div></div>";
      content.appendChild(item);
    });
  } else {
    var item = document.createElement("span");
    content.appendChild(item);
  }

  let wrap = document.getElementById("search-mobile-results");
  while (wrap.firstChild) {
    wrap.removeChild(wrap.firstChild);
  }
  searchResults.appendChild(content);
}

function renderSearchHighlightResultsMobile(
  searchText: string | null,
  results: SearchResult[],
) {
  const searchResults = requiredById("search-mobile-results");

  var ul = document.createElement("div");
  ul.setAttribute("class", "mobile-search__content");

  if (results.length) {
    results.forEach(function (result) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      var descDiv = null;

      a.setAttribute("href", result.item.uri);
      a.appendChild(li);
      li.setAttribute("class", "mobile-search__item");

      var titleDiv = document.createElement("div");
      titleDiv.innerHTML = result.item.title;
      titleDiv.setAttribute("class", "mobile-search__item--title");

      if (result.matches && result.matches.length) {
        for (var i = 0; i < result.matches.length; i++) {
          if ("title" === result.matches[i].key) {
            titleDiv.innerHTML = generateHighlightedText(
              result.matches[i].value,
              result.matches[i].indices,
            );
          }

          if ("description" === result.matches[i].key) {
            descDiv = document.createElement("div");
            descDiv.setAttribute("class", "mobile-search__item--desc");
            descDiv.innerHTML = generateHighlightedText(
              result.item.description,
              result.matches[i].indices,
            );
          } else if ("content" === result.matches[i].key) {
            if (!descDiv) {
              descDiv = document.createElement("div");
              descDiv.setAttribute("class", "mobile-search__item--desc");
              descDiv.innerHTML = generateHighlightedText(
                result.item.content.substring(0, 150),
                result.matches[i].indices,
              );
            }
          } else {
            if (result.item.description) {
              descDiv = document.createElement("div");
              descDiv.setAttribute("class", "mobile-search__item--desc");
              descDiv.innerHTML = result.item.description;
            } else {
              descDiv = document.createElement("div");
              descDiv.setAttribute("class", "mobile-search__item--desc");
              descDiv.innerHTML = result.item.content.substring(0, 150);
            }
          }
        }

        li.appendChild(titleDiv);
        if (descDiv) {
          li.appendChild(descDiv);
        }
        ul.appendChild(a);
      }
    });
  } else {
    var item = document.createElement("span");
    ul.appendChild(item);
  }

  let wrap = document.getElementById("search-mobile-results");
  while (wrap.firstChild) {
    wrap.removeChild(wrap.firstChild);
  }
  searchResults.appendChild(ul);
}
function makeLi(
  ulElem: HTMLUListElement,
  obj: SearchResult,
) {
  var li = document.createElement("li");
  li.className = "search-result__item";

  var a = document.createElement("a");
  a.innerHTML = obj.item.title;
  a.setAttribute("class", "search-result__item--title");
  a.setAttribute("href", obj.item.uri);

  var descDiv = document.createElement("div");
  descDiv.setAttribute("class", "search-result__item--desc");
  if (obj.item.description) {
    descDiv.innerHTML = obj.item.description;
  } else if (obj.item.content) {
    descDiv.innerHTML = obj.item.content.substring(0, 225);
  }

  li.appendChild(a);
  li.appendChild(descDiv);
  ulElem.appendChild(li);
}
function makeHighlightLi(
  ulElem: HTMLUListElement,
  obj: SearchResult,
) {
  var li = document.createElement("li");
  li.className = "search-result__item";
  var descDiv = null;

  var a = document.createElement("a");
  a.innerHTML = obj.item.title;
  a.setAttribute("class", "search-result__item--title");
  a.setAttribute("href", obj.item.uri);

  if (obj.matches && obj.matches.length) {
    for (var i = 0; i < obj.matches.length; i++) {
      if ("title" === obj.matches[i].key) {
        a = document.createElement("a");
        a.innerHTML = generateHighlightedText(
          obj.matches[i].value,
          obj.matches[i].indices,
        );
        a.setAttribute("class", "search-result__item--title");
        a.setAttribute("href", obj.item.uri);
      }

      if ("description" === obj.matches[i].key) {
        descDiv = document.createElement("div");
        descDiv.setAttribute("class", "search-result__item--desc");
        descDiv.innerHTML = generateHighlightedText(
          obj.item.description,
          obj.matches[i].indices,
        );
      } else if ("content" === obj.matches[i].key) {
        if (!descDiv) {
          descDiv = document.createElement("div");
          descDiv.setAttribute("class", "search-result__item--desc");
          descDiv.innerHTML = generateHighlightedText(
            obj.item.content.substring(0, 150),
            obj.matches[i].indices,
          );
        }
      } else {
        if (obj.item.description) {
          descDiv = document.createElement("div");
          descDiv.setAttribute("class", "search-result__item--desc");
          descDiv.innerHTML = obj.item.description;
        } else {
          descDiv = document.createElement("div");
          descDiv.setAttribute("class", "search-result__item--desc");
          descDiv.innerHTML = obj.item.content.substring(0, 150);
        }
      }
    }

    li.appendChild(a);
    if (descDiv) {
      li.appendChild(descDiv);
    }
    if (li) {
      ulElem.appendChild(li);
    }
  }
}

function generateHighlightedText(
  text: string,
  regions: [start: number, end: number][],
) {
  if (!regions) {
    return text;
  }

  var content = "", nextUnhighlightedRegionStartingIndex = 0;

  regions.forEach(function (region) {
    if (region[0] === region[1]) {
      return null;
    }

    content += "" +
      text.substring(nextUnhighlightedRegionStartingIndex, region[0]) +
      '<span class="search__highlight">' +
      text.substring(region[0], region[1] + 1) +
      "</span>" +
      "";
    nextUnhighlightedRegionStartingIndex = region[1] + 1;
  });

  content += text.substring(nextUnhighlightedRegionStartingIndex);

  return content;
}
function renderSearch(
  param: ParamGetter,
  searchText: string | null,
  results: SearchResult[],
) {
  const enableSearchHighlight = param("enableSearchHighlight");
  const searchResultPosition = param("searchResultPosition");
  if (searchResultPosition === "main") {
    if (enableSearchHighlight) {
      renderSearchHighlightResultsMain(
        searchText,
        results,
      );
    } else {
      renderSearchResultsMain(
        searchText,
        results,
      );
    }
  } else {
    if (enableSearchHighlight) {
      renderSearchHighlightResultsSide(searchText, results);
    } else {
      renderSearchResultsSide(searchText, results);
    }
    var searchResultsContainer = document.getElementById("search-results");

    var dropdownItems = searchResultsContainer?.querySelectorAll(
      ".dropdown-item",
    );
    dropdownItems?.forEach(function (item) {
      item.addEventListener("mousedown", function (e) {
        e.target.click();
      });
    });
  }
}

export const initSearchDesktop = (param: ParamGetter) => {
  var summaryContainer = requiredBySelector(".summary__container");
  var searchResult = requiredBySelector(".search-result");
  var searchResultCloseBtn = document.querySelector(".search-result__close");
  searchResultCloseBtn
    ? searchResultCloseBtn.addEventListener("click", function (e) {
      searchResult.setAttribute("data-display", "none");
      summaryContainer.setAttribute("data-display", "block");
    })
    : null;

  var baseurl = param("roothref");
  var permalink = param("permalink");
  var langprefix = param("langprefix");
  const searchResults = requiredById("search-results");
  let searchText: string | null = null;

  var enableSearch = param("enableSearch");
  var searchDistance = param("searchDistance");
  var searchThreshold = param("searchThreshold");
  var searchContent = param("searchContent");
  var enableSearchHighlight = param("enableSearchHighlight");
  var sectionType = param("sectionType");
  var kind = param("kind");

  var fuse = null;

  if (enableSearch) {
    (function initFuse() {
      var xhr = new XMLHttpRequest();
      if (sectionType === "publication" && kind !== "page") {
        xhr.open("GET", permalink + "index.json");
      } else {
        xhr.open("GET", baseurl + langprefix + "/index.json");
      }

      xhr.setRequestHeader("Content-Type", "application/json; charset=utf-8");
      xhr.onload = function () {
        if (xhr.status === 200) {
          fuse = new Fuse(JSON.parse(xhr.response.toString("utf-8")), {
            keys: sectionType.includes("publication")
              ? ["title", "abstract"]
              : searchContent
              ? ["title", "description", "content"]
              : ["title", "description"],
            includeMatches: enableSearchHighlight,
            shouldSort: true, // default: true
            threshold: searchThreshold ? searchThreshold : 0.4, // default: 0.6 (0.0 requires a perfect match)
            location: 0, // default: 0
            distance: searchDistance ? searchDistance : 100, // default: 100
            maxPatternLength: 32,
            minMatchCharLength: 1,
            isCaseSensitive: false, // defualt: false
            findAllMatches: false, // default: false
            useExtendedSearch: false, // default: false
          });
          window.fuse = fuse;
        } else {
          console.error("[" + xhr.status + "]Error:", xhr.statusText);
        }
      };
      xhr.send();
    })();
  }

  var searchMobile = document.getElementById("search-mobile");
  var searchResultsContainer = document.getElementById("search-results");

  const searchElem = document.getElementById("search");
  if (searchElem) {
    searchElem.addEventListener("input", function (e) {
      if (!e.target.value || window.innerWidth < 770) {
        searchResultsContainer
          ? searchResultsContainer.setAttribute("class", "dropdown")
          : null;
        searchResult ? searchResult.setAttribute("data-display", "none") : null;
        summaryContainer
          ? summaryContainer.setAttribute("data-display", "block")
          : null;
        return null;
      }

      searchText = e.target.value;
      var results = fuse.search(e.target.value);

      renderSearch(
        param,
        searchText,
        results,
      );
    });
    searchElem.addEventListener("click", function (e) {
      if (window.innerWidth < 770) {
        return null;
      }
      if (!e.target.value) {
        searchResultsContainer
          ? searchResultsContainer.setAttribute("class", "dropdown")
          : null;
        return null;
      }

      searchText = e.target.value;
      var results = fuse.search(e.target.value);

      renderSearch(
        param,
        searchText,
        results,
      );
    });

    searchElem.addEventListener("blur", function () {
      if (window.innerWidth < 770) {
        return null;
      }
      searchResultsContainer
        ? searchResultsContainer.setAttribute("class", "dropdown")
        : null;
    });

    var activeIndex: number | null = null;
    var searchContainerMaxHeight = 350;

    searchElem.addEventListener("keydown", function (e) {
      if (window.innerWidth < 770) {
        return null;
      }

      if (e.key === "Escape") {
        searchResult ? searchResult.setAttribute("data-display", "none") : null;
        summaryContainer
          ? summaryContainer.setAttribute("data-display", "block")
          : null;
      }

      var items = document.querySelectorAll("#search-menu .dropdown-item");
      var keyCode = e.which || e.keyCode;

      if (!items || !items.length) {
        return null;
      }

      if (e.key === "ArrowDown" || keyCode === 40) {
        if (activeIndex === null) {
          activeIndex = 0;
          items[activeIndex].classList.remove("is-active");
        } else {
          items[activeIndex].classList.remove("is-active");
          activeIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
        }
        items[activeIndex].classList.add("is-active");

        let overflowedPixel = items[activeIndex].offsetTop +
          items[activeIndex].clientHeight - searchContainerMaxHeight;
        if (overflowedPixel > 0) {
          document.querySelector(".search-content").scrollTop +=
            items[activeIndex].getBoundingClientRect().height;
        } else if (activeIndex === 0) {
          document.querySelector(".search-content").scrollTop = 0;
        }
      } else if (e.key === "ArrowUp" || keyCode === 38) {
        if (activeIndex === null) {
          activeIndex = items.length - 1;
          items[activeIndex].classList.remove("is-active");
        } else {
          items[activeIndex].classList.remove("is-active");
          activeIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
        }
        items[activeIndex].classList.add("is-active");

        let overflowedPixel = items[activeIndex].offsetTop +
          items[activeIndex].clientHeight - searchContainerMaxHeight;
        if (overflowedPixel < 0) {
          document.querySelector(".search-content").scrollTop -=
            items[activeIndex].getBoundingClientRect().height;
        } else {
          document.querySelector(".search-content").scrollTop =
            overflowedPixel + items[activeIndex].getBoundingClientRect().height;
        }
      } else if (e.key === "Enter" || keyCode === 13) {
        if (items[activeIndex] && items[activeIndex].getAttribute("href")) {
          location.href = items[activeIndex].getAttribute("href");
        }
      } else if (e.key === "Escape" || keyCode === 27) {
        e.target.value = null;
        if (searchResults) {
          searchResults.classList.remove("is-active");
        }
      }
    });
  }

  searchMobile
    ? searchMobile.addEventListener("input", function (e) {
      if (!e.target.value) {
        let wrap = document.getElementById("search-mobile-results");
        while (wrap.firstChild) {
          wrap.removeChild(wrap.firstChild);
        }
        return null;
      }

      searchText = e.target.value;
      var results = fuse.search(e.target.value);
      if (enableSearchHighlight) {
        renderSearchHighlightResultsMobile(searchText, results);
      } else {
        renderSearchResultsMobile(searchText, results);
      }
    })
    : null;
};
