function listToJSONBlob(list: any[]) {
  return new Blob([JSON.stringify(list)], {
    type: "application/json",
  });
}

function downloadBlob(blob: Blob, filename: string) {
  let url = URL.createObjectURL(blob);

  let a = document.createElement("a");

  a.style.display = "none";
  a.href = url;
  a.download = filename;

  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

/*
 * Uses JSON to stringify arguments and parses them back
 *
 */
export class ObjectSet<T extends Record<string, any>> {
  private set: Set<string>;
  constructor(data?: T[]) {
    this.set = new Set<string>();
    if (data) {
      this.addAll(data);
    }
  }

  public get size() {
    return this.set.size;
  }

  public get setData() {
    return this.set;
  }

  add(data: T) {
    const stringified = JSON.stringify(data);
    return this.set.add(stringified);
  }

  addAll(data: T[]) {
    data.forEach((datum) => {
      const stringified = JSON.stringify(datum);
      this.set.add(stringified);
    });
  }

  delete(data: T) {
    const stringified = JSON.stringify(data);
    return this.set.delete(stringified);
  }

  has(data: T) {
    const stringified = JSON.stringify(data);
    return this.set.has(stringified);
  }

  forEach(cb: (data: T) => void) {
    for (let stringified of this.set) {
      const data = JSON.parse(stringified);
      cb(data);
    }
  }

  getAllData(): T[] {
    const data = [...this.set];
    return data.map((str) => JSON.parse(str));
  }

  downloadAsJSON(filename: string) {
    const blob = listToJSONBlob(this.getAllData());
    downloadBlob(blob, filename);
  }
}
