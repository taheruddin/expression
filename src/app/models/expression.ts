import { Meaning } from './meaning';

export class Expression {
    id?: string;
    text: string;
    type: 'word'|'phrase'|'metaphore'|'sentence';
    partsOfSpeech: 'noun'|'pronoun'|'adjective'|'verb'|'adverb'|'preposition'|'conjunction'|'interjection';
    meanings: Meaning[];
    rating: number;
}
