'use client';

import { useStore } from '@nanostores/react';
import { Icon } from '@iconify/react';
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
        'fixed top-0 left-0 right-0 w-full z-30 flex items-center bg-white dark:bg-zinc-900 key-border-b h-[var(--header-height)] p-5 border-b',
        {
          'border-transparent': !chat.showChat,
          'border-gray-200 dark:border-gray-800': chat.showChat,
        },
      )}
    >
      <div className="flex items-center gap-2">
        <Icon icon="ph:sidebar-simple-duotone" className="text-xl text-gray-500" />
      </div>

      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-gray-900 dark:text-gray-100">
            {chatDescription}
          </span>
          <HeaderActionButtons />
        </>
      )}
    </header>
  );
}
