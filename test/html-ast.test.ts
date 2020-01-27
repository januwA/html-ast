import { startTag, attribute, endTag, htmlAst } from "../src";

let html = "";
beforeAll(() => {
  html = `
  <app-root *if="show" [name]="name" >
   <h1 class="red" style="color:red;">hello</h1>
   <hr />
   <app-tile title="title" />
 </app-root>
`;

  html = html.trim().replace(/[\r\n\t\v]/g, "");
});
describe("html-ast", () => {
  it("test startTag", () => {
    const startTagMatch = html.match(startTag);
    expect(startTagMatch).not.toBeNull();
    if (startTagMatch) {
      expect(startTagMatch[0]).toBe(`<app-root *if="show" [name]="name" >`);

      const tagName = startTagMatch[1];
      let attrs = startTagMatch[2].trim();
      expect(tagName).toBe("app-root");
      expect(attrs).toBe(`*if="show" [name]="name"`);
      while (attrs.trim()) {
        const attrMatch = attrs.match(attribute);
        if (attrMatch) {
          const name = attrMatch[1];
          expect(name).not.toBeNull();
          expect(name === "*if" || name === "[name]").toBe(true);
          attrs = attrs.substring(attrMatch[0].length);
        }
      }
    }
  });
  it("test 自关闭标签", () => {
    const startTagMatch = "<img />".match(startTag);
    if (startTagMatch) {
      // 获取捕获的第七个分组，是否有/
      expect(!!startTagMatch[7]).toBe(true);
      expect(startTagMatch[7]).toBe("/");
    }
  });
  it("test endTag", () => {
    const match = "</div>".match(endTag);
    if (match) {
      expect(match[1]).toBe("div");
    }
  });

  it("test htmlAst", () => {
    // const r = htmlAst(html);
    const r = htmlAst(`<div><hr><br><span>hello</span><hr></hr></div>`);
    console.log(JSON.stringify(r));
    expect(r.children![0]!.children![0]!.tag).toBe("hr");
    expect(r.children![0]!.children![1]!.tag).toBe("br");
    expect(r.children![0]!.children![2]!.tag).toBe("span");
  });
});
