//Opus Component Libraries
import '@intenda/opus-ui-components';
import '@intenda/opus-ui-drag-move';
import '@intenda/opus-ui-grid';

//Opus
import { loadApp, registerComponentTypes } from '@intenda/opus-ui';

//Custom Components
import CustomComponent from './components/customComponent';
import propsCustomComponent from './components/customComponent/props';

//Plugins
import '@intenda/vite-plugin-opus-hot-reload/src/hotReload';

//Styles
import './main.css';

//Custom Component Registration
registerComponentTypes([{
	type: 'customComponent',
	component: CustomComponent,
	propSpec: propsCustomComponent
}]);

//Pure Opus UI Application
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
