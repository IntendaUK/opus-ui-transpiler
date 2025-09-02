// transpile.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_DASHBOARD_DIR = path.resolve(process.cwd(), 'app', 'dashboard');
const TRANSPILED_DIR = path.resolve(process.cwd(), 'transpiled');
const OUT_SRC_DIR = path.join(TRANSPILED_DIR, 'src');
const OUT_DASHBOARD_DIR = path.join(OUT_SRC_DIR, 'dashboard');
const ERRORS_PATH = path.join(TRANSPILED_DIR, 'errors.txt');

const pkgMap = {
	'@intenda/opus-ui': new Set([
		'container', 'containerSimple', 'contextMenuManager', 'dataLoader', 'localStorageManager',
		'modal', 'popup', 'scriptRunner', 'systemModal', 'viewport', 'ExternalComponent'
	]),
	'@intenda/opus-ui-components': new Set([
		'audioPlayer', 'audioRecorder', 'button', 'camera', 'canvas', 'checkbox', 'code', 'datePicker', 'divider',
		'focusLine', 'html', 'icon', 'image', 'input', 'label', 'markdownLabel', 'notifications', 'progressBar', 'radio',
		'repeater', 'resizer', 'slider', 'spinner', 'tab', 'tabContainer', 'timePicker', 'treeview', 'upload', 'url',
		'videoPlayer', 'webSocket'
	]),
	'@intenda/opus-ui-grid': new Set(['grid']),
	'@intenda/opus-ui-drag-move': new Set(['containerDnd', 'containerMovable', 'dragger', 'lineDragger', 'mover']),
	'@intenda/opus-ui-code-editor': new Set(['codeEditor']),
	'@intenda/opus-ui-svg': new Set(['svg']),
	'@intenda/opus-ui-repeater-grid': new Set(['repeaterGrid'])
};

const allKnownTypes = new Set(
	Object.values(pkgMap).flatMap(s => Array.from(s)).filter(x => x !== 'ExternalComponent')
);

const toPascal = k =>
	k.replace(/(^\w|[_-]\w)/g, m => m.replace(/[_-]/g, '').toUpperCase());

const ensureDir = p => fs.mkdirSync(p, { recursive: true });

const readJson = p => JSON.parse(fs.readFileSync(p, 'utf-8'));

const writeFile = (p, content) => {
	ensureDir(path.dirname(p));
	fs.writeFileSync(p, content, 'utf-8');
};

const relOutPathFor = absJsonPath => {
	// app/dashboard/... -> transpiled/src/dashboard/...
	const rel = path.relative(APP_DASHBOARD_DIR, absJsonPath);
	const outRel = rel.replace(/\.json$/i, '.jsx');

	return path.join(OUT_DASHBOARD_DIR, outRel);
};

const findPackageForType = type => {
	for (const [pkg, set] of Object.entries(pkgMap))
		if (set.has(type)) return pkg;

	return null;
};

const collectTypes = (node, accKnown, accUnknown) => {
	if (!node || typeof node !== 'object') return;
	const { type, wgts } = node;
	if (type) {
		if (allKnownTypes.has(type)) accKnown.add(type);
		else accUnknown.add(type);
	}
	if (Array.isArray(wgts)) wgts.forEach(c => collectTypes(c, accKnown, accUnknown));
};

const jsxLiteral = (value, indent = 0) => {
	// Pretty JSON -> JS literal (keeps numbers/booleans/null as-is)
	return JSON.stringify(value, null, 2)
		.replace(/"([^"]+)":/g, '"$1":') // keep keys quoted (safe)
		.replace(/:\s*"([^"]*)"/g, (m, s) => {
			// strings remain strings; OK for props literal
			return `: "${s.replace(/"/g, '\\"')}"`;
		})
		.split('\n')
		.map((l, i) => (i === 0 ? l : '  '.repeat(indent) + l))
		.join('\n');
};

const buildElement = (node, indent = 2) => {
	// If no type -> Child mda fallback
	if (!node.type) {
		const mdaText = jsxLiteral(node, indent + 1);

		return [
			' '.repeat(indent) + '<Child mda={',
			mdaText,
			' '.repeat(indent) + '} />'
		].join('\n');
	}

	// If known type -> JSX tree
	const typePascal = toPascal(node.type);
	const attrs = [];
	// pipe optional root props if present
	['container', 'id', 'scope', 'relId', 'traits', 'prps'].forEach(k => {
		if (node[k] !== undefined) {
			const lit = jsxLiteral(node[k], indent + 1);
			attrs.push(`${' '.repeat(indent + 1)}${k}={${lit}}`);
		}
	});

	let opening = `${' '.repeat(indent)}<${typePascal}`;
	if (attrs.length) opening += '\n' + attrs.join('\n');

	const children = Array.isArray(node.wgts) ? node.wgts : [];
	if (!children.length) {
		// self-close
		return opening + (attrs.length ? `\n${' '.repeat(indent)}/>` : ' />');
	}

	const childrenJsx = children.map(ch => buildElement(ch, indent + 2)).join('\n');

	return [
		opening + (attrs.length ? '\n' : '') + '>',
		childrenJsx,
    `${' '.repeat(indent)}</${typePascal}>`
	].join('\n');
};

const transpileDashboard = (absJsonPath, unknownTypesGlobal) => {
	const json = readJson(absJsonPath);

	// Trait vs Component
	const isTrait = Object.prototype.hasOwnProperty.call(json, 'acceptPrps');
	const outPath = relOutPathFor(absJsonPath);

	if (isTrait) {
		const traitCode = `const trait = ${JSON.stringify(json, null, 2)};\n\nexport default trait;\n`;
		writeFile(outPath, traitCode);

		return;
	}

	// Component
	// If no type anywhere or unknown type present: render ExternalComponent with Child fallback
	const known = new Set();
	const unknown = new Set();
	collectTypes(json, known, unknown);
	unknown.forEach(t => unknownTypesGlobal.add(t));

	const needsChildFallback = !json.type || (json.type && !allKnownTypes.has(json.type));

	// Imports
	const importBuckets = new Map(); // pkg -> Set(Names)
	const addImport = (pkg, name) => {
		if (!importBuckets.has(pkg)) importBuckets.set(pkg, new Set());
		importBuckets.get(pkg).add(name);
	};

	// Always need ExternalComponent
	addImport('@intenda/opus-ui', 'ExternalComponent');

	if (!needsChildFallback) {
		// add all used types in this file
		known.forEach(t => {
			const pkg = findPackageForType(t);
			if (pkg) addImport(pkg, toPascal(t));
		});
	}

	let body;
	if (needsChildFallback) {
		const mdaText = JSON.stringify(json, null, 2);
		body = `
const Component = ExternalComponent(({ Child }) => {
  return (
    <Child mda={${mdaText}} />
  );
});

export default Component;
`.trimStart();
	} else {
		const tree = buildElement(json, 2);
		body = `
const Component = ExternalComponent(() => {
  return (
${tree}
  );
});

export default Component;
`.trimStart();
	}

	// Build import lines
	const importLines = [];
	for (const [pkg, names] of importBuckets.entries()) {
		const list = Array.from(names).sort().join(', ');
		importLines.push(`import { ${list} } from '${pkg}';`);
	}
	importLines.sort();

	const fileCode = `${importLines.join('\n')}\n\n${body}`;
	writeFile(outPath, fileCode);
};

const generateMain = startupRelImportPath => {
	// startupRelImportPath should be relative to transpiled/src, like './dashboard/appDashboard.jsx'
	const code = `import React from 'react';
import { createRoot } from 'react-dom/client';
import Opus from '@intenda/opus-ui';
import StartupDashboardNameHere from '${startupRelImportPath}';

const root = createRoot(document.getElementById('root'));

root.render(
  <Opus startupComponent={<StartupDashboardNameHere />} />
);
`;
	writeFile(path.join(OUT_SRC_DIR, 'main.jsx'), code);
};

const loadStartupPath = () => {
	const indexPath = path.join(APP_DASHBOARD_DIR, 'index.json');
	if (!fs.existsSync(indexPath))
		throw new Error('Missing app/dashboard/index.json');

	const idx = readJson(indexPath);
	const startup = idx.startup;
	if (!startup || typeof startup !== 'string')
		throw new Error('"startup" not found or invalid in app/dashboard/index.json');

	// Most common case: app/dashboard/<startup>.json
	// Also support nested startup like "some/folder/index"
	let startupJsonPath = path.join(APP_DASHBOARD_DIR, `${startup}.json`);
	if (!fs.existsSync(startupJsonPath)) {
		// try if startup already includes .json
		if (fs.existsSync(path.join(APP_DASHBOARD_DIR, startup)))
			startupJsonPath = path.join(APP_DASHBOARD_DIR, startup);
		else
			throw new Error(`Startup dashboard JSON not found for "${startup}"`);
	}

	const outJsxPath = relOutPathFor(startupJsonPath);
	const relFromSrc = './' + path.relative(OUT_SRC_DIR, outJsxPath).replace(/\\/g, '/');

	return relFromSrc;
};

const walkJsonFiles = dir => {
	const out = [];
	const items = fs.readdirSync(dir, { withFileTypes: true });
	for (const it of items) {
		const full = path.join(dir, it.name);
		if (it.isDirectory())
			out.push(...walkJsonFiles(full));
		else if (it.isFile() && it.name.toLowerCase().endsWith('.json'))
			out.push(full);
	}

	return out;
};

const main = () => {
	// Prepare output dirs
	ensureDir(OUT_DASHBOARD_DIR);
	const unknownTypes = new Set();
	const errors = [];

	// 1) Transpile all dashboards/traits
	if (!fs.existsSync(APP_DASHBOARD_DIR))
		throw new Error(`Expected ${APP_DASHBOARD_DIR} to exist.`);

	const files = walkJsonFiles(APP_DASHBOARD_DIR).filter(p => path.basename(p).toLowerCase() !== 'index.json');

	files.forEach(f => {
		try {
			transpileDashboard(f, unknownTypes);
		} catch (e) {
			errors.push(`Failed to transpile ${path.relative(process.cwd(), f)}: ${e.message}`);
		}
	});

	// 2) Generate main.jsx wired to startup component
	let startupImport;
	try {
		startupImport = loadStartupPath();
		generateMain(startupImport);
	} catch (e) {
		errors.push(`Failed to generate main.jsx: ${e.message}`);
	}

	// 3) Emit errors (unknown types etc.)
	const unknownList = Array.from(unknownTypes).sort();
	const errorText = [
		unknownList.length ? `Unknown component types encountered (rendered via <Child mda={...}> fallback):\n${unknownList.join('\n')}\n` : '',
		errors.length ? `Transpilation errors:\n${errors.join('\n')}\n` : ''
	].join('\n').trim();

	if (errorText) {
		writeFile(ERRORS_PATH, errorText + '\n');
		console.warn(`\n[transpile] Wrote warnings to ${path.relative(process.cwd(), ERRORS_PATH)}\n`);
	}

	// 4) Create a minimal index.html so vite can run the transpiled app, if you want
	const indexHtmlPath = path.join(TRANSPILED_DIR, 'index.html');
	if (!fs.existsSync(indexHtmlPath)) {
		writeFile(indexHtmlPath, `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Transpiled Opus App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`);
	}

	console.log('[transpile] Done.');
};

try {
	main();
} catch (e) {
	console.error('[transpile] Fatal:', e.message);
	process.exit(1);
}
