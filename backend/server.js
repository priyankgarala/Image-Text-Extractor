const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { Document, Packer, Paragraph } = require('docx');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());

app.post('/upload', upload.single('image'), (req, res) => {
  const imagePath = req.file.path;

  // Perform OCR on the uploaded image
  Tesseract.recognize(imagePath, 'eng')
    .then(({ data: { text } }) => {
      // Choose the desired format (Word or PDF)
      const format = 'pdf';

      if (format === 'word') {
        // Generate Word document
        const doc = new Document();
        doc.addSection({
          children: [new Paragraph(text)],
        });

        Packer.toBuffer(doc).then((buffer) => {
          res.setHeader('Content-Disposition', 'attachment; filename=output.docx');
          res.send(buffer);
        });
      } else if (format === 'pdf') {
        // Generate PDF document
        const pdfDoc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=output.pdf');
        pdfDoc.text(text);
        pdfDoc.pipe(res);
        pdfDoc.end();
      }
    })
    .catch((error) => {
      res.status(500).send({ error: 'Failed to process image' });
    });
});

app.listen(5000, () => {
  console.log('Server started on port 5000');
});
