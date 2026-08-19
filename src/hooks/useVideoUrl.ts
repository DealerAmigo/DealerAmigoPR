import { useState, useEffect } from 'react';

export function useVideoUrl(originalUrl: string) {
  const [videoUrl, setVideoUrl] = useState(originalUrl);

  useEffect(() => {
    let objectUrl = '';
    fetch(originalUrl)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch video");
        return res.blob();
      })
      .then(blob => {
        if (blob.type.includes('video') || blob.type === 'application/octet-stream' || blob.type === 'text/html') {
          // If the proxy returns HTML, it might be the cookie redirect, but typically it returns a blob of the video
          objectUrl = URL.createObjectURL(blob);
          setVideoUrl(objectUrl);
        }
      })
      .catch(err => console.error("Blob fetch error:", err));
      
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [originalUrl]);

  return videoUrl;
}
