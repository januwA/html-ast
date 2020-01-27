import { AstNode, AST_TEXT, AST_ELEMENT } from "./ast-node";

// 标签起始匹配
// ?: 忽略捕获，只需要分组
export const ncname = "[a-zA-Z_][\\w\\-\\.]*";
export const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
export const startTagOpen = new RegExp(`^<${qnameCapture}`);

/**
 * 匹配tag: <([a-zA-Z_][\w\-\.]*)
 * 匹配任意个属性: ((?:\s*([^\s"'<>\/=]+)\s*=\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))*)
 * 结尾: \s*(\/?)>
 */
export const startTag = /<([a-zA-Z_][\w\-\.]*)((?:\s*([^\s"'<>\/=]+)\s*=\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))*)\s*(\/?)>/;

/**
 * 匹配起始标签的属性
 * class="title"
 * class='title'
 * class=title
 */
export const attribute = /^\s*([^\s"'<>\/=]+)\s*=\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+))?/;

// 标签结束匹配
export const startTagClose = /^\s*(\/?)>/;
export const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);

export function htmlAst(html: string) {
  html = html.trim().replace(/[\r\n\t\v]/g, "");

  /**
   * 存储未匹配完成的起始标签
   * 如：<div><span></span></div>
   * 那么: div,span会被添加到[bufArray]
   * 当开始标签匹配完后，就开始匹配结束标签[parseEndTag]: </span></div>
   */
  const startTagBuffer: AstNode[] = [];
  const rootAstNode: AstNode = new AstNode({
    nodeType: "root"
  });
  let isChars: boolean; // 是不是文本内容
  let match;
  let last;

  while (html && last != html) {
    last = html;
    isChars = true;
    if (html.indexOf("</") === 0) {
      // 结束标签
      match = html.match(endTag);
      if (match) {
        isChars = false;
        html = html.substring(match[0].length);
        parseEndTag(match[1]);
      }
    } else if (html.indexOf("<") === 0) {
      // 起始标签
      match = html.match(startTag);
      if (match) {
        isChars = false;
        html = html.substring(match[0].length);
        parseStartTag({
          tagName: match[1].toLowerCase(),
          attrs: match[2],
          unary: !!match[7]
        });
      }
    }

    // 文本处理
    if (isChars) {
      let index = html.indexOf("<");
      let text;
      if (index < 0) {
        // 就是纯文本
        text = html;
        html = "";
      } else {
        text = html.substring(0, index);
        html = html.substring(index);
      }
      const node: AstNode = new AstNode({
        nodeType: AST_TEXT,
        text
      });
      pushChild(node);
    }
  }

  function pushChild(child: AstNode) {
    if (startTagBuffer.length === 0) {
      rootAstNode.addChild(child);
    } else {
      const parent: AstNode = startTagBuffer[startTagBuffer.length - 1];
      parent.addChild(child);
    }
  }

  function parseStartTag({
    tagName,
    attrs,
    unary
  }: {
    tagName: string;
    attrs: string;

    /**
     * 是否为自闭和标签,最后那个匹配(\/?)的分组
     */
    unary: boolean;
  }) {
    const astNode: AstNode = new AstNode({
      nodeType: AST_ELEMENT,
      tag: tagName
    });
    while (attrs.trim()) {
      const attrMatch = attrs.match(attribute);
      if (attrMatch) {
        const name = attrMatch[1];
        const value = attrMatch[2];
        astNode.setAttr(name, value);
        attrs = attrs.substring(attrMatch[0].length);
      }
    }

    if (unary || AstNode.isSelfClosing(tagName)) {
      pushChild(astNode);
    } else {
      // 非自关闭标签，将被缓存到[startTagBuffer]
      startTagBuffer.push(astNode);
    }
    return "";
  }

  function parseEndTag(tagName: string) {
    let pos = 0;
    for (pos = startTagBuffer.length - 1; pos >= 0; pos--) {
      if (startTagBuffer[pos].tag === tagName) {
        break;
      }
    }
    if (pos >= 0) {
      const node = startTagBuffer.pop();
      if (node) pushChild(node);
    }
  }
  return rootAstNode;
}
