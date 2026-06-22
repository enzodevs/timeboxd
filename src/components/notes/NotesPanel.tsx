import * as React from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import type { JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import {
  MagnifyingGlassIcon,
  NotePencilIcon,
  PushPinIcon,
} from "@phosphor-icons/react"

import type { JsonValue } from "@/db/schema"
import { useNote, useSaveNote } from "@/hooks/use-notes"
import { EditorToolbar } from "./EditorToolbar"
import { NotesSlashMenu } from "./SlashMenu"

export function NotesPanel({
  date,
  readOnly,
}: {
  date: string
  readOnly?: boolean
}) {
  const { data: note, isFetching } = useNote(date)
  const save = useSaveNote(date)

  const applying = React.useRef(false)
  const loadedFor = React.useRef<string | null>(null)
  const saveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  // Set by NotesSlashMenu; lets the "/" menu intercept nav keys first.
  const slashKey = React.useRef<(e: KeyboardEvent) => boolean>(() => false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Braindump here..." }),
    ],
    editable: !readOnly,
    editorProps: {
      attributes: { class: "tiptap min-h-[calc(100%-1rem)] px-4 py-3" },
      handleKeyDown: (_view, event) => slashKey.current(event),
    },
    onUpdate: ({ editor: ed }) => {
      if (readOnly) return
      if (applying.current) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => {
        save.mutate({
          content: ed.getJSON() as JsonValue,
          text: ed.getText(),
        })
      }, 600)
    },
  })

  // Load the note for the active day (without triggering a save).
  React.useEffect(() => {
    loadedFor.current = null
  }, [date])

  React.useEffect(() => {
    if (!editor || isFetching) return
    if (loadedFor.current === date) return
    loadedFor.current = date
    applying.current = true
    editor.commands.setContent((note?.content as JSONContent | undefined) ?? "")
    applying.current = false
  }, [editor, date, isFetching, note])

  React.useEffect(() => {
    editor?.setEditable(!readOnly)
  }, [editor, readOnly])

  // Flush a pending save when switching days or unmounting.
  React.useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [date])

  return (
    <section className="flex h-full flex-col bg-background">
      <header className="flex items-center justify-between px-4 pt-3.5 pb-2">
        <div className="flex items-center gap-2">
          <NotePencilIcon className="size-5 text-primary" weight="duotone" />
          <h2 className="text-[15px] font-semibold">Notes</h2>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <button
            type="button"
            title="Pin notes"
            className="flex size-7 items-center justify-center rounded-md hover:bg-muted hover:text-foreground"
          >
            <PushPinIcon className="size-4" />
          </button>
          <button
            type="button"
            title="Search notes"
            className="flex size-7 items-center justify-center rounded-md hover:bg-muted hover:text-foreground"
          >
            <MagnifyingGlassIcon className="size-4" />
          </button>
        </div>
      </header>
      {editor && !readOnly ? <EditorToolbar editor={editor} /> : null}
      <div
        className="min-h-0 flex-1 cursor-text overflow-y-auto"
        onClick={() => {
          if (!readOnly) editor?.chain().focus().run()
        }}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
      {editor && !readOnly ? (
        <NotesSlashMenu editor={editor} keyRef={slashKey} />
      ) : null}
    </section>
  )
}
