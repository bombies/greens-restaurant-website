export abstract class FileSize {
    constructor(protected readonly value: number) {
    }

    abstract toBytes(): number;
}

export class MegaBytes extends FileSize {

    toBytes(): number {
        return this.value * 1e6;
    }

    static from(value: number): MegaBytes {
        return new MegaBytes(value);
    }
}

export class KiloBytes extends FileSize {

    toBytes(): number {
        return this.value * 1e3;
    }

    static from(value: number): KiloBytes {
        return new KiloBytes(value);
    }
}

export class GigaBytes extends FileSize {

    toBytes(): number {
        return this.value * 1e9;
    }

    static from(value: number): GigaBytes {
        return new GigaBytes(value);
    }
}