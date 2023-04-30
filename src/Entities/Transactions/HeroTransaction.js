import { DB, DataTypes } from '../../Configs/DbConfig.js';
import MyHero from '../Users/MyHero.js';

const HeroTransaction = DB.define('t_hero_transaction', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    receiver: {type: DataTypes.UUID, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
});

HeroTransaction.belongsTo(MyHero);
MyHero.hasMany(HeroTransaction);

await HeroTransaction.sync();
export default HeroTransaction;