# What to do when a component also has traits defined:

A component can also have (optional) traits defined:

```json
{
	"type": "containerSimple",
	"prps": {
		"backgroundColor": "red"
	},
	"traits": [{
		"trait": "path/to/trait",
		"traitPrps": {
			"trait": "props",
			"go": "here"
		}
	}],
	"wgts": []
}
```

When this happens, the component may or may not have a type defined. In the case where it DOES have a type (like above), we render it like this:

```jsx
import { ExternalComponent } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
import MyTrait from 'dashboard/path/to/trait';

const Component = ExternalComponent(() => {
	return (
		<ContainerSimple
			prps={{
				backgroundColor: 'red'
			}}
			traits={[{
				trait: MyTrait,
				traitPrps: {
					trait: 'props',
					go: 'here'
				}
			}]}
		/>
	);
});

export default Component;
```

Remember that the ContainerSimple (or whatever is at the root inside our component) can still have children to be rendered.

Also, note that if the trait path doesn't start with ./ (in this case it was "path/to/trait") we import it from dashboard/path/to/trait. In cases where it DOES start with ./ we import it from "./path/to/trait" since the transpiled trait file will be placed relative to our current component in the file tree.

Next, if the component from json does NOT have a type defined:

```json
{
	"prps": {
		"backgroundColor": "red"
	},
	"traits": [{
		"trait": "./path/to/trait",
		"traitPrps": {}
	}],
	"wgts": []
}
```

it means that one of its traits will be defining the type to be rendered. In those cases, we need to transpile the component like this:

```jsx
import { ExternalComponent } from '@intenda/opus-ui';
import MyTrait from './path/to/trait';

const Component = ExternalComponent(() => {
	return (
		{ExternalComponent()({
			traits: [{
				trait: MyTrait, traitPrps: {}
			}]},
			prps: {
				backgroundColor: 'red'
			}
		)}
	);
});

export default Component;
```

# Child components that have traits

Whenever a child component has traits specified we need to handle it in a similar way:

If it DOES have a type specified:

```json
{
	"type": "containerSimple",
	"prps": {
		"backgroundColor": "red"
	},
	"wgts": [{
		"type": "label",
		"traits": [{
			"trait": "path/to/trait",
			"traitPrps": {}
		}]
	}]
}
```

it becomes:

```jsx
import { ExternalComponent } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
import { Label } from '@intenda/opus-ui-components';
import MyTrait from 'dashboard/path/to/trait';

const Component = ExternalComponent(() => {
	return (
		<ContainerSimple
			prps={{
				backgroundColor: 'red'
			}}
		>
			<Label
				traits={[{
					trait: MyTrait,
					traitPrps: {}
				}]}
			/>
		</ContainerSimple>
	);
});

export default Component;
```

And when it doesn't:

```json
{
	"type": "containerSimple",
	"prps": {
		"backgroundColor": "red"
	},
	"wgts": [{
		"traits": [{
			"trait": "path/to/trait",
			"traitPrps": {}
		}]
	}]
}
```

it becomes:

```jsx
import { ExternalComponent } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
import MyTrait from 'dashboard/path/to/trait';

const Component = ExternalComponent(() => {
	return (
		<ContainerSimple
			prps={{
				backgroundColor: 'red'
			}}
		>
			{ExternalComponent()({
				traits: [{
					trait: MyTrait, traitPrps: {}
				}]},
				prps: {
					backgroundColor: 'red'
				}
			)}
		</ContainerSimple>
	);
});

export default Component;
```