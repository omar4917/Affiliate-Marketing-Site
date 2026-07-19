import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const metadataDefinition = () =>
  z
    .object({
      title: z.string().optional(),
      ignoreTitleTemplate: z.boolean().optional(),

      canonical: z.url().optional(),

      robots: z
        .object({
          index: z.boolean().optional(),
          follow: z.boolean().optional(),
        })
        .optional(),

      description: z.string().optional(),

      openGraph: z
        .object({
          url: z.string().optional(),
          siteName: z.string().optional(),
          images: z
            .array(
              z.object({
                url: z.string(),
                width: z.number().optional(),
                height: z.number().optional(),
              })
            )
            .optional(),
          locale: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),

      twitter: z
        .object({
          handle: z.string().optional(),
          site: z.string().optional(),
          cardType: z.string().optional(),
        })
        .optional(),
    })
    .optional();

const postCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/post' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    excerpt: z.string().optional(),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    imageTitle: z.string().optional(),

    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),

    metadata: metadataDefinition(),
  }),
});

const reviewCollection = defineCollection({
  loader: glob({ pattern: ['*.md', '*.mdx'], base: 'src/data/review' }),
  schema: z.object({
    publishDate: z.date().optional(),
    updateDate: z.date().optional(),
    draft: z.boolean().optional(),

    title: z.string(),
    category: z.string(),
    image: z.string().optional(),
    rating: z.number().optional(),
    price: z.string().optional(),
    verdict: z.string().optional(),
    features: z.array(z.string()).optional(),
    affiliateUrl: z.string(),
    ctaText: z.string().optional(),
    isWinner: z.boolean().optional(),
    winnerLabel: z.string().optional(),
    ribbonColor: z.enum(['primary', 'secondary', 'accent', 'success', 'warning']).optional(),
    description: z.string().optional(),
    specs: z.record(z.string(), z.string()).optional(),
    pros: z.array(z.string()).optional(),
    cons: z.array(z.string()).optional(),

    metadata: metadataDefinition(),
  }),
});

export const collections = {
  post: postCollection,
  review: reviewCollection,
};
