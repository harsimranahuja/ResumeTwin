import html2pdf from 'html2pdf.js';

export async function exportToPdf(element, filename = 'resume.pdf', settings = {}) {
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

  try {
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
  }
}
