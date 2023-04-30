import Express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {} from "dotenv/config";
import Routers from './src/Controllers/Controller.js';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(Express.json());
app.use(cors());

app.use('/img', Express.static(path.join(__dirname,'/src/Resources/img')));

app.use('/api', Routers);


app.listen(port, () => console.log(`App running in Port: ${port}`));