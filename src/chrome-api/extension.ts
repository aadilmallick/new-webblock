export class Extension {
  static async isAllowedIncognitoAccess() {
    return await chrome.extension.isAllowedIncognitoAccess();
  }

  static get manageExtensionURL() {
    return `chrome://extensions/?id=${chrome.runtime.id}`;
  }

  static async inIncognitoWindow() {
    const currentWindow = await chrome.windows.getCurrent();
    return currentWindow.incognito;
  }
}
