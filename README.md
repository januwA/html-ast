HTML字符串转化为HTML-AST

## 测试
```
$ npm i
$ npm t
```

- [参考](https://juejin.im/post/5d9c16686fb9a04e320a54c0)
- [参考](https://github.com/vuejs/vue/blob/dev/src/compiler/parser/html-parser.js)
- [astexplorer](https://astexplorer.net/)


```js
const r = htmlAst(`<div><hr><br><span>hello</span><hr></hr></div>`);
console.log(JSON.stringify(r));

// r
{
	"nodeType": "root",
	"children": [
		{
			"nodeType": "element",
			"tag": "div",
			"children": [
				{
					"nodeType": "element",
					"tag": "hr"
				},
				{
					"nodeType": "element",
					"tag": "br"
				},
				{
					"nodeType": "element",
					"tag": "span",
					"children": [
						{
							"nodeType": "text",
							"text": "hello"
						}
					]
				},
				{
					"nodeType": "element",
					"tag": "hr"
				}
			]
		}
	]
}
```