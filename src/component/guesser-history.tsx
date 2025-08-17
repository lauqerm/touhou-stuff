import styled from "styled-components";
import { GuessStatusMap, type AnswerObject, type GuessStatus } from "../model";
import { memo } from "react";
import { Answer } from "./guesser-answer";
import { mergeClass } from "../util";

const GuesserHistoryContainer = styled.div`
    display: inline-block;
    width: 435px; // Alignment
    .guess-list {
        display: grid;
        grid-auto-columns: max-content;
        gap: 2px;
    }
    .history-entry {
        font-size: 16px;
        text-align: left;
        margin-top: 16px;
        padding: 4px;
        border-left: 3px solid transparent;
        &.current-entry {
            border-left-color: green;
        }
    }
    .guess-status {
        margin-bottom: 4px;
    }
`;
export type GuessHistory = {
    id: string,
    status: GuessStatus,
    guessList: ({ id: string } & AnswerObject)[],
}
export type GuesserHistory = {
    historyList: GuessHistory[],
};
export const GuesserHistory = memo(({
    historyList,
}: GuesserHistory) => {
    return <GuesserHistoryContainer className="history-list">
        {historyList.map((_, index, list) => {
            /** Reverse display for better clarity */
            const { guessList, status, id } = list[list.length - index - 1];
            return <div key={id} className={mergeClass('history-entry', index === 0 ? 'current-entry' : '')}>
                <div className="guess-status">{GuessStatusMap[status].label}</div>
                <div className="guess-list">
                    {guessList.length === 0 && <div>You did not make a guess.</div>}
                    {guessList.map((_, index, list) => {
                        const { id, letterList } = list[list.length - index - 1];
                        return <div key={id}>
                            <Answer letterList={letterList} compact />
                        </div>;
                    })}
                </div>
            </div>;
        })}
    </GuesserHistoryContainer>;
});