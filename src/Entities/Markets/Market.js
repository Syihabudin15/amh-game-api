import { DB, DataTypes } from "../../Configs/DbConfig.js";
import MyHero from '../Users/MyHero.js';

const Market = DB.define('m_market', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    is_sold: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    price: {type: DataTypes.BIGINT, allowNull: false, validate: {min: 1000}}
});

Market.belongsTo(MyHero);
MyHero.hasOne(Market);

await Market.sync();
export default Market;