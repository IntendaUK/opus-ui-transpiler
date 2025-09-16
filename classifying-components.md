# Intro

Whenever we transpile a component, we need to figure out the base type and child components

Write a node.js app that

1. Reads from the current folder `app.json`  
2. Traverses all objects within the json structure starting inside the `dashboard` object  
3. Ignore all objects unless they are components  
   An object is a component if: 
   * It has a type, scope, relId, acceptPrps, trait, or traits key, and  
   * If the traits key is present, it must be an array and it must have a length > 0
   * It does not have a `key` property (this would mean it's a grid column config)  
   * It is not a functional trait
    * Functional traits are objects that have acceptPrps defined, and
    * Do not have traits arrays
    * Have prps defined
    * Do not have type or wgts defined
   * It is not a trait prop spec  
     * **Definition:** An object is a trait prop spec if its **immediate parent key** is `acceptPrps`.  
       ```json
       {
         "acceptPrps": {
           "anyStringGoesHere": {
             "This is a trait prop spec"
           }
         }
       }
       ```
   * It is not a function arg spec  
     * **Definition:** An object is a function arg spec if its **immediate parent key** is `acceptArgs`.  
       ```json
       {
         "acceptArgs": {
           "anyStringGoesHere": {
             "This is a function arg spec"
           }
         }
       }
       ```
   * It is not a script action. Script actions are objects in these exact positions:  
     * If the **immediate parent key** is `actions`:  
       ```json
       { "actions": [{ "This is a script action" }] }
       ```
     * If the **immediate parent key** is `chain`:  
       ```json
       { "chain": [{ "This is a script action" }] }
       ```
     * If the **immediate parent key** is `morphActions`:  
       ```json
       { "morphActions": [{ "This is a script action" }] }
       ```
     * If the **immediate parent key** is `traitArray` and the parent value is an array:  
       ```json
       { "traitArray": [{ "This is a script action" }] }
       ```
     * If the **grandparent key** is `branch` and the parent key is any string or integer:  
       ```json
       { "branch": { "anyStringOrIntegerGoesHere": [{ "This is a script action" }] } }
       ```
     * If the **immediate parent key** is `reduction`:  
       ```json
       { "reduction": { "This is a script action" } }
       ```
     * If the **immediate parent key** is `"true"` or `"false"`:  
       ```json
       { "true": [{ "This is a script action" }], "false": [{ "This is also a script action" }] }
       ```
   * When an object isn't a component, we should not try to classify it — just move on.
4. If a component has the trait key, we can interpret that as traits: [{ trait, traitPrps }]. Both trait and traitPrps can be found on the component itself (it's a shorthand)
5. If any component has a trait that does not resolve, ignore it
6. Figure out the base type of the component (check next section)  
7. Figure out the child components of the component (also in the next section)  
8. All components that do not fit any of the scenarios in the next section must be exported to unclassified.json in the format  
```json
[{
  "path": "path/to/the/components/in/app/file",
  "component": {
    "this is the component object"
  }
}]
If the component also has a traits array, we need to resolve those traits in the exported file.

Traits look like this:
```json
{
  "traits": [{
    "trait": "path/to/trait",
    "..."
  }]
}
```

or

```json
{
  "traits": [
    "path/to/trait"
  ]
}
```

And to resolve the trait, we need to find its definition at app.json/dashboard/path/to/trait.json (note we append to only the last part of the path the .json string. So something like @l2_modal_panel/index must become dashboard/@l2_modal_panel/index.json).

When traits are present and the component base type isn't resolved, we need to export it like this:

```json
[{
  "path": "path/to/the/components/in/app/file",
  "component": {
    "this is the component object",
    "...traits": [{
      "trait": "path/to/trait",
      "...": "...",
      "def": {
        "this is the trait itself (which we found from the app.json by resolving the path)"
      }
    }]
  }
}]
```

We also need to export all resolved components in resolved.json like this:
```json
[{
  "path": "...",
  "type": "base type",
  "basePath": "(optional) this is the path to the trait that defines our type (and possibly children too). Read more about this in scenario 4",
  "children": "the length of the children array"
}]
```

Also, log in the console, how many are resolved, how many unresolved and the total % that is resolved

# Classifying Scenarios

* In these scenarios, asterisk bullets define the requirements (all must be true, not just some of them for each scenario)
* Components don't all NEED child components to be defined. A component can exist without children
* Whenever traits are mentioned, it refers to the trait definition itself (we need to resolve it from the path). Furthermore, it refers to the trait definition's root level, not some nested object inside the trait
* If type ever has a % or { character inside it, it's automatically marked as unclassified

1.
* Component has a type
* Component has no traits

-> In this case, the base type is defined by the component's type property
-> The child components are defined by the component's wgts property

2.
* Component has a type specified
* Component has traits
* None of the trait defs have traits themselves in their root level
* None of the trait defs have a type
* None of the trait defs have a wgts array

-> In this case, the base type is defined by the component's type property
-> The child components are defined by the component's wgts property

3.
* Component has a type specified
* Component has traits
* None of the trait defs have traits themselves in their root level
* One or more of the trait defs have a type specified
* None of the trait defs have a wgts array

-> In this case, the base type is defined by the component's type property (we ignore the type in the traits' defs)
-> The child components are defined by the component's wgts property

4.
* Component does not have a type specified
* Component has traits
* None of the trait defs have traits themselves in their root level
* One of the trait defs has a type
* None of the trait defs have a wgts array

-> In this case, the base type is defined by the relevant trait's type property
-> The child components are defined by the component's wgts property

5.
* Component does not have a type specified
* Component has traits
* Component does not have a wgts array
* At least one of the trait defs have traits themselves. We resolve those too and find one that has a type specified (recursively...stop as soon as we find one)

-> The base type is defined by the trait we found
-> The child components is also defined by that trait we found (stored as wgts)