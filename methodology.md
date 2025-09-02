Transpiler building process:

Within a single repository, I do the following:

1. Write extensive documentation on what the transpiler can expect in JSON components and how all those examples should be transpiled.

2. To support the assumptions made by step 1, modify Opus UI (the Library version) since the way that Opus UI Lib is used by react devs isn't something that's 'standardized' yet. I still have lots of room to move around in to support the 'perfect form'.

3. Build a few dozen samples (in one single, small app) of these JSON components.

4. In another document (readme.md), write out how the repository is put together (where the docs are, in which order they should be read), and finally, explain to the AI what it is that is ewxpected of it (build a transpiler that takes all the documentation into account).

5. In VSCode, tell Cline to read the 'readme.md' file and act accordingly (read all the docs and build the transpiler).

6. Run the transpiler.
6.1. If there are any errors (it doesn't run, or it runs but crashes halfway through), go back to step #3 and polish the prompt.

7. If there no errors (it ran) run the transpiled sample application and ensure eveything runs as expected.
7.1. If there are issues, go back to step #1 once I identify shortcomings in the docs.

8. If there are no issues, run the transpiler in legoz.
8.1. If legoz runs with issues, go back to step #1 once I identify shortcomings in the docs.

9. In VSCode, ask Cline to make small- to medium-sized modifications to the transpiled Legoz app. If it struggles, it is likely due to the way in which OpusUI is being used is too far away from patterns that are already common. To recitify this, investigate ways in which to bring our state management syntax/patterns closer to popular state management solutions: "MobX", "Zustand", and "Jotai". For styling: "Tailwind" and "Styled Components".

10. Once I've identified ways in which to change how Opus UI, go back to step #1 with these modifications in mind.