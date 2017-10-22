var selectModeOn = false;
var enabledLocators;
var $focusedVar;
var tabID;

$(document).ready(function() {

    tabID = chrome.devtools.inspectedWindow.tabId;
    variablesTabDomain = "variables." + tabID;

    $('#contentSplitter').jqxSplitter({
        orientation: 'horizontal',
        width: '100%',
        theme: 'metrodark',
        panels: [{
            size: 200,
            min: 100,
            collapsible: false
        }, {
            min: 100,
            collapsible: true
        }]
    });

    $("#selectButton").jqxToggleButton({
        theme: 'metrodark'
    });
    $("#selectButton").jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        content: chrome.i18n.getMessage("btn_tooltip_select"),
    });
    $('#selectButton').on("click", toggleSelectMode);

    $("#prefButton").jqxButton({
        theme: 'metrodark'
    });
    $("#prefButton").jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'bottom-left',
        content: chrome.i18n.getMessage("btn_tooltip_preferences"),
    });

    $("#helpButton").jqxButton({
        theme: 'metrodark'
    });
    $("#helpButton").jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'bottom-left',
        content: chrome.i18n.getMessage("btn_tooltip_help"),
    });
    $('#helpButton').on("click", _openHelp);

    $("#keywordButton").jqxButton({
        theme: 'metrodark'
    });
    $("#keywordButton").jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top',
        content: chrome.i18n.getMessage("btn_tooltip_keyword"),
    });
    $('#keywordButton').on("click", _openNewKey);

    $("#downloadButton").jqxButton({
        theme: 'metrodark'
    });
    $("#downloadButton").jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top-left',
        content: chrome.i18n.getMessage("btn_tooltip_download"),
    });
    $('#downloadButton').on('click', _downloadTest);

    $("#htmlArea").jqxTextArea({
        width: '100%',
        theme: 'metrodark',
     // TODO makes the letters look too faded
     // disabled: true
    });

    $('#crScriptTabs').jqxTabs({
        autoHeight: true,
        position: 'top',
        theme: 'metrodark'
    });

    $('#crScriptTabs').jqxTabs('select', 2);

    $("#settingsArea").jqxTextArea({
        width: '100%',
        theme: 'metrodark'
    });

    $("#settingsArea").jqxTextArea('val',
        'Documentation   \tTest suite created with ChromeRobot.\nLibrary   \tSelenium2Library   15.0   5.0');

    $("#testCasesArea").jqxTextArea({
        width: '100%',
        height: '99%',
        theme: 'metrodark'
    });

    $("#testCasesArea").jqxTextArea('val', 'Chrome Robot Test Case\n');

    $("#keywordsArea").jqxTextArea({
        width: '100%',
        height: '99%',
        theme: 'metrodark'
    });

    $("#helpWindow").jqxWindow({
        height: $(window).height() - 100,
        width: $(window).width() - 100,
        theme: 'metrodark',
        autoOpen: false,
        position: 'center'
    });
    $("#helpCloseButton").jqxButton({
        width: '60',
        height: '25',
        theme: 'metrodark'
    });
    $("#helpCloseButton").on("click", _closeHelp);

    $('#addResourceButton').jqxButton({
        theme: 'metrodark'
    });
    $('#addResourceButton').jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top-left',
        content: chrome.i18n.getMessage("btn_tooltip_add_resource"),
    });
    $('#addResourceButton').on("click", _addResource);

    $('#addVarButton').jqxButton({
        theme: 'metrodark'
    });
    $('#addVarButton').jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top-left',
        content: chrome.i18n.getMessage("btn_tooltip_add_var"),
    });
    $('#addVarButton').on("click", function() {
        _addVar('', '');
    });

    $('#removeVarButton').jqxButton({
        theme: 'metrodark'
    });
    $('#removeVarButton').jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top',
        content: chrome.i18n.getMessage("btn_tooltip_delete_var"),
    });
    $('#removeVarButton').click(_removeVar);

    $('#moveVarUpButton').jqxButton({
        theme: 'metrodark'
    });
    $('#moveVarUpButton').jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top',
        content: chrome.i18n.getMessage("btn_tooltip_var_up"),
    });
    $('#moveVarUpButton').click(_moveVarUp);

    $('#moveVarDownButton').jqxButton({
        theme: 'metrodark'
    });
    $('#moveVarDownButton').jqxTooltip({
        theme: 'metrodark',
        showDelay: 500,
        position: 'top',
        content: chrome.i18n.getMessage("btn_tooltip_var_down"),
    });
    $('#moveVarDownButton').click(_moveVarDown);

    $('.varBox').on('focus', _focusVarLine);
    $('.varBox').on('change', _updateVarStorage);

    $('.varNameBox').on('focus', _updateOldValue);
    $('.varNameBox').on('change', _updateVarName);

    _updateVarStorage();
    
    // TODO onbeforeunlod event is no longer working on devtools panels on chrome 61
    // https://developers.google.com/web/updates/2017/06/chrome-60-deprecations
    $(window).on('beforeunload', function() {
        sendObjectToInspectedPage({
            action: "code",
            content: "removeSelectContext()"
            
        });
        selectedElementsInfo = [];
        //TODO review this
         chrome.storage.local.remove(variablesTabDomain);
    });

    _resizePanelContent();

    // Hack from https://gist.github.com/OrganicPanda/8222636
    // Create an invisible iframe
    var iframe = document.createElement('iframe');
    iframe.id = "hacky-scrollbar-resize-listener";
    iframe.style.cssText = 'height: 0; background-color: transparent; margin: 0; padding: 0; overflow: hidden; border-width: 0; position: absolute; width: 100%;';
    // Register our event when the iframe loads
    iframe.onload = function() {
        // The trick here is that because this iframe has 100% width 
        // it should fire a window resize event when anything causes it to 
        // resize (even scrollbars on the outer document)
        iframe.contentWindow.addEventListener('resize', function() {
            _resizePrefWindow();
            _resizeHelpWindow();
            _resizeKeyWindow();
            _resizePanelContent();
        });
    };
    // Stick the iframe somewhere out of the way
    document.body.appendChild(iframe);
});

//TODO VM4486:1 Uncaught ReferenceError: removeSelectContext is not defined

function _injectScripts() {
    // Identifies the variables relevant for a specific webpage and extension instance.
    // Important when we have multiple extension instances at th same time.
    sendObjectToInspectedPage({
        action: "code",
        content: "var variablesTabDomain = '" + variablesTabDomain + "';"
    });
    sendObjectToInspectedPage({
        action: "script",
        content: "content_scripts/external/xregexp.js"
    });
    sendObjectToInspectedPage({
        action: "script",
        content: "content_scripts/chrome_robot/utils.js"
    });
    sendObjectToInspectedPage({
        action: "script",
        content: "content_scripts/chrome_robot/variables.js"
    });
    sendObjectToInspectedPage({
        action: "script",
        content: "content_scripts/chrome_robot/locators.js"
    });
    sendObjectToInspectedPage({
        action: "script",
        content: "content_scripts/chrome_robot/keywords.js"
    });
    sendObjectToInspectedPage({
        action: "script",
        content: "content_scripts/chrome_robot/select.js"
    });
}

function toggleSelectMode() {
    if (selectModeOn) {
        clearSectedElements();

        sendObjectToInspectedPage({
            action: "code",
            content: "removeSelectContext()"
        });
        $("#selectButton").jqxToggleButton({
            toggled: false
        });
        selectModeOn = false;
    } else {
        //TODO
        /*
            if (!doc.body) {
                warning("firerobot.warn.no-body");
                return;
            }
            */
        _injectScripts();
        selectedElementsInfo = [];
        document.getElementById("htmlArea").value = "";
        $("#selectButton").jqxToggleButton({
            toggled: true
        });
        selectModeOn = true;
    }
}

function clearSectedElements(){
    selectedElementsInfo = [];
    selectedElementsCount = 0;
    textFragmentsCount = 0;
    selectedElementsInFrameCount = 0;
    selectedInputsCount = 0;
    document.getElementById("htmlAreaTextArea").value = "";
}

function _openHelp() {
    $("#helpWindow").jqxWindow('open');
}

function _openNewKey() {
    loadSelSteps();
}

function _closeNewKey() {
    $("#keyWindow").jqxWindow('close');
}

function _closeHelp() {
    $("#helpWindow").jqxWindow('close');
}

function _addResource() {
    var fileChooser = document.createElement("input");
    fileChooser.type = 'file';
    fileChooser.accept = '.txt,.robot';
    fileChooser.addEventListener('change', function(evt) {
        var file = evt.target.files[0];
        var resource = "Resource   \t" + file.name;
        var settingsTextArea = document.getElementById("settingsAreaTextArea");
        var oldSettings = settingsTextArea.value;
        if (oldSettings !== "") {
            resource = "\r\n" + resource;
        }
        var newSettings = oldSettings + resource;
        settingsTextArea.value = newSettings;
    });
    fileChooser.click();
}

function _addVar(name, value) {
    value = value.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    var $newLine = $("#variableLines").append("<div class='variableLine'>&nbsp;${ <input type='text' class='varBox varNameBox' value='" + name + "'> } <input type='text' class='varBox varValueBox' value='" + value + "'></div>");
    //TODO do this more efficiently
    $('.varBox').on('focus', _focusVarLine);
    $('.varBox').on('change', _updateVarStorage);
    $('.varNameBox').on('focus', _updateOldValue);
    $('.varNameBox').on('change', _updateVarName);
    _updateVarStorage();

}

function _removeVar() {
    if ($focusedVar) {
        $focusedVar.remove();
        $focusedVar = undefined;
    } else {
        //TODO disable button when there's no variable, focused, do that for remaining ones
        alert(chrome.i18n.getMessage("no_var_select"));
    }
    _updateVarStorage();
}

function _moveVarUp() {
    if ($focusedVar) {
        var element = $focusedVar[0];
        if (element.previousElementSibling) element.parentNode.insertBefore(element, element.previousElementSibling);
    } else {
        alert(chrome.i18n.getMessage("no_var_select"));
    }
}

function _moveVarDown() {
    if ($focusedVar) {
        var element = $focusedVar[0];
        if (element.nextElementSibling) element.parentNode.insertBefore(element.nextElementSibling, element);
    } else {
        alert(chrome.i18n.getMessage("no_var_select"));
    }
}

function _focusVarLine() {
    if ($focusedVar) {
        $focusedVar.removeClass('variableLineFocus');
    }
    $focusedVar = $(this).parent();
    $focusedVar.addClass('variableLineFocus');
}

function _updateVarStorage() {
    var variables = [];
    $(".variableLine").each(function() {
        var variable = {};
        $(this).find(".varNameBox").each(function(index, item) {
            variable.varName = item.value;
        });
        $(this).find(".varValueBox").each(function(index, item) {
            variable.varValue = item.value;
        });
        if (variable.varName) variables.push(variable);
    });
    var json = {};
    json[variablesTabDomain] = variables;
    chrome.storage.local.set(json);
}

function _updateOldValue() {
    var $this = $(this);
    $this.data('oldVal', $this.val());
}

function _updateVarName() {
    var $this = $(this);
    var oldValue = $this.data('oldVal');
    if (oldValue && oldValue != '' && $this.val() != '') {
        var oldVarName = "${" + oldValue + "}";
        var newVarName = "${" + $this.val() + "}";
        var tests = $('#testCasesArea').val();
        var newTests = tests.replace(oldVarName, newVarName, "g");
        $('#testCasesArea').val(newTests);
    }
    _updateVarStorage();
}

function _resizePanelContent() {
    setTimeout(function() {
        $("#contentSplitter").jqxSplitter({
            height: ($(window).outerHeight() - 108),
        });
    }, 100);
}

function _resizeHelpWindow() {
    setTimeout(function() {
        $("#helpWindow").jqxWindow({
            height: $(window).height() - 100,
            width: $(window).width() - 100,
            position: 'center'
        });
    }, 150);
}

async function _downloadTest() {
    var element = document.getElementById('downloadLink');
    var fileName = 'crTest-' + getTimeStamp() + '.robot';
    var content = getTestContent();
    download(element, fileName, content);
}

function download(element, fileName, content) {
    var MIME_TYPE = 'text/plain';
    window.URL = window.URL || window.webkitURL;
    // revoke previous download path
    window.URL.revokeObjectURL(element.href);
    element.download = fileName;
    element.href = window.URL.createObjectURL(new Blob([content], {
        type: MIME_TYPE
    }));
    element.dataset.disabled = false;
    element.dataset.downloadurl = [MIME_TYPE, fileName, element.href].join(':');
    element.click();
}

function getTestContent() {
    var settings = $('#settingsArea').jqxTextArea('val');
    var variables = '';
    $(".variableLine").each(function() {
        $(this).find(".varNameBox").each(function(index, item) {
            variables += '${' + item.value + '}   \t';
        });
        $(this).find(".varValueBox").each(function(index, item) {
            variables += item.value + '\n';
        });
    });
    var testCases = $('#testCasesArea').jqxTextArea('val');
    var keywords = $('#keywordsArea').jqxTextArea('val');

    var testContent = '*** Settings ***\n' + settings +
        '\n\n*** Variables ***\n' + variables +
        '\n*** Test Cases ***\n' + testCases +
        '\n*** Keywords ***\n' + keywords;
    return testContent;
}

function getTimeStamp() {
    var now = new Date();
    return (
        now.getFullYear().toString() +
        (((now.getMonth() + 1) < 10) ? ("0" + (now.getMonth() + 1)) : (now.getMonth() + 1)).toString() +
        ((now.getDate() < 10) ? ("0" + now.getDate()) : (now.getDate())).toString() +
        ((now.getHours() < 10) ? ("0" + now.getHours()) : (now.getHours())).toString() +
        ((now.getMinutes() < 10) ? ("0" + now.getMinutes()) : (now.getMinutes())).toString() +
        ((now.getSeconds() < 10) ? ("0" + now.getSeconds()) : (now.getSeconds())).toString()
    );
}