function escapeRobot(text) {
	text = text.replace(/\\/g, "\\\\");
	text = text.replace(/\$\{/g, "\\${");
	text = text.replace(/@\{/g, "\\@{");
	text = text.replace(/%\{/g, "\\%{");
	text = text.replace(/#/g, "\\#");
	return text;
}

function escapeSpace(text) {
	text = text.replace(/\t/g, "\\t");
	text = text.replace(/\s/g, " ");
	text = text.replace(/(\s){2,2}/g, " \\ ");
	text = text.replace(/(\\\s\s)/g, "\\ \\ ");
	text = text.replace(/(\\n\s)/g, "\\n\\ ");
	return text;
}

function getNodeValue(element) {
	var nodeValue = "";
	if (element.childNodes[0]) {
		nodeValue = element.childNodes[0].nodeValue;
	}
	if (nodeValue) {
		nodeValue = nodeValue.trim();
		nodeValue = escapeRobot(nodeValue);
	}
	return nodeValue;
}

function flattenArray(a, r) {
	if (!r) { r = []; }
	for (var i = 0; i < a.length; i++) {
		if (typeof a[i] !== 'string') {
			flattenArray(a[i], r);
		} else {
			r.push(a[i]);
		}
	}
	return r;
}

function getTextFragments(element) {
	if (element.textFragments) {
		return element.textFragments;
	}
	var textFragments = _fromHTML(element);
	textFragments = flattenArray(textFragments);
	//More sanitizing on the text fragments
	for (var i = 0; i < textFragments.length; i++) {
		textFragments[i] = escapeRobot(textFragments[i]);
		textFragments[i] = textFragments[i].replace(/(\r\n|\n|\r)/gm, "\\n");
		textFragments[i] = textFragments[i].trim();
		textFragments[i] = escapeSpace(textFragments[i]);
		textFragments[i] = textFragments[i].replace(/^((\\n)|(\\t)|\s|\\\s)*/, "");
		textFragments[i] = textFragments[i].replace(/((\\n)|(\\t)|\s|\\\s)*$/, "");

		if (textFragments[i].length === 0 || !(_isPrintable(textFragments[i]))) {
			textFragments.splice(i, 1);
			i--;
			continue;
		}
	}
	//Remove duplicates
	textFragments = textFragments.filter(function (elem, pos) {
		return textFragments.indexOf(elem) == pos;
	});
	element.textFragments = textFragments;
	return textFragments;
}

async function attachTextFragments(element) {
	if (!element.textFragments) {
		element.textFragments = getTextFragments(element);
		addToTextFragmentsCount(element.textFragments.length);
	}
}

function getElementText(element) {
	var textFragments = getTextFragments(element);
	var text = textFragments[0];
	for (var i = 1; i < textFragments.length; i++) {
		text += "\\n";
		text += textFragments[i];
	}
	return text;
}

function getTextBasedXPath(element) {
	var tag = _getTag(element);

	if (tag == "body") {
		return ".//body";
	}

	var xpath;
	var txt;
	// We cannot use element.type because of default types that are not explicitly defined 
	// and will not work in xpath
	var type = _getElementType(element);

	if (element.placeholder && element.placeholder !== "") {
		var placeholder = _resolveApostrophes(element.placeholder);
		xpath = ".//" + tag + "[@placeholder=" + placeholder + "]";
	} else if (element.alt && element.alt !== "") {
		var alt = _resolveApostrophes(element.alt);
		xpath = ".//" + tag + "[@alt=" + alt + "]";
	} else if (element.title && element.title !== "") {
		var title = _resolveApostrophes(element.title);
		xpath = ".//" + tag + "[@title=" + title + "]";
	} else if (tag == "input" &&
		(type == "button" || type == "reset" || type == "submit") &&
		element.value &&
		element.value !== "") {
		xpath = ".//input[@value='" + element.value + "']";
	}
	// Check if the element has text

	// Yes, I know that declaring variables here is not good practice.
	// But the alternative would produce too much indentation and worse readability
	// I also don't want to call the function twice
	else if (tag != "SELECT" && (txt = _getXPathText(element)) !== "") {
		xpath = ".//" +
			tag +
			txt;
	} else if ((nearTextElement = getNearTextElement(element)) !== null) {
		// Search for associated labels in the context of the "nearTextElement"
		var labelText;
		if (nearTextElement.tagName == "LABEL" &&
			nearTextElement.for == element.id &&
			nearTextElement.textContent.length > 0) {
			labelText = _getXPathText(nearTextElement);
			xpath = ".//" + tag + "[@id=//label" + labelText + "/@for]";
		} else {
			var label = getLabel(element, nearTextElement);
			if (label && label.textContent.length > 0) {
				labelText = _getXPathText(label);
				xpath = ".//" + tag + "[@id=//label" + labelText + "/@for]";
			}
		}
		// No label found, use the nerTextElement text
		if (!xpath) {
			var nearestText = _getXPathText(nearTextElement);
			xpath = ".//" + _getTag(nearTextElement) +
					nearestText;

			var nearestTextElementXpathIndex = _getElementXPathIndex(nearTextElement, xpath);
			if (nearestTextElementXpathIndex !== "") {
				xpath = "(" + xpath + ")" + nearestTextElementXpathIndex;
			}
			xpath += "/" + nearTextElement.relationship + "::";
			xpath += tag;
		}
	}
	// The element does not have text included or nearby.
	if (!xpath) {
		xpath = ".//" + tag;
	}
	if (xpath && type) {
		xpath += "[@type='" + type + "']";
	}
	var elementXPathIndex = _getElementXPathIndex(element, xpath);
	if (elementXPathIndex !== "") {
		xpath = "(" + xpath + ")" + elementXPathIndex;
	}
	return xpath;
}

async function attachTextBasedXPath(el) {
	el.xpath = getTextBasedXPath(el);
}

function getClassBasedXPath(element) {
	var xpath;
	var tag = _getTag(element);

	var classes = element.getAttribute("class");
	if (!classes) {
		return null;
	}

	if(hasWhiteSpace(classes)) {
		xpath = ".//" + tag + "[contains(normalize-space(@class), \"" +
		classes.replace(/\s+/g, ' ').trim() +
		"\")]";
	} else {
		xpath = ".//" + tag + "[contains(@class, \"" +
		classes +
		"\")]";
	}

	var elementXPathIndex = _getElementXPathIndex(element, xpath);
	if (elementXPathIndex !== "") {
		xpath = "(" + xpath + ")" + elementXPathIndex;
	}
	
	return xpath;
}

// We cannot use element.type because of default types that are not explicitly defined 
// and will not work in xpath
function _getElementType(element) {
	var elContainingDocument = element.ownerDocument;
	var xPathResult = elContainingDocument.evaluate("attribute::type", element, null, 0, null);

	var matchedNode = xPathResult.iterateNext();
	if (matchedNode) {
		return matchedNode.value;
	} else {
		return null;
	}
}

function _getElementXPathIndex(element, xpath) {
	var i = 0;
	var index;
	try {
		var elContainingDocument = element.ownerDocument;
		var xPathResult = elContainingDocument.
			evaluate(xpath, elContainingDocument, null, 0, null);
		var matchedNode = xPathResult.iterateNext();
		while (matchedNode) {
			i++;
			if (matchedNode == element) {
				index = i;
			}
			matchedNode = xPathResult.iterateNext();
		}
	} catch (err) {
		alert(chrome.i18n.getMessage("no_xpath"));
	}
	if (i == 1) {
		return "";
	} else if (index == i) {
		return "[last()]";
	} else {
		if (index === undefined) {
			alert(chrome.i18n.getMessage("no_xpath"));
		}
		return "[" + index + "]";
	}
}

// TODO improve this?
function getNearTextElement(element) {
	var parentTextElement;
	var precTextElement;
	var followingTextElement;

	var tempXpath = "(.//" + _getTag(element) + ")";
	tempXpath += _getElementXPathIndex(element, tempXpath);

	parentTextElement = _getParentTextElement(element);
	if (parentTextElement) {
		return parentTextElement;
	} else {
		precTextElement = _getPrecTextElement(element);
		followingTextElement = _getFollowingTextElement(element);
		if (!precTextElement && !followingTextElement) {
			return null;
		} else if (precTextElement && followingTextElement) {
			var elRec = element.getBoundingClientRect();
			var precRec = precTextElement.getBoundingClientRect();
			var follRec = followingTextElement.getBoundingClientRect();
			var precIsAbove = (precRec.bottom < elRec.top);
			var follIsBellow = (follRec.top > elRec.bottom);
			if (precIsAbove && follIsBellow) {
				if ((elRec.top - precRec.bottom) <= (follRec.top - elRec.bottom)) {
					return precTextElement;
				} else {
					return followingTextElement;
				}
			}
			return precTextElement;
		} else {
			if (precTextElement) {
				return precTextElement;
			} else if (followingTextElement) {
				return followingTextElement;
			}
		}
	}
}

function getLabel(input, contextEl) {
	if (!input.id) return null;
	xpath = ".//label[@for='" + input.id + "']";
	var xPathResult = contextEl.ownerDocument.
		evaluate(xpath, contextEl, null, 0, null);
	var matchedNode = xPathResult.iterateNext();
	return matchedNode;
}

function isVisible(element) {
	return element.offsetWidth > 0 || element.offsetHeight > 0;
}

function getOSName() {
	var appVersion = navigator.appVersion;
	var OSName = "Unknown OS";

	if (appVersion.indexOf("Win") != -1) {
		OSName = "Windows";
	} else if (appVersion.indexOf("Mac") != -1) {
		OSName = "MacOS";
	} else if (appVersion.indexOf("Linux") != -1) {
		OSName = "Linux";
	} else if (appVersion.indexOf("X11") != -1) {
		OSName = "UNIX";
	}
	return OSName;
}

function getURL() {
	var url = window.location.href;
	url = decodeURIComponent(url);
	return url;
}

function _getPrecTextElement(element) {
	var nearestTextElementXpath;
	var elContainingDocument = element.ownerDocument;
	var tempXpath = "(.//" + _getTag(element) + ")";
	tempXpath += _getElementXPathIndex(element, tempXpath);
	for (var i = 0; true; i++) {
		nearestTextElementXpath = "(" +
			tempXpath +
			"/preceding::*[normalize-space(.)!=''][not(@contenteditable and @contenteditable = 'true')])[last() - " +
			i +
			"]";
		var xPathResult = elContainingDocument.
			evaluate(nearestTextElementXpath, elContainingDocument.body, null, 0, null);
		var matchedNode = xPathResult.iterateNext();
		if (!matchedNode) {
			return null;
		} else if (_elTextContainsAlphanum(matchedNode) && isVisible(matchedNode)) {
			matchedNode.relationship = "following";
			return matchedNode;
		}
	}
	return null;
}

function _getFollowingTextElement(element) {
	var nearestTextElementXpath;
	var elContainingDocument = element.ownerDocument;
	var tempXpath = "(.//" + _getTag(element) + ")";
	tempXpath += _getElementXPathIndex(element, tempXpath);
	nearestTextElementXpath = tempXpath + "/following::*[normalize-space(.)!=''][not(@contenteditable and @contenteditable = 'true')]";
	var xPathResult = elContainingDocument.
		evaluate(nearestTextElementXpath, elContainingDocument.body, null, 0, null);
	var matchedNode = xPathResult.iterateNext();
	while (matchedNode) {
		if (_elTextContainsAlphanum(matchedNode) && isVisible(matchedNode)) {
			matchedNode.relationship = "preceding";
			return matchedNode;
		}
		matchedNode = xPathResult.iterateNext();
	}
	return null;
}

// TODO improve this strategy?
function _getParentTextElement(element) {
	var nearestTextElementXpath;
	var elContainingDocument = element.ownerDocument;
	var tempXpath = "(.//" + _getTag(element) + ")";
	tempXpath += _getElementXPathIndex(element, tempXpath);
	nearestTextElementXpath = tempXpath + "/parent::*[normalize-space(.)!=''][not(@contenteditable and @contenteditable = 'true')]"; //[" + i + "]";
	var xPathResult = elContainingDocument.
		evaluate(nearestTextElementXpath, elContainingDocument.body, null, 0, null);
	var matchedNode = xPathResult.iterateNext();
	if (!matchedNode) {
		return null;
	} else if (_elTextContainsAlphanum(matchedNode) &&
		isVisible(matchedNode) &&
		matchedNode.textContent.trim() !== element.textContent.trim()) {
		matchedNode.relationship = "child";
		return matchedNode;
	}
	return null;
}

// Adapted from http://razgulyaev.blogspot.pt/2012/07/selenium-2-java-client-how-to-resolve.html#!/2012/07/selenium-2-java-client-how-to-resolve.html
function _resolveApostrophes(str) {
	if (str.indexOf("'") == -1) {
		return "'" + str + "'";
	}
	var sArray = {};
	var finalStr;

	sArray = str.split("'");
	finalStr = "concat(";

	for (var i = 0; i < (sArray.length - 1); i++) {
		finalStr = finalStr + "'" + sArray[i] + "', " + "\"'\", ";
	}

	finalStr = finalStr + "'" + sArray[sArray.length - 1] + "'";
	if (str.lastIndexOf("'") == str.length) {
		finalStr = finalStr + ", \"'\"";
	}
	finalStr = finalStr + ")";

	return finalStr;
}

function _getXPathText(element) {
	// TODO check other empty space representations 
	if (!element.innerHTML || element.innerHTML.match(/^(&nbsp;){1,}$/) || element.getAttribute("contenteditable") == "true") {
		return "";
	}

	var elementText;

	// Exclude text that may have been manually inserted
	editableXPath = ".//*[@contenteditable = 'true']";
	var xPathResult = element.ownerDocument.
		evaluate(editableXPath, element, null, 0, null);
	var matchedNode = xPathResult.iterateNext();
	if (matchedNode) {
		// Exclude text of children
		elementText = element.childNodes[0].nodeValue || "";
	} else {
		// Include text of children
		elementText = element.textContent || "";
	}
	elementText = elementText.trim();

	// Exclude &nbsp;
	var re = new RegExp(String.fromCharCode(160), "g");
	var splitElementText = elementText.split(re);
	elementText = "";
	for (var i = 0; i < splitElementText.length; i++) {
		if (splitElementText[i] !== "") {
			elementText = splitElementText[i];
			break;
		}
	}

	// Additional preparation
	elementText = elementText.replace(/(\r\n|\n|\r)/gm, " ");
	elementText = elementText.replace(/\s+/g, " ");

	// TODO should this be bigger/smaller?
	elementText = elementText.substring(0, 100);

	elementText = _resolveApostrophes(elementText);

	if(hasWhiteSpace(elementText)) {
		elementText = "[contains(normalize-space(.), " + elementText + ")]";
	} else {
		elementText = "[contains(., " + elementText + ")]";
	}
	return elementText;
}

function hasWhiteSpace(string) {
	return /\s/g.test(string);
}

function _elTextContainsAlphanum(element) {
	var elementText = _getXPathText(element);
	var unicodeWord = XRegExp('\\p{L}|\\p{N}');
	return unicodeWord.test(_UTF8.decode(elementText));
}

/**
 *
 *  UTF-8 data encode / decode
 *  http://www.webtoolkit.info/
 *
 **/
var _UTF8 = {
	// public method for url encoding
	encode: function (string) {
		string = string.replace(/\r\n/g, "\n");
		var utftext = "";

		for (var n = 0; n < string.length; n++) {

			var c = string.charCodeAt(n);

			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if ((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
		}
		return utftext;
	},

	decode: function (utftext) {
		var string = "";
		var i = 0;
		var c = c1 = c2 = 0;

		while (i < utftext.length) {

			c = utftext.charCodeAt(i);

			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
			} else if ((c > 191) && (c < 224)) {
				c2 = utftext.charCodeAt(i + 1);
				string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
				i += 2;
			} else {
				c2 = utftext.charCodeAt(i + 1);
				c3 = utftext.charCodeAt(i + 2);
				string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
				i += 3;
			}
		}
		return string;
	}
};

function _getTag(element) {
	var tag = element.tagName.toLowerCase();
	// TODO other situations?
	if (tag == "svg" ||
		tag == "rect" ||
		tag == "circle" ||
		tag == "ellipse" ||
		tag == "line" ||
		tag == "polyline" ||
		tag == "polygon" ||
		tag == "path" ||
		tag == "text" ||
		tag == "g") {
		tag = "*[local-name() = '" + tag + "']";
	}
	return tag;
}

// Adapted from  https://github.com/mckamey/jsonml/blob/master/jsonml-dom.js
// Heavily modified to exclude everything but text
function _fromHTML(elem) {
	if (!elem || !elem.nodeType) {
		return (elem = null);
	}
	var jml = [];
	switch (elem.nodeType) {
		case 1:  // element
		case 9:  // document
		case 11: // documentFragment
			var child;
			switch ((elem.tagName || '').toLowerCase()) {
				case 'frame':
					break;
				case 'iframe':
					break;
				case 'script':
					break;
				case 'noscript':
					break;
				case 'style':
					break;
				case 'input':
					_addChildren(elem, jml);
					break;
				case 'textarea':
					if (!_addChildren(elem, jml)) {
						child = elem.value || elem.innerHTML;
						if (child && 'string' === typeof child) {
							jml.push(child);
						}
					}
					break;
				default:
					_addChildren(elem, jml);
					break;
			}
			elem = null;
			return jml;
		case 3: // text node
			var re = new RegExp(String.fromCharCode(160), "g");
			var arr = elem.nodeValue.split(re);
			arr = arr.filter(function (n) { return n !== ""; });
			if (arr.length >= 0) {
				elem = elem.ownerDocument.createTextNode(arr[0]);
				var str = String(elem.nodeValue);
				elem = null;
				return str;
			} else {
				return (elem = null);
			}
			break;
		default: // etc.
			return (elem = null);
	}
}

function _addChildren(elem, jml) {
	if (elem.hasChildNodes()) {
		for (var i = 0; i < elem.childNodes.length; i++) {
			var child = elem.childNodes[i];
			child = _fromHTML(child);
			if (child) {
				jml.push(child);
			}
		}
		return true;
	}
	return false;
}

// TODO any other characters?
function _isPrintable(str) {
	var patt = new RegExp(/[^\u200c\u200d\u200e\u200f]+/gm);
	return patt.test(str);
}

function generateID() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
}