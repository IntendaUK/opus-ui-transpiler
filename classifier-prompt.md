Write a new file called `classifier.js`. It should analyze the `app.json` file and classify components by whether they can be transpiled from Opus UI to React components.

Recurse all objects under `dashboard`.  

Identify **unresolved components**, defined (for now) as:  
* Any object with a `traits` array of length > 0  

Furthermore, a component is **resolved** (so not unresolved) if:
Scenarios:
1.
* It doesn't have a type
* It doesn't have a wgts array
* It has only one trait and that trait's def contains a type

2.
* It doesn't have a type
* It doesn't have a wgts array
* Exactly one of its traits has a type in its def or it has multiple traits with a type in their def but all of those traits also have a condition (on the trait itself, not in the def)
* No other traits (besides the previous one) have type, wgts or traits arrays of length > 0

3.
* It has does not have a wgts array of length > 0
* Exactly one of its traits has a type in its def
* At most one of its traits has wgts in its def's root level
* None of its traits have a traits array themselves of length > 0

4.
* It has a wgts array of length > 0
* Exactly one of its traits has a type in its def
* None of its traits has wgts in its def's root level
* None of its traits have a traits array themselves of length > 0

5.
* It has any trait that has a def of null

6.
* It has a type specified
* It has no traits that have type or wgts specified

7.
* It has no type of wgts specified
* It has at least 1 trait
* One and only one of its traits also has its own traits array with a length of at least 1

8.
* The traits array has a length of 1 exactly and the trait def has a traitArray defined

9.
* It has a 'key' property (this would mean it's a grid column)

For each unresolved component:  
* Export it to `unresolved.json` as [ { path: 'this is the path to the component', json: { this is the json }}] 
* When exporting, normalize its `traits`:  
  * If a trait is just a string (e.g. `"like"`), convert it to `{ trait: "like" }`.   
  * If a trait is already an object with `"trait"`, keep it but normalize it into `{ trait: "value", ... }`.  
* For each trait, resolve its definition from `dashboard/.../*.json` and inject it as a new property:  
 ```json
 {
   "trait": "path/goes/here",
   "traitDef": { /* full definition object */ }
 }
 ```
 If no definition is found, set `"traitDef": null`.  

Write all unresolved components to `unresolved.json` in the format:  
```json
[
 { ...componentOrTraitWithNormalizedTraits },
 { ... },
 ...
]
```

After writing, log in the console how many unresolved entries were exported and also show how many of each scenario was found, like this:

Exported 1084 unresolved components to unresolved.json
Resolution stats:
  Scenario 1: 1630
  Scenario 2: 211
  Scenario 3: 15
  Scenario 4: 172
  Scenario 5: 524
  etc.
  Unresolved: 1084
