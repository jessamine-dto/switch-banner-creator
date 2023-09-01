import { addInputChangeListeners, updateOutput } from "./input/addInputChangeListeners.js";
import assignLastCommitToElement from "./generateLastCommitText.js";
import initalizeSchoolDropdown from "./input/dropdown.js";
export const IS_DEVELOPMENT = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
addInputChangeListeners("#output");
await initalizeSchoolDropdown();
updateOutput();
if (IS_DEVELOPMENT === false) {
    const lastUpdated = document.getElementById("last-updated");
    await assignLastCommitToElement(lastUpdated, "jessamine-dto/switch-banner-creator");
}
