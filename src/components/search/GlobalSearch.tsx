import { useEffect, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Keyboard } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PriorityIcon } from "@/components/ui/PriorityBadge";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { useGlobalSearch, highlightText, SearchResult } from "@/hooks/useGlobalSearch";
import { cn } from "@/lib/utils";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { query, setQuery, results, totalCount, isSearching, hasMoreResults } =
    useGlobalSearch();

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open, setQuery]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      onOpenChange(false);
      // Navigate to the project board with task highlighted
      navigate(`/projects/${result.project.id}?task=${result.task.id}`);
    },
    [navigate, onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search tasks by title, assignee, or status..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList className="max-h-[400px]">
        {!isSearching && (
          <div className="py-14 text-center">
            <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
            <p className="text-sm text-muted-foreground">
              Start typing to search tasks
            </p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs text-muted-foreground/60">
              <Keyboard className="h-3 w-3" />
              <span>Use ↑↓ to navigate, Enter to select, Esc to close</span>
            </div>
          </div>
        )}

        {isSearching && results.length === 0 && (
          <CommandEmpty>
            <div className="py-6 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Try searching by task title, assignee name, or status
              </p>
            </div>
          </CommandEmpty>
        )}

        {results.length > 0 && (
          <CommandGroup heading={`Tasks (${totalCount} found)`}>
            {results.map((result) => (
              <SearchResultItem
                key={result.task.id}
                result={result}
                query={query}
                onSelect={() => handleSelect(result)}
              />
            ))}
            {hasMoreResults && (
              <div className="px-2 py-3 text-center text-xs text-muted-foreground border-t">
                {totalCount - results.length} more results not shown. Refine
                your search.
              </div>
            )}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

interface SearchResultItemProps {
  result: SearchResult;
  query: string;
  onSelect: () => void;
}

function SearchResultItem({ result, query, onSelect }: SearchResultItemProps) {
  const { task, project, assignee, matchedFields } = result;

  return (
    <CommandItem
      value={`${task.id}-${task.title}`}
      onSelect={onSelect}
      className="flex items-start gap-3 py-3 px-2 cursor-pointer"
    >
      <div className="flex-1 min-w-0">
        {/* Task Title with highlighting */}
        <div className="flex items-center gap-2 mb-1">
          <PriorityIcon priority={task.priority} className="h-3.5 w-3.5 shrink-0" />
          <span className="font-medium text-sm truncate">
            <HighlightedText
              text={task.title}
              query={matchedFields.includes("title") ? query : ""}
            />
          </span>
        </div>

        {/* Project name and status */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate max-w-[150px]">{project.name}</span>
          <span>•</span>
          <StatusBadge status={task.status} className="text-[10px] px-1.5 py-0" />
        </div>
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-2 shrink-0">
        {assignee ? (
          <div className="flex items-center gap-1.5">
            <UserAvatar user={assignee} size="xs" />
            <span className="text-xs text-muted-foreground max-w-[100px] truncate">
              <HighlightedText
                text={assignee.name}
                query={matchedFields.includes("assignee") ? query : ""}
              />
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground/50 italic">
            Unassigned
          </span>
        )}
      </div>
    </CommandItem>
  );
}

interface HighlightedTextProps {
  text: string;
  query: string;
}

function HighlightedText({ text, query }: HighlightedTextProps) {
  const segments = highlightText(text, query);

  return (
    <>
      {segments.map((segment, index) =>
        segment.highlight ? (
          <mark
            key={index}
            className="bg-primary/20 text-foreground rounded-sm px-0.5"
          >
            {segment.text}
          </mark>
        ) : (
          <Fragment key={index}>{segment.text}</Fragment>
        )
      )}
    </>
  );
}

// Search trigger button for the navbar
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="relative h-9 w-9 md:w-64 justify-start text-sm text-muted-foreground md:pr-12"
    >
      <Search className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline-flex">Search tasks...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}
