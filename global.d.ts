declare class Decimal {
    constructor(value: number | string | Decimal);

    add(value: number | string | Decimal): Decimal;
    plus(value: number | string | Decimal): Decimal;
    minus(value: number | string | Decimal): Decimal;
    times(value: number | string | Decimal): Decimal;
    div(value: number | string | Decimal): Decimal;
    pow(value: number | string | Decimal): Decimal;
    gte(value: number | string | Decimal): boolean;
    lte(value: number | string | Decimal): boolean;
    gt(value: number | string | Decimal): boolean;
    lt(value: number | string | Decimal): boolean;
    eq(value: number | string | Decimal): boolean;
    toNumber(): number;
    floor(): Decimal;
    toExponential(digits: number): string;

    static pow(base: number | string | Decimal, exponent: number | string | Decimal): Decimal;


    private _isDecimal: boolean;
}

declare var gameData: any;