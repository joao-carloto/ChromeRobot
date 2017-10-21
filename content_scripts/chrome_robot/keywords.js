function kwPageShouldContain() {
    _addTextVerifications("Page Should Contain");
}

function kwPageShouldNotContain() {
    _addTextVerifications("Page Should Not Contain");
}

function kwPageShouldContainSmart() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        var step = "Page Should Contain ";
        if (el.tagName == "A") {
            step += "Link";
        } else if (el.tagName == "BUTTON" ||
            (el.tagName == "INPUT" && (el.type == "button" || el.type == "submit"))) {
            step += "Button";
        } else if (el.tagName == "INPUT" && el.type == "text") {
            step += "Textfield";
        } else if (el.tagName == "INPUT" && el.type == "radio") {
            step += "Radio Button";
        } else if (el.tagName == "INPUT" && el.type == "checkbox") {
            step += "Checkbox";
        } else if (el.tagName == "IMG") {
            step += "Image";
        } else if (el.tagName == "SELECT") {
            step += "List";
        } else {
            step += "Element";
        }
        step += "   \t" + getLocator(el);
        _addStepToTest(step);
    }
}

function kwPageShouldNotContainSmart() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        var step = "Page Should Not Contain ";
        if (el.tagName == "A") {
            step += "Link";
        } else if (el.tagName == "BUTTON" ||
            (el.tagName == "INPUT" && (el.type == "button" || el.type == "submit"))) {
            step += "Button";
        } else if (el.tagName == "INPUT" && el.type == "text") {
            step += "Textfield";
        } else if (el.tagName == "INPUT" && el.type == "radio") {
            step += "Radio Button";
        } else if (el.tagName == "INPUT" && el.type == "checkbox") {
            step += "Checkbox";
        } else if (el.tagName == "IMG") {
            step += "Image";
        } else if (el.tagName == "SELECT") {
            step += "Page Should Not Contain List";
        } else {
            step += "Element";
        }
        step += "   \t" + getLocator(el);
        _addStepToTest(step);
    }
}

function kwClickSmart() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        var step = "Click ";
        if (el.tagName == "A") {
            step += "Link";
        } else if (el.tagName == "BUTTON" ||
            (el.tagName == "INPUT" && (el.type == "button" || el.type == "submit"))) {
            step += "Button";
        } else if (el.tagName == "IMG") {
            step += "Image";
        } else {
            step += "Element";
        }
        step += "   \t" + getLocator(el);
        _addStepToTest(step);
    }
}

function kwOpenContext() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Open Context Menu   \t" + getLocatorForGenericElement(el));
    }
}

function kwPressKey() {
    document.addEventListener("keydown", _checkDownKey);
    document.addEventListener("keypress", _checkPressedKey);
}

function _checkDownKey(e) {
    if (e.which) {
        var keynum;
        var doc;
        var key;
        if (e.which < 33 || e.which == 127) {
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();
            key = "\\\\\\\\" + e.which;
        } else {
            document.removeEventListener("keydown", _checkDownKey);
            return;
        }
        var code = "broadcastPressedKey('" + key + "');";
        chrome.runtime.sendMessage({codeToAllFrames: code});
    }
    document.removeEventListener("keydown", _checkDownKey);
    document.removeEventListener("keypress", _checkPressedKey);
}

function _checkPressedKey(e) {
    if (e.which) {
        var keynum;
        var key;
        var keyLetter = String.fromCharCode(e.charCode);
        var printable = XRegExp('[^\x00-\x1F\x7F]');
        var isPrintable = printable.test(keyLetter);
        if (isPrintable) {
            key = keyLetter;
        } else {
            document.removeEventListener("keypress", _checkPressedKey);
            return;
        }
        var code = "broadcastPressedKey('" + key + "');";
        chrome.runtime.sendMessage({codeToAllFrames: code});
    }
    document.removeEventListener("keydown", _checkDownKey);
    document.removeEventListener("keypress", _checkPressedKey);
}

// We need this because we are not listening to pressed keys inside iframes, just the top document.
function broadcastPressedKey(key) {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Press Key   \t" + getLocatorForGenericElement(el) + "   \t" + key);
    }
}

function kwFocus() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Focus   \t" + getLocatorForGenericElement(el));
    }
}

function kwMouseDownSmart() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        var step = "Mouse Down ";
        if (el.tagName == "A") {
            step += "On Link";
        } else if (el.tagName == "IMG") {
            step += "On Image";
        }
        step += "   \t" + getLocator(el);
        _addStepToTest(step);
    }
}

function kwMouseUp() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Mouse Up   \t" + getLocatorForGenericElement(el));
    }
}

function kwMouseOver() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Mouse Over   \t" + getLocatorForGenericElement(el));
    }
}

function kwMouseOut() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Mouse Out   \t" + getLocatorForGenericElement(el));
    }
}

function kwWaitUntilPageContains() {
    _addTextVerifications("Wait Until Page Contains");
}

function kwWaitUntilPageContainsElement() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Wait Until Page Contains Element   \t" + getLocatorForGenericElement(el));
    }
}

function kwWaitUntilElementIsVisible() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Wait Until Element Is Visible   \t" + getLocatorForGenericElement(el));
    }
}

function kwElementShouldBeEnabled() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        if (el.tagName == "INPUT") {
            _addStepToTest("Element Should Be Enabled   \t" + getLocatorForGenericElement(el));
        }
    }
}

function kwElementShouldBeDisabled() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        if (el.tagName == "INPUT") {
            _addStepToTest("Element Should Be Disabled   \t" + getLocatorForGenericElement(el));
        }
    }
}

//TODO Not Used. The selenium webriver interpretation of element.text seems a bit unpredictable,
//particullarly concerning line breaks.
//Could not yet acheive algorithm that would emulate it.
/*
function kwElementTextShouldBe() {
	var selectedElements = Application.storage.get("selectedElements", undefined);
	var numElWithText = 0;
	for (var i = 0; i < selectedElements.length; i++) {
		var el = selectedElements[i];
		var elText = getElementText(el);
		if (elText) {
			elText = escapeRobot(elText);
			elText = escapeSpace(elText);
			_addStepToTest("Element Text Should Be  \t" + getLocatorForGenericElement(el)  + "  \t" + elText);
			numElWithText++;
		}
	}
}
*/

function kwElementShouldBeVisible() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Element Should Be Visible   \t" + getLocatorForGenericElement(el));
    }
}

function kwElementShouldNotBeVisible() {
    for (var i = 0; i < selectedElements.length; i++) {
        var el = selectedElements[i];
        _addStepToTest("Element Should Not Be Visible   \t" + getLocatorForGenericElement(el));
    }
}

function kwSelectFrame() {
    if (selectedElements.length > 0 && selectedElements[0].containerLocator) {
        _addStepToTest("Select Frame   \t" + selectedElements[0].containerLocator);
    }
}

function kwCurrentFrameContains() {
    if (selectedElements.length > 0 && selectedElements[0].containerLocator) {
        for (var i = 0; i < selectedElements.length; i++) {
            if (selectedElements[i].textFragments) {
                for (var j = 0; j < selectedElements[i].textFragments.length; j++) {
                    var useVar = varPreferences.useVarInput;
                    if (useVar) {
                        var varName = getVarNameFromValue(selectedElements[i].textFragments[j]);
                        if (varName) {
                            _addStepToTest("Current Frame Contains   \t${" + varName + "}");
                        } else {
                            _addStepToTest("Current Frame Contains   \t" + selectedElements[i].textFragments[j]);
                        }
                    } else {
                        _addStepToTest("Current Frame Contains   \t" + selectedElements[i].textFragments[j]);
                    }
                }
            }
        }
    }
}

function kwCurrentFrameShouldNotContain() {
    if (selectedElements.length > 0 && selectedElements[0].containerLocator) {
        for (var i = 0; i < selectedElements.length; i++) {
            if (selectedElements[i].textFragments) {
                for (var j = 0; j < selectedElements[i].textFragments.length; j++) {
                    var useVar = varPreferences.useVarInput;
                    if (useVar) {
                        var varName = getVarNameFromValue(selectedElements[i].textFragments[j]);
                        if (varName) {
                            _addStepToTest("Current Frame Should Not Contain   \t${" + varName + "}");
                        } else {
                            _addStepToTest("Current Frame Should Not Contain  \t" + selectedElements[i].textFragments[j]);
                        }
                    } else {
                        _addStepToTest("Current Frame Should Not Contain  \t" + selectedElements[i].textFragments[j]);
                    }
                }
            }
        }
    }
}

function kwFrameShouldContain() {
    if (selectedElements.length > 0 && selectedElements[0].containerLocator) {
        for (var i = 0; i < selectedElements.length; i++) {
            if (selectedElements[i].textFragments) {
                for (var j = 0; j < selectedElements[i].textFragments.length; j++) {
                    var useVar = varPreferences.useVarInput;
                    if (useVar) {
                        var varName = getVarNameFromValue(selectedElements[i].textFragments[j]);
                        if (varName) {
                            _addStepToTest("Frame Should Contain   \t" +
                                selectedElements[0].containerLocator +
                                "   \t${" + varName + "}");
                        } else {
                            _addStepToTest("Frame Should Contain   \t" +
                                selectedElements[0].containerLocator +
                                "  \t" + selectedElements[i].textFragments[j]);
                        }
                    } else {
                        _addStepToTest("Frame Should Contain   \t" +
                            selectedElements[0].containerLocator +
                            "   \t" + selectedElements[i].textFragments[j]);
                    }
                }
            }
        }
    }
}

function kwUnselectFrame() {
    _addStepToTest("Unselect Frame");
}

function kwOpenBrowser() {
    var url = getURL();
    url = escapeSpace(url);
    var step = "Open Browser  \t" + url;
    var useVar = varPreferences.useVarInput;
    if (useVar && varNameExists("BROWSER")) {
        step += "   \t${BROWSER}";
    } else {
        step += "   \tChrome";
    }
    _addStepToTest(step);
}

function kwGoTo() {
    var url = getURL();
    _addStepToTest("Go To   \t" + url);
}

function kwGoBack() {
    _addStepToTest("Go Back");
}

function kwLocationShouldBe() {
    var url = getURL();
    _addStepToTest("Location Should be  \t" + url);
}

function kwReloadPage() {
    _addStepToTest("Reload Page");
}

function kwCloseBrowser() {
    _addStepToTest("Close Browser");
}

function kwCloseAllBrowsers() {
    _addStepToTest("Close All Browsers");
}

function kwSetWindowSize() {
    _addStepToTest("Set window Size  \t" + window.innerWidth + "  \t" + window.innerHeight);
}

function kwFillForm() {
    for (var i = 0; i < selectedElements.length; i++) {
        var selElement = selectedElements[i];

        //The selection itself is a form element
        if (selElement.tagName == "INPUT" ||
            selElement.tagName == "SELECT" ||
            selElement.tagName == "TEXTAREA" ||
            selElement.getAttribute("contenteditable") == "true"
        ) {
            _fillFormElement(selElement);
        }
        //If not, look for form elements inside selection
        else {
            if (selElement.tagName == "FRAME" || selElement.tagName == "IFRAME") {
                selElement = selElement.contentWindow.document.body;
            }

            var formElementsXPath = ".//input|.//select|.//textarea|.//*[@contenteditable='true']";
            var elContainingDocument = selElement.ownerDocument;
            var xPathResult = elContainingDocument.evaluate(formElementsXPath,
                selElement,
                null,
                0,
                null);
            var matchedNode = xPathResult.iterateNext();

            while (matchedNode) {
                if (isVisible(matchedNode)) {
                    _fillFormElement(matchedNode);
                }
                matchedNode = xPathResult.iterateNext();
            }
        }
    }
}

function kwCheckForm() {
    for (var i = 0; i < selectedElements.length; i++) {
        var selElement = selectedElements[i];

        //The selection itself is a form element
        if (selElement.tagName == "INPUT" || selElement.tagName == "SELECT" ||
            selElement.tagName == "TEXTAREA") {
            _checkFormElement(selElement);
        }
        else {
            if (selElement.tagName == "FRAME" || selElement.tagName == "IFRAME") {
                selElement = selElement.contentWindow.document.body;
            }

            var formElementsXPath = ".//input|.//select|.//textarea";
            var elContainingDocument = selElement.ownerDocument;
            var xPathResult = elContainingDocument.evaluate(formElementsXPath,
                selElement,
                null,
                0,
                null);

            var matchedNode = xPathResult.iterateNext();
            while (matchedNode) {
                if (isVisible(matchedNode)) {
                    _checkFormElement(matchedNode);
                }
                matchedNode = xPathResult.iterateNext();
            }
        }
    }
}

function _fillFormElement(element) {
    var createVar = varPreferences.createVarInput;
    var useVar = varPreferences.useVarInput;
    var testStep;
    var varName;
    var boxText;
    if (element.tagName == "INPUT" &&
        !_isReadOnly(element) &&
        !_isDisabled(element)) {
        if ((element.type == "text" ||
            element.type == "email" ||
            element.type == "tel" ||
            element.type == "url" ||
            element.type == "search" ||
            element.type == "color" ||
            element.type == "number" ||
            element.type == "range" ||
            element.type == "date" ||
            element.type === undefined) &&
            element.value) {
            testStep = "Input Text   \t" +
                getLocator(element) +
                "   \t";
            boxText = element.value;
            boxText = escapeRobot(boxText);
            boxText = escapeSpace(boxText);
            if (useVar || createVar) {
                varName = getVarNameFromValue(boxText);
            }
            if (createVar && !varName) {
                varName = createVarNameForInput(element);
                addVariable(varName, boxText);
            }
            if (useVar && varName) {
                _addStepToTest(testStep + "${" + varName + "}");
            } else {
                _addStepToTest(testStep + boxText);
            }
        } else if (element.type == "checkbox" && element.checked) {
            _addStepToTest("Select Checkbox   \t" + getLocator(element));
        }
        //TODO would this be useful?
        /*
        	else if (element.type == "checkbox" && !element.checked) {
        	_addStepToTest("Unselect Checkbox  \t" + getLocator(element));
        	}
        	*/
        else if (element.type == "radio" && element.checked) {
            _addStepToTest("Select Radio Button   \t" +
                element.name +
                "   \t" +
                element.value);
        } else if (element.type == "password" && element.value) {
            testStep = "Input Password   \t" +
                getLocator(element) +
                "   \t";
            var passText = element.value;
            passText = escapeRobot(passText);
            passText = escapeSpace(passText);
            if (useVar || createVar) {
                varName = getVarNameFromValue(passText);
            }
            if (createVar && !varName) {
                varName = createVarNameForInput(element);
                addVariable(varName, passText);
            }
            if (useVar && varName) {
                _addStepToTest(testStep + "${" + varName + "}");
            } else {
                _addStepToTest(testStep + passText);
            }
        }
    } else if (element.tagName == "TEXTAREA" &&
        element.value &&
        !_isReadOnly(element) &&
        !_isDisabled(element)) {
        testStep = "Input Text   \t" +
            getLocator(element) +
            "   \t";
        var areaText = element.value;
        areaText = escapeRobot(areaText);
        areaText = areaText.replace(/(\r\n|\n|\r)/gm, "\\n");
        areaText = escapeSpace(areaText);

        if (useVar || createVar) {
            varName = getVarNameFromValue(areaText);
        }
        if (createVar && !varName) {
            varName = createVarNameForInput(element);
            addVariable(varName, areaText);
        }
        if (useVar && varName) {
            _addStepToTest(testStep + "${" + varName + "}");
        } else {
            _addStepToTest(testStep + areaText);
        }
    } else if (element.tagName == "SELECT" &&
        !_isDisabled(element)) {
        var elContainingDocument = element.ownerDocument;
        var xPathResult = elContainingDocument.evaluate(".//option",
            element,
            null,
            0,
            null);
        var matchedNode = xPathResult.iterateNext();
        while (matchedNode) {
            if (matchedNode.selected) {
                var locType = getLocatorType(matchedNode);
                var matcheNodeLoc;
                var selectLocator = getLocator(element);

                if (locType == "value") {
                    testStep = "Select From List By Value   \t" +
                        selectLocator +
                        "   \t";
                    matcheNodeLoc = matchedNode.getAttribute("value");
                } else if (locType == "label") {
                    testStep = "Select From List By Label   \t" +
                        selectLocator +
                        "   \t";
                    matcheNodeLoc = matchedNode.label;
                } else if (locType == "index") {
                    testStep = "Select From List By Index   \t" +
                        selectLocator +
                        "   \t";
                    matcheNodeLoc = matchedNode.index;
                } else if (matchedNode.label && matchedNode.label !== "") {
                    testStep = "Select From List By Label   \t" +
                        selectLocator +
                        "   \t";
                    matcheNodeLoc = matchedNode.label;
                }

                if (useVar || createVar) {
                    varName = getVarNameFromValue(matcheNodeLoc);
                }
                if (createVar && !varName) {
                    varName = createVarNameForInput(element);
                    addVariable(varName, matcheNodeLoc);
                }
                if (useVar && varName) {
                    _addStepToTest(testStep + "${" + varName + "}");
                } else {
                    _addStepToTest(testStep + matcheNodeLoc);
                }
            }
            //TODO would this be useful?
            /*
            else {
            		_addStepToTest("Unselect From List\t" + getLocator(element) + "  \t" + getLocator(matchedNode));
            } 
            */
            matchedNode = xPathResult.iterateNext();
        }
    }
    // TODO improve
    // For custom input boxes
    else if (element.getAttribute("contenteditable") == "true" && element.innerHTML !== "") {
        testStep = "Input Text   \t" +
            getLocator(element) +
            "   \t";
        var cleanElement = getCleanClone(element);
        boxText = cleanElement.innerHTML;
        boxText = escapeRobot(boxText).
            replace(/<br>|<br\/>|<p[^>]*>/gmi, "\\n").
            replace(/<[^>]*>/gmi, "").
            replace(/&nbsp;/gmi, " ");
        boxText = escapeSpace(boxText);
        if (useVar || createVar) {
            varName = getVarNameFromValue(boxText);
        }
        if (createVar && !varName) {
            varName = createVarNameForInput(element);
            addVariable(varName, boxText);
        }
        if (useVar && varName) {
            _addStepToTest(testStep + "${" + varName + "}");
        } else {
            _addStepToTest(testStep + boxText);
        }
    }
}

function _checkFormElement(element) {
    var createVar = varPreferences.createVarInput;
    var useVar = varPreferences.useVarInput;
    var testStep;
    var varName;
    var boxText;

    if (element.tagName == "INPUT") {
        if ((element.type == "text" ||
            element.type == "email" ||
            element.type == "tel" ||
            element.type == "url" ||
            element.type == "search" ||
            element.type == "color" ||
            element.type == "number" ||
            element.type == "range" ||
            element.type == "date" ||
            element.type === undefined) &&
            element.value) {
            testStep = "Textfield Value Should Be   \t" +
                getLocator(element) +
                "   \t";
            boxText = element.value;
            boxText = escapeRobot(boxText);
            boxText = escapeSpace(boxText);
            if (useVar || createVar) {
                varName = getVarNameFromValue(boxText);
            }
            if (createVar && !varName) {
                varName = createVarNameForInput(element);
                addVariable(varName, boxText);
            }
            if (useVar && varName) {
                _addStepToTest(testStep + "${" + varName + "}");
            } else {
                _addStepToTest(testStep + boxText);
            }
        } else if (element.type == "checkbox" && element.checked) {
            _addStepToTest("Checkbox Should Be Selected   \t" +
                getLocator(element));
        } else if (element.type == "checkbox" && !element.checked) {
            _addStepToTest("Checkbox Should Not Be Selected   \t" +
                getLocator(element));
            //TODO Use the "radio button should no be selected" keyword?
        } else if (element.type == "radio" && element.checked) {
            _addStepToTest("Radio Button Should Be Set To   \t" +
                element.name +
                "\tvalue=" +
                element.value);
        }
    } else if (element.tagName == "TEXTAREA" && element.value) {
        testStep = "Textarea Value Should Be   \t" +
            getLocator(element) +
            "   \t";
        var areaText = element.value;
        areaText = escapeRobot(areaText);
        areaText = areaText.replace(/(\r\n|\n|\r)/gm, "\\n");
        areaText = escapeSpace(areaText);

        if (useVar || createVar) {
            varName = getVarNameFromValue(areaText);
        }
        if (createVar && !varName) {
            varName = createVarNameForInput(element);
            addVariable(varName, areaText);
        }
        if (useVar && varName) {
            _addStepToTest(testStep + "${" + varName + "}");
        } else {
            _addStepToTest(testStep + areaText);
        }
    } else if (element.tagName == "SELECT") {
        var elContainingDocument = element.ownerDocument;
        var xPathResult = elContainingDocument.evaluate(".//option",
            element,
            null,
            0,
            null);
        var matchedNode = xPathResult.iterateNext();
        while (matchedNode) {
            if (matchedNode.selected) {
                var locType = getLocatorType(matchedNode);
                testStep = "List Selection Should Be   \t" +
                    locator +
                    "   \t";
                var matcheNodeLoc;
                if (locType == "value") {
                    matcheNodeLoc = matchedNode.getAttribute("value");
                } else if (locType == "label") {
                    matcheNodeLoc = matchedNode.label;
                }
                //Index is valid for filling but not for checking, use value as default
                else if (matchedNode.getAttribute("value") &&
                    matchedNode.getAttribute("value") !== "") {
                    matcheNodeLoc = matchedNode.getAttribute("value");
                }
                if (useVar || createVar) {
                    varName = getVarNameFromValue(matcheNodeLoc);
                }
                if (createVar && !varName) {
                    varName = createVarNameForInput(element);
                    addVariable(varName, matcheNodeLoc);
                }
                if (useVar && varName) {
                    _addStepToTest(testStep + "${" + varName + "}");
                } else {
                    _addStepToTest(testStep + matcheNodeLoc);
                }
            }
            matchedNode = xPathResult.iterateNext();
        }
    }
}

function _addTextVerifications(keyword) {
    var textFragments;
    var numTextFragmentInSelection = 0;
    var useVar = varPreferences.useVarInput;
    for (var i = 0; i < selectedElements.length; i++) {
        textFragments = selectedElements[i].textfragments || getTextFragments(selectedElements[i]);
        numTextFragmentInSelection += textFragments.length;
        for (var j = 0; j < textFragments.length; j++) {
            if (useVar) {
                var varName = getVarNameFromValue(textFragments[j]);
                if (varName) {
                    _addStepToTest(keyword + "   \t${" + varName + "}");
                } else {
                    _addStepToTest(keyword + "   \t" + textFragments[j]);
                }
            } else {
                _addStepToTest(keyword + "   \t" + textFragments[j]);
            }
        }
    }
}

function _addStepToTest(step) {
    chrome.runtime.sendMessage({ step: step });
}

function _isReadOnly(element) {
    return element.readOnly || element.getAttribute("readonly") == "readonly";
}

function _isDisabled(element) {
    return element.disabled || element.getAttribute("disabled") == "disabled";
}