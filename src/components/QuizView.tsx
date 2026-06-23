/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, RotateCcw, Award, Lightbulb, HelpCircle } from 'lucide-react';

interface QuizViewProps {
  quiz: QuizQuestion[];
  onComplete?: (score: number, maxScore: number) => void;
}

export default function QuizView(props: QuizViewProps) {
  const { quiz } = props;
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Score count
  const score = quiz.reduce((acc, q, index) => {
    return acc + (selectedAnswers[index] === q.answerIndex ? 1 : 0);
  }, 0);

  useEffect(() => {
    if (quizFinished) {
      props.onComplete?.(score, quiz.length);
    }
  }, [quizFinished, score, quiz.length]);

  if (!quiz || quiz.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <HelpCircle className="w-12 h-12 mx-auto text-slate-300 mb-2" />
        <p className="text-sm text-slate-500">No quiz questions generated for this video yet.</p>
      </div>
    );
  }

  const currentQuestion = quiz[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;

  const handleSelectAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
    setShowExplanation(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setShowExplanation(false);
    setQuizFinished(false);
  };

  if (quizFinished) {
    const passed = score >= quiz.length * 0.7;
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center shadow-xs">
        <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 ${passed ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
          <Award className="w-8 h-8" />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-800 mb-2">Quiz Completed!</h3>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          You scored <strong className="text-slate-800">{score} out of {quiz.length}</strong> ({Math.round((score / quiz.length) * 100)}%). This demonstrates solid retention of the video material.
        </p>

        <div className="inline-flex gap-2">
          <button
            id="btn-quiz-restart"
            onClick={handleRestart}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono font-medium text-red-600 tracking-wider">
          QUESTION {currentQuestionIndex + 1} OF {quiz.length}
        </span>
        <span className="text-xs text-slate-400">
          Score: {score} / {currentQuestionIndex + (isAnswered ? 1 : 0)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full mb-6 overflow-hidden">
        <div
          className="bg-red-500 h-full transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / quiz.length) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <h3 className="font-sans font-semibold text-slate-800 text-base md:text-lg mb-6 leading-snug">
        {currentQuestion.question}
      </h3>

      {/* Options List */}
      <div className="space-y-3 mb-6">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedAnswers[currentQuestionIndex] === idx;
          const isCorrectIndex = idx === currentQuestion.answerIndex;
          
          let btnStyle = "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700";
          if (isAnswered) {
            if (isCorrectIndex) {
              btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-medium";
            } else if (isSelected) {
              btnStyle = "border-red-500 bg-red-50 text-red-800 font-medium";
            } else {
              btnStyle = "border-slate-100 bg-white text-slate-400 opacity-60";
            }
          }

          return (
            <button
              id={`quiz-opt-${currentQuestionIndex}-${idx}`}
              key={idx}
              onClick={() => handleSelectAnswer(idx)}
              disabled={isAnswered}
              className={`w-full text-left p-4 rounded-xl border font-sans text-sm transition-all duration-200 flex items-center justify-between ${btnStyle} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span>{option}</span>
              {isAnswered && isCorrectIndex && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />}
              {isAnswered && isSelected && !isCorrectIndex && <X className="w-4 h-4 text-red-500 flex-shrink-0 ml-2" />}
            </button>
          );
        })}
      </div>

      {/* Explanation Box */}
      {showExplanation && (
        <div className="p-4 bg-yellow-50/50 border border-yellow-100 rounded-xl mb-6 flex gap-3 text-left">
          <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-sans text-xs font-semibold text-yellow-800 mb-1">AI Explanation</h4>
            <p className="text-xs text-yellow-700 leading-relaxed">
              {currentQuestion.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Next Trigger */}
      {isAnswered && (
        <div className="flex justify-end">
          <button
            id={`btn-quiz-next-${currentQuestionIndex}`}
            onClick={handleNext}
            className="px-5 py-2.5 bg-slate-900 font-sans text-xs text-white uppercase tracking-wider font-semibold hover:bg-slate-800 transition-colors rounded-lg cursor-pointer"
          >
            {currentQuestionIndex === quiz.length - 1 ? 'Finish Quiz' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}
