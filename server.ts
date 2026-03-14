import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import FormData from 'form-data';
import axios from 'axios';
import path from 'path';
import fs from 'fs';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const docType = req.body.doc_type || 'auto';
      const clientApiKey = req.body.api_key;
      const apiUrl = process.env.OCR_API_URL || 'http://127.0.0.1:8000/v1/documents/extract';

      const formData = new FormData();
      formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
      });
      formData.append('doc_type', docType);

      try {
        const headers: any = {
          ...formData.getHeaders(),
          'accept': 'application/json',
        };

        const finalApiKey = clientApiKey || process.env.OCR_API_KEY;
        if (finalApiKey) {
          headers['Authorization'] = `Bearer ${finalApiKey}`;
          headers['x-api-key'] = finalApiKey;
        }

        const response = await axios.post(apiUrl, formData, { headers });
        
        return res.json({
          ...response.data,
          _meta: { source: 'api', url: apiUrl }
        });
      } catch (apiError: any) {
        console.error('Error calling OCR API:', apiError.message);
        
        // If the API is unreachable (e.g., ECONNREFUSED because it's not running in this container),
        // return a mock response so the UI can still be demonstrated.
        if (apiError.code === 'ECONNREFUSED' || apiError.code === 'ENOTFOUND') {
          console.log('Returning mock data because API is unreachable.');
          return res.json({
            status: "success",
            document: {
              document_type: "property",
              policy_number: "12345-000",
              insured_name: "JANE DOE",
              insured_dob: null,
              insured_id: null,
              insurer_name: "Insurance Company",
              policy_start_date: "2022-01-01",
              policy_end_date: "2022-06-01",
              premium_amount: 1201.11,
              premium_currency: null,
              coverage_details: [
                "DWELLING: $200,000",
                "OTHER STRUCTURES: $20,000",
                "PERSONAL PROPERTY: $100,000"
              ],
              beneficiaries: null,
              exclusions: null,
              claim_number: null,
              raw_ocr_text: "Insurance Policy\nPolicy Number: 12345-000\nInsured: JANE DOE\nCoverage Details:\nDWELLING: $200,000\nOTHER STRUCTURES: $20,000\nPERSONAL PROPERTY: $100,000",
              structured_markdown: "### Insurance Policy\n**Policy Number:** 12345-000\n\n**Insured:** JANE DOE\n\n| Coverage | Amount |\n|---|---|\n| Dwelling | $200,000 |\n| Other Structures | $20,000 |\n| Personal Property | $100,000 |",
              confidence_note: "The document is clear and well-structured."
            },
            processing: {
              ocr: {
                model: "gemini-1.5-flash",
                input_tokens: 354,
                output_tokens: 374,
                cost_usd: 0.000185,
                confidence: 98.0
              },
              parser: {
                model: "gemini-1.5-flash",
                input_tokens: 850,
                output_tokens: 450,
                cost_usd: 0.0003,
                confidence: 95.0
              },
              fallback: {
                triggered: false,
                reason: null
              },
              summary: {
                  final_model_used: "gemini-1.5-flash",
                  final_ocr_confidence: 98.0,
                  final_parser_confidence: 95.0,
                  total_input_tokens: 1204,
                  total_output_tokens: 824,
                  total_cost_usd: 0.000485
              }
            },
            _meta: { source: 'mock', url: apiUrl, message: 'API unreachable. Showing mock data.' }
          });
        }
        
        return res.status(apiError.response?.status || 500).json({
          error: 'Failed to process document',
          details: apiError.response?.data || apiError.message
        });
      }

    } catch (error: any) {
      console.error('Upload handler error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
