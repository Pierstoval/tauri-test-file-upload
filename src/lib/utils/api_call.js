import {invoke} from "@tauri-apps/api/tauri";

/**
 * @return Promise<string> with a JSON-serialized version of the expected data.
 */
export default function api_call(command, params) {
    if (window['__TAURI_INVOKE__']) {
        return invoke(command, params);
    }

    return Promise.reject('No API detected.');
}
