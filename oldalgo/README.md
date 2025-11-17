# algorithm

## To-do
- Finalize format for data fetched from CRN
- Add more features

## Explanation
This folder just contains some logic that can be used for the algorithm.
In the final product, stuff will need to be rewritten to fit in the React app as a whole.

## To use
Run `node`, then dynamically import an mjs file thusly:
```js
let alg = await import("./makeSchedule.mjs");
let gen = alg.solve([[],[]]);
await gen.next();
```

## Files
- **makeSchedule.mjs** has some basic logic that creates a schedule using a brute-force algorithm.
- **parseHtml.mjs** has some utilities to parse the non-JSON endpoints into a non-finalized format.
