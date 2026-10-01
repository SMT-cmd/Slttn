export const ADMIN_WORKSPACE_KEY = "slt.admin.workspace.v1";

export type AdminWorkspaceTab = "overview" | "books" | "users" | "coupons" | "sales";

export type AdminBookWorkspaceDraft = {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  category: string;
  size: "short" | "medium" | "full";
  launch_mode: "prelaunch" | "launch";
  blurb: string;
  published: boolean;
  sort_order: number;
  cover_url: string;
};

export type AdminWorkspaceDraft = {
  activeTab: AdminWorkspaceTab;
  selectedBookId: string | null;
  draft: AdminBookWorkspaceDraft | null;
  note: string;
};

export function defaultAdminWorkspace(): AdminWorkspaceDraft {
  return {
    activeTab: "overview",
    selectedBookId: null,
    draft: null,
    note: "",
  };
}

export function loadAdminWorkspace(): AdminWorkspaceDraft {
  if (typeof window === "undefined") return defaultAdminWorkspace();

  try {
    const raw = window.localStorage.getItem(ADMIN_WORKSPACE_KEY);
    if (!raw) return defaultAdminWorkspace();
    const parsed = JSON.parse(raw) as Partial<AdminWorkspaceDraft> | null;
    if (!parsed || typeof parsed !== "object") return defaultAdminWorkspace();
    return {
      activeTab: isWorkspaceTab(parsed.activeTab) ? parsed.activeTab : "overview",
      selectedBookId: typeof parsed.selectedBookId === "string" ? parsed.selectedBookId : null,
      draft: isWorkspaceBookDraft(parsed.draft) ? parsed.draft : null,
      note: typeof parsed.note === "string" ? parsed.note : "",
    };
  } catch {
    return defaultAdminWorkspace();
  }
}

export function saveAdminWorkspace(workspace: AdminWorkspaceDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_WORKSPACE_KEY, JSON.stringify(workspace));
}

export function clearAdminWorkspace() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_WORKSPACE_KEY);
}

function isWorkspaceTab(value: unknown): value is AdminWorkspaceTab {
  return value === "overview" || value === "books" || value === "users" || value === "coupons" || value === "sales";
}

function isWorkspaceBookDraft(value: unknown): value is AdminBookWorkspaceDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.id === "string" &&
    typeof draft.title === "string" &&
    typeof draft.subtitle === "string" &&
    typeof draft.slug === "string" &&
    typeof draft.category === "string" &&
    (draft.size === "short" || draft.size === "medium" || draft.size === "full") &&
    (draft.launch_mode === "prelaunch" || draft.launch_mode === "launch") &&
    typeof draft.blurb === "string" &&
    typeof draft.published === "boolean" &&
    typeof draft.sort_order === "number" &&
    typeof draft.cover_url === "string"
  );
}
