import { DB, DataTypes } from '../../Configs/DbConfig.js';

const Credential = DB.define('m_credential', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    email: {type: DataTypes.STRING, allowNull: false, unique: true, validate: {isEmail: {msg: "Must Email"}}},
    password: {type: DataTypes.STRING, allowNull: false, validate: {len: [6, 200]}},
    role: {type: DataTypes.STRING,allowNull: false}
},{createdAt: false, updatedAt: false});


await Credential.sync();
export default Credential;