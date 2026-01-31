"use server";

import { getOperationalAdvice, type OperationalAdviceInput } from '@/ai/flows/operational-advice';

export async function getAdviceAction(input: OperationalAdviceInput): Promise<{ success: boolean; data?: { advice: string; }; error?: string; }> {
    try {
        const result = await getOperationalAdvice(input);
        return { success: true, data: result };
    } catch (error) {
        console.error("Error getting operational advice:", error);
        return { success: false, error: "Failed to get advice. Please check the server logs and try again." };
    }
}
