import { LucideIcon } from "lucide-react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface CreationOption {
  id: string;
  title: string;
  description: string;
  badgeBg: string;
  badgeColor: string;
  iconName: "PenTool" | "GitBranch" | "Network" | "Monitor" | "Smartphone";
  badgeIndicator?: boolean;
}

export interface SolvingOption {
  id: string;
  title: string;
  color: string;
  badgeBg: string;
  iconName: "GraduationCap" | "Network" | "Presentation" | "HardDrive" | "MessageSquare";
}

export interface Sidekick {
  id: string;
  title: string;
  description: string;
  avatarLetter: string;
  avatarBg: string;
  promptPlaceholder: string;
  promptChips: string[];
}

export const SOFTWARE_ARCHITECTURE_SIDEKICK: Sidekick = {
  id: "software-architecture",
  title: "Software Architecture",
  description: "Create diagrams and docs for good software design.",
  avatarLetter: "S",
  avatarBg: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  promptPlaceholder: "What shall Software Architecture do?",
  promptChips: [
    "Design scalable architecture",
    "Generate technical document",
    "Review existing diagram",
    "Create interconnected diagrams",
  ],
};

export const SOLVING_OPTIONS: SolvingOption[] = [
  {
    id: "learn-ai",
    title: "Learn Miro AI",
    color: "text-blue-500",
    badgeBg: "bg-blue-500/10 dark:bg-blue-500/20",
    iconName: "GraduationCap",
  },
  {
    id: "map-process",
    title: "Map a process",
    color: "text-orange-500",
    badgeBg: "bg-orange-500/10 dark:bg-orange-500/20",
    iconName: "Network",
  },
  {
    id: "prep-workshop",
    title: "Prep a workshop",
    color: "text-amber-500",
    badgeBg: "bg-amber-500/10 dark:bg-amber-500/20",
    iconName: "Presentation",
  },
  {
    id: "connect-gdrive",
    title: "Connect to Google Drive",
    color: "text-emerald-500",
    badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    iconName: "HardDrive",
  },
  {
    id: "connect-slack",
    title: "Connect to Slack",
    color: "text-pink-500",
    badgeBg: "bg-pink-500/10 dark:bg-pink-500/20",
    iconName: "MessageSquare",
  },
];

export const CREATION_OPTIONS: CreationOption[] = [
  {
    id: "generate-diagram",
    title: "Generate Diagram",
    description: "Create visual diagrams...",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    badgeColor: "text-blue-500",
    iconName: "PenTool",
  },
  {
    id: "flowchart",
    title: "Flowchart",
    description: "Visualize workflows",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    badgeColor: "text-purple-500",
    iconName: "GitBranch",
  },
  {
    id: "architecture",
    title: "Architecture",
    description: "Design system architecture...",
    badgeBg: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    badgeColor: "text-orange-500",
    iconName: "Network",
  },
  {
    id: "web-mockup",
    title: "Web Mockup",
    description: "Generate web wireframes...",
    badgeBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    badgeColor: "text-cyan-500",
    iconName: "Monitor",
    badgeIndicator: true,
  },
  {
    id: "mobile-mockup",
    title: "Mobile Mockup",
    description: "Generate app wireframes...",
    badgeBg: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    badgeColor: "text-pink-500",
    iconName: "Smartphone",
  },
];

