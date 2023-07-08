import { Sequelize, DataTypes, Op } from "sequelize";
import {} from "dotenv/config";

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;

const DB = new Sequelize(dbName, dbUser, dbPass, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    dialectOptions: {
    ssl: {
      rejectUnauthorized: true
    }
    }
});

export { DB, DataTypes, Op };
