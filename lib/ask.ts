import endent from 'endent';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, SchemaType, FunctionCallingMode } from "@google/generative-ai";
import { readMarkdownFiles } from './download';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const CANNOT_ANSWER_SENTINEL = "[CANNOT_ANSWER]";

// Construct a prompt that combines the question with the document content
function getPrompt(question: string, content: string) {
  console.time("getPromptLogic");
  const prompt = endent`
    <documents>
    ${content}
    </documents>

    Please provide a clear, accurate answer to the user's question based only on the information in the documents above. Follow the below instructions CAREFULLY.
    
    Instructions:
    - Provide very concise answers. 
    - Always respond with phrase and link to the relevant document if possible.
    - Do not speculate or make up information. 
    - If you cannot answer the question based *only* on the provided documents, you MUST start your response *exactly* with the phrase: ${CANNOT_ANSWER_SENTINEL}
    - If you can answer, provide the answer directly without the ${CANNOT_ANSWER_SENTINEL} phrase.

    Example of unanswerable question response:
    ${CANNOT_ANSWER_SENTINEL} I cannot find information about the color of the sky in the documents.

    Example of answerable question response:
    Please check the [roles documentation](https://docs.inference.supply/discord-roles) for how to get a role.
    ----------------

    <user_question>
    ${question}
    </user_question>
  `;
  console.timeEnd("getPromptLogic");
  return prompt;
}

export async function ask(question: string): Promise<string | null> {
  console.time("totalAskFunction");

  console.time("readAndMapFiles");
  const files = await readMarkdownFiles();
  const mappedFiles = files.map(file =>
    endent`
      URL: ${file.url}
      CONTENT: ${file.content}
    `
  ).join('\n\n');
  console.timeEnd("readAndMapFiles");

  const prompt = getPrompt(question, mappedFiles);

  console.time("geminiApiCall");
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash", 
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ],
    // No tools needed for this simpler approach
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  console.timeEnd("geminiApiCall");

  const response = result.response;
  let answer = response.text();

  if (answer.startsWith(CANNOT_ANSWER_SENTINEL)) {
    console.log("Model indicated it cannot answer the question based on documents.");
    const genericResponse = "I can only answer questions based on the information available in the provided documents. I couldn't find an answer to your question there.";
    console.timeEnd("totalAskFunction");
    return genericResponse; // Return the generic response string
  }

  console.timeEnd("totalAskFunction");
  return answer.trim(); // Trim any leading/trailing whitespace
}

