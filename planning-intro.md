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
	<Opus startupComponent={<Startup />} />
);
```

2. Change the import from opus-ui to also import the default export (plus whatever else is there):
```jsx
import Opus, { registerComponentTypes } from '@intenda/opus-ui';
````

We also need to import the startup component at the top, we can import that from a path that's defined in app/dashboard/index.json:
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

It will look something like

```jsx
import Startup from './dashboard/<resolved-startup-path>'; // e.g. './dashboard/appDashboard'
```

The only thing we care about is the startup value. That tells us that the first dashboard we want to render resides in app/dashboard/appDashboard.json

Once this has been done, we need to convert each file within the app/dashboard folder (recursively) to a jsx file within the src/dashboard folder. Do this with a breadth first search so we can ensure we're not missing any files.

If a file resides in app/dashboard/some/folder/index.json then the corresponding jsx file should be placed in src/dashboard/some/folder/index.jsx

Now let's look at some rules for how this transpilation should work.

A json file will define either a component, or a trait. A component and trait should be transpiled in different ways.