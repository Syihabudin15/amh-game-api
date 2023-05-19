import { DB, DataTypes } from "../../Configs/DbConfig.js";
import EvenTask from "./EventTask.js";
import UserEvent from "./UserEvent.js";

const ProgressEvent = DB.define('m_progress_event', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    is_complete: {type: DataTypes.BOOLEAN, defaultValue: false},
    progres: {type: DataTypes.INTEGER, allowNull: false, defaultValue: 0}
});

ProgressEvent.belongsTo(EvenTask);
ProgressEvent.belongsTo(UserEvent);

EvenTask.hasMany(ProgressEvent);
UserEvent.hasMany(ProgressEvent);

await ProgressEvent.sync();
export default ProgressEvent;