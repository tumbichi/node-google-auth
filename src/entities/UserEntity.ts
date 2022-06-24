import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

@Entity("users")
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ nullable: false })
  firstname: string;

  @Column({ nullable: false })
  lastname: string;

  @Column({
    default: false,
  })
  active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  accessToken?: string;

  hashPassword = (password: string) => {
    return (this.password = bcrypt.hashSync(password, 8));
  };

  isValidPassword = (password: string) => {
    return bcrypt.compareSync(password, this.password);
  };

  generateJWT = () => {
    return jwt.sign(
      {
        id: this.id,
        email: this.email,
      },
      "SECRET",
      { expiresIn: "1h" }
    );
  };
}
