import * as React from "react"
import { Editor } from "@tiptap/react"
import { Button } from "@/components/tiptap-ui-primitive/button"

type NodeType = "blockquote" | "codeBlock"

interface NodeButtonProps {
  editor?: Editor | null
  type: NodeType
  text?: string
}

const nodeConfigs = {
  blockquote: {
    icon: "format_quote",
    label: "Blockquote",
    shortcutKey: "⌘⇧B",
    command: (editor: Editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  codeBlock: {
    icon: "code",
    label: "Code Block",
    shortcutKey: "⌘⌥C",
    command: (editor: Editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
} as const

export const NodeButton = React.forwardRef<HTMLButtonElement, NodeButtonProps>(
  ({ editor, type, text }, ref) => {
    if (!editor) return null

    const config = nodeConfigs[type]
    const isActive = editor.isActive(type)

    const handleClick = () => {
      config.command(editor)
    }

    return (
      <Button
        ref={ref}
        onClick={handleClick}
        data-active-state={isActive ? "on" : "off"}
        tooltip={config.label}
        shortcutKeys={config.shortcutKey}
      >
        <span className="material-icons tiptap-button-icon">{config.icon}</span>
        {text && <span className="tiptap-button-text">{text}</span>}
      </Button>
    )
  }
)

NodeButton.displayName = "NodeButton" 