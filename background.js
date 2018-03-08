// Clears any variable list that might have been stored previously.
// TODO could this be problematic by interfering with other extensions?
chrome.storage.local.clear();

var connections = {};

chrome.runtime.onConnect.addListener(function (port) {
    var extensionListener = function (message, sender, sendResponse) {
        // The original connection event doesn't include the tab ID of the
        // DevTools page, so we need to send it explicitly.
        if (message.name == "init") {
            connections[message.tabId] = port;
            var size = Object.keys(connections).length;
            if (size == 1) {
                createContextMenu();
            }
            return;
        }
        // Other message handling
        if (message.tabId && message.content) {
            // Evaluate script in inspectedPage
            if (message.action === 'code') {
                chrome.tabs.executeScript(message.tabId, {
                    code: message.content,
                    allFrames: true
                });
                // Attach script to inspectedPage
            } else if (message.action === 'script') {
                chrome.tabs.executeScript(message.tabId, {
                    file: message.content,
                    allFrames: true
                });
                // Pass message to inspectedPage
            } else {
                chrome.tabs.sendMessage(message.tabId, message, sendResponse);
            }
        }
        else {
            message.tabId = sender.tab.id;
            port.postMessage(message);
        }
    };
    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function (port) {
        port.onMessage.removeListener(extensionListener);
        var tabs = Object.keys(connections);
        for (var i = 0, len = tabs.length; i < len; i++) {
            if (connections[tabs[i]] == port) {
                chrome.tabs.executeScript(parseInt(tabs[i]), {
                    code: "removeSelectContext()",
                    allFrames: true
                });
                delete connections[tabs[i]];
                break;
            }
        }
        var size = Object.keys(connections).length;
        if (size == 0) {
            chrome.contextMenus.removeAll();
        }
    });
});

// Receive message from content script and relay to the devTools page for the
// current tab
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    // Messages from content scripts should have sender.tab set
    if (sender.tab) {
        var tabId = sender.tab.id;
        if (tabId in connections) {
            connections[tabId].postMessage(request);
            console.log("request: " + JSON.stringify(request)); 
        } else {
            console.log("Tab not found in connection list.");
        }
    } else {
        console.log("sender.tab not defined.");
    }
    return true;
});

// Handle the shortcut keys commands
chrome.commands.onCommand.addListener(function (command) {
    var tabID;
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (arrayOfTabs) {
        currentTabId = arrayOfTabs[0].id;
        if (currentTabId) {
            if (currentTabId in connections) {
                tabID = currentTabId;
            } else {
                console.log("Tab not found in connection list.");
                return false;
            }
        } else {
            console.log("Context tab not defined.");
            return false;
        }
        if (command == "toggle-select") {
            connections[tabID].postMessage({ toggleSelect: "toggleSelect" });
        } 
    });
});

function createContextMenu() {
    chrome.contextMenus.create({
        "id": "cr",
        "title": "Chrome Robot",
        "contexts": ["all"],
        // Prevents from showing up on the devtools panel
        "documentUrlPatterns": ["https://*/*", "http://*/*", "file://*/*"] ,
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "page-should-contain",
        "title": "Page Should Contain",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
            keyword: "kwPageShouldContain"});
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "page-should-contain-smart",
        "title": "Page Should Contain <type>",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwPageShouldContainSmart",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-1",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "click-smart",
        "title": "Click <type>",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwClickSmart",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "open-context",
        "title": "Open Context Menu",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwOpenContext",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "press-key",
        "title": "Press Key <next key you press>",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwPressKey",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "focus",
        "title": "Focus",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwFocus",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-2",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "mouse",
        "title": "Mouse...",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "mouse",
        "id": "mouse-down",
        "title": "Mouse Down <type>",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwMouseDownSmart",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "mouse",
        "id": "mouse-up",
        "title": "Mouse Up",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwMouseUp",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "mouse",
        "id": "mouse-over",
        "title": "Mouse Over",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwMouseOver",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "mouse",
        "id": "mouse-out",
        "title": "Mouse Out",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwMouseOut",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-3",
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "page-should-not",
        "title": "Page Should Not...",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "page-should-not",
        "id": "page-should-not-contain",
        "title": "Page Should Not Contain",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwPageShouldNotContain",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "page-should-not",
        "id": "page-should-not-contain-smart",
        "title": "Page Should Not Contain <type>",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwPageShouldNotContainSmart",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-4",
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "wait",
        "title": "Wait Until...",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "wait",
        "id": "wait-until-page-contains",
        "title": "Wait Until Page Contains",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwWaitUntilPageContains",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "wait",
        "id": "wait-until-page-contains-element",
        "title": "Wait Until Page Contains Element",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwWaitUntilPageContainsElement",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "wait",
        "id": "wait-until-element-is-visible",
        "title": "Wait Until Element Is Visible",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwWaitUntilElementIsVisible",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-5",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "element-should",
        "title": "Element Should Be...",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "element-should",
        "id": "element-should-be-enabled",
        "title": "Element Should Be Enabled",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwElementShouldBeEnabled",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "element-should",
        "id": "element-should-be-disabled",
        "title": "Element Should Be Disabled",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwElementShouldBeDisabled",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    /*
    //TODO Selenium Webdriver text method output seems to be unpredictable reagarding text breaks. Couldn't get a reliable algorithm for this
        chrome.contextMenus.create({
            "parentId": "element-should",
            "id": "element-text-should-be",
            "title": "Element Text Should Be",
        });
    */
    chrome.contextMenus.create({
        "parentId": "element-should",
        "id": "element-should-be-visible",
        "title": "Element Should Be Visible",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwElementShouldBeVisible",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "element-should",
        "id": "element-should-not-be-visible",
        "title": "Element Should Not Be Visible",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwElementShouldNotBeVisible",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-6",
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "browser",
        "title": "Browser...",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "open-browser",
        "title": "Open Browser",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwOpenBrowser",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "go-to",
        "title": "Go To",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwGoTo",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "go-back",
        "title": "Go Back",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwGoBack",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "reload-page",
        "title": "Reload Page",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwReloadPage",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "location-should-be",
        "title": "Location Should Be",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwLocationShouldBe",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "set-window-size",
        "title": "Set Window Size",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwSetWindowSize",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "close-browser",
        "title": "Close Browser",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwCloseBrowser",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "browser",
        "id": "close-all-browsers",
        "title": "Close All Browsers",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwCloseAllBrowsers",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "frame",
        "title": "Frame...",
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "frame",
        "id": "select-frame",
        "title": "Select Frame",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwSelectFrame",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "frame",
        "id": "current-frame-contains",
        "title": "Current Frame Contains",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwCurrentFrameContains",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "frame",
        "id": "current-frame-should-not-contain",
        "title": "Current Frame Should Not Contain",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwCurrentFrameShouldNotContain",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "frame",
        "id": "frame-should-contain",
        "title": "Frame Sould Contain",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwFrameShouldContain",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "frame",
        "id": "unselect-frame",
        "title": "Unselect Frame",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwUnselectFrame",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "type": "separator",
        "id": "separator-7",
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "fill-form-as-is",
        "title": "Fill Form As Is",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwFillForm",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
    chrome.contextMenus.create({
        "parentId": "cr",
        "id": "check-form-as-is",
        "title": "Check Form As Is",
        "onclick": function (info, tab) {
            connections[tab.id].postMessage({
                keyword: "kwCheckForm",
                tabId: tab.id
            });
        },
        "contexts": ["all"]
    });
}