import * as React from "react"
import type { Editor } from "@tiptap/react"
import {
  CodeBlockIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TextBIcon,
  TextHOneIcon,
  TextHTwoIcon,
  TextItalicIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"
import { TransitionDropdown } from "@/components/ui/transition-dropdown"

type Chain = ReturnType<Editor["chain"]>

interface SlashCommand {
  label: string
  keywords: string[]
  icon: React.ReactNode
  run: (chain: Chain) => Chain
}

const COMMANDS: SlashCommand[] = [
  {
    label: "Heading 1",
    keywords: ["h1", "title", "heading"],
    icon: <TextHOneIcon />,
    run: (c) => c.toggleHeading({ level: 1 }),
  },
  {
    label: "Heading 2",
    keywords: ["h2", "subtitle", "heading"],
    icon: <TextHTwoIcon />,
    run: (c) => c.toggleHeading({ level: 2 }),
  },
  {
    label: "Bullet list",
    keywords: ["ul", "unordered", "list"],
    icon: <ListBulletsIcon />,
    run: (c) => c.toggleBulletList(),
  },
  {
    label: "Numbered list",
    keywords: ["ol", "ordered", "list"],
    icon: <ListNumbersIcon />,
    run: (c) => c.toggleOrderedList(),
  },
  {
    label: "Quote",
    keywords: ["blockquote", "cite"],
    icon: <QuotesIcon />,
    run: (c) => c.toggleBlockquote(),
  },
  {
    label: "Code block",
    keywords: ["pre", "snippet"],
    icon: <CodeBlockIcon />,
    run: (c) => c.toggleCodeBlock(),
  },
  {
    label: "Divider",
    keywords: ["hr", "rule", "separator"],
    icon: <MinusIcon />,
    run: (c) => c.setHorizontalRule(),
  },
  {
    label: "Bold",
    keywords: ["strong"],
    icon: <TextBIcon />,
    run: (c) => c.toggleBold(),
  },
  {
    label: "Italic",
    keywords: ["em", "emphasis"],
    icon: <TextItalicIcon />,
    run: (c) => c.toggleItalic(),
  },
]

function match(query: string): SlashCommand[] {
  const q = query.toLowerCase()
  if (!q) return COMMANDS
  return COMMANDS.filter(
    (c) =>
      c.label.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  )
}

/**
 * Notion-style "/" command menu for the tiptap notes editor. Typing "/" at the
 * start of a line (or after a space) opens a markdown-block picker positioned
 * at the caret; arrow keys + Enter/Tab select, Escape dismisses.
 *
 * `keyRef` is wired into the editor's `handleKeyDown` so navigation keys are
 * intercepted before ProseMirror handles them while the menu is open.
 */
export function NotesSlashMenu({
  editor,
  keyRef,
}: {
  editor: Editor
  keyRef: React.RefObject<(e: KeyboardEvent) => boolean>
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const [coords, setCoords] = React.useState({ left: 0, top: 0 })
  const range = React.useRef<{ from: number; to: number } | null>(null)

  const items = match(query)
  const clampedActive = items.length ? Math.min(active, items.length - 1) : 0

  const close = React.useCallback(() => {
    setOpen(false)
    range.current = null
  }, [])

  const select = React.useCallback(
    (cmd: SlashCommand | undefined) => {
      if (!cmd || !range.current) return
      cmd.run(editor.chain().focus().deleteRange(range.current)).run()
      close()
    },
    [editor, close]
  )

  React.useEffect(() => {
    const refresh = () => {
      const sel = editor.state.selection
      if (!sel.empty || !editor.isEditable) return close()
      const $from = sel.$from
      const textBefore = $from.parent.textBetween(
        0,
        $from.parentOffset,
        undefined,
        "￼"
      )
      const m = /(?:^|\s)\/([^\s/]*)$/.exec(textBefore)
      if (!m) return close()
      const q = m[1] ?? ""
      if (match(q).length === 0) return close()
      const from = sel.from
      const c = editor.view.coordsAtPos(from)
      setQuery(q)
      setActive(0)
      range.current = { from: from - q.length - 1, to: from }
      setCoords({ left: c.left, top: c.bottom })
      setOpen(true)
    }
    editor.on("update", refresh)
    editor.on("selectionUpdate", refresh)
    return () => {
      editor.off("update", refresh)
      editor.off("selectionUpdate", refresh)
    }
  }, [editor, close])

  // Latest-closure key handler consumed by the editor's handleKeyDown.
  keyRef.current = (e: KeyboardEvent) => {
    if (!open || items.length === 0) return false
    switch (e.key) {
      case "ArrowDown":
        setActive((i) => (i + 1) % items.length)
        return true
      case "ArrowUp":
        setActive((i) => (i - 1 + items.length) % items.length)
        return true
      case "Enter":
      case "Tab":
        select(items[clampedActive])
        return true
      case "Escape":
        close()
        return true
      default:
        return false
    }
  }

  return (
    <TransitionDropdown
      open={open && items.length > 0}
      origin="top-left"
      role="listbox"
      className="fixed z-50 max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-[var(--elevation-high)]"
      style={{ left: coords.left, top: coords.top + 6 }}
    >
      {items.map((cmd, i) => (
        <button
          key={cmd.label}
          type="button"
          role="option"
          aria-selected={i === clampedActive}
          onMouseEnter={() => setActive(i)}
          onMouseDown={(e) => {
            e.preventDefault()
            select(cmd)
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground",
            i === clampedActive
              ? "bg-accent text-accent-foreground [&_svg]:text-accent-foreground"
              : "text-foreground"
          )}
        >
          {cmd.icon}
          <span>{cmd.label}</span>
        </button>
      ))}
    </TransitionDropdown>
  )
}
