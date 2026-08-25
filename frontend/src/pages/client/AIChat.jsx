import AIAssistant from '../../components/common/AIAssistant';

const ClientAIChat = () => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Assistant</h2>
        <p className="text-gray-600 mb-8">Click the AI button in the bottom-right corner to start chatting with your AI assistant.</p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4">What can I help you with?</h3>
          <ul className="text-left space-y-2 text-gray-600">
            <li>• Social media content ideas</li>
            <li>• Marketing strategies</li>
            <li>• SEO recommendations</li>
            <li>• Business growth tips</li>
            <li>• Creative campaign concepts</li>
          </ul>
        </div>
      </div>
      <AIAssistant />
    </div>
  );
};

export default ClientAIChat;
