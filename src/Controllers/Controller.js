import Express from "express";
import Upload from "../Configs/MulterConfig.js";
import { CreateHero, GetAllHero, GetHero } from '../Services/HeroService.js';
import { SignUpUser, SignIn, SignUpAdmin } from '../Services/AuthService.js';
import { UpdateUser, GetMySelf } from '../Services/UserService.js';
import { GetMyWallet } from "../Services/WalletService.js";
import { CombineHero, GetMyHero, PlayGame } from "../Services/MyHeroService.js";
import { CreateCard, GetMyCard } from "../Services/CardService.js";
import { JwtVerifyUser, JwtVerifyAdmin } from "../Configs/JwtConfigs.js";
import { RequestOtp, VerifyOtp } from "../Services/VerifyService.js";

const Routers = Express.Router();

// Auth Router
Routers.post('/sign-up', SignUpUser);
Routers.post('/sign-in', SignIn);

// User Router
Routers.put('/user/update', JwtVerifyUser, UpdateUser);
Routers.get('/user/', JwtVerifyUser, GetMySelf);

// Verification
Routers.post('/user/req-otp', JwtVerifyUser, RequestOtp);
Routers.post('/user/verify/:otp', JwtVerifyUser, VerifyOtp);

// Wallet Router
Routers.get('/user/wallet', JwtVerifyUser, GetMyWallet);

// My Hero Router
Routers.get('/user/my-hero', JwtVerifyUser, GetMyHero);
Routers.get('/user/my-hero/combine', JwtVerifyUser, CombineHero);
Routers.post('/user/play/:myHeroId', JwtVerifyUser, PlayGame);

// Card Router
Routers.post('/user/card', JwtVerifyUser, CreateCard);
Routers.get('/user/card/:userId', JwtVerifyUser, GetMyCard);

// Hero Router
Routers.post('/hero-detail/:id', GetHero);
Routers.get('/heroes', GetAllHero);

// Admin Router
Routers.post('/admin/create-hero', JwtVerifyAdmin, Upload.single('img'), CreateHero);
Routers.post('/admin/sign-up', SignUpAdmin);
Routers.post('/admin/sign-in', SignIn);


export default Routers;