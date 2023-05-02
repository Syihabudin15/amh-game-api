import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Wallet from '../Users/Wallet.js';

const WalletTransaction = DB.define('t_wallet_transaction', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    to: {type: DataTypes.STRING, allowNull: true},
    type: {type: DataTypes.STRING, allowNull: false},
    amount: {type: DataTypes.INTEGER, allowNull: false},
    bank: {type: DataTypes.STRING, allowNull: true},
    trans_id: {type: DataTypes.STRING, allowNull: true},
    is_paid: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
});

WalletTransaction.belongsTo(Wallet);
Wallet.hasMany(WalletTransaction);

await WalletTransaction.sync();
export default WalletTransaction;