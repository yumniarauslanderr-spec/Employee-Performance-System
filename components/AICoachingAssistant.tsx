
import React, { useState, useEffect, useRef } from 'react';
import { UserAccount, AICoachingSummary, ChatMessage } from '../types';
import { generateInitialCoachingSummary, getAICoachingResponse } from '../services/mockApi';
import Card from './common/Card';
import Spinner from './common/Spinner';

const AICoachingAssistant: React.FC<{ user: UserAccount }> = ({ user }) => {
    const [summary, setSummary] = useState<AICoachingSummary | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loadingChat, setLoadingChat] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchInitialSummary = async () => {
            try {
                const summaryData = await generateInitialCoachingSummary(user.employeeId);
                setSummary(summaryData);
                setChatHistory([
                    { sender: 'ai', text: `Hello! I'm your AI Coach. I've analyzed your performance for the last 6 months. Here's a summary. Feel free to ask me anything about your KPIs, skills, or career growth.` }
                ]);
            } catch (err) {
                setError(err instanceof Error ? err.message : "An unknown error occurred.");
            } finally {
                setLoadingSummary(false);
            }
        };
        fetchInitialSummary();
    }, [user.employeeId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const messageText = userInput.trim();
        if (!messageText || loadingChat) return;

        const newHistory: ChatMessage[] = [...chatHistory, { sender: 'user', text: messageText }];
        setChatHistory(newHistory);
        setUserInput('');
        setLoadingChat(true);

        try {
            const aiResponse = await getAICoachingResponse(user.employeeId, newHistory, messageText);
            setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse }]);
        } catch (err) {
            setChatHistory(prev => [...prev, { sender: 'ai', text: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoadingChat(false);
        }
    };
    
    const handleActionItemToggle = (index: number) => {
        if (!summary || !summary.actionPlan) return;
        const newActionPlan = [...summary.actionPlan];
        newActionPlan[index].completed = !newActionPlan[index].completed;
        setSummary({ ...summary, actionPlan: newActionPlan });
    };

    if (loadingSummary) {
        return (
            <div className="text-center p-8">
                <Spinner />
                <p className="mt-4 text-gray-600">Your AI Coach is analyzing your performance data...<br/>This may take a moment.</p>
            </div>
        );
    }

    if (error) {
        return <Card title="Error"><p className="text-red-600">{error}</p></Card>;
    }
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-10rem)]">
            {/* Left Column: Coaching Summary */}
            <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
                <Card title="Strengths">
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {(summary?.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                </Card>
                <Card title="Areas for Improvement">
                     <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                        {(summary?.areasForImprovement || []).map((a, i) => <li key={i}>{a}</li>)}
                    </ul>
                </Card>
                 <Card title="Your Action Plan">
                    <div className="space-y-3">
                        {(summary?.actionPlan || []).map((item, index) => (
                             <div key={index} className="flex items-start">
                                <input
                                    type="checkbox"
                                    id={`action-${index}`}
                                    checked={item.completed}
                                    onChange={() => handleActionItemToggle(index)}
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 mt-1 cursor-pointer"
                                />
                                <label htmlFor={`action-${index}`} className="ml-3 text-sm text-gray-700 cursor-pointer">
                                    <span className={item.completed ? 'line-through text-gray-500' : ''}>{item.text}</span>
                                    <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${item.timescale === 'Weekly' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {item.timescale}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Recommendations">
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">Skills to Develop:</h4>
                    <p className="text-sm text-gray-600 mb-3">{(summary?.recommendedSkills || []).join(', ')}</p>
                    <h4 className="font-semibold text-gray-700 text-sm mb-1">Suggested Training:</h4>
                    <p className="text-sm text-gray-600">{(summary?.recommendedTraining || []).join(', ')}</p>
                </Card>
            </div>

            {/* Right Column: Chat Interface */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200/80 flex flex-col h-full">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Chat with your AI Coach</h3>
                </div>
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {loadingChat && (
                         <div className="flex justify-start">
                            <div className="max-w-md p-3 rounded-lg bg-gray-100 text-gray-800">
                                <div className="flex items-center">
                                    <span className="h-2 w-2 bg-teal-500 rounded-full animate-pulse mr-2"></span>
                                    <span className="h-2 w-2 bg-teal-500 rounded-full animate-pulse delay-75 mr-2"></span>
                                    <span className="h-2 w-2 bg-teal-500 rounded-full animate-pulse delay-150"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Ask a question..."
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            disabled={loadingChat}
                        />
                        <button type="submit" disabled={!userInput.trim() || loadingChat} className="bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400">
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AICoachingAssistant;
