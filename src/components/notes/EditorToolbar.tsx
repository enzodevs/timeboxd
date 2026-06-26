import { useEditorState } from "@tiptap/react"
import type { Editor } from "@tiptap/react"
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  CodeBlockIcon,
  CodeIcon,
  ListBulletsIcon,
  ListNumbersIcon,
  MinusIcon,
  QuotesIcon,
  TextBIcon,
  TextHOneIcon,
  TextHTwoIcon,
  TextItalicIcon,
  TextStrikethroughIcon,
} from "@phosphor-icons/react"

import { cn } from "@/lib/utils"

interface ToolButton {
  key: string
  icon: React.ReactNode
  title: string
  run: () => void
  isActive?: boolean
  disabled?: boolean
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      strike: e.isActive("strike"),
      code: e.isActive("code"),
      h1: e.isActive("heading", { level: 1 }),
      h2: e.isActive("heading", { level: 2 }),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  })

  const groups: ToolButton[][] = [
    [
      {
        key: "bold",
        icon: <TextBIcon weight="bold" />,
        title: "Bold",
        run: () => editor.chain().focus().toggleBold().run(),
        isActive: state.bold,
      },
      {
        key: "italic",
        icon: <TextItalicIcon />,
        title: "Italic",
        run: () => editor.chain().focus().toggleItalic().run(),
        isActive: state.italic,
      },
      {
        key: "strike",
        icon: <TextStrikethroughIcon />,
        title: "Strikethrough",
        run: () => editor.chain().focus().toggleStrike().run(),
        isActive: state.strike,
      },
      {
        key: "code",
        icon: <CodeIcon />,
        title: "Inline code",
        run: () => editor.chain().focus().toggleCode().run(),
        isActive: state.code,
      },
    ],
    [
      {
        key: "h1",
        icon: <TextHOneIcon />,
        title: "Heading 1",
        run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: state.h1,
      },
      {
        key: "h2",
        icon: <TextHTwoIcon />,
        title: "Heading 2",
        run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: state.h2,
      },
    ],
    [
      {
        key: "bullet",
        icon: <ListBulletsIcon />,
        title: "Bullet list",
        run: () => editor.chain().focus().toggleBulletList().run(),
        isActive: state.bullet,
      },
      {
        key: "ordered",
        icon: <ListNumbersIcon />,
        title: "Numbered list",
        run: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: state.ordered,
      },
      {
        key: "quote",
        icon: <QuotesIcon />,
        title: "Quote",
        run: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: state.quote,
      },
      {
        key: "codeblock",
        icon: <CodeBlockIcon />,
        title: "Code block",
        run: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: state.codeBlock,
      },
      {
        key: "hr",
        icon: <MinusIcon />,
        title: "Divider",
        run: () => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
    [
      {
        key: "undo",
        icon: <ArrowUUpLeftIcon />,
        title: "Undo",
        run: () => editor.chain().focus().undo().run(),
        disabled: !state.canUndo,
      },
      {
        key: "redo",
        icon: <ArrowUUpRightIcon />,
        title: "Redo",
        run: () => editor.chain().focus().redo().run(),
        disabled: !state.canRedo,
      },
    ],
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {gi > 0 && <span className="mx-1 h-5 w-px bg-border" />}
          {group.map((b) => (
            <button
              key={b.key}
              type="button"
              title={b.title}
              aria-label={b.title}
              aria-pressed={b.isActive}
              disabled={b.disabled}
              onClick={b.run}
              className={cn(
                "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-40 md:size-7 [&_svg]:size-4",
                b.isActive && "bg-accent text-accent-foreground"
              )}
            >
              {b.icon}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
