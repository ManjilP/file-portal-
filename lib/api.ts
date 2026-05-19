export interface FileRecord {
  id: string;
  url: string;
  original_filename: string;
  file_size: number;
  file_size_human: string;
  mime_type: string;
  file_type: string;
  file_type_display: string;
  width: number | null;
  height: number | null;
}

export interface FileValue extends FileRecord {
  _delete?: boolean;
}

export async function uploadFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<FileValue> {
  const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('project_id', String(projectId));

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/backend/media/');

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const body = JSON.parse(xhr.responseText);
          resolve(body.data[0]);
        } catch {
          reject(new Error('Invalid response from server'));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.message || `Upload failed (${xhr.status})`));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(formData);
  });
}

export async function downloadFile(record: FileValue): Promise<void> {
  const res = await fetch(record.url);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = record.original_filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
