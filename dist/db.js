"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
const UserEntity_1 = require("./entities/UserEntity");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "pity",
    password: "qwerty",
    database: "sarasa_recipes",
    entities: [UserEntity_1.UserEntity],
    logging: true,
    synchronize: true,
});
//# sourceMappingURL=db.js.map