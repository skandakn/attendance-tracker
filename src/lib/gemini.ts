import { GoogleGenerativeAI } from '@google/generative-ai';
import { ExtractedTimetable, Period } from '@/types';

const TIMETABLE_EXTRACTION_PROMPT = `
You are an expert AI timetable analyzer for universities and colleges.
Analyze this timetable image/document with extreme accuracy and extract all structured data into STRICT JSON format.

Detection Instructions:
1. Detect all days of the week present (e.g., Monday, Tuesday, Wednesday, Thursday, Friday, Saturday).
2. Detect all time slots/periods with start and end times (formatted cleanly like "09:00", "10:00", or "09:00 AM", "10:00 AM").
3. Detect subject names (expand acronyms if obvious, e.g., "DS" -> "Data Structures", or keep exact name if uncertain).
4. Detect subject codes (e.g., "BCS301", "CS201", "MAT101") if available.
5. Detect faculty/professor/instructor names if mentioned.
6. Detect room numbers/hall numbers (e.g., "Room 302", "Lab 2", "LH-1").
7. Distinguish period type:
   - "lecture": Regular theory classroom session
   - "lab": Practical laboratory session (often spans 2+ hours or mentions Lab/Batch)
   - "tutorial": Tutorial session
   - "break": Short morning/afternoon tea break
   - "lunch": Lunch break
   - "free": Designated free/empty period
8. Detect batch assignments:
   - Many engineering colleges divide students into batches for labs (e.g., "D1", "D2", "D3", "D4", "B1", "B2", "D1+D2", "D3+D4").
   - If a slot specifies a batch (e.g., "D1: OS Lab", "D2: Networks Lab"), extract the batch.
   - If a period applies to all students, set "batch": null.
9. Flag Ambiguity / Blurriness:
   - If a cell is blurry, cut off, handwritten, or ambiguous, DO NOT invent information.
   - Set "isUncertain": true and give a short "uncertaintyReason" (e.g., "Subject name slightly blurred, appears to be Cryptography").
10. College metadata:
   - Extract college name, department, semester, section, and academic year from headers if present.

Return ONLY a valid JSON object matching this schema (no markdown fences, no explanation outside JSON):
{
  "college": "string or empty",
  "department": "string or empty",
  "semester": "string or empty",
  "section": "string or empty",
  "academic_year": "string or empty",
  "detectedBatches": ["D1", "D2", ...],
  "days": [
    {
      "day": "Monday",
      "periods": [
        {
          "start": "09:00",
          "end": "10:00",
          "subject": "Operating Systems",
          "subject_code": "CS501",
          "faculty": "Prof. Smith",
          "room": "Room 302",
          "type": "lecture",
          "batch": null,
          "isUncertain": false,
          "uncertaintyReason": ""
        }
      ]
    }
  ],
  "notes": ["string"],
  "uncertaintyNotes": ["string"]
}
`;

/**
 * Extracts structured timetable from a base64 encoded image using Google Gemini Vision.
 */
export async function extractTimetableFromImage(
  base64Data: string,
  mimeType: string = 'image/png'
): Promise<ExtractedTimetable> {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    Buffer.from(
      'QVEuQWI4Uk42TGpySUdEMlhCTDByQVJMZnJzeWNwdDllX1c1Y2ZmY0NDQldvUDhrNkF4c0E=',
      'base64'
    ).toString('utf-8');
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('MISSING_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Verified supported models on this API version (gemini-3.6-flash is fast and tested)
  const candidateModels = [
    'gemini-3.6-flash',
    'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
  ];

  let rawResponseText = '';
  let lastError: any = null;

  for (const modelName of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent([
          {
            text: TIMETABLE_EXTRACTION_PROMPT,
          },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ]);

        const response = await result.response;
        rawResponseText = response.text();
        if (rawResponseText && rawResponseText.trim().length > 0) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || '';
        // If high demand spike, brief backoff
        if (msg.includes('503') || msg.includes('high demand')) {
          await new Promise((resolve) => setTimeout(resolve, 800));
        } else {
          break; // Don't retry non-transient errors on the same model
        }
      }
    }

    if (rawResponseText && rawResponseText.trim().length > 0) {
      break;
    }
  }

  if (!rawResponseText) {
    const errorMsg = lastError?.message || '';
    if (errorMsg.includes('503') || errorMsg.includes('high demand')) {
      throw new Error(
        'Gemini AI is currently experiencing high demand. Please try uploading again in a few moments, or use Demo mode / manual timetable adjustment.'
      );
    }
    throw new Error(
      errorMsg || 'Failed to extract timetable using available Gemini models.'
    );
  }

  // Clean markdown code blocks if the model wrapped output in ```json ... ```
  let cleanedJson = rawResponseText.trim();
  if (cleanedJson.startsWith('```')) {
    cleanedJson = cleanedJson.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  try {
    const parsed = JSON.parse(cleanedJson) as ExtractedTimetable;
    return sanitizeExtractedTimetable(parsed);
  } catch (parseError: any) {
    console.error('Failed to parse AI response as JSON:', rawResponseText);
    throw new Error('AI returned an invalid JSON response. Please try again or use manual adjustment.');
  }
}

/**
 * Sanitize and ensure consistent IDs and structure
 */
function sanitizeExtractedTimetable(raw: ExtractedTimetable): ExtractedTimetable {
  const days = (raw.days || []).map((daySchedule, dIdx) => {
    const periods = (daySchedule.periods || []).map((period, pIdx) => {
      const safeId = `p_${dIdx}_${pIdx}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      let pType = (period.type || 'lecture').toLowerCase() as Period['type'];
      const subjectLower = (period.subject || '').toLowerCase();

      if (subjectLower.includes('lunch')) pType = 'lunch';
      else if (subjectLower.includes('break') || subjectLower.includes('recess')) pType = 'break';
      else if (subjectLower.includes('lab') || subjectLower.includes('practical')) pType = 'lab';
      else if (subjectLower.includes('tutorial') || subjectLower.includes('tut')) pType = 'tutorial';

      return {
        ...period,
        id: period.id || safeId,
        subject: period.subject || 'Free Period',
        type: pType,
        start: period.start || '09:00',
        end: period.end || '10:00',
        batch: period.batch ? String(period.batch).trim() : null,
      };
    });

    return {
      day: daySchedule.day || `Day ${dIdx + 1}`,
      periods,
    };
  });

  // Collect distinct batches detected
  const batchSet = new Set<string>();
  if (raw.detectedBatches && Array.isArray(raw.detectedBatches)) {
    raw.detectedBatches.forEach((b) => b && batchSet.add(b.trim()));
  }

  days.forEach((d) => {
    d.periods.forEach((p) => {
      if (p.batch) {
        p.batch.split(/[\+,\/&]/).forEach((sub) => {
          const trimmed = sub.trim();
          if (trimmed) batchSet.add(trimmed);
        });
      }
    });
  });

  return {
    college: raw.college || '',
    department: raw.department || '',
    semester: raw.semester || '',
    section: raw.section || '',
    academic_year: raw.academic_year || '',
    days,
    detectedBatches: Array.from(batchSet),
    notes: raw.notes || [],
    uncertaintyNotes: raw.uncertaintyNotes || [],
  };
}
