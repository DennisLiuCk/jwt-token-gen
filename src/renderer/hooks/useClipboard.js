import { useState } from 'react';

/**
 * Custom hook for clipboard operations
 * @returns {Object} Clipboard state and copy function
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  async function copyToClipboard(text) {
    try {
      setError(null);

      // Use Clipboard API if available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          throw new Error('Failed to copy to clipboard');
        } finally {
          document.body.removeChild(textArea);
        }
      }

      setCopied(true);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);

      return true;
    } catch (err) {
      setError(err.message);
      console.error('Clipboard error:', err);
      return false;
    }
  }

  return {
    copyToClipboard,
    copied,
    error
  };
}
