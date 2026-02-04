{
    function myScript(thisObj) {
        var scriptName = "AE Creative Scripts";

        // Define UI Main Panel
        var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", scriptName, undefined, { resizeable: true });

        // Include MainPanel build logic
        // Note: In a raw development environment without a bundler, we use #include
        // We need to ensure the path is correct relative to this executing script.
        var scriptFile = new File($.fileName);
        var scriptRoot = scriptFile.parent;

        // Dynamically load the MainPanel.jsx
        var uiFile = new File(scriptRoot.fsName + "/ui/MainPanel.jsx");
        if (uiFile.exists) {
            $.evalFile(uiFile);
        } else {
            alert("Error: UI file not found at " + uiFile.fsName);
            return;
        }

        myPanel.orientation = "column";
        myPanel.alignChildren = ["fill", "fill"];
        myPanel.spacing = 0;
        myPanel.margins = 0;

        // Build the specific UI
        if (typeof buildMainPanel === 'function') {
            buildMainPanel(myPanel);
        } else {
            myPanel.add("statictext", undefined, "Error: buildMainPanel not found");
        }

        // --- Render UI ---
        myPanel.layout.layout(true);

        return myPanel;
    }

    var myScriptPal = myScript(this);

    if (myScriptPal instanceof Window) {
        myScriptPal.center();
        myScriptPal.show();
    }
}
