// LayerUtils.jsx
{
    var LayerUtils = {};

    // Generate a random number between min and max (inclusive)
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Randomize the start time of selected layers
     * @param {number} min - Minimum offset in frames
     * @param {number} max - Maximum offset in frames
     */
    LayerUtils.randomizeLayers = function (min, max) {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select at least one layer.");
            return;
        }

        app.beginUndoGroup("Randomize Layers");

        var frameDuration = comp.frameDuration;

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            var randomFrames = randomRange(min, max);
            var offsetTime = randomFrames * frameDuration;
            layer.startTime = offsetTime;
        }

        app.endUndoGroup();
    };

    /**
     * Sequence layers with an offset
     * @param {number} offsetFrames - Number of frames to stagger
     */
    LayerUtils.sequenceLayers = function (offsetFrames) {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            alert("Please select a composition.");
            return;
        }
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            alert("Please select at least one layer.");
            return;
        }

        app.beginUndoGroup("Sequence Layers");

        var frameDuration = comp.frameDuration;
        var offsetTime = offsetFrames * frameDuration;
        var currentTime = comp.time; // Or start from 0? Usually sequence starts from current time or first layer's time.
        // Utility Box behavior: "Usually sequence starts from current start time of first selected layer" or just relative.
        // Let's implement relative staggering based on selection order.

        // Find the earliest start time among selected to use as base, or just use the first selected layer?
        // Standard behaviors is usually: First selected layer stays put (or moves to desired start), subsequent move relative to it.
        // Let's assume we want to stagger them starting from the time of the *first selected* layer (index 0 of selectedLayers).

        var startTime = selectedLayers[0].startTime;

        for (var i = 0; i < selectedLayers.length; i++) {
            var layer = selectedLayers[i];
            layer.startTime = startTime + (i * offsetTime);
        }

        app.endUndoGroup();
    };

    /**
     * Deselect a percentage of currently selected layers randomly
     * @param {number} percentage - Percentage to deselect (0-100)
     */
    LayerUtils.deselectRandom = function (percentage) {
        var comp = app.project.activeItem;
        if (!comp || !(comp instanceof CompItem)) {
            return;
        }
        var selectedLayers = comp.selectedLayers;
        if (selectedLayers.length === 0) {
            return;
        }

        // We can't "deselect" directly via API easily without deselecting all and re-selecting.
        // Strategy: 
        // 1. Identify which layers to KEEP.
        // 2. Deselect all.
        // 3. Select the ones to keep.

        var keepCount = Math.floor(selectedLayers.length * ((100 - percentage) / 100));
        if (keepCount < 0) keepCount = 0;

        // Fisher-Yates shuffle to pick random layers to keep
        var indices = [];
        for (var i = 0; i < selectedLayers.length; i++) indices.push(i);

        // Shuffle
        for (var i = indices.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = indices[i];
            indices[i] = indices[j];
            indices[j] = temp;
        }

        // The first 'keepCount' indices are the ones we Keep selected.
        // The rest we deselect.

        // Actually, simpler: just select the ones we want to keep.
        // First, deselect all selected layers.
        for (var i = 0; i < selectedLayers.length; i++) {
            selectedLayers[i].selected = false;
        }

        // Re-select the chosen ones
        for (var i = 0; i < keepCount; i++) {
            var idx = indices[i];
            selectedLayers[idx].selected = true;
        }
    };

    $.global.LayerUtils = LayerUtils;
}
