import { Extension } from "../chrome-api/extension";
import { Runtime } from "../chrome-api/runtime";
import Tabs, { TabModel } from "../chrome-api/tabs";
import { URLMatcherModel } from "../options/URLMatcherModel";
import { DateModel } from "../utils/Dom";
import {
  BlockScheduler,
  blocksSitesStorage,
  focusModeStorage,
  StorageHandler,
} from "./controllers/storage";

Runtime.onInstall({
  onAll: async () => {
    await blocksSitesStorage.setup();
    await focusModeStorage.setup();
    console.log(await blocksSitesStorage.getAll());
    console.log(await focusModeStorage.getAll());
  },
  updateCb: async () => {
    await StorageHandler.resetAllFocus();
  },
});

async function handleincognitoBlock(currentTab: TabModel) {
  const inIncognito = await Extension.inIncognitoWindow();
  console.log("Incognito", inIncognito);
  if (!inIncognito) {
    return;
  }
  const currentTime = new Date();
  const blockSites = await blocksSitesStorage.get("incognitoBlockSites");
  const site = blockSites.find((site) => {
    const match = URLMatcherModel.isMatch(currentTab.tab.url, site.url);
    return match;
  });
  if (!site) {
    return;
  }

  console.log("Blocking site: permanent");
  await currentTab.changeUrl(chrome.runtime.getURL("blocked.html"));
}

async function handleBlockSite(currentTab: TabModel) {
  const currentTime = new Date();
  const blockSites = await blocksSitesStorage.get("blockSites");
  const currentUrl = new URL(currentTab.tab.url).origin;
  const site = blockSites.find((site) => {
    const match = URLMatcherModel.isMatch(currentTab.tab.url, site.url);
    return match;
  });
  if (!site) {
    return;
  }

  // if schedule, block on schedule
  if (site.schedule) {
    const blockScheduler = new BlockScheduler(
      DateModel.convertTimeToDate(site.schedule.startTime),
      DateModel.convertTimeToDate(site.schedule.endTime)
    );
    if (blockScheduler.shouldBlock(currentTime)) {
      console.log("Blocking site: schedule");
      await currentTab.changeUrl(chrome.runtime.getURL("blocked.html"));
    }
    console.log("Site should not be blocked.");
  }
  // else block permanently
  else {
    console.log("Blocking site: permanent");
    await currentTab.changeUrl(chrome.runtime.getURL("blocked.html"));
  }
}

async function handleFocusMode(currentTab: TabModel) {
  const focusGroups = await focusModeStorage.get("focusGroups");
  console.group("Focus Mode");
  focusGroups.forEach((group) => {
    if (group.isFocusing) {
      // if current tab is in focus mode, DON'T block
      const site = group.links.find((link) => {
        const match = URLMatcherModel.isMatch(currentTab.tab.url, link);
        console.log("match", match);
        return match;
      });
      console.log("current focus group", group);
      console.log("current tab", currentTab.tab.url);
      console.log("matches in focus group", group.links);
      if (!site) {
        console.log("Blocking site: focus mode");
        currentTab.changeUrl(chrome.runtime.getURL("blocked.html"));
      }
    }
  });
  console.groupEnd();
}

Tabs.Events.onTabHighlighted(async ({ tabIds }) => {
  const currentTab = new TabModel(await Tabs.getTabById(tabIds[0]));
  console.log(`Navigated to tab: ${currentTab.tab.url}`);

  if (BlockScheduler.isValidUrl(currentTab.tab.url)) {
    await handleBlockSite(currentTab);
    await handleFocusMode(currentTab);
    await handleincognitoBlock(currentTab);
  }
});

Tabs.Events.onTabNavigateComplete(async (tabId, tab) => {
  const currentTab = new TabModel(tab);
  console.log(`Navigated to tab: ${currentTab.tab.url}`);

  if (BlockScheduler.isValidUrl(currentTab.tab.url)) {
    await handleBlockSite(currentTab);
    await handleFocusMode(currentTab);
    await handleincognitoBlock(currentTab);
  }
});
