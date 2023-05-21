import { DB, DataTypes } from "../../Configs/DbConfig.js";
import EventTask from "./EventTask.js";
import UserEvent from "./UserEvent.js";

const ProgressEvent = DB.define('m_progress_event', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    is_complete: {type: DataTypes.BOOLEAN, defaultValue: false},
    progress: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
});

ProgressEvent.belongsTo(EventTask);
ProgressEvent.belongsTo(UserEvent);

EventTask.hasMany(ProgressEvent);
UserEvent.hasMany(ProgressEvent);

await ProgressEvent.sync();
export default ProgressEvent;