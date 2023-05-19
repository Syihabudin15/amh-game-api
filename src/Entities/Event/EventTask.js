import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Event from "./Event.js";

const EvenTask = DB.define('m_event_task', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    total: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
});

EvenTask.belongsTo(Event);
Event.hasMany(EvenTask);

await EvenTask.sync();
export default EvenTask;