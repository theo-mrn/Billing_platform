import { mergeAttributes, Node, wrappingInputRule } from '@tiptap/core'

export interface BlockquoteOptions {
  HTMLAttributes: Record<string, string | number | boolean>,
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    blockquote: {
      setBlockquote: () => ReturnType,
      toggleBlockquote: () => ReturnType,
      unsetBlockquote: () => ReturnType,
    }
  }
}

export const inputRegex = /^\s*>\s$/

export const Blockquote = Node.create<BlockquoteOptions>({
  name: 'blockquote',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',
  group: 'block',
  defining: true,

  parseHTML() {
    return [
      { tag: 'blockquote' },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['blockquote', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setBlockquote: () => ({ commands }) => {
        return commands.wrapIn(this.name)
      },
      toggleBlockquote: () => ({ commands }) => {
        return commands.toggleWrap(this.name)
      },
      unsetBlockquote: () => ({ commands }) => {
        return commands.lift(this.name)
      },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-b': () => this.editor.commands.toggleBlockquote(),
    }
  },

  addInputRules() {
    return [
      wrappingInputRule({
        find: inputRegex,
        type: this.type,
      }),
    ]
  },
}) 