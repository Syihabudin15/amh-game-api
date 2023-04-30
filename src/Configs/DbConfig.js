import { Sequelize, DataTypes, Op } from "sequelize";
import {} from "dotenv/config";

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_DATABASE;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;

const DB = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    dialect: 'mysql'
});

export { DB, DataTypes, Op };