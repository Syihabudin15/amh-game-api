import { DB, DataTypes } from '../../Configs/DbConfig.js';
import Hero from '../Markets/Hero.js';


const Event = DB.define('m_event', {
    id: {type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
    name: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false},
    total_reward: {type: DataTypes.INTEGER, allowNull: false},
    is_active: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true},
    img_event: {type: DataTypes.STRING, allowNull: false}
});

Event.belongsTo(Hero);
Hero.hasMany(Event);

await Event.sync();
export default Event;