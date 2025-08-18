import { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
    ANSWER_MAX_LENGTH,
    ANSWER_WILDCARD_LETTER,
    DEFAULT_ANSWER,
    NameList,
    type AnswerObject,
    type GuessStatus,
} from '../model';
import { Button, Input, type InputRef } from 'antd';
import { v4 } from 'uuid';
import { Answer, AnswerLetter, GuesserHelper, GuesserHistory, type GuessHistory } from '../component';
import { compareLetter, letterListFromString } from '../service';

const answerObjectFromString = (value: undefined | string | string[], result: string): AnswerObject => {
    const normalizedResult = result.padEnd(ANSWER_MAX_LENGTH, " ");
    const normalizedValue = typeof value === 'string'
        ? value
        : (value ?? []).map(entry => (entry[0] ?? '')).join('');
    const letterList = [
        ...normalizedValue.padEnd(ANSWER_MAX_LENGTH, " ").toLocaleUpperCase()
    ].slice(0, ANSWER_MAX_LENGTH);

    return {
        value: letterList.join(''),
        letterList: letterListFromString(letterList, normalizedResult),
    };
};

const SubmissionContainer = styled.div`
    input {
        width: 15rem;
    }
    .submit-button {
        margin-top: 8px;
        margin-right: 8px;
    }
    .guess-result {
        margin-top: 8px;
    }
`;

const HowToPlayContainer = styled.div`
    font-size: 16px;
    line-height: 20px;
    display: inline-grid;
    grid-template-columns: max-content 1fr;
    gap: 8px;
    color: #444455;
    .letter-box {
        border-radius: 4px;
        box-shadow: 0 0 0 1px #666666;
    }
    .legend-entry {
        text-align: left;
    }
`;


const AppContainer = styled.div`
    background-color: #f2f4f7;
    min-height: 100vh;
    text-align: center;
    font-size: 20px;
    padding: 15px;
    ${SubmissionContainer} {
        margin: 15px 0;
    }
    ${HowToPlayContainer} {
        margin: 15px 0;
    }
    .app-title {
        font-size: 36px;
        font-weight: bold;
        color: #3b3bb3
    }
    .app-subtitle {
        font-size: 16px;
        font-style: italic;
        margin: 8px;
        margin-bottom: 20px;
    }
`;

export const GuesserModule = () => {
    const [result, setResult] = useState('');
    const [answer, setAnswer] = useState(answerObjectFromString(
        DEFAULT_ANSWER,
        ''.padEnd(ANSWER_MAX_LENGTH, ' '),
    ));
    const [currentAnswer, setCurrentAnswer] = useState(DEFAULT_ANSWER.toLocaleUpperCase());
    const [status, setStatus] = useState<'initial' | 'playing' | 'finished' | 'wrong-answer'>('initial');
    const [verdict, setVerdict] = useState('');
    const [historyList, setHistoryList] = useState<GuessHistory[]>([]);
    const [helperData, setHelperData] = useState({ letter: '', position: -1 });
    const answerInputRef = useRef<InputRef>(null);

    const submit = (finalAnswer: string, judge = true) => {
        setAnswer(answerObjectFromString(finalAnswer, result));
        if (judge) {
            const status: GuessStatus = finalAnswer.trim() === result.trim()
                ? 'finished'
                : 'wrong-answer';
            setStatus(status);
            if (finalAnswer !== result) {
                setVerdict('Try again');
            }
            setHistoryList(historyList => {
                const nextHistoryList = [...historyList];
                if (nextHistoryList.length > 0) {
                    const nextCurrentHistory: GuessHistory = { ...nextHistoryList[nextHistoryList.length - 1] };
                    nextCurrentHistory.status = status;
                    nextCurrentHistory.guessList = [
                        ...nextCurrentHistory.guessList,
                        {
                            id: v4(),
                            ...answerObjectFromString(finalAnswer, result),
                        },
                    ];
                    nextHistoryList[nextHistoryList.length - 1] = nextCurrentHistory;
                }

                return nextHistoryList;
            });
            resetHelper();
        }
    };

    const renew = useCallback(() => {
        const nextResult = NameList[Math.floor(Math.random() * NameList.length)];
        setResult(nextResult);
        setHistoryList(historyList => {
            const nextHistoryList: GuessHistory[] = [
                ...historyList,
                {
                    id: v4(),
                    guessList: [],
                    status: 'initial',
                }    
            ];
            return nextHistoryList;
        });
        setAnswer(answerObjectFromString(
            DEFAULT_ANSWER,
            nextResult,
        ));
        resetHelper();
    }, []);

    const resetHelper = () => {
        setHelperData({ letter: '', position: -1 });
    };

    const changeAnswer = (value: string) => {
        setCurrentAnswer(value);
        setStatus('playing');
        resetHelper();
    };

    const isMounted = useRef(false);
    useEffect(() => {
        if (isMounted.current === false) {
            isMounted.current = true;
            renew();
        }
    }, [renew]);

    useEffect(() => {
        /** Quality of life here, we compare the pending answer with the currently submitted answer to detect obvious error, for example changing a already corrected letter. */
        let relevant = true;
        setTimeout(() => {
            let isSuitable = true;
            const normalizedCurrentAnswer = currentAnswer.padEnd(ANSWER_MAX_LENGTH, ' ');
            for (let index = 0; index < normalizedCurrentAnswer.length; index++) {
                const letter = normalizedCurrentAnswer[index];
                const currentAnswerLetterData = answer.letterList[index];
                const verdict = compareLetter(
                    letter,
                    currentAnswerLetterData.status === 0 ? currentAnswerLetterData.letter : ANSWER_WILDCARD_LETTER,
                    false,
                );
                if (verdict !== 0) {
                    isSuitable = false;
                    break;
                }
            }
            if (relevant) {
                setVerdict(isSuitable ? 'Your guess seems okay' : 'Your guess is likely incorrect');
            }
        }, 200);

        return () => {
            relevant = false;
        };
    }, [answer.letterList, currentAnswer]);

    return <AppContainer className="app-container">
        <h2 className="app-title">Touhou Name Guesser</h2>
        <div className="app-subtitle">(Higher Lower Edition)</div>
        <SubmissionContainer className="submission-container">
            <div>
                Your answer: <Input
                    ref={answerInputRef}
                    value={currentAnswer}
                    onChange={e => {
                        const currentAnswer = e.currentTarget.value.toLocaleUpperCase();
                        changeAnswer(currentAnswer);
                    }}
                    onPressEnter={() => {
                        const finalAnswer = answerInputRef.current?.input?.value ?? '';
                        submit(finalAnswer, true);
                    }}
                />
            </div>
            <div className="guess-result">
                {status === 'finished' && <span>You guessed the name!</span>}
                {status === 'playing' && <span>{verdict}</span>}
                {status === 'wrong-answer' && <span>Your guess is incorrect</span>}
                {status === 'initial' && <span>Star guessing now!</span>}
            </div>
            <Button
                type="primary"
                className="submit-button"
                onClick={() => {
                    const finalAnswer = answerInputRef.current?.input?.value ?? '';
                    submit(finalAnswer, true);
                }}
            >Submit answer</Button>
            <Button onClick={renew}>Try another name</Button>
        </SubmissionContainer>
        <Answer
            letterList={answer.letterList}
            highlight={helperData.position}
            onLetterClick={(letter, position) => {
                const answerInput = answerInputRef.current;
                const answerInputElement = answerInput?.input;
                if (answerInput && answerInputElement) {
                    const answerLength = answerInputElement.value.length;
                    if (position > answerLength) {
                        const paddedAnswer = answerInputElement.value.padEnd(position, ' ');
                        answerInputElement.value = paddedAnswer;
                        setCurrentAnswer(paddedAnswer);
                    }
                    answerInput.focus();
                    answerInput.setSelectionRange(position, position + 1);
                    setHelperData({ letter, position });
                }
            }}
        />
        <br />
        <GuesserHelper
            letter={helperData.letter}
            position={helperData.position}
            status={answer.letterList[helperData.position]?.status}
            onReplace={(letter) => {
                const position = helperData.position;
                const nextAnswer = currentAnswer.substring(0, position)
                    + letter
                    + currentAnswer.substring(position + letter.length, currentAnswer.length);
                changeAnswer(nextAnswer);
                submit(nextAnswer, false);
            }}
        />
        <br />
        <HowToPlayContainer className="how-to-play">
            <AnswerLetter letter="H" status={0} compact />
            <div className="legend-entry">The letter "H" is correct</div>
            <AnswerLetter letter="H" status={1} compact />
            <div className="legend-entry">The correct letter is ahead the letter "H" ("A", "D", "E", etc...)</div>
            <AnswerLetter letter="H" status={-1} compact />
            <div className="legend-entry">The correct letter is behind the letter "H" ("I", "M", "Q", etc...)</div>
        </HowToPlayContainer>
        <br />
        <GuesserHistory historyList={historyList} />
    </AppContainer>;
};