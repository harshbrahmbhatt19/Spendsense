import { getGroqClient } from "@/config/groq";
import { env } from "@/config/env";
import {
  getMonthTotals,
  getLastNMonths,
  getCategoryBreakdown,
  getHighestTransactions,
  getAverageDailyExpense,
} from "@/services/analytics.service";
import { AIConversation } from "@/models/AIConversation";

// Builds ONLY an aggregated, structured summary of the user's finances - never
// raw transaction dumps - to hand to the LLM. This keeps the prompt small,
// keeps individual transaction text out of the model, and matches the spec's
// requirement to aggregate on the backend first.
export const buildFinancialContext = async (userId: string) => {
  const now = new Date();
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [currentMonth, previousMonth, last6Months, topExpenseCategories, topIncomeCategories, highestExpenses, avgDaily] =
    await Promise.all([
      getMonthTotals(userId, now.getFullYear(), now.getMonth() + 1),
      getMonthTotals(userId, prevDate.getFullYear(), prevDate.getMonth() + 1),
      getLastNMonths(userId, 6),
      getCategoryBreakdown(userId, monthStart, now, "expense"),
      getCategoryBreakdown(userId, monthStart, now, "income"),
      getHighestTransactions(userId, monthStart, now, 5),
      getAverageDailyExpense(userId, monthStart, now),
    ]);

  return {
    currentMonthIncome: currentMonth.income,
    currentMonthExpense: currentMonth.expense,
    currentMonthSavings: currentMonth.savings,
    savingsRate: currentMonth.income > 0 ? Math.round((currentMonth.savings / currentMonth.income) * 100) : 0,
    previousMonthIncome: previousMonth.income,
    previousMonthExpense: previousMonth.expense,
    last6MonthsTrend: last6Months.map((m) => ({ month: `${m.year}-${String(m.month).padStart(2, "0")}`, income: m.income, expense: m.expense, savings: m.savings })),
    topExpenseCategories: topExpenseCategories.slice(0, 5).map((c) => ({ name: c.name, amount: c.total, percentOfExpenses: c.percent })),
    topIncomeCategories: topIncomeCategories.slice(0, 5).map((c) => ({ name: c.name, amount: c.total })),
    highestExpensesThisMonth: highestExpenses.map((t: any) => ({ title: t.title, amount: t.amount, category: t.categoryId?.name || "Uncategorized", date: t.date })),
    averageDailyExpenseThisMonth: avgDaily.average,
    hasSufficientData: currentMonth.income > 0 || currentMonth.expense > 0 || last6Months.some((m) => m.income > 0 || m.expense > 0),
  };
};

const SYSTEM_PROMPT = `You are SpendSense's AI Financial Assistant. You help the user understand their spending and improve financial habits.

STRICT RULES:
- You will be given a JSON "financial context" object aggregated from the user's real transaction data. This is the ONLY source of truth about their finances.
- NEVER invent, guess, or hallucinate any transaction, amount, or category that is not present in the provided context.
- If the context does not contain enough information to answer a question, clearly say so instead of guessing.
- Do NOT give investment advice (stocks, mutual funds, crypto, where to invest money). If asked, politely explain that's outside what you can help with and redirect to spending analysis.
- Focus on spending analysis, budgeting habits, and financial awareness.
- Keep responses concise, specific, and reference actual numbers from the context when relevant.
- Use the same currency the amounts are already in (assume the platform's configured currency; do not convert).

RESPONSE FORMAT RULES - IMPORTANT:
- ONLY use plain text, no markdown, no tables, no special formatting
- Use standard hyphens (-) for bullet points only, not special dashes
- Use regular numbers (1., 2., 3.) for numbered lists
- Separate ideas with blank lines (press Enter twice between sections)
- Use ONLY basic ASCII characters - no special Unicode symbols or dashes
- Keep responses simple and readable on mobile devices
- Each tip or point should be on its own line
- Example format:
  Tip 1: This is the first tip
  How to do it: Explain the steps clearly
  
  Tip 2: This is the second tip
  How to do it: Explain the steps clearly`;

export const askFinancialAssistant = async (
  userId: string,
  message: string
): Promise<{ reply: string; conversationId: string }> => {
  const context = await buildFinancialContext(userId);

  let conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 });
  if (!conversation) {
    conversation = new AIConversation({ userId, messages: [] });
  }

  conversation.messages.push({ role: "user", content: message, createdAt: new Date() });

  const groq = getGroqClient();

  // Only send recent turns (not the whole history) to keep the prompt compact.
  const recentTurns = conversation.messages.slice(-10).map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const completion = await groq.chat.completions.create({
    model: env.groqModel,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: `Financial context (JSON):\n${JSON.stringify(context)}` },
      ...recentTurns,
    ],
    temperature: 0.4,
    max_tokens: 600,
  });

  const reply =
    completion.choices[0]?.message?.content?.trim() ||
    "I wasn't able to generate a response. Please try again.";

  conversation.messages.push({ role: "assistant", content: reply, createdAt: new Date() });
  await conversation.save();

  return { reply, conversationId: conversation._id.toString() };
};

export const getConversationHistory = async (userId: string) => {
  const conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 });
  return conversation?.messages || [];
};

export const clearConversation = async (userId: string) => {
  await AIConversation.deleteMany({ userId });
};
