import { Example } from './example';

export class Meaning {
    id?: string;
    expressionId: string;
    text: string;
    language: string;
    examples: Example[];
}
