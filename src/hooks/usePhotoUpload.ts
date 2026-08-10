import { useState, useRef, useCallback } from 'react';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit

function compressImage(
  dataUrl: string,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

export function usePhotoUpload(
  images: string[] = [],
  onChange?: (images: string[]) => void,
) {
  const [activeIndex, setActiveIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const fileList = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileList) {
        if (!file.type.startsWith('image/')) {
          if (typeof window !== 'undefined') {
            window.alert(`"${file.name}" is not a valid image file.`);
          }
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
          if (typeof window !== 'undefined') {
            window.alert(`"${file.name}" exceeds the 5MB image size limit.`);
          }
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        if (e.target) e.target.value = '';
        return;
      }

      const readFiles = validFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              compressImage(reader.result).then(resolve);
            }
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(readFiles).then((newImages) => {
        const updated = [...images, ...newImages];
        onChange?.(updated);
        setActiveIndex(updated.length - 1);
      });

      if (e.target) e.target.value = '';
    },
    [images, onChange],
  );

  const handleDelete = useCallback(
    (indexToDelete: number) => {
      const updated = images.filter((_, i) => i !== indexToDelete);
      onChange?.(updated);
      if (activeIndex >= updated.length) {
        setActiveIndex(Math.max(0, updated.length - 1));
      }
    },
    [images, activeIndex, onChange],
  );

  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    fileInputRef,
    handleFileUpload,
    handleDelete,
    nextImage,
    prevImage,
    triggerFileInput,
  };
}
