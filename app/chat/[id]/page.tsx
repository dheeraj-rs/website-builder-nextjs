'use client';

import { Header } from '~/components/header/Header';
import { Chat } from '~/components/chat/Chat';

export default function ChatPage({ params }: { params: { id: string } }) {
    return (
        <div className="flex flex-col h-full w-full">
            <Header />
            <Chat />
        </div>
    );
}
