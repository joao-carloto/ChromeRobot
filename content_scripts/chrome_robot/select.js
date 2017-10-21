var selectedElements = [];
var overElement;

var documentID = generateID();

setSelectContext();

window.addEventListener("beforeunload", function(event) {
    chrome.runtime.sendMessage({
        unloading: window.location.href
    });
});

function setSelectContext() {
    _addEventListners(document);
}

function removeSelectContext() {
    if (overElement) {
        overElement.style.outline = overElement.originalOutline;
    }
    overElement = undefined;
    clearLocalSelections();
    _removeEventListners(document);
}

function clearLocalSelections() {
    for (var i = 0; i < selectedElements.length; i++) {
        try {
            selectedElements[i].isSelected = false;
            selectedElements[i].style.outline = selectedElements[i].originalOutline;
        } catch (error) {
            //Object might be dead due to reload. Do nothing.
        }
    }
    selectedElements = [];
}

function _addEventListners(doc) {
    doc.body.style.border = "5px dashed lightBlue";
    doc.addEventListener('click', _selectElement, true);
    doc.addEventListener('mouseover', _overElement, true);
    doc.addEventListener('mouseout', _outElement, true);
    doc.addEventListener('mouseup', _blockMouseUpDown, true);
    doc.addEventListener('mousedown', _blockMouseUpDown, true);
    doc.addEventListener('keydown', _keyDown, true);

    var docWindow = doc.defaultView || doc.parentWindow;
    docWindow.addEventListener('unload', removeSelectContext, true);
}

function _removeEventListners(doc) {
    doc.body.style.border = "";

    doc.removeEventListener('click', _selectElement, true);
    doc.removeEventListener('mouseover', _overElement, true);
    doc.removeEventListener('mouseout', _outElement, true);
    doc.removeEventListener('mouseup', _blockMouseUpDown, true);
    doc.removeEventListener('mousedown', _blockMouseUpDown, true);
    doc.removeEventListener('keydown', _keyDown, true);

    docWindow = doc.defaultView || doc.parentWindow;
    docWindow.removeEventListener('unload', removeSelectContext, true);
}

function _selectElement(e) {
    if (e.which == 1) {
        e.stopImmediatePropagation();
        e.stopPropagation();
        e.preventDefault();
        var el = e.target;
        //Only allow the body 
        if (el.tagName == "HTML") return;
        if (el.outerHTML.substring(1, el.outerHTML.indexOf(">")).indexOf("xmlns=\"http://www.w3.org/1999/xhtml\"") != -1) {
            alert(chrome.i18n.getMessage("no_xhtml"));
            return;
        }
        if (!el.isSelected) {
            if (!el.originalHTML) el.originalHTML = el.outerHTML;
            el.isSelected = true;
            el.style.outline = "dashed blue 2px";
            if (el.xpath === undefined) attachTextBasedXPath(el);
            if (el.textFragments === undefined) {
                attachTextFragments(el);
            } else {
                addToTextFragmentsCount(el.textFragments.length);
            }
            if(el.tagName == "INPUT") {
                _addToSelInputsCount(1);
            }
            var containerIndexes = [];
            _getElementContainer(el, containerIndexes);
            el.containerIndexes = containerIndexes;
            selectedElements.push(el);
            selectedElements.sort(_compareElements);
            _addToSelectedElementsCount(1);
            _sendSelectedElToGUI();
        } else {
            // Revert element status
            el.isSelected = false;
            el.style.outline = el.originalOutline;

            // Decrease element counters
            _addToSelectedElementsCount(-1);
            addToTextFragmentsCount(-1 * el.textFragments.length);

          //  if (el.containerLocator) _addToSelItemsInFrameCount(-1);
            if (el.tagName == "INPUT") _addToSelInputsCount(-1);

            // Update selected elements list
            var index = selectedElements.indexOf(el);
            if (index > -1) {
                selectedElements.splice(index, 1);
            }

            // Update UI
            _sendSelectedElToGUI();
        }
    }
}

function _sendSelectedElToGUI() {
    var selectedElInfo = {};
    var selectedElHTML = [];

    selectedElInfo.documentID = documentID;
    // TODO review
    // what about if it's undefined 
    selectedElInfo.src = window.location.href;

   if(selectedElements[0] && selectedElements[0].containerLocator){
        selectedElInfo.containerLocator = selectedElements[0].containerLocator;
   }

    for (var i = 0; i < selectedElements.length; i++) {
        selectedElHTML.push(selectedElements[i].originalHTML);
    }
    selectedElInfo.elHTML = selectedElHTML;
    chrome.runtime.sendMessage(selectedElInfo);
}

function _sendMyURL() {
    return window.location.href;
}

function _addToSelectedElementsCount(value) {
    chrome.runtime.sendMessage({'counters': {'addToSelectedElementsCount': value}});
}

function addToTextFragmentsCount(value) {
    chrome.runtime.sendMessage({'counters': {'addToTextFragmentsCount': value}});
}

function _addToSelItemsInFrameCount(value) {
    chrome.runtime.sendMessage({'counters': {'addToSelElementsInFrameCount': value}});
}

function _addToSelInputsCount(value) {
    chrome.runtime.sendMessage({'counters': {'addToSelInputsCount': value}});
}

function _getElementContainer(element, elementContainerIndexes) {
    var elContainingDocument = element.ownerDocument;
    var xpath = element.xpath || getTextBasedXPath(element);
    var xPathResult = elContainingDocument.evaluate("count(" +
        xpath +
        "/preceding::*)",
        elContainingDocument,
        null,
        0,
        null);
    elementContainerIndexes.push(xPathResult.numberValue + 1);

    var elContainingWindow = elContainingDocument.defaultView;

    // This option only works for documents inside the same domain
    if (elContainingWindow.frameElement) {
        element.containerLocator = justGetLocator(elContainingWindow.frameElement);
        _sendSelectedElToGUI();      
    } 
    // If not on the same domain (or if on top level document) we use this sketchy strategy
    // We ask all documents if they have a iframe with this particular src value.
    else {
        var code = "_getFrameElementFromSrc('" + elContainingWindow.location + "')";
        chrome.runtime.sendMessage({codeToAllFrames: code});
    }
}

function _getFrameElementFromSrc(absolutePath) {
    var relativePath = absolutePath.split('/').pop().trim(); 

    var xpath = ".//iframe[@src='" + absolutePath + "']" +
     "|.//frame[@src='" + absolutePath + "']" +
     "|.//iframe[@src='" + relativePath + "']" +
     "|.//frame[@src='" + relativePath + "']";

    xPathResult = document.evaluate(xpath, document.body, null, 0, null);
    var matchedNode = xPathResult.iterateNext();
    //TODO assumes ther will be only one
    if (matchedNode) {
        var loc = justGetLocator(matchedNode);
        loc = loc.replace(/"/g, '\\"');
        var code = "_updateContainerLocator(\"" + absolutePath + "\", \"" + loc + "\")";

        chrome.runtime.sendMessage({codeToAllFrames: code});

        chrome.runtime.sendMessage({
            parentLocationHref: location.href,
            frameSrc: absolutePath});
    }
}

function _updateContainerLocator(src, loc) {
if (window.location.href.localeCompare(src) == 0) {
        for (var i = 0; i < selectedElements.length; i++) {
            selectedElements[i].containerLocator = loc;
        }
        _sendSelectedElToGUI();
    }
}

function _compareElements(a, b) {
    for (var i = 0; i < a.containerIndexes.length; i++) {
        if (a.containerIndexes[i] < b.containerIndexes[i]) {
            return -1;
        } else if (a.containerIndexes[i] > b.containerIndexes[i]) {
            return 1;
        }
    }
    return 0;
}

function _setContextMenu(e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
}

function _overElement(e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    var el = e.target;
    if (!el.originalHTML) {
        el.originalHTML = e.target.outerHTML;
    }
    if (typeof el.originalOutline === 'undefined') {
        if(el.style && el.style.outline) 
        {
            el.originalOutline = el.style.outline;
        } else {
            el.originalOutline = null;
        }
    }
    if (selectedElements.indexOf(el) == -1) {
        el.style.outline = "solid lightBlue 2px";
    }
}

function _outElement(e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
    var el = e.target;
    if (selectedElements.indexOf(el) == -1) {
        el.style.outline = el.originalOutline;
    }
}

function _keyDown(e) {
    e = e || window.event;
    // 27 is the ESC key code
    if (e.keyCode == 27) {
        //clearLocalSelections();
        chrome.runtime.sendMessage({clearSelected: "clearSelected"});
    }
}

function _blockMouseUpDown(e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    e.preventDefault();
}
