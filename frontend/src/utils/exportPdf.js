import html2pdf from 'html2pdf.js';

export async function exportToPdf(element, filename = 'resume.pdf', settings = {}) {
  if (!element) {
    console.error('exportToPdf: element is null or undefined');
    return;
  }

  // Determine scale and quality based on compression setting
  // High scale/quality means larger file size. Low means smaller file size.
  const isCompressed = settings.compressed === true;
  const quality = isCompressed ? 0.7 : 0.98;
  const scale = isCompressed ? 1.5 : 2;

  // Custom paper format if requested
  const format = settings.format || 'a4';

  const opt = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality },
    enableLinks: true,
    html2canvas: {
      scale,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'mm',
      format,
      orientation: 'portrait',
    },
  };

  // Calculate page aspect ratio
  const isLetter = format.toLowerCase() === 'letter';
  // A4 is 210mm x 297mm; Letter is 8.5" x 11" (215.9mm x 279.4mm)
  const aspectRatio = isLetter ? (215.9 / 279.4) : (210 / 297);

  // Save original style properties to restore later
  const originalHeight = element.style.height;
  const originalMinHeight = element.style.minHeight;

  try {
    // Calculate page height in pixels based on current element width
    const elementWidth = element.offsetWidth || 800;
    const pageHeightPx = elementWidth / aspectRatio;

    // Calculate how many pages the content naturally takes.
    // We use a tolerance of 12px to allow minor overflows (like paddings or margins)
    // to fit on the current page rather than creating a new blank page.
    const currentHeight = element.scrollHeight;
    const pages = Math.ceil((currentHeight - 12) / pageHeightPx) || 1;
    
    // Subtract 4px from the final target height as a safety margin to prevent sub-pixel spillover
    // which otherwise triggers an extra blank page at the end of the PDF.
    const targetHeight = (pages * pageHeightPx) - 4;

    // Temporarily force the element height to fill complete pages
    element.style.height = `${targetHeight}px`;
    element.style.minHeight = `${targetHeight}px`;

    let worker = html2pdf().set(opt).from(element);

    if (settings.resumeData) {
      worker = worker.toPdf().get('pdf').then((pdfObj) => {
        const { _historyId, ...cleanData } = settings.resumeData;
        pdfObj.setProperties({
          title: filename,
          subject: JSON.stringify(cleanData),
          keywords: 'resumetwin-metadata',
        });
      });
    }

    await worker.save();
  } catch (error) {
    console.error('PDF export failed:', error);
    throw error;
  } finally {
    // Restore original styles
    element.style.height = originalHeight;
    element.style.minHeight = originalMinHeight;
  }
}

