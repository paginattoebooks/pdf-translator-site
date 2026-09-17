import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([500, 220]);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Hello, welcome to the PDF.', {
  x: 50,
  y: 120,
  size: 20,
  font,
  color: rgb(0, 0, 0),
});
const bytes = await pdfDoc.save();
fs.writeFileSync('sample-en.pdf', Buffer.from(bytes));
console.log('sample-en.pdf created');
