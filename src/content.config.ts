import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['Backend', 'Frontend', 'DevOps', 'Tooling', 'CS Fundamentals', 'Algorithms', 'Projects']),
    subcategory: z.enum([
      'Java', 'Spring', 'Python', 'Database', 'API · Architecture',
      'JavaScript', 'React', 'Vue', 'Nexacro', 'WebSquare',
      'CI/CD', 'Docker', 'Cloud', 'Infrastructure',
      'Git · GitHub', 'IDE', 'Testing', 'AI · Codex',
      'Network', 'Operating System', 'Database Fundamentals', 'Data Structure',
      'Implementation', 'Search', 'Dynamic Programming', 'Problem Solving',
      'Team Project', 'Personal Project', 'Retrospective',
    ]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
