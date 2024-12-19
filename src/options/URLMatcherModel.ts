/**
 * Generate a URL match/glob pattern.
 * @param {string} url - The URL to be transformed into a pattern.
 * @param {MatchOptions} options - Matching options.
 * @returns {string | null} - The URL pattern or null if an error occurs.
 */
type MatchOptions = {
  matchDomain?: boolean;
  matchPath?: boolean;
  matchExact?: boolean;
  matchQuery?: boolean;
};

export class URLMatcherModel {
  static getURLFromPattern(pattern: string): string {
    return pattern.replace("*", "");
  }

  static isMatch(url: string, pattern: string): boolean {
    const regex = new RegExp(
      `^${pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace("*", ".*")}$`
    );
    console.log("pattern", pattern);
    console.log("url", url);
    console.log(
      "regex",
      pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace("*", ".*")
    );
    return regex.test(url);
  }

  static getPatternType(pattern: string): keyof MatchOptions {
    if (pattern.endsWith("/*")) return "matchDomain";
    if (pattern.endsWith("*") && !pattern.includes("?")) return "matchPath";
    if (!pattern.includes("*")) return "matchExact";
    if (pattern.includes("?")) return "matchQuery";
    return "matchExact";
  }

  static generateUrlPattern(
    url: string,
    options: MatchOptions = {}
  ): string | null {
    const {
      matchDomain = false,
      matchPath = false,
      matchExact = false,
      matchQuery = false,
    } = options;

    try {
      const urlObj = new URL(url);

      if (matchExact) {
        return url; // Exact match includes the full URL.
      }

      if (matchQuery) {
        return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}${urlObj.search}`; // Match domain, path, and query.
      }

      if (matchDomain) {
        return `${urlObj.protocol}//${urlObj.hostname}/*`; // Match only the domain.
      }

      if (matchPath) {
        return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}*`; // Match domain and path.
      }

      throw new Error(
        `Invalid options: One of the match options must be true.`
      );
    } catch (error) {
      console.error("Invalid URL or options provided:", error);
      return null;
    }
  }
}
