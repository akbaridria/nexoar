import type { NewUser } from "../db/db.js";
import type { UserRepository } from "../repository/user-history.js";

export class UserService {
  private repo: UserRepository;

  constructor(userRepository: UserRepository) {
    this.repo = userRepository;

    this.create = this.create.bind(this);
    this.findByWalletAddress = this.findByWalletAddress.bind(this);
  }

  public async create(values: NewUser[]) {
    await this.repo.create(values);
  }

  public async findByWalletAddress(walletAddress: string) {
    return this.repo.findByWalletAddress(walletAddress);
  }
}
