"use client";

import * as React from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Code,
  Quote,
  FileText,
  Save,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentProps {
  boardId: string;
}

export function Document({ boardId }: DocumentProps) {
  const [docContent, setDocContent] = React.useState(
    "# Document Notes\n\nWrite specifications, meeting notes, or project documentation here alongside your whiteboard."
  );
  const [isSaved, setIsSaved] = React.useState(true);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDocContent(e.target.value);
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    // Simulates quick document autosave
  };

  return (
    <div className="flex size-full flex-col pt-14 bg-background">
      {/* Document Formatting Subheader */}
      <div className="flex items-center justify-between border-b border-border/80 bg-background/80 px-6 py-2 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" className="size-7" title="Heading 1">
            <Heading1 className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7" title="Heading 2">
            <Heading2 className="size-3.5" />
          </Button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <Button variant="ghost" size="icon-xs" className="size-7" title="Bold">
            <Bold className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7" title="Italic">
            <Italic className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7" title="Underline">
            <Underline className="size-3.5" />
          </Button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <Button variant="ghost" size="icon-xs" className="size-7" title="Bullet List">
            <List className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7" title="Numbered List">
            <ListOrdered className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7" title="Code Block">
            <Code className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" className="size-7" title="Quote">
            <Quote className="size-3.5" />
          </Button>
        </div>

        {/* Save feedback indicator */}
        <div className="flex items-center gap-2">
          {isSaved ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Check className="size-3 text-emerald-500" />
              <span>Saved</span>
            </span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleSave}
              className="h-7 text-xs gap-1.5"
            >
              <Save className="size-3 text-muted-foreground" />
              <span>Save draft</span>
            </Button>
          )}
        </div>
      </div>

      {/* Document Paper Container */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-border/80 bg-card p-8 md:p-12 shadow-sm min-h-[700px]">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/60 text-muted-foreground">
            <FileText className="size-5 text-blue-500" />
            <span className="text-xs font-medium">Board Reference: {boardId.slice(0, 8)}...</span>
          </div>

          <textarea
            value={docContent}
            onChange={handleTextChange}
            placeholder="Start typing your document..."
            className="w-full h-[550px] resize-none bg-transparent font-sans text-sm md:text-base leading-relaxed text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}

