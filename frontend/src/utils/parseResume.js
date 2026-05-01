/**
 * Parse a resume text (from TXT or extracted PDF text) into structured data.
 * This uses heuristics to identify sections and extract information.
 */

const SECTION_KEYWORDS = {
  summary: ['summary', 'objective', 'profile', 'about me', 'professional summary', 'career objective'],
  experience: ['experience', 'work experience', 'employment', 'work history', 'professional experience'],
  education: ['education', 'academic', 'qualification', 'academics', 'educational background'],
  skills: ['skills', 'technical skills', 'competencies', 'core competencies', 'expertise', 'technologies'],
  certifications: ['certification', 'certifications', 'licenses', 'accreditations'],
  projects: ['projects', 'personal projects', 'key projects', 'notable projects'],
};

function identifySection(line) {
  const lower = line.toLowerCase().trim().replace(/[:\-_|]/g, '').trim();
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some((kw) => lower === kw || lower.startsWith(kw))) {
      return section;
    }
  }
  return null;
}

function extractEmail(text) {
  const match = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  return match ? match[0] : '';
}

function extractPhone(text) {
  const match = text.match(/(\+?\d[\d\s\-().]{7,}\d)/);
  return match ? match[0].trim() : '';
}

function extractLinkedIn(text) {
  const match = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?/i);
  return match ? match[0] : '';
}

export function parseResumeText(text) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  const result = {
    personal: {
      fullName: '',
      email: extractEmail(text),
      phone: extractPhone(text),
      linkedin: extractLinkedIn(text),
      location: '',
      website: '',
      jobTitle: '',
    },
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    projects: [],
  };

  // First non-empty line is usually the name
  if (lines.length > 0) {
    const firstLine = lines[0];
    // If first line doesn't look like an email or phone, treat it as the name
    if (!firstLine.includes('@') && !/^\+?\d/.test(firstLine)) {
      result.personal.fullName = firstLine;
    }
  }

  // Parse sections
  let currentSection = null;
  let currentContent = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const section = identifySection(line);

    if (section) {
      // Save previous section content
      if (currentSection) {
        processSectionContent(result, currentSection, currentContent);
      }
      currentSection = section;
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  // Process last section
  if (currentSection) {
    processSectionContent(result, currentSection, currentContent);
  }

  return result;
}

function processSectionContent(result, section, content) {
  const text = content.join('\n');

  switch (section) {
    case 'summary':
      result.summary = text;
      break;

    case 'experience': {
      // Split by potential job entries (lines that look like dates)
      const entries = splitByEntries(content);
      result.experience = entries.map((entry, i) => ({
        id: Date.now() + i,
        company: entry.title || '',
        position: entry.subtitle || '',
        startDate: '',
        endDate: '',
        current: false,
        description: entry.body,
      }));
      if (result.experience.length === 0) {
        result.experience = [{
          id: Date.now(),
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          current: false,
          description: text,
        }];
      }
      break;
    }

    case 'education': {
      const entries = splitByEntries(content);
      result.education = entries.map((entry, i) => ({
        id: Date.now() + 100 + i,
        institution: entry.title || '',
        degree: entry.subtitle || '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: '',
      }));
      if (result.education.length === 0) {
        result.education = [{
          id: Date.now() + 100,
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
        }];
      }
      break;
    }

    case 'skills':
      result.skills = text
        .split(/[,;|•●\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.length < 50);
      break;

    case 'certifications':
      result.certifications = content.filter((l) => l.length > 0);
      break;

    case 'projects': {
      const entries = splitByEntries(content);
      result.projects = entries.map((entry, i) => ({
        id: Date.now() + 200 + i,
        name: entry.title || '',
        description: entry.body || '',
        technologies: '',
        link: '',
      }));
      if (result.projects.length === 0) {
        result.projects = [{
          id: Date.now() + 200,
          name: '',
          description: text,
          technologies: '',
          link: '',
        }];
      }
      break;
    }
  }
}

function splitByEntries(lines) {
  const entries = [];
  let current = null;

  for (const line of lines) {
    // Heuristic: a new entry starts with a line that's not a bullet point
    // and is relatively short (a title)
    const isBullet = /^[\-•●*]/.test(line);
    const isShort = line.length < 80;

    if (!isBullet && isShort && line.length > 2 && !current) {
      current = { title: line, subtitle: '', body: '' };
    } else if (!isBullet && isShort && current && !current.subtitle && line.length > 2) {
      current.subtitle = line;
    } else if (current) {
      current.body += (current.body ? '\n' : '') + line;
    } else {
      current = { title: line, subtitle: '', body: '' };
    }
  }

  if (current) entries.push(current);
  return entries;
}

/**
 * Read text content from a file.
 * For .txt files, reads directly.
 * For .pdf files, uses pdfjs-dist.
 */
export async function readFileContent(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  if (extension === 'txt') {
    return await file.text();
  }

  if (extension === 'pdf') {
    try {
      const pdfjsLib = await import('pdfjs-dist');

      // Disable worker entirely — runs on main thread, fine for resume-sized docs
      if (typeof pdfjsLib.GlobalWorkerOptions !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer),
        useWorkerFetch: false,
        isEvalSupported: false,
        useSystemFonts: true,
      });

      const pdf = await loadingTask.promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by Y position to reconstruct lines
        let lastY = null;
        let lineText = '';

        for (const item of textContent.items) {
          if (item.str === undefined) continue;
          const y = Math.round(item.transform[5]);

          if (lastY !== null && Math.abs(y - lastY) > 3) {
            // New line detected
            fullText += lineText.trim() + '\n';
            lineText = '';
          }
          lineText += item.str + ' ';
          lastY = y;
        }
        // Flush the last line on the page
        if (lineText.trim()) {
          fullText += lineText.trim() + '\n';
        }
        fullText += '\n'; // page break
      }

      return fullText;
    } catch (err) {
      console.error('PDF.js parsing failed:', err);
      // Fallback: try reading as text
      try {
        const text = await file.text();
        if (text && text.trim().length > 20) {
          return text;
        }
      } catch (_) {
        // ignore
      }
      throw new Error(
        'Failed to parse PDF. The file may be image-based or corrupted. Try uploading a .txt version instead.'
      );
    }
  }

  if (extension === 'docx') {
    try {
      const mammoth = await import('mammoth');
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value; // The raw text content
    } catch (err) {
      console.error('Mammoth parsing failed:', err);
      throw new Error(
        'Failed to parse Word document. Please try converting it to PDF or TXT first.'
      );
    }
  }

  if (extension === 'doc') {
    throw new Error(
      'The legacy .doc format is not supported for automatic parsing. Please save your resume as a .docx or .pdf file and try again.'
    );
  }

  throw new Error('Unsupported file format. Please upload a .pdf, .docx, or .txt file.');
}
