'use client';

import { Header } from '~/components/header/Header';
import { Chat } from '~/components/chat/Chat';

export default function HomePage() {
  return (
    <div className="flex flex-col h-screen w-full pt-[var(--header-height)]">
      <Header />
      <Chat />
    </div>
  );
}
