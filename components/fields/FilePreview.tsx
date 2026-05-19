'use client';

import { useState } from 'react';
import { FileValue, downloadFile } from '@/lib/api';
import styles from './FilePreview.module.css';

interface FilePreviewProps {
  record: FileValue;
}

function fileIcon(fileType: string): string {
  switch (fileType) {
    case 'image':    return '🖼️';
    case 'video':    return '🎬';
    case 'audio':    return '🎵';
    case 'document': return '📄';
    case 'archive':  return '🗜️';
    case 'code':     return '💻';
    default:         return '📎';
  }
}

export default function FilePreview({ record }: FilePreviewProps) {
  const [downloading, setDownloading] = useState(false);

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadFile(record);
    } finally {
      setDownloading(false);
    }
  }

  const isImage = record.mime_type?.startsWith('image/');
  const isPdf   = record.mime_type === 'application/pdf';

  return (
    <div className={styles.preview}>

      {/* Image preview */}
      {isImage && (
        <div
          className={styles.imageWrap}
          onClick={() => window.open(record.url, '_blank')}
          title="Click to open full size"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={record.url} alt={record.original_filename} loading="lazy" />
        </div>
      )}

      {/* PDF — icon + name */}
      {isPdf && (
        <div className={styles.fileInfo}>
          <span className={styles.icon}>📕</span>
          <div className={styles.meta}>
            <div className={styles.fileName}>{record.original_filename}</div>
            <div className={styles.fileSize}>{record.file_size_human}</div>
          </div>
        </div>
      )}

      {/* Everything else */}
      {!isImage && !isPdf && (
        <div className={styles.fileInfo}>
          <span className={styles.icon}>{fileIcon(record.file_type)}</span>
          <div className={styles.meta}>
            <div className={styles.fileName}>{record.original_filename}</div>
            <div className={styles.fileSize}>{record.file_size_human}</div>
          </div>
        </div>
      )}

      {/* Download button — all types */}
      <div className={styles.actions}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? <span className="spinner" /> : '↓'} Download
        </button>
      </div>

    </div>
  );
}
