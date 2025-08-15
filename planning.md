

# Planning

This project must be able to take any opus-ui application and transpile it into an application that contains no json files. Instead, each dashboard within the application must be defined as a .jsx file.

A project to be converted will look like this:

your-project/
	app/     -> contains all the .json files that the app is built from
	public/  -> to be kept as is
	src/     -> contains (possibly) many custom js files already built for the app

Projects will always be vite applications and contain a main.jsx file within the src folder

The first part of the conversion will require the transpiler to modify specific parts of the src/main.jsx file:

```jsx
import '@intenda/opus-ui-components';
import '@intenda/opus-ui-drag-move';
import '@intenda/opus-ui-grid';

import { loadApp, registerComponentTypes } from '@intenda/opus-ui';

import CustomComponent from './components/customComponent';
import propsCustomComponent from './components/customComponent/props';

import '@intenda/vite-plugin-opus-hot-reload/src/hotReload';

import './main.css';

registerComponentTypes([{
	type: 'customComponent',
	component: CustomComponent,
	propSpec: propsCustomComponent
}]);

(async() => {
	const res = await fetch('/app.json')
	const mdaPackage = await res.json();

	const env = import.meta.env.VITE_APP_MODE;

	loadApp({
		mdaPackage,
		config: {
			env
		}
	});
})();
```

Specifically:

1. Remove the entire `(async() => {`` block and replace it with this:
```jsx
const root = createRoot(document.getElementById('root'));

root.render(
	<Opus startupComponent={<nameOfStartupFileHere />} />
);
```

2. Change the import from opus-ui to also import the default export (plus whatever else is there):
```jsx
import Opus, { registerComponentTypes } from '@intenda/opus-ui';
````

We also need to import the "nameOfStartupFileHere" component at the top, we can import that from a path that's defined in app/dashboard/index.json:
```json
{
	"startup": "appDashboard",
	"themes": [
		"system",
		"colors",
		"global",
		"components"
	],
	"themeSets": []
}
```

The only thing we care about is the startup value. That tells us that the first dashboard we want to render resides in app/dashboard/appDashboard.json

Once this has been done, we need to convert each file within the app/dashboard folder (recursively) to a jsx file within the src/dashboard folder

If a file resides in app/dashboard/some/folder/index.json then the corresponding jsx file should be placed in src/dashboard/some/folder/index.jsx

Now let's look at some rules for how this transpilation should work.

A json file will define either a component, or a trait. A component and trait should be transpiled in different ways.

# Component Transpilation
A component is any dashboard that doesn't have "acceptPrps" defined inside the root level object. I will look something like this:

```json
{
	"type": "containerSimple",
	"prps": {
		"backgroundColor": "red"
	},
	"wgts": [{
		"type": "label",
		"prps": {
			"cpt": "Hello world!"
		}
	}]
}
```

Not all component can have child componets (wgts) but note that child components can be infinitely nested.

What we need to do is convert it to something like this:

```jsx
import { ExternalComponent } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
import { Label } from '@intenda/opus-ui-components';

const Component = ExternalComponent(() => {
	return (
		<ContainerSimple prps={{
			backgroundColor: 'red'
		}}>
			<Label prps={{
				cpt: 'Hello world!'
			}} />
		</ContainerSimple>
	);
});

export default Component;
```

To figure out where to import a component from, this should be used as a foundation:

'@intenda/opus-ui'
container
containerSimple
contextMenuManager
dataLoader
localStorageManager
modal
popup
scriptRunner
systemModal
viewport

'@intenda/opus-ui-components'
audioPlayer
audioRecorder
button
camera
canvas
checkbox
code
datePicker
divider
focusLine
html
icon
image
input
label
markdownLabel
notifications
progressBar
radio
repeater
resizer
slider
spinner
tab
tabContainer
timePicker
treeview
upload
url
videoPlayer
webSocket

'@intenda/opus-ui-grid'
grid

'@intenda/opus-ui-drag-move'
containerDnd
containerMovable
dragger
lineDragger
mover

'@intenda/opus-ui-code-editor'
codeEditor

'@intenda/opus-ui-svg'
svg

'@intenda/opus-ui-repeater-grid'
repeaterGrid

If anything is found (any type) that doesn't match an import, output it to a file called errors during transpilation.

Components can also look like this:

```json
{
	"container": "some id here",
	"id": "static id here",
	"scope": "component scope here",
	"relId": "relId here",
	"type": "containerSimple",
	"prps": {},
	"wgts": []
}
```

container, id, scope, relId, prps, wgts are all optional but they must all be piped into the jsx component in the same way:

```jsx
<ComponentTypeHere
	prps={},
	container={},
	id={},
	etc...
/>
```

# What to do when a component also has traits defined:


A component can also have (optional) traits defined:

```json
{
	"type": "containerSimple",
	"prps": {
		"backgroundColor": "red"
	},
	"traits": [{
		"trait": "path here",
		"traitPrps": {
			"trait": "props",
			"go": "here"
		}
	}],
	"wgts": []
}
```

When this happens, the component may or may not have a type defined. In the case where it does have a type, we render it like this:

```jsx
import { TraitedComponent } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
//Other imports here

const Component = TraitedComponent(({ traitChildren }) => {
	return (
		<ContainerSimple prps={{
			backgroundColor: 'red'
		}}>
			{/* Children here if present, else the next line */}
			{traitChildren}
		</ContainerSimple>
	);
}, {
	traits: [{
		trait: 'path to the trait jsx file goes here (because traits will be transpiled into jsx too)',
		traitPrps: {
			trait: 'props',
			go: 'here'
		}
	}]
});

export default Component;
```

Note that we only have `{ traitChildren }` present in the function signature if the root level component does NOT have child components.

When we have a component that has traits but does NOT have a component type defined, we need to transpile it like this:

```jsx
import { TraitedComponent } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
//Other imports here

const Component = TraitedComponent(({ RenderComponent, traitChildren }) => {
	return (
		<RenderComponent prps={{
			backgroundColor: 'red'
		}}>
			{/* Children here if present, else the next line */}
			{traitChildren}
		</RenderComponent>
	);
}, {
	traits: [{
		trait: 'path to the trait jsx file goes here (because traits will be transpiled into jsx too)',
		traitPrps: {
			trait: 'props',
			go: 'here'
		}
	}]
});

export default Component;
```

As before, we only need to include traitChildren if the root level component does not have child components.

# Transpiling traits
If we find a JSON file that has acceptPrps in the root object, it means it's a trait. It needs to be transpiled like this:

```jsx
import { TraitDefinition } from '@intenda/opus-ui';
import { ContainerSimple } from '@intenda/opus-ui';
//Other imports here

const Component = TraitDefinition(() => {
	return (
		<RenderComponent prps={{
			backgroundColor: 'red'
		}}>
			{/* Children here if present */}
		</RenderComponent>
	);
}, {
	traits: [{
		trait: 'path to the trait jsx file goes here (because traits will be transpiled into jsx too)',
		traitPrps: {
			trait: 'props',
			go: 'here'
		}
	}]
});

export default Component;
```

# Child components that have traits

Whenever a child component has traits specified we need to handle it a bit differently

# Final
What we need is a nodejs application that will run within a given folder (an application). Within the current directory, there will be a src and app folder and when the node application runs, it must make a NEW folder called "transpiled" and in that, it must create the new src/main.jsx file and all the transpiled components in src/dashboard/...
