// We have to check if there is any text selected before trying to add the steps.
var textRelatedKeywords = [
    "kwPageShouldContain",
    "kwPageShouldNotContain",
    "kwWaitUntilPageContains"
];

// We should only send these steps to the top level document to avoid duplicates
var urlRelatedKeywords = [
    "kwOpenBrowser",
    "kwGoTo",
    "kwGoBack",
    "kwLocationShouldBe",
    "kwReloadPage",
    "kwCloseBrowser",
    "kwCloseAllBrowsers",
    "kwSetWindowSize",
    "kwUnselectFrame"
];

// We have to check if there are any elements inside frames before trying to add these steps.
var frameRelatedKeywords = [
    "kwSelectFrame",
    "kwCurrentFrameContains",
    "kwCurrentFrameShouldNotContain",
    "kwFrameShouldContain",
];

// We have to check if there are any inputs selected before trying to add these steps.
var inputRelatedKeywords = [
    "kwElementShouldBeEnabled",
    "kwElementShouldBeDisabled"
];

var framesList = [];
var selectedElementsInfo = [];
var mainPageURL;
var publicConnection;

var selectedElementsCount = 0;
var textFragmentsCount = 0;
var selectedElementsInFrameCount = 0;
var selectedInputsCount = 0;

(function createChannel() {
    // Create a port with background page for continous message communication
    var backgroundPageConnection = chrome.runtime.connect({
        name: "panel"
    });

    // Register extension panel instance within the background page, using the inspected tab id.
    chrome.tabs.getCurrent(function(tab){ 
        backgroundPageConnection.postMessage({
            name: 'init',
            tabId: chrome.devtools.inspectedWindow.tabId,
        });
    });

    publicConnection = backgroundPageConnection;

    // Listen to messages from the background page
    backgroundPageConnection.onMessage.addListener(function(message) {
        var alertMsg;

        if (message.step) {
            $("#testCasesArea").jqxTextArea('val', 
                $("#testCasesArea").jqxTextArea('val') +
                "\t" +
                message.step +
                "\n"
            );
            var testCasesArea = document.getElementById("testCasesAreaTextArea");
            testCasesArea.scrollTop = testCasesArea.scrollHeight;
        } else if (message.counters) {
            if (message.counters.addToSelectedElementsCount) {
                selectedElementsCount += message.counters.addToSelectedElementsCount;
            } else if (message.counters.addToTextFragmentsCount) {
                textFragmentsCount += message.counters.addToTextFragmentsCount;
            } else if (message.counters.addToSelElementsInFrameCount) {
               // selectedElementsInFrameCount += message.counters.addToSelElementsInFrameCount;
            } else if (message.counters.addToSelInputsCount) {
                selectedInputsCount += message.counters.addToSelInputsCount;
            }
        } else if (message.keyword) {
            if (textRelatedKeywords.indexOf(message.keyword) > -1) {

                if (textFragmentsCount == 0) {
                    alertMsg = chrome.i18n.getMessage("no_el_with_text");
                    chrome.devtools.inspectedWindow.eval("alert('" + alertMsg + "')", {
                        useContentScriptContext: true
                    });
                } else {
                    sendObjectToInspectedPage({
                        action: "code",
                        content: message.keyword + "()"
                    });
                }
            } else if (urlRelatedKeywords.indexOf(message.keyword) > -1) {
                chrome.devtools.inspectedWindow.eval(message.keyword + "()", {
                    useContentScriptContext: true
                });
            } else if (frameRelatedKeywords.indexOf(message.keyword) > -1) {
                //TODO Missing validation for elements inside frame and without text (for text related keywords)
                if (selectedElementsInFrameCount == 0) {
                    alertMsg = chrome.i18n.getMessage("no_frame_select");
                    chrome.devtools.inspectedWindow.eval("alert('" + alertMsg + "')", {
                        useContentScriptContext: true
                    });
                } else {
                    sendObjectToInspectedPage({
                        action: "code",
                        content: message.keyword + "()"
                    });
                }
            } else if (inputRelatedKeywords.indexOf(message.keyword) > -1) {
                if (selectedInputsCount == 0) {
                    alertMsg= chrome.i18n.getMessage("no_input_select");
                    chrome.devtools.inspectedWindow.eval("alert('" + alertMsg + "')", {
                        useContentScriptContext: true
                    });
                } else {
                    sendObjectToInspectedPage({
                        action: "code",
                        content: message.keyword + "()"
                    });
                }
            } else {
                if (selectedElementsCount == 0) {
                    alertMsg = chrome.i18n.getMessage("no_el_select");
                    chrome.devtools.inspectedWindow.eval("alert('" + alertMsg + "')", {
                        useContentScriptContext: true
                    });
                } else {
                    sendObjectToInspectedPage({
                        action: "code",
                        content: message.keyword + "()"
                    });
                }
            }
        } else if (message.unloading) {
            // Maybe only one of the documents unloaded
            // We have to tell the documents in other iframes
            sendObjectToInspectedPage({
                action: "code",
                content: "removeSelectContext()"
            });
            clearSectedElements();
            selectModeOn = false;
            $('#selectButton').jqxToggleButton({ toggled: false });
        } else if (message.parentLocationHref) {
            framesList.push(message);
        } else if (message.newVarName) {
            _addVar(message.newVarName, message.newVarValue);
        } else if (message.elHTML) {
            for (var i = 0; i < selectedElementsInfo.length; i++) {
                if (selectedElementsInfo[i].documentID == message.documentID) {
                    selectedElementsInfo.splice(i, 1);
                    i--;
                }
            }
            selectedElementsInfo.push(message);
            selectedElementsInfo.sort(_compareElementLists);
            _updateHTMLConsole(selectedElementsInfo);
        } else if (message.codeToAllFrames) {
            sendObjectToInspectedPage({
                action: "code",
                content: message.codeToAllFrames
            });
        } else if (message.toggleSelect) {
            toggleSelectMode();
        } else if (message.clearSelected) {
            clearSectedElements();
            sendObjectToInspectedPage({
                action: "code",
                content: "clearLocalSelections()"
            });
        }
    });
}());

// This sends an object to the background page 
// where it can be relayed to the inspected page
function sendObjectToInspectedPage(message) {
    message.tabId = chrome.devtools.inspectedWindow.tabId;
    publicConnection.postMessage(message);
}

function _updateHTMLConsole(selectedElementsInfo) {
            selectedElementsInFrameCount = 0;
            var html = "";
            for (var i = 0; i < selectedElementsInfo.length; i++) {
                for (var j = 0; j < selectedElementsInfo[i].elHTML.length; j++) {
                    if (i > 0 || j > 0) html += "\n(...)\n";
                    if (selectedElementsInfo[i].containerLocator != undefined) {
                        html += "<!-- Element contained in iframe with locator: " +
                            selectedElementsInfo[i].containerLocator +
                            " -->\n";
                        selectedElementsInFrameCount++;
                    }
                    html += selectedElementsInfo[i].elHTML[j];
                }
            }
            $("#htmlArea").jqxTextArea('val', html);
            // Scroll down
            var htmlArea = document.getElementById("htmlAreaTextArea");
            htmlArea.scrollTop = htmlArea.scrollHeight;
}

function _compareElementLists(a, b) {
    for (var i = 0; i < framesList.length; i++) {
        if (a.src == framesList[i].frameSrc && b.src == framesList[i].parentLocationHref) {
            return 1;
        } else if (b.src == framesList[i].frameSrc && a.src == framesList[i].parentLocationHref) {
            return -1;
        }
        return 0;
    }
}