import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Wallet from '../Users/Wallet.js';

const WalletTransaction = DB.define('t_wallet_transaction', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    to: {type: DataTypes.UUID, allowNull: false},
    type: {type: DataTypes.STRING, allowNull: false},
    amount: {type: DataTypes.INTEGER, allowNull: false},
    is_paid: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
});

WalletTransaction.belongsTo(Wallet);

await WalletTransaction.sync();
export default WalletTransaction;