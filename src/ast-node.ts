export const AST_ELEMENT = "element";
export const AST_TEXT = "text";
export const AST_DATA_ATTR = "data-";

export interface AstNodeDataSet {
  [k: string]: string;
}

export interface AstNodeAttr {
  name: string;
  value: string;
}

export interface AstNodeOpt {
  nodeType: string;
  text?: string;
  tag?: string;
  dataset?: AstNodeDataSet;
  attrs?: AstNodeAttr[];
  children?: AstNode[];
}

export class AstNode {
  static isSelfClosing(tag: string) {
    return (
      [
        "br",
        "hr",
        "area",
        "base",
        "img",
        "input",
        "link",
        "meta",
        "basefont",
        "param",
        "col",
        "frame",
        "embed",
        "keygen",
        "source",
        "command",
        "track",
        "wbr"
      ].indexOf(tag) !== -1
    );
  }
  nodeType: string;
  text?: string;
  tag?: string;
  dataset?: AstNodeDataSet;
  attrs?: AstNodeAttr[];
  children?: AstNode[];
  constructor(opt: AstNodeOpt) {
    this.nodeType = opt.nodeType;
    this.text = opt.text;
    this.tag = opt.tag;
    this.dataset = opt.dataset;
    this.attrs = opt.attrs;
    this.children = opt.children;
  }

  setAttr(name: string, value: string) {
    if (name && name.startsWith(AST_DATA_ATTR)) {
      this._setDataSet(name, value);
    } else {
      this._setAttr(name, value);
    }
  }

  private _setDataSet(name: string, value: string) {
    if (!this.dataset) {
      this.dataset = {};
    }
    // data-a-s=xxx -> dataset.AS=xxx
    this.dataset[
      name
        .replace(AST_DATA_ATTR, "")
        .replace(/(?:-(\w))/g, (m, g1) => g1.toUpperCase())
    ] = value;
  }

  private _setAttr(name: string, value: string) {
    if (!this.attrs) {
      this.attrs = [];
    }

    this.attrs.push({
      name: name,
      value: value
    });
  }

  addChild(child: AstNode) {
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
  }
}
