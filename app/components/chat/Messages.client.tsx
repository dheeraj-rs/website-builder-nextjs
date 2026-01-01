import type { Message } from 'ai';
import { Icon } from '@iconify/react';
import React from 'react';
import { classNames } from '~/utils/classNames';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessagesProps {
  id?: string;
  className?: string;
  isStreaming?: boolean;
  messages?: Message[];
}

export const Messages = React.forwardRef<HTMLDivElement, MessagesProps>((props: MessagesProps, ref) => {
  const { id, isStreaming = false, messages = [] } = props;

  return (
    <div id={id} ref={ref} className={props.className}>
      {messages.length > 0
        ? messages.map((message, index) => {
          const { role, content } = message as any;
          const isUserMessage = role === 'user';
          const isFirst = index === 0;
          const isLast = index === messages.length - 1;

          return (
            <div
              key={index}
              className={classNames('flex gap-4 p-6 w-full rounded-[calc(0.75rem-1px)]', {
                'bg-gray-50 dark:bg-zinc-800': isUserMessage || !isStreaming || (isStreaming && !isLast),
                'bg-gradient-to-b from-gray-50 dark:from-zinc-800 from-30% to-transparent':
                  isStreaming && isLast,
                'mt-4': !isFirst,
              })}
            >
              {isUserMessage && (
                <div className="flex items-center justify-center w-[34px] h-[34px] overflow-hidden bg-white text-gray-600 rounded-full shrink-0 self-start">
                  <Icon icon="ph:user-fill" className="text-xl" />
                </div>
              )}
              <div className="grid grid-col-1 w-full">
                {isUserMessage ? <UserMessage content={content} /> : <AssistantMessage content={content} />}
              </div>
            </div>
          );
        })
        : null}
      {isStreaming && (
        <div className="text-center w-full text-gray-500 dark:text-gray-400 mt-4">
          <Icon icon="svg-spinners:3-dots-fade" className="text-4xl inline-block" />
        </div>
      )}
    </div>
  );
});
