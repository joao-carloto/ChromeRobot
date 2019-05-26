// Gets the preferences regarding creation and usage of variables
var varPreferences = {};

var varDefaultPref = {
    createVarInput: true,
    useVarInput: true,
    createVarLoc: false,
    useVarLoc: false
};

chrome.storage.sync.get('varPreferences', function (result) {
	if (result.varPreferences) {
		varPreferences = result.varPreferences;
	} else {
		varPreferences = varDefaultPref;
	}
});

// Adds a listener for change on preferences, regarding creation and usage of variables
chrome.storage.onChanged.addListener(function(changes, area) {
	if(area == "sync" && changes.varPreferences) {
		varPreferences = changes.varPreferences.newValue;
	}
});

// Gets the defined variables and respective values 
// Only for this application instance (variablesTabDomain)
var variables = [];

chrome.storage.local.get(variablesTabDomain, function (result) {
	if(result[variablesTabDomain]) {
		variables = result[variablesTabDomain];
	}
});

// Adds a listener for changes on the variable list
// Variables can be created automatically or manually 
chrome.storage.onChanged.addListener(function(changes, area) {
    if (area == "local" && variablesTabDomain in changes) {
        variables = changes[variablesTabDomain].newValue;
    }
});

//TODO improve this
function createVarNameForInput(element) {
	var sufix = "";
	if (arguments.length > 1) {
		element = arguments[0];
		sufix = arguments[1];
	}
	var varName;
	if (element.tagName == "INPUT" &&
		element.placeholder &&
		element.placeholder !== "") {
		varName = element.placeholder;
	} else if (element.tagName == "SELECT") {
		var selText = "";
		var nodes = element.parentNode.childNodes;
		for (var i = 0; i < nodes.length; ++i) {
			if (nodes[i].nodeType === 3 && nodes[i].wholeText.trim() !== "") { // 3 means "text"
				selText += nodes[i].wholeText + " ";
			}
		}
		if (selText !== "") {
			varName = selText;
		}
	}
	if (varName === undefined) {
		var nearTextElement = getNearTextElement(element);
		if (nearTextElement) {
			var label = getLabel(element, nearTextElement);
			if (label && label.textContent.length > 0) {
				varName = label.textContent;
			} else {
				editableXPath = ".//*[@contenteditable = 'true']";
				var xPathResult = nearTextElement.ownerDocument.
				evaluate(editableXPath, nearTextElement, null, 0, null);
				var matchedNode = xPathResult.iterateNext();
				if (matchedNode) {
					//Exclude text of children
					varName = nearTextElement.childNodes[0].nodeValue;
				} else {
					//Include text of children
					varName = nearTextElement.textContent;
				}
			}
		}
	}
	if (varName !== undefined) {
		varName = varName.toLowerCase();
		varName = varName.trim();
		varName = varName.replace(/\s{1,}/g, "_");
		var regex = new XRegExp("[^\\p{N}\\p{L}-_]", "g");
		varName = XRegExp.replace(varName, regex, "");
		varName = varName.replace(/-{2,}/g, "_").replace(/^-|-$/g, "");
		varName = varName.substring(0, 63);
	}
	if (varName === undefined || varName == "")
	{
		varName = "var-name";
	}
	
	varName = varName + sufix;
	varName = indexVarName(varName);
	return varName;
}

function createVarNameFromText(element) {
	var sufix = "";
	if (arguments.length > 1) {
		element = arguments[0];
		sufix = arguments[1];
	}
	var varName;
	if (element.tagName == "INPUT" &&
		element.placeholder &&
		element.placeholder !== "") {
		varName = element.placeholder;
	} else if (element.tagName == "SELECT") {
		var selText = "";
		var nodes = element.parentNode.childNodes;
		for (var i = 0; i < nodes.length; ++i) {
			if (nodes[i].nodeType === 3 && nodes[i].wholeText.trim() !== "") { // 3 means "text"
				selText += nodes[i].wholeText + " ";
			}
		}
		if (selText !== "") {
			varName = selText;
		}
	} else if (element.tagName == "IMG" &&
		element.alt &&
		element.alt !== "") {
		varName = element.alt;
	} else if (!varName && element.textContent) {
		varName = element.textContent;
		varName = varName.toLowerCase();
		varName = varName.trim();
		varName = varName.replace(/\s{1,}/g, "_");
		var regex = new XRegExp("[^\\p{N}\\p{L}-_]", "g");
		varName = XRegExp.replace(varName, regex, "");
		varName = varName.replace(/-{2,}/g, "_").replace(/^-|-$/g, "");
		varName = varName.substring(0, 63);
	}
	if (!varName || varName === "") {
		varName = null;
	} else {
		varName = varName + sufix;
		varName = indexVarName(varName);
	}
	return varName;
}

//TODO review this
function indexVarName(varName) {
	for (var i = 0; i < variables.length; i++) {
		if (varNameExists(varName)) {
			varName = varName.replace(/(-*\d*)$/, "");
			varName = varName + "_" + (i + 2);
		} else {
			break;
		}
	}
	return varName;
}

function addVariable(name, value) {
	// Update localy immediately before updating globaly, since we might be on a immediate use after creation scenario
	variables.push({"varName": name, "varValue": value});
    chrome.runtime.sendMessage({
        newVarName: name,
        newVarValue: value.toString() //might be an int in case of selectio option index
	});
}

// TODO what was the purpose of this anyway?
function onlyScalarVariables(str) { 
	var lines = str.split(/\r?\n/);
	for (var i = 0; i < lines.length; i++) {
		//Scalar variables
		if (lines[i].match(/\${.*}/)) {
			//Do nothing
		} 
		//Empty lines
		else if (lines[i].match(/^\s*$/)) {
			//Do nothing
		} else {
			return false;
		}
	}
	return true;
}

function getVarNameFromValue(value) {
	for (var i = 0; i < variables.length; i++) {
		if (value == variables[i].varValue) {
			console.log("Variable found: " + variables[i].varName + "   " + value);
			return variables[i].varName;
		}
	}
	return null;
}

function setFocusedVarName(event) {
	Application.storage.set("focusedVarName", event.target.value);
}

function varNameExists(varName) {
	for (var i = 0; i < variables.length; i++) {
		console.log("variables[i].varName: " + variables[i].varName);
		if (varName.toLowerCase() == variables[i].varName.toLowerCase()) {
			return true;
		}
	}
	return false;
}