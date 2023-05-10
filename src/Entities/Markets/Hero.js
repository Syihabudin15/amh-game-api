import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Collection from "./Collection.js";

const Hero = DB.define('m_hero', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    level: {type: DataTypes.INTEGER, allowNull: false, unique: true},
    supply: {type: DataTypes.BIGINT, allowNull: false},
    power: {type: DataTypes.INTEGER, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
    max_point: {type: DataTypes.BIGINT, allowNull: false},
    stock: {type: DataTypes.BIGINT, allowNull: false},
    default_price: {type: DataTypes.BIGINT, allowNull: false}
}, {createdAt: false, updatedAt: false});

Hero.belongsTo(Collection);
Collection.hasMany(Hero);

await Hero.sync();
export default Hero;