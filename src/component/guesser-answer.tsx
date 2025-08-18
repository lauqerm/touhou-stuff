import styled from "styled-components";
import { mergeClass } from "../util";
import type { LetterData } from "../model";

const LetterContainer = styled.li`
    display: inline-block;
    height: 40px;
    width: 40px;
    flex: 0 0 40px;
    font-size: 32px;
    line-height: 40px;
    text-align: center;
    border-radius: 8px;
    font-weight: 400;
    box-shadow: 0 1px 1px 0px #333333;
    &.next-position {
        background-color: #eaecef;
        .letter-box {
            color: blue;
        }
    }
    &.prev-position {
        background-color: #eaecef;
        .letter-box {
            color: red;
        }
    }
    &.correct-position {
        box-shadow: 0 0 2px 0px #444444;
        background-color: #bfffbf;
        font-weight: 600;
        .letter-box {
            color: #004900;
        }
    }
    &.clickable {
        cursor: pointer;
        &:hover {
            outline: 1px solid #444444;
        }
    }
    &.highlighted {
        outline: 1px solid #444444;
    }
    &.letter-compact {
        height: 20px;
        width: 20px;
        flex: 0 0 20px;
        font-size: 14px;
        line-height: 20px;
        border-radius: 0;
        box-shadow: none;
        &.clickable {
            cursor: pointer;
            &:hover {
                outline: none;
                box-shadow: 0 0 1px 0 #444444 inset;
            }
        }
    }
`;
const AnwserContainer = styled.ul`
    display: inline-flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
    &.answer-compact {
        display: flex;
        gap: 0;
        padding: 0;
        border-radius: 4px;
        border: 1px solid #666666;
        overflow: hidden;
    }
`;

export type AnswerLetter = {
    letter: string,
    status: number,
    compact?: boolean,
    highlight?: boolean,
    onClick?: React.DOMAttributes<HTMLLIElement>['onClick'],
};
export const AnswerLetter = ({
    letter,
    status,
    compact = false,
    highlight = false,
    onClick,
}: AnswerLetter) => {
    const resultClass = status === 0
        ? 'correct-position'
        : status >= 1 ? 'next-position' : 'prev-position';

    return <LetterContainer
        className={mergeClass(
            'letter-container',
            compact ? 'letter-compact' : '',
            onClick ? 'clickable' : '',
            highlight ? 'highlighted' : '',
            resultClass,
        )}
        onClick={onClick}
    >
        <div className="letter-box">{letter}</div>
    </LetterContainer>;
};

export type Answer = {
    letterList: LetterData[],
    compact?: boolean,
    highlight?: number,
    onLetterClick?: (letter: string, position: number) => void,
};
export const Answer = ({
    letterList,
    compact = false,
    highlight,
    onLetterClick,
}: Answer) => {
    return <AnwserContainer className={mergeClass("answer-container", compact ? 'answer-compact' : '')}>
        {letterList.map(({ key, letter, status, index }) => {
            return <AnswerLetter key={key}
                letter={letter}
                status={status}
                compact={compact}
                highlight={index === highlight}
                onClick={onLetterClick ? () => onLetterClick(letter, index) : undefined}
            />;
        })}
    </AnwserContainer>;
};