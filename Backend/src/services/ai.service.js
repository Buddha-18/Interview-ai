const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY
});

const interviewReportJsonSchema = {
  type: "object",
  properties: {
    matchScore: {
      type: "number",
      description: "A score between 0 and 100 indicating how well the candidate's profile matches the job requirements"
    },
    technicalQuestions: {
      type: "array",
      description: "Technical questions that can be asked in the interview along with their intention and answer",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The technical question can be asked in the interview"
          },
          intention: {
            type: "string",
            description: "The intention of interviewer behind asking this question"
          },
          answer: {
            type: "string",
            description: "How to answer this question, what points to cover, what approach to take"
          }
        },
        required: ["question", "intention", "answer"]
      }
    },
    behavioralQuestions: {
      type: "array",
      description: "Behavioral questions that can be asked in the interview along with their intention and answer",
      items: {
        type: "object",
        properties: {
          question: {
            type: "string",
            description: "The behavioral question can be asked in the interview"
          },
          intention: {
            type: "string",
            description: "The intention of interviewer behind asking this question"
          },
          answer: {
            type: "string",
            description: "How to answer this question, what points to cover, what approach to take"
          }
        },
        required: ["question", "intention", "answer"]
      }
    },
    skillGaps: {
      type: "array",
      description: "List of skill gaps in the candidate's profile along with their severity",
      items: {
        type: "object",
        properties: {
          skill: {
            type: "string",
            description: "The skill which the candidate is lacking"
          },
          severity: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "The severity of this skill gap, i.e. low, medium, high"
          }
        },
        required: ["skill", "severity"]
      }
    },
    preparationPlan: {
      type: "array",
      description: "A day-wise preparation plan for the candidate to follow in order to prepare",
      items: {
        type: "object",
        properties: {
          day: {
            type: "integer",
            description: "The day number in the preparation plan, starting from 1"
          },
          focus: {
            type: "string",
            description: "The main focus of this day in the preparation plan, e.g. data structures"
          },
          tasks: {
            type: "array",
            items: {
              type: "string"
            },
            description: "List of tasks to be done on this day to follow the preparation plan"
          }
        },
        required: ["day", "focus", "tasks"]
      }
    },
    title: {
      type: "string",
      description: "The title of the interview report for which the report is generated, e.g.Full Stack Developer Interview Report"
    }
  },
  required: [
    "matchScore",
    "technicalQuestions",
    "behavioralQuestions",
    "skillGaps",
    "preparationPlan",
    "title"
  ]
};

const interviewReportSchema = z.fromJSONSchema(interviewReportJsonSchema);

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
  const prompt = `
You are an expert technical recruiter and senior hiring manager. Analyze the candidate's profile against the provided job description and generate an interview evaluation report.

### Candidate Resume:
${resume}

### Candidate Self-Description:
${selfDescription}

### Target Job Description:
${jobDescription}

### Instructions:
1. Calculate a matchScore (0 to 100) reflecting how well the candidate fits the requirements.
2. Formulate relevant technicalQuestions targeting the job domain, including the interviewer's intent and how to answer.
3. Formulate relevant behavioralQuestions evaluating culture fit and teamwork, including the intent and how to answer.
4. Identify critical skillGaps with their severity ('low', 'medium', 'high').
5. Construct a structured, day-wise preparationPlan (starting at day 1) with specific daily focus areas and actionable tasks.
`;

  const interaction = await ai.interactions.create({
    model: "gemini-3.1-flash-lite",
    input: prompt,
    response_format: {
      type: "text",
      mime_type: "application/json",
      schema: interviewReportJsonSchema
    }
  });

  const parsedJson = JSON.parse(interaction.output_text);
  const validatedReport = interviewReportSchema.parse(parsedJson);


  return validatedReport;
}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' } });
  await browser.close();
  return pdfBuffer;
}

async function gererateResumePdf({ resume, selfDescription, jobDescription }) {
  const resumePdfSchema = {
    type: "object",
    properties: {
      html: {
        type: "string",
        description: "The HTML content of the generated resume to convert to PDF."
      }
    },
    required: ["html"]
  };

  const prompt = `Generate a resume for a candidate with the following details:
Resume: ${resume}
Self-Description: ${selfDescription}
Job Description: ${jobDescription}

The response must be a JSON object with a single field "html" containing clean, well-styled, and valid HTML for a professional resume ready for PDF conversion.

The resume should be a tailored for the given job description and should highlight the candidate's strengths, skills, and experiences relevant to the job. The HTML should be well-formated structured,making it easy to read and visually appealing.

The content of resume should not be sound like it's generated by AI and should be close as posssible to a real human-written resume.

you can highlight the content using some colors or different font styles but the overall design should be simple and professional.

The content should be ATS (Applicant Tracking System) friendly, ensuring that it can be easily parsed by automated systems used by employers for resume screening.

The resume should not be too long, it should be concise and to the point, ideally fitting within 1-2 pages long when converted to pdf. Focus on quality rather than quantity and make sure to include only the most relevant information that showcases the candidate's qualifications for the job.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: resumePdfSchema
    }
  });

  const parsedJson = JSON.parse(response.text);
  const validatedContent = z
    .object({ html: z.string() })
    .parse(parsedJson);

  const pdfBuffer = await generatePdfFromHtml(validatedContent.html);
  return pdfBuffer;
}
module.exports = {generateInterviewReport, gererateResumePdf};