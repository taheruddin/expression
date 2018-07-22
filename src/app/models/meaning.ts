import { Example } from './example';

export class Meaning {
    id?: string;
    expressionId: string;
    partsOfSpeech: 'noun'|'pronoun'|'adjective'|'verb'|'adverb'|'preposition'|'conjunction'|'interjection';
    text: string;
    language: string;
    examples: Example[];
}
