import Express from "express";
import Upload from "../Configs/MulterConfig.js";
import { BuyFromAdmin, BuyHero, CancelSell, CreateHero, 
        SearchByLevel, GetAllHero, GetHeroById, 
        SellHero, SendHero } from '../Services/HeroService.js';
import { SignUpUser, SignIn, SignUpAdmin } from '../Services/AuthService.js';
import { UpdateUser, GetMySelf } from '../Services/UserService.js';
import { GetAllDeposit, GetAllSendBalance, GetAllWithdraw, GetMyWallet } from "../Services/WalletService.js";
import { CombineHero, GetMyHero, PlayGame } from "../Services/MyHeroService.js";
import { CreateCard, GetMyCard } from "../Services/CardService.js";
import { JwtVerifyUser, JwtVerifyAdmin } from "../Configs/JwtConfigs.js";
import { RequestOtp, VerifyOtp } from "../Services/VerifyService.js";
import { DepositViaEwallet, GetWithdrawPaymentMethod, WithdrawRequest, WithdrawVerify } from "../Services/PaymentService.js";
import { DepositFailureCallback, DepositSuccessCallback, WithdrawFailureCallback, WithdrawSuccessCallback } from "../Services/HandleCallback.js";

const Routers = Express.Router();

// Auth Router
Routers.post('/sign-up', SignUpUser);
Routers.post('/sign-in', SignIn);

// User Router
Routers.put('/user/update', JwtVerifyUser, UpdateUser);
Routers.get('/user', JwtVerifyUser, GetMySelf);

// Verification
Routers.post('/user/req-verify', JwtVerifyUser, RequestOtp);
Routers.post('/user/verify', JwtVerifyUser, VerifyOtp);

// Wallet Router
Routers.get('/user/wallet', JwtVerifyUser, GetMyWallet);
Routers.get('/user/wallet/history-send', JwtVerifyUser, GetAllSendBalance);
Routers.get('/user/wallet/history-withdraw', JwtVerifyUser, GetAllWithdraw);
Routers.get('/user/wallet/history-deposit', JwtVerifyUser, GetAllDeposit);

//Payment Router
Routers.post('/user/deposit/ewallet', JwtVerifyUser, DepositViaEwallet);
Routers.post('/user/withdraw-req', JwtVerifyUser, WithdrawRequest);
Routers.post('/user/withdraw-verify', JwtVerifyUser, WithdrawVerify);
Routers.get('/withdraw/payment-method', GetWithdrawPaymentMethod);

// Callback Payment
Routers.post('/deposit/callback/success', DepositSuccessCallback);
Routers.post('/deposit/callback/failure', DepositFailureCallback);
Routers.post('/withdraw/callback/success', WithdrawSuccessCallback);
Routers.post('/withdraw/callback/failure', WithdrawFailureCallback);

// My Hero Router
Routers.get('/user/my-hero', JwtVerifyUser, GetMyHero);
Routers.post('/user/my-hero/send', JwtVerifyUser, SendHero);
Routers.get('/user/my-hero/combine', JwtVerifyUser, CombineHero);
Routers.post('/user/play/:myHeroId', JwtVerifyUser, PlayGame);

// Card Router
Routers.post('/user/card', JwtVerifyUser, CreateCard);
Routers.get('/user/card', JwtVerifyUser, GetMyCard);

// Hero Router
Routers.get('/hero-detail/:id', GetHeroById);
Routers.get('/heroes', GetAllHero);
Routers.get('/heroes/find', SearchByLevel);

// Market Route
Routers.post('/market/buy', JwtVerifyUser, BuyFromAdmin);
Routers.post('/marketplace/sell', JwtVerifyUser, SellHero);
Routers.post('/marketplace/buy/:marketId', JwtVerifyUser, BuyHero);
Routers.post('/marketplace/sell/cancel/:myHeroId', JwtVerifyUser, CancelSell);

// Admin Router
Routers.post('/admin/create-hero', JwtVerifyAdmin, Upload.single('img'), CreateHero);
Routers.post('/admin/sign-up', SignUpAdmin);
Routers.post('/admin/sign-in', SignIn);


export default Routers;