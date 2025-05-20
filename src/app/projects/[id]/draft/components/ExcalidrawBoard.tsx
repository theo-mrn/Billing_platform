"use client";
import React, { useCallback } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";

interface ExcalidrawBoardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

// Chargement dynamique pour éviter le SSR
const ExcalidrawWrapper = dynamic(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async () => {
    const mod = await import("@excalidraw/excalidraw");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return function Wrapper({ onChange, initialData, ...props }: any) {
      return (
        <mod.Excalidraw
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={false}
          theme="light"
          UIOptions={{
            canvasActions: {
              loadScene: false,
              saveToActiveFile: false,
              export: false,
              saveAsImage: true,
            },
          }}
          onChange={onChange}
          initialData={initialData}
          {...props}
        />
      );
    };
  },
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Chargement de l&apos;éditeur...</p>
        </div>
      </div>
    )
  }
);

const ExcalidrawBoard = React.memo<ExcalidrawBoardProps>(({ initialData, onChange }) => {
  const onChangeHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (elements: any, appState: any, files: any) => {
      onChange({
        elements,
        appState,
        files,
      });
    },
    [onChange]
  );

  return (
    <div style={{ 
      height: "80vh",
      width: "100%",
      position: "relative",
      borderRadius: 12,
      overflow: "hidden",
      boxShadow: "0 2px 16px rgba(0,0,0,0.08)"
    }}>
      <ExcalidrawWrapper
        onChange={onChangeHandler}
        initialData={initialData}
      />
    </div>
  );
});

ExcalidrawBoard.displayName = 'ExcalidrawBoard';

export default ExcalidrawBoard; 