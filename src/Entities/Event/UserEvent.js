import { DB, DataTypes } from '../../Configs/DbConfig.js';
import User from '../Users/User.js';
import Event from "./Event.js";

const UserEvent = DB.define('m_user_event', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    is_complete: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
    progress: {type: DataTypes.INTEGER, defaultValue: 0, allowNull: false}
});

UserEvent.belongsTo(User);
UserEvent.belongsTo(Event);

User.hasMany(UserEvent);
Event.hasMany(UserEvent);

await UserEvent.sync();
export default UserEvent;