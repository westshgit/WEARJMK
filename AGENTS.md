# Agents

This project uses the Payload CMS skill at `.agents/skills/payload/`.
Start with `.agents/skills/payload/SKILL.md` for a quick reference, then see `.agents/skills/payload/reference/` for detailed docs.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Generated files rule

- Never manually edit `payload-types.ts`; it is auto-generated.
- Don't run any command without permission or leave it to me to run it 
- We are using pnpm so run every scripts with pnpm <package.json scripts> or pnpm dlx
- Always load every `.agents/skills/*` before writing any code. They contain important rules and guidelines for the project.
- Always check the `.agents/skills/payload/reference/` for detailed documentation on Payload CMS usage and best practices.
- Always load and use the agent skills before making any changes to the codebase and follow the rules strictly. The agents are designed to enforce best practices and maintain code quality.
- Once again don't run any command unless explicitly instructed to do so and don't edit any auto-generated files. like `src/payload-types.ts` Always follow the guidelines and best practices outlined in the agent skills and reference documentation.
- Should you need to modify or read files ask for permission and it would be granted or denied based on the context. Always follow the guidelines and best practices outlined in the agent skills and reference documentation.

## Technology Stack 

- React 19
- Next.js 14
- Tailwind CSS 4
- Payload CMS
- TypeScript 6
- Shadcn UI
- Embla Carousel


## Code Smell and Forbidden Practices

- Don't use `any` type in TypeScript. Always define proper types.
- Don't use `console.log` in production code. Use proper logging libraries if needed.
- Don't use inline styles. Use Tailwind CSS classes or styled components.
- Before adding a new dependency, check if it's necessary and if it has good community support.
- Before you implement custom hooks or solution check if there are existing libraries that solve the problem.
- Don't use `!important` in CSS. It can lead to specificity issues and make the code harder to maintain.
- Don't use deprecated React lifecycle methods. Always use the latest recommended practices.
- Don't use class components. Prefer functional components with hooks.
- Don't use state management libraries like Redux or MobX unless absolutely necessary. Prefer React's built-in context and hooks for state management.
- Don't delete or modify existing code without understanding its purpose. Always check with the team before making changes.
- Don't commit large files or sensitive information to the repository. Use `.gitignore` to exclude them.
