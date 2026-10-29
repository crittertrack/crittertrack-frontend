import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, Camera, Loader2, X } from 'lucide-react';
import apiClient from '../../utils/apiClient';

const GENDER_OPTIONS = ['Male', 'Female', 'Intersex', 'Mixed', 'Unknown'];
const STATUS_OPTIONS = [
  'Pet', 'Growout', 'Breeder', 'Available', 'Booked', 'Retired',
  'Deceased', 'Culled', 'Rehomed', 'Unknown',
];
const BATCH_LIMIT = 100;

const ROW_FIELDS = [
  { key: 'prefix', label: 'Prefix', type: 'text' },
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'suffix', label: 'Suffix', type: 'text' },
  { key: 'gender', label: 'Gender', type: 'select', options: GENDER_OPTIONS },
  { key: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS },
  { key: 'birthDate', label: 'Birth date', type: 'date' },
  { key: 'color', label: 'Color', type: 'text' },
  { key: 'coat', label: 'Coat', type: 'text' },
];

const createEmptyRow = () => ({
  prefix: '',
  name: '',
  suffix: '',
  gender: 'Unknown',
  status: 'Pet',
  birthDate: '',
  color: '',
  coat: '',
  imageFile: null,
  imageUrl: null,
  imageUploading: false,
  imageError: null,
});

const createEmptyRows = (n) => Array.from({ length: n }, createEmptyRow);

const Field = ({ label, value, onChange, options, required, rowIndex, fieldKey, type = 'text' }) => {
  const commonClass = 'w-full min-w-[105px] px-2 py-1.5 rounded-md border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-800 dark:text-dark-text-primary focus:outline-none focus:ring-1 focus:ring-primary';

  if (options) {
    return (
      <select
        aria-label={`${label} for animal ${rowIndex + 1}`}
        value={value ?? ''}
        onChange={(e) => onChange(rowIndex, fieldKey, e.target.value)}
        className={commonClass}
      >
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    );
  }

  return (
    <input
      type={type}
      aria-label={`${label} for animal ${rowIndex + 1}`}
      value={value ?? ''}
      onChange={(e) => onChange(rowIndex, fieldKey, e.target.value)}
      placeholder={type === 'date' ? undefined : label}
      required={required}
      className={commonClass}
    />
  );
};

const BulkAnimalCreatePage = ({ species, onClose }) => {
  const [quantity, setQuantity] = useState(2);
  const [rows, setRows] = useState(() => createEmptyRows(2));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitResults, setSubmitResults] = useState(null);
  const fileInputRefs = useRef({});
  const uploadIds = useRef({});

  useEffect(() => {
    setRows((prev) => {
      if (prev.length === quantity) return prev;
      if (prev.length < quantity) return [...prev, ...createEmptyRows(quantity - prev.length)];
      return prev.slice(0, quantity);
    });
  }, [quantity]);

  const handleQuantityChange = (e) => {
    let val = parseInt(e.target.value, 10);
    if (Number.isNaN(val) || val < 2) val = 2;
    if (val > BATCH_LIMIT) val = BATCH_LIMIT;
    setQuantity(val);
  };

  const handleRowChange = useCallback((index, field, value) => {
    setRows((prev) => prev.map((row, i) => (
      i === index ? { ...row, [field]: value } : row
    )));
  }, []);

  const handleImageChange = useCallback(async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const uploadId = (uploadIds.current[index] || 0) + 1;
    uploadIds.current[index] = uploadId;
    setRows((prev) => prev.map((row, i) => (
      i === index ? {
        ...row,
        imageFile: file,
        imageUrl: null,
        imageUploading: true,
        imageError: null,
      } : row
    )));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/upload', formData);
      const url = res.data?.url;
      if (!url) throw new Error('Upload response did not include an image URL.');
      if (uploadIds.current[index] !== uploadId) return;
      setRows((prev) => prev.map((row, i) => (
        i === index ? { ...row, imageUrl: url, imageUploading: false, imageError: null } : row
      )));
    } catch (err) {
      console.error('[BULK] image upload failed', err);
      if (uploadIds.current[index] !== uploadId) return;
      setRows((prev) => prev.map((row, i) => (
        i === index ? {
          ...row,
          imageUploading: false,
          imageError: 'Failed to upload image.',
        } : row
      )));
    }
  }, []);

  const hasLoadingImages = rows.some((row) => row.imageUploading);
  const missingNames = rows.filter((row) => !row.name.trim());
  const canSubmit = !submitting && missingNames.length === 0 && !hasLoadingImages && rows.length >= 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    if (missingNames.length > 0) {
      setSubmitError(`${missingNames.length} row(s) are missing a name. All rows must have a name.`);
      return;
    }
    if (hasLoadingImages) {
      setSubmitError('Some images are still uploading. Please wait for all uploads to finish.');
      return;
    }
    if (rows.length < 2) return;

    setSubmitting(true);
    setSubmitError('');
    setSubmitResults(null);

    try {
      const payloads = rows.map((row) => ({
        prefix: row.prefix,
        name: row.name.trim(),
        suffix: row.suffix,
        gender: row.gender,
        status: row.status,
        birthDate: row.birthDate,
        color: row.color,
        coat: row.coat,
        ...(row.imageUrl ? { imageUrl: row.imageUrl } : {}),
      }));

      const res = await apiClient.post(
        `/animals/bulk?species=${encodeURIComponent(species)}`,
        { animals: payloads }
      );
      const result = res.data;
      setSubmitResults(result);
      const createdCount = result?.created?.length || 0;
      if (createdCount > 0) window.dispatchEvent(new Event('animals-changed'));

      if (result?.errors?.length > 0) {
        setSubmitError(`Created ${createdCount} animals. ${result.errors.map((error) => error.message).join('; ')}`);
      } else if (createdCount > 0) {
        if (onClose) onClose();
      } else {
        setSubmitError('No animals were created. Please check the response and try again.');
      }
    } catch (err) {
      console.error('[BULK] create failed', err);
      setSubmitError(err.response?.data?.message || err.message || 'Failed to create animals.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-card-bg w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl flex flex-col">
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-dark-border px-5 py-4 flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-800 dark:text-dark-text-primary flex-1">Bulk Add Animals</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-surface-hover">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-1">Species</label>
              <input value={species ?? ''} readOnly className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-gray-100 dark:bg-dark-surface text-gray-800 dark:text-dark-text-primary" />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label htmlFor="bulk-animal-quantity" className="block text-xs font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide mb-1">Quantity</label>
              <input id="bulk-animal-quantity" type="number" value={quantity} onChange={handleQuantityChange} min={2} max={BATCH_LIMIT} disabled={submitting} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border" />
              <p className="text-xs text-gray-400 dark:text-dark-text-secondary mt-1">{rows.length} animals will be created.</p>
            </div>
          </div>

          {(submitError || submitResults) && (
            <div className={`rounded-lg border p-3 ${submitError ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700/60' : 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700/60'}`}>
              {submitError && <p className="text-sm text-red-700 dark:text-red-300">{submitError}</p>}
              {submitResults && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold mb-1">Results</p>
                  <p className="text-green-700 dark:text-green-300">Created: {submitResults.created?.length || 0}</p>
                  {submitResults.errors?.length > 0 && (
                    <p className="text-red-700 dark:text-red-300">Errors: {submitResults.errors.map((error) => error.message).join('; ')}</p>
                  )}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-dark-border">
                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-dark-text-secondary">#</th>
                    {ROW_FIELDS.map((field) => (
                      <th key={field.key} className="py-2 text-left font-semibold text-gray-500 dark:text-dark-text-secondary">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </th>
                    ))}
                    <th className="py-2 text-left font-semibold text-gray-500 dark:text-dark-text-secondary">Profile image</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 dark:border-dark-border">
                      <td className="py-1.5 text-gray-400">{i + 1}</td>
                      {ROW_FIELDS.map((field) => (
                        <td key={field.key} className="py-1.5">
                          <Field
                            label={field.label}
                            value={row[field.key]}
                            onChange={handleRowChange}
                            options={field.options}
                            required={field.required}
                            rowIndex={i}
                            fieldKey={field.key}
                            type={field.type}
                          />
                        </td>
                      ))}
                      <td className="py-1.5">
                        <div className="flex items-center gap-1">
                          {row.imageUrl && <img src={row.imageUrl} alt={`Animal ${i + 1} preview`} className="w-8 h-8 rounded object-cover" />}
                          {row.imageUploading && <Loader2 size={12} className="animate-spin text-gray-400" />}
                          {row.imageError && <span title={row.imageError}><AlertCircle size={12} className="text-red-500" /></span>}
                          <button
                            type="button"
                            aria-label={`Upload image for animal ${i + 1}`}
                            disabled={submitting || row.imageUploading}
                            onClick={() => fileInputRefs.current[i]?.click()}
                            className="p-1 rounded border border-dashed text-gray-400 hover:text-primary disabled:opacity-50"
                          >
                            <Camera size={12} />
                          </button>
                          <input
                            ref={(el) => { fileInputRefs.current[i] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageChange(i, e)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex flex-wrap justify-end gap-3 pt-3 border-t border-gray-200 dark:border-dark-border">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 dark:hover:bg-dark-surface-hover">Cancel</button>
              <button type="submit" disabled={!canSubmit} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 dark:bg-dark-primary text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center">
                {submitting ? <><Loader2 size={16} className="animate-spin mr-2" />Creating…</> : <>Create {rows.length} animals</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkAnimalCreatePage;
