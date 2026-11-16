"use client";

import * as React from "react";
import axios from "axios";
import {
  GraduationCap, Network, Presentation, HardDrive, MessageSquare,
  PenTool, GitBranch, Monitor, Smartphone, Sparkles, Wand2,
  ArrowUp, KeyRound, Check, ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SOLVING_OPTIONS, CREATION_OPTIONS, SOFTWARE_ARCHITECTURE_SIDEKICK,
} from "./ai-chat-types";
import { getSavedApiKey, getSavedProvider, saveApiKey } from "./ai-key-storage";

interface AIChatOptionsPanelProps {
  activeSidekick: string;
  onSelectSidekick: (id: string) => void;
  onSendMessage: (text: string) => void;
  onGenerateDiagram: (params: {
    diagramType: string;
    prompt: string;
    apiKey: string;
    provider: string;
  }) => void;
  isGenerating?: boolean;
}

const VAULT_PROVIDERS = [
  { id: "google", label: "Google Gemini" },
  { id: "openai", label: "OpenAI" },
  { id: "anthropic", label: "Anthropic" },
  { id: "groq", label: "Groq" },
  { id: "mistral", label: "Mistral" },
  { id: "deepseek", label: "DeepSeek" },
  { id: "openrouter", label: "OpenRouter" },
  { id: "custom", label: "Custom Endpoint" },
];

export function AIChatOptionsPanel({
  activeSidekick,
  onSelectSidekick,
  onSendMessage,
  onGenerateDiagram,
  isGenerating = false,
}: AIChatOptionsPanelProps) {
  const [selectedType, setSelectedType] = React.useState<string>("generate-diagram");
  const [promptText, setPromptText] = React.useState("");
  const [showKeyConfig, setShowKeyConfig] = React.useState(false);
  const [apiKey, setApiKey] = React.useState("");
  const [provider, setProvider] = React.useState<string>("google");
  const [label, setLabel] = React.useState("My API Key");
  const [statusMsg, setStatusMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    setApiKey(getSavedApiKey());
    const saved = getSavedProvider();
    setProvider(saved === "gemini" ? "google" : saved);
  }, []);

  const isArch = activeSidekick === "software-architecture";
  const selectedOption = CREATION_OPTIONS.find((o) => o.id === selectedType) || CREATION_OPTIONS[0];

  const handleSaveVault = async () => {
    if (!apiKey.trim()) return;
    try {
      await axios.post("/api/credentials", {
        provider,
        label: label.trim() || `${provider} Key`,
        apiKey: apiKey.trim(),
      });
      saveApiKey(apiKey, provider as any);
      setStatusMsg("Vault Saved!");
      setTimeout(() => { setStatusMsg(null); setShowKeyConfig(false); }, 1500);
    } catch {
      saveApiKey(apiKey, provider as any);
      setStatusMsg("Local Saved");
      setTimeout(() => { setStatusMsg(null); setShowKeyConfig(false); }, 1500);
    }
  };

  const handleGenerate = () => {
    if (!promptText.trim()) return;
    const keyToUse = apiKey || getSavedApiKey();
    if (!keyToUse) { setShowKeyConfig(true); return; }
    onGenerateDiagram({
      diagramType: selectedType,
      prompt: promptText.trim(),
      apiKey: keyToUse,
      provider,
    });
  };

  const renderIcon = (name: string) => {
    switch (name) {
      case "PenTool": return <PenTool className="size-4" />;
      case "GitBranch": return <GitBranch className="size-4" />;
      case "Network": return <Network className="size-4" />;
      case "Monitor": return <Monitor className="size-4" />;
      case "Smartphone": return <Smartphone className="size-4" />;
      case "GraduationCap": return <GraduationCap className="size-4" />;
      case "Presentation": return <Presentation className="size-4" />;
      case "HardDrive": return <HardDrive className="size-4" />;
      case "MessageSquare": return <MessageSquare className="size-4" />;
      default: return <Sparkles className="size-4" />;
    }
  };

  if (isArch) {
    return (
      <div className="flex flex-col items-center text-center pt-2 pb-1 space-y-3">
        <div className="flex size-14 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 text-xl font-bold shadow-xs">
          S
        </div>
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground tracking-tight">Software Architecture</h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-xs leading-relaxed">
            {SOFTWARE_ARCHITECTURE_SIDEKICK.description}
          </p>
        </div>
        <div className="flex flex-col gap-1.5 w-full pt-1">
          {SOFTWARE_ARCHITECTURE_SIDEKICK.promptChips.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => onSendMessage(chip)}
              className="rounded-full border border-border/80 bg-muted/40 hover:bg-muted px-4 py-2 text-xs font-medium text-foreground text-center transition-colors cursor-pointer shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* What do you want to create? */}
      <div>
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          What do you want to create?
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {CREATION_OPTIONS.map((card) => {
            const isSelected = selectedType === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setSelectedType(card.id)}
                className={cn(
                  "relative flex items-center gap-2.5 p-2.5 rounded-2xl border text-left transition-all cursor-pointer",
                  isSelected
                    ? "border-purple-500/80 bg-purple-500/5 dark:bg-purple-500/10 shadow-xs ring-1 ring-purple-500/40"
                    : "border-border/70 bg-card hover:bg-muted/60"
                )}
              >
                <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-xl", card.badgeBg)}>
                  {renderIcon(card.iconName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-foreground truncate">{card.title}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{card.description}</div>
                </div>
                {isSelected && (
                  <span className="absolute top-2 right-2 size-2 rounded-full bg-purple-600 dark:bg-purple-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Describe your idea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <h4 className="text-xs font-semibold text-foreground">Describe your idea</h4>
            <p className="text-[10px] text-muted-foreground">AI will generate it directly on your canvas</p>
          </div>
          <Wand2 className="size-4 text-purple-500 opacity-80" />
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-2.5 shadow-xs focus-within:ring-1 focus-within:ring-purple-500/50">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="E.g. Create a customer onboarding flow with signup, email verification..."
            rows={3}
            className="w-full bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
            <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
              {selectedOption.title}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => setShowKeyConfig((v) => !v)}
                title={apiKey ? "KMS Credential Vault active" : "Configure Provider Key"}
                className={cn("size-6 rounded-lg", apiKey ? "text-emerald-500" : "text-amber-500")}
              >
                <KeyRound className="size-3.5" />
              </Button>

              <Button
                type="button"
                onClick={handleGenerate}
                disabled={!promptText.trim() || isGenerating}
                className="h-7 rounded-full bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 px-3 text-xs font-medium hover:opacity-90 disabled:opacity-40 flex items-center gap-1"
              >
                <span>Generate</span>
                <ArrowUp className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KMS Credential Vault Config Box */}
      {showKeyConfig && (
        <div className="rounded-2xl border border-border bg-muted/30 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="size-3.5 text-purple-600" />
              KMS Credential Vault
            </span>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="bg-card border border-border rounded px-2 py-0.5 text-[11px] text-foreground"
            >
              {VAULT_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Credential label (e.g. Production Key)"
            className="w-full rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground outline-none"
          />
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`Enter ${provider} API Key`}
            className="w-full rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs text-foreground outline-none"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" size="xs" variant="outline" onClick={() => setShowKeyConfig(false)}>
              Cancel
            </Button>
            <Button type="button" size="xs" onClick={handleSaveVault} className="bg-purple-600 text-white hover:bg-purple-700">
              {statusMsg ? <Check className="size-3 mr-1" /> : null}
              {statusMsg || "Save to Vault"}
            </Button>
          </div>
        </div>
      )}

      {/* Solving Options */}
      <div className="pt-2 border-t border-border/40">
        <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
          What are we solving today?
        </h4>
        <div className="space-y-0.5">
          {SOLVING_OPTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === "map-process") onSelectSidekick("software-architecture");
                else onSendMessage(item.title);
              }}
              className="flex items-center gap-2.5 w-full p-1.5 rounded-xl hover:bg-muted/60 text-left transition-colors cursor-pointer"
            >
              <div className={cn("flex size-6 items-center justify-center rounded-full", item.badgeBg, item.color)}>
                {renderIcon(item.iconName)}
              </div>
              <span className="text-xs font-medium text-foreground">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
