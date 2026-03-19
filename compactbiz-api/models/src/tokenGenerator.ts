import { sign as jwtSign, verify as jwtVerify, decode as jwtDecode, JwtPayload } from "jsonwebtoken";
import { NonAuthorizedError } from ".";
import { CryptoGenerator } from "./cryptoGenerator";
import { throwError } from "./util";

enum TokenVerifyType {
    IdToken = "IdToken",
    RefreshToken = "RefreshToken"
}

export interface IdTokenData {
    userId: number;
    email: string;
    employeedById?: number;
    phone?: string;
}

export interface AccessTokenData {
    companyId: number;
}

export interface RefreshTokenData {
    idToken: string;
}

export interface NewRefreshTokenData {
    idToken: string;
    refreshToken: string;
}

export class TokenGenerator {

    private readonly idTokenSecret: string;
    private readonly accessTokenSecret: string;
    private readonly refreshTokenSecret: string;
    private readonly idTokenLife = "5d";
    private readonly accessTokenLife = "1h";
    private readonly refreshTokenLife = "7d";
    private readonly algorithm = "HS512";
    private readonly subject = "userlogin";

    public constructor() {
        this.idTokenSecret = process.env.JWT_SECRET!;
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!;
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!;
    }

    public idTokenSign(jwtPayload: IdTokenData): string {
        return jwtSign(jwtPayload, this.idTokenSecret, {
            subject: this.subject,
            algorithm: this.algorithm,
            expiresIn: this.idTokenLife,
            noTimestamp: false
        });
    }

    public accessTokenSign(jwtPayload: AccessTokenData): string {
        return jwtSign(jwtPayload, this.accessTokenSecret, {
            subject: this.subject,
            algorithm: this.algorithm,
            expiresIn: this.accessTokenLife,
            noTimestamp: false
        });
    }

    public refreshSign(refreshTokenPayload: RefreshTokenData): string {
        const cryptoGenerator = new CryptoGenerator();
        const refreshToken = jwtSign(refreshTokenPayload, this.refreshTokenSecret, {
            algorithm: this.algorithm,
            expiresIn: this.refreshTokenLife
        });
        return cryptoGenerator.encrypt(refreshToken);
    }

    public verifyRefreshToken(refreshTokenHash: string, oldIdToken: string): NewRefreshTokenData {
        const errMessage = "Cannot obtain new refresh token";
        if (!oldIdToken) {
            throwError([errMessage], NonAuthorizedError);
        }
        const cryptoGenerator = new CryptoGenerator();
        const refreshToken = cryptoGenerator.decrypt(refreshTokenHash);
        try {
            this.verify(refreshToken, TokenVerifyType.RefreshToken);
        } catch (err) {
            throwError([errMessage], NonAuthorizedError);
        }
        const refreshTokenData = jwtDecode(refreshToken) as (JwtPayload & RefreshTokenData) | null;
        if (!refreshTokenData || !refreshTokenData.idToken || refreshTokenData.idToken !== oldIdToken) {
            throwError([errMessage], NonAuthorizedError);
        }
        const idTokenData = jwtDecode(refreshTokenData.idToken) as (JwtPayload & IdTokenData);
        this.removeUnnecessaryDataFromToken(idTokenData);
        const newIdToken = this.idTokenSign(idTokenData);
        const newRefreshToken = this.refreshSign({
            idToken: newIdToken
        });
        return {
            idToken: newIdToken,
            refreshToken: newRefreshToken
        };
    }

    public verifyIdToken(idToken: string): void {
        void this.verify(idToken, TokenVerifyType.IdToken);
    }

    private verify(token: string, type: TokenVerifyType): void {
        try {
            const secret = type === TokenVerifyType.IdToken ? this.idTokenSecret : this.refreshTokenSecret;
            jwtVerify(token, secret);
        } catch (err: any) {
            //throw new UnauthorizedError("Token expired, refreshing session");
            throwError(["Token expired"], NonAuthorizedError);
        }
    }

    private removeUnnecessaryDataFromToken<T>(token: JwtPayload & T): void {
        delete token.exp;
        delete token.aud;
        delete token.iat;
        delete token.iss;
        delete token.jti;
        delete token.nbf;
        delete token.sub;
    }

}