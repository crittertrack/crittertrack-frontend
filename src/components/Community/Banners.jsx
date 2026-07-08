import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Loader2 } from 'lucide-react';

export const BroadcastPoll = ({ broadcast, isEmbedded, authToken, API_BASE_URL, hideTitle = false }) => {
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [pollResults, setPollResults] = useState(broadcast.pollOptions || []);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if the user has already voted (userVote is an array of indices)
        if (broadcast.userVote && broadcast.userVote.length > 0) {
            setHasVoted(true);
            setSelectedOptions(broadcast.userVote);
        }
        setPollResults(broadcast.pollOptions || []);
    }, [broadcast]);

    const handleOptionClick = (index) => {
        if (hasVoted) return;

        if (broadcast.allowMultipleChoices) {
            setSelectedOptions(prev => 
                prev.includes(index) 
                    ? prev.filter(i => i !== index) 
                    : [...prev, index]
            );
        } else {
            setSelectedOptions([index]);
        }
    };

    const handleVote = async () => {
        if (selectedOptions.length === 0) {
            setError('Please select an option.');
            return;
        }
        setSubmitting(true);
        setError('');
        try {
            const response = await axios.post(`${API_BASE_URL}/moderation/poll/vote`, {
                notificationId: broadcast._id,
                selectedOptions
            }, {
                headers: { Authorization: `Bearer ${authToken}` }
            });
            setHasVoted(true);
            setPollResults(response.data.pollResults);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit vote.');
        } finally {
            setSubmitting(false);
        }
    };

    const totalVotes = pollResults.reduce((sum, opt) => sum + (opt.votes || 0), 0);
    const pollHasEnded = broadcast.pollEndsAt && new Date() > new Date(broadcast.pollEndsAt);

    return (
        <div className={`border rounded-lg p-4 ${isEmbedded ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
            {!hideTitle && <h4 className="font-bold text-gray-800 mb-2">{broadcast.pollQuestion || broadcast.title}</h4>}
            {broadcast.content && <p className="text-sm text-gray-600 my-2">{broadcast.content}</p>}
            <div className="mt-2 space-y-2">
                {pollResults.map((option, index) => {
                    const isSelected = selectedOptions.includes(index);
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                    return (
                        <div key={index} className="relative">
                            {hasVoted && (
                                <div 
                                    className="absolute top-0 left-0 h-full bg-cyan-100/50 rounded-md"
                                    style={{ width: `${percentage}%` }}
                                />
                            )}
                            <button
                                onClick={() => handleOptionClick(index)}
                                disabled={hasVoted || pollHasEnded}
                                className={`relative w-full text-left p-2 border rounded-md text-sm transition-colors ${
                                    isSelected ? 'bg-cyan-100 border-cyan-400 font-semibold' : 'bg-gray-50 hover:bg-gray-100'
                                } ${hasVoted || pollHasEnded ? 'cursor-default' : 'cursor-pointer'}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span>{option.text}</span>
                                    {hasVoted && <span className="text-xs font-bold text-gray-600">{percentage}% ({option.votes})</span>}
                                </div>
                            </button>
                        </div>
                    );
                })}
            </div>
            {!hasVoted && !pollHasEnded && (
                <button onClick={handleVote} disabled={submitting || selectedOptions.length === 0} className="mt-3 w-full bg-cyan-600 text-white font-semibold py-2 rounded-lg hover:bg-cyan-700 transition disabled:bg-gray-300">
                    {submitting ? <Loader2 className="animate-spin inline-block" /> : 'Vote'}
                </button>
            )}
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
        </div>
    );
};