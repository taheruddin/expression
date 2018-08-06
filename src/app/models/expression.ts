import { Meaning } from './meaning';

export class Expression {
    id?: string;
    text: string;
    type: 'word'|'phrase'|'metaphore'|'sentence';
    rating: number;
    meanings: Meaning[];
}
