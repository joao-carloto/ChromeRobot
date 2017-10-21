var availableLocators = [
    "id",
    "name",
    "href",
    "link",
    "alt",
    "src",
    "value",
    "label",
    "index",
    "xpath",
    "class_xpath"
];

var locatorMap = {
    'id': "id",
    'name': 'name',
    'href': 'href',
    'link': 'link',
    'alt': 'alt',
    'src': 'src',
    'value': 'value',
    'label': 'label',
    'index': 'index',
    'xpath': 'text based xpath',
    'class_xpath': 'class based xpath'
};

var varDefaultPref = {
    createVarInput: true,
    useVarInput: true,
    createVarLoc: false,
    useVarLoc: false
};

$(document).ready(function () {
    $("#prefWindow").jqxWindow({
        height: 500,
        width: 400,
        theme: 'metrodark',
        autoOpen: false,
        position: 'center'
    });

    $('#prefButton').on("click", function () {
        _getVarPreferences();
        _addLocPrefkanban();
        $("#prefWindow").jqxWindow('open');
    });

    $("#createVarInputCheckBox").jqxCheckBox({
        width: 350,
        height: 25,
        theme: 'metrodark'
    });
    $("#createVarInputCheckBox").on('change', _updateVarPrefStorage);

    $("#useVarInputCheckBox").jqxCheckBox({
        width: 350,
        height: 25,
        theme: 'metrodark'
    });
    $("#useVarInputCheckBox").on('change', _updateVarPrefStorage);

    $("#createVarLocCheckBox").jqxCheckBox({
        width: 350,
        height: 25,
        theme: 'metrodark'
    });
    $("#createVarLocCheckBox").on('change', _updateVarPrefStorage);

    $("#useVarLocCheckBox").jqxCheckBox({
        width: 350,
        height: 25,
        theme: 'metrodark'
    });
    $("#useVarLocCheckBox").on('change', _updateVarPrefStorage);

    $("#prefCloseButton").jqxButton({
        width: '60',
        height: '25',
        theme: 'metrodark'
    });

    $("#prefCloseButton").on("click", _closePrefs);
});

function _addLocPrefkanban() {
    var fields = [{
        name: "id",
        type: "string"
    }, {
        name: "status",
        map: "state",
        type: "string"
    }, {
        name: "text",
        map: "label",
        type: "string"
    }];

    var source = {
        dataType: "array",
        dataFields: fields
    };

    chrome.storage.sync.get("locPreferences", function (result) {
        if (result.locPreferences) {
            locPreferences = result.locPreferences;
        } else {
            locPreferences = availableLocators;
        }
        source.localData = _getLocPrefArray(locPreferences);
        dataAdapter = new $.jqx.dataAdapter(source);

        // Yest it's kind of absurd to destroy an recreate an element like this
        // Unfortunately it was the only way I found to show the updated prefences,
        // when mutiple extensions instances are in use.
        if ($('#locatorsKanban').length) $('#locatorsKanban').jqxKanban('destroy');

        $('#prefWindowContent').prepend("<div id='locatorsKanban' style='margin-left:auto;margin-right:auto;'> </div>");

        $('#locatorsKanban').jqxKanban({
            source: dataAdapter,
            resources: resourcesAdapterFunc(),
            template: "<div class='jqx-kanban-item' id=''>" +
            "<div class='jqx-kanban-item-text'></div>" +
            "</div>",
            theme: "metrodark",
            width: 350,
            height: 320,
            columns: [{
                text: "Disabled Locators",
                dataField: "disabled"
            }, {
                text: "Enabled Locators",
                dataField: "enabled"
            }]
        });
        $('#locatorsKanban').on('itemMoved', _onItemMoved);
    });
}

function _onItemMoved(event) {
    var args = event.args;
    var itemId = args.itemId;
    var oldParentId = args.oldParentId;
    var newParentId = args.newParentId;
    var itemData = args.itemData;
    var oldColumn = args.oldColumn;
    var newColumn = args.newColumn;

    if (itemId == 'xpath' && newColumn.dataField == 'disabled') {
        alert(chrome.i18n.getMessage("cannot_disable_loc"));
        _addLocPrefkanban();
        return;
    }

    //The column is not yet updated after the event
    setTimeout(function () {
        var enabledItems = $('#locatorsKanban').jqxKanban('getColumnItems', 'enabled');
        var enabledArray = Array(enabledItems.length);
        for (var i = 0; i < enabledItems.length; i++) {
            var index = $('#locatorsKanban_' + enabledItems[i].id).index();
            enabledArray.splice(index, 1, enabledItems[i].id);
        }
        chrome.storage.sync.set({
            "locPreferences": enabledArray
        });
    }, 0);
}

function _getVarPreferences() {
    chrome.storage.sync.get("varPreferences", function (result) {
        var varPreferences;
        if (result.varPreferences) {
            varPreferences = result.varPreferences;
        } else {
            varPreferences = varDefaultPref;
            chrome.storage.sync.set({
                "varPreferences": varPreferences
            });
        }
        $("#createVarInputCheckBox").jqxCheckBox({
            checked: varPreferences.createVarInput
        });
        $("#useVarInputCheckBox").jqxCheckBox({
            checked: varPreferences.useVarInput
        });
        $("#createVarLocCheckBox").jqxCheckBox({
            checked: varPreferences.createVarLoc
        });
        $("#useVarLocCheckBox").jqxCheckBox({
            checked: varPreferences.useVarLoc
        });
    });
}

function resourcesAdapterFunc() {
    var resourcesSource = {
        localData: [{
            id: 0,
            name: "No name",
            image: "skin/jqwidgets/styles/images/common.png",
            common: true
        },],
        dataType: "array",
        dataFields: [{
            name: "id",
            type: "number"
        }, {
            name: "name",
            type: "string"
        }, {
            name: "image",
            type: "string"
        }, {
            name: "common",
            type: "boolean"
        }]
    };
    var resourcesDataAdapter = new $.jqx.dataAdapter(resourcesSource);
    return resourcesDataAdapter;
}

function _getLocPrefArray(prefArray) {
    var enabledLocArray = prefArray;
    var disabledLocArray = [];
    var localData = [];
    var locItem = {};

    for (var i = 0; i < availableLocators.length; i++) {
        if (enabledLocArray.indexOf(availableLocators[i]) == -1) {
            disabledLocArray.push(availableLocators[i]);
        }
    }
    for (var i = 0; i < disabledLocArray.length; i++) {
        locItem = {};
        locItem.id = disabledLocArray[i];
        locItem.state = "disabled";
        locItem.label = locatorMap[locItem.id];
        localData.push(locItem);
    }
    for (var i = 0; i < enabledLocArray.length; i++) {
        locItem = {};
        locItem.id = enabledLocArray[i];
        locItem.state = "enabled";
        locItem.label = locatorMap[locItem.id];
        localData.push(locItem);
    }
    return localData;
}

function _closePrefs() {
    $("#prefWindow").jqxWindow('close');
}

function _updateVarPrefStorage() {
    var varPreferences = {};
    varPreferences.createVarInput = $("#createVarInputCheckBox").jqxCheckBox('checked');
    varPreferences.useVarInput = $("#useVarInputCheckBox").jqxCheckBox('checked');
    varPreferences.createVarLoc = $("#createVarLocCheckBox").jqxCheckBox('checked');
    varPreferences.useVarLoc = $("#useVarLocCheckBox").jqxCheckBox('checked');
    chrome.storage.sync.set({
        "varPreferences": varPreferences
    });
}

function _resizePrefWindow() {
    setTimeout(function () {
        $("#prefWindow").jqxWindow({
            autoOpen: false,
            position: 'center'
        });
    }, 150);
}