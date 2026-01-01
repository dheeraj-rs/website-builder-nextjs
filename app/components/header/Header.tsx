'use client';

import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { description } from '~/lib/persistence/useChatHistory';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';

export function Header() {
  const chat = useStore(chatStore);
  const chatDescription = useStore(description);

  return (
    <header
      className={classNames(
        'flex items-center bg-builder-background-primary p-5 border-b h-[var(--header-height)]',
        {
          'border-transparent': !chat.showChat,
          'border-builder-border-secondary': chat.showChat,
        },
      )}
    >
      <div className="flex items-center gap-2">
        <div className="i-ph:sidebar-simple-duotone text-xl text-builder-text-tertiary" />
      </div>

      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-builder-elements-textPrimary">
            {chatDescription}
          </span>
          <HeaderActionButtons />
        </>
      )}
    </header>
  );
}
