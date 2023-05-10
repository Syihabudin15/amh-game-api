import { DB, DataTypes } from "../../Configs/DbConfig.js";

const Collection = DB.define('m_collection', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    img: {type: DataTypes.STRING, allowNull: false},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false}
});


await Collection.sync();
export default Collection;