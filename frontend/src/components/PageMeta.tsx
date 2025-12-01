"use client";
import { useEffect } from "react";

export default function PageMeta({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  useEffect(() => {
    document.title = title;
    if (description) {
      const meta = document.querySelector("meta[name='description']");
      if (meta) meta.setAttribute("content", description);
      else {
        const newMeta = document.createElement("meta");
        newMeta.name = "description";
        newMeta.content = description;
        document.head.appendChild(newMeta);
      }
    }
  }, [title, description]);

  return null;
}
