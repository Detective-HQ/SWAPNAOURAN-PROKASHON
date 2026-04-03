'use server';
/**
 * @fileOverview This file implements a Genkit flow for personalized book recommendations.
 *
 * - aiBookRecommendationTool - A function that provides personalized book recommendations.
 * - BookRecommendationInput - The input type for the aiBookRecommendationTool function.
 * - BookRecommendationOutput - The return type for the aiBookRecommendationTool function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BookRecommendationInputSchema = z.object({
  browsingHistory: z.array(z.string()).describe('List of book titles the user has recently browsed.'),
  pastPurchases: z.array(z.string()).describe('List of book titles the user has previously purchased.'),
});
export type BookRecommendationInput = z.infer<typeof BookRecommendationInputSchema>;

const BookRecommendationOutputSchema = z.object({
  recommendations: z.array(z.object({
    title: z.string().describe('The title of the recommended book.'),
    author: z.string().describe('The author of the recommended book.'),
  })).describe('A list of personalized book recommendations.'),
});
export type BookRecommendationOutput = z.infer<typeof BookRecommendationOutputSchema>;

const bookRecommendationPrompt = ai.definePrompt({
  name: 'bookRecommendationPrompt',
  input: { schema: BookRecommendationInputSchema },
  output: { schema: BookRecommendationOutputSchema },
  prompt: `You are an expert personalized book recommendation engine for "Swapno Uran Prakashan".
  Given a user's browsing history and past purchases, suggest 3-5 new books that they might enjoy.
  Focus on recommending diverse titles that align with the user's interests and style, drawing inspiration from the user's interaction history.
  The recommendations should feel tailored and thoughtful.

  Browsing History:
  {{#if browsingHistory}}
    {{#each browsingHistory}}- {{this}}
    {{/each}}
  {{else}}None
  {{/if}}

  Past Purchases:
  {{#if pastPurchases}}
    {{#each pastPurchases}}- {{this}}
    {{/each}}
  {{else}}None
  {{/if}}

  Please provide your recommendations in a structured JSON format. Ensure the response adheres strictly to the provided output schema.
  `
});

const aiBookRecommendationFlow = ai.defineFlow(
  {
    name: 'aiBookRecommendationFlow',
    inputSchema: BookRecommendationInputSchema,
    outputSchema: BookRecommendationOutputSchema,
  },
  async (input) => {
    const { output } = await bookRecommendationPrompt(input);
    return output!;
  }
);

export async function aiBookRecommendationTool(input: BookRecommendationInput): Promise<BookRecommendationOutput> {
  return aiBookRecommendationFlow(input);
}
