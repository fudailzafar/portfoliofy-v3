import { pdfToText } from 'pdf-ts';

export async function scrapePdfContent(pdfUrl: string) {
  const pdfFetch = await fetch(pdfUrl);
  const pdf = await pdfFetch.arrayBuffer();
  const text = await pdfToText(new Uint8Array(pdf));

  return text;
}
