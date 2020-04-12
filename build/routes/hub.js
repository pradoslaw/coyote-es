"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const express_validator_1 = require("express-validator");
const hub_1 = __importDefault(require("../builders/hub"));
const express_jwt_1 = __importDefault(require("express-jwt"));
const elasticsearch_1 = __importDefault(require("../elasticsearch"));
const hits_1 = __importDefault(require("../transformers/hits"));
class HubController {
    constructor() {
        this.router = express.Router();
        this.getSuggestions = express_async_handler_1.default((req, res) => __awaiter(this, void 0, void 0, function* () {
            const errors = express_validator_1.validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({ errors: errors.array() });
            }
            // @ts-ignore
            const userId = parseInt(req.user.iss);
            const params = new hub_1.default(userId).build();
            const result = yield elasticsearch_1.default.search(params);
            const body = result.body;
            res.send(hits_1.default(body, userId));
        }));
        this.router.get('/', this.getHandlers(), this.getSuggestions);
    }
    getHandlers() {
        return [
            express_jwt_1.default({ secret: process.env.APP_KEY, credentialsRequired: true })
        ];
    }
}
exports.default = HubController;
