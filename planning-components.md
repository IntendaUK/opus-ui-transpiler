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

Not all component can have child components (wgts) but note that child components can be infinitely nested.

What we need to do is convert it to this:

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