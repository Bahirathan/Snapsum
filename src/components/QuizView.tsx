/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types';
import { Check, X, RotateCcw, Award, Lightbulb, HelpCircle, Trophy, ChevronRight, Sparkles } from 'lucide-react';

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
  const [justAnswered, setJustAnswered] = useState<boolean>(false);

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
      <div className="p-10 text-center bg-neutral-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-neutral-200 dark:border-zinc-800">
        <HelpCircle className="w-10 h-10 mx-auto text-neutral-300 dark:text-zinc-600 mb-3" />
        <p className="text-sm text-neutral-500 dark:text-zinc-400 font-light">No quiz questions were generated for this content yet.</p>
      </div>
    );
  }

  const currentQuestion = quiz[currentQuestionIndex];
  const isAnswered = selectedAnswers[currentQuestionIndex] !== undefined;
  const progressPercent = Math.round(((currentQuestionIndex + (isAnswered ? 1 : 0)) / quiz.length) * 100);

  const handleSelectAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestionIndex]: optionIndex });
    setShowExplanation(true);
    setJustAnswered(true);
  };

  const handleNext = () => {
    setShowExplanation(false);
    setJustAnswered(false);
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
    setJustAnswered(false);
  };

  // Results screen
  if (quizFinished) {
    const pct = Math.round((score / quiz.length) * 100);
    const passed = pct >= 70;
    const perfect = score === quiz.length;

    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 p-8 text-center shadow-sm animate-scaleIn">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-5 ${
          perfect ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200' :
          passed ? 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200' :
          'bg-gradient-to-br from-neutral-300 to-neutral-400'
        }`}>
          {perfect ? <Trophy className="w-9 h-9 text-white" /> : <Award className="w-9 h-9 text-white" />}
        </div>

        <h3 className="font-display text-2xl font-bold text-neutral-900 dark:text-zinc-50 mb-2">
          {perfect ? 'Perfect Score!' : passed ? 'Quiz Passed!' : 'Keep Studying'}
        </h3>
        <p className="text-neutral-500 dark:text-zinc-400 text-sm mb-1 font-light">
          You scored <strong className="text-neutral-800 dark:text-zinc-200 font-bold">{score} / {quiz.length}</strong>
        </p>
        <div className={`inline-block text-2xl font-extrabold font-display mb-6 ${
          perfect ? 'text-amber-500' : passed ? 'text-emerald-500' : 'text-neutral-500'
        }`}>
          {pct}%
        </div>

        {/* Score breakdown */}
        <div className="flex gap-3 justify-center mb-8">
          {quiz.map((q, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                selectedAnswers[i] === q.answerIndex
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
              }`}
            >
              {selectedAnswers[i] === q.answerIndex ? '✓' : '✗'}
            </div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-zinc-700 text-white rounded-full font-semibold text-sm hover:bg-neutral-800 dark:hover:bg-zinc-600 transition cursor-pointer shadow-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-100 dark:border-zinc-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 bg-neutral-50 dark:bg-zinc-950 border-b border-neutral-100 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#0071e3]" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#0071e3]">AI Study Quiz</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-neutral-500 dark:text-zinc-400">
            {currentQuestionIndex + 1} / {quiz.length}
          </span>
        </div>
        {/* Segmented progress */}
        <div className="flex gap-1">
          {quiz.map((q, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                i < currentQuestionIndex
                  ? selectedAnswers[i] === q.answerIndex
                    ? 'bg-emerald-500'
                    : 'bg-rose-400'
                  : i === currentQuestionIndex
                    ? isAnswered
                      ? selectedAnswers[i] === q.answerIndex ? 'bg-emerald-500' : 'bg-rose-400'
                      : 'bg-[#0071e3] animate-pulse-soft'
                    : 'bg-neutral-200 dark:bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <h3 className="font-sans font-semibold text-neutral-900 dark:text-zinc-100 text-base leading-snug mb-5 animate-slideUp">
          {currentQuestion.question}
        </h3>

        {/* Options */}
        <div className="space-y-2.5 mb-5">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === idx;
            const isCorrectIndex = idx === currentQuestion.answerIndex;

            let style = 'border-neutral-150 dark:border-zinc-700 bg-neutral-50 dark:bg-zinc-800/40 text-neutral-700 dark:text-zinc-300 hover:border-neutral-300 dark:hover:border-zinc-600 hover:bg-neutral-100 dark:hover:bg-zinc-800';
            if (isAnswered) {
              if (isCorrectIndex) {
                style = 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-semibold shadow-sm shadow-emerald-100 dark:shadow-none';
              } else if (isSelected) {
                style = 'border-rose-400 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 font-semibold';
              } else {
                style = 'border-neutral-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-600 opacity-60';
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelectAnswer(idx)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border font-sans text-sm transition-all duration-200 flex items-center justify-between gap-3 ${style} ${!isAnswered ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold font-mono shrink-0 ${
                    isAnswered && isCorrectIndex ? 'bg-emerald-500 text-white' :
                    isAnswered && isSelected ? 'bg-rose-500 text-white' :
                    'bg-neutral-200 dark:bg-zinc-700 text-neutral-600 dark:text-zinc-400'
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="leading-snug">{option}</span>
                </div>
                {isAnswered && isCorrectIndex && <Check className="w-4.5 h-4.5 text-emerald-600 shrink-0" />}
                {isAnswered && isSelected && !isCorrectIndex && <X className="w-4.5 h-4.5 text-rose-500 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/30 rounded-xl mb-5 flex gap-3 text-left animate-slideUp">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1 uppercase tracking-wide font-mono">Explanation</p>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-light">
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Current score */}
        {isAnswered && (
          <div className="flex items-center justify-between animate-fadeIn">
            <div className="text-[11px] text-neutral-500 dark:text-zinc-500 font-mono">
              Score: <span className="font-bold text-neutral-700 dark:text-zinc-300">{score}</span> / {currentQuestionIndex + 1}
            </div>
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-xs font-bold transition cursor-pointer shadow-sm shadow-[#0071e3]/20 active:scale-98"
            >
              {currentQuestionIndex === quiz.length - 1 ? (
                <>
                  <Award className="w-3.5 h-3.5" />
                  See Results
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
