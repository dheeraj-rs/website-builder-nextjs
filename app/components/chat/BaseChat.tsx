import type { Message } from 'ai';
import { Icon } from '@iconify/react';
import { useStore } from '@nanostores/react';
import React, { type RefCallback } from 'react';
import { ClientOnly } from '~/components/ClientOnly';
import { Menu } from '~/components/sidebar/Menu.client';
import { IconButton } from '~/components/ui/IconButton';
import { Workbench } from '~/components/workbench/Workbench.client';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';
import { Messages } from './Messages.client';
import { ModelSelector, type ModelProvider } from './ModelSelector';
import { SendButton } from './SendButton.client';

interface BaseChatProps {
  textareaRef?: React.RefObject<HTMLTextAreaElement> | undefined;
  messageRef?: RefCallback<HTMLDivElement> | undefined;
  scrollRef?: RefCallback<HTMLDivElement> | undefined;
  showChat?: boolean;
  chatStarted?: boolean;
  isStreaming?: boolean;
  messages?: Message[];
  enhancingPrompt?: boolean;
  promptEnhanced?: boolean;
  input?: string;
  handleStop?: () => void;
  sendMessage?: (event: React.UIEvent, messageInput?: string) => void;
  handleInputChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  enhancePrompt?: () => void;
  selectedProvider?: ModelProvider;
  onProviderChange?: (provider: ModelProvider) => void;
}

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'How do I center a div?' },
];

const TEXTAREA_MIN_HEIGHT = 76;

export const BaseChat = React.forwardRef<HTMLDivElement, BaseChatProps>(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      selectedProvider = 'anthropic',
      onProviderChange,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const showWorkbench = useStore(workbenchStore.showWorkbench);

    return (
      <div
        ref={ref}
        className={classNames(
          'relative flex h-full w-full overflow-hidden bg-white dark:bg-zinc-950',
        )}
        data-chat-visible={showChat}
      >
        <ClientOnly>{() => <Menu />}</ClientOnly>
        <div ref={scrollRef} className="flex flex-col w-full h-full pt-10 pb-6">
          <div
            className={classNames(
              'flex flex-col flex-1 overflow-y-auto min-w-[var(--chat-min-width)] pb-40',
              'transition-[margin] duration-200 bolt-ease-cubic-bezier',
              {
                'mr-[var(--workbench-width)]': showWorkbench && showChat,
                '-translate-x-1/2 opacity-0': !showChat,
              },
            )}
          >
            {!chatStarted && (
              <div id="intro" className="mt-[26vh] max-w-chat mx-auto">
                <h1 className="text-5xl text-center font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Where ideas begin
                </h1>
                <p className="mb-4 text-center text-gray-500 dark:text-gray-400">
                  Bring ideas to life in seconds or get help on existing projects.
                </p>
              </div>
            )}
            <div
              className={classNames('pt-6 px-6', {
                'h-full flex flex-col': chatStarted,
              })}
            >
              <ClientOnly>
                {() => {
                  return chatStarted ? (
                    <Messages
                      ref={messageRef}
                      className="flex flex-col w-full flex-1 max-w-chat px-4 pb-6 mx-auto z-1"
                      messages={messages}
                      isStreaming={isStreaming}
                    />
                  ) : null;
                }}
              </ClientOnly>
              <div className="bg-white dark:bg-zinc-900 pb-6">{/* Ghost Element */}</div>
            </div>
            {!chatStarted && (
              <div id="examples" className="relative w-full max-w-xl mx-auto mt-8 flex justify-center">
                <div className="flex flex-col space-y-2 [mask-image:linear-gradient(to_bottom,black_0%,transparent_180%)] hover:[mask-image:none]">
                  {EXAMPLE_PROMPTS.map((examplePrompt, index) => {
                    return (
                      <button
                        key={index}
                        onClick={(event) => {
                          sendMessage?.(event, examplePrompt.text);
                        }}
                        className="group flex items-center w-full gap-2 justify-center bg-transparent text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                      >
                        {examplePrompt.text}
                        <Icon icon="ph:arrow-bend-down-left" />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div
            className={classNames(
              'fixed bottom-0 left-0 z-20 px-6 pb-6 transition-[right] duration-200 bolt-ease-cubic-bezier',
              {
                'w-full': !showWorkbench || !showChat,
                'right-[var(--workbench-width)]': showWorkbench && showChat,
                'right-0': !showWorkbench || !showChat,
              },
            )}
          >
            <div className="max-w-chat mx-auto relative w-full">
              <div
                className={classNames(
                  'shadow-sm border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-zinc-900/80 backdrop-filter backdrop-blur-sm rounded-lg overflow-hidden',
                )}
              >
                <textarea
                  ref={textareaRef}
                  className={`w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-md text-gray-900 dark:text-gray-100 placeholder-gray-500 bg-transparent`}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      if (event.shiftKey) {
                        return;
                      }

                      event.preventDefault();

                      sendMessage?.(event);
                    }
                  }}
                  value={input}
                  onChange={(event) => {
                    handleInputChange?.(event);
                  }}
                  style={{
                    minHeight: TEXTAREA_MIN_HEIGHT,
                    maxHeight: TEXTAREA_MAX_HEIGHT,
                  }}
                  placeholder="How can D Admin help you today?"
                  translate="no"
                />
                <ClientOnly>
                  {() => (
                    <SendButton
                      show={true}
                      isStreaming={isStreaming}
                      onClick={(event) => {
                        if (isStreaming) {
                          handleStop?.();
                          return;
                        }

                        sendMessage?.(event);
                      }}
                    />
                  )}
                </ClientOnly>
                <div className="flex justify-between text-sm p-4 pt-2">
                  <div className="flex gap-1 items-center">
                    <IconButton
                      title="Enhance prompt"
                      disabled={input.length === 0 || enhancingPrompt}
                      className={classNames({
                        'opacity-100!': enhancingPrompt,
                        'text-blue-500! pr-1.5 enabled:hover:bg-blue-500/10!':
                          promptEnhanced,
                      })}
                      onClick={() => enhancePrompt?.()}
                    >
                      {enhancingPrompt ? (
                        <>
                          <Icon icon="svg-spinners:90-ring-with-bg" className="text-blue-500 text-xl" />
                          <div className="ml-1.5">Enhancing prompt...</div>
                        </>
                      ) : (
                        <>
                          <Icon icon="ph:sparkle" className="text-xl" />
                          {promptEnhanced && <div className="ml-1.5">Prompt enhanced</div>}
                        </>
                      )}
                    </IconButton>
                  </div>
                  {onProviderChange && (
                    <ClientOnly>
                      {() => (
                        <ModelSelector value={selectedProvider} onChange={onProviderChange} />
                      )}
                    </ClientOnly>
                  )}
                  {input.length > 3 ? (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      Use <kbd className="font-sans border border-gray-300 dark:border-gray-700 px-1 rounded-sm">Shift</kbd> + <kbd className="font-sans border border-gray-300 dark:border-gray-700 px-1 rounded-sm">Return</kbd> for a new line
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <ClientOnly>{() => <Workbench chatStarted={chatStarted} isStreaming={isStreaming} />}</ClientOnly>
        </div>
      </div>
    );
  },
);
