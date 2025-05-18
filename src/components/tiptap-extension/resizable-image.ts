import { mergeAttributes, Node } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export interface ResizableImageOptions {
  HTMLAttributes: Record<string, string | number | boolean>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resizableImage: {
      setImage: (options: { src: string; alt?: string; title?: string; width?: string }) => ReturnType;
    };
  }
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'resizableImage',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  inline: true,

  group: 'inline',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
        renderHTML: attributes => ({
          width: attributes.width,
          style: `width: ${attributes.width}`,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: dom => {
          if (!(dom instanceof HTMLElement)) return false;

          return {
            src: dom.getAttribute('src'),
            alt: dom.getAttribute('alt'),
            title: dom.getAttribute('title'),
            width: dom.style.width || dom.getAttribute('width') || '100%',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { width, ...rest } = HTMLAttributes;
    return [
      'div',
      { 
        'data-type': 'resizable-image',
        class: 'image-resizer',
        style: `width: ${width || '100%'}`,
      },
      [
        'img',
        mergeAttributes(
          this.options.HTMLAttributes,
          rest,
          { style: `width: 100%` }
        ),
      ],
      ['div', { class: 'resize-trigger' }],
    ];
  },

  addCommands() {
    return {
      setImage:
        options =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addProseMirrorPlugins() {
    let dragStartWidth = 0;
    let dragging = false;

    return [
      new Plugin({
        key: new PluginKey('handleResizableImage'),
        props: {
          handleDOMEvents: {
            mousedown: (view, event) => {
              const target = event.target as HTMLElement;
              if (!target.classList.contains('resize-trigger')) {
                return false;
              }

              dragging = true;
              event.preventDefault();

              const container = target.closest('[data-type="resizable-image"]') as HTMLElement;
              if (!container) return false;

              dragStartWidth = container.offsetWidth;
              const startX = event.pageX;

              const onMouseMove = (e: MouseEvent) => {
                if (!dragging) return;

                const currentX = e.pageX;
                const diff = currentX - startX;
                const newWidth = dragStartWidth + diff;

                // Limiter la taille minimale et maximale
                const minWidth = 100;
                const maxWidth = view.dom.offsetWidth;
                const clampedWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

                container.style.width = `${clampedWidth}px`;
              };

              const onMouseUp = () => {
                if (!dragging) return;
                dragging = false;

                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseup', onMouseUp);

                // Trouver le nœud dans le document
                const pos = view.posAtDOM(container, 0);
                if (pos === null) return;

                // Mettre à jour l'attribut width dans le modèle
                const width = container.style.width;
                const tr = view.state.tr.setNodeAttribute(pos, 'width', width);
                view.dispatch(tr);
              };

              window.addEventListener('mousemove', onMouseMove);
              window.addEventListener('mouseup', onMouseUp);

              return true;
            },
          },
        },
      }),
    ];
  },
}); 