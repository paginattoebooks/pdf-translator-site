import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';

const pdfDoc = await PDFDocument.create();
const page = pdfDoc.addPage([500, 220]);
const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
page.drawText('Ola, bem-vindo ao PDF.', {
  x: 50,
  y: 120,
  size: 20,
  font,
  color: rgb(0, 0, 0),
});
const bytes = await pdfDoc.save();
fs.writeFileSync('sample.pdf', Buffer.from(bytes));
console.log('sample.pdf created');
