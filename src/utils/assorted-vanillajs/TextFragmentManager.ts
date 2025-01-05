export class TextFragmentURLManager {
  static createFragmentURL(url: string, text: string) {
    return `${url}#:~:text=${encodeURIComponent(text)}`;
  }

  static createFragmentURLWithStartAndEnd(
    url: string,
    startText: string,
    endText: string
  ) {
    return `${url}#:~:text=${encodeURIComponent(
      startText
    )},${encodeURIComponent(endText)}`;
  }

  constructor(private url: string) {}

  createFragmentURL(text: string) {
    return TextFragmentURLManager.createFragmentURL(this.url, text);
  }

  createFragmentURLWithStartAndEnd(startText: string, endText: string) {
    return TextFragmentURLManager.createFragmentURLWithStartAndEnd(
      this.url,
      startText,
      endText
    );
  }

  createFragmentLink(text: string) {
    const a = document.createElement("a");
    a.href = this.createFragmentURL(text);
    return a;
  }

  createFragmentLinkWithStartAndEnd(startText: string, endText: string) {
    const a = document.createElement("a");
    a.href = this.createFragmentURLWithStartAndEnd(startText, endText);
    return a;
  }
}
