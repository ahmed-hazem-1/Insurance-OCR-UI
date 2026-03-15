import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, FileImage, Settings, Code, LayoutList, Check, X, ChevronDown } from 'lucide-react';
import Markdown from 'react-markdown';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type Tab = 'structured' | 'raw' | 'json' | 'metadata';

interface ModelInfo {
  id: string;
  name: string;
  inputPrice: string;
  outputPrice: string;
  family: string;
  multimodal: boolean;
  deprecated?: string;
}

const GEMINI_MODELS: ModelInfo[] = [
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro (Preview)',
    inputPrice: '$1.00 - $2.00',
    outputPrice: '$6.00 - $9.00',
    family: 'Gemini 3.1',
    multimodal: true
  },
  {
    id: 'gemini-3.1-flash-lite-preview',
    name: 'Gemini 3.1 Flash-Lite',
    inputPrice: '$0.25',
    outputPrice: '$1.50',
    family: 'Gemini 3.1',
    multimodal: true
  },
  {
    id: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro (Preview)',
    inputPrice: '$2.00 - $4.00',
    outputPrice: '$12.00 - $18.00',
    family: 'Gemini 3.0',
    multimodal: true
  },
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash (Preview)',
    inputPrice: '$0.50',
    outputPrice: '$3.00',
    family: 'Gemini 3.0',
    multimodal: true
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    inputPrice: '$0.625 - $1.25',
    outputPrice: '$5.00 - $7.50',
    family: 'Gemini 2.5',
    multimodal: true
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    inputPrice: '$0.15',
    outputPrice: '$1.25',
    family: 'Gemini 2.5',
    multimodal: true
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    inputPrice: '$0.10',
    outputPrice: '$0.40',
    family: 'Gemini 2.0',
    multimodal: true
  },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash-Lite',
    inputPrice: '$0.075',
    outputPrice: '$0.30',
    family: 'Gemini 2.0',
    multimodal: true
  }
];

function calculateTotal(input: string, output: string) {
  const parse = (s: string) => s.replace('$', '').split('-').map(v => parseFloat(v.trim()));
  const inVals = parse(input);
  const outVals = parse(output);
  
  if (inVals.length > 1 || outVals.length > 1) {
    const min = inVals[0] + outVals[0];
    const max = (inVals[1] || inVals[0]) + (outVals[1] || outVals[0]);
    return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
  }
  return `$${(inVals[0] + outVals[0]).toFixed(2)}`;
}

// Base document interface with common fields
interface BaseDocument {
  document_type: 'pharmacy_receipt' | 'lab_invoice' | 'insurance';
  raw_ocr_text: string;
  structured_markdown?: string;
  confidence_note: string;
  is_paid?: boolean;
}

// Pharmacy receipt fields
interface PharmacyReceipt extends BaseDocument {
  document_type: 'pharmacy_receipt';
  store_name: string | null;
  receipt_number: string | null;
  patient_name?: string | null;
  date: string | null;
  currency: string | null;
  subtotal: number | null;
  total_price?: number | null;
  total_amount: number | null;
  paid_amount: number | null;
  is_paid: boolean;
  items?: Array<{
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

// Lab invoice fields
interface LabInvoice extends BaseDocument {
  document_type: 'lab_invoice';
  lab_name: string | null;
  invoice_number: string | null;
  patient_name: string | null;
  date: string | null;
  currency: string | null;
  total_amount: number | null;
  paid_amount: number | null;
  is_paid: boolean;
  tests?: Array<{
    test_name: string;
    result: string;
    unit: string;
    reference_range: string;
    price: number;
  }>;
}

// Insurance policy fields
interface InsuranceDocument extends BaseDocument {
  document_type: 'insurance';
  policy_number: string | null;
  insured_name: string | null;
  insured_dob: string | null;
  insured_id: string | null;
  insurer_name: string | null;
  policy_start_date: string | null;
  policy_end_date: string | null;
  premium_amount: number | null;
  premium_currency: string | null;
  coverage_details: string[] | null;
  beneficiaries: string[] | null;
  exclusions: string[] | null;
  claim_number: string | null;
}

type DocumentType = PharmacyReceipt | LabInvoice | InsuranceDocument;

interface OcrResponse {
  status: string;
  document: DocumentType;
  processing: {
    ocr: any;
    parser: any;
    fallback?: {
      triggered: boolean;
      reason?: string;
    };
    summary: any;
  };
  _meta?: {
    source: string;
    url: string;
    message?: string;
  };
}

// Helper function to render appropriate fields based on document type
function renderStructuredFields(document: DocumentType) {
  const commonFields = ['raw_ocr_text', 'structured_markdown', 'confidence_note', 'document_type'];

  if (document.document_type === 'pharmacy_receipt') {
    const doc = document as PharmacyReceipt;
    const calculatedTotalPrice = (doc.items ?? []).reduce((sum, item) => {
      const lineTotal = (item.total_price ?? 0) > 0
        ? (item.total_price ?? 0)
        : (item.quantity ?? 0) * (item.unit_price ?? 0);
      return sum + lineTotal;
    }, 0);
    const totalPriceValue = doc.items && doc.items.length > 0
      ? calculatedTotalPrice
      : (doc.total_price ?? doc.total_amount);
    return (
      <div className="space-y-6">
        {/* Paid Status Badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-900">Receipt Details</h3>
          <div className="flex items-center gap-3">
            {doc.is_paid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Check className="w-4 h-4" />
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                <X className="w-4 h-4" />
                Unpaid
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Success
            </span>
          </div>
        </div>

        {/* Main Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[
            { key: 'store_name', label: 'Store Name', value: doc.store_name },
            { key: 'receipt_number', label: 'Receipt Number', value: doc.receipt_number },
            { key: 'patient_name', label: 'Patient Name', value: doc.patient_name },
            { key: 'date', label: 'Date', value: doc.date },
            { key: 'currency', label: 'Currency', value: doc.currency },
            { key: 'subtotal', label: 'Subtotal', value: doc.subtotal },
            { key: 'total_price', label: 'Total Price', value: totalPriceValue },
            { key: 'total_amount', label: 'Total Amount', value: doc.total_amount },
            { key: 'paid_amount', label: 'Paid Amount', value: doc.paid_amount },
          ].map((field) => (
            <dl key={field.key} className="border-b border-slate-100 pb-4">
              <dt className="text-sm font-medium text-slate-500 mb-1">{field.label}</dt>
              <dd className="text-sm text-slate-900">{formatValue(field.value)}</dd>
            </dl>
          ))}
        </div>

        {/* Items Table */}
        {doc.items && doc.items.length > 0 && (
          <div className="mt-8">
            <h4 className="text-base font-medium text-slate-900 mb-4">Items</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Description</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Quantity</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Unit Price</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{item.description || 'N/A'}</td>
                      <td className="px-4 py-3 text-right text-slate-900">{item.quantity || '0'}</td>
                      <td className="px-4 py-3 text-right text-slate-900">${(item.unit_price ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">${(((item.total_price ?? 0) > 0 ? (item.total_price ?? 0) : (item.quantity ?? 0) * (item.unit_price ?? 0))).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (document.document_type === 'lab_invoice') {
    const doc = document as LabInvoice;
    return (
      <div className="space-y-6">
        {/* Paid Status Badge */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-slate-900">Lab Invoice Details</h3>
          <div className="flex items-center gap-3">
            {doc.is_paid ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <Check className="w-4 h-4" />
                Paid
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                <X className="w-4 h-4" />
                Unpaid
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              <CheckCircle className="w-3.5 h-3.5 mr-1" />
              Success
            </span>
          </div>
        </div>

        {/* Main Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {[
            ['lab_name', 'Lab Name'],
            ['invoice_number', 'Invoice Number'],
            ['patient_name', 'Patient Name'],
            ['date', 'Date'],
            ['currency', 'Currency'],
            ['total_amount', 'Total Amount'],
            ['paid_amount', 'Paid Amount'],
          ].map(([key, label]) => (
            <dl key={key} className="border-b border-slate-100 pb-4">
              <dt className="text-sm font-medium text-slate-500 mb-1">{label}</dt>
              <dd className="text-sm text-slate-900">{formatValue(doc[key as keyof LabInvoice])}</dd>
            </dl>
          ))}
        </div>

        {/* Tests Table */}
        {doc.tests && doc.tests.length > 0 && (
          <div className="mt-8">
            <h4 className="text-base font-medium text-slate-900 mb-4">Tests</h4>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Test Name</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Result</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Unit</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700">Reference Range</th>
                    <th className="px-4 py-3 text-right font-medium text-slate-700">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {doc.tests.map((test, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-900">{test.test_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-900">{test.result || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-900">{test.unit || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-900">{test.reference_range || 'N/A'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">${(test.price ?? 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Insurance document (default)
  const doc = document as InsuranceDocument;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900">Extracted Fields</h3>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3.5 h-3.5 mr-1" />
          Success
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {[
          ['policy_number', 'Policy Number'],
          ['insured_name', 'Insured Name'],
          ['insured_dob', 'Date of Birth'],
          ['insured_id', 'Insured ID'],
          ['insurer_name', 'Insurer Name'],
          ['policy_start_date', 'Start Date'],
          ['policy_end_date', 'End Date'],
          ['premium_amount', 'Premium Amount'],
          ['premium_currency', 'Currency'],
          ['claim_number', 'Claim Number'],
        ].map(([key, label]) => (
          <dl key={key} className="border-b border-slate-100 pb-4">
            <dt className="text-sm font-medium text-slate-500 mb-1">{label}</dt>
            <dd className="text-sm text-slate-900">{formatValue(doc[key as keyof InsuranceDocument])}</dd>
          </dl>
        ))}
      </div>

      {/* Coverage Details, Beneficiaries, Exclusions */}
      {(doc.coverage_details || doc.beneficiaries || doc.exclusions) && (
        <div className="mt-8 space-y-6">
          {doc.coverage_details && doc.coverage_details.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-slate-900 mb-3">Coverage Details</h4>
              <ul className="list-disc pl-5 space-y-1">
                {doc.coverage_details.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          {doc.beneficiaries && doc.beneficiaries.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-slate-900 mb-3">Beneficiaries</h4>
              <ul className="list-disc pl-5 space-y-1">
                {doc.beneficiaries.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
          {doc.exclusions && doc.exclusions.length > 0 && (
            <div>
              <h4 className="text-base font-medium text-slate-900 mb-3">Exclusions</h4>
              <ul className="list-disc pl-5 space-y-1">
                {doc.exclusions.map((item, i) => (
                  <li key={i} className="text-sm text-slate-700">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function formatValue(value: any) {
  if (value === null || value === undefined) return <span className="text-slate-400 italic">Not found</span>;
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc pl-5 space-y-1">
        {value.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    );
  }
  return String(value);
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('auto');
  const [model, setModel] = useState('gemini-3.1-pro-preview');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDocTypeOpen, setIsDocTypeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const docTypeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<OcrResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('structured');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (docTypeRef.current && !docTypeRef.current.contains(event.target as Node)) {
        setIsDocTypeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, docTypeRef]);

  const selectedModel = GEMINI_MODELS.find(m => m.id === model) || GEMINI_MODELS[0];
  
  const DOC_TYPES = [
    { id: 'auto', name: 'Auto-detect (Default)', description: 'Automatically identifies the document type' },
    { id: 'pharmacy_receipt', name: 'Pharmacy Receipt', description: 'Extracts items, prices, and store info' },
    { id: 'lab_invoice', name: 'Lab Invoice', description: 'Extracts test results, values, and lab info' },
    { id: 'insurance', name: 'Insurance Policy', description: 'Extracts coverage, numbers, and dates' },
  ];

  const selectedDocType = DOC_TYPES.find(d => d.id === docType) || DOC_TYPES[0];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('model_id', model);

    // Debugging: Log FormData entries
    console.log('Sending request with:');
    for (let pair of (formData as any).entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      setActiveTab('structured');
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the document.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">Document OCR Parser</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Upload Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-medium mb-4">Upload Document</h2>
              
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-4"
              >
                <div className="relative" ref={docTypeRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                  <button
                    type="button"
                    onClick={() => setIsDocTypeOpen(!isDocTypeOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-300 bg-white p-2.5 text-left text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all active:scale-[0.99]"
                    aria-haspopup="listbox"
                    aria-expanded={isDocTypeOpen}
                    aria-label="Toggle document type dropdown"
                  >
                    <span className="truncate font-medium">{selectedDocType.name}</span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform duration-200", isDocTypeOpen && "rotate-180")} />
                  </button>

                  {isDocTypeOpen && (
                    <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200 focus:outline-none p-1.5 space-y-1">
                      {DOC_TYPES.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => {
                            setDocType(d.id);
                            setIsDocTypeOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                            docType === d.id 
                              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" 
                              : "hover:bg-slate-50 active:scale-[0.98]"
                          )}
                        >
                          <div className="flex flex-col min-w-0 pr-4">
                            <span className={cn("text-sm font-semibold truncate", docType === d.id ? "text-white" : "text-slate-900")}>
                              {d.name}
                            </span>
                            <span className={cn("text-[10px] mt-0.5", docType === d.id ? "text-indigo-100" : "text-slate-500")}>
                              {d.description}
                            </span>
                          </div>
                          {docType === d.id && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="relative" ref={dropdownRef}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Gemini Model (Multimodal)</label>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between rounded-xl border border-slate-300 bg-white p-2.5 text-left text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all active:scale-[0.99]"
                    aria-haspopup="listbox"
                    aria-expanded={isDropdownOpen}
                    aria-label="Toggle Gemini model dropdown"
                  >
                    <span className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-slate-900 truncate">{selectedModel.name}</span>
                      <span className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-medium px-1 py-0.5 rounded bg-slate-100">IN: {selectedModel.inputPrice}</span>
                        <span className="font-medium px-1 py-0.5 rounded bg-slate-100">OUT: {selectedModel.outputPrice}</span>
                        <span className="font-bold px-1 py-0.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
                          TOT: {calculateTotal(selectedModel.inputPrice, selectedModel.outputPrice)}
                        </span>
                      </span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform flex-shrink-0", isDropdownOpen && "rotate-180")} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-20 mt-2 max-h-[400px] w-[320px] left-0 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl animate-in fade-in zoom-in duration-200 focus:outline-none">
                      <div className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-slate-200">
                        {Array.from(new Set(GEMINI_MODELS.map(m => m.family))).map((family, familyIdx) => (
                          <div key={family} className={cn(familyIdx !== 0 && "border-t border-slate-100")}>
                            <div className="bg-slate-50/80 backdrop-blur-sm sticky top-0 z-10 px-4 py-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                              {family}
                            </div>
                            <div className="p-1.5 space-y-1">
                              {GEMINI_MODELS.filter(m => m.family === family).map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  onClick={() => {
                                    setModel(m.id);
                                    setIsDropdownOpen(false);
                                  }}
                                  className={cn(
                                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                                    model === m.id 
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[0.98]" 
                                      : "hover:bg-slate-50 active:scale-[0.98]"
                                  )}
                                >
                                  <div className="flex flex-col min-w-0 pr-4">
                                    <span className={cn(
                                      "text-sm font-semibold truncate",
                                      model === m.id ? "text-white" : "text-slate-900"
                                    )}>
                                      {m.name}
                                    </span>
                                    <div className={cn(
                                      "mt-1 flex flex-wrap items-center gap-1.5 text-[10px]",
                                      model === m.id ? "text-indigo-100" : "text-slate-500"
                                    )}>
                                      <span className="font-medium px-1.5 py-0.5 rounded-md bg-black/5">IN: {m.inputPrice}</span>
                                      <span className="font-medium px-1.5 py-0.5 rounded-md bg-black/5">OUT: {m.outputPrice}</span>
                                      <span className={cn(
                                        "font-bold px-1.5 py-0.5 rounded-md border",
                                        model === m.id ? "bg-white/20 border-white/20 text-white" : "bg-indigo-50 border-indigo-100 text-indigo-600"
                                      )}>
                                        TOTAL: {calculateTotal(m.inputPrice, m.outputPrice)}
                                      </span>
                                      {m.deprecated && (
                                        <span className={cn(
                                          "font-bold uppercase tracking-tighter",
                                          model === m.id ? "text-amber-200" : "text-amber-600"
                                        )}>
                                          EOL {m.deprecated.split(',')[1].trim()}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {model === m.id ? (
                                      <div className="rounded-full bg-white/20 p-1">
                                        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                                      </div>
                                    ) : (
                                      <div className="h-5 w-5 rounded-full border-2 border-slate-200 transition-colors group-hover:border-indigo-400" />
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mt-2">
                    <p className="text-[10px] text-indigo-600 font-medium leading-tight">
                      Multimodal Support: High-accuracy image analysis enabled.
                    </p>
                  </div>
                </div>

                <div>
                  <label htmlFor="file-input-label" className="block text-sm font-medium text-slate-700 mb-1">Document Image</label>
                  <div 
                    className={cn(
                      "mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer",
                      isDragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50",
                      file ? "bg-slate-50 border-solid border-slate-300" : ""
                    )}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="space-y-2 text-center">
                      {file ? (
                        <div className="flex flex-col items-center">
                          <FileImage className="mx-auto h-10 w-10 text-indigo-500" />
                          <div className="mt-2 flex text-sm text-slate-900 font-medium">
                            <span>{file.name}</span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFile(null);
                              if (imagePreview) URL.revokeObjectURL(imagePreview);
                              setImagePreview(null);
                            }}
                            className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="mx-auto h-10 w-10 text-slate-400" />
                          <div className="flex text-sm text-slate-600 justify-center">
                            <span className="relative rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                              Upload a file
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-slate-500">PNG, JPG, PDF up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input 
                      id="file-input"
                      ref={fileInputRef}
                      type="file" 
                      className="sr-only" 
                      accept="image/png, image/jpeg, application/pdf"
                      onChange={handleFileChange}
                      aria-label="Upload document image"
                    />
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 p-4 border border-red-100">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-1 text-sm text-red-700">{error}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!file || isLoading}
                  className={cn(
                    "w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors",
                    !file || isLoading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                      Processing Document...
                    </>
                  ) : (
                    'Extract Information'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-8">
            {result ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full min-h-[600px]">
                
                {/* Mock Data Warning */}
                {result._meta?.source === 'mock' && (
                  <div className="bg-amber-50 border-b border-amber-200 p-3 flex items-start sm:items-center px-6">
                    <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 sm:mt-0 mr-3 flex-shrink-0" />
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> The OCR API at <code>{result._meta.url}</code> was unreachable. Showing mock data for demonstration purposes.
                    </p>
                  </div>
                )}

                {/* Tabs */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-2 sm:px-6 pt-2 flex overflow-x-auto hide-scrollbar">
                  <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                      onClick={() => setActiveTab('structured')}
                      className={cn(
                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors",
                        activeTab === 'structured'
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <LayoutList className="w-4 h-4 mr-2" />
                      Structured Data
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={cn(
                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors",
                        activeTab === 'raw'
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      Raw OCR Text
                    </button>
                    <button
                      onClick={() => setActiveTab('metadata')}
                      className={cn(
                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors",
                        activeTab === 'metadata'
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Processing Metadata
                    </button>
                    <button
                      onClick={() => setActiveTab('json')}
                      className={cn(
                        "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors",
                        activeTab === 'json'
                          ? "border-indigo-500 text-indigo-600"
                          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                      )}
                    >
                      <Code className="w-4 h-4 mr-2" />
                      API Response JSON
                    </button>
                  </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6 flex-1 overflow-y-auto bg-white">
                  
                  {/* Structured Data Tab */}
                  {activeTab === 'structured' && (
                    <div className="animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
                        {/* Image Preview */}
                        {imagePreview && (
                          <div className="lg:col-span-2">
                            <div className="sticky top-0">
                              <h3 className="text-sm font-semibold text-slate-900 mb-3">Uploaded Document</h3>
                              <div className="rounded-xl border border-slate-200 overflow-hidden bg-slate-50">
                                <img 
                                  src={imagePreview} 
                                  alt="Uploaded document" 
                                  className="w-full h-auto max-h-96 object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Extracted Fields */}
                        <div className={imagePreview ? "lg:col-span-3" : "lg:col-span-5"}>
                          <div className="space-y-8">
                            {renderStructuredFields(result.document)}

                            {result.document.confidence_note && (
                              <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-100">
                                <h4 className="text-sm font-medium text-blue-800 mb-1">Confidence Note</h4>
                                <p className="text-sm text-blue-700">{result.document.confidence_note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Raw OCR Text Tab */}
                  {activeTab === 'raw' && (
                    <div className="animate-in fade-in duration-300 h-full flex flex-col">
                      <div className="bg-slate-900 rounded-xl p-4 flex-1 overflow-auto">
                        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                          {result.document.raw_ocr_text}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === 'json' && (
                    <div className="animate-in fade-in duration-300 h-full flex flex-col">
                      <div className="bg-slate-900 rounded-xl p-4 flex-1 overflow-auto">
                        <pre className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                          {JSON.stringify(result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Structured Markdown Tab (if available) */}
                  {result.document.structured_markdown && (
                    <div className="text-xs text-slate-500 mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      ℹ️ Markdown version is available but raw OCR text is the primary source.
                    </div>
                  )}

                  {/* Metadata Tab */}
                  {activeTab === 'metadata' && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Summary</h4>
                        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                          <div>
                            <dt className="text-xs font-medium text-slate-500">Total Cost</dt>
                            <dd className="mt-1 text-lg font-semibold text-slate-900">${result.processing.summary.total_cost_usd.toFixed(6)}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-slate-500">Total Tokens</dt>
                            <dd className="mt-1 text-lg font-semibold text-slate-900">{result.processing.summary.total_input_tokens + result.processing.summary.total_output_tokens}</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-slate-500">OCR Confidence</dt>
                            <dd className="mt-1 text-lg font-semibold text-slate-900">{result.processing.summary.final_ocr_confidence}%</dd>
                          </div>
                          <div>
                            <dt className="text-xs font-medium text-slate-500">Parser Confidence</dt>
                            <dd className="mt-1 text-lg font-semibold text-slate-900">{result.processing.summary.final_parser_confidence}%</dd>
                          </div>
                        </dl>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-slate-200 rounded-xl p-5">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">OCR Engine</h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-slate-500">Model</dt><dd className="font-medium">{result.processing.ocr.model}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Input Tokens</dt><dd className="font-medium">{result.processing.ocr.input_tokens}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Output Tokens</dt><dd className="font-medium">{result.processing.ocr.output_tokens}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Cost</dt><dd className="font-medium">${result.processing.ocr.cost_usd.toFixed(6)}</dd></div>
                          </dl>
                        </div>
                        <div className="border border-slate-200 rounded-xl p-5">
                          <h4 className="text-sm font-semibold text-slate-900 mb-3">Parser Engine</h4>
                          <dl className="space-y-2 text-sm">
                            <div className="flex justify-between"><dt className="text-slate-500">Model</dt><dd className="font-medium">{result.processing.parser.model}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Input Tokens</dt><dd className="font-medium">{result.processing.parser.input_tokens}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Output Tokens</dt><dd className="font-medium">{result.processing.parser.output_tokens}</dd></div>
                            <div className="flex justify-between"><dt className="text-slate-500">Cost</dt><dd className="font-medium">${result.processing.parser.cost_usd.toFixed(6)}</dd></div>
                          </dl>
                        </div>
                      </div>

                      {/* Fallback and Final Model Info */}
                      <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-200">
                        <h4 className="text-sm font-semibold text-indigo-900 mb-3">Processing Details</h4>
                        <dl className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-indigo-700">Final Model Used</dt>
                            <dd className="font-medium text-indigo-900">{result.processing.parser.model || 'Standard'}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-indigo-700">Fallback Triggered</dt>
                            <dd className="font-medium text-indigo-900">
                              {result.processing.fallback?.triggered ? 'Yes' : 'No'}
                            </dd>
                          </div>
                          {result.processing.fallback?.triggered && result.processing.fallback?.reason && (
                            <div className="flex justify-between">
                              <dt className="text-indigo-700">Fallback Reason</dt>
                              <dd className="font-medium text-indigo-900">{result.processing.fallback.reason}</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-full min-h-[600px] flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-slate-50 p-4 rounded-full mb-4">
                  <FileText className="w-12 h-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">No Document Processed</h3>
                <p className="text-slate-500 max-w-sm">
                  Upload an insurance document on the left to extract structured data, view the markdown representation, and see processing metadata.
                </p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}

