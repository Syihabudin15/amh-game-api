import { DB, DataTypes } from '../../Configs/DbConfig.js';

const HeroTransaction = DB.define('t_hero_transaction', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    date: {type: DataTypes.DATE, allowNull: false, defaultValue: new Date()},
    sender: {type: DataTypes.UUID, allowNull: false},
    receiver: {type: DataTypes.UUID, allowNull: false},
    hero_id: {type: DataTypes.UUID, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
    amount: {type: DataTypes.INTEGER, allowNull: false}
});

await HeroTransaction.sync();
export default HeroTransaction;