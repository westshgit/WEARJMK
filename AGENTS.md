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

## Architecture and Feature Scope

- Do not change the project's architecture or introduce new features unless the user explicitly requests that specific architectural change or feature.
- A general instruction such as "fix it," "go ahead," or "make it work" does not authorize creating new routes, endpoints, services, transport mechanisms, abstractions, dependencies, or architectural boundaries.
- Default to the smallest change that fixes the issue within the project's existing architecture and established patterns.
- If an architectural change or new feature appears necessary, stop before implementing it. Explain the problem, the proposed change, affected files and behavior, alternatives, and tradeoffs, then wait for the user's explicit approval.
- Do not infer approval from earlier messages or from permission to edit files. Architectural approval must be obtained through direct communication about the proposed design.

## Technology Stack

- React 19
- Next.js 16.2.6
- Tailwind CSS 4
- Payload CMS
- TypeScript 6
- Shadcn UI
- Embla Carousel
- Bun

## Project-Specific Boundaries

- The application root is `source/`. Run project scripts from that directory using pnpm.
- This project uses Next.js 16.2.6. Read the relevant local documentation under `source/node_modules/next/dist/docs/` before changing Next.js behavior.
- Payload configuration is imported by multiple environments, including Payload API routes, GraphQL routes, Server Components, and tooling. Do not import environment-specific modules into `payload.config.ts`, collections, globals, fields, or plugins without first checking every import graph.
- Never import `next/cache`, browser-only APIs, or client references through modules consumed by Payload configuration unless the existing architecture explicitly supports it.
- Keep client and server module graphs separate. A file marked `'use client'` must not import mixed server barrels, Payload configuration, database APIs, cache hooks, or server-only utilities.
- Client Components that call Server Actions must import those actions directly from their `'use server'` module.
- Do not import from `@/lib/api` inside Client Components. Use a direct API or Server Action module path.
- Cache readers, cache invalidation hooks, and ordinary API functions have different responsibilities. Do not combine or move them across module boundaries without explicit architectural approval.
- Do not add internal HTTP requests, routes, endpoints, webhooks, queues, services, or transport layers as implementation details without explicit approval.
- Payload hooks must preserve `req`, `req.context`, and transaction behavior. Nested Payload operations must receive the original `req`.
- Respect `req.context.disableRevalidate` when working with existing cache invalidation hooks.

## Change Workflow

- Before editing, inspect the target file, its direct consumers, and its import graph.
- When fixing a build-boundary error, identify the originating Client or Server Component before changing shared infrastructure.
- Prefer a direct import correction or a small module split over redesigning the caching or request architecture.
- Preserve user changes discovered while working. If a file changed after it was read, reread it and adapt the patch.
- Do not run builds, tests, type generation, migrations, package installation, or development servers unless the user explicitly authorizes that command.
- Do not modify `payload-types.ts` or other generated files manually.
- Do not add dependencies without explaining why the existing toolchain cannot solve the problem and receiving approval.

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
