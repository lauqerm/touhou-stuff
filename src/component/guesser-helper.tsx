import styled from "styled-components";
import { Answer } from "./guesser-answer";
import { letterListFromString } from "../service";
import { LetterList, LetterMap } from "../model";

const HelperContainer = styled.div`
    display: inline-block;
    font-size: 14px;
    padding: 4px;
    .helper-title {
        margin-bottom: 4px;
    }
`;
export type GuesserHelper = {
    letter: string,
    position: number,
    status: number,
    onReplace?: (letter: string, position: number) => void,
};
export const GuesserHelper = ({
    letter,
    position,
    status,
    // onReplace,
}: GuesserHelper) => {
    const cutPosition = LetterMap[letter]?.position ?? 0;
    const verdictList = status === 0 || position < 0
        ? ''.padEnd(LetterList.length, '-')
        : status > 0
            ? LetterList.slice(0, cutPosition).join('').padEnd(LetterList.length, '-')
            : LetterList.slice(cutPosition + 1).join('').padStart(LetterList.length, '-');

    return <HelperContainer className="helper">
        <div className="helper-title">
            {position < 0
                ? <>No letter is selected</>
                : <>
                    {status === 0
                        ? <>The letter at position {position} is correct.</>
                        : <>The letter at position {position} could be:</>}
                </>}
        </div>
        <Answer
            letterList={letterListFromString(
                LetterList,
                verdictList,
            )}
            compact
            // onLetterClick={onReplace}
        />
    </HelperContainer>;
};