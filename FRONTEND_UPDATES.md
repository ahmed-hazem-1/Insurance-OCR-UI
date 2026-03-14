# Frontend Updates Summary

## Overview
The Insurance API frontend has been updated to support **polymorphic document handling** with support for three document types:
- **pharmacy_receipt** - Pharmacy receipts with items listing
- **lab_invoice** - Lab invoices with test results
- **insurance** - Insurance policy documents

## Key Changes

### 1. TypeScript Type System (✅ Complete)
Updated interface definitions to support polymorphic documents:

```typescript
// Union type for all document variants
type DocumentType = PharmacyReceipt | LabInvoice | InsuranceDocument;

// Base interface with common fields
interface BaseDocument {
  document_type: 'pharmacy_receipt' | 'lab_invoice' | 'insurance';
  raw_ocr_text: string;
  structured_markdown?: string;
  confidence_note: string;
  is_paid?: boolean;
}

// Document-specific interfaces
interface PharmacyReceipt extends BaseDocument { ... }
interface LabInvoice extends BaseDocument { ... }
interface InsuranceDocument extends BaseDocument { ... }
```

### 2. Document Type Selector (✅ Complete)
Updated dropdown with new document type options:
- `auto` - Auto-detect (Default)
- `pharmacy_receipt` - Pharmacy Receipt
- `lab_invoice` - Lab Invoice
- `insurance_policy` - Insurance Policy

### 3. Conditional Field Rendering (✅ Complete)
Implemented `renderStructuredFields()` function that renders different UI based on `document_type`:

**Pharmacy Receipt:**
- store_name, receipt_number, date, currency
- subtotal, total_amount, paid_amount
- Items table: description, quantity, unit_price, total_price
- Paid status badge

**Lab Invoice:**
- lab_name, invoice_number, patient_name, date, currency
- total_amount, paid_amount
- Tests table: test_name, result, unit, reference_range, price
- Paid status badge

**Insurance Policy:**
- policy_number, insured_name, insured_dob, insured_id
- insurer_name, policy dates, premium info
- coverage_details, beneficiaries, exclusions lists

### 4. Paid Status Badge (✅ Complete)
Added visual indicators for pharmacy receipts and lab invoices:
- ✅ **Green badge**: "Paid" when `is_paid = true`
- ❌ **Gray badge**: "Unpaid" when `is_paid = false`

### 5. Tab Navigation (✅ Complete)
Removed "Markdown View" tab and reordered as primary/fallback logic:
1. **Structured Data** - Default tab, polymorphic rendering
2. **Raw OCR Text** - Primary text fallback (always available)
3. **Processing Metadata** - Cost, tokens, model info

A note appears when structured_markdown is available but emphasizes raw OCR text as the primary source.

### 6. Processing Metadata Panel (✅ Complete)
Enhanced "Processing Details" section displays:
- `Final Model Used` - Shows which model was used for parsing
- `Fallback Triggered` - Yes/No indicator
- `Fallback Reason` - Reason if fallback was triggered (when applicable)

Shows both OCR and Parser engine metrics alongside the new fallback information.

### 7. Header Update (✅ Complete)
Changed title from "Insurance OCR API" to "Document OCR Parser" to reflect multi-document support.

## API Integration (✅ Unchanged)
- Endpoint: `POST /api/upload`
- Format: `multipart/form-data`
- Parameters:
  - `file` - Document image file
  - `doc_type` - Document type selector (auto/pharmacy_receipt/lab_invoice/insurance_policy)
  - `api_key` - Optional API key

## Sample Response Handling

The frontend now handles responses like:

```typescript
{
  "status": "success",
  "document": {
    "document_type": "pharmacy_receipt",
    "store_name": "CVS Pharmacy",
    "receipt_number": "123456",
    "date": "2024-03-14",
    "is_paid": true,
    "raw_ocr_text": "...",
    "structured_markdown": "...",
    "confidence_note": "...",
    "items": [...]
  },
  "processing": {
    "parser": { "model": "Pro", ... },
    "fallback": { "triggered": false, "reason": null },
    ...
  }
}
```

## Type Safety
- ✅ Full TypeScript support with strict type checking
- ✅ Document-specific field validation
- ✅ Union type narrowing in conditional rendering
- ✅ No 'any' types for document fields

## Backwards Compatibility
- Insurance documents retain all original fields
- API endpoint remains unchanged
- Existing upload flow works as before
- Fallback to insurance type for unknown documents

## Testing Recommendations
1. Test with sample pharmacy receipt documents
2. Test with sample lab invoice documents
3. Verify paid status badge appears correctly
4. Test fallback metadata display
5. Verify raw OCR text displays when markdown unavailable
6. Check responsive design on mobile
