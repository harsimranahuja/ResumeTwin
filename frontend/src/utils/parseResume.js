/**
 * Parse a resume text (from TXT or extracted PDF text) into structured data.
 * Uses improved heuristics to identify sections and extract information.
 */

const SECTION_KEYWORDS = {
  summary: ['summary', 'objective', 'profile', 'about me', 'about', 'professional summary', 'career objective', 'career summary', 'professional profile', 'executive summary', 'personal statement'],
  experience: ['experience', 'work experience', 'employment', 'employment history', 'work history', 'professional experience', 'relevant experience', 'career history'],
  internships: ['internship', 'internships', 'intern experience', 'internship experience', 'training'],
  education: ['education', 'academic', 'qualification', 'qualifications', 'academics', 'educational background', 'academic background', 'academic qualifications', 'educational qualifications', 'schooling'],
  skills: ['skills', 'technical skills', 'competencies', 'core competencies', 'expertise', 'technologies', 'tools', 'tools and technologies', 'proficiencies', 'areas of expertise', 'key skills'],
  certifications: ['certification', 'certifications', 'licenses', 'accreditations', 'certificates', 'professional certifications', 'courses', 'training and certifications'],
  projects: ['projects', 'personal projects', 'key projects', 'notable projects', 'academic projects', 'selected projects', 'side projects'],
  hobbies: ['hobbies', 'interests', 'hobbies and interests', 'hobbies & interests', 'extracurricular', 'extracurricular activities', 'activities'],
};

function identifySection(line) {
  const clean = line.toLowerCase().trim()
    .replace(/^[0-9.\s\-–—\/)]+/, '') // Strip numbers like "1. ", "02. ", "A) "
    .replace(/[:\-_|#*]/g, '') // Strip symbols
    .trim();

  if (clean.length === 0 || clean.length > 50) return null;

  // Check direct matches first (highest accuracy)
  for (const [section, keywords] of Object.entries(SECTION_KEYWORDS)) {
    if (keywords.some(kw => clean === kw || clean.startsWith(kw + ' ') || clean.endsWith(' ' + kw))) {
      return section;
    }
  }

  // Fallback to fuzzy substring checks for core concepts
  if (clean.includes('experience') || clean.includes('history') || clean.includes('employment') || clean.includes('work')) {
    if (clean.includes('intern')) {
      return 'internships';
    }
    return 'experience';
  }
  if (clean.includes('intern')) {
    return 'internships';
  }
  if (clean.includes('education') || clean.includes('academic') || clean.includes('university') || clean.includes('school')) {
    return 'education';
  }
  if (clean.includes('project')) {
    return 'projects';
  }
  if (clean.includes('skill') || clean.includes('expertise') || clean.includes('technologies') || clean.includes('languages') || clean.includes('proficiencies')) {
    return 'skills';
  }
  if (clean.includes('certificat') || clean.includes('license') || clean.includes('credential')) {
    return 'certifications';
  }
  if (clean.includes('hobby') || clean.includes('hobbies') || clean.includes('interest')) {
    return 'hobbies';
  }
  if (clean.includes('summary') || clean.includes('objective') || clean.includes('profile') || clean.includes('about')) {
    return 'summary';
  }

  return null;
}

function extractEmail(text) {
  const match = text.match(/[\w.%+-]+@[\w.-]+\.\w{2,}/);
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

function extractWebsite(text) {
  // Match URLs that are NOT linkedin, email, or github
  const match = text.match(/https?:\/\/(?!.*linkedin\.com)(?!.*github\.com)[\w.-]+\.\w{2,}[\/\w.-]*/i);
  if (match) return match[0];
  // Also try portfolio-like domains
  const match2 = text.match(/(?:www\.)?[\w-]+\.(?:com|io|dev|me|net|org|co)(?:\/[\w.-]*)?/i);
  if (match2 && !match2[0].includes('linkedin') && !match2[0].includes('github') && !match2[0].includes('@')) {
    return match2[0];
  }
  return '';
}

function extractGitHub(text) {
  const match = text.match(/(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?/i);
  return match ? match[0] : '';
}

function extractLocation(headerLines) {
  // Common location patterns: "City, State", "City, Country", "City, ST ZIP"
  for (const line of headerLines) {
    const locMatch = line.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z][a-zA-Z\s]+(?:\s*\d{5,6})?)/);
    if (locMatch && !locMatch[0].includes('@') && locMatch[0].length < 60) {
      return locMatch[0].trim();
    }
  }
  return '';
}

/**
 * Try to extract a date range string like "Jan 2020 - Present" or "2019 - 2021"
 * Returns { startDate, endDate, current, rawMatch } or null
 */
function parseNumericMonthYear(month, year) {
  let y = year;
  if (y.length === 2) {
    const yNum = parseInt(y, 10);
    y = yNum > 80 ? `19${y}` : `20${y}`;
  }
  const m = month.padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Try to extract a date range string like "Jan 2020 - Present", "2019 - 2021", or "08/2018 - 05/2022"
 * Returns { startDate, endDate, current, rawMatch } or null
 */
function extractDateRange(text) {
  const monthNames = 'jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december';

  // Pattern: MM/YYYY - MM/YYYY or MM-YYYY - MM-YYYY (or 2-digit years)
  const patternNumeric = /(\d{1,2})[\/\-](\d{2,4})\s*[-–—to]+\s*(\d{1,2}[\/\-](\d{2,4})|present|current|ongoing|now)/i;
  const matchNumeric = text.match(patternNumeric);
  if (matchNumeric) {
    const isPresent = /present|current|ongoing|now/i.test(matchNumeric[3]);
    let end = '';
    if (!isPresent) {
      const endParts = matchNumeric[3].split(/[\/\-]/);
      if (endParts.length === 2) {
        end = parseNumericMonthYear(endParts[0], endParts[1]);
      }
    }
    return {
      startDate: parseNumericMonthYear(matchNumeric[1], matchNumeric[2]),
      endDate: end,
      current: isPresent,
      rawMatch: matchNumeric[0],
    };
  }

  // Pattern: YYYY-MM - YYYY-MM
  const patternNumeric2 = /(\d{4})[\/\-](\d{1,2})\s*[-–—to]+\s*(\d{4}[\/\-]\d{1,2}|present|current|ongoing|now)/i;
  const matchNumeric2 = text.match(patternNumeric2);
  if (matchNumeric2) {
    const isPresent = /present|current|ongoing|now/i.test(matchNumeric2[3]);
    let end = '';
    if (!isPresent) {
      const endParts = matchNumeric2[3].split(/[\/\-]/);
      if (endParts.length === 2) {
        end = `${endParts[0]}-${endParts[1].padStart(2, '0')}`;
      }
    }
    return {
      startDate: `${matchNumeric2[1]}-${matchNumeric2[2].padStart(2, '0')}`,
      endDate: end,
      current: isPresent,
      rawMatch: matchNumeric2[0],
    };
  }

  // Pattern: Month Year - Month Year / Present
  const pattern1 = new RegExp(
    `((?:${monthNames})\\.?\\s*\\d{4})\\s*[-–—to]+\\s*((?:${monthNames})\\.?\\s*\\d{4}|present|current|ongoing|now)`,
    'i'
  );
  let match = text.match(pattern1);
  if (match) {
    return {
      startDate: parseMonthYear(match[1]),
      endDate: /present|current|ongoing|now/i.test(match[2]) ? '' : parseMonthYear(match[2]),
      current: /present|current|ongoing|now/i.test(match[2]),
      rawMatch: match[0],
    };
  }

  // Pattern: Year - Year / Present
  const pattern2 = /(\d{4})\s*[-–—to]+\s*(\d{4}|present|current|ongoing|now)/i;
  match = text.match(pattern2);
  if (match) {
    return {
      startDate: `${match[1]}-01`,
      endDate: /present|current|ongoing|now/i.test(match[2]) ? '' : `${match[2]}-01`,
      current: /present|current|ongoing|now/i.test(match[2]),
      rawMatch: match[0],
    };
  }

  // Pattern: just "Month Year" alone
  const pattern3 = new RegExp(`((?:${monthNames})\\.?\\s*\\d{4})`, 'i');
  match = text.match(pattern3);
  if (match) {
    return {
      startDate: parseMonthYear(match[1]),
      endDate: '',
      current: false,
      rawMatch: match[0],
    };
  }

  return null;
}

function parseMonthYear(str) {
  if (!str) return '';
  const months = {
    jan: '01', january: '01', feb: '02', february: '02', mar: '03', march: '03',
    apr: '04', april: '04', may: '05', jun: '06', june: '06',
    jul: '07', july: '07', aug: '08', august: '08', sep: '09', september: '09',
    oct: '10', october: '10', nov: '11', november: '11', dec: '12', december: '12',
  };
  const cleaned = str.replace(/\./g, '').trim().toLowerCase();
  const yearMatch = cleaned.match(/\d{4}/);
  if (!yearMatch) return '';
  const year = yearMatch[0];
  for (const [name, num] of Object.entries(months)) {
    if (cleaned.includes(name)) {
      return `${year}-${num}`;
    }
  }
  return `${year}-01`;
}

/**
 * Extract a URL (github, portfolio, etc.) from a line
 */
function extractUrl(text) {
  const match = text.match(/https?:\/\/[\w./?=&#%-]+/i);
  return match ? match[0] : '';
}

export function parseResumeText(text) {
  if (typeof text === 'object' && text !== null) {
    return text;
  }
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
    internships: [],
    education: [],
    skills: [],
    technicalSkills: [],
    softSkills: [],
    hobbies: [],
    certifications: [],
    projects: [],
  };

  // Collect header lines (lines before the first section heading)
  const headerLines = [];
  let firstSectionIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    if (identifySection(lines[i])) {
      firstSectionIndex = i;
      break;
    }
    headerLines.push(lines[i]);
  }

  // Extract personal info from header
  if (headerLines.length > 0) {
    // Look for full name
    const nameLine = headerLines.find(l => {
      const lower = l.toLowerCase();
      return !lower.includes('@') && 
             !/^\+?\d/.test(l) && 
             !lower.includes('linkedin.com') && 
             !lower.includes('github.com') &&
             !lower.includes('portfolio') &&
             lower !== 'resume' &&
             lower !== 'curriculum vitae' &&
             lower !== 'cv' &&
             l.length > 2 &&
             l.length < 50;
    });
    if (nameLine) {
      result.personal.fullName = nameLine;
    } else {
      result.personal.fullName = headerLines[0];
    }

    // Look for job title
    const nameIdx = nameLine ? headerLines.indexOf(nameLine) : -1;
    const titleLine = headerLines.find((l, idx) => {
      if (idx === nameIdx) return false;
      const lower = l.toLowerCase();
      return !lower.includes('@') &&
             !/^\+?\d/.test(l) &&
             !lower.includes('linkedin.com') &&
             !lower.includes('github.com') &&
             !lower.includes('portfolio') &&
             !/[|,•·]/.test(l) &&
             l.length > 3 &&
             l.length < 60;
    });
    if (titleLine) {
      result.personal.jobTitle = titleLine;
    }

    // Extract location
    const explicitLocLine = headerLines.find(l => /location|address|reside/i.test(l));
    if (explicitLocLine) {
      const cleaned = explicitLocLine.replace(/location|address/i, '').replace(/^[:\s\-]+/, '').trim();
      if (cleaned.length > 2 && cleaned.length < 80) {
        result.personal.location = cleaned;
      }
    }
    if (!result.personal.location) {
      result.personal.location = extractLocation(headerLines);
    }

    // Extract website
    result.personal.website = extractWebsite(headerLines.join(' '));
  }

  // Parse sections
  let currentSection = null;
  let currentContent = [];

  const startIdx = firstSectionIndex >= 0 ? firstSectionIndex : 1;

  for (let i = startIdx; i < lines.length; i++) {
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
      const entries = splitByEntries(content);
      result.experience = entries.map((entry, i) => {
        const dateInfo = extractDateRange(entry.title + ' ' + (entry.subtitle || '') + ' ' + (entry.dateLine || ''));
        return {
          id: Date.now() + i,
          company: entry.title || '',
          position: entry.subtitle || '',
          startDate: dateInfo?.startDate || '',
          endDate: dateInfo?.endDate || '',
          current: dateInfo?.current || false,
          description: entry.body,
        };
      });
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

    case 'internships': {
      const entries = splitByEntries(content);
      result.internships = entries.map((entry, i) => {
        const dateInfo = extractDateRange(entry.title + ' ' + (entry.subtitle || '') + ' ' + (entry.dateLine || ''));
        return {
          id: Date.now() + 300 + i,
          company: entry.title || '',
          role: entry.subtitle || '',
          startDate: dateInfo?.startDate || '',
          endDate: dateInfo?.endDate || '',
          current: dateInfo?.current || false,
          description: entry.body,
        };
      });
      if (result.internships.length === 0) {
        result.internships = [{
          id: Date.now() + 300,
          company: '',
          role: '',
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
      result.education = entries.map((entry, i) => {
        const dateInfo = extractDateRange(entry.title + ' ' + (entry.subtitle || '') + ' ' + (entry.dateLine || ''));
        // Try to extract GPA
        const gpaMatch = (entry.body || '').match(/(?:gpa|cgpa|grade|percentage)[:\s]*([0-9./%]+(?:\s*\/\s*[0-9.]+)?)/i);

        // Try to split degree and field
        let degree = entry.subtitle || '';
        let field = '';
        const inMatch = degree.match(/(.+?)\s+in\s+(.+)/i);
        const commaMatch = degree.includes(',') ? degree.split(',') : null;
        const hyphenMatch = degree.includes(' - ') ? degree.split(' - ') : null;

        if (inMatch) {
          degree = inMatch[1].trim();
          field = inMatch[2].trim();
        } else if (commaMatch && commaMatch.length >= 2) {
          degree = commaMatch[0].trim();
          field = commaMatch[1].trim();
        } else if (hyphenMatch && hyphenMatch.length >= 2) {
          degree = hyphenMatch[0].trim();
          field = hyphenMatch[1].trim();
        }

        return {
          id: Date.now() + 100 + i,
          institution: entry.title || '',
          degree: degree,
          field: field,
          startDate: dateInfo?.startDate || '',
          endDate: dateInfo?.endDate || '',
          gpa: gpaMatch ? gpaMatch[1].trim() : '',
          gradeType: gpaMatch && gpaMatch[0].toLowerCase().includes('percentage') ? 'Percentage' : 'CGPA',
        };
      });
      if (result.education.length === 0) {
        result.education = [{
          id: Date.now() + 100,
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          gradeType: 'CGPA',
        }];
      }
      break;
    }

    case 'skills': {
      const skillLines = content;
      let currentSkillCategory = 'technical';

      const tech = [];
      const soft = [];
      const general = [];

      for (const line of skillLines) {
        const lower = line.toLowerCase();
        if (lower.includes('soft skill') || lower.includes('soft') || lower.includes('interpersonal')) {
          currentSkillCategory = 'soft';
          const parts = line.split(/[:\-]/);
          if (parts.length > 1) {
            const skills = parts[1].split(/[,;|•●]/).map(s => s.trim()).filter(Boolean);
            soft.push(...skills);
          }
          continue;
        } else if (lower.includes('technical skill') || lower.includes('technical') || lower.includes('hard skill') || lower.includes('technologies') || lower.includes('languages') || lower.includes('tools') || lower.includes('frameworks')) {
          currentSkillCategory = 'technical';
          const parts = line.split(/[:\-]/);
          if (parts.length > 1) {
            const skills = parts[1].split(/[,;|•●]/).map(s => s.trim()).filter(Boolean);
            tech.push(...skills);
          }
          continue;
        }

        const skills = line.split(/[,;|•●]/).map(s => s.trim()).filter(Boolean);
        if (currentSkillCategory === 'soft') {
          soft.push(...skills);
        } else if (currentSkillCategory === 'technical') {
          tech.push(...skills);
        } else {
          general.push(...skills);
        }
      }

      if (tech.length > 0 || soft.length > 0) {
        result.technicalSkills = [...new Set(tech)];
        result.softSkills = [...new Set(soft)];
        result.skills = [...new Set([...tech, ...soft])];
      } else {
        const allSkills = [...new Set(general)];
        result.skills = allSkills;
        result.technicalSkills = allSkills;
      }
      break;
    }

    case 'certifications':
      result.certifications = content
        .map((l) => l.replace(/^[-•●*]\s*/, '').trim())
        .filter((l) => l.length > 0);
      break;

    case 'hobbies': {
      result.hobbies = text
        .split(/[,;|•●\n]/)
        .map((s) => s.replace(/^[-•●*]\s*/, '').trim())
        .filter((s) => s.length > 0 && s.length < 50);
      break;
    }

    case 'projects': {
      const entries = splitByEntries(content);
      result.projects = entries.map((entry, i) => {
        const link = extractUrl(entry.body || '') || extractUrl(entry.title || '');
        let technologies = '';
        const techMatch = (entry.subtitle || '').match(/\(([^)]+)\)/) || (entry.title || '').match(/\(([^)]+)\)/);
        if (techMatch) {
          technologies = techMatch[1];
        }
        return {
          id: Date.now() + 200 + i,
          name: entry.title ? entry.title.replace(/\([^)]*\)/, '').trim() : '',
          description: entry.body || '',
          technologies,
          link,
        };
      });
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

function splitEntriesWithDates(lines) {
  const dateLineIndices = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isBullet = /^[-•●*▪▸►]\s/.test(line);
    // Ignore bullet description lines containing dates to avoid fragmenting jobs
    if (extractDateRange(line) && !isBullet && line.length < 90) {
      dateLineIndices.push(i);
    }
  }

  if (dateLineIndices.length === 0) {
    return null;
  }

  const entryHeaders = [];
  
  for (let i = 0; i < dateLineIndices.length; i++) {
    const dateIdx = dateLineIndices[i];
    const prevEntryEndIdx = i > 0 ? entryHeaders[i - 1].end : -1;

    let startIdx = dateIdx;
    for (let k = 1; k <= 2; k++) {
      const checkIdx = dateIdx - k;
      if (checkIdx <= prevEntryEndIdx) break;
      const line = lines[checkIdx];
      const isBullet = /^[-•●*▪▸►]\s/.test(line);
      if (isBullet || line.length >= 80) {
        break;
      }
      startIdx = checkIdx;
    }

    entryHeaders.push({
      start: startIdx,
      dateIdx: dateIdx,
      end: dateIdx,
    });
  }

  const entries = [];
  for (let i = 0; i < entryHeaders.length; i++) {
    const header = entryHeaders[i];
    const nextHeaderStart = i + 1 < entryHeaders.length ? entryHeaders[i + 1].start : lines.length;

    const headerLines = lines.slice(header.start, header.end + 1);
    const bodyLines = lines.slice(header.end + 1, nextHeaderStart);

    let title = '';
    let subtitle = '';
    const dateLine = lines[header.dateIdx];
    const dateInfo = extractDateRange(dateLine);
    const rawMatch = dateInfo?.rawMatch || '';

    const otherHeaderLines = headerLines.filter((_, idx) => header.start + idx !== header.dateIdx);
    if (otherHeaderLines.length === 1) {
      title = otherHeaderLines[0];
      const dateCleaned = dateLine.replace(rawMatch, '').replace(/[|•·\-_,]/g, '').trim();
      if (dateCleaned.length > 2) {
        subtitle = dateCleaned;
      }
    } else if (otherHeaderLines.length >= 2) {
      title = otherHeaderLines[0];
      subtitle = otherHeaderLines[1];
    } else {
      const parts = dateLine.split(/[|•·]/).map(p => p.trim());
      if (parts.length >= 2) {
        title = parts[0];
        const nonDateParts = parts.filter(p => !extractDateRange(p));
        if (nonDateParts.length > 0) {
          if (nonDateParts[0] !== title) {
            subtitle = nonDateParts[0];
          } else if (nonDateParts.length > 1) {
            subtitle = nonDateParts[1];
          }
        }
      } else {
        title = dateLine.replace(rawMatch, '').replace(/[|•·\-_,]/g, '').trim();
      }
    }

    entries.push({
      title: title || dateLine,
      subtitle: subtitle,
      dateLine: dateLine,
      body: bodyLines.join('\n'),
    });
  }

  return entries;
}

function splitEntriesWithoutDates(lines) {
  const entries = [];
  let current = null;

  for (const line of lines) {
    const isBullet = /^[-•●*▪▸►]\s/.test(line);
    const isShort = line.length < 80;
    const looksLikeTitle = isShort && !isBullet && /[a-zA-Z]/.test(line);

    if (looksLikeTitle) {
      if (current && current.body.trim().length > 0) {
        entries.push(current);
        current = { title: line, subtitle: '', body: '', dateLine: '' };
      } else if (current && !current.subtitle) {
        current.subtitle = line;
      } else if (!current) {
        current = { title: line, subtitle: '', body: '', dateLine: '' };
      } else {
        current.subtitle += ' - ' + line;
      }
    } else {
      if (current) {
        current.body += (current.body ? '\n' : '') + line;
      } else {
        current = { title: line, subtitle: '', body: '', dateLine: '' };
      }
    }
  }

  if (current) entries.push(current);
  return entries;
}

function splitByEntries(lines) {
  const dateEntries = splitEntriesWithDates(lines);
  if (dateEntries && dateEntries.length > 0) {
    return dateEntries;
  }
  return splitEntriesWithoutDates(lines);
}

/**
 * Groups PDF text items into discrete line bands using Y-coordinate clustering
 * and sorts them horizontally (left-to-right).
 */
function reconstructLinesFromItems(items) {
  if (items.length === 0) return '';

  // 1. Cluster Y coordinates to group items into lines
  const uniqueYs = Array.from(new Set(items.map(item => item.y))).sort((a, b) => b - a);

  // Group Y values into line bands (difference <= 5 units)
  const bands = [];
  for (const y of uniqueYs) {
    let matchedBand = null;
    for (const band of bands) {
      if (band.some(val => Math.abs(val - y) <= 5)) {
        matchedBand = band;
        break;
      }
    }
    if (matchedBand) {
      matchedBand.push(y);
    } else {
      bands.push([y]);
    }
  }

  // Calculate average Y for each band and sort bands descending (top of page first)
  const bandAverages = bands.map(band => {
    const sum = band.reduce((acc, val) => acc + val, 0);
    return {
      avgY: sum / band.length,
      values: band,
    };
  }).sort((a, b) => b.avgY - a.avgY);

  // Map each item to its band average Y
  const itemsWithBand = items.map(item => {
    const matchedBand = bandAverages.find(band => band.values.includes(item.y));
    return {
      ...item,
      bandY: matchedBand ? matchedBand.avgY : item.y,
    };
  });

  // Sort items: by bandY descending, then by x ascending
  itemsWithBand.sort((a, b) => {
    if (Math.abs(a.bandY - b.bandY) > 0.01) {
      return b.bandY - a.bandY;
    }
    return a.x - b.x;
  });

  // 2. Reconstruct text by joining items on the same line
  let text = '';
  let lastBandY = null;
  let lineText = '';

  for (const item of itemsWithBand) {
    if (lastBandY !== null && Math.abs(item.bandY - lastBandY) > 0.01) {
      text += lineText.trim() + '\n';
      lineText = '';
    }
    lineText += item.str + ' ';
    lastBandY = item.bandY;
  }
  if (lineText.trim()) {
    text += lineText.trim() + '\n';
  }

  return text;
}

/**
 * Robustly parses a single PDF page. Detects two-column layouts and parses
 * columns independently to preserve section contents.
 */
async function extractPageText(page) {
  const textContent = await page.getTextContent();
  const items = textContent.items.map(item => {
    return {
      str: item.str || '',
      x: item.transform[4],
      y: item.transform[5],
      w: item.width || 0,
      h: item.height || 0,
    };
  }).filter(item => item.str.trim().length > 0);

  if (items.length === 0) return '';

  // Find page boundaries
  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  for (const item of items) {
    if (item.x < minX) minX = item.x;
    if (item.x + item.w > maxX) maxX = item.x + item.w;
    if (item.y < minY) minY = item.y;
    if (item.y > maxY) maxY = item.y;
  }

  const pageWidth = maxX - minX;
  const pageHeight = maxY - minY;

  // Search for vertical split (gutter) in the middle 50% of page
  const startSearchX = minX + pageWidth * 0.25;
  const endSearchX = minX + pageWidth * 0.75;
  
  let bestSplitX = -1;
  let minCrossingCount = Infinity;

  for (let splitX = startSearchX; splitX <= endSearchX; splitX += 5) {
    let crossingCount = 0;
    const gutterLeft = splitX - 7.5;
    const gutterRight = splitX + 7.5;

    for (const item of items) {
      const itemRight = item.x + item.w;
      if (item.x < gutterLeft && itemRight > gutterRight) {
        crossingCount++;
      }
    }

    if (crossingCount < minCrossingCount) {
      minCrossingCount = crossingCount;
      bestSplitX = splitX;
    }
  }

  // True two-column layout will have very few crossing items
  const isTwoColumn = bestSplitX !== -1 && (minCrossingCount <= 3 || minCrossingCount / items.length < 0.05);

  if (!isTwoColumn) {
    return reconstructLinesFromItems(items);
  }

  // Segment page into full-width header/footer and columns
  const crossingItems = items.filter(item => item.x < bestSplitX - 7.5 && (item.x + item.w) > bestSplitX + 7.5);
  
  let headerBoundaryY = maxY + 10;
  let footerBoundaryY = minY - 10;

  if (crossingItems.length > 0) {
    const topThresholdY = minY + pageHeight * 0.65;
    const bottomThresholdY = minY + pageHeight * 0.15;

    const headerCrossing = crossingItems.filter(item => item.y >= topThresholdY);
    const footerCrossing = crossingItems.filter(item => item.y <= bottomThresholdY);
    
    if (headerCrossing.length > 0) {
      headerBoundaryY = Math.min(...headerCrossing.map(item => item.y)) - 5;
    }
    if (footerCrossing.length > 0) {
      footerBoundaryY = Math.max(...footerCrossing.map(item => item.y)) + 5;
    }
  }

  const headerItems = [];
  const leftColumnItems = [];
  const rightColumnItems = [];
  const footerItems = [];

  for (const item of items) {
    if (item.y >= headerBoundaryY) {
      headerItems.push(item);
    } else if (item.y <= footerBoundaryY) {
      footerItems.push(item);
    } else {
      if (item.x + item.w / 2 < bestSplitX) {
        leftColumnItems.push(item);
      } else {
        rightColumnItems.push(item);
      }
    }
  }

  let text = '';
  if (headerItems.length > 0) {
    text += reconstructLinesFromItems(headerItems) + '\n';
  }
  
  text += reconstructLinesFromItems(leftColumnItems) + '\n';
  text += reconstructLinesFromItems(rightColumnItems) + '\n';

  if (footerItems.length > 0) {
    text += reconstructLinesFromItems(footerItems) + '\n';
  }

  return text;
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

      // Check for embedded lossless metadata (watermarked json)
      try {
        const meta = await pdf.getMetadata();
        const info = meta?.info || {};
        
        // Log all metadata keys for debugging
        console.log('PDF Metadata keys:', Object.keys(info));
        console.log('PDF Metadata info:', JSON.stringify(info, null, 2).substring(0, 500));
        
        // Check both capitalizations - jsPDF writes lowercase, pdfjs-dist may return either
        const keywords = info.Keywords || info.keywords || '';
        const subject = info.Subject || info.subject || '';
        
        if (keywords === 'resumetwin-metadata' && subject) {
          try {
            const parsedData = JSON.parse(subject);
            if (parsedData && (parsedData.personal || parsedData.experience)) {
              console.log('✅ Successfully loaded metadata-embedded resume data');
              return parsedData;
            }
          } catch (jsonErr) {
            console.warn('Failed to parse metadata JSON:', jsonErr);
          }
        }
      } catch (metaErr) {
        console.warn('Failed to extract PDF metadata:', metaErr);
      }

      // If it doesn't have metadata, send it to our Python backend to convert to Word first
      console.log('No metadata found, sending to backend for PDF-to-Word conversion...');
      
      const formData = new FormData();
      formData.append('resume', file);
      
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      try {
        const response = await fetch(`${backendUrl}/api/parse-pdf`, {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Backend conversion failed');
        }
        
        const data = await response.json();
        return data.text;
        
      } catch (backendErr) {
        console.warn('Backend PDF-to-Word conversion failed, falling back to native JS parsing...', backendErr);
        
        // Fallback to JS parsing if backend is down
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const pageText = await extractPageText(page);
          fullText += pageText + '\n';
        }
        return fullText;
      }
      
    } catch (err) {
      console.error('PDF.js parsing failed:', err);
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
      return result.value;
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
