// Reads the model's JSON answer while it is still being written, so the app
// can show each dish as soon as it is complete. The answer looks like
// {"kind":"menu","items":[{...},{...}]}; every finished {...} inside "items"
// is handed out once. Pure, unit-tested.

export class ItemStreamParser {
  private buffer = "";
  private pos = -1; // where scanning continues inside the items array (-1: not found yet)
  private depth = 0;
  private inString = false;
  private escaped = false;
  private start = 0;
  private finished = false;
  kind: string | null = null;

  // Adds the next piece of text; returns the items completed by it.
  push(delta: string): unknown[] {
    this.buffer += delta;
    if (this.kind === null) this.kind = this.buffer.match(/"kind"\s*:\s*"(\w+)"/)?.[1] ?? null;
    if (this.pos < 0) {
      const key = this.buffer.search(/"items"\s*:\s*\[/);
      if (key < 0) return [];
      this.pos = this.buffer.indexOf("[", key) + 1;
    }

    const items: unknown[] = [];
    for (; this.pos < this.buffer.length && !this.finished; this.pos++) {
      const c = this.buffer[this.pos];
      if (this.inString) {
        if (this.escaped) this.escaped = false;
        else if (c === "\\") this.escaped = true;
        else if (c === '"') this.inString = false;
      } else if (c === '"') {
        this.inString = true;
      } else if (c === "{" || c === "[") {
        if (this.depth === 0) this.start = this.pos;
        this.depth++;
      } else if (c === "}" || c === "]") {
        if (this.depth === 0) {
          this.finished = true; // the closing ] of "items"
        } else if (--this.depth === 0) {
          try {
            items.push(JSON.parse(this.buffer.slice(this.start, this.pos + 1)));
          } catch {
            // Not valid on its own: skipped here, the final answer is checked again.
          }
        }
      }
    }
    return items;
  }
}
