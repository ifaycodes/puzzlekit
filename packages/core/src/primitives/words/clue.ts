export interface WordClue {
    id: string;
    text: string;
    answerId: string;
    direction?: "across" | "down";
}