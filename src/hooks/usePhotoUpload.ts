import { useState, useRef, useCallback } from 'react';

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

      const readFiles = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
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
