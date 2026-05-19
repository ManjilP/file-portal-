'use client';

import { useRef, useState, useEffect, DragEvent, ChangeEvent } from 'react';
import { FileValue, uploadFile, formatSize } from '@/lib/api';
import FilePreview from './FilePreview';
import styles from './FileField.module.css';

export interface FileFieldProps {
  name: string;
  label: string;
  value: FileValue | FileValue[] | null;
  onChange: (value: FileValue | FileValue[] | null) => void;
  error?: string;
  disabled?: boolean;
  accept?: string;
  maxSizeMb?: number;
  multiple?: boolean;
}

type FileEntry = {
  key: string;
  file?: File;
  record?: FileValue;
  status: 'uploading' | 'done' | 'error';
  progress: number;
  error?: string;
};

export default function FileField({
  label,
  error,
  disabled,
  accept,
  maxSizeMb,
  multiple,
  onChange,
}: FileFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const done = entries.filter((e) => e.status === 'done' && e.record);
    if (multiple) {
      onChange(done.map((e) => e.record!));
    } else {
      onChange(done[0]?.record ?? null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  function openPicker() {
    if (!disabled) inputRef.current?.click();
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!disabled) setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length) handleFiles(files);
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length) handleFiles(files);
    e.target.value = '';
  }

  function validate(file: File): string | null {
    if (accept) {
      const accepted = accept.split(',').map((s) => s.trim());
      const matched = accepted.some((pattern) => {
        if (pattern.endsWith('/*')) {
          return file.type.startsWith(pattern.replace('/*', '/'));
        }
        return file.type === pattern || file.name.endsWith(pattern.replace('*', ''));
      });
      if (!matched) return `"${file.name}" is not an allowed file type (${accept}).`;
    }
    const limit = maxSizeMb ?? 5;
    if (file.size > limit * 1024 * 1024) {
      return `"${file.name}" exceeds the ${limit} MB limit.`;
    }
    return null;
  }

  function handleFiles(files: File[]) {
    setValidationError(null);

    const toUpload = multiple ? files : [files[0]];

    for (const file of toUpload) {
      const err = validate(file);
      if (err) {
        setValidationError(err);
        return;
      }
    }

    for (const file of toUpload) {
      const key = `${file.name}-${Date.now()}-${Math.random()}`;
      const entry: FileEntry = { key, file, status: 'uploading', progress: 0 };

      setEntries((prev) => (multiple ? [...prev, entry] : [entry]));

      uploadFile(file, (pct) => {
        setEntries((prev) =>
          prev.map((e) => (e.key === key ? { ...e, progress: pct } : e))
        );
      })
        .then((record) => {
          setEntries((prev) =>
            prev.map((e) =>
              e.key === key ? { ...e, status: 'done' as const, record, progress: 100 } : e
            )
          );
        })
        .catch((uploadErr) => {
          setEntries((prev) =>
            prev.map((e) =>
              e.key === key
                ? { ...e, status: 'error' as const, error: uploadErr.message }
                : e
            )
          );
        });
    }
  }

  function removeEntry(key: string) {
    setEntries((prev) => prev.filter((e) => e.key !== key));
  }

  const hint = [
    accept ?? 'Any file type',
    maxSizeMb ? `max ${maxSizeMb} MB` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.wrapper}>
      {label && <label className={styles.label}>{label}</label>}

      <div
        className={[
          styles.dropzone,
          dragOver ? styles.dragOver : '',
          disabled ? styles.disabled : '',
        ]
          .join(' ')
          .trim()}
        onClick={openPicker}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className={styles.dropIcon}>📁</span>
        <span className={styles.dropText}>
          Drop files here or <u>browse</u>
        </span>
        {hint && <span className={styles.dropHint}>{hint}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      {(validationError || error) && (
        <span className={styles.error}>{validationError ?? error}</span>
      )}

      {entries.length > 0 && (
        <div className={styles.fileList}>
          {entries.map((entry) => (
            <div key={entry.key} className={styles.fileItem}>
              {entry.status === 'done' && entry.record ? (
                <div>
                  <FilePreview record={entry.record} />
                  {!disabled && (
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => removeEntry(entry.key)}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className={styles.fileRow}>
                    <span className={styles.fileName}>{entry.file?.name}</span>
                    {entry.file && (
                      <span className={styles.fileSize}>{formatSize(entry.file.size)}</span>
                    )}
                    {!disabled && (
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeEntry(entry.key)}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {entry.status === 'uploading' && (
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${entry.progress}%` }}
                      />
                    </div>
                  )}

                  {entry.status === 'error' && (
                    <span className={styles.fileError}>{entry.error}</span>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
