import { DB, DataTypes } from "../../Configs/DbConfig.js";
import Event from "./Event.js";

const EventTask = DB.define('m_event_task', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    code_title: {type: DataTypes.STRING, allowNull: false, unique: true},
    total: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 1}
});

EventTask.belongsTo(Event);
Event.hasMany(EventTask);

await EventTask.sync();
export default EventTask;