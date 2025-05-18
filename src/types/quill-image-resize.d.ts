declare module 'quill-image-resize' {
  import Quill from 'quill';
  
  interface ImageResizeOptions {
    modules?: string[];
    parchment?: unknown;
    styles?: {
      handle?: {
        backgroundColor?: string;
        border?: string;
        color?: string;
      };
      overlay?: {
        border?: string;
      };
    };
  }

  export default class ImageResize {
    constructor(quill: Quill, options: ImageResizeOptions);
  }
} 