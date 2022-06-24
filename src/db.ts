import { DataSource } from "typeorm";
import { UserEntity } from "./entities/UserEntity";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "pity",
  password: "qwerty",
  database: "sarasa_recipes",
  entities: [UserEntity],
  logging: true,
  synchronize: true,
});
