import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function analyzeSeoData(scrapedData) {
  try {
    const prompt = `
You are an expert SEO analyst.

Analyze the following website and return ONLY valid JSON.

Website URL: ${scrapedData.url}

Title: ${scrapedData.metaData?.title || ""}
Description: ${scrapedData.metaData?.description || ""}
Canonical: ${scrapedData.metaData?.canonical || ""}

H1 Count: ${scrapedData.headings?.h1 || 0}
H2 Count: ${scrapedData.headings?.h2 || 0}

Internal Links: ${scrapedData.links?.internal || 0}
External Links: ${scrapedData.links?.external || 0}

Images: ${scrapedData.images?.total || 0}
Missing Alt: ${scrapedData.images?.missingAlt || 0}

Word Count: ${scrapedData.wordCount || 0}

Page Content:
${scrapedData.bodyText?.substring(0, 4000)}

Return JSON in exactly this format:

{
  "overallScore": number,
  "categories": {
    "seo": number,
    "performance": number,
    "accessibility": number,
    "bestPractices": number
  },
  "keywords":[
    {
      "word":"string",
      "count":number,
      "density":number
    }
  ],
  "issues":[
    {
      "severity":"critical|warning|info",
      "category":"SEO",
      "message":"string",
      "recommendation":"string"
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: {
        type: "json_object",
      },
    });

const content = completion.choices[0].message.content;

console.log("========== GROQ RESPONSE ==========");
console.log(content);
console.log("===================================");

const analysis = JSON.parse(content);

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    console.error("Groq analysis error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
}