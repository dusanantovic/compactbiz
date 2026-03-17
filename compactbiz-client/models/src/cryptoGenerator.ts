import { randomBytes, createCipheriv, createDecipheriv, scryptSync, timingSafeEqual } from "crypto";
import { assert } from "./util";

export class CryptoGenerator {

    private readonly algorithm = "aes-256-ctr";
    private readonly randomBytesSize = 16;
    private readonly secret: string;
    private readonly divider: string;

    public constructor() {
        this.secret = process.env.CRYPTO_GENERATOR_SECRET_32BYTES!;
        this.divider = process.env.CRYPTO_GENERATOR_DIVIDER_64BYTES!;
    }

    public encrypt(text: string): string {
        const iv = randomBytes(this.randomBytesSize);
        const cipher = createCipheriv(this.algorithm, this.secret, iv);
        const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
        return `${iv.toString("hex")}${this.divider}${encrypted.toString("hex")}`;
    }

    public decrypt(hash: string): string {
        const splitHash = hash.split(this.divider);
        assert(splitHash.length === 2, ["Invalid hash"]);
        const decipher = createDecipheriv(this.algorithm, this.secret, Buffer.from(splitHash[0], "hex"));
        const decrpyted = Buffer.concat([decipher.update(Buffer.from(splitHash[1], "hex")), decipher.final()]);
        return decrpyted.toString();
    }

    public hash(value: string): string {
        const salt = randomBytes(this.randomBytesSize).toString("hex");
        const buf = scryptSync(value, salt, 64);
        return `${buf.toString("hex")}${salt}`;
    }

    public compareRawWithHash(rawValue: string, hashedValue: string): boolean {
        const hash = hashedValue.substring(0, hashedValue.length - (this.randomBytesSize * 2));
        const salt = hashedValue.substring(hashedValue.length - (this.randomBytesSize * 2), hashedValue.length);
        const hashedBuf = Buffer.from(hash, "hex");
        const rawHashBuf = scryptSync(rawValue, salt, 64);
        return timingSafeEqual(hashedBuf, rawHashBuf);
    }

}