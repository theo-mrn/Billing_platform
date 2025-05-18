declare module '@uiw/react-md-editor' {
  import { ReactElement } from 'react';

  export interface MDEditorProps {
    value?: string;
    onChange?: (value?: string) => void;
    preview?: 'live' | 'edit' | 'preview';
    hideToolbar?: boolean;
    enableScroll?: boolean;
    height?: string | number;
    textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
    previewOptions?: {
      urlTransform?: (url: string) => string;
    };
  }

  const MDEditor: (props: MDEditorProps) => ReactElement;
  export default MDEditor;
} 