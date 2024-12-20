// app/page.tsx
'use client';

import World from './components/world';

export default function Home() {
  return (
    <main 
      className="flex items-center justify-center h-screen bg-black overflow-hidden"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <World />
    </main>
  );
}