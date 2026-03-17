import { User } from "../../models";
import { EntityManager } from "typeorm";
import { RepositoryProvider, UserRepository } from "../repositories";
import { NodeMailer } from "./nodeMailer";
import { tempPinEmail } from "../emails";

export class UserService {

    private readonly userRepo: UserRepository;

    public constructor(manager: EntityManager) {
        const repositoryProvider = new RepositoryProvider(manager);
        this.userRepo = repositoryProvider.getCustomRepository(User, UserRepository);
    }

    public async sendTempPin(user: User): Promise<User> {
        const tempPin = user.setTempPin();
        const nodemailer = new NodeMailer();
        await nodemailer
            .to(user.email)
            .subject("Temporary Pin")
            .html(tempPinEmail(user.toString(), tempPin))
            .send();
        await this.userRepo.update(user.key, {
            tempPin: user.tempPin,
            tempPinExpirationDate: user.tempPinExpirationDate
        });
        delete user.tempPin;
        delete user.tempPinExpirationDate;
        return user;
    }

}