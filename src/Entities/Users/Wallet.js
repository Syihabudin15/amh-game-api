import { DB, DataTypes } from "../../Configs/DbConfig.js";
import User from "./User.js";

const Wallet = DB.define('m_wallet', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    no_wallet: {type: DataTypes.STRING, allowNull: false},
    balance: {type: DataTypes.BIGINT, allowNull: false, defaultValue: 0}
}, {createdAt: false, updatedAt: false});

Wallet.belongsTo(User);
User.hasOne(Wallet);

await Wallet.sync();
export default Wallet;