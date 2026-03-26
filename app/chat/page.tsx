import ChatComponent from './ChatComponent';

export default function ChatPage() {
  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 text-center">
        <h1 className="text-2xl font-bold">AI Chat with Ollama</h1>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        <ChatComponent />
      </main>
    </div>
  );
}
