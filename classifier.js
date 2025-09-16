// classifier.js
// Node.js app to traverse app.json, classify components, and export results

const fs = require('fs');
const path = require('path');

const APP_PATH = path.join(process.cwd(), 'app.json');
const UNRESOLVED_PATH = path.join(process.cwd(), 'unclassified.json');
const RESOLVED_PATH = path.join(process.cwd(), 'resolved.json');

// ---------------- helpers ----------------

function loadApp () {
	return JSON.parse(fs.readFileSync(APP_PATH, 'utf8'));
}

function isFunctionalTrait (obj) {
	return (
		obj &&
    typeof obj === 'object' &&
    'acceptPrps' in obj &&
    !('traits' in obj) &&
    'prps' in obj &&
    !('type' in obj) &&
    !('wgts' in obj)
	);
}

function isComponent (obj, parentKey, grandparentKey, parentIsArray) {
	if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;

	if (
		!('type' in obj ||
      'scope' in obj ||
      'relId' in obj ||
      'acceptPrps' in obj ||
      'trait' in obj ||
      'traits' in obj)
	)
		return false;

	if ('traits' in obj && (!Array.isArray(obj.traits) || obj.traits.length === 0)) return false;
	if ('key' in obj) return false; // grid column configs
	if (isFunctionalTrait(obj)) return false;
	if (parentKey === 'acceptPrps') return false; // trait prop spec
	if (parentKey === 'acceptArgs') return false; // function arg spec
	if (
		parentKey === 'actions' ||
    parentKey === 'chain' ||
    parentKey === 'morphActions' ||
    (parentKey === 'traitArray' && parentIsArray) ||
    grandparentKey === 'branch' ||
    parentKey === 'reduction' ||
    parentKey === 'true' ||
    parentKey === 'false'
	) return false; // script actions

	return true;
}

// Normalize shorthand { trait, traitPrps } into traits array
function normalizeTraits (component) {
	if (component.trait) {
		const t = { trait: component.trait };
		if (component.traitPrps) t.traitPrps = component.traitPrps;
		component.traits = Array.isArray(component.traits) ? [...component.traits, t] : [t];
		delete component.trait;
		delete component.traitPrps;
	}

	return component;
}

/**
 * Resolve a trait path like "@l2_modal_panel/index"
 * → go into app.dashboard["@l2_modal_panel"]["index.json"]
 */
function resolveTrait (app, traitPath) {
	if (!traitPath) return null;
	const parts = traitPath.split('/');
	let node = app.dashboard;
	for (let i = 0; i < parts.length; i++) {
		const part = parts[i];
		const key = i === parts.length - 1 ? part + '.json' : part;
		if (!(key in node)) return null;
		node = node[key];
	}

	return node;
}

// recursively walk traits until a type is found (scenario 5)
function recursiveResolveTrait (app, traitPath, seen = new Set(), depth = 0) {
	if (!traitPath) return null;
	if (depth > 50) {
		console.warn(`[MAX-DEPTH] ${traitPath}`);

		return null;
	}
	if (seen.has(traitPath)) {
		console.warn(`[CYCLE] already seen ${traitPath}`);

		return null;
	}

	console.log(`[RESOLVE] depth=${depth} path=${traitPath}`);
	seen.add(traitPath);

	const def = resolveTrait(app, traitPath);
	if (!def) {
		console.warn(`[MISSING DEF] ${traitPath}`);

		return null;
	}

	if (def.type) {
		console.log(`[FOUND TYPE] ${traitPath} -> ${def.type}`);

		return {
			type: def.type,
			basePath: traitPath,
			children: Array.isArray(def.wgts) ? def.wgts.length : 0
		};
	}

	if (Array.isArray(def.traits) && def.traits.length > 0) {
		for (const tr of def.traits) {
			const subPath = typeof tr === 'string' ? tr : tr?.trait;
			if (subPath) {
				console.log(`  [DESCEND] from ${traitPath} -> ${subPath}`);
				const res = recursiveResolveTrait(app, subPath, seen, depth + 1);
				if (res) return res;
			}
		}
	}

	return null;
}

// ---------------- classification ----------------

function classifyComponent (component, app) {
	// Normalize shorthand trait → traits array
	component = normalizeTraits(component);

	// type with % or { → unclassified
	if (component.type && (component.type.includes('%') || component.type.includes('{')))
		return { classified: false };

	const traits = component.traits || [];
	const resolvedTraits = traits.map(tr => {
		if (typeof tr === 'string') {
			return {
				trait: tr,
				def: resolveTrait(app, tr)
			};
		} else if (tr && tr.trait) {
			return {
				...tr,
				def: resolveTrait(app, tr.trait)
			};
		}

		return tr;
	});

	// if any trait does not resolve → ignore this component
	if (resolvedTraits.some(t => t && !t.def && typeof t.trait === 'string')) {
		console.warn(`[IGNORE COMPONENT] unresolved trait in ${component.scope || component.relId || 'unknown'}`);

		return {
			classified: false,
			ignore: true
		};
	}

	const traitDefs = resolvedTraits.map(t => t.def).filter(Boolean);

	// --- Scenario 1 ---
	if (component.type && traits.length === 0) {
		return {
			classified: true,
			type: component.type,
			children: Array.isArray(component.wgts) ? component.wgts.length : 0
		};
	}

	// --- Scenario 2 ---
	if (component.type && traits.length > 0) {
		const badDefs = traitDefs.some(td => td?.type || td?.wgts || td?.traits);
		if (!badDefs) {
			return {
				classified: true,
				type: component.type,
				children: Array.isArray(component.wgts) ? component.wgts.length : 0
			};
		}
	}

	// --- Scenario 3 ---
	if (component.type && traits.length > 0) {
		const badDefs = traitDefs.some(td => td?.wgts || td?.traits);
		const typedTraits = traitDefs.filter(td => td?.type);
		if (typedTraits.length >= 1 && !badDefs) {
			return {
				classified: true,
				type: component.type,
				children: Array.isArray(component.wgts) ? component.wgts.length : 0
			};
		}
	}

	// --- Scenario 4 ---
	if (!component.type && traits.length > 0) {
		const typedTraits = traitDefs.filter(td => td?.type);
		const badDefs = traitDefs.some(td => td?.wgts || td?.traits);
		if (typedTraits.length === 1 && !badDefs) {
			return {
				classified: true,
				type: typedTraits[0].type,
				basePath: resolvedTraits.find(t => t.def?.type)?.trait,
				children: Array.isArray(component.wgts) ? component.wgts.length : 0
			};
		}
	}

	// --- Scenario 5 ---
	if (!component.type && traits.length > 0 && !component.wgts) {
		for (const t of resolvedTraits) {
			const traitPath = typeof t === 'string' ? t : t?.trait;
			const res = recursiveResolveTrait(app, traitPath);
			if (res) {
				return {
					classified: true,
					type: res.type,
					basePath: res.basePath,
					children: res.children
				};
			}
		}
	}

	// default → unresolved
	return {
		classified: false,
		traits: resolvedTraits
	};
}

// ---------------- traversal ----------------

function traverse (
	node,
	app,
	currentPath = [],
	parentKey = null,
	grandparentKey = null,
	parentIsArray = false,
	results = {
		resolved: [],
		unresolved: []
	}
) {
	if (typeof node !== 'object' || node === null) return results;

	if (isComponent(node, parentKey, grandparentKey, parentIsArray)) {
		const classification = classifyComponent(node, app);
		if (classification.classified) {
			results.resolved.push({
				path: currentPath.join('/'),
				type: classification.type,
				basePath: classification.basePath,
				children: classification.children
			});
		} else if (!classification.ignore) {
			const compCopy = JSON.parse(JSON.stringify(node));
			if (classification.traits) compCopy.traits = classification.traits;
			results.unresolved.push({
				path: currentPath.join('/'),
				component: compCopy
			});
		}
	}

	if (Array.isArray(node)) {
		node.forEach((child, i) =>
			traverse(child, app, [...currentPath, i], parentKey, grandparentKey, true, results)
		);
	} else {
		for (const key of Object.keys(node))
			traverse(node[key], app, [...currentPath, key], key, parentKey, Array.isArray(node), results);
	}

	return results;
}

// ---------------- main ----------------

function main () {
	const app = loadApp();
	const results = traverse(app.dashboard, app, ['dashboard']);

	fs.writeFileSync(RESOLVED_PATH, JSON.stringify(results.resolved, null, 2));
	fs.writeFileSync(UNRESOLVED_PATH, JSON.stringify(results.unresolved, null, 2));

	const resolvedCount = results.resolved.length;
	const unresolvedCount = results.unresolved.length;
	const total = resolvedCount + unresolvedCount;
	const pct = total === 0 ? 0 : ((resolvedCount / total) * 100).toFixed(2);

	console.log(`Resolved: ${resolvedCount}`);
	console.log(`Unresolved: ${unresolvedCount}`);
	console.log(`Resolved %: ${pct}%`);
}

main();
