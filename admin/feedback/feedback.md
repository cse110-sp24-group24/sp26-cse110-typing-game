# Feedback For Group 25

## Strengths

We thought the overall concept for the project was very creative and stood out compared to a traditional typing game. We especially liked the combination of a cozy detective/investigation atmosphere with typing OOP-style commands as the main gameplay mechanic rather than just a side feature. We also thought the MVP documentation did a great job explaining the gameplay loop, technical direction, and progression systems without feeling vague. The design flowcharts and ADR documentation for choosing ct.js showed strong planning and thoughtful technical decision making. We also liked that ESLint and Jest are already included because it shows your team is thinking about maintainability and testing early in development. Overall, we felt the repository had a strong foundation with clear planning and a unique direction.

## Improvements

The biggest issue we noticed was that several important repository files are still empty or incomplete, especially `README.md`, `index.html`, `main.js`, and `main.css`. Because of this, it is difficult to quickly understand the current state or direction of the project. We also noticed that some of the documentation seems slightly out of sync. Certain files still describe “Compile Quest” with roguelike combat systems, while the MVP focuses more on “The Bunny’s Backlog” detective/investigation gameplay. We think updating or clarifying older documentation would help reduce confusion and make the project direction feel more consistent.

## Questions

We were especially curious about the command parser and syntax validation system since it seems like one of the most important technical systems in the game. How strict do you plan for the parser to be? Will players need exact syntax and punctuation every time, or will the game allow near-correct inputs and provide compiler-style feedback for mistakes? We were also wondering how you plan to scale the parser and validation logic as the game becomes more complex.

We also had some questions about the overall direction of the game. Some documents still reference roguelike mechanics like combat, HP, inventory, and permadeath, while newer documentation focuses much more heavily on investigation and narrative puzzle-solving. Which direction do you see the final game focusing on most, and how do you plan to connect those ideas together?

## Suggestions

We think a good starting point that worked for us to map out the project and begin implementation is using GitHub Issues and setting clear deadlines for completing them during sprints. We also think a really strong next step would be creating a prototype playable version that demonstrates the core gameplay loop from start to finish.

We also think it would help to expand the parser documentation with examples of valid/invalid commands, parser flowcharts, pseudocode, or sample error messages. Since the typing/parser system is such a central part of the project, clearer technical explanations would make the backend architecture easier to understand for collaborators and reviewers.
