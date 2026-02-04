// MainPanel.jsx
// Handles the main tabbed layout of the script

{
    function buildMainPanel(parentPanel) {
        var mainGroup = parentPanel.add("group");
        mainGroup.orientation = "column";
        mainGroup.alignChildren = ["fill", "fill"];
        mainGroup.alignment = ["fill", "fill"];
        mainGroup.spacing = 0;
        mainGroup.margins = 0;

        // Create TabbedPanel
        var tPanel = mainGroup.add("tabbedpanel");
        tPanel.alignChildren = ["fill", "fill"];

        // --- Tabs ---
        // We will populate these with content from separate files ideally, 
        // but for ExtendScript simple includes, we might just define functions or objects.
        // For now, let's set up the shell.

        var layersTab = tPanel.add("tab", undefined, "Layers");
        layersTab.alignChildren = ["fill", "top"];
        // Placeholder content
        layersTab.add("statictext", undefined, "Layers Tools").alignment = "center";

        var transformTab = tPanel.add("tab", undefined, "Transform");
        transformTab.alignChildren = ["fill", "top"];
        transformTab.add("statictext", undefined, "Transform Tools").alignment = "center";

        var clonesTab = tPanel.add("tab", undefined, "Clones");
        clonesTab.alignChildren = ["fill", "top"];
        clonesTab.add("statictext", undefined, "Cloning Tools").alignment = "center";

        var toolsTab = tPanel.add("tab", undefined, "Tools");
        toolsTab.alignChildren = ["fill", "top"];
        toolsTab.add("statictext", undefined, "Scene & Global Tools").alignment = "center";

        return tPanel;
    }

    // Expose function if included via #include, or just return if eval'd
    $.global.buildMainPanel = buildMainPanel;
}
