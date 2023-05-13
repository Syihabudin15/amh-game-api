import { DB, DataTypes } from '../../Configs/DbConfig.js';
import MyHero from '../Users/MyHero.js';
import User from '../Users/User.js';

const HeroTransaction = DB.define('t_hero_transaction', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    receiver: {type: DataTypes.UUID, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
});

HeroTransaction.belongsTo(MyHero);
MyHero.hasMany(HeroTransaction);
HeroTransaction.belongsTo(User);

await HeroTransaction.sync();
export default HeroTransaction;