var keyDefaultPref = {
    replaceSteps: true,
};

$(document).ready(function() {
    chrome.storage.sync.get("keyPreferences", function(result) {
        var keyPreferences;
        if (result.keyPreferences) {
            keyPreferences = result.keyPreferences;
        } else {
            keyPreferences = keyDefaultPref;
        }
        $("#keyWindow").jqxWindow({
            height: $(window).height() - 100,
            width: $(window).width() - 100,
            theme: 'metrodark',
            autoOpen: false,
            position: 'center'
        });
        $("#newKeyNameBox").jqxInput({
            height: 25,
            width: '30%',
            theme: 'metrodark',
            placeHolder: 'Enter Keyword Name'
        });
        $("#newKeyArgumentsBox").jqxInput({
            height: 25,
            width: '50%',
            theme: 'metrodark'
        });
        $("#newKeyStepsArea").jqxTextArea({
            width: '100%',
            height: $('#keyWindow').jqxWindow('height') - 140,
            theme: 'metrodark'
        });
        $("#replaceWithKeyCheckBox").jqxCheckBox({
            width: 350,
            height: 25,
            theme: 'metrodark'
        });
        $("#replaceWithKeyCheckBox").jqxCheckBox({
            checked: keyPreferences.replaceSteps
        });
        $("#replaceWithKeyCheckBox").on('change', _updateKeyPrefStorage);
        $("#newKeyOKButton").jqxButton({
            width: '60',
            height: '25',
            theme: 'metrodark'
        });
        $("#newKeyOKButton").on("click", _addKeyToSelf);
        $("#newKeyCancelButton").jqxButton({
            width: '60',
            height: '25',
            theme: 'metrodark'
        });
        $("#newKeyCancelButton").on("click", _closeNewKey);
    });
});

function _updateKeyPrefStorage() {
    var varPreferences = {};
    varPreferences.replaceSteps = $("#replaceWithKeyCheckBox").jqxCheckBox('checked');
    chrome.storage.sync.set({
        "keyPreferences": keyPreferences
    });
}

async function loadSelSteps() {
    var testArea = document.getElementById("testCasesAreaTextArea");
    var keyNameBox = document.getElementById("newKeyNameBox");
    var keyVarBox = document.getElementById("newKeyArgumentsBox");
    var steps = testArea.value;
    var start = testArea.selectionStart;
    var end = testArea.selectionEnd;

    var selectedSteps = steps.substring(start, end).trim();
    if (!selectedSteps || selectedSteps === '') {
        alert(chrome.i18n.getMessage("no_steps_selected"));
        return;
    }
    selectedSteps = "   \t" + selectedSteps;
    $("#newKeyStepsArea").jqxTextArea('val', selectedSteps);

    keyNameBox.value = "";
    keyVarBox.value = "";

    // Remove local variables
    // First, select  variables defined or redefined in the selected steps
    var matchLocalVar = selectedSteps.match(/(\r\n\s*|\n\s*|\r\s*|^[\s]*)\${[^${}]*}/g);
    if (matchLocalVar) {
        for (var i = 0; i < matchLocalVar.length; i++) {
            //Is this the first reference to the variable? Was this defined in the selected steps?
            sameVar = matchLocalVar[i].trim();
            var firstOcurrencePos = selectedSteps.indexOf(sameVar);
            var defPos = selectedSteps.indexOf(matchLocalVar[i]);
            if (defPos <= firstOcurrencePos) {
                //Yes this was defined inside the selected steps, so it will not be an argument of the new keyword
                //Let's remove the variable
                sameVar = sameVar.replace("$", "\\$");
                var regex = new RegExp(sameVar, "g");
                selectedSteps = selectedSteps.replace(regex, "");
            }
        }
    }
    var matchVar = selectedSteps.match(/\${[^${}]*}/g);
    if (matchVar) {
        //Remove duplicates
        matchVar = matchVar.filter(function(elem, pos) {
            return matchVar.indexOf(elem) == pos;
        });
        var varString = "";
        for (var i = 0; i < matchVar.length; i++) {
            varString += matchVar[i] + "    ";
        }
        keyVarBox.value = varString;
    }
    $("#keyWindow").jqxWindow('open');
}

function _addKeyToSelf() {
    var keyNameBox = document.getElementById("newKeyNameBox");
    var name = keyNameBox.value;

    if (!name) {
        alert(chrome.i18n.getMessage("no_key_name"));
        return false;
    }
    var keyword = name;
    var keyVarBox = document.getElementById("newKeyArgumentsBox");
    var vars = keyVarBox.value;

    if (vars) {
        keyword += "   \t[Arguments]   \t" + vars;
    }

    var steps = $("#newKeyStepsArea").jqxTextArea('val');
    keyword += "\r\n" + steps;

    var oldKeywords = $("#keywordsArea").jqxTextArea('val');
    if (oldKeywords !== "") {
        keyword = "\r\n\r\n" + keyword;
    }
    var newKeywords = oldKeywords + keyword;

    $("#keywordsArea").jqxTextArea('val', newKeywords);
    var keywordsTextArea = document.getElementById("keywordsAreaTextArea");
    keywordsTextArea.scrollTop = keywordsTextArea.scrollHeight;

    //Replace steps for new keyword, if option is enabled.
    if ($("#replaceWithKeyCheckBox").jqxCheckBox('checked')) {
        testCase = $("#testCasesArea").jqxTextArea('val');
        var keyStep = name;
        if (vars) {
            keyStep += "   \t" + vars;
        }
        testCase = testCase.replace(steps.trim(), keyStep);
        $("#testCasesArea").jqxTextArea('val', testCase);
    }
    $("#keyWindow").jqxWindow('close');
    return true;
}

function _resizeKeyWindow() {
    setTimeout(function() {
        $("#keyWindow").jqxWindow({
            autoOpen: false,
            height: $(window).height() - 100,
            width: $(window).width() - 100,
            position: 'center'
        });
        $("#newKeyStepsArea").jqxTextArea({
            width: '100%',
            height: $('#keyWindow').jqxWindow('height') - 145,
            //height: '75%',
        });
    }, 150);
}
