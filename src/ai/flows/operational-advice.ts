// operational-advice.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized operational advice to a restaurant owner.
 *
 * The flow takes a section (Menu, Staff, Kitchen, or Stock) as input and uses an LLM to generate tailored advice.
 *
 * @interface OperationalAdviceInput - The input schema for the operational advice flow.
 * @interface OperationalAdviceOutput - The output schema for the operational advice flow.
 * @function getOperationalAdvice - The main function to retrieve operational advice.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OperationalAdviceInputSchema = z.object({
  section: z
    .enum(['Menu', 'Staff', 'Kitchen', 'Stock'])
    .describe('The section for which to provide operational advice.'),
});

export type OperationalAdviceInput = z.infer<typeof OperationalAdviceInputSchema>;

const OperationalAdviceOutputSchema = z.object({
  advice: z
    .string()
    .describe('Personalized operational advice for the specified section.'),
});

export type OperationalAdviceOutput = z.infer<typeof OperationalAdviceOutputSchema>;

export async function getOperationalAdvice(input: OperationalAdviceInput): Promise<OperationalAdviceOutput> {
  return operationalAdviceFlow(input);
}

const operationalAdvicePrompt = ai.definePrompt({
  name: 'operationalAdvicePrompt',
  input: {schema: OperationalAdviceInputSchema},
  output: {schema: OperationalAdviceOutputSchema},
  prompt: `You are a restaurant management consultant providing advice to a restaurant owner.

  Based on the selected section, provide specific and actionable advice for improving operations.

  Section: {{section}}
  Advice:`,
});

const operationalAdviceFlow = ai.defineFlow(
  {
    name: 'operationalAdviceFlow',
    inputSchema: OperationalAdviceInputSchema,
    outputSchema: OperationalAdviceOutputSchema,
  },
  async input => {
    const {output} = await operationalAdvicePrompt(input);
    return output!;
  }
);
