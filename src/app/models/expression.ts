import { Meaning } from './meaning';

export class Expression {
    id?: string;
    text: string;
    type: 'word'|'phrase'|'metaphore'|'sentence';
    meanings: Meaning[];
    rating: number;
}
