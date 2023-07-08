import { Sequelize, DataTypes, Op } from "sequelize";
import {} from "dotenv/config";

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbPort = process.env.DB_PORT;

const DB = new Sequelize('mysql://1h5uwfdhx8xfas0cqpml:pscale_pw_yulF3dXjcAW0eanjqwO2Ip0TtLr8m8wh0FQTV61pT2R@gcp.connect.psdb.cloud/amh-game?ssl={"rejectUnauthorized":true}');

export { DB, DataTypes, Op };
