
"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import questionsData from "../data/questions.json";
import { MathText } from "@/app/components/MathText";
import { Card, CardContent } from "@/components/ui/card";
import { useQuizHaptics } from "@/hooks/use-quiz-haptics";
import { useQuizSound } from "@/hooks/use-quiz-sound";

const GameMode = () => {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const { playCorrect, playIncorrect } = useQuizSound();
  const { hapticSuccess, hapticError, hapticImpact } = useQuizHaptics();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGameRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime === 1) {
            handleIncorrectAnswer();
            return 10;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isGameRunning]);

  const startGame = () => {
    console.log("Starting game...");
    const allQuestions = [...questionsData];
    const shuffledQuestions = allQuestions.sort(() => 0.5 - Math.random());
    setQuestions(shuffledQuestions);
    setCurrentQuestion(shuffledQuestions[0]);
    setIsGameRunning(true);
    setScore(0);
    setTimeLeft(10);
    setShowResult(false);
    console.log("Game started with question:", shuffledQuestions[0]);
  };

  const handleAnswer = (answerId: string) => {
    hapticImpact();
    if (answerId === currentQuestion.correctAnswer) {
      setScore(score + 1);
      loadNextQuestion();
      setTimeLeft(10);
      playCorrect();
      hapticSuccess();
    } else {
      playIncorrect();
      hapticError();
      handleIncorrectAnswer();
    }
  };

  const handleIncorrectAnswer = () => {
    setShowResult(true);
    setIsGameRunning(false);
  };

  const loadNextQuestion = () => {
    const currentIndex = questions.indexOf(currentQuestion);
    if (currentIndex < questions.length - 1) {
      setCurrentQuestion(questions[currentIndex + 1]);
    } else {
      setShowResult(true);
      setIsGameRunning(false);
    }
  };

  if (showResult) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
        <h3 className="text-xl mb-4">Your Score: {score}</h3>
        <Button onClick={startGame}>Play Again</Button>
      </div>
    );
  }

  return (
    <div>
      {!isGameRunning ? (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Test Your Knowledge</h2>
            <p className="text-lg text-gray-600 mb-8">Answer as many questions as you can before the time runs out!</p>
            <Button onClick={startGame} size="lg">Start Game</Button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-lg font-bold">Time Left: {timeLeft}</div>
            <div className="text-lg font-bold">Score: {score}</div>
          </div>
          {currentQuestion && (
            <Card>
                <CardContent className="p-6">
                    <div className="text-xl md:text-2xl leading-relaxed font-bold text-[#2C2C2C] mb-8">
                        <MathText content={currentQuestion.content} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option: any) => (
                        <Button
                            key={option.id}
                            onClick={() => handleAnswer(option.id)}
                            variant="outline"
                            className="h-auto whitespace-normal justify-start p-4 text-left"
                        >
                            <MathText content={option.content} />
                        </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GameMode;
