import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Credential from "./Credential.js";

const User = DB.define('m_user', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    firstName: {type: DataTypes.STRING, allowNull: true},
    lastName: {type: DataTypes.STRING, allowNull: true},
    phone: {type: DataTypes.STRING, allowNull: false, unique: true},
    verified: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
});


User.belongsTo(Credential);
Credential.hasOne(User);


await User.sync();
export default User;