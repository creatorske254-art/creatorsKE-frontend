import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { uploadFile } from '@/lib/api';

const ACCEPTED = /^image\/(jpeg|png|gif|webp)$/;
const MAX_BYTES = 2 * 1024 * 1024;

/**
 * Real image upload for avatar/logo pickers: validates, shows an instant local
 * preview, POSTs to /uploads/upload, then swaps the preview for the returned
 * URL. Wire `onChange` to a hidden <input type="file">.
 *
 * @param {object}   [opts]
 * @param {string}   [opts.initialUrl]
 * @param {function} [opts.onUploaded]  ({ url, id, raw }) => void - persist the result
 * @param {string}   [opts.successMessage]
 */
export function useImageUpload({ initialUrl = null, onUploaded, successMessage = 'Image uploaded.' } = {}) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);

  const onChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPTED.test(file.type)) { toast.error('Please choose a JPG, PNG or GIF.'); return; }
    if (file.size > MAX_BYTES) { toast.error('That image is over 2 MB.'); return; }

    const preview = URL.createObjectURL(file);
    const previous = url;
    setUrl(preview);
    setUploading(true);
    try {
      const raw = await uploadFile(file);
      const finalUrl = raw?.url ?? raw?.data?.url ?? preview;
      const id = raw?.id ?? raw?.data?.id;
      setUrl(finalUrl);
      onUploaded?.({ url: finalUrl, id, raw });
      toast.success(successMessage);
    } catch (err) {
      setUrl(previous);
      toast.error(err.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [url, onUploaded, successMessage]);

  return { url, setUrl, uploading, onChange };
}
