import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { TagChip } from "./TodoItem"

interface AddTagDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existing: string[]
  onAdd: (tags: string[]) => void
}

export function AddTagDialog({
  open,
  onOpenChange,
  existing,
  onAdd,
}: AddTagDialogProps) {
  const [value, setValue] = React.useState("")

  const submit = () => {
    const next = value
      .split(/[,\s]+/)
      .map((t) => t.replace(/^#/, "").trim())
      .filter(Boolean)
    if (next.length) {
      const merged = Array.from(new Set([...existing, ...next]))
      onAdd(merged)
    }
    setValue("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add tag</DialogTitle>
        </DialogHeader>
        {existing.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {existing.map((t) => (
              <TagChip key={t} tag={t} />
            ))}
          </div>
        )}
        <Input
          autoFocus
          value={value}
          placeholder="design, urgent…"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              submit()
            }
          }}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
