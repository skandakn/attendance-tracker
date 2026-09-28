import { NextRequest, NextResponse } from 'next/server';
import { extractTimetableFromImage } from '@/lib/gemini';
import { Subject } from '@/types';

// Curated harmonious color palette for subjects
const SUBJECT_COLORS = [
  '#4F46E5', // Indigo
  '#059669', // Emerald
  '#2563EB', // Blue
  '#D97706', // Amber
  '#7C3AED', // Violet
  '#DB2777', // Pink
  '#0891B2', // Cyan
  '#EA580C', // Orange
  '#16A34A', // Green
  '#9333EA', // Purple
  '#0284C7', // Sky
];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let imageBase64 = '';
    let mimeType = 'image/png';

    if (contentType.includes('application/json')) {
      try {
        const body = await req.json();
        imageBase64 = body.imageBase64 || '';
        mimeType = body.mimeType || 'image/png';
      } catch (jsonErr) {
        return NextResponse.json(
          { error: 'INVALID_JSON', message: 'Malformed JSON payload.' },
          { status: 400 }
        );
      }
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'NO_FILE', message: 'No file uploaded' }, { status: 400 });
      }
      mimeType = file.type || 'image/png';
      const arrayBuffer = await file.arrayBuffer();
      imageBase64 = Buffer.from(arrayBuffer).toString('base64');
    } else {
      return NextResponse.json(
        { error: 'UNSUPPORTED_MEDIA_TYPE', message: 'Expected JSON or multipart/form-data' },
        { status: 415 }
      );
    }

    if (!imageBase64 || imageBase64.trim() === '') {
      return NextResponse.json(
        { error: 'EMPTY_IMAGE', message: 'Image data is empty or invalid.' },
        { status: 400 }
      );
    }

    // Check GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return NextResponse.json(
        {
          error: 'MISSING_API_KEY',
          message:
            'GEMINI_API_KEY is not configured on the server. Please add your GEMINI_API_KEY to .env or use "Try Demo" mode to test with realistic college timetable data.',
        },
        { status: 400 }
      );
    }

    // Call Gemini Vision AI
    const timetable = await extractTimetableFromImage(imageBase64, mimeType);

    // Extract unique subjects from the timetable
    const subjectMap = new Map<string, Subject>();
    let colorIdx = 0;

    for (const day of timetable.days) {
      for (const period of day.periods) {
        const type = (period.type || '').toLowerCase();
        if (['break', 'lunch', 'free', 'empty'].includes(type)) continue;

        const rawName = (period.subject || '').trim();
        if (!rawName) continue;

        const key = rawName.toLowerCase();
        if (!subjectMap.has(key)) {
          const id = `subj_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
          subjectMap.set(key, {
            id,
            name: rawName,
            code: period.subject_code || '',
            faculty: period.faculty || '',
            room: period.room || '',
            color: SUBJECT_COLORS[colorIdx % SUBJECT_COLORS.length],
            targetPercentage: 75,
          });
          colorIdx++;
        } else {
          // If code or faculty is missing on existing, backfill
          const existing = subjectMap.get(key)!;
          if (!existing.code && period.subject_code) existing.code = period.subject_code;
          if (!existing.faculty && period.faculty) existing.faculty = period.faculty;
          if (!existing.room && period.room) existing.room = period.room;
        }
      }
    }

    // Link periods to subjectId if possible
    timetable.days.forEach((day) => {
      day.periods.forEach((period) => {
        const key = (period.subject || '').trim().toLowerCase();
        const found = subjectMap.get(key);
        if (found) {
          (period as any).subjectId = found.id;
        }
      });
    });

    const subjects = Array.from(subjectMap.values());

    return NextResponse.json({
      success: true,
      timetable,
      subjects,
      detectedBatches: timetable.detectedBatches || [],
    });
  } catch (error: any) {
    console.error('Timetable extraction error:', error);

    const errMsg = error?.message || '';

    if (errMsg === 'MISSING_API_KEY') {
      return NextResponse.json(
        {
          error: 'MISSING_API_KEY',
          message:
            'GEMINI_API_KEY is missing. Please set your GEMINI_API_KEY in .env or try Demo mode.',
        },
        { status: 400 }
      );
    }

    if (errMsg.includes('API_KEY_INVALID') || errMsg.includes('API key not valid')) {
      return NextResponse.json(
        {
          error: 'API_KEY_INVALID',
          message:
            'Your GEMINI_API_KEY is invalid. Google AI Studio keys typically start with "AIzaSy...". Please verify your key at https://aistudio.google.com/ or use "Try Demo" mode.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'EXTRACTION_FAILED',
        message:
          errMsg ||
          "We couldn't confidently read some parts of your timetable. Please try a clearer image or edit manually.",
      },
      { status: 500 }
    );
  }
}
