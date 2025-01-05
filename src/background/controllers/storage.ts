import { LocalStorage, SyncStorage } from "../../chrome-api/storage";
import { ObjectSet } from "../../utils/assorted-vanillajs/ObjectSet";
import { DateModel } from "../../utils/Dom";

export interface BlockSite {
  url: string;
  schedule?: {
    startTime: string;
    endTime: string;
  };
}

export interface FocusGroup {
  links: string[];
  isFocusing: boolean;
  id: string;
  name: string;
}

export const blocksSitesStorage = new LocalStorage({
  blockSites: [] as BlockSite[],
  incognitoBlockSites: [] as BlockSite[],
});

export const focusModeStorage = new LocalStorage({
  focusGroups: [] as FocusGroup[],
});

export class BlockScheduler {
  constructor(private startTime: Date, private endTime: Date) {}

  static isValidUrl(url: string) {
    return url.startsWith("https://");
  }

  shouldBlock(currentTime: Date) {
    // Extract hours from dates
    const startHour =
      this.startTime.getHours() + this.startTime.getMinutes() / 60;
    const endHour = this.endTime.getHours() + this.endTime.getMinutes() / 60;
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60;

    console.log(startHour, endHour, currentHour);

    // Check if current hour is within the interval, if so, then don't block
    if (currentHour >= startHour && currentHour < endHour) {
      return false;
    }
    return true;
  }
}

// define static methods here
export class StorageHandler {
  static async getScheduledBlockSites() {
    return (await blocksSitesStorage.get("blockSites")).filter(
      (site) => site.schedule
    );
  }

  static async getIncognitoBlockSites() {
    return await blocksSitesStorage.get("incognitoBlockSites");
  }

  static async addIncognitoBlockSite(url: string) {
    if (!BlockScheduler.isValidUrl(url)) {
      throw new Error("Invalid URL");
    }

    const blockSites = await blocksSitesStorage.get("incognitoBlockSites");
    const duplicateUrl = blockSites.find((site) => site.url === url);
    if (duplicateUrl) {
      throw new Error("Site already exists");
    }
    blockSites.push({ url });

    await blocksSitesStorage.set("incognitoBlockSites", blockSites);
    return blockSites;
  }

  static async removeIncognitoBlockSite(url: string) {
    const blockSites = await blocksSitesStorage.get("incognitoBlockSites");
    const newBlockSites = blockSites.filter((site) => site.url !== url);
    await blocksSitesStorage.set("incognitoBlockSites", newBlockSites);
    return newBlockSites;
  }

  static async getPermanentlyBlockedSites() {
    return (await blocksSitesStorage.get("blockSites")).filter(
      (site) => !site.schedule
    );
  }

  static async addPermanentBlockSite(url: string) {
    if (!BlockScheduler.isValidUrl(url)) {
      throw new Error("Invalid URL");
    }

    const blockSites = await blocksSitesStorage.get("blockSites");
    const duplicateUrl = blockSites.find((site) => site.url === url);
    if (duplicateUrl) {
      throw new Error("Site already exists");
    }
    blockSites.push({ url });

    await blocksSitesStorage.set("blockSites", blockSites);
    return blockSites;
  }

  static async addScheduledBlockSite(
    url: string,
    startTime: Date,
    endTime: Date
  ) {
    if (!BlockScheduler.isValidUrl(url)) {
      throw new Error("Invalid URL");
    }

    const blockSites = await blocksSitesStorage.get("blockSites");
    const duplicateUrl = blockSites.find((site) => site.url === url);
    if (duplicateUrl) {
      throw new Error("Site already exists");
    }

    blockSites.push({
      url,
      schedule: {
        startTime: DateModel.convertDateToTime(startTime.getTime()),
        endTime: DateModel.convertDateToTime(endTime.getTime()),
      },
    });
    await blocksSitesStorage.set("blockSites", blockSites);
    return blockSites.filter((site) => site.schedule);
  }

  static async removeBlockSite(url: string) {
    const blockSites = await blocksSitesStorage.get("blockSites");
    const newBlockSites = blockSites.filter((site) => site.url !== url);
    await blocksSitesStorage.set("blockSites", newBlockSites);
  }

  static async addLinkToFocusGroup(groupName: string, urlPattern: string) {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const foundFocusGroupIndex = focusGroups.findIndex(
      (group) => group.name === groupName
    );
    // group already exists, just add link to group
    if (foundFocusGroupIndex > -1) {
      focusGroups[foundFocusGroupIndex].links.push(urlPattern);
      await focusModeStorage.set("focusGroups", focusGroups);
      return focusGroups;
    }
    const newFocusGroup = {
      id: crypto.randomUUID(),
      name: groupName,
      links: [urlPattern],
      isFocusing: false,
    };
    focusGroups.push(newFocusGroup);
    await focusModeStorage.set("focusGroups", focusGroups);
    return focusGroups;
  }

  static async addFocusGroup(groupName: string): Promise<FocusGroup[] | null> {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const foundFocusGroupIndex = focusGroups.findIndex(
      (group) => group.name === groupName
    );
    // group already exists, just add link to group
    if (foundFocusGroupIndex > -1) {
      return null;
    }
    const newFocusGroup = {
      id: crypto.randomUUID(),
      name: groupName,
      links: [],
      isFocusing: false,
    };
    focusGroups.push(newFocusGroup);
    await focusModeStorage.set("focusGroups", focusGroups);
    return focusGroups;
  }

  static async addFocusGroupWithLinks(
    groupName: string,
    urls: string[]
  ): Promise<FocusGroup[] | null> {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const foundFocusGroupIndex = focusGroups.findIndex(
      (group) => group.name === groupName
    );
    // group already exists, just add link to group
    if (foundFocusGroupIndex > -1) {
      const linksSet = new Set(focusGroups[foundFocusGroupIndex].links);
      urls.forEach((url) => linksSet.add(url));
      focusGroups[foundFocusGroupIndex].links = Array.from(linksSet);
      await focusModeStorage.set("focusGroups", focusGroups);
      return focusGroups;
    }
    const newFocusGroup = {
      id: crypto.randomUUID(),
      name: groupName,
      links: urls,
      isFocusing: false,
    };
    focusGroups.push(newFocusGroup);
    await focusModeStorage.set("focusGroups", focusGroups);
    return focusGroups;
  }

  static async getFocusGroupByName(groupName: string) {
    const focusGroups = await focusModeStorage.get("focusGroups");
    return focusGroups.find((group) => group.name === groupName);
  }

  static async removeLinkFromFocusGroup(groupName: string, url: string) {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const foundFocusGroupIndex = focusGroups.findIndex(
      (group) => group.name === groupName
    );
    if (foundFocusGroupIndex === -1) {
      throw new Error("Focus group not found");
    }
    const newLinks = focusGroups[foundFocusGroupIndex].links.filter(
      (link) => link !== url
    );
    focusGroups[foundFocusGroupIndex].links = newLinks;
    await focusModeStorage.set("focusGroups", focusGroups);
    return focusGroups;
  }

  static async removeFocusGroup(groupName: string) {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const newFocusGroups = focusGroups.filter(
      (group) => group.name !== groupName
    );
    await focusModeStorage.set("focusGroups", newFocusGroups);
    return newFocusGroups;
  }

  static async resetAllFocus() {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const newFocusGroups = focusGroups.map((group) => {
      group.isFocusing = false;
      return group;
    });
    await focusModeStorage.set("focusGroups", newFocusGroups);
    return newFocusGroups;
  }

  static async setFocus(groupName: string, isFocusing: boolean) {
    const focusGroups = await focusModeStorage.get("focusGroups");
    const foundFocusGroupIndex = focusGroups.findIndex(
      (group) => group.name === groupName
    );
    if (foundFocusGroupIndex === -1) {
      throw new Error("Focus group not found");
    }
    const newFocusGroups = focusGroups.map((group, index) => {
      if (index === foundFocusGroupIndex) {
        group.isFocusing = isFocusing;
      } else {
        group.isFocusing = false;
      }
      return group;
    });
    await focusModeStorage.set("focusGroups", newFocusGroups);
    return newFocusGroups;
  }
}
