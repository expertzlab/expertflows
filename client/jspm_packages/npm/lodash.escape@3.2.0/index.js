/* */ 
(function(process) {
  var root = require('lodash._root');
  var INFINITY = 1 / 0;
  var symbolTag = '[object Symbol]';
  var reUnescapedHtml = /[&<>"'`]/g,
      reHasUnescapedHtml = RegExp(reUnescapedHtml.source);
  var htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;'
  };
  function escapeHtmlChar(chr) {
    return htmlEscapes[chr];
  }
  var objectProto = Object.prototype;
  var objectToString = objectProto.toString;
  var Symbol = root.Symbol;
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolToString = Symbol ? symbolProto.toString : undefined;
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }
  function isSymbol(value) {
    return typeof value == 'symbol' || (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }
  function toString(value) {
    if (typeof value == 'string') {
      return value;
    }
    if (value == null) {
      return '';
    }
    if (isSymbol(value)) {
      return Symbol ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }
  function escape(string) {
    string = toString(string);
    return (string && reHasUnescapedHtml.test(string)) ? string.replace(reUnescapedHtml, escapeHtmlChar) : string;
  }
  module.exports = escape;
})(require('process'));
