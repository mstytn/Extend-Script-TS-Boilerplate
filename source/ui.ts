/**
 * Main UI Function
 */
function showMainInterface(ensureReferenceCharacterStylesExist: () => void, ensureGenericCharacterStylesExist: () => void, resetAllTablesStatus: () => void): void {
    const win = new (Window as any)("dialog", "Toolset Manager");

    win.orientation = "column";
    win.alignChildren = ["fill", "top"];
    win.spacing = 10;
    win.margins = 20;

    // --- BUTTON 1: Create Reference Styles ---
    const btnRef = win.add("button", undefined, "Create Reference Styles");
    btnRef.onClick = function() {
        try {
            ensureReferenceCharacterStylesExist();
            alert("Reference styles created.");
        } catch (e) {
            alert("Error: " + e);
        }
    };

    // --- BUTTON 2: Create Table Styles ---
    const btnTable = win.add("button", undefined, "Create Table Styles");
    btnTable.onClick = function() {
        try {
            ensureGenericCharacterStylesExist();
            alert("Table styles created.");
        } catch (e) {
            alert("Error: " + e);
        }
    };

    // --- BUTTON 3: Reset Tables' Status ---
    const btnReset = win.add("button", undefined, "Reset Tables' Status");
    btnReset.onClick = function() {
        try {
            resetAllTablesStatus();
            alert("Tables reset successfully.");
        } catch (e) {
            alert("Error: " + e);
        }
    };

    // --- CLOSE ---
    const btnClose = win.add("button", undefined, "Close", { name: "cancel" });
    btnClose.onClick = function() {
        win.close();
    };

    win.center();
    win.show();
}

