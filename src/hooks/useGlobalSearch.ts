import { useMemo, useState, useCallback } from "react";
import { Task, Project, User, TaskStatus, STATUS_LABELS } from "@/lib/types";
import { db } from "@/lib/db/database";
import { useAuthStore } from "@/stores/authStore";

export interface SearchResult {
  task: Task;
  project: Project;
  assignee: User | null;
  matchedFields: ("title" | "description" | "assignee" | "status")[];
}

interface UseGlobalSearchReturn {
  query: string;
  setQuery: (query: string) => void;
  results: SearchResult[];
  totalCount: number;
  isSearching: boolean;
  hasMoreResults: boolean;
}

const MAX_RESULTS = 20;

/**
 * Custom hook for global task search with permission-based filtering.
 * 
 * Design Decision: Using derived state instead of a dedicated store.
 * 
 * Justification:
 * 1. Search is ephemeral - no need to persist state across navigations
 * 2. Results are derived from existing data (tasks, users, projects)
 * 3. Simpler mental model - no store synchronization needed
 * 4. Better performance with useMemo - only recomputes when dependencies change
 * 5. Component unmount automatically cleans up state
 */
export function useGlobalSearch(): UseGlobalSearchReturn {
  const [query, setQuery] = useState("");
  const { user } = useAuthStore();

  const { results, totalCount, hasMoreResults } = useMemo(() => {
    if (!query.trim() || !user) {
      return { results: [], totalCount: 0, hasMoreResults: false };
    }

    const searchTerm = query.toLowerCase().trim();
    const allTasks = db.getTasks();
    const allProjects = db.getProjects();
    const allUsers = db.getUsers();

    // Permission filtering: Admin sees all, users see only their projects
    const accessibleProjectIds = new Set(
      user.role === "ADMIN"
        ? allProjects.map((p) => p.id)
        : allProjects.filter((p) => p.memberIds.includes(user.id)).map((p) => p.id)
    );

    const matchedResults: SearchResult[] = [];

    for (const task of allTasks) {
      // Skip tasks from inaccessible projects
      if (!accessibleProjectIds.has(task.projectId)) continue;

      const project = allProjects.find((p) => p.id === task.projectId);
      if (!project) continue;

      const assignee = task.assigneeId
        ? allUsers.find((u) => u.id === task.assigneeId) || null
        : null;

      const matchedFields: SearchResult["matchedFields"] = [];

      // Check title match
      if (task.title.toLowerCase().includes(searchTerm)) {
        matchedFields.push("title");
      }

      // Check description match
      if (task.description.toLowerCase().includes(searchTerm)) {
        matchedFields.push("description");
      }

      // Check assignee name/email match
      if (assignee) {
        if (
          assignee.name.toLowerCase().includes(searchTerm) ||
          assignee.email.toLowerCase().includes(searchTerm)
        ) {
          matchedFields.push("assignee");
        }
      }

      // Check status match
      const statusLabel = STATUS_LABELS[task.status].toLowerCase();
      if (
        statusLabel.includes(searchTerm) ||
        task.status.toLowerCase().includes(searchTerm)
      ) {
        matchedFields.push("status");
      }

      // Add to results if any field matched
      if (matchedFields.length > 0) {
        matchedResults.push({
          task,
          project,
          assignee,
          matchedFields,
        });
      }
    }

    // Sort by relevance: title matches first, then by updated date
    matchedResults.sort((a, b) => {
      const aTitleMatch = a.matchedFields.includes("title") ? 1 : 0;
      const bTitleMatch = b.matchedFields.includes("title") ? 1 : 0;
      if (aTitleMatch !== bTitleMatch) return bTitleMatch - aTitleMatch;
      return b.task.updatedAt.getTime() - a.task.updatedAt.getTime();
    });

    const totalCount = matchedResults.length;
    const limitedResults = matchedResults.slice(0, MAX_RESULTS);

    return {
      results: limitedResults,
      totalCount,
      hasMoreResults: totalCount > MAX_RESULTS,
    };
  }, [query, user]);

  return {
    query,
    setQuery,
    results,
    totalCount,
    isSearching: query.trim().length > 0,
    hasMoreResults,
  };
}

/**
 * Highlights matched text in a string.
 * Returns an array of segments with highlight flags for rendering.
 */
export function highlightText(
  text: string,
  query: string
): { text: string; highlight: boolean }[] {
  if (!query.trim()) {
    return [{ text, highlight: false }];
  }

  const searchTerm = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const segments: { text: string; highlight: boolean }[] = [];
  let lastIndex = 0;

  let index = lowerText.indexOf(searchTerm);
  while (index !== -1) {
    // Add non-highlighted segment before match
    if (index > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, index),
        highlight: false,
      });
    }

    // Add highlighted match (preserve original case)
    segments.push({
      text: text.slice(index, index + searchTerm.length),
      highlight: true,
    });

    lastIndex = index + searchTerm.length;
    index = lowerText.indexOf(searchTerm, lastIndex);
  }

  // Add remaining text
  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      highlight: false,
    });
  }

  return segments.length > 0 ? segments : [{ text, highlight: false }];
}
