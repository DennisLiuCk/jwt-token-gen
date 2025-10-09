import { useState } from 'react';

/**
 * Custom hook for clipboard operations
 * @returns {Object} Object containing:
 *   - copyToClipboard: Function to copy text to clipboard
 *   - copied: Boolean indicating if text was recently copied
 *   - error: Error message if copy operation failed
 */
export function useClipboard() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Copy text to clipboard using Clipboard API or fallback
   * @param {string} text - The text to copy
   * @returns {Promise<boolean>} True if successful, false otherwise
   */
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
      // Clipboard error stored in state for display
      return false;
    }
  }

  return {
    copyToClipboard,
    copied,
    error
  };
}
