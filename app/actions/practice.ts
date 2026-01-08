"use server"

export async function generateMathProblem(topicName: string) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error("OpenRouter API key not configured")
  }

  const prompt = `Generate a single practice problem for the topic: "${topicName}".
Return ONLY a valid JSON object with this structure:
{
  "instruction": "string",
  "expression": "string",
  "answer": "string or number",
  "explanation": "string"
}`

  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-small-3.2-24b-instruct:free",
        messages: [
          { role: "system", content: "You are a JSON-only math problem generator." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    })

    if (!res.ok) {
      const errData = await res.json().catch(() => null)
      throw new Error((errData as any)?.error?.message || res.statusText || "OpenRouter API error")
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || ""
    if (!text) throw new Error("No content returned from OpenRouter API")

    const problemData = JSON.parse(text)
    if (!problemData.expression || problemData.answer === undefined) {
      throw new Error("Invalid problem structure returned by model")
    }

    return {
      instruction: problemData.instruction || "Solve",
      expression: problemData.expression,
      answer: problemData.answer,
      explanation: problemData.explanation || "",
    }
  } catch (err) {
    console.error(err)
    throw new Error(err instanceof Error ? err.message : "Failed to generate problem.")
  }
}
