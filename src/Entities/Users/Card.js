import { DB, DataTypes } from "../../Configs/DbConfig.js";
import User from "./User.js";

const Card = DB.define('m_card', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    no_card: {type: DataTypes.STRING, allowNull: false}
}, {createdAt: false, updatedAt: false});

Card.belongsTo(User);
User.hasOne(Card);

await Card.sync();
export default Card;