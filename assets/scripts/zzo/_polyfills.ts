// forEach
if (window.NodeList && !NodeList.prototype.forEach) {
  NodeList.prototype.forEach = Array.prototype.forEach;
}

// includes
if (!String.prototype.includes) {
  String.prototype.includes = function (search, start) {
    "use strict";

    if (search instanceof RegExp) {
      throw TypeError("first argument must not be a RegExp");
    }
    if (start === undefined) start = 0;
    return this.indexOf(search, start) !== -1;
  };
}

// append
Document.prototype.append = Element.prototype.append = function append() {
  this.appendChild(_mutation(arguments));
};
function _mutation(nodes) {
  if (!nodes.length) {
    throw new Error("DOM Exception 8");
  } else if (nodes.length === 1) {
    return typeof nodes[0] === "string"
      ? document.createTextNode(nodes[0])
      : nodes[0];
  } else {
    var fragment = document.createDocumentFragment(),
      length = nodes.length,
      index = -1,
      node;

    while (++index < length) {
      node = nodes[index];

      fragment.appendChild(
        typeof node === "string" ? document.createTextNode(node) : node,
      );
    }

    return fragment;
  }
}

// startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.indexOf(searchString, position) === position;
  };
}
