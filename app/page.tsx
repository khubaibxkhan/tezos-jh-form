'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxdRsPdU2DajcJoRordXXLNDzsk3bpk-n6A9DIgU0cR1CeVqM4_RF73dulq1eOLawXY/exec";

  const questions = [
    {
      id: 'fullName',
      question: 'Full Name',
      prompt: 'Type your answer...',
      type: 'text'
    },
    {
      id: 'mobileNumber',
      question: 'Mobile Number',
      prompt: 'Type your answer...',
      type: 'tel'
    },
    {
      id: 'course',
      question: 'Course or Program',
      prompt: 'Type your answer...',
      type: 'text'
    },
    {
      id: 'enrollmentNumber',
      question: 'Enrollment or Application Number',
      prompt: 'Type your answer...',
      type: 'text'
    },
    {
      id: 'yearSemester',
      question: 'Year & Semester',
      prompt: 'e.g., 2nd Year, 4th Semester',
      type: 'text'
    },
    {
      id: 'teams',
      question: 'Select the Team(s) you are most interested in joining*',
      prompt: 'Select teams (comma separated numbers): 1-Content, 2-Graphics, 3-Tech, 4-Media, 5-Social Media, 6-PR, 7-Event Management',
      type: 'teams',
      options: [
        'Content Team',
        'Graphics Team', 
        'Tech Team',
        'Media Team',
        'Social Media Team',
        'PR (Public Relations) Team',
        'Event Management Team'
      ]
    },
    {
      id: 'portfolio',
      question: 'Portfolio (Mandatory for Graphics / Media applicants)',
      prompt: 'enter null if you dont have',
      type: 'text'
    }
  ];

  useEffect(() => {
    if (inputRef.current && !showComplete) {
      inputRef.current.focus();
    }
  }, [currentStep, showComplete]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [currentStep, responses]);

  const handleSubmit = async (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    
    if (currentInput.trim() === '') return;

    const currentQuestion = questions[currentStep];
    let processedInput = currentInput.trim();

    // Process teams input
    if (currentQuestion.type === 'teams') {
      const teamNumbers = processedInput.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 7);
      const selectedTeams = teamNumbers.map(n => currentQuestion.options![n - 1]).filter(Boolean);
      processedInput = selectedTeams.join(', ');
      
      if (selectedTeams.length === 0) {
        alert('Please select at least one valid team (1-7)');
        return;
      }
    }

    setResponses(prev => ({
      ...prev,
      [currentQuestion.id]: processedInput
    }));

    setCurrentInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      if (currentStep < questions.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        submitToGoogleSheets({
          ...responses,
          [currentQuestion.id]: processedInput
        });
      }
    }, 500);
  };

  const submitToGoogleSheets = async (formData: any) => {
    setIsSubmitting(true);
    
    try {
      // Create URL-encoded data to match the Apps Script expectations
      const submitData = new URLSearchParams();
      submitData.append('timestamp', new Date().toISOString());
      submitData.append('fullName', formData.fullName || '');
      submitData.append('mobileNumber', formData.mobileNumber || '');
      submitData.append('course', formData.course || '');
      submitData.append('enrollmentNumber', formData.enrollmentNumber || '');
      submitData.append('yearSemester', formData.yearSemester || '');
      submitData.append('teams', formData.teams || '');
      submitData.append('portfolio', formData.portfolio || '');

      console.log('Submitting data:', Object.fromEntries(submitData)); // Debug log

      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: submitData.toString()
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const result = await response.json();
      console.log('Response data:', result); // Debug log
      
      if (result.result === 'success') {
        setShowComplete(true);
      } else {
        console.error('Submit error:', result);
        alert('Error submitting form: ' + JSON.stringify(result.error || result || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Network/Parse error:', error);
      alert('Network error: ' + error.message + '\n\nCheck console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setResponses({});
    setCurrentInput('');
    setShowComplete(false);
    setIsSubmitting(false);
  };

  const getProgressDots = () => {
    return Array.from({ length: questions.length }, (_, i) => 
      i <= currentStep ? '●' : '○'
    ).join(' ');
  };

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gray-900 text-green-400 p-4 font-mono">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 flex items-center space-x-2">
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <span className="text-gray-400 text-sm">Tezos-JH-recruitment.sh</span>
            </div>
            
            <div className="p-6 min-h-[600px] flex flex-col items-center justify-center text-center">
              <div className="text-6xl mb-8">🎉</div>
              <div className="text-2xl text-green-400 mb-4">Application Submitted Successfully!</div>
              <div className="text-gray-400 mb-8 max-w-md">
                Welcome to the Tezos Club JH family! Your application has been recorded and our team will review it shortly.
              </div>
              <div className="space-y-4">
                <div className="text-blue-400">
                  💡 Take this as your first step towards innovation, collaboration, and personal growth. 
                  We can't wait to see what you'll bring to the table!
                </div>
                <button 
                  onClick={resetForm}
                  className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white transition-colors"
                >
                  Submit Another Application
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-4 font-mono">
      <div className="max-w-4xl mx-auto">
        <div className="bg-black border border-green-500/30 rounded-none min-h-[80vh] p-6 text-sm overflow-y-auto shadow-2xl shadow-green-500/20">
          {/* Terminal Header */}
          <div className="mb-6 pb-4 border-b border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-green-400/70">Tezos-JH-recruitment.sh</span>
            </div>
          </div>

          
          {/* Terminal Content */}
          <div ref={terminalRef} className="p-6 min-h-[600px] overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="text-green-400 mb-2">Tezos Club JH Recruitment Terminal v1.0.0</div>
              <div className="text-green-400 mb-4">Welcome to the Tezos Club JH application process!</div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="text-green-600 text-sm">
                Progress: <span className="text-blue-400">{getProgressDots()}</span> {currentStep + 1}/7
              </div>
            </div>

            {/* Previous Questions & Answers */}
            {questions.slice(0, currentStep).map((q, index) => (
              <div key={q.id} className="mb-4">
                <div className="text-blue-300 mb-1">$ {q.question}</div>
                <div className="text-white pl-2">
                  {q.type === 'teams' ? (
                    <div className="text-gray-300">
                      Selected: {responses[q.id as keyof typeof responses]}
                    </div>
                  ) : (
                    `> ${responses[q.id as keyof typeof responses]}`
                  )}
                </div>
              </div>
            ))}

            {/* Current Question */}
            {currentStep < questions.length && (
              <div className="mb-4">
                <div className="text-blue-400 mb-1">$ {questions[currentStep].question}</div>
                
                {questions[currentStep].type === 'teams' && (
                  <div className="text-gray-400 text-sm mb-2 pl-2">
                    //Content Team //Graphics Team //Tech Team //Media Team //Social Media Team //PR Team //Event Management Team
                  </div>
                )}
                
                {questions[currentStep].id === 'portfolio' && (
                  <div className="text-gray-400 text-sm mb-2 pl-2">
                    (enter null if you don't have)
                  </div>
                )}
                
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">~</span>
                  <input
                    ref={inputRef}
                    type={questions[currentStep].type === 'teams' ? 'text' : questions[currentStep].type}
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyPress={handleSubmit}
                    placeholder={questions[currentStep].prompt}
                    className="bg-transparent border-none outline-none text-white flex-1 placeholder-gray-500"
                    disabled={isTyping || isSubmitting}
                  />
                  <span className="text-blue-400 animate-pulse ml-1">|</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {(isTyping || isSubmitting) && (
              <div className="text-yellow-400 animate-pulse">
                {isSubmitting ? 'Submitting to database...' : 'Processing...'}
              </div>
            )}


            {/* Instructions */}
            <div className="relative bottom-0.5 left-1/2 transform -translate-x-1/2">
              <div className="bg-gray-800 px-4 py-2 rounded border border-gray-600 text-center">
                <div className="text-blue-400 text-sm">
                  Press Enter to submit your answer • Type your responses in the terminal above
                </div>
                <div className="text-blue-400 text-xs mt-1">
                  Question {currentStep + 1} of {questions.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}