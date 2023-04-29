import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Hero from "../Markets/Hero.js";
import User from './User.js';

const MyHero = DB.define('m_my_hero', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    my_point: {type: DataTypes.BIGINT, allowNull: false, defaultValue: 0},
    is_trade: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false}
});


MyHero.belongsTo(User);
MyHero.belongsTo(Hero);

Hero.hasOne(MyHero);
User.hasMany(MyHero);

await MyHero.sync();
export default MyHero;