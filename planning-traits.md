# Transpiling traits
If we find a JSON file that has acceptPrps in the root object, it means it's a trait:

```json
{
	"acceptPrps": {
		"accepted": "props",
		"go": "here",
		"props": {
			"can": "also",
			"be": {
				"infinitely": {
					"complex": "!!!"
				}
			}
		}
	},
	"type": "label",
	"prps": {
		"backgroundColor": "red"
	}
}
```

It needs to be transpiled like this:

```jsx
const trait = {
	acceptPrps: {
		accepted: 'props',
		go: 'here',
		props: {
			can: 'also',
			be: {
				infinitely: {
					complex: '!!!'
				}
			}
		}
	},
	type: 'label',
	prps: {
		backgroundColor: 'red'
	}
};

export default trait;
```

Regardless of how the trait looks in json, it needs to be recreated exactly in jsx. Even if the trait itself has traits, or types, or not types. Recreate exactly.