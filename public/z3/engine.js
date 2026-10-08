"use strict";
var ClocktowerZ3 = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/tslib/tslib.es6.mjs
  var tslib_es6_exports = {};
  __export(tslib_es6_exports, {
    __addDisposableResource: () => __addDisposableResource,
    __assign: () => __assign,
    __asyncDelegator: () => __asyncDelegator,
    __asyncGenerator: () => __asyncGenerator,
    __asyncValues: () => __asyncValues,
    __await: () => __await,
    __awaiter: () => __awaiter,
    __classPrivateFieldGet: () => __classPrivateFieldGet,
    __classPrivateFieldIn: () => __classPrivateFieldIn,
    __classPrivateFieldSet: () => __classPrivateFieldSet,
    __createBinding: () => __createBinding,
    __decorate: () => __decorate,
    __disposeResources: () => __disposeResources,
    __esDecorate: () => __esDecorate,
    __exportStar: () => __exportStar,
    __extends: () => __extends,
    __generator: () => __generator,
    __importDefault: () => __importDefault,
    __importStar: () => __importStar,
    __makeTemplateObject: () => __makeTemplateObject,
    __metadata: () => __metadata,
    __param: () => __param,
    __propKey: () => __propKey,
    __read: () => __read,
    __rest: () => __rest,
    __rewriteRelativeImportExtension: () => __rewriteRelativeImportExtension,
    __runInitializers: () => __runInitializers,
    __setFunctionName: () => __setFunctionName,
    __spread: () => __spread,
    __spreadArray: () => __spreadArray,
    __spreadArrays: () => __spreadArrays,
    __values: () => __values,
    default: () => tslib_es6_default
  });
  function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  }
  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
          t[p[i]] = s[p[i]];
      }
    return t;
  }
  function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  }
  function __param(paramIndex, decorator) {
    return function(target, key) {
      decorator(target, key, paramIndex);
    };
  }
  function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
      if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
      return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function(f) {
        if (done) throw new TypeError("Cannot add initializers after decoration has completed");
        extraInitializers.push(accept(f || null));
      };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
        if (result === void 0) continue;
        if (result === null || typeof result !== "object") throw new TypeError("Object expected");
        if (_ = accept(result.get)) descriptor.get = _;
        if (_ = accept(result.set)) descriptor.set = _;
        if (_ = accept(result.init)) initializers.unshift(_);
      } else if (_ = accept(result)) {
        if (kind === "field") initializers.unshift(_);
        else descriptor[key] = _;
      }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
  }
  function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
  }
  function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
  }
  function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
  }
  function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
  }
  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P ? value : new P(function(resolve) {
        resolve(value);
      });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }
  function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() {
      if (t[0] & 1) throw t[1];
      return t[1];
    }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
      return this;
    }), g;
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
        if (y = 0, t) op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2]) _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f = t = 0;
      }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  }
  function __exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
  }
  function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
      next: function() {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
  }
  function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    } catch (error) {
      e = { error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  }
  function __spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  }
  function __spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
        r[k] = a[j];
    return r;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar) ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
  }
  function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
  }
  function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
      return this;
    }, i;
    function awaitReturn(f) {
      return function(v) {
        return Promise.resolve(v).then(f, reject);
      };
    }
    function verb(n, f) {
      if (g[n]) {
        i[n] = function(v) {
          return new Promise(function(a, b) {
            q.push([n, v, a, b]) > 1 || resume(n, v);
          });
        };
        if (f) i[n] = f(i[n]);
      }
    }
    function resume(n, v) {
      try {
        step(g[n](v));
      } catch (e) {
        settle(q[0][3], e);
      }
    }
    function step(r) {
      r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
      resume("next", value);
    }
    function reject(value) {
      resume("throw", value);
    }
    function settle(f, v) {
      if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
  }
  function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
      throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
      return this;
    }, i;
    function verb(n, f) {
      i[n] = o[n] ? function(v) {
        return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
      } : f;
    }
  }
  function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
      return this;
    }, i);
    function verb(n) {
      i[n] = o[n] && function(v) {
        return new Promise(function(resolve, reject) {
          v = o[n](v), settle(resolve, reject, v.done, v.value);
        });
      };
    }
    function settle(resolve, reject, d, v) {
      Promise.resolve(v).then(function(v2) {
        resolve({ value: v2, done: d });
      }, reject);
    }
  }
  function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, "raw", { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  }
  function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
      for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
    }
    __setModuleDefault(result, mod);
    return result;
  }
  function __importDefault(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  }
  function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
  }
  function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
  }
  function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
  }
  function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
      if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
      var dispose, inner;
      if (async) {
        if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
        dispose = value[Symbol.asyncDispose];
      }
      if (dispose === void 0) {
        if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
        dispose = value[Symbol.dispose];
        if (async) inner = dispose;
      }
      if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
      if (inner) dispose = function() {
        try {
          inner.call(this);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      env.stack.push({ value, dispose, async });
    } else if (async) {
      env.stack.push({ async: true });
    }
    return value;
  }
  function __disposeResources(env) {
    function fail(e) {
      env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
      env.hasError = true;
    }
    var r, s = 0;
    function next() {
      while (r = env.stack.pop()) {
        try {
          if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
          if (r.dispose) {
            var result = r.dispose.call(r.value);
            if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
              fail(e);
              return next();
            });
          } else s |= 1;
        } catch (e) {
          fail(e);
        }
      }
      if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
      if (env.hasError) throw env.error;
    }
    return next();
  }
  function __rewriteRelativeImportExtension(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
        return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
      });
    }
    return path;
  }
  var extendStatics, __assign, __createBinding, __setModuleDefault, ownKeys, _SuppressedError, tslib_es6_default;
  var init_tslib_es6 = __esm({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/tslib/tslib.es6.mjs"() {
      extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
          d2.__proto__ = b2;
        } || function(d2, b2) {
          for (var p in b2) if (Object.prototype.hasOwnProperty.call(b2, p)) d2[p] = b2[p];
        };
        return extendStatics(d, b);
      };
      __assign = function() {
        __assign = Object.assign || function __assign2(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      });
      __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }) : function(o, v) {
        o["default"] = v;
      };
      ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
        var e = new Error(message);
        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
      };
      tslib_es6_default = {
        __extends,
        __assign,
        __rest,
        __decorate,
        __param,
        __esDecorate,
        __runInitializers,
        __propKey,
        __setFunctionName,
        __metadata,
        __awaiter,
        __generator,
        __createBinding,
        __exportStar,
        __values,
        __read,
        __spread,
        __spreadArrays,
        __spreadArray,
        __await,
        __asyncGenerator,
        __asyncDelegator,
        __asyncValues,
        __makeTemplateObject,
        __importStar,
        __importDefault,
        __classPrivateFieldGet,
        __classPrivateFieldSet,
        __classPrivateFieldIn,
        __addDisposableResource,
        __disposeResources,
        __rewriteRelativeImportExtension
      };
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/errors.js
  var require_errors = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/errors.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.E_CANCELED = exports.E_ALREADY_LOCKED = exports.E_TIMEOUT = void 0;
      exports.E_TIMEOUT = new Error("timeout while waiting for mutex to become available");
      exports.E_ALREADY_LOCKED = new Error("mutex already locked");
      exports.E_CANCELED = new Error("request for lock canceled");
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/Semaphore.js
  var require_Semaphore = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/Semaphore.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
      var errors_1 = require_errors();
      var Semaphore = (
        /** @class */
        (function() {
          function Semaphore2(_maxConcurrency, _cancelError) {
            if (_cancelError === void 0) {
              _cancelError = errors_1.E_CANCELED;
            }
            this._maxConcurrency = _maxConcurrency;
            this._cancelError = _cancelError;
            this._queue = [];
            this._waiters = [];
            if (_maxConcurrency <= 0) {
              throw new Error("semaphore must be initialized to a positive value");
            }
            this._value = _maxConcurrency;
          }
          Semaphore2.prototype.acquire = function() {
            var _this = this;
            var locked = this.isLocked();
            var ticketPromise = new Promise(function(resolve, reject) {
              return _this._queue.push({ resolve, reject });
            });
            if (!locked)
              this._dispatch();
            return ticketPromise;
          };
          Semaphore2.prototype.runExclusive = function(callback) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
              var _a, value, release;
              return (0, tslib_1.__generator)(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    return [4, this.acquire()];
                  case 1:
                    _a = _b.sent(), value = _a[0], release = _a[1];
                    _b.label = 2;
                  case 2:
                    _b.trys.push([2, , 4, 5]);
                    return [4, callback(value)];
                  case 3:
                    return [2, _b.sent()];
                  case 4:
                    release();
                    return [
                      7
                      /*endfinally*/
                    ];
                  case 5:
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          };
          Semaphore2.prototype.waitForUnlock = function() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
              var waitPromise;
              var _this = this;
              return (0, tslib_1.__generator)(this, function(_a) {
                if (!this.isLocked()) {
                  return [2, Promise.resolve()];
                }
                waitPromise = new Promise(function(resolve) {
                  return _this._waiters.push({ resolve });
                });
                return [2, waitPromise];
              });
            });
          };
          Semaphore2.prototype.isLocked = function() {
            return this._value <= 0;
          };
          Semaphore2.prototype.release = function() {
            if (this._maxConcurrency > 1) {
              throw new Error("this method is unavailable on semaphores with concurrency > 1; use the scoped release returned by acquire instead");
            }
            if (this._currentReleaser) {
              var releaser = this._currentReleaser;
              this._currentReleaser = void 0;
              releaser();
            }
          };
          Semaphore2.prototype.cancel = function() {
            var _this = this;
            this._queue.forEach(function(ticket) {
              return ticket.reject(_this._cancelError);
            });
            this._queue = [];
          };
          Semaphore2.prototype._dispatch = function() {
            var _this = this;
            var nextTicket = this._queue.shift();
            if (!nextTicket)
              return;
            var released = false;
            this._currentReleaser = function() {
              if (released)
                return;
              released = true;
              _this._value++;
              _this._resolveWaiters();
              _this._dispatch();
            };
            nextTicket.resolve([this._value--, this._currentReleaser]);
          };
          Semaphore2.prototype._resolveWaiters = function() {
            this._waiters.forEach(function(waiter) {
              return waiter.resolve();
            });
            this._waiters = [];
          };
          return Semaphore2;
        })()
      );
      exports.default = Semaphore;
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/Mutex.js
  var require_Mutex = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/Mutex.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
      var Semaphore_1 = require_Semaphore();
      var Mutex = (
        /** @class */
        (function() {
          function Mutex2(cancelError) {
            this._semaphore = new Semaphore_1.default(1, cancelError);
          }
          Mutex2.prototype.acquire = function() {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
              var _a, releaser;
              return (0, tslib_1.__generator)(this, function(_b) {
                switch (_b.label) {
                  case 0:
                    return [4, this._semaphore.acquire()];
                  case 1:
                    _a = _b.sent(), releaser = _a[1];
                    return [2, releaser];
                }
              });
            });
          };
          Mutex2.prototype.runExclusive = function(callback) {
            return this._semaphore.runExclusive(function() {
              return callback();
            });
          };
          Mutex2.prototype.isLocked = function() {
            return this._semaphore.isLocked();
          };
          Mutex2.prototype.waitForUnlock = function() {
            return this._semaphore.waitForUnlock();
          };
          Mutex2.prototype.release = function() {
            this._semaphore.release();
          };
          Mutex2.prototype.cancel = function() {
            return this._semaphore.cancel();
          };
          return Mutex2;
        })()
      );
      exports.default = Mutex;
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/withTimeout.js
  var require_withTimeout = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/withTimeout.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.withTimeout = void 0;
      var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
      var errors_1 = require_errors();
      function withTimeout(sync, timeout, timeoutError) {
        var _this = this;
        if (timeoutError === void 0) {
          timeoutError = errors_1.E_TIMEOUT;
        }
        return {
          acquire: function() {
            return new Promise(function(resolve, reject) {
              return (0, tslib_1.__awaiter)(_this, void 0, void 0, function() {
                var isTimeout, handle2, ticket, release, e_1;
                return (0, tslib_1.__generator)(this, function(_a) {
                  switch (_a.label) {
                    case 0:
                      isTimeout = false;
                      handle2 = setTimeout(function() {
                        isTimeout = true;
                        reject(timeoutError);
                      }, timeout);
                      _a.label = 1;
                    case 1:
                      _a.trys.push([1, 3, , 4]);
                      return [4, sync.acquire()];
                    case 2:
                      ticket = _a.sent();
                      if (isTimeout) {
                        release = Array.isArray(ticket) ? ticket[1] : ticket;
                        release();
                      } else {
                        clearTimeout(handle2);
                        resolve(ticket);
                      }
                      return [3, 4];
                    case 3:
                      e_1 = _a.sent();
                      if (!isTimeout) {
                        clearTimeout(handle2);
                        reject(e_1);
                      }
                      return [3, 4];
                    case 4:
                      return [
                        2
                        /*return*/
                      ];
                  }
                });
              });
            });
          },
          runExclusive: function(callback) {
            return (0, tslib_1.__awaiter)(this, void 0, void 0, function() {
              var release, ticket;
              return (0, tslib_1.__generator)(this, function(_a) {
                switch (_a.label) {
                  case 0:
                    release = function() {
                      return void 0;
                    };
                    _a.label = 1;
                  case 1:
                    _a.trys.push([1, , 7, 8]);
                    return [4, this.acquire()];
                  case 2:
                    ticket = _a.sent();
                    if (!Array.isArray(ticket)) return [3, 4];
                    release = ticket[1];
                    return [4, callback(ticket[0])];
                  case 3:
                    return [2, _a.sent()];
                  case 4:
                    release = ticket;
                    return [4, callback()];
                  case 5:
                    return [2, _a.sent()];
                  case 6:
                    return [3, 8];
                  case 7:
                    release();
                    return [
                      7
                      /*endfinally*/
                    ];
                  case 8:
                    return [
                      2
                      /*return*/
                    ];
                }
              });
            });
          },
          /** @deprecated Deprecated in 0.3.0, will be removed in 0.4.0. Use runExclusive instead. */
          release: function() {
            sync.release();
          },
          cancel: function() {
            return sync.cancel();
          },
          waitForUnlock: function() {
            return sync.waitForUnlock();
          },
          isLocked: function() {
            return sync.isLocked();
          }
        };
      }
      exports.withTimeout = withTimeout;
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/tryAcquire.js
  var require_tryAcquire = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/tryAcquire.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.tryAcquire = void 0;
      var errors_1 = require_errors();
      var withTimeout_1 = require_withTimeout();
      function tryAcquire(sync, alreadyAcquiredError) {
        if (alreadyAcquiredError === void 0) {
          alreadyAcquiredError = errors_1.E_ALREADY_LOCKED;
        }
        return (0, withTimeout_1.withTimeout)(sync, 0, alreadyAcquiredError);
      }
      exports.tryAcquire = tryAcquire;
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/index.js
  var require_lib = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/async-mutex/lib/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.tryAcquire = exports.withTimeout = exports.Semaphore = exports.Mutex = void 0;
      var tslib_1 = (init_tslib_es6(), __toCommonJS(tslib_es6_exports));
      var Mutex_1 = require_Mutex();
      Object.defineProperty(exports, "Mutex", { enumerable: true, get: function() {
        return Mutex_1.default;
      } });
      var Semaphore_1 = require_Semaphore();
      Object.defineProperty(exports, "Semaphore", { enumerable: true, get: function() {
        return Semaphore_1.default;
      } });
      var withTimeout_1 = require_withTimeout();
      Object.defineProperty(exports, "withTimeout", { enumerable: true, get: function() {
        return withTimeout_1.withTimeout;
      } });
      var tryAcquire_1 = require_tryAcquire();
      Object.defineProperty(exports, "tryAcquire", { enumerable: true, get: function() {
        return tryAcquire_1.tryAcquire;
      } });
      (0, tslib_1.__exportStar)(require_errors(), exports);
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/low-level/types.__GENERATED__.js
  var require_types_GENERATED = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/low-level/types.__GENERATED__.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Z3_goal_prec = exports.Z3_error_code = exports.Z3_ast_print_mode = exports.Z3_param_kind = exports.Z3_decl_kind = exports.Z3_ast_kind = exports.Z3_sort_kind = exports.Z3_parameter_kind = exports.Z3_symbol_kind = exports.Z3_lbool = void 0;
      var Z3_lbool;
      (function(Z3_lbool2) {
        Z3_lbool2[Z3_lbool2["Z3_L_FALSE"] = -1] = "Z3_L_FALSE";
        Z3_lbool2[Z3_lbool2["Z3_L_UNDEF"] = 0] = "Z3_L_UNDEF";
        Z3_lbool2[Z3_lbool2["Z3_L_TRUE"] = 1] = "Z3_L_TRUE";
      })(Z3_lbool || (exports.Z3_lbool = Z3_lbool = {}));
      var Z3_symbol_kind;
      (function(Z3_symbol_kind2) {
        Z3_symbol_kind2[Z3_symbol_kind2["Z3_INT_SYMBOL"] = 0] = "Z3_INT_SYMBOL";
        Z3_symbol_kind2[Z3_symbol_kind2["Z3_STRING_SYMBOL"] = 1] = "Z3_STRING_SYMBOL";
      })(Z3_symbol_kind || (exports.Z3_symbol_kind = Z3_symbol_kind = {}));
      var Z3_parameter_kind;
      (function(Z3_parameter_kind2) {
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_INT"] = 0] = "Z3_PARAMETER_INT";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_DOUBLE"] = 1] = "Z3_PARAMETER_DOUBLE";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_RATIONAL"] = 2] = "Z3_PARAMETER_RATIONAL";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_SYMBOL"] = 3] = "Z3_PARAMETER_SYMBOL";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_SORT"] = 4] = "Z3_PARAMETER_SORT";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_AST"] = 5] = "Z3_PARAMETER_AST";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_FUNC_DECL"] = 6] = "Z3_PARAMETER_FUNC_DECL";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_INTERNAL"] = 7] = "Z3_PARAMETER_INTERNAL";
        Z3_parameter_kind2[Z3_parameter_kind2["Z3_PARAMETER_ZSTRING"] = 8] = "Z3_PARAMETER_ZSTRING";
      })(Z3_parameter_kind || (exports.Z3_parameter_kind = Z3_parameter_kind = {}));
      var Z3_sort_kind;
      (function(Z3_sort_kind2) {
        Z3_sort_kind2[Z3_sort_kind2["Z3_UNINTERPRETED_SORT"] = 0] = "Z3_UNINTERPRETED_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_BOOL_SORT"] = 1] = "Z3_BOOL_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_INT_SORT"] = 2] = "Z3_INT_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_REAL_SORT"] = 3] = "Z3_REAL_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_BV_SORT"] = 4] = "Z3_BV_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_ARRAY_SORT"] = 5] = "Z3_ARRAY_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_DATATYPE_SORT"] = 6] = "Z3_DATATYPE_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_RELATION_SORT"] = 7] = "Z3_RELATION_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_FINITE_DOMAIN_SORT"] = 8] = "Z3_FINITE_DOMAIN_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_FLOATING_POINT_SORT"] = 9] = "Z3_FLOATING_POINT_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_ROUNDING_MODE_SORT"] = 10] = "Z3_ROUNDING_MODE_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_SEQ_SORT"] = 11] = "Z3_SEQ_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_RE_SORT"] = 12] = "Z3_RE_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_CHAR_SORT"] = 13] = "Z3_CHAR_SORT";
        Z3_sort_kind2[Z3_sort_kind2["Z3_TYPE_VAR"] = 14] = "Z3_TYPE_VAR";
        Z3_sort_kind2[Z3_sort_kind2["Z3_UNKNOWN_SORT"] = 1e3] = "Z3_UNKNOWN_SORT";
      })(Z3_sort_kind || (exports.Z3_sort_kind = Z3_sort_kind = {}));
      var Z3_ast_kind;
      (function(Z3_ast_kind2) {
        Z3_ast_kind2[Z3_ast_kind2["Z3_NUMERAL_AST"] = 0] = "Z3_NUMERAL_AST";
        Z3_ast_kind2[Z3_ast_kind2["Z3_APP_AST"] = 1] = "Z3_APP_AST";
        Z3_ast_kind2[Z3_ast_kind2["Z3_VAR_AST"] = 2] = "Z3_VAR_AST";
        Z3_ast_kind2[Z3_ast_kind2["Z3_QUANTIFIER_AST"] = 3] = "Z3_QUANTIFIER_AST";
        Z3_ast_kind2[Z3_ast_kind2["Z3_SORT_AST"] = 4] = "Z3_SORT_AST";
        Z3_ast_kind2[Z3_ast_kind2["Z3_FUNC_DECL_AST"] = 5] = "Z3_FUNC_DECL_AST";
        Z3_ast_kind2[Z3_ast_kind2["Z3_UNKNOWN_AST"] = 1e3] = "Z3_UNKNOWN_AST";
      })(Z3_ast_kind || (exports.Z3_ast_kind = Z3_ast_kind = {}));
      var Z3_decl_kind;
      (function(Z3_decl_kind2) {
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_TRUE"] = 256] = "Z3_OP_TRUE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FALSE"] = 257] = "Z3_OP_FALSE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_EQ"] = 258] = "Z3_OP_EQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DISTINCT"] = 259] = "Z3_OP_DISTINCT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ITE"] = 260] = "Z3_OP_ITE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_AND"] = 261] = "Z3_OP_AND";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_OR"] = 262] = "Z3_OP_OR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_IFF"] = 263] = "Z3_OP_IFF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_XOR"] = 264] = "Z3_OP_XOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_NOT"] = 265] = "Z3_OP_NOT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_IMPLIES"] = 266] = "Z3_OP_IMPLIES";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_OEQ"] = 267] = "Z3_OP_OEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ANUM"] = 512] = "Z3_OP_ANUM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_AGNUM"] = 513] = "Z3_OP_AGNUM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_LE"] = 514] = "Z3_OP_LE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_GE"] = 515] = "Z3_OP_GE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_LT"] = 516] = "Z3_OP_LT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_GT"] = 517] = "Z3_OP_GT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ADD"] = 518] = "Z3_OP_ADD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SUB"] = 519] = "Z3_OP_SUB";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_UMINUS"] = 520] = "Z3_OP_UMINUS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_MUL"] = 521] = "Z3_OP_MUL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DIV"] = 522] = "Z3_OP_DIV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_IDIV"] = 523] = "Z3_OP_IDIV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_REM"] = 524] = "Z3_OP_REM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_MOD"] = 525] = "Z3_OP_MOD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_TO_REAL"] = 526] = "Z3_OP_TO_REAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_TO_INT"] = 527] = "Z3_OP_TO_INT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_IS_INT"] = 528] = "Z3_OP_IS_INT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_POWER"] = 529] = "Z3_OP_POWER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ABS"] = 530] = "Z3_OP_ABS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_STORE"] = 768] = "Z3_OP_STORE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SELECT"] = 769] = "Z3_OP_SELECT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CONST_ARRAY"] = 770] = "Z3_OP_CONST_ARRAY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ARRAY_MAP"] = 771] = "Z3_OP_ARRAY_MAP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ARRAY_DEFAULT"] = 772] = "Z3_OP_ARRAY_DEFAULT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SET_UNION"] = 773] = "Z3_OP_SET_UNION";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SET_INTERSECT"] = 774] = "Z3_OP_SET_INTERSECT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SET_DIFFERENCE"] = 775] = "Z3_OP_SET_DIFFERENCE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SET_COMPLEMENT"] = 776] = "Z3_OP_SET_COMPLEMENT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SET_SUBSET"] = 777] = "Z3_OP_SET_SUBSET";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_AS_ARRAY"] = 778] = "Z3_OP_AS_ARRAY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ARRAY_EXT"] = 779] = "Z3_OP_ARRAY_EXT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BNUM"] = 1024] = "Z3_OP_BNUM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BIT1"] = 1025] = "Z3_OP_BIT1";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BIT0"] = 1026] = "Z3_OP_BIT0";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BNEG"] = 1027] = "Z3_OP_BNEG";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BADD"] = 1028] = "Z3_OP_BADD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSUB"] = 1029] = "Z3_OP_BSUB";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BMUL"] = 1030] = "Z3_OP_BMUL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSDIV"] = 1031] = "Z3_OP_BSDIV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUDIV"] = 1032] = "Z3_OP_BUDIV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSREM"] = 1033] = "Z3_OP_BSREM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUREM"] = 1034] = "Z3_OP_BUREM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSMOD"] = 1035] = "Z3_OP_BSMOD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSDIV0"] = 1036] = "Z3_OP_BSDIV0";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUDIV0"] = 1037] = "Z3_OP_BUDIV0";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSREM0"] = 1038] = "Z3_OP_BSREM0";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUREM0"] = 1039] = "Z3_OP_BUREM0";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSMOD0"] = 1040] = "Z3_OP_BSMOD0";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ULEQ"] = 1041] = "Z3_OP_ULEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SLEQ"] = 1042] = "Z3_OP_SLEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_UGEQ"] = 1043] = "Z3_OP_UGEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SGEQ"] = 1044] = "Z3_OP_SGEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ULT"] = 1045] = "Z3_OP_ULT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SLT"] = 1046] = "Z3_OP_SLT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_UGT"] = 1047] = "Z3_OP_UGT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SGT"] = 1048] = "Z3_OP_SGT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BAND"] = 1049] = "Z3_OP_BAND";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BOR"] = 1050] = "Z3_OP_BOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BNOT"] = 1051] = "Z3_OP_BNOT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BXOR"] = 1052] = "Z3_OP_BXOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BNAND"] = 1053] = "Z3_OP_BNAND";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BNOR"] = 1054] = "Z3_OP_BNOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BXNOR"] = 1055] = "Z3_OP_BXNOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CONCAT"] = 1056] = "Z3_OP_CONCAT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SIGN_EXT"] = 1057] = "Z3_OP_SIGN_EXT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ZERO_EXT"] = 1058] = "Z3_OP_ZERO_EXT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_EXTRACT"] = 1059] = "Z3_OP_EXTRACT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_REPEAT"] = 1060] = "Z3_OP_REPEAT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BREDOR"] = 1061] = "Z3_OP_BREDOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BREDAND"] = 1062] = "Z3_OP_BREDAND";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BCOMP"] = 1063] = "Z3_OP_BCOMP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSHL"] = 1064] = "Z3_OP_BSHL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BLSHR"] = 1065] = "Z3_OP_BLSHR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BASHR"] = 1066] = "Z3_OP_BASHR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ROTATE_LEFT"] = 1067] = "Z3_OP_ROTATE_LEFT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_ROTATE_RIGHT"] = 1068] = "Z3_OP_ROTATE_RIGHT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_EXT_ROTATE_LEFT"] = 1069] = "Z3_OP_EXT_ROTATE_LEFT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_EXT_ROTATE_RIGHT"] = 1070] = "Z3_OP_EXT_ROTATE_RIGHT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BIT2BOOL"] = 1071] = "Z3_OP_BIT2BOOL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_INT2BV"] = 1072] = "Z3_OP_INT2BV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BV2INT"] = 1073] = "Z3_OP_BV2INT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SBV2INT"] = 1074] = "Z3_OP_SBV2INT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CARRY"] = 1075] = "Z3_OP_CARRY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_XOR3"] = 1076] = "Z3_OP_XOR3";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSMUL_NO_OVFL"] = 1077] = "Z3_OP_BSMUL_NO_OVFL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUMUL_NO_OVFL"] = 1078] = "Z3_OP_BUMUL_NO_OVFL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSMUL_NO_UDFL"] = 1079] = "Z3_OP_BSMUL_NO_UDFL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSDIV_I"] = 1080] = "Z3_OP_BSDIV_I";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUDIV_I"] = 1081] = "Z3_OP_BUDIV_I";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSREM_I"] = 1082] = "Z3_OP_BSREM_I";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BUREM_I"] = 1083] = "Z3_OP_BUREM_I";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_BSMOD_I"] = 1084] = "Z3_OP_BSMOD_I";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_UNDEF"] = 1280] = "Z3_OP_PR_UNDEF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_TRUE"] = 1281] = "Z3_OP_PR_TRUE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_ASSERTED"] = 1282] = "Z3_OP_PR_ASSERTED";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_GOAL"] = 1283] = "Z3_OP_PR_GOAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_MODUS_PONENS"] = 1284] = "Z3_OP_PR_MODUS_PONENS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_REFLEXIVITY"] = 1285] = "Z3_OP_PR_REFLEXIVITY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_SYMMETRY"] = 1286] = "Z3_OP_PR_SYMMETRY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_TRANSITIVITY"] = 1287] = "Z3_OP_PR_TRANSITIVITY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_TRANSITIVITY_STAR"] = 1288] = "Z3_OP_PR_TRANSITIVITY_STAR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_MONOTONICITY"] = 1289] = "Z3_OP_PR_MONOTONICITY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_QUANT_INTRO"] = 1290] = "Z3_OP_PR_QUANT_INTRO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_BIND"] = 1291] = "Z3_OP_PR_BIND";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_DISTRIBUTIVITY"] = 1292] = "Z3_OP_PR_DISTRIBUTIVITY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_AND_ELIM"] = 1293] = "Z3_OP_PR_AND_ELIM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_NOT_OR_ELIM"] = 1294] = "Z3_OP_PR_NOT_OR_ELIM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_REWRITE"] = 1295] = "Z3_OP_PR_REWRITE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_REWRITE_STAR"] = 1296] = "Z3_OP_PR_REWRITE_STAR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_PULL_QUANT"] = 1297] = "Z3_OP_PR_PULL_QUANT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_PUSH_QUANT"] = 1298] = "Z3_OP_PR_PUSH_QUANT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_ELIM_UNUSED_VARS"] = 1299] = "Z3_OP_PR_ELIM_UNUSED_VARS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_DER"] = 1300] = "Z3_OP_PR_DER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_QUANT_INST"] = 1301] = "Z3_OP_PR_QUANT_INST";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_HYPOTHESIS"] = 1302] = "Z3_OP_PR_HYPOTHESIS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_LEMMA"] = 1303] = "Z3_OP_PR_LEMMA";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_UNIT_RESOLUTION"] = 1304] = "Z3_OP_PR_UNIT_RESOLUTION";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_IFF_TRUE"] = 1305] = "Z3_OP_PR_IFF_TRUE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_IFF_FALSE"] = 1306] = "Z3_OP_PR_IFF_FALSE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_COMMUTATIVITY"] = 1307] = "Z3_OP_PR_COMMUTATIVITY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_DEF_AXIOM"] = 1308] = "Z3_OP_PR_DEF_AXIOM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_ASSUMPTION_ADD"] = 1309] = "Z3_OP_PR_ASSUMPTION_ADD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_LEMMA_ADD"] = 1310] = "Z3_OP_PR_LEMMA_ADD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_REDUNDANT_DEL"] = 1311] = "Z3_OP_PR_REDUNDANT_DEL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_CLAUSE_TRAIL"] = 1312] = "Z3_OP_PR_CLAUSE_TRAIL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_DEF_INTRO"] = 1313] = "Z3_OP_PR_DEF_INTRO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_APPLY_DEF"] = 1314] = "Z3_OP_PR_APPLY_DEF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_IFF_OEQ"] = 1315] = "Z3_OP_PR_IFF_OEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_NNF_POS"] = 1316] = "Z3_OP_PR_NNF_POS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_NNF_NEG"] = 1317] = "Z3_OP_PR_NNF_NEG";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_SKOLEMIZE"] = 1318] = "Z3_OP_PR_SKOLEMIZE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_MODUS_PONENS_OEQ"] = 1319] = "Z3_OP_PR_MODUS_PONENS_OEQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_TH_LEMMA"] = 1320] = "Z3_OP_PR_TH_LEMMA";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PR_HYPER_RESOLVE"] = 1321] = "Z3_OP_PR_HYPER_RESOLVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_STORE"] = 1536] = "Z3_OP_RA_STORE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_EMPTY"] = 1537] = "Z3_OP_RA_EMPTY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_IS_EMPTY"] = 1538] = "Z3_OP_RA_IS_EMPTY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_JOIN"] = 1539] = "Z3_OP_RA_JOIN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_UNION"] = 1540] = "Z3_OP_RA_UNION";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_WIDEN"] = 1541] = "Z3_OP_RA_WIDEN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_PROJECT"] = 1542] = "Z3_OP_RA_PROJECT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_FILTER"] = 1543] = "Z3_OP_RA_FILTER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_NEGATION_FILTER"] = 1544] = "Z3_OP_RA_NEGATION_FILTER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_RENAME"] = 1545] = "Z3_OP_RA_RENAME";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_COMPLEMENT"] = 1546] = "Z3_OP_RA_COMPLEMENT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_SELECT"] = 1547] = "Z3_OP_RA_SELECT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RA_CLONE"] = 1548] = "Z3_OP_RA_CLONE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FD_CONSTANT"] = 1549] = "Z3_OP_FD_CONSTANT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FD_LT"] = 1550] = "Z3_OP_FD_LT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_UNIT"] = 1551] = "Z3_OP_SEQ_UNIT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_EMPTY"] = 1552] = "Z3_OP_SEQ_EMPTY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_CONCAT"] = 1553] = "Z3_OP_SEQ_CONCAT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_PREFIX"] = 1554] = "Z3_OP_SEQ_PREFIX";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_SUFFIX"] = 1555] = "Z3_OP_SEQ_SUFFIX";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_CONTAINS"] = 1556] = "Z3_OP_SEQ_CONTAINS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_EXTRACT"] = 1557] = "Z3_OP_SEQ_EXTRACT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_REPLACE"] = 1558] = "Z3_OP_SEQ_REPLACE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_REPLACE_RE"] = 1559] = "Z3_OP_SEQ_REPLACE_RE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_REPLACE_RE_ALL"] = 1560] = "Z3_OP_SEQ_REPLACE_RE_ALL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_REPLACE_ALL"] = 1561] = "Z3_OP_SEQ_REPLACE_ALL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_AT"] = 1562] = "Z3_OP_SEQ_AT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_NTH"] = 1563] = "Z3_OP_SEQ_NTH";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_LENGTH"] = 1564] = "Z3_OP_SEQ_LENGTH";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_INDEX"] = 1565] = "Z3_OP_SEQ_INDEX";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_LAST_INDEX"] = 1566] = "Z3_OP_SEQ_LAST_INDEX";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_TO_RE"] = 1567] = "Z3_OP_SEQ_TO_RE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_IN_RE"] = 1568] = "Z3_OP_SEQ_IN_RE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_MAP"] = 1569] = "Z3_OP_SEQ_MAP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_MAPI"] = 1570] = "Z3_OP_SEQ_MAPI";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_FOLDL"] = 1571] = "Z3_OP_SEQ_FOLDL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SEQ_FOLDLI"] = 1572] = "Z3_OP_SEQ_FOLDLI";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_STR_TO_INT"] = 1573] = "Z3_OP_STR_TO_INT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_INT_TO_STR"] = 1574] = "Z3_OP_INT_TO_STR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_UBV_TO_STR"] = 1575] = "Z3_OP_UBV_TO_STR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SBV_TO_STR"] = 1576] = "Z3_OP_SBV_TO_STR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_STR_TO_CODE"] = 1577] = "Z3_OP_STR_TO_CODE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_STR_FROM_CODE"] = 1578] = "Z3_OP_STR_FROM_CODE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_STRING_LT"] = 1579] = "Z3_OP_STRING_LT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_STRING_LE"] = 1580] = "Z3_OP_STRING_LE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_PLUS"] = 1581] = "Z3_OP_RE_PLUS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_STAR"] = 1582] = "Z3_OP_RE_STAR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_OPTION"] = 1583] = "Z3_OP_RE_OPTION";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_CONCAT"] = 1584] = "Z3_OP_RE_CONCAT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_UNION"] = 1585] = "Z3_OP_RE_UNION";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_RANGE"] = 1586] = "Z3_OP_RE_RANGE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_DIFF"] = 1587] = "Z3_OP_RE_DIFF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_INTERSECT"] = 1588] = "Z3_OP_RE_INTERSECT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_LOOP"] = 1589] = "Z3_OP_RE_LOOP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_POWER"] = 1590] = "Z3_OP_RE_POWER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_COMPLEMENT"] = 1591] = "Z3_OP_RE_COMPLEMENT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_EMPTY_SET"] = 1592] = "Z3_OP_RE_EMPTY_SET";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_FULL_SET"] = 1593] = "Z3_OP_RE_FULL_SET";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_FULL_CHAR_SET"] = 1594] = "Z3_OP_RE_FULL_CHAR_SET";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_OF_PRED"] = 1595] = "Z3_OP_RE_OF_PRED";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_REVERSE"] = 1596] = "Z3_OP_RE_REVERSE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RE_DERIVATIVE"] = 1597] = "Z3_OP_RE_DERIVATIVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CHAR_CONST"] = 1598] = "Z3_OP_CHAR_CONST";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CHAR_LE"] = 1599] = "Z3_OP_CHAR_LE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CHAR_TO_INT"] = 1600] = "Z3_OP_CHAR_TO_INT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CHAR_TO_BV"] = 1601] = "Z3_OP_CHAR_TO_BV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CHAR_FROM_BV"] = 1602] = "Z3_OP_CHAR_FROM_BV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_CHAR_IS_DIGIT"] = 1603] = "Z3_OP_CHAR_IS_DIGIT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_LABEL"] = 1792] = "Z3_OP_LABEL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_LABEL_LIT"] = 1793] = "Z3_OP_LABEL_LIT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DT_CONSTRUCTOR"] = 2048] = "Z3_OP_DT_CONSTRUCTOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DT_RECOGNISER"] = 2049] = "Z3_OP_DT_RECOGNISER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DT_IS"] = 2050] = "Z3_OP_DT_IS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DT_ACCESSOR"] = 2051] = "Z3_OP_DT_ACCESSOR";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_DT_UPDATE_FIELD"] = 2052] = "Z3_OP_DT_UPDATE_FIELD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PB_AT_MOST"] = 2304] = "Z3_OP_PB_AT_MOST";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PB_AT_LEAST"] = 2305] = "Z3_OP_PB_AT_LEAST";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PB_LE"] = 2306] = "Z3_OP_PB_LE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PB_GE"] = 2307] = "Z3_OP_PB_GE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_PB_EQ"] = 2308] = "Z3_OP_PB_EQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SPECIAL_RELATION_LO"] = 40960] = "Z3_OP_SPECIAL_RELATION_LO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SPECIAL_RELATION_PO"] = 40961] = "Z3_OP_SPECIAL_RELATION_PO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SPECIAL_RELATION_PLO"] = 40962] = "Z3_OP_SPECIAL_RELATION_PLO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SPECIAL_RELATION_TO"] = 40963] = "Z3_OP_SPECIAL_RELATION_TO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SPECIAL_RELATION_TC"] = 40964] = "Z3_OP_SPECIAL_RELATION_TC";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_SPECIAL_RELATION_TRC"] = 40965] = "Z3_OP_SPECIAL_RELATION_TRC";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_RM_NEAREST_TIES_TO_EVEN"] = 45056] = "Z3_OP_FPA_RM_NEAREST_TIES_TO_EVEN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_RM_NEAREST_TIES_TO_AWAY"] = 45057] = "Z3_OP_FPA_RM_NEAREST_TIES_TO_AWAY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_RM_TOWARD_POSITIVE"] = 45058] = "Z3_OP_FPA_RM_TOWARD_POSITIVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_RM_TOWARD_NEGATIVE"] = 45059] = "Z3_OP_FPA_RM_TOWARD_NEGATIVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_RM_TOWARD_ZERO"] = 45060] = "Z3_OP_FPA_RM_TOWARD_ZERO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_NUM"] = 45061] = "Z3_OP_FPA_NUM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_PLUS_INF"] = 45062] = "Z3_OP_FPA_PLUS_INF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_MINUS_INF"] = 45063] = "Z3_OP_FPA_MINUS_INF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_NAN"] = 45064] = "Z3_OP_FPA_NAN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_PLUS_ZERO"] = 45065] = "Z3_OP_FPA_PLUS_ZERO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_MINUS_ZERO"] = 45066] = "Z3_OP_FPA_MINUS_ZERO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_ADD"] = 45067] = "Z3_OP_FPA_ADD";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_SUB"] = 45068] = "Z3_OP_FPA_SUB";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_NEG"] = 45069] = "Z3_OP_FPA_NEG";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_MUL"] = 45070] = "Z3_OP_FPA_MUL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_DIV"] = 45071] = "Z3_OP_FPA_DIV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_REM"] = 45072] = "Z3_OP_FPA_REM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_ABS"] = 45073] = "Z3_OP_FPA_ABS";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_MIN"] = 45074] = "Z3_OP_FPA_MIN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_MAX"] = 45075] = "Z3_OP_FPA_MAX";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_FMA"] = 45076] = "Z3_OP_FPA_FMA";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_SQRT"] = 45077] = "Z3_OP_FPA_SQRT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_ROUND_TO_INTEGRAL"] = 45078] = "Z3_OP_FPA_ROUND_TO_INTEGRAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_EQ"] = 45079] = "Z3_OP_FPA_EQ";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_LT"] = 45080] = "Z3_OP_FPA_LT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_GT"] = 45081] = "Z3_OP_FPA_GT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_LE"] = 45082] = "Z3_OP_FPA_LE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_GE"] = 45083] = "Z3_OP_FPA_GE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_NAN"] = 45084] = "Z3_OP_FPA_IS_NAN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_INF"] = 45085] = "Z3_OP_FPA_IS_INF";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_ZERO"] = 45086] = "Z3_OP_FPA_IS_ZERO";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_NORMAL"] = 45087] = "Z3_OP_FPA_IS_NORMAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_SUBNORMAL"] = 45088] = "Z3_OP_FPA_IS_SUBNORMAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_NEGATIVE"] = 45089] = "Z3_OP_FPA_IS_NEGATIVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_IS_POSITIVE"] = 45090] = "Z3_OP_FPA_IS_POSITIVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_FP"] = 45091] = "Z3_OP_FPA_FP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_TO_FP"] = 45092] = "Z3_OP_FPA_TO_FP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_TO_FP_UNSIGNED"] = 45093] = "Z3_OP_FPA_TO_FP_UNSIGNED";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_TO_UBV"] = 45094] = "Z3_OP_FPA_TO_UBV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_TO_SBV"] = 45095] = "Z3_OP_FPA_TO_SBV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_TO_REAL"] = 45096] = "Z3_OP_FPA_TO_REAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_TO_IEEE_BV"] = 45097] = "Z3_OP_FPA_TO_IEEE_BV";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_BVWRAP"] = 45098] = "Z3_OP_FPA_BVWRAP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FPA_BV2RM"] = 45099] = "Z3_OP_FPA_BV2RM";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_EMPTY"] = 49152] = "Z3_OP_FINITE_SET_EMPTY";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_SINGLETON"] = 49153] = "Z3_OP_FINITE_SET_SINGLETON";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_UNION"] = 49154] = "Z3_OP_FINITE_SET_UNION";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_INTERSECT"] = 49155] = "Z3_OP_FINITE_SET_INTERSECT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_DIFFERENCE"] = 49156] = "Z3_OP_FINITE_SET_DIFFERENCE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_IN"] = 49157] = "Z3_OP_FINITE_SET_IN";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_SIZE"] = 49158] = "Z3_OP_FINITE_SET_SIZE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_SUBSET"] = 49159] = "Z3_OP_FINITE_SET_SUBSET";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_MAP"] = 49160] = "Z3_OP_FINITE_SET_MAP";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_FILTER"] = 49161] = "Z3_OP_FINITE_SET_FILTER";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_RANGE"] = 49162] = "Z3_OP_FINITE_SET_RANGE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_EXT"] = 49163] = "Z3_OP_FINITE_SET_EXT";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_FINITE_SET_MAP_INVERSE"] = 49164] = "Z3_OP_FINITE_SET_MAP_INVERSE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_INTERNAL"] = 49165] = "Z3_OP_INTERNAL";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_RECURSIVE"] = 49166] = "Z3_OP_RECURSIVE";
        Z3_decl_kind2[Z3_decl_kind2["Z3_OP_UNINTERPRETED"] = 49167] = "Z3_OP_UNINTERPRETED";
      })(Z3_decl_kind || (exports.Z3_decl_kind = Z3_decl_kind = {}));
      var Z3_param_kind;
      (function(Z3_param_kind2) {
        Z3_param_kind2[Z3_param_kind2["Z3_PK_UINT"] = 0] = "Z3_PK_UINT";
        Z3_param_kind2[Z3_param_kind2["Z3_PK_BOOL"] = 1] = "Z3_PK_BOOL";
        Z3_param_kind2[Z3_param_kind2["Z3_PK_DOUBLE"] = 2] = "Z3_PK_DOUBLE";
        Z3_param_kind2[Z3_param_kind2["Z3_PK_SYMBOL"] = 3] = "Z3_PK_SYMBOL";
        Z3_param_kind2[Z3_param_kind2["Z3_PK_STRING"] = 4] = "Z3_PK_STRING";
        Z3_param_kind2[Z3_param_kind2["Z3_PK_OTHER"] = 5] = "Z3_PK_OTHER";
        Z3_param_kind2[Z3_param_kind2["Z3_PK_INVALID"] = 6] = "Z3_PK_INVALID";
      })(Z3_param_kind || (exports.Z3_param_kind = Z3_param_kind = {}));
      var Z3_ast_print_mode;
      (function(Z3_ast_print_mode2) {
        Z3_ast_print_mode2[Z3_ast_print_mode2["Z3_PRINT_SMTLIB_FULL"] = 0] = "Z3_PRINT_SMTLIB_FULL";
        Z3_ast_print_mode2[Z3_ast_print_mode2["Z3_PRINT_LOW_LEVEL"] = 1] = "Z3_PRINT_LOW_LEVEL";
        Z3_ast_print_mode2[Z3_ast_print_mode2["Z3_PRINT_SMTLIB2_COMPLIANT"] = 2] = "Z3_PRINT_SMTLIB2_COMPLIANT";
      })(Z3_ast_print_mode || (exports.Z3_ast_print_mode = Z3_ast_print_mode = {}));
      var Z3_error_code;
      (function(Z3_error_code2) {
        Z3_error_code2[Z3_error_code2["Z3_OK"] = 0] = "Z3_OK";
        Z3_error_code2[Z3_error_code2["Z3_SORT_ERROR"] = 1] = "Z3_SORT_ERROR";
        Z3_error_code2[Z3_error_code2["Z3_IOB"] = 2] = "Z3_IOB";
        Z3_error_code2[Z3_error_code2["Z3_INVALID_ARG"] = 3] = "Z3_INVALID_ARG";
        Z3_error_code2[Z3_error_code2["Z3_PARSER_ERROR"] = 4] = "Z3_PARSER_ERROR";
        Z3_error_code2[Z3_error_code2["Z3_NO_PARSER"] = 5] = "Z3_NO_PARSER";
        Z3_error_code2[Z3_error_code2["Z3_INVALID_PATTERN"] = 6] = "Z3_INVALID_PATTERN";
        Z3_error_code2[Z3_error_code2["Z3_MEMOUT_FAIL"] = 7] = "Z3_MEMOUT_FAIL";
        Z3_error_code2[Z3_error_code2["Z3_FILE_ACCESS_ERROR"] = 8] = "Z3_FILE_ACCESS_ERROR";
        Z3_error_code2[Z3_error_code2["Z3_INTERNAL_FATAL"] = 9] = "Z3_INTERNAL_FATAL";
        Z3_error_code2[Z3_error_code2["Z3_INVALID_USAGE"] = 10] = "Z3_INVALID_USAGE";
        Z3_error_code2[Z3_error_code2["Z3_DEC_REF_ERROR"] = 11] = "Z3_DEC_REF_ERROR";
        Z3_error_code2[Z3_error_code2["Z3_EXCEPTION"] = 12] = "Z3_EXCEPTION";
      })(Z3_error_code || (exports.Z3_error_code = Z3_error_code = {}));
      var Z3_goal_prec;
      (function(Z3_goal_prec2) {
        Z3_goal_prec2[Z3_goal_prec2["Z3_GOAL_PRECISE"] = 0] = "Z3_GOAL_PRECISE";
        Z3_goal_prec2[Z3_goal_prec2["Z3_GOAL_UNDER"] = 1] = "Z3_GOAL_UNDER";
        Z3_goal_prec2[Z3_goal_prec2["Z3_GOAL_OVER"] = 2] = "Z3_GOAL_OVER";
        Z3_goal_prec2[Z3_goal_prec2["Z3_GOAL_UNDER_OVER"] = 3] = "Z3_GOAL_UNDER_OVER";
      })(Z3_goal_prec || (exports.Z3_goal_prec = Z3_goal_prec = {}));
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/low-level/wrapper.__GENERATED__.js
  var require_wrapper_GENERATED = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/low-level/wrapper.__GENERATED__.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.init = init3;
      async function init3(initModule, moduleOverrides = {}) {
        let Mod = await initModule(moduleOverrides);
        function intArrayToByteArr(ints) {
          return new Uint8Array(new Uint32Array(ints).buffer);
        }
        function boolArrayToByteArr(bools) {
          return bools.map((b) => b ? 1 : 0);
        }
        function readUintArray(address, count) {
          return Array.from(new Uint32Array(Mod.HEAPU32.buffer, address, count));
        }
        let outAddress = Mod._malloc(24);
        let outUintArray = new Uint32Array(Mod.HEAPU32.buffer, outAddress, 6);
        let getOutUint = (i) => outUintArray[i];
        let outIntArray = new Int32Array(Mod.HEAPU32.buffer, outAddress, 6);
        let getOutInt = (i) => outIntArray[i];
        let outUint64Array = new BigUint64Array(Mod.HEAPU32.buffer, outAddress, 3);
        let getOutUint64 = (i) => outUint64Array[i];
        let outInt64Array = new BigInt64Array(Mod.HEAPU32.buffer, outAddress, 3);
        let getOutInt64 = (i) => outInt64Array[i];
        return {
          em: Mod,
          Z3: {
            mk_context: function(c) {
              let ctx = Mod._Z3_mk_context(c);
              Mod._set_noop_error_handler(ctx);
              return ctx;
            },
            mk_context_rc: function(c) {
              let ctx = Mod._Z3_mk_context_rc(c);
              Mod._set_noop_error_handler(ctx);
              return ctx;
            },
            global_param_set: function(param_id, param_value) {
              return Mod.ccall("Z3_global_param_set", "void", ["string", "string"], [param_id, param_value]);
            },
            global_param_reset_all: Mod._Z3_global_param_reset_all,
            global_param_get: function(param_id) {
              let ret = Mod.ccall("Z3_global_param_get", "boolean", ["string", "number"], [param_id, outAddress]);
              if (!ret) {
                return null;
              }
              return Mod.UTF8ToString(getOutUint(0));
            },
            mk_config: Mod._Z3_mk_config,
            del_config: Mod._Z3_del_config,
            set_param_value: function(c, param_id, param_value) {
              return Mod.ccall("Z3_set_param_value", "void", ["number", "string", "string"], [c, param_id, param_value]);
            },
            del_context: Mod._Z3_del_context,
            inc_ref: Mod._Z3_inc_ref,
            dec_ref: Mod._Z3_dec_ref,
            update_param_value: function(c, param_id, param_value) {
              return Mod.ccall("Z3_update_param_value", "void", ["number", "string", "string"], [c, param_id, param_value]);
            },
            get_global_param_descrs: Mod._Z3_get_global_param_descrs,
            interrupt: Mod._Z3_interrupt,
            enable_concurrent_dec_ref: Mod._Z3_enable_concurrent_dec_ref,
            mk_params: Mod._Z3_mk_params,
            params_inc_ref: Mod._Z3_params_inc_ref,
            params_dec_ref: Mod._Z3_params_dec_ref,
            params_set_bool: Mod._Z3_params_set_bool,
            params_set_uint: Mod._Z3_params_set_uint,
            params_set_double: Mod._Z3_params_set_double,
            params_set_symbol: Mod._Z3_params_set_symbol,
            params_to_string: function(c, p) {
              return Mod.ccall("Z3_params_to_string", "string", ["number", "number"], [c, p]);
            },
            params_validate: Mod._Z3_params_validate,
            param_descrs_inc_ref: Mod._Z3_param_descrs_inc_ref,
            param_descrs_dec_ref: Mod._Z3_param_descrs_dec_ref,
            param_descrs_get_kind: Mod._Z3_param_descrs_get_kind,
            param_descrs_size: function(c, p) {
              let ret = Mod.ccall("Z3_param_descrs_size", "number", ["number", "number"], [c, p]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            param_descrs_get_name: Mod._Z3_param_descrs_get_name,
            param_descrs_get_documentation: function(c, p, s) {
              return Mod.ccall("Z3_param_descrs_get_documentation", "string", ["number", "number", "number"], [c, p, s]);
            },
            param_descrs_to_string: function(c, p) {
              return Mod.ccall("Z3_param_descrs_to_string", "string", ["number", "number"], [c, p]);
            },
            mk_int_symbol: Mod._Z3_mk_int_symbol,
            mk_string_symbol: function(c, s) {
              return Mod.ccall("Z3_mk_string_symbol", "number", ["number", "string"], [c, s]);
            },
            mk_uninterpreted_sort: Mod._Z3_mk_uninterpreted_sort,
            mk_type_variable: Mod._Z3_mk_type_variable,
            mk_bool_sort: Mod._Z3_mk_bool_sort,
            mk_int_sort: Mod._Z3_mk_int_sort,
            mk_real_sort: Mod._Z3_mk_real_sort,
            mk_bv_sort: Mod._Z3_mk_bv_sort,
            mk_finite_domain_sort: Mod._Z3_mk_finite_domain_sort,
            mk_array_sort: Mod._Z3_mk_array_sort,
            mk_array_sort_n: function(c, domain, range) {
              return Mod.ccall("Z3_mk_array_sort_n", "number", ["number", "number", "array", "number"], [
                c,
                domain.length,
                intArrayToByteArr(domain),
                range
              ]);
            },
            mk_tuple_sort: function(c, mk_tuple_name, field_names, field_sorts) {
              if (field_names.length !== field_sorts.length) {
                throw new TypeError(`field_names and field_sorts must be the same length (got ${field_names.length} and {field_sorts.length})`);
              }
              let outArray_proj_decl = Mod._malloc(4 * field_names.length);
              try {
                let ret = Mod.ccall("Z3_mk_tuple_sort", "number", [
                  "number",
                  "number",
                  "number",
                  "array",
                  "array",
                  "number",
                  "number"
                ], [
                  c,
                  mk_tuple_name,
                  field_names.length,
                  intArrayToByteArr(field_names),
                  intArrayToByteArr(field_sorts),
                  outAddress,
                  outArray_proj_decl
                ]);
                return {
                  rv: ret,
                  mk_tuple_decl: getOutUint(0),
                  proj_decl: readUintArray(outArray_proj_decl, field_names.length)
                };
              } finally {
                Mod._free(outArray_proj_decl);
              }
            },
            mk_enumeration_sort: function(c, name, enum_names) {
              let outArray_enum_consts = Mod._malloc(4 * enum_names.length);
              try {
                let outArray_enum_testers = Mod._malloc(4 * enum_names.length);
                try {
                  let ret = Mod.ccall("Z3_mk_enumeration_sort", "number", ["number", "number", "number", "array", "number", "number"], [
                    c,
                    name,
                    enum_names.length,
                    intArrayToByteArr(enum_names),
                    outArray_enum_consts,
                    outArray_enum_testers
                  ]);
                  return {
                    rv: ret,
                    enum_consts: readUintArray(outArray_enum_consts, enum_names.length),
                    enum_testers: readUintArray(outArray_enum_testers, enum_names.length)
                  };
                } finally {
                  Mod._free(outArray_enum_testers);
                }
              } finally {
                Mod._free(outArray_enum_consts);
              }
            },
            mk_list_sort: function(c, name, elem_sort) {
              let ret = Mod.ccall("Z3_mk_list_sort", "number", [
                "number",
                "number",
                "number",
                "number",
                "number",
                "number",
                "number",
                "number",
                "number"
              ], [
                c,
                name,
                elem_sort,
                outAddress,
                outAddress + 4,
                outAddress + 8,
                outAddress + 12,
                outAddress + 16,
                outAddress + 20
              ]);
              return {
                rv: ret,
                nil_decl: getOutUint(0),
                is_nil_decl: getOutUint(1),
                cons_decl: getOutUint(2),
                is_cons_decl: getOutUint(3),
                head_decl: getOutUint(4),
                tail_decl: getOutUint(5)
              };
            },
            mk_constructor: function(c, name, recognizer, field_names, sorts, sort_refs) {
              if (field_names.length !== sorts.length) {
                throw new TypeError(`field_names and sorts must be the same length (got ${field_names.length} and {sorts.length})`);
              }
              if (field_names.length !== sort_refs.length) {
                throw new TypeError(`field_names and sort_refs must be the same length (got ${field_names.length} and {sort_refs.length})`);
              }
              return Mod.ccall("Z3_mk_constructor", "number", ["number", "number", "number", "number", "array", "array", "array"], [
                c,
                name,
                recognizer,
                field_names.length,
                intArrayToByteArr(field_names),
                intArrayToByteArr(sorts),
                intArrayToByteArr(sort_refs)
              ]);
            },
            constructor_num_fields: function(c, constr) {
              let ret = Mod.ccall("Z3_constructor_num_fields", "number", ["number", "number"], [c, constr]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            del_constructor: Mod._Z3_del_constructor,
            mk_datatype: function(c, name, constructors) {
              return Mod.ccall("Z3_mk_datatype", "number", ["number", "number", "number", "array"], [
                c,
                name,
                constructors.length,
                intArrayToByteArr(constructors)
              ]);
            },
            mk_polymorphic_datatype: function(c, name, parameters, constructors) {
              return Mod.ccall("Z3_mk_polymorphic_datatype", "number", ["number", "number", "number", "array", "number", "array"], [
                c,
                name,
                parameters.length,
                intArrayToByteArr(parameters),
                constructors.length,
                intArrayToByteArr(constructors)
              ]);
            },
            mk_datatype_sort: function(c, name, params) {
              return Mod.ccall("Z3_mk_datatype_sort", "number", ["number", "number", "number", "array"], [
                c,
                name,
                params.length,
                intArrayToByteArr(params)
              ]);
            },
            mk_constructor_list: function(c, constructors) {
              return Mod.ccall("Z3_mk_constructor_list", "number", ["number", "number", "array"], [
                c,
                constructors.length,
                intArrayToByteArr(constructors)
              ]);
            },
            del_constructor_list: Mod._Z3_del_constructor_list,
            mk_datatypes: function(c, sort_names, constructor_lists) {
              if (sort_names.length !== constructor_lists.length) {
                throw new TypeError(`sort_names and constructor_lists must be the same length (got ${sort_names.length} and {constructor_lists.length})`);
              }
              let outArray_sorts = Mod._malloc(4 * sort_names.length);
              try {
                let ret = Mod.ccall("Z3_mk_datatypes", "void", ["number", "number", "array", "number", "array"], [
                  c,
                  sort_names.length,
                  intArrayToByteArr(sort_names),
                  outArray_sorts,
                  intArrayToByteArr(constructor_lists)
                ]);
                return readUintArray(outArray_sorts, sort_names.length);
              } finally {
                Mod._free(outArray_sorts);
              }
            },
            query_constructor: function(c, constr, num_fields) {
              let outArray_accessors = Mod._malloc(4 * num_fields);
              try {
                let ret = Mod.ccall("Z3_query_constructor", "void", ["number", "number", "number", "number", "number", "number"], [
                  c,
                  constr,
                  num_fields,
                  outAddress,
                  outAddress + 4,
                  outArray_accessors
                ]);
                return {
                  constructor: getOutUint(0),
                  tester: getOutUint(1),
                  accessors: readUintArray(outArray_accessors, num_fields)
                };
              } finally {
                Mod._free(outArray_accessors);
              }
            },
            mk_func_decl: function(c, s, domain, range) {
              return Mod.ccall("Z3_mk_func_decl", "number", ["number", "number", "number", "array", "number"], [
                c,
                s,
                domain.length,
                intArrayToByteArr(domain),
                range
              ]);
            },
            mk_app: function(c, d, args) {
              return Mod.ccall("Z3_mk_app", "number", ["number", "number", "number", "array"], [c, d, args.length, intArrayToByteArr(args)]);
            },
            mk_const: Mod._Z3_mk_const,
            mk_fresh_func_decl: function(c, prefix, domain, range) {
              return Mod.ccall("Z3_mk_fresh_func_decl", "number", ["number", "string", "number", "array", "number"], [
                c,
                prefix,
                domain.length,
                intArrayToByteArr(domain),
                range
              ]);
            },
            mk_fresh_const: function(c, prefix, ty) {
              return Mod.ccall("Z3_mk_fresh_const", "number", ["number", "string", "number"], [c, prefix, ty]);
            },
            mk_rec_func_decl: function(c, s, domain, range) {
              return Mod.ccall("Z3_mk_rec_func_decl", "number", ["number", "number", "number", "array", "number"], [
                c,
                s,
                domain.length,
                intArrayToByteArr(domain),
                range
              ]);
            },
            add_rec_def: function(c, f, args, body) {
              return Mod.ccall("Z3_add_rec_def", "void", ["number", "number", "number", "array", "number"], [
                c,
                f,
                args.length,
                intArrayToByteArr(args),
                body
              ]);
            },
            mk_true: Mod._Z3_mk_true,
            mk_false: Mod._Z3_mk_false,
            mk_eq: Mod._Z3_mk_eq,
            mk_distinct: function(c, args) {
              return Mod.ccall("Z3_mk_distinct", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_not: Mod._Z3_mk_not,
            mk_ite: Mod._Z3_mk_ite,
            mk_iff: Mod._Z3_mk_iff,
            mk_implies: Mod._Z3_mk_implies,
            mk_xor: Mod._Z3_mk_xor,
            mk_and: function(c, args) {
              return Mod.ccall("Z3_mk_and", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_or: function(c, args) {
              return Mod.ccall("Z3_mk_or", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_add: function(c, args) {
              return Mod.ccall("Z3_mk_add", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_mul: function(c, args) {
              return Mod.ccall("Z3_mk_mul", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_sub: function(c, args) {
              return Mod.ccall("Z3_mk_sub", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_unary_minus: Mod._Z3_mk_unary_minus,
            mk_div: Mod._Z3_mk_div,
            mk_mod: Mod._Z3_mk_mod,
            mk_rem: Mod._Z3_mk_rem,
            mk_power: Mod._Z3_mk_power,
            mk_abs: Mod._Z3_mk_abs,
            mk_lt: Mod._Z3_mk_lt,
            mk_le: Mod._Z3_mk_le,
            mk_gt: Mod._Z3_mk_gt,
            mk_ge: Mod._Z3_mk_ge,
            mk_divides: Mod._Z3_mk_divides,
            mk_int2real: Mod._Z3_mk_int2real,
            mk_real2int: Mod._Z3_mk_real2int,
            mk_is_int: Mod._Z3_mk_is_int,
            mk_bvnot: Mod._Z3_mk_bvnot,
            mk_bvredand: Mod._Z3_mk_bvredand,
            mk_bvredor: Mod._Z3_mk_bvredor,
            mk_bvand: Mod._Z3_mk_bvand,
            mk_bvor: Mod._Z3_mk_bvor,
            mk_bvxor: Mod._Z3_mk_bvxor,
            mk_bvnand: Mod._Z3_mk_bvnand,
            mk_bvnor: Mod._Z3_mk_bvnor,
            mk_bvxnor: Mod._Z3_mk_bvxnor,
            mk_bvneg: Mod._Z3_mk_bvneg,
            mk_bvadd: Mod._Z3_mk_bvadd,
            mk_bvsub: Mod._Z3_mk_bvsub,
            mk_bvmul: Mod._Z3_mk_bvmul,
            mk_bvudiv: Mod._Z3_mk_bvudiv,
            mk_bvsdiv: Mod._Z3_mk_bvsdiv,
            mk_bvurem: Mod._Z3_mk_bvurem,
            mk_bvsrem: Mod._Z3_mk_bvsrem,
            mk_bvsmod: Mod._Z3_mk_bvsmod,
            mk_bvult: Mod._Z3_mk_bvult,
            mk_bvslt: Mod._Z3_mk_bvslt,
            mk_bvule: Mod._Z3_mk_bvule,
            mk_bvsle: Mod._Z3_mk_bvsle,
            mk_bvuge: Mod._Z3_mk_bvuge,
            mk_bvsge: Mod._Z3_mk_bvsge,
            mk_bvugt: Mod._Z3_mk_bvugt,
            mk_bvsgt: Mod._Z3_mk_bvsgt,
            mk_concat: Mod._Z3_mk_concat,
            mk_extract: Mod._Z3_mk_extract,
            mk_sign_ext: Mod._Z3_mk_sign_ext,
            mk_zero_ext: Mod._Z3_mk_zero_ext,
            mk_repeat: Mod._Z3_mk_repeat,
            mk_bit2bool: Mod._Z3_mk_bit2bool,
            mk_bvshl: Mod._Z3_mk_bvshl,
            mk_bvlshr: Mod._Z3_mk_bvlshr,
            mk_bvashr: Mod._Z3_mk_bvashr,
            mk_rotate_left: Mod._Z3_mk_rotate_left,
            mk_rotate_right: Mod._Z3_mk_rotate_right,
            mk_ext_rotate_left: Mod._Z3_mk_ext_rotate_left,
            mk_ext_rotate_right: Mod._Z3_mk_ext_rotate_right,
            mk_int2bv: Mod._Z3_mk_int2bv,
            mk_bv2int: Mod._Z3_mk_bv2int,
            mk_bvadd_no_overflow: Mod._Z3_mk_bvadd_no_overflow,
            mk_bvadd_no_underflow: Mod._Z3_mk_bvadd_no_underflow,
            mk_bvsub_no_overflow: Mod._Z3_mk_bvsub_no_overflow,
            mk_bvsub_no_underflow: Mod._Z3_mk_bvsub_no_underflow,
            mk_bvsdiv_no_overflow: Mod._Z3_mk_bvsdiv_no_overflow,
            mk_bvneg_no_overflow: Mod._Z3_mk_bvneg_no_overflow,
            mk_bvmul_no_overflow: Mod._Z3_mk_bvmul_no_overflow,
            mk_bvmul_no_underflow: Mod._Z3_mk_bvmul_no_underflow,
            mk_select: Mod._Z3_mk_select,
            mk_select_n: function(c, a, idxs) {
              return Mod.ccall("Z3_mk_select_n", "number", ["number", "number", "number", "array"], [c, a, idxs.length, intArrayToByteArr(idxs)]);
            },
            mk_store: Mod._Z3_mk_store,
            mk_store_n: function(c, a, idxs, v) {
              return Mod.ccall("Z3_mk_store_n", "number", ["number", "number", "number", "array", "number"], [
                c,
                a,
                idxs.length,
                intArrayToByteArr(idxs),
                v
              ]);
            },
            mk_const_array: Mod._Z3_mk_const_array,
            mk_map: function(c, f, args) {
              return Mod.ccall("Z3_mk_map", "number", ["number", "number", "number", "array"], [c, f, args.length, intArrayToByteArr(args)]);
            },
            mk_array_default: Mod._Z3_mk_array_default,
            mk_as_array: Mod._Z3_mk_as_array,
            mk_set_sort: Mod._Z3_mk_set_sort,
            mk_empty_set: Mod._Z3_mk_empty_set,
            mk_full_set: Mod._Z3_mk_full_set,
            mk_set_add: Mod._Z3_mk_set_add,
            mk_set_del: Mod._Z3_mk_set_del,
            mk_set_union: function(c, args) {
              return Mod.ccall("Z3_mk_set_union", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_set_intersect: function(c, args) {
              return Mod.ccall("Z3_mk_set_intersect", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_set_difference: Mod._Z3_mk_set_difference,
            mk_set_complement: Mod._Z3_mk_set_complement,
            mk_set_member: Mod._Z3_mk_set_member,
            mk_set_subset: Mod._Z3_mk_set_subset,
            mk_array_ext: Mod._Z3_mk_array_ext,
            mk_finite_set_sort: Mod._Z3_mk_finite_set_sort,
            is_finite_set_sort: function(c, s) {
              return Mod.ccall("Z3_is_finite_set_sort", "boolean", ["number", "number"], [c, s]);
            },
            get_finite_set_sort_basis: Mod._Z3_get_finite_set_sort_basis,
            mk_finite_set_empty: Mod._Z3_mk_finite_set_empty,
            mk_finite_set_singleton: Mod._Z3_mk_finite_set_singleton,
            mk_finite_set_union: Mod._Z3_mk_finite_set_union,
            mk_finite_set_intersect: Mod._Z3_mk_finite_set_intersect,
            mk_finite_set_difference: Mod._Z3_mk_finite_set_difference,
            mk_finite_set_member: Mod._Z3_mk_finite_set_member,
            mk_finite_set_size: Mod._Z3_mk_finite_set_size,
            mk_finite_set_subset: Mod._Z3_mk_finite_set_subset,
            mk_finite_set_map: Mod._Z3_mk_finite_set_map,
            mk_finite_set_filter: Mod._Z3_mk_finite_set_filter,
            mk_finite_set_range: Mod._Z3_mk_finite_set_range,
            mk_numeral: function(c, numeral, ty) {
              return Mod.ccall("Z3_mk_numeral", "number", ["number", "string", "number"], [c, numeral, ty]);
            },
            mk_real: Mod._Z3_mk_real,
            mk_real_int64: Mod._Z3_mk_real_int64,
            mk_int: Mod._Z3_mk_int,
            mk_unsigned_int: Mod._Z3_mk_unsigned_int,
            mk_int64: Mod._Z3_mk_int64,
            mk_unsigned_int64: Mod._Z3_mk_unsigned_int64,
            mk_bv_numeral: function(c, bits) {
              return Mod.ccall("Z3_mk_bv_numeral", "number", ["number", "number", "array"], [c, bits.length, boolArrayToByteArr(bits)]);
            },
            mk_seq_sort: Mod._Z3_mk_seq_sort,
            is_seq_sort: function(c, s) {
              return Mod.ccall("Z3_is_seq_sort", "boolean", ["number", "number"], [c, s]);
            },
            get_seq_sort_basis: Mod._Z3_get_seq_sort_basis,
            mk_re_sort: Mod._Z3_mk_re_sort,
            is_re_sort: function(c, s) {
              return Mod.ccall("Z3_is_re_sort", "boolean", ["number", "number"], [c, s]);
            },
            get_re_sort_basis: Mod._Z3_get_re_sort_basis,
            mk_string_sort: Mod._Z3_mk_string_sort,
            mk_char_sort: Mod._Z3_mk_char_sort,
            is_string_sort: function(c, s) {
              return Mod.ccall("Z3_is_string_sort", "boolean", ["number", "number"], [c, s]);
            },
            is_char_sort: function(c, s) {
              return Mod.ccall("Z3_is_char_sort", "boolean", ["number", "number"], [c, s]);
            },
            mk_string: function(c, s) {
              return Mod.ccall("Z3_mk_string", "number", ["number", "string"], [c, s]);
            },
            mk_lstring: function(c, len, s) {
              return Mod.ccall("Z3_mk_lstring", "number", ["number", "number", "string"], [c, len, s]);
            },
            mk_u32string: function(c, chars) {
              return Mod.ccall("Z3_mk_u32string", "number", ["number", "number", "array"], [c, chars.length, intArrayToByteArr(chars)]);
            },
            is_string: function(c, s) {
              return Mod.ccall("Z3_is_string", "boolean", ["number", "number"], [c, s]);
            },
            get_string: function(c, s) {
              return Mod.ccall("Z3_get_string", "string", ["number", "number"], [c, s]);
            },
            get_string_length: function(c, s) {
              let ret = Mod.ccall("Z3_get_string_length", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_string_contents: function(c, s, length) {
              let outArray_contents = Mod._malloc(4 * length);
              try {
                let ret = Mod.ccall("Z3_get_string_contents", "void", ["number", "number", "number", "number"], [c, s, length, outArray_contents]);
                return readUintArray(outArray_contents, length);
              } finally {
                Mod._free(outArray_contents);
              }
            },
            mk_seq_empty: Mod._Z3_mk_seq_empty,
            mk_seq_unit: Mod._Z3_mk_seq_unit,
            mk_seq_concat: function(c, args) {
              return Mod.ccall("Z3_mk_seq_concat", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_seq_prefix: Mod._Z3_mk_seq_prefix,
            mk_seq_suffix: Mod._Z3_mk_seq_suffix,
            mk_seq_contains: Mod._Z3_mk_seq_contains,
            mk_str_lt: Mod._Z3_mk_str_lt,
            mk_str_le: Mod._Z3_mk_str_le,
            mk_seq_extract: Mod._Z3_mk_seq_extract,
            mk_seq_replace: Mod._Z3_mk_seq_replace,
            mk_seq_replace_all: Mod._Z3_mk_seq_replace_all,
            mk_seq_replace_re: Mod._Z3_mk_seq_replace_re,
            mk_seq_replace_re_all: Mod._Z3_mk_seq_replace_re_all,
            mk_seq_at: Mod._Z3_mk_seq_at,
            mk_seq_nth: Mod._Z3_mk_seq_nth,
            mk_seq_length: Mod._Z3_mk_seq_length,
            mk_seq_index: Mod._Z3_mk_seq_index,
            mk_seq_last_index: Mod._Z3_mk_seq_last_index,
            mk_seq_map: Mod._Z3_mk_seq_map,
            mk_seq_mapi: Mod._Z3_mk_seq_mapi,
            mk_seq_foldl: Mod._Z3_mk_seq_foldl,
            mk_seq_foldli: Mod._Z3_mk_seq_foldli,
            mk_str_to_int: Mod._Z3_mk_str_to_int,
            mk_int_to_str: Mod._Z3_mk_int_to_str,
            mk_string_to_code: Mod._Z3_mk_string_to_code,
            mk_string_from_code: Mod._Z3_mk_string_from_code,
            mk_ubv_to_str: Mod._Z3_mk_ubv_to_str,
            mk_sbv_to_str: Mod._Z3_mk_sbv_to_str,
            mk_seq_to_re: Mod._Z3_mk_seq_to_re,
            mk_seq_in_re: Mod._Z3_mk_seq_in_re,
            mk_re_plus: Mod._Z3_mk_re_plus,
            mk_re_star: Mod._Z3_mk_re_star,
            mk_re_option: Mod._Z3_mk_re_option,
            mk_re_union: function(c, args) {
              return Mod.ccall("Z3_mk_re_union", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_re_concat: function(c, args) {
              return Mod.ccall("Z3_mk_re_concat", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_re_range: Mod._Z3_mk_re_range,
            mk_re_allchar: Mod._Z3_mk_re_allchar,
            mk_re_loop: Mod._Z3_mk_re_loop,
            mk_re_power: Mod._Z3_mk_re_power,
            mk_re_intersect: function(c, args) {
              return Mod.ccall("Z3_mk_re_intersect", "number", ["number", "number", "array"], [c, args.length, intArrayToByteArr(args)]);
            },
            mk_re_complement: Mod._Z3_mk_re_complement,
            mk_re_diff: Mod._Z3_mk_re_diff,
            mk_re_empty: Mod._Z3_mk_re_empty,
            mk_re_full: Mod._Z3_mk_re_full,
            mk_char: Mod._Z3_mk_char,
            mk_char_le: Mod._Z3_mk_char_le,
            mk_char_to_int: Mod._Z3_mk_char_to_int,
            mk_char_to_bv: Mod._Z3_mk_char_to_bv,
            mk_char_from_bv: Mod._Z3_mk_char_from_bv,
            mk_char_is_digit: Mod._Z3_mk_char_is_digit,
            mk_linear_order: Mod._Z3_mk_linear_order,
            mk_partial_order: Mod._Z3_mk_partial_order,
            mk_piecewise_linear_order: Mod._Z3_mk_piecewise_linear_order,
            mk_tree_order: Mod._Z3_mk_tree_order,
            mk_transitive_closure: Mod._Z3_mk_transitive_closure,
            mk_pattern: function(c, terms) {
              return Mod.ccall("Z3_mk_pattern", "number", ["number", "number", "array"], [c, terms.length, intArrayToByteArr(terms)]);
            },
            mk_bound: Mod._Z3_mk_bound,
            mk_forall: function(c, weight, patterns, sorts, decl_names, body) {
              if (sorts.length !== decl_names.length) {
                throw new TypeError(`sorts and decl_names must be the same length (got ${sorts.length} and {decl_names.length})`);
              }
              return Mod.ccall("Z3_mk_forall", "number", [
                "number",
                "number",
                "number",
                "array",
                "number",
                "array",
                "array",
                "number"
              ], [
                c,
                weight,
                patterns.length,
                intArrayToByteArr(patterns),
                sorts.length,
                intArrayToByteArr(sorts),
                intArrayToByteArr(decl_names),
                body
              ]);
            },
            mk_exists: function(c, weight, patterns, sorts, decl_names, body) {
              if (sorts.length !== decl_names.length) {
                throw new TypeError(`sorts and decl_names must be the same length (got ${sorts.length} and {decl_names.length})`);
              }
              return Mod.ccall("Z3_mk_exists", "number", [
                "number",
                "number",
                "number",
                "array",
                "number",
                "array",
                "array",
                "number"
              ], [
                c,
                weight,
                patterns.length,
                intArrayToByteArr(patterns),
                sorts.length,
                intArrayToByteArr(sorts),
                intArrayToByteArr(decl_names),
                body
              ]);
            },
            mk_quantifier: function(c, is_forall, weight, patterns, sorts, decl_names, body) {
              if (sorts.length !== decl_names.length) {
                throw new TypeError(`sorts and decl_names must be the same length (got ${sorts.length} and {decl_names.length})`);
              }
              return Mod.ccall("Z3_mk_quantifier", "number", [
                "number",
                "boolean",
                "number",
                "number",
                "array",
                "number",
                "array",
                "array",
                "number"
              ], [
                c,
                is_forall,
                weight,
                patterns.length,
                intArrayToByteArr(patterns),
                sorts.length,
                intArrayToByteArr(sorts),
                intArrayToByteArr(decl_names),
                body
              ]);
            },
            mk_quantifier_ex: function(c, is_forall, weight, quantifier_id, skolem_id, patterns, no_patterns, sorts, decl_names, body) {
              if (sorts.length !== decl_names.length) {
                throw new TypeError(`sorts and decl_names must be the same length (got ${sorts.length} and {decl_names.length})`);
              }
              return Mod.ccall("Z3_mk_quantifier_ex", "number", [
                "number",
                "boolean",
                "number",
                "number",
                "number",
                "number",
                "array",
                "number",
                "array",
                "number",
                "array",
                "array",
                "number"
              ], [
                c,
                is_forall,
                weight,
                quantifier_id,
                skolem_id,
                patterns.length,
                intArrayToByteArr(patterns),
                no_patterns.length,
                intArrayToByteArr(no_patterns),
                sorts.length,
                intArrayToByteArr(sorts),
                intArrayToByteArr(decl_names),
                body
              ]);
            },
            mk_forall_const: function(c, weight, bound, patterns, body) {
              return Mod.ccall("Z3_mk_forall_const", "number", ["number", "number", "number", "array", "number", "array", "number"], [
                c,
                weight,
                bound.length,
                intArrayToByteArr(bound),
                patterns.length,
                intArrayToByteArr(patterns),
                body
              ]);
            },
            mk_exists_const: function(c, weight, bound, patterns, body) {
              return Mod.ccall("Z3_mk_exists_const", "number", ["number", "number", "number", "array", "number", "array", "number"], [
                c,
                weight,
                bound.length,
                intArrayToByteArr(bound),
                patterns.length,
                intArrayToByteArr(patterns),
                body
              ]);
            },
            mk_quantifier_const: function(c, is_forall, weight, bound, patterns, body) {
              return Mod.ccall("Z3_mk_quantifier_const", "number", [
                "number",
                "boolean",
                "number",
                "number",
                "array",
                "number",
                "array",
                "number"
              ], [
                c,
                is_forall,
                weight,
                bound.length,
                intArrayToByteArr(bound),
                patterns.length,
                intArrayToByteArr(patterns),
                body
              ]);
            },
            mk_quantifier_const_ex: function(c, is_forall, weight, quantifier_id, skolem_id, bound, patterns, no_patterns, body) {
              return Mod.ccall("Z3_mk_quantifier_const_ex", "number", [
                "number",
                "boolean",
                "number",
                "number",
                "number",
                "number",
                "array",
                "number",
                "array",
                "number",
                "array",
                "number"
              ], [
                c,
                is_forall,
                weight,
                quantifier_id,
                skolem_id,
                bound.length,
                intArrayToByteArr(bound),
                patterns.length,
                intArrayToByteArr(patterns),
                no_patterns.length,
                intArrayToByteArr(no_patterns),
                body
              ]);
            },
            mk_lambda: function(c, sorts, decl_names, body) {
              if (sorts.length !== decl_names.length) {
                throw new TypeError(`sorts and decl_names must be the same length (got ${sorts.length} and {decl_names.length})`);
              }
              return Mod.ccall("Z3_mk_lambda", "number", ["number", "number", "array", "array", "number"], [
                c,
                sorts.length,
                intArrayToByteArr(sorts),
                intArrayToByteArr(decl_names),
                body
              ]);
            },
            mk_lambda_const: function(c, bound, body) {
              return Mod.ccall("Z3_mk_lambda_const", "number", ["number", "number", "array", "number"], [
                c,
                bound.length,
                intArrayToByteArr(bound),
                body
              ]);
            },
            get_symbol_kind: Mod._Z3_get_symbol_kind,
            get_symbol_int: Mod._Z3_get_symbol_int,
            get_symbol_string: function(c, s) {
              return Mod.ccall("Z3_get_symbol_string", "string", ["number", "number"], [c, s]);
            },
            get_sort_name: Mod._Z3_get_sort_name,
            get_sort_id: function(c, s) {
              let ret = Mod.ccall("Z3_get_sort_id", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            sort_to_ast: Mod._Z3_sort_to_ast,
            is_eq_sort: function(c, s1, s2) {
              return Mod.ccall("Z3_is_eq_sort", "boolean", ["number", "number", "number"], [c, s1, s2]);
            },
            get_sort_kind: Mod._Z3_get_sort_kind,
            get_bv_sort_size: function(c, t) {
              let ret = Mod.ccall("Z3_get_bv_sort_size", "number", ["number", "number"], [c, t]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_finite_domain_sort_size: function(c, s) {
              let ret = Mod.ccall("Z3_get_finite_domain_sort_size", "boolean", ["number", "number", "number"], [c, s, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutUint64(0);
            },
            get_array_arity: function(c, s) {
              let ret = Mod.ccall("Z3_get_array_arity", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_array_sort_domain: Mod._Z3_get_array_sort_domain,
            get_array_sort_domain_n: Mod._Z3_get_array_sort_domain_n,
            get_array_sort_range: Mod._Z3_get_array_sort_range,
            get_tuple_sort_mk_decl: Mod._Z3_get_tuple_sort_mk_decl,
            get_tuple_sort_num_fields: function(c, t) {
              let ret = Mod.ccall("Z3_get_tuple_sort_num_fields", "number", ["number", "number"], [c, t]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_tuple_sort_field_decl: Mod._Z3_get_tuple_sort_field_decl,
            is_recursive_datatype_sort: function(c, s) {
              return Mod.ccall("Z3_is_recursive_datatype_sort", "boolean", ["number", "number"], [c, s]);
            },
            get_datatype_sort_num_constructors: function(c, t) {
              let ret = Mod.ccall("Z3_get_datatype_sort_num_constructors", "number", ["number", "number"], [c, t]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_datatype_sort_constructor: Mod._Z3_get_datatype_sort_constructor,
            get_datatype_sort_recognizer: Mod._Z3_get_datatype_sort_recognizer,
            get_datatype_sort_constructor_accessor: Mod._Z3_get_datatype_sort_constructor_accessor,
            datatype_update_field: Mod._Z3_datatype_update_field,
            get_relation_arity: function(c, s) {
              let ret = Mod.ccall("Z3_get_relation_arity", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_relation_column: Mod._Z3_get_relation_column,
            mk_atmost: function(c, args, k) {
              return Mod.ccall("Z3_mk_atmost", "number", ["number", "number", "array", "number"], [c, args.length, intArrayToByteArr(args), k]);
            },
            mk_atleast: function(c, args, k) {
              return Mod.ccall("Z3_mk_atleast", "number", ["number", "number", "array", "number"], [c, args.length, intArrayToByteArr(args), k]);
            },
            mk_pble: function(c, args, coeffs, k) {
              if (args.length !== coeffs.length) {
                throw new TypeError(`args and coeffs must be the same length (got ${args.length} and {coeffs.length})`);
              }
              return Mod.ccall("Z3_mk_pble", "number", ["number", "number", "array", "array", "number"], [
                c,
                args.length,
                intArrayToByteArr(args),
                intArrayToByteArr(coeffs),
                k
              ]);
            },
            mk_pbge: function(c, args, coeffs, k) {
              if (args.length !== coeffs.length) {
                throw new TypeError(`args and coeffs must be the same length (got ${args.length} and {coeffs.length})`);
              }
              return Mod.ccall("Z3_mk_pbge", "number", ["number", "number", "array", "array", "number"], [
                c,
                args.length,
                intArrayToByteArr(args),
                intArrayToByteArr(coeffs),
                k
              ]);
            },
            mk_pbeq: function(c, args, coeffs, k) {
              if (args.length !== coeffs.length) {
                throw new TypeError(`args and coeffs must be the same length (got ${args.length} and {coeffs.length})`);
              }
              return Mod.ccall("Z3_mk_pbeq", "number", ["number", "number", "array", "array", "number"], [
                c,
                args.length,
                intArrayToByteArr(args),
                intArrayToByteArr(coeffs),
                k
              ]);
            },
            func_decl_to_ast: Mod._Z3_func_decl_to_ast,
            is_eq_func_decl: function(c, f1, f2) {
              return Mod.ccall("Z3_is_eq_func_decl", "boolean", ["number", "number", "number"], [c, f1, f2]);
            },
            get_func_decl_id: function(c, f) {
              let ret = Mod.ccall("Z3_get_func_decl_id", "number", ["number", "number"], [c, f]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_decl_name: Mod._Z3_get_decl_name,
            get_decl_kind: Mod._Z3_get_decl_kind,
            get_domain_size: function(c, d) {
              let ret = Mod.ccall("Z3_get_domain_size", "number", ["number", "number"], [c, d]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_arity: function(c, d) {
              let ret = Mod.ccall("Z3_get_arity", "number", ["number", "number"], [c, d]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_domain: Mod._Z3_get_domain,
            get_range: Mod._Z3_get_range,
            get_decl_num_parameters: function(c, d) {
              let ret = Mod.ccall("Z3_get_decl_num_parameters", "number", ["number", "number"], [c, d]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_decl_parameter_kind: Mod._Z3_get_decl_parameter_kind,
            get_decl_int_parameter: Mod._Z3_get_decl_int_parameter,
            get_decl_double_parameter: Mod._Z3_get_decl_double_parameter,
            get_decl_symbol_parameter: Mod._Z3_get_decl_symbol_parameter,
            get_decl_sort_parameter: Mod._Z3_get_decl_sort_parameter,
            get_decl_ast_parameter: Mod._Z3_get_decl_ast_parameter,
            get_decl_func_decl_parameter: Mod._Z3_get_decl_func_decl_parameter,
            get_decl_rational_parameter: function(c, d, idx) {
              return Mod.ccall("Z3_get_decl_rational_parameter", "string", ["number", "number", "number"], [c, d, idx]);
            },
            app_to_ast: Mod._Z3_app_to_ast,
            get_app_decl: Mod._Z3_get_app_decl,
            get_app_num_args: function(c, a) {
              let ret = Mod.ccall("Z3_get_app_num_args", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_app_arg: Mod._Z3_get_app_arg,
            is_eq_ast: function(c, t1, t2) {
              return Mod.ccall("Z3_is_eq_ast", "boolean", ["number", "number", "number"], [c, t1, t2]);
            },
            get_ast_id: function(c, t) {
              let ret = Mod.ccall("Z3_get_ast_id", "number", ["number", "number"], [c, t]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_ast_hash: function(c, a) {
              let ret = Mod.ccall("Z3_get_ast_hash", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_sort: Mod._Z3_get_sort,
            is_well_sorted: function(c, t) {
              return Mod.ccall("Z3_is_well_sorted", "boolean", ["number", "number"], [c, t]);
            },
            get_bool_value: Mod._Z3_get_bool_value,
            get_ast_kind: Mod._Z3_get_ast_kind,
            is_app: function(c, a) {
              return Mod.ccall("Z3_is_app", "boolean", ["number", "number"], [c, a]);
            },
            is_ground: function(c, a) {
              return Mod.ccall("Z3_is_ground", "boolean", ["number", "number"], [c, a]);
            },
            get_depth: function(c, a) {
              let ret = Mod.ccall("Z3_get_depth", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            is_numeral_ast: function(c, a) {
              return Mod.ccall("Z3_is_numeral_ast", "boolean", ["number", "number"], [c, a]);
            },
            is_algebraic_number: function(c, a) {
              return Mod.ccall("Z3_is_algebraic_number", "boolean", ["number", "number"], [c, a]);
            },
            to_app: Mod._Z3_to_app,
            to_func_decl: Mod._Z3_to_func_decl,
            get_numeral_string: function(c, a) {
              return Mod.ccall("Z3_get_numeral_string", "string", ["number", "number"], [c, a]);
            },
            get_numeral_binary_string: function(c, a) {
              return Mod.ccall("Z3_get_numeral_binary_string", "string", ["number", "number"], [c, a]);
            },
            get_numeral_decimal_string: function(c, a, precision) {
              return Mod.ccall("Z3_get_numeral_decimal_string", "string", ["number", "number", "number"], [c, a, precision]);
            },
            get_numeral_double: Mod._Z3_get_numeral_double,
            get_numerator: Mod._Z3_get_numerator,
            get_denominator: Mod._Z3_get_denominator,
            get_numeral_small: function(c, a) {
              let ret = Mod.ccall("Z3_get_numeral_small", "boolean", ["number", "number", "number", "number"], [c, a, outAddress, outAddress + 8]);
              if (!ret) {
                return null;
              }
              return { num: getOutInt64(0), den: getOutInt64(1) };
            },
            get_numeral_int: function(c, v) {
              let ret = Mod.ccall("Z3_get_numeral_int", "boolean", ["number", "number", "number"], [c, v, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutInt(0);
            },
            get_numeral_uint: function(c, v) {
              let ret = Mod.ccall("Z3_get_numeral_uint", "boolean", ["number", "number", "number"], [c, v, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutUint(0);
            },
            get_numeral_uint64: function(c, v) {
              let ret = Mod.ccall("Z3_get_numeral_uint64", "boolean", ["number", "number", "number"], [c, v, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutUint64(0);
            },
            get_numeral_int64: function(c, v) {
              let ret = Mod.ccall("Z3_get_numeral_int64", "boolean", ["number", "number", "number"], [c, v, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutInt64(0);
            },
            get_numeral_rational_int64: function(c, v) {
              let ret = Mod.ccall("Z3_get_numeral_rational_int64", "boolean", ["number", "number", "number", "number"], [c, v, outAddress, outAddress + 8]);
              if (!ret) {
                return null;
              }
              return { num: getOutInt64(0), den: getOutInt64(1) };
            },
            get_algebraic_number_lower: Mod._Z3_get_algebraic_number_lower,
            get_algebraic_number_upper: Mod._Z3_get_algebraic_number_upper,
            pattern_to_ast: Mod._Z3_pattern_to_ast,
            get_pattern_num_terms: function(c, p) {
              let ret = Mod.ccall("Z3_get_pattern_num_terms", "number", ["number", "number"], [c, p]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_pattern: Mod._Z3_get_pattern,
            get_index_value: function(c, a) {
              let ret = Mod.ccall("Z3_get_index_value", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            is_quantifier_forall: function(c, a) {
              return Mod.ccall("Z3_is_quantifier_forall", "boolean", ["number", "number"], [c, a]);
            },
            is_quantifier_exists: function(c, a) {
              return Mod.ccall("Z3_is_quantifier_exists", "boolean", ["number", "number"], [c, a]);
            },
            is_lambda: function(c, a) {
              return Mod.ccall("Z3_is_lambda", "boolean", ["number", "number"], [c, a]);
            },
            get_quantifier_weight: function(c, a) {
              let ret = Mod.ccall("Z3_get_quantifier_weight", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_quantifier_skolem_id: Mod._Z3_get_quantifier_skolem_id,
            get_quantifier_id: Mod._Z3_get_quantifier_id,
            get_quantifier_num_patterns: function(c, a) {
              let ret = Mod.ccall("Z3_get_quantifier_num_patterns", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_quantifier_pattern_ast: Mod._Z3_get_quantifier_pattern_ast,
            get_quantifier_num_no_patterns: function(c, a) {
              let ret = Mod.ccall("Z3_get_quantifier_num_no_patterns", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_quantifier_no_pattern_ast: Mod._Z3_get_quantifier_no_pattern_ast,
            get_quantifier_num_bound: function(c, a) {
              let ret = Mod.ccall("Z3_get_quantifier_num_bound", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_quantifier_bound_name: Mod._Z3_get_quantifier_bound_name,
            get_quantifier_bound_sort: Mod._Z3_get_quantifier_bound_sort,
            get_quantifier_body: Mod._Z3_get_quantifier_body,
            simplify: function(c, a) {
              return Mod.async_call(Mod._async_Z3_simplify, c, a);
            },
            simplify_ex: function(c, a, p) {
              return Mod.async_call(Mod._async_Z3_simplify_ex, c, a, p);
            },
            simplify_get_help: function(c) {
              return Mod.ccall("Z3_simplify_get_help", "string", ["number"], [c]);
            },
            simplify_get_param_descrs: Mod._Z3_simplify_get_param_descrs,
            update_term: function(c, a, args) {
              return Mod.ccall("Z3_update_term", "number", ["number", "number", "number", "array"], [c, a, args.length, intArrayToByteArr(args)]);
            },
            substitute: function(c, a, from, to) {
              if (from.length !== to.length) {
                throw new TypeError(`from and to must be the same length (got ${from.length} and {to.length})`);
              }
              return Mod.ccall("Z3_substitute", "number", ["number", "number", "number", "array", "array"], [
                c,
                a,
                from.length,
                intArrayToByteArr(from),
                intArrayToByteArr(to)
              ]);
            },
            substitute_vars: function(c, a, to) {
              return Mod.ccall("Z3_substitute_vars", "number", ["number", "number", "number", "array"], [c, a, to.length, intArrayToByteArr(to)]);
            },
            substitute_funs: function(c, a, from, to) {
              if (from.length !== to.length) {
                throw new TypeError(`from and to must be the same length (got ${from.length} and {to.length})`);
              }
              return Mod.ccall("Z3_substitute_funs", "number", ["number", "number", "number", "array", "array"], [
                c,
                a,
                from.length,
                intArrayToByteArr(from),
                intArrayToByteArr(to)
              ]);
            },
            translate: Mod._Z3_translate,
            mk_model: Mod._Z3_mk_model,
            model_inc_ref: Mod._Z3_model_inc_ref,
            model_dec_ref: Mod._Z3_model_dec_ref,
            model_eval: function(c, m, t, model_completion) {
              let ret = Mod.ccall("Z3_model_eval", "boolean", ["number", "number", "number", "boolean", "number"], [c, m, t, model_completion, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutUint(0);
            },
            model_get_const_interp: Mod._Z3_model_get_const_interp,
            model_has_interp: function(c, m, a) {
              return Mod.ccall("Z3_model_has_interp", "boolean", ["number", "number", "number"], [c, m, a]);
            },
            model_get_func_interp: Mod._Z3_model_get_func_interp,
            model_get_num_consts: function(c, m) {
              let ret = Mod.ccall("Z3_model_get_num_consts", "number", ["number", "number"], [c, m]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            model_get_const_decl: Mod._Z3_model_get_const_decl,
            model_get_num_funcs: function(c, m) {
              let ret = Mod.ccall("Z3_model_get_num_funcs", "number", ["number", "number"], [c, m]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            model_get_func_decl: Mod._Z3_model_get_func_decl,
            model_get_num_sorts: function(c, m) {
              let ret = Mod.ccall("Z3_model_get_num_sorts", "number", ["number", "number"], [c, m]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            model_get_sort: Mod._Z3_model_get_sort,
            model_get_sort_universe: Mod._Z3_model_get_sort_universe,
            model_translate: Mod._Z3_model_translate,
            is_as_array: function(c, a) {
              return Mod.ccall("Z3_is_as_array", "boolean", ["number", "number"], [c, a]);
            },
            get_as_array_func_decl: Mod._Z3_get_as_array_func_decl,
            add_func_interp: Mod._Z3_add_func_interp,
            add_const_interp: Mod._Z3_add_const_interp,
            func_interp_inc_ref: Mod._Z3_func_interp_inc_ref,
            func_interp_dec_ref: Mod._Z3_func_interp_dec_ref,
            func_interp_get_num_entries: function(c, f) {
              let ret = Mod.ccall("Z3_func_interp_get_num_entries", "number", ["number", "number"], [c, f]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            func_interp_get_entry: Mod._Z3_func_interp_get_entry,
            func_interp_get_else: Mod._Z3_func_interp_get_else,
            func_interp_set_else: Mod._Z3_func_interp_set_else,
            func_interp_get_arity: function(c, f) {
              let ret = Mod.ccall("Z3_func_interp_get_arity", "number", ["number", "number"], [c, f]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            func_interp_add_entry: Mod._Z3_func_interp_add_entry,
            func_entry_inc_ref: Mod._Z3_func_entry_inc_ref,
            func_entry_dec_ref: Mod._Z3_func_entry_dec_ref,
            func_entry_get_value: Mod._Z3_func_entry_get_value,
            func_entry_get_num_args: function(c, e) {
              let ret = Mod.ccall("Z3_func_entry_get_num_args", "number", ["number", "number"], [c, e]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            func_entry_get_arg: Mod._Z3_func_entry_get_arg,
            open_log: function(filename) {
              return Mod.ccall("Z3_open_log", "boolean", ["string"], [filename]);
            },
            append_log: function(string) {
              return Mod.ccall("Z3_append_log", "void", ["string"], [string]);
            },
            close_log: Mod._Z3_close_log,
            toggle_warning_messages: Mod._Z3_toggle_warning_messages,
            set_ast_print_mode: Mod._Z3_set_ast_print_mode,
            ast_to_string: function(c, a) {
              return Mod.ccall("Z3_ast_to_string", "string", ["number", "number"], [c, a]);
            },
            pattern_to_string: function(c, p) {
              return Mod.ccall("Z3_pattern_to_string", "string", ["number", "number"], [c, p]);
            },
            sort_to_string: function(c, s) {
              return Mod.ccall("Z3_sort_to_string", "string", ["number", "number"], [c, s]);
            },
            func_decl_to_string: function(c, d) {
              return Mod.ccall("Z3_func_decl_to_string", "string", ["number", "number"], [c, d]);
            },
            model_to_string: function(c, m) {
              return Mod.ccall("Z3_model_to_string", "string", ["number", "number"], [c, m]);
            },
            benchmark_to_smtlib_string: function(c, name, logic, status, attributes, assumptions, formula) {
              return Mod.ccall("Z3_benchmark_to_smtlib_string", "string", [
                "number",
                "string",
                "string",
                "string",
                "string",
                "number",
                "array",
                "number"
              ], [
                c,
                name,
                logic,
                status,
                attributes,
                assumptions.length,
                intArrayToByteArr(assumptions),
                formula
              ]);
            },
            parse_smtlib2_string: function(c, str, sort_names, sorts, decl_names, decls) {
              if (sort_names.length !== sorts.length) {
                throw new TypeError(`sort_names and sorts must be the same length (got ${sort_names.length} and {sorts.length})`);
              }
              if (decl_names.length !== decls.length) {
                throw new TypeError(`decl_names and decls must be the same length (got ${decl_names.length} and {decls.length})`);
              }
              return Mod.ccall("Z3_parse_smtlib2_string", "number", [
                "number",
                "string",
                "number",
                "array",
                "array",
                "number",
                "array",
                "array"
              ], [
                c,
                str,
                sort_names.length,
                intArrayToByteArr(sort_names),
                intArrayToByteArr(sorts),
                decl_names.length,
                intArrayToByteArr(decl_names),
                intArrayToByteArr(decls)
              ]);
            },
            parse_smtlib2_file: function(c, file_name, sort_names, sorts, decl_names, decls) {
              if (sort_names.length !== sorts.length) {
                throw new TypeError(`sort_names and sorts must be the same length (got ${sort_names.length} and {sorts.length})`);
              }
              if (decl_names.length !== decls.length) {
                throw new TypeError(`decl_names and decls must be the same length (got ${decl_names.length} and {decls.length})`);
              }
              return Mod.ccall("Z3_parse_smtlib2_file", "number", [
                "number",
                "string",
                "number",
                "array",
                "array",
                "number",
                "array",
                "array"
              ], [
                c,
                file_name,
                sort_names.length,
                intArrayToByteArr(sort_names),
                intArrayToByteArr(sorts),
                decl_names.length,
                intArrayToByteArr(decl_names),
                intArrayToByteArr(decls)
              ]);
            },
            eval_smtlib2_string: async function(c, str) {
              return await Mod.async_call(() => Mod.ccall("async_Z3_eval_smtlib2_string", "void", ["number", "string"], [c, str]));
            },
            mk_parser_context: Mod._Z3_mk_parser_context,
            parser_context_inc_ref: Mod._Z3_parser_context_inc_ref,
            parser_context_dec_ref: Mod._Z3_parser_context_dec_ref,
            parser_context_add_sort: Mod._Z3_parser_context_add_sort,
            parser_context_add_decl: Mod._Z3_parser_context_add_decl,
            parser_context_from_string: function(c, pc, s) {
              return Mod.ccall("Z3_parser_context_from_string", "number", ["number", "number", "string"], [c, pc, s]);
            },
            get_error_code: Mod._Z3_get_error_code,
            set_error: Mod._Z3_set_error,
            get_error_msg: function(c, err) {
              return Mod.ccall("Z3_get_error_msg", "string", ["number", "number"], [c, err]);
            },
            get_version: function() {
              let ret = Mod.ccall("Z3_get_version", "void", ["number", "number", "number", "number"], [outAddress, outAddress + 4, outAddress + 8, outAddress + 12]);
              return {
                major: getOutUint(0),
                minor: getOutUint(1),
                build_number: getOutUint(2),
                revision_number: getOutUint(3)
              };
            },
            get_full_version: function() {
              return Mod.ccall("Z3_get_full_version", "string", [], []);
            },
            enable_trace: function(tag) {
              return Mod.ccall("Z3_enable_trace", "void", ["string"], [tag]);
            },
            disable_trace: function(tag) {
              return Mod.ccall("Z3_disable_trace", "void", ["string"], [tag]);
            },
            reset_memory: Mod._Z3_reset_memory,
            finalize_memory: Mod._Z3_finalize_memory,
            mk_goal: Mod._Z3_mk_goal,
            goal_inc_ref: Mod._Z3_goal_inc_ref,
            goal_dec_ref: Mod._Z3_goal_dec_ref,
            goal_precision: Mod._Z3_goal_precision,
            goal_assert: Mod._Z3_goal_assert,
            goal_inconsistent: function(c, g) {
              return Mod.ccall("Z3_goal_inconsistent", "boolean", ["number", "number"], [c, g]);
            },
            goal_depth: function(c, g) {
              let ret = Mod.ccall("Z3_goal_depth", "number", ["number", "number"], [c, g]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            goal_reset: Mod._Z3_goal_reset,
            goal_size: function(c, g) {
              let ret = Mod.ccall("Z3_goal_size", "number", ["number", "number"], [c, g]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            goal_formula: Mod._Z3_goal_formula,
            goal_num_exprs: function(c, g) {
              let ret = Mod.ccall("Z3_goal_num_exprs", "number", ["number", "number"], [c, g]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            goal_is_decided_sat: function(c, g) {
              return Mod.ccall("Z3_goal_is_decided_sat", "boolean", ["number", "number"], [c, g]);
            },
            goal_is_decided_unsat: function(c, g) {
              return Mod.ccall("Z3_goal_is_decided_unsat", "boolean", ["number", "number"], [c, g]);
            },
            goal_translate: Mod._Z3_goal_translate,
            goal_convert_model: Mod._Z3_goal_convert_model,
            goal_to_string: function(c, g) {
              return Mod.ccall("Z3_goal_to_string", "string", ["number", "number"], [c, g]);
            },
            goal_to_dimacs_string: function(c, g, include_names) {
              return Mod.ccall("Z3_goal_to_dimacs_string", "string", ["number", "number", "boolean"], [c, g, include_names]);
            },
            mk_tactic: function(c, name) {
              return Mod.ccall("Z3_mk_tactic", "number", ["number", "string"], [c, name]);
            },
            tactic_inc_ref: Mod._Z3_tactic_inc_ref,
            tactic_dec_ref: Mod._Z3_tactic_dec_ref,
            mk_probe: function(c, name) {
              return Mod.ccall("Z3_mk_probe", "number", ["number", "string"], [c, name]);
            },
            probe_inc_ref: Mod._Z3_probe_inc_ref,
            probe_dec_ref: Mod._Z3_probe_dec_ref,
            tactic_and_then: Mod._Z3_tactic_and_then,
            tactic_or_else: Mod._Z3_tactic_or_else,
            tactic_par_or: function(c, ts) {
              return Mod.ccall("Z3_tactic_par_or", "number", ["number", "number", "array"], [c, ts.length, intArrayToByteArr(ts)]);
            },
            tactic_par_and_then: Mod._Z3_tactic_par_and_then,
            tactic_try_for: Mod._Z3_tactic_try_for,
            tactic_when: Mod._Z3_tactic_when,
            tactic_cond: Mod._Z3_tactic_cond,
            tactic_repeat: Mod._Z3_tactic_repeat,
            tactic_skip: Mod._Z3_tactic_skip,
            tactic_fail: Mod._Z3_tactic_fail,
            tactic_fail_if: Mod._Z3_tactic_fail_if,
            tactic_fail_if_not_decided: Mod._Z3_tactic_fail_if_not_decided,
            tactic_using_params: Mod._Z3_tactic_using_params,
            mk_simplifier: function(c, name) {
              return Mod.ccall("Z3_mk_simplifier", "number", ["number", "string"], [c, name]);
            },
            simplifier_inc_ref: Mod._Z3_simplifier_inc_ref,
            simplifier_dec_ref: Mod._Z3_simplifier_dec_ref,
            solver_add_simplifier: Mod._Z3_solver_add_simplifier,
            simplifier_and_then: Mod._Z3_simplifier_and_then,
            simplifier_using_params: Mod._Z3_simplifier_using_params,
            get_num_simplifiers: function(c) {
              let ret = Mod.ccall("Z3_get_num_simplifiers", "number", ["number"], [c]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_simplifier_name: function(c, i) {
              return Mod.ccall("Z3_get_simplifier_name", "string", ["number", "number"], [c, i]);
            },
            simplifier_get_help: function(c, t) {
              return Mod.ccall("Z3_simplifier_get_help", "string", ["number", "number"], [c, t]);
            },
            simplifier_get_param_descrs: Mod._Z3_simplifier_get_param_descrs,
            simplifier_get_descr: function(c, name) {
              return Mod.ccall("Z3_simplifier_get_descr", "string", ["number", "string"], [c, name]);
            },
            probe_const: Mod._Z3_probe_const,
            probe_lt: Mod._Z3_probe_lt,
            probe_gt: Mod._Z3_probe_gt,
            probe_le: Mod._Z3_probe_le,
            probe_ge: Mod._Z3_probe_ge,
            probe_eq: Mod._Z3_probe_eq,
            probe_and: Mod._Z3_probe_and,
            probe_or: Mod._Z3_probe_or,
            probe_not: Mod._Z3_probe_not,
            get_num_tactics: function(c) {
              let ret = Mod.ccall("Z3_get_num_tactics", "number", ["number"], [c]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_tactic_name: function(c, i) {
              return Mod.ccall("Z3_get_tactic_name", "string", ["number", "number"], [c, i]);
            },
            get_num_probes: function(c) {
              let ret = Mod.ccall("Z3_get_num_probes", "number", ["number"], [c]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            get_probe_name: function(c, i) {
              return Mod.ccall("Z3_get_probe_name", "string", ["number", "number"], [c, i]);
            },
            tactic_get_help: function(c, t) {
              return Mod.ccall("Z3_tactic_get_help", "string", ["number", "number"], [c, t]);
            },
            tactic_get_param_descrs: Mod._Z3_tactic_get_param_descrs,
            tactic_get_descr: function(c, name) {
              return Mod.ccall("Z3_tactic_get_descr", "string", ["number", "string"], [c, name]);
            },
            probe_get_descr: function(c, name) {
              return Mod.ccall("Z3_probe_get_descr", "string", ["number", "string"], [c, name]);
            },
            probe_apply: Mod._Z3_probe_apply,
            tactic_apply: function(c, t, g) {
              return Mod.async_call(Mod._async_Z3_tactic_apply, c, t, g);
            },
            tactic_apply_ex: function(c, t, g, p) {
              return Mod.async_call(Mod._async_Z3_tactic_apply_ex, c, t, g, p);
            },
            apply_result_inc_ref: Mod._Z3_apply_result_inc_ref,
            apply_result_dec_ref: Mod._Z3_apply_result_dec_ref,
            apply_result_to_string: function(c, r) {
              return Mod.ccall("Z3_apply_result_to_string", "string", ["number", "number"], [c, r]);
            },
            apply_result_get_num_subgoals: function(c, r) {
              let ret = Mod.ccall("Z3_apply_result_get_num_subgoals", "number", ["number", "number"], [c, r]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            apply_result_get_subgoal: Mod._Z3_apply_result_get_subgoal,
            mk_solver: Mod._Z3_mk_solver,
            mk_simple_solver: Mod._Z3_mk_simple_solver,
            mk_solver_for_logic: Mod._Z3_mk_solver_for_logic,
            mk_solver_from_tactic: Mod._Z3_mk_solver_from_tactic,
            solver_translate: Mod._Z3_solver_translate,
            solver_import_model_converter: Mod._Z3_solver_import_model_converter,
            solver_get_help: function(c, s) {
              return Mod.ccall("Z3_solver_get_help", "string", ["number", "number"], [c, s]);
            },
            solver_get_param_descrs: Mod._Z3_solver_get_param_descrs,
            solver_set_params: Mod._Z3_solver_set_params,
            solver_inc_ref: Mod._Z3_solver_inc_ref,
            solver_dec_ref: Mod._Z3_solver_dec_ref,
            solver_interrupt: Mod._Z3_solver_interrupt,
            solver_push: Mod._Z3_solver_push,
            solver_pop: Mod._Z3_solver_pop,
            solver_reset: Mod._Z3_solver_reset,
            solver_get_num_scopes: function(c, s) {
              let ret = Mod.ccall("Z3_solver_get_num_scopes", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            solver_assert: Mod._Z3_solver_assert,
            solver_assert_and_track: Mod._Z3_solver_assert_and_track,
            solver_from_file: function(c, s, file_name) {
              return Mod.ccall("Z3_solver_from_file", "void", ["number", "number", "string"], [c, s, file_name]);
            },
            solver_from_string: function(c, s, str) {
              return Mod.ccall("Z3_solver_from_string", "void", ["number", "number", "string"], [c, s, str]);
            },
            solver_get_assertions: Mod._Z3_solver_get_assertions,
            solver_get_units: Mod._Z3_solver_get_units,
            solver_get_trail: Mod._Z3_solver_get_trail,
            solver_get_non_units: Mod._Z3_solver_get_non_units,
            solver_get_levels: function(c, s, literals, sz) {
              let outArray_levels = Mod._malloc(4 * sz);
              try {
                let ret = Mod.ccall("Z3_solver_get_levels", "void", ["number", "number", "number", "number", "number"], [c, s, literals, sz, outArray_levels]);
                return readUintArray(outArray_levels, sz);
              } finally {
                Mod._free(outArray_levels);
              }
            },
            solver_congruence_root: Mod._Z3_solver_congruence_root,
            solver_congruence_next: Mod._Z3_solver_congruence_next,
            solver_congruence_explain: Mod._Z3_solver_congruence_explain,
            solver_solve_for: Mod._Z3_solver_solve_for,
            solver_next_split: function(c, cb, t, idx, phase) {
              return Mod.ccall("Z3_solver_next_split", "boolean", ["number", "number", "number", "number", "number"], [c, cb, t, idx, phase]);
            },
            solver_propagate_declare: function(c, name, domain, range) {
              return Mod.ccall("Z3_solver_propagate_declare", "number", ["number", "number", "number", "array", "number"], [
                c,
                name,
                domain.length,
                intArrayToByteArr(domain),
                range
              ]);
            },
            solver_propagate_register: Mod._Z3_solver_propagate_register,
            solver_propagate_register_cb: Mod._Z3_solver_propagate_register_cb,
            solver_propagate_consequence: function(c, cb, fixed, eq_lhs, eq_rhs, conseq) {
              if (eq_lhs.length !== eq_rhs.length) {
                throw new TypeError(`eq_lhs and eq_rhs must be the same length (got ${eq_lhs.length} and {eq_rhs.length})`);
              }
              return Mod.ccall("Z3_solver_propagate_consequence", "boolean", [
                "number",
                "number",
                "number",
                "array",
                "number",
                "array",
                "array",
                "number"
              ], [
                c,
                cb,
                fixed.length,
                intArrayToByteArr(fixed),
                eq_lhs.length,
                intArrayToByteArr(eq_lhs),
                intArrayToByteArr(eq_rhs),
                conseq
              ]);
            },
            solver_set_initial_value: Mod._Z3_solver_set_initial_value,
            solver_check: function(c, s) {
              return Mod.async_call(Mod._async_Z3_solver_check, c, s);
            },
            solver_check_assumptions: async function(c, s, assumptions) {
              const assumptions_ptr = Mod._malloc(assumptions.length * 4);
              Mod.HEAPU32.set(assumptions, assumptions_ptr / 4);
              try {
                let ret = await Mod.async_call(() => Mod.ccall("async_Z3_solver_check_assumptions", "void", ["number", "number", "number", "number"], [c, s, assumptions.length, assumptions_ptr]));
                return ret;
              } finally {
                Mod._free(assumptions_ptr);
              }
            },
            get_implied_equalities: function(c, s, terms) {
              let outArray_class_ids = Mod._malloc(4 * terms.length);
              try {
                let ret = Mod.ccall("Z3_get_implied_equalities", "number", ["number", "number", "number", "array", "number"], [
                  c,
                  s,
                  terms.length,
                  intArrayToByteArr(terms),
                  outArray_class_ids
                ]);
                return {
                  rv: ret,
                  class_ids: readUintArray(outArray_class_ids, terms.length)
                };
              } finally {
                Mod._free(outArray_class_ids);
              }
            },
            solver_get_consequences: function(c, s, assumptions, variables, consequences) {
              return Mod.async_call(Mod._async_Z3_solver_get_consequences, c, s, assumptions, variables, consequences);
            },
            solver_cube: function(c, s, vars, backtrack_level) {
              return Mod.async_call(Mod._async_Z3_solver_cube, c, s, vars, backtrack_level);
            },
            solver_get_model: Mod._Z3_solver_get_model,
            solver_get_proof: Mod._Z3_solver_get_proof,
            solver_get_unsat_core: Mod._Z3_solver_get_unsat_core,
            solver_get_reason_unknown: function(c, s) {
              return Mod.ccall("Z3_solver_get_reason_unknown", "string", ["number", "number"], [c, s]);
            },
            solver_get_statistics: Mod._Z3_solver_get_statistics,
            solver_to_string: function(c, s) {
              return Mod.ccall("Z3_solver_to_string", "string", ["number", "number"], [c, s]);
            },
            solver_to_dimacs_string: function(c, s, include_names) {
              return Mod.ccall("Z3_solver_to_dimacs_string", "string", ["number", "number", "boolean"], [c, s, include_names]);
            },
            stats_to_string: function(c, s) {
              return Mod.ccall("Z3_stats_to_string", "string", ["number", "number"], [c, s]);
            },
            stats_inc_ref: Mod._Z3_stats_inc_ref,
            stats_dec_ref: Mod._Z3_stats_dec_ref,
            stats_size: function(c, s) {
              let ret = Mod.ccall("Z3_stats_size", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            stats_get_key: function(c, s, idx) {
              return Mod.ccall("Z3_stats_get_key", "string", ["number", "number", "number"], [c, s, idx]);
            },
            stats_is_uint: function(c, s, idx) {
              return Mod.ccall("Z3_stats_is_uint", "boolean", ["number", "number", "number"], [c, s, idx]);
            },
            stats_is_double: function(c, s, idx) {
              return Mod.ccall("Z3_stats_is_double", "boolean", ["number", "number", "number"], [c, s, idx]);
            },
            stats_get_uint_value: function(c, s, idx) {
              let ret = Mod.ccall("Z3_stats_get_uint_value", "number", ["number", "number", "number"], [c, s, idx]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            stats_get_double_value: Mod._Z3_stats_get_double_value,
            get_estimated_alloc_size: Mod._Z3_get_estimated_alloc_size,
            algebraic_is_value: function(c, a) {
              return Mod.ccall("Z3_algebraic_is_value", "boolean", ["number", "number"], [c, a]);
            },
            algebraic_is_pos: function(c, a) {
              return Mod.ccall("Z3_algebraic_is_pos", "boolean", ["number", "number"], [c, a]);
            },
            algebraic_is_neg: function(c, a) {
              return Mod.ccall("Z3_algebraic_is_neg", "boolean", ["number", "number"], [c, a]);
            },
            algebraic_is_zero: function(c, a) {
              return Mod.ccall("Z3_algebraic_is_zero", "boolean", ["number", "number"], [c, a]);
            },
            algebraic_sign: Mod._Z3_algebraic_sign,
            algebraic_add: Mod._Z3_algebraic_add,
            algebraic_sub: Mod._Z3_algebraic_sub,
            algebraic_mul: Mod._Z3_algebraic_mul,
            algebraic_div: Mod._Z3_algebraic_div,
            algebraic_root: Mod._Z3_algebraic_root,
            algebraic_power: Mod._Z3_algebraic_power,
            algebraic_lt: function(c, a, b) {
              return Mod.ccall("Z3_algebraic_lt", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            algebraic_gt: function(c, a, b) {
              return Mod.ccall("Z3_algebraic_gt", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            algebraic_le: function(c, a, b) {
              return Mod.ccall("Z3_algebraic_le", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            algebraic_ge: function(c, a, b) {
              return Mod.ccall("Z3_algebraic_ge", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            algebraic_eq: function(c, a, b) {
              return Mod.ccall("Z3_algebraic_eq", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            algebraic_neq: function(c, a, b) {
              return Mod.ccall("Z3_algebraic_neq", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            algebraic_roots: async function(c, p, a) {
              const a_ptr = Mod._malloc(a.length * 4);
              Mod.HEAPU32.set(a, a_ptr / 4);
              try {
                let ret = await Mod.async_call(() => Mod.ccall("async_Z3_algebraic_roots", "void", ["number", "number", "number", "number"], [c, p, a.length, a_ptr]));
                return ret;
              } finally {
                Mod._free(a_ptr);
              }
            },
            algebraic_eval: async function(c, p, a) {
              const a_ptr = Mod._malloc(a.length * 4);
              Mod.HEAPU32.set(a, a_ptr / 4);
              try {
                let ret = await Mod.async_call(() => Mod.ccall("async_Z3_algebraic_eval", "void", ["number", "number", "number", "number"], [c, p, a.length, a_ptr]));
                return ret;
              } finally {
                Mod._free(a_ptr);
              }
            },
            algebraic_get_poly: Mod._Z3_algebraic_get_poly,
            algebraic_get_i: function(c, a) {
              let ret = Mod.ccall("Z3_algebraic_get_i", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            mk_ast_vector: Mod._Z3_mk_ast_vector,
            ast_vector_inc_ref: Mod._Z3_ast_vector_inc_ref,
            ast_vector_dec_ref: Mod._Z3_ast_vector_dec_ref,
            ast_vector_size: function(c, v) {
              let ret = Mod.ccall("Z3_ast_vector_size", "number", ["number", "number"], [c, v]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            ast_vector_get: Mod._Z3_ast_vector_get,
            ast_vector_set: Mod._Z3_ast_vector_set,
            ast_vector_resize: Mod._Z3_ast_vector_resize,
            ast_vector_push: Mod._Z3_ast_vector_push,
            ast_vector_translate: Mod._Z3_ast_vector_translate,
            ast_vector_to_string: function(c, v) {
              return Mod.ccall("Z3_ast_vector_to_string", "string", ["number", "number"], [c, v]);
            },
            mk_ast_map: Mod._Z3_mk_ast_map,
            ast_map_inc_ref: Mod._Z3_ast_map_inc_ref,
            ast_map_dec_ref: Mod._Z3_ast_map_dec_ref,
            ast_map_contains: function(c, m, k) {
              return Mod.ccall("Z3_ast_map_contains", "boolean", ["number", "number", "number"], [c, m, k]);
            },
            ast_map_find: Mod._Z3_ast_map_find,
            ast_map_insert: Mod._Z3_ast_map_insert,
            ast_map_erase: Mod._Z3_ast_map_erase,
            ast_map_reset: Mod._Z3_ast_map_reset,
            ast_map_size: function(c, m) {
              let ret = Mod.ccall("Z3_ast_map_size", "number", ["number", "number"], [c, m]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            ast_map_keys: Mod._Z3_ast_map_keys,
            ast_map_to_string: function(c, m) {
              return Mod.ccall("Z3_ast_map_to_string", "string", ["number", "number"], [c, m]);
            },
            mk_fixedpoint: Mod._Z3_mk_fixedpoint,
            fixedpoint_inc_ref: Mod._Z3_fixedpoint_inc_ref,
            fixedpoint_dec_ref: Mod._Z3_fixedpoint_dec_ref,
            fixedpoint_add_rule: Mod._Z3_fixedpoint_add_rule,
            fixedpoint_add_fact: function(c, d, r, args) {
              return Mod.ccall("Z3_fixedpoint_add_fact", "void", ["number", "number", "number", "number", "array"], [
                c,
                d,
                r,
                args.length,
                intArrayToByteArr(args)
              ]);
            },
            fixedpoint_assert: Mod._Z3_fixedpoint_assert,
            fixedpoint_query: function(c, d, query) {
              return Mod.async_call(Mod._async_Z3_fixedpoint_query, c, d, query);
            },
            fixedpoint_query_relations: async function(c, d, relations) {
              const relations_ptr = Mod._malloc(relations.length * 4);
              Mod.HEAPU32.set(relations, relations_ptr / 4);
              try {
                let ret = await Mod.async_call(() => Mod.ccall("async_Z3_fixedpoint_query_relations", "void", ["number", "number", "number", "number"], [c, d, relations.length, relations_ptr]));
                return ret;
              } finally {
                Mod._free(relations_ptr);
              }
            },
            fixedpoint_get_answer: Mod._Z3_fixedpoint_get_answer,
            fixedpoint_get_reason_unknown: function(c, d) {
              return Mod.ccall("Z3_fixedpoint_get_reason_unknown", "string", ["number", "number"], [c, d]);
            },
            fixedpoint_update_rule: Mod._Z3_fixedpoint_update_rule,
            fixedpoint_get_num_levels: function(c, d, pred) {
              let ret = Mod.ccall("Z3_fixedpoint_get_num_levels", "number", ["number", "number", "number"], [c, d, pred]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            fixedpoint_get_cover_delta: Mod._Z3_fixedpoint_get_cover_delta,
            fixedpoint_add_cover: Mod._Z3_fixedpoint_add_cover,
            fixedpoint_get_statistics: Mod._Z3_fixedpoint_get_statistics,
            fixedpoint_register_relation: Mod._Z3_fixedpoint_register_relation,
            fixedpoint_set_predicate_representation: function(c, d, f, relation_kinds) {
              return Mod.ccall("Z3_fixedpoint_set_predicate_representation", "void", ["number", "number", "number", "number", "array"], [
                c,
                d,
                f,
                relation_kinds.length,
                intArrayToByteArr(relation_kinds)
              ]);
            },
            fixedpoint_get_rules: Mod._Z3_fixedpoint_get_rules,
            fixedpoint_get_assertions: Mod._Z3_fixedpoint_get_assertions,
            fixedpoint_set_params: Mod._Z3_fixedpoint_set_params,
            fixedpoint_get_help: function(c, f) {
              return Mod.ccall("Z3_fixedpoint_get_help", "string", ["number", "number"], [c, f]);
            },
            fixedpoint_get_param_descrs: Mod._Z3_fixedpoint_get_param_descrs,
            fixedpoint_to_string: function(c, f, queries) {
              return Mod.ccall("Z3_fixedpoint_to_string", "string", ["number", "number", "number", "array"], [
                c,
                f,
                queries.length,
                intArrayToByteArr(queries)
              ]);
            },
            fixedpoint_from_string: function(c, f, s) {
              return Mod.ccall("Z3_fixedpoint_from_string", "number", ["number", "number", "string"], [c, f, s]);
            },
            fixedpoint_from_file: function(c, f, s) {
              return Mod.ccall("Z3_fixedpoint_from_file", "number", ["number", "number", "string"], [c, f, s]);
            },
            mk_fpa_rounding_mode_sort: Mod._Z3_mk_fpa_rounding_mode_sort,
            mk_fpa_round_nearest_ties_to_even: Mod._Z3_mk_fpa_round_nearest_ties_to_even,
            mk_fpa_rne: Mod._Z3_mk_fpa_rne,
            mk_fpa_round_nearest_ties_to_away: Mod._Z3_mk_fpa_round_nearest_ties_to_away,
            mk_fpa_rna: Mod._Z3_mk_fpa_rna,
            mk_fpa_round_toward_positive: Mod._Z3_mk_fpa_round_toward_positive,
            mk_fpa_rtp: Mod._Z3_mk_fpa_rtp,
            mk_fpa_round_toward_negative: Mod._Z3_mk_fpa_round_toward_negative,
            mk_fpa_rtn: Mod._Z3_mk_fpa_rtn,
            mk_fpa_round_toward_zero: Mod._Z3_mk_fpa_round_toward_zero,
            mk_fpa_rtz: Mod._Z3_mk_fpa_rtz,
            mk_fpa_sort: Mod._Z3_mk_fpa_sort,
            mk_fpa_sort_half: Mod._Z3_mk_fpa_sort_half,
            mk_fpa_sort_16: Mod._Z3_mk_fpa_sort_16,
            mk_fpa_sort_single: Mod._Z3_mk_fpa_sort_single,
            mk_fpa_sort_32: Mod._Z3_mk_fpa_sort_32,
            mk_fpa_sort_double: Mod._Z3_mk_fpa_sort_double,
            mk_fpa_sort_64: Mod._Z3_mk_fpa_sort_64,
            mk_fpa_sort_quadruple: Mod._Z3_mk_fpa_sort_quadruple,
            mk_fpa_sort_128: Mod._Z3_mk_fpa_sort_128,
            mk_fpa_nan: Mod._Z3_mk_fpa_nan,
            mk_fpa_inf: Mod._Z3_mk_fpa_inf,
            mk_fpa_zero: Mod._Z3_mk_fpa_zero,
            mk_fpa_fp: Mod._Z3_mk_fpa_fp,
            mk_fpa_numeral_float: Mod._Z3_mk_fpa_numeral_float,
            mk_fpa_numeral_double: Mod._Z3_mk_fpa_numeral_double,
            mk_fpa_numeral_int: Mod._Z3_mk_fpa_numeral_int,
            mk_fpa_numeral_int_uint: Mod._Z3_mk_fpa_numeral_int_uint,
            mk_fpa_numeral_int64_uint64: Mod._Z3_mk_fpa_numeral_int64_uint64,
            mk_fpa_abs: Mod._Z3_mk_fpa_abs,
            mk_fpa_neg: Mod._Z3_mk_fpa_neg,
            mk_fpa_add: Mod._Z3_mk_fpa_add,
            mk_fpa_sub: Mod._Z3_mk_fpa_sub,
            mk_fpa_mul: Mod._Z3_mk_fpa_mul,
            mk_fpa_div: Mod._Z3_mk_fpa_div,
            mk_fpa_fma: Mod._Z3_mk_fpa_fma,
            mk_fpa_sqrt: Mod._Z3_mk_fpa_sqrt,
            mk_fpa_rem: Mod._Z3_mk_fpa_rem,
            mk_fpa_round_to_integral: Mod._Z3_mk_fpa_round_to_integral,
            mk_fpa_min: Mod._Z3_mk_fpa_min,
            mk_fpa_max: Mod._Z3_mk_fpa_max,
            mk_fpa_leq: Mod._Z3_mk_fpa_leq,
            mk_fpa_lt: Mod._Z3_mk_fpa_lt,
            mk_fpa_geq: Mod._Z3_mk_fpa_geq,
            mk_fpa_gt: Mod._Z3_mk_fpa_gt,
            mk_fpa_eq: Mod._Z3_mk_fpa_eq,
            mk_fpa_is_normal: Mod._Z3_mk_fpa_is_normal,
            mk_fpa_is_subnormal: Mod._Z3_mk_fpa_is_subnormal,
            mk_fpa_is_zero: Mod._Z3_mk_fpa_is_zero,
            mk_fpa_is_infinite: Mod._Z3_mk_fpa_is_infinite,
            mk_fpa_is_nan: Mod._Z3_mk_fpa_is_nan,
            mk_fpa_is_negative: Mod._Z3_mk_fpa_is_negative,
            mk_fpa_is_positive: Mod._Z3_mk_fpa_is_positive,
            mk_fpa_to_fp_bv: Mod._Z3_mk_fpa_to_fp_bv,
            mk_fpa_to_fp_float: Mod._Z3_mk_fpa_to_fp_float,
            mk_fpa_to_fp_real: Mod._Z3_mk_fpa_to_fp_real,
            mk_fpa_to_fp_signed: Mod._Z3_mk_fpa_to_fp_signed,
            mk_fpa_to_fp_unsigned: Mod._Z3_mk_fpa_to_fp_unsigned,
            mk_fpa_to_ubv: Mod._Z3_mk_fpa_to_ubv,
            mk_fpa_to_sbv: Mod._Z3_mk_fpa_to_sbv,
            mk_fpa_to_real: Mod._Z3_mk_fpa_to_real,
            fpa_get_ebits: function(c, s) {
              let ret = Mod.ccall("Z3_fpa_get_ebits", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            fpa_get_sbits: function(c, s) {
              let ret = Mod.ccall("Z3_fpa_get_sbits", "number", ["number", "number"], [c, s]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            fpa_is_numeral: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_nan: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_nan", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_inf: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_inf", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_zero: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_zero", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_normal: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_normal", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_subnormal: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_subnormal", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_positive: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_positive", "boolean", ["number", "number"], [c, t]);
            },
            fpa_is_numeral_negative: function(c, t) {
              return Mod.ccall("Z3_fpa_is_numeral_negative", "boolean", ["number", "number"], [c, t]);
            },
            fpa_get_numeral_sign_bv: Mod._Z3_fpa_get_numeral_sign_bv,
            fpa_get_numeral_significand_bv: Mod._Z3_fpa_get_numeral_significand_bv,
            fpa_get_numeral_significand_string: function(c, t) {
              return Mod.ccall("Z3_fpa_get_numeral_significand_string", "string", ["number", "number"], [c, t]);
            },
            fpa_get_numeral_significand_uint64: function(c, t) {
              let ret = Mod.ccall("Z3_fpa_get_numeral_significand_uint64", "boolean", ["number", "number", "number"], [c, t, outAddress]);
              if (!ret) {
                return null;
              }
              return getOutUint64(0);
            },
            fpa_get_numeral_exponent_string: function(c, t, biased) {
              return Mod.ccall("Z3_fpa_get_numeral_exponent_string", "string", ["number", "number", "boolean"], [c, t, biased]);
            },
            fpa_get_numeral_exponent_int64: function(c, t, biased) {
              let ret = Mod.ccall("Z3_fpa_get_numeral_exponent_int64", "boolean", ["number", "number", "number", "boolean"], [c, t, outAddress, biased]);
              if (!ret) {
                return null;
              }
              return getOutInt64(0);
            },
            fpa_get_numeral_exponent_bv: Mod._Z3_fpa_get_numeral_exponent_bv,
            mk_fpa_to_ieee_bv: Mod._Z3_mk_fpa_to_ieee_bv,
            mk_fpa_to_fp_int_real: Mod._Z3_mk_fpa_to_fp_int_real,
            mk_optimize: Mod._Z3_mk_optimize,
            optimize_inc_ref: Mod._Z3_optimize_inc_ref,
            optimize_dec_ref: Mod._Z3_optimize_dec_ref,
            optimize_assert: Mod._Z3_optimize_assert,
            optimize_assert_and_track: Mod._Z3_optimize_assert_and_track,
            optimize_assert_soft: function(c, o, a, weight, id) {
              let ret = Mod.ccall("Z3_optimize_assert_soft", "number", ["number", "number", "number", "string", "number"], [c, o, a, weight, id]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            optimize_maximize: function(c, o, t) {
              let ret = Mod.ccall("Z3_optimize_maximize", "number", ["number", "number", "number"], [c, o, t]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            optimize_minimize: function(c, o, t) {
              let ret = Mod.ccall("Z3_optimize_minimize", "number", ["number", "number", "number"], [c, o, t]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            optimize_push: Mod._Z3_optimize_push,
            optimize_pop: Mod._Z3_optimize_pop,
            optimize_set_initial_value: Mod._Z3_optimize_set_initial_value,
            optimize_check: async function(c, o, assumptions) {
              const assumptions_ptr = Mod._malloc(assumptions.length * 4);
              Mod.HEAPU32.set(assumptions, assumptions_ptr / 4);
              try {
                let ret = await Mod.async_call(() => Mod.ccall("async_Z3_optimize_check", "void", ["number", "number", "number", "number"], [c, o, assumptions.length, assumptions_ptr]));
                return ret;
              } finally {
                Mod._free(assumptions_ptr);
              }
            },
            optimize_get_reason_unknown: function(c, d) {
              return Mod.ccall("Z3_optimize_get_reason_unknown", "string", ["number", "number"], [c, d]);
            },
            optimize_get_model: Mod._Z3_optimize_get_model,
            optimize_get_unsat_core: Mod._Z3_optimize_get_unsat_core,
            optimize_set_params: Mod._Z3_optimize_set_params,
            optimize_get_param_descrs: Mod._Z3_optimize_get_param_descrs,
            optimize_get_lower: Mod._Z3_optimize_get_lower,
            optimize_get_upper: Mod._Z3_optimize_get_upper,
            optimize_get_lower_as_vector: Mod._Z3_optimize_get_lower_as_vector,
            optimize_get_upper_as_vector: Mod._Z3_optimize_get_upper_as_vector,
            optimize_to_string: function(c, o) {
              return Mod.ccall("Z3_optimize_to_string", "string", ["number", "number"], [c, o]);
            },
            optimize_from_string: function(c, o, s) {
              return Mod.ccall("Z3_optimize_from_string", "void", ["number", "number", "string"], [c, o, s]);
            },
            optimize_from_file: function(c, o, s) {
              return Mod.ccall("Z3_optimize_from_file", "void", ["number", "number", "string"], [c, o, s]);
            },
            optimize_get_help: function(c, t) {
              return Mod.ccall("Z3_optimize_get_help", "string", ["number", "number"], [c, t]);
            },
            optimize_get_statistics: Mod._Z3_optimize_get_statistics,
            optimize_get_assertions: Mod._Z3_optimize_get_assertions,
            optimize_get_objectives: Mod._Z3_optimize_get_objectives,
            optimize_translate: Mod._Z3_optimize_translate,
            polynomial_subresultants: function(c, p, q, x) {
              return Mod.async_call(Mod._async_Z3_polynomial_subresultants, c, p, q, x);
            },
            rcf_del: Mod._Z3_rcf_del,
            rcf_mk_rational: function(c, val) {
              return Mod.ccall("Z3_rcf_mk_rational", "number", ["number", "string"], [c, val]);
            },
            rcf_mk_small_int: Mod._Z3_rcf_mk_small_int,
            rcf_mk_pi: Mod._Z3_rcf_mk_pi,
            rcf_mk_e: Mod._Z3_rcf_mk_e,
            rcf_mk_infinitesimal: Mod._Z3_rcf_mk_infinitesimal,
            rcf_mk_roots: function(c, a) {
              let outArray_roots = Mod._malloc(4 * a.length);
              try {
                let ret = Mod.ccall("Z3_rcf_mk_roots", "number", ["number", "number", "array", "number"], [
                  c,
                  a.length,
                  intArrayToByteArr(a),
                  outArray_roots
                ]);
                ret = new Uint32Array([ret])[0];
                return {
                  rv: ret,
                  roots: readUintArray(outArray_roots, a.length)
                };
              } finally {
                Mod._free(outArray_roots);
              }
            },
            rcf_add: Mod._Z3_rcf_add,
            rcf_sub: Mod._Z3_rcf_sub,
            rcf_mul: Mod._Z3_rcf_mul,
            rcf_div: Mod._Z3_rcf_div,
            rcf_neg: Mod._Z3_rcf_neg,
            rcf_inv: Mod._Z3_rcf_inv,
            rcf_power: Mod._Z3_rcf_power,
            rcf_lt: function(c, a, b) {
              return Mod.ccall("Z3_rcf_lt", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            rcf_gt: function(c, a, b) {
              return Mod.ccall("Z3_rcf_gt", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            rcf_le: function(c, a, b) {
              return Mod.ccall("Z3_rcf_le", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            rcf_ge: function(c, a, b) {
              return Mod.ccall("Z3_rcf_ge", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            rcf_eq: function(c, a, b) {
              return Mod.ccall("Z3_rcf_eq", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            rcf_neq: function(c, a, b) {
              return Mod.ccall("Z3_rcf_neq", "boolean", ["number", "number", "number"], [c, a, b]);
            },
            rcf_num_to_string: function(c, a, compact, html) {
              return Mod.ccall("Z3_rcf_num_to_string", "string", ["number", "number", "boolean", "boolean"], [c, a, compact, html]);
            },
            rcf_num_to_decimal_string: function(c, a, prec) {
              return Mod.ccall("Z3_rcf_num_to_decimal_string", "string", ["number", "number", "number"], [c, a, prec]);
            },
            rcf_get_numerator_denominator: function(c, a) {
              let ret = Mod.ccall("Z3_rcf_get_numerator_denominator", "void", ["number", "number", "number", "number"], [c, a, outAddress, outAddress + 4]);
              return {
                n: getOutUint(0),
                d: getOutUint(1)
              };
            },
            rcf_is_rational: function(c, a) {
              return Mod.ccall("Z3_rcf_is_rational", "boolean", ["number", "number"], [c, a]);
            },
            rcf_is_algebraic: function(c, a) {
              return Mod.ccall("Z3_rcf_is_algebraic", "boolean", ["number", "number"], [c, a]);
            },
            rcf_is_infinitesimal: function(c, a) {
              return Mod.ccall("Z3_rcf_is_infinitesimal", "boolean", ["number", "number"], [c, a]);
            },
            rcf_is_transcendental: function(c, a) {
              return Mod.ccall("Z3_rcf_is_transcendental", "boolean", ["number", "number"], [c, a]);
            },
            rcf_extension_index: function(c, a) {
              let ret = Mod.ccall("Z3_rcf_extension_index", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            rcf_transcendental_name: Mod._Z3_rcf_transcendental_name,
            rcf_infinitesimal_name: Mod._Z3_rcf_infinitesimal_name,
            rcf_num_coefficients: function(c, a) {
              let ret = Mod.ccall("Z3_rcf_num_coefficients", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            rcf_coefficient: Mod._Z3_rcf_coefficient,
            rcf_num_sign_conditions: function(c, a) {
              let ret = Mod.ccall("Z3_rcf_num_sign_conditions", "number", ["number", "number"], [c, a]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            rcf_sign_condition_sign: Mod._Z3_rcf_sign_condition_sign,
            rcf_num_sign_condition_coefficients: function(c, a, i) {
              let ret = Mod.ccall("Z3_rcf_num_sign_condition_coefficients", "number", ["number", "number", "number"], [c, a, i]);
              ret = new Uint32Array([ret])[0];
              return ret;
            },
            rcf_sign_condition_coefficient: Mod._Z3_rcf_sign_condition_coefficient,
            fixedpoint_query_from_lvl: function(c, d, query, lvl) {
              return Mod.async_call(Mod._async_Z3_fixedpoint_query_from_lvl, c, d, query, lvl);
            },
            fixedpoint_get_ground_sat_answer: Mod._Z3_fixedpoint_get_ground_sat_answer,
            fixedpoint_get_rules_along_trace: Mod._Z3_fixedpoint_get_rules_along_trace,
            fixedpoint_get_rule_names_along_trace: Mod._Z3_fixedpoint_get_rule_names_along_trace,
            fixedpoint_add_invariant: Mod._Z3_fixedpoint_add_invariant,
            fixedpoint_get_reachable: Mod._Z3_fixedpoint_get_reachable,
            qe_model_project: function(c, m, bound, body) {
              return Mod.ccall("Z3_qe_model_project", "number", ["number", "number", "number", "array", "number"], [
                c,
                m,
                bound.length,
                intArrayToByteArr(bound),
                body
              ]);
            },
            qe_model_project_skolem: function(c, m, bound, body, map) {
              return Mod.ccall("Z3_qe_model_project_skolem", "number", ["number", "number", "number", "array", "number", "number"], [
                c,
                m,
                bound.length,
                intArrayToByteArr(bound),
                body,
                map
              ]);
            },
            qe_model_project_with_witness: function(c, m, bound, body, map) {
              return Mod.ccall("Z3_qe_model_project_with_witness", "number", ["number", "number", "number", "array", "number", "number"], [
                c,
                m,
                bound.length,
                intArrayToByteArr(bound),
                body,
                map
              ]);
            },
            model_extrapolate: Mod._Z3_model_extrapolate,
            qe_lite: Mod._Z3_qe_lite
          }
        };
      }
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/low-level/index.js
  var require_low_level = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/low-level/index.js"(exports) {
      "use strict";
      var __createBinding2 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar2 = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding2(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar2(require_types_GENERATED(), exports);
      __exportStar2(require_wrapper_GENERATED(), exports);
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/types.js
  var require_types = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/types.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.Z3AssertionError = exports.Z3Error = void 0;
      var Z3Error = class extends Error {
      };
      exports.Z3Error = Z3Error;
      var Z3AssertionError = class extends Z3Error {
      };
      exports.Z3AssertionError = Z3AssertionError;
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/utils.js
  var require_utils = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.assertExhaustive = assertExhaustive;
      exports.assert = assert;
      exports.allSatisfy = allSatisfy;
      var types_1 = require_types();
      function assertExhaustive(x) {
        throw new Error("Unexpected code execution detected, should be caught at compile time");
      }
      function assert(condition, reason) {
        if (!condition) {
          throw new types_1.Z3AssertionError(reason ?? "Assertion failed");
        }
      }
      function allSatisfy(collection, premise) {
        let hasItems = false;
        for (const arg of collection) {
          hasItems = true;
          if (!premise(arg)) {
            return false;
          }
        }
        return hasItems === true ? true : null;
      }
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/high-level.js
  var require_high_level = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/high-level.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.createApi = createApi;
      var async_mutex_1 = require_lib();
      var low_level_1 = require_low_level();
      var types_1 = require_types();
      var utils_1 = require_utils();
      var FALLBACK_PRECISION = 17;
      var asyncMutex = new async_mutex_1.Mutex();
      function isCoercibleRational(obj) {
        const r = obj !== null && (typeof obj === "object" || typeof obj === "function") && (obj.numerator !== null && (typeof obj.numerator === "number" || typeof obj.numerator === "bigint")) && (obj.denominator !== null && (typeof obj.denominator === "number" || typeof obj.denominator === "bigint"));
        r && (0, utils_1.assert)((typeof obj.numerator !== "number" || Number.isSafeInteger(obj.numerator)) && (typeof obj.denominator !== "number" || Number.isSafeInteger(obj.denominator)), "Fraction numerator and denominator must be integers");
        return r;
      }
      function createApi(Z3, em) {
        const cleanup = new FinalizationRegistry((callback) => callback());
        function enableTrace(tag) {
          Z3.enable_trace(tag);
        }
        function disableTrace(tag) {
          Z3.disable_trace(tag);
        }
        function getVersion() {
          return Z3.get_version();
        }
        function getVersionString() {
          const { major, minor, build_number } = Z3.get_version();
          return `${major}.${minor}.${build_number}`;
        }
        function getFullVersion() {
          return Z3.get_full_version();
        }
        function openLog(filename) {
          return Z3.open_log(filename);
        }
        function appendLog(s) {
          Z3.append_log(s);
        }
        function setParam(key, value) {
          if (typeof key === "string") {
            Z3.global_param_set(key, value.toString());
          } else {
            (0, utils_1.assert)(value === void 0, "Can't provide a Record and second parameter to set_param at the same time");
            Object.entries(key).forEach(([key2, value2]) => setParam(key2, value2));
          }
        }
        function resetParams() {
          Z3.global_param_reset_all();
        }
        function getParam(name) {
          return Z3.global_param_get(name);
        }
        function createContext(name, options) {
          const cfg = Z3.mk_config();
          if (options != null) {
            Object.entries(options).forEach(([key, value]) => check(Z3.set_param_value(cfg, key, value.toString())));
          }
          const contextPtr = Z3.mk_context_rc(cfg);
          Z3.set_ast_print_mode(contextPtr, low_level_1.Z3_ast_print_mode.Z3_PRINT_SMTLIB2_COMPLIANT);
          Z3.del_config(cfg);
          function _assertContext(...ctxs) {
            ctxs.forEach((other) => (0, utils_1.assert)("ctx" in other ? ctx === other.ctx : ctx === other, "Context mismatch"));
          }
          function _assertPtr(ptr) {
            if (ptr == null)
              throw new TypeError("Expected non-null pointer");
          }
          function throwIfError() {
            if (Z3.get_error_code(contextPtr) !== low_level_1.Z3_error_code.Z3_OK) {
              throw new Error(Z3.get_error_msg(ctx.ptr, Z3.get_error_code(ctx.ptr)));
            }
          }
          function check(val) {
            throwIfError();
            return val;
          }
          function _toSymbol(s) {
            if (typeof s === "number") {
              return check(Z3.mk_int_symbol(contextPtr, s));
            } else {
              return check(Z3.mk_string_symbol(contextPtr, s));
            }
          }
          function _fromSymbol(sym) {
            const kind = check(Z3.get_symbol_kind(contextPtr, sym));
            switch (kind) {
              case low_level_1.Z3_symbol_kind.Z3_INT_SYMBOL:
                return Z3.get_symbol_int(contextPtr, sym);
              case low_level_1.Z3_symbol_kind.Z3_STRING_SYMBOL:
                return Z3.get_symbol_string(contextPtr, sym);
              default:
                (0, utils_1.assertExhaustive)(kind);
            }
          }
          function _toParams(key, value) {
            const params = Z3.mk_params(contextPtr);
            Z3.params_inc_ref(contextPtr, params);
            if (typeof value === "boolean") {
              Z3.params_set_bool(contextPtr, params, _toSymbol(key), value);
            } else if (typeof value === "number") {
              if (Number.isInteger(value)) {
                check(Z3.params_set_uint(contextPtr, params, _toSymbol(key), value));
              } else {
                check(Z3.params_set_double(contextPtr, params, _toSymbol(key), value));
              }
            } else if (typeof value === "string") {
              check(Z3.params_set_symbol(contextPtr, params, _toSymbol(key), _toSymbol(value)));
            }
            return params;
          }
          function _toAst(ast) {
            switch (check(Z3.get_ast_kind(contextPtr, ast))) {
              case low_level_1.Z3_ast_kind.Z3_SORT_AST:
                return _toSort(ast);
              case low_level_1.Z3_ast_kind.Z3_FUNC_DECL_AST:
                return new FuncDeclImpl(ast);
              default:
                return _toExpr(ast);
            }
          }
          function _toSort(ast) {
            switch (check(Z3.get_sort_kind(contextPtr, ast))) {
              case low_level_1.Z3_sort_kind.Z3_BOOL_SORT:
                return new BoolSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_INT_SORT:
              case low_level_1.Z3_sort_kind.Z3_REAL_SORT:
                return new ArithSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_BV_SORT:
                return new BitVecSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_FLOATING_POINT_SORT:
                return new FPSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_ROUNDING_MODE_SORT:
                return new FPRMSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_SEQ_SORT:
                return new SeqSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_RE_SORT:
                return new ReSortImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_ARRAY_SORT:
                return new ArraySortImpl(ast);
              default:
                if (Z3.is_finite_set_sort(contextPtr, ast)) {
                  return new FiniteSetSortImpl(ast);
                }
                return new SortImpl(ast);
            }
          }
          function _toExpr(ast) {
            const kind = check(Z3.get_ast_kind(contextPtr, ast));
            if (kind === low_level_1.Z3_ast_kind.Z3_QUANTIFIER_AST) {
              if (Z3.is_lambda(contextPtr, ast)) {
                return new LambdaImpl(ast);
              }
              return new NonLambdaQuantifierImpl(ast);
            }
            const sortKind = check(Z3.get_sort_kind(contextPtr, Z3.get_sort(contextPtr, ast)));
            switch (sortKind) {
              case low_level_1.Z3_sort_kind.Z3_BOOL_SORT:
                return new BoolImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_INT_SORT:
                if (kind === low_level_1.Z3_ast_kind.Z3_NUMERAL_AST) {
                  return new IntNumImpl(ast);
                }
                return new ArithImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_REAL_SORT:
                if (kind === low_level_1.Z3_ast_kind.Z3_NUMERAL_AST) {
                  return new RatNumImpl(ast);
                }
                return new ArithImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_BV_SORT:
                if (kind === low_level_1.Z3_ast_kind.Z3_NUMERAL_AST) {
                  return new BitVecNumImpl(ast);
                }
                return new BitVecImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_FLOATING_POINT_SORT:
                if (kind === low_level_1.Z3_ast_kind.Z3_NUMERAL_AST || kind === low_level_1.Z3_ast_kind.Z3_APP_AST) {
                  return new FPNumImpl(ast);
                }
                return new FPImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_ROUNDING_MODE_SORT:
                return new FPRMImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_SEQ_SORT:
                return new SeqImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_RE_SORT:
                return new ReImpl(ast);
              case low_level_1.Z3_sort_kind.Z3_ARRAY_SORT:
                return new ArrayImpl(ast);
              default:
                if (Z3.is_finite_set_sort(contextPtr, Z3.get_sort(contextPtr, ast))) {
                  return new FiniteSetImpl(ast);
                }
                return new ExprImpl(ast);
            }
          }
          function _flattenArgs(args) {
            const result = [];
            for (const arg of args) {
              if (isAstVector(arg)) {
                result.push(...arg.values());
              } else {
                result.push(arg);
              }
            }
            return result;
          }
          function _toProbe(p) {
            if (isProbe(p)) {
              return p;
            }
            return new ProbeImpl(p);
          }
          function _probeNary(f, args) {
            (0, utils_1.assert)(args.length > 0, "At least one argument expected");
            let r = _toProbe(args[0]);
            for (let i = 1; i < args.length; i++) {
              r = new ProbeImpl(check(f(contextPtr, r.ptr, _toProbe(args[i]).ptr)));
            }
            return r;
          }
          function interrupt() {
            check(Z3.interrupt(contextPtr));
          }
          function setPrintMode(mode) {
            Z3.set_ast_print_mode(contextPtr, mode);
          }
          function isModel(obj) {
            const r = obj instanceof ModelImpl;
            r && _assertContext(obj);
            return r;
          }
          function isAst(obj) {
            const r = obj instanceof AstImpl;
            r && _assertContext(obj);
            return r;
          }
          function isSort(obj) {
            const r = obj instanceof SortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFuncDecl(obj) {
            const r = obj instanceof FuncDeclImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFuncInterp(obj) {
            const r = obj instanceof FuncInterpImpl;
            r && _assertContext(obj);
            return r;
          }
          function isApp(obj) {
            if (!isExpr(obj)) {
              return false;
            }
            const kind = check(Z3.get_ast_kind(contextPtr, obj.ast));
            return kind === low_level_1.Z3_ast_kind.Z3_NUMERAL_AST || kind === low_level_1.Z3_ast_kind.Z3_APP_AST;
          }
          function isConst(obj) {
            return isExpr(obj) && isApp(obj) && obj.numArgs() === 0;
          }
          function isExpr(obj) {
            const r = obj instanceof ExprImpl;
            r && _assertContext(obj);
            return r;
          }
          function isVar(obj) {
            return isExpr(obj) && check(Z3.get_ast_kind(contextPtr, obj.ast)) === low_level_1.Z3_ast_kind.Z3_VAR_AST;
          }
          function isAppOf(obj, kind) {
            return isExpr(obj) && isApp(obj) && obj.decl().kind() === kind;
          }
          function isBool(obj) {
            const r = obj instanceof ExprImpl && obj.sort.kind() === low_level_1.Z3_sort_kind.Z3_BOOL_SORT;
            r && _assertContext(obj);
            return r;
          }
          function isTrue(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_TRUE);
          }
          function isFalse(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_FALSE);
          }
          function isAnd(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_AND);
          }
          function isOr(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_OR);
          }
          function isImplies(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_IMPLIES);
          }
          function isNot(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_NOT);
          }
          function isEq(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_EQ);
          }
          function isDistinct(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_DISTINCT);
          }
          function isQuantifier(obj) {
            const r = obj instanceof QuantifierImpl;
            r && _assertContext(obj);
            return r;
          }
          function isArith(obj) {
            const r = obj instanceof ArithImpl;
            r && _assertContext(obj);
            return r;
          }
          function isArithSort(obj) {
            const r = obj instanceof ArithSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isInt(obj) {
            return isArith(obj) && isIntSort(obj.sort);
          }
          function isIntVal(obj) {
            const r = obj instanceof IntNumImpl;
            r && _assertContext(obj);
            return r;
          }
          function isIntSort(obj) {
            return isSort(obj) && obj.kind() === low_level_1.Z3_sort_kind.Z3_INT_SORT;
          }
          function isReal(obj) {
            return isArith(obj) && isRealSort(obj.sort);
          }
          function isRealVal(obj) {
            const r = obj instanceof RatNumImpl;
            r && _assertContext(obj);
            return r;
          }
          function isRealSort(obj) {
            return isSort(obj) && obj.kind() === low_level_1.Z3_sort_kind.Z3_REAL_SORT;
          }
          function isRCFNum(obj) {
            const r = obj instanceof RCFNumImpl;
            r && _assertContext(obj);
            return r;
          }
          function isBitVecSort(obj) {
            const r = obj instanceof BitVecSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isBitVec(obj) {
            const r = obj instanceof BitVecImpl;
            r && _assertContext(obj);
            return r;
          }
          function isBitVecVal(obj) {
            const r = obj instanceof BitVecNumImpl;
            r && _assertContext(obj);
            return r;
          }
          function isArraySort(obj) {
            const r = obj instanceof ArraySortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isArray(obj) {
            const r = obj instanceof ArrayImpl;
            r && _assertContext(obj);
            return r;
          }
          function isConstArray(obj) {
            return isAppOf(obj, low_level_1.Z3_decl_kind.Z3_OP_CONST_ARRAY);
          }
          function isFPRMSort(obj) {
            const r = obj instanceof FPRMSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFPRM(obj) {
            const r = obj instanceof FPRMImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFPSort(obj) {
            const r = obj instanceof FPSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFP(obj) {
            const r = obj instanceof FPImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFPVal(obj) {
            const r = obj instanceof FPNumImpl;
            r && _assertContext(obj);
            return r;
          }
          function isSeqSort(obj) {
            const r = obj instanceof SeqSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isSeq(obj) {
            const r = obj instanceof SeqImpl;
            r && _assertContext(obj);
            return r;
          }
          function isReSort(obj) {
            const r = obj instanceof ReSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isRe(obj) {
            const r = obj instanceof ReImpl;
            r && _assertContext(obj);
            return r;
          }
          function isStringSort(obj) {
            return isSeqSort(obj) && obj.isString();
          }
          function isString(obj) {
            return isSeq(obj) && obj.isString();
          }
          function isFiniteSetSort(obj) {
            const r = obj instanceof FiniteSetSortImpl;
            r && _assertContext(obj);
            return r;
          }
          function isFiniteSet(obj) {
            const r = obj instanceof FiniteSetImpl;
            r && _assertContext(obj);
            return r;
          }
          function isProbe(obj) {
            const r = obj instanceof ProbeImpl;
            r && _assertContext(obj);
            return r;
          }
          function isTactic(obj) {
            const r = obj instanceof TacticImpl;
            r && _assertContext(obj);
            return r;
          }
          function isGoal(obj) {
            const r = obj instanceof GoalImpl;
            r && _assertContext(obj);
            return r;
          }
          function isAstVector(obj) {
            const r = obj instanceof AstVectorImpl;
            r && _assertContext(obj);
            return r;
          }
          function eqIdentity(a, b) {
            return a.eqIdentity(b);
          }
          function getVarIndex(obj) {
            (0, utils_1.assert)(isVar(obj), "Z3 bound variable expected");
            return Z3.get_index_value(contextPtr, obj.ast);
          }
          function from(value) {
            if (typeof value === "boolean") {
              return Bool.val(value);
            } else if (typeof value === "number") {
              if (!Number.isFinite(value)) {
                throw new Error(`cannot represent infinity/NaN (got ${value})`);
              }
              if (Math.floor(value) === value) {
                return Int.val(value);
              }
              return Real.val(value);
            } else if (isCoercibleRational(value)) {
              return Real.val(value);
            } else if (typeof value === "bigint") {
              return Int.val(value);
            } else if (isExpr(value)) {
              return value;
            }
            (0, utils_1.assert)(false);
          }
          async function solve(...assertions) {
            const solver = new ctx.Solver();
            solver.add(...assertions);
            const result = await solver.check();
            if (result === "sat") {
              return solver.model();
            }
            return result;
          }
          async function simplify(e) {
            const result = await Z3.simplify(contextPtr, e.ast);
            return _toExpr(check(result));
          }
          const Sort = {
            declare: (name2) => new SortImpl(Z3.mk_uninterpreted_sort(contextPtr, _toSymbol(name2)))
          };
          const Function = {
            declare: (name2, ...signature) => {
              const arity = signature.length - 1;
              const rng = signature[arity];
              _assertContext(rng);
              const dom = [];
              for (let i = 0; i < arity; i++) {
                _assertContext(signature[i]);
                dom.push(signature[i].ptr);
              }
              return new FuncDeclImpl(Z3.mk_func_decl(contextPtr, _toSymbol(name2), dom, rng.ptr));
            },
            fresh: (...signature) => {
              const arity = signature.length - 1;
              const rng = signature[arity];
              _assertContext(rng);
              const dom = [];
              for (let i = 0; i < arity; i++) {
                _assertContext(signature[i]);
                dom.push(signature[i].ptr);
              }
              return new FuncDeclImpl(Z3.mk_fresh_func_decl(contextPtr, "f", dom, rng.ptr));
            }
          };
          const RecFunc = {
            declare: (name2, ...signature) => {
              const arity = signature.length - 1;
              const rng = signature[arity];
              _assertContext(rng);
              const dom = [];
              for (let i = 0; i < arity; i++) {
                _assertContext(signature[i]);
                dom.push(signature[i].ptr);
              }
              return new FuncDeclImpl(Z3.mk_rec_func_decl(contextPtr, _toSymbol(name2), dom, rng.ptr));
            },
            addDefinition: (f, args, body) => {
              _assertContext(f, ...args, body);
              check(Z3.add_rec_def(contextPtr, f.ptr, args.map((arg) => arg.ast), body.ast));
            }
          };
          const Bool = {
            sort: () => new BoolSortImpl(Z3.mk_bool_sort(contextPtr)),
            const: (name2) => new BoolImpl(Z3.mk_const(contextPtr, _toSymbol(name2), Bool.sort().ptr)),
            consts: (names) => {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => Bool.const(name2));
            },
            vector: (prefix, count) => {
              const result = [];
              for (let i = 0; i < count; i++) {
                result.push(Bool.const(`${prefix}__${i}`));
              }
              return result;
            },
            fresh: (prefix = "b") => new BoolImpl(Z3.mk_fresh_const(contextPtr, prefix, Bool.sort().ptr)),
            val: (value) => {
              if (value) {
                return new BoolImpl(Z3.mk_true(contextPtr));
              }
              return new BoolImpl(Z3.mk_false(contextPtr));
            }
          };
          const Int = {
            sort: () => new ArithSortImpl(Z3.mk_int_sort(contextPtr)),
            const: (name2) => new ArithImpl(Z3.mk_const(contextPtr, _toSymbol(name2), Int.sort().ptr)),
            consts: (names) => {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => Int.const(name2));
            },
            vector: (prefix, count) => {
              const result = [];
              for (let i = 0; i < count; i++) {
                result.push(Int.const(`${prefix}__${i}`));
              }
              return result;
            },
            fresh: (prefix = "x") => new ArithImpl(Z3.mk_fresh_const(contextPtr, prefix, Int.sort().ptr)),
            val: (value) => {
              (0, utils_1.assert)(typeof value === "bigint" || typeof value === "string" || Number.isSafeInteger(value));
              return new IntNumImpl(check(Z3.mk_numeral(contextPtr, value.toString(), Int.sort().ptr)));
            }
          };
          const Real = {
            sort: () => new ArithSortImpl(Z3.mk_real_sort(contextPtr)),
            const: (name2) => new ArithImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), Real.sort().ptr))),
            consts: (names) => {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => Real.const(name2));
            },
            vector: (prefix, count) => {
              const result = [];
              for (let i = 0; i < count; i++) {
                result.push(Real.const(`${prefix}__${i}`));
              }
              return result;
            },
            fresh: (prefix = "b") => new ArithImpl(Z3.mk_fresh_const(contextPtr, prefix, Real.sort().ptr)),
            val: (value) => {
              if (isCoercibleRational(value)) {
                value = `${value.numerator}/${value.denominator}`;
              }
              return new RatNumImpl(Z3.mk_numeral(contextPtr, value.toString(), Real.sort().ptr));
            }
          };
          const RCFNum = Object.assign((value) => new RCFNumImpl(value), {
            pi: () => new RCFNumImpl(check(Z3.rcf_mk_pi(contextPtr))),
            e: () => new RCFNumImpl(check(Z3.rcf_mk_e(contextPtr))),
            infinitesimal: () => new RCFNumImpl(check(Z3.rcf_mk_infinitesimal(contextPtr))),
            roots: (coefficients) => {
              (0, utils_1.assert)(coefficients.length > 0, "Polynomial coefficients cannot be empty");
              const coeffPtrs = coefficients.map((c) => c.ptr);
              const { rv: numRoots, roots: rootPtrs } = Z3.rcf_mk_roots(contextPtr, coeffPtrs);
              const result = [];
              for (let i = 0; i < numRoots; i++) {
                result.push(new RCFNumImpl(rootPtrs[i]));
              }
              return result;
            }
          });
          const BitVec = {
            sort(bits) {
              (0, utils_1.assert)(Number.isSafeInteger(bits), "number of bits must be an integer");
              return new BitVecSortImpl(Z3.mk_bv_sort(contextPtr, bits));
            },
            const(name2, bits) {
              return new BitVecImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), isBitVecSort(bits) ? bits.ptr : BitVec.sort(bits).ptr)));
            },
            consts(names, bits) {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => BitVec.const(name2, bits));
            },
            val(value, bits) {
              if (value === true) {
                return BitVec.val(1, bits);
              } else if (value === false) {
                return BitVec.val(0, bits);
              }
              return new BitVecNumImpl(check(Z3.mk_numeral(contextPtr, value.toString(), isBitVecSort(bits) ? bits.ptr : BitVec.sort(bits).ptr)));
            }
          };
          const Float = {
            sort(ebits, sbits) {
              (0, utils_1.assert)(Number.isSafeInteger(ebits) && ebits > 0, "ebits must be a positive integer");
              (0, utils_1.assert)(Number.isSafeInteger(sbits) && sbits > 0, "sbits must be a positive integer");
              return new FPSortImpl(Z3.mk_fpa_sort(contextPtr, ebits, sbits));
            },
            sort16() {
              return new FPSortImpl(Z3.mk_fpa_sort_16(contextPtr));
            },
            sort32() {
              return new FPSortImpl(Z3.mk_fpa_sort_32(contextPtr));
            },
            sort64() {
              return new FPSortImpl(Z3.mk_fpa_sort_64(contextPtr));
            },
            sort128() {
              return new FPSortImpl(Z3.mk_fpa_sort_128(contextPtr));
            },
            const(name2, sort) {
              return new FPImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), sort.ptr)));
            },
            consts(names, sort) {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => Float.const(name2, sort));
            },
            val(value, sort) {
              return new FPNumImpl(check(Z3.mk_fpa_numeral_double(contextPtr, value, sort.ptr)));
            },
            NaN(sort) {
              return new FPNumImpl(check(Z3.mk_fpa_nan(contextPtr, sort.ptr)));
            },
            inf(sort, negative = false) {
              return new FPNumImpl(check(Z3.mk_fpa_inf(contextPtr, sort.ptr, negative)));
            },
            zero(sort, negative = false) {
              return new FPNumImpl(check(Z3.mk_fpa_zero(contextPtr, sort.ptr, negative)));
            }
          };
          const FloatRM = {
            sort() {
              return new FPRMSortImpl(Z3.mk_fpa_rounding_mode_sort(contextPtr));
            },
            RNE() {
              return new FPRMImpl(check(Z3.mk_fpa_rne(contextPtr)));
            },
            RNA() {
              return new FPRMImpl(check(Z3.mk_fpa_rna(contextPtr)));
            },
            RTP() {
              return new FPRMImpl(check(Z3.mk_fpa_rtp(contextPtr)));
            },
            RTN() {
              return new FPRMImpl(check(Z3.mk_fpa_rtn(contextPtr)));
            },
            RTZ() {
              return new FPRMImpl(check(Z3.mk_fpa_rtz(contextPtr)));
            }
          };
          const String2 = {
            sort() {
              return new SeqSortImpl(Z3.mk_string_sort(contextPtr));
            },
            const(name2) {
              return new SeqImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), String2.sort().ptr)));
            },
            consts(names) {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => String2.const(name2));
            },
            val(value) {
              return new SeqImpl(check(Z3.mk_string(contextPtr, value)));
            },
            fromCode(code) {
              const codeExpr = isArith(code) ? code : Int.val(code);
              return new SeqImpl(check(Z3.mk_string_from_code(contextPtr, codeExpr.ast)));
            },
            fromInt(n) {
              const nExpr = isArith(n) ? n : Int.val(n);
              return new SeqImpl(check(Z3.mk_int_to_str(contextPtr, nExpr.ast)));
            }
          };
          const Seq = {
            sort(elemSort) {
              return new SeqSortImpl(Z3.mk_seq_sort(contextPtr, elemSort.ptr));
            },
            empty(elemSort) {
              return new SeqImpl(check(Z3.mk_seq_empty(contextPtr, Seq.sort(elemSort).ptr)));
            },
            unit(elem) {
              return new SeqImpl(check(Z3.mk_seq_unit(contextPtr, elem.ast)));
            }
          };
          const Re = {
            sort(seqSort) {
              return new ReSortImpl(Z3.mk_re_sort(contextPtr, seqSort.ptr));
            },
            toRe(seq) {
              const seqExpr = isSeq(seq) ? seq : String2.val(seq);
              return new ReImpl(check(Z3.mk_seq_to_re(contextPtr, seqExpr.ast)));
            }
          };
          const Array2 = {
            sort(...sig) {
              const arity = sig.length - 1;
              const r = sig[arity];
              const d = sig[0];
              if (arity === 1) {
                return new ArraySortImpl(Z3.mk_array_sort(contextPtr, d.ptr, r.ptr));
              }
              const dom = sig.slice(0, arity);
              return new ArraySortImpl(Z3.mk_array_sort_n(contextPtr, dom.map((s) => s.ptr), r.ptr));
            },
            const(name2, ...sig) {
              return new ArrayImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), Array2.sort(...sig).ptr)));
            },
            consts(names, ...sig) {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => Array2.const(name2, ...sig));
            },
            K(domain, value) {
              return new ArrayImpl(check(Z3.mk_const_array(contextPtr, domain.ptr, value.ptr)));
            },
            fromFunc(f) {
              return new ArrayImpl(check(Z3.mk_as_array(contextPtr, f.ptr)));
            }
          };
          const Set2 = {
            // reference: https://z3prover.github.io/api/html/namespacez3py.html#a545f894afeb24caa1b88b7f2a324ee7e
            sort(sort) {
              return Array2.sort(sort, Bool.sort());
            },
            const(name2, sort) {
              return new SetImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), Array2.sort(sort, Bool.sort()).ptr)));
            },
            consts(names, sort) {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => Set2.const(name2, sort));
            },
            empty(sort) {
              return EmptySet(sort);
            },
            val(values, sort) {
              var result = EmptySet(sort);
              for (const value of values) {
                result = SetAdd(result, value);
              }
              return result;
            }
          };
          const FiniteSet = {
            sort(elemSort) {
              return new FiniteSetSortImpl(check(Z3.mk_finite_set_sort(contextPtr, elemSort.ptr)));
            },
            const(name2, elemSort) {
              return new FiniteSetImpl(check(Z3.mk_const(contextPtr, _toSymbol(name2), FiniteSet.sort(elemSort).ptr)));
            },
            consts(names, elemSort) {
              if (typeof names === "string") {
                names = names.split(" ");
              }
              return names.map((name2) => FiniteSet.const(name2, elemSort));
            },
            empty(sort) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_empty(contextPtr, FiniteSet.sort(sort).ptr)));
            },
            singleton(elem) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_singleton(contextPtr, elem.ast)));
            },
            range(low, high) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_range(contextPtr, low.ast, high.ast)));
            }
          };
          const Datatype = Object.assign((name2) => {
            return new DatatypeImpl(ctx, name2);
          }, {
            createDatatypes(...datatypes) {
              return createDatatypes(...datatypes);
            },
            createPolymorphicDatatype(typeParams, datatype) {
              return createPolymorphicDatatype(typeParams, datatype);
            }
          });
          function TypeVariable(name2) {
            return new SortImpl(check(Z3.mk_type_variable(contextPtr, Z3.mk_string_symbol(contextPtr, name2))));
          }
          function If(condition, onTrue, onFalse) {
            if (isProbe(condition) && isTactic(onTrue) && isTactic(onFalse)) {
              return Cond(condition, onTrue, onFalse);
            }
            (0, utils_1.assert)(!isProbe(condition) && !isTactic(onTrue) && !isTactic(onFalse), "Mixed expressions and goals");
            if (typeof condition === "boolean") {
              condition = Bool.val(condition);
            }
            onTrue = from(onTrue);
            onFalse = from(onFalse);
            return _toExpr(check(Z3.mk_ite(contextPtr, condition.ptr, onTrue.ast, onFalse.ast)));
          }
          function Distinct(...exprs) {
            (0, utils_1.assert)(exprs.length > 0, "Can't make Distinct ouf of nothing");
            return new BoolImpl(check(Z3.mk_distinct(contextPtr, exprs.map((expr) => {
              expr = from(expr);
              _assertContext(expr);
              return expr.ast;
            }))));
          }
          function Const(name2, sort) {
            _assertContext(sort);
            return _toExpr(check(Z3.mk_const(contextPtr, _toSymbol(name2), sort.ptr)));
          }
          function Consts(names, sort) {
            _assertContext(sort);
            if (typeof names === "string") {
              names = names.split(" ");
            }
            return names.map((name2) => Const(name2, sort));
          }
          function FreshConst(sort, prefix = "c") {
            _assertContext(sort);
            return _toExpr(Z3.mk_fresh_const(sort.ctx.ptr, prefix, sort.ptr));
          }
          function Var(idx, sort) {
            _assertContext(sort);
            return _toExpr(Z3.mk_bound(sort.ctx.ptr, idx, sort.ptr));
          }
          function Implies(a, b) {
            a = from(a);
            b = from(b);
            _assertContext(a, b);
            return new BoolImpl(check(Z3.mk_implies(contextPtr, a.ptr, b.ptr)));
          }
          function Iff(a, b) {
            a = from(a);
            b = from(b);
            _assertContext(a, b);
            return new BoolImpl(check(Z3.mk_iff(contextPtr, a.ptr, b.ptr)));
          }
          function Eq(a, b) {
            a = from(a);
            b = from(b);
            _assertContext(a, b);
            return a.eq(b);
          }
          function Xor(a, b) {
            a = from(a);
            b = from(b);
            _assertContext(a, b);
            return new BoolImpl(check(Z3.mk_xor(contextPtr, a.ptr, b.ptr)));
          }
          function Not(a) {
            if (typeof a === "boolean") {
              a = from(a);
            }
            _assertContext(a);
            if (isProbe(a)) {
              return new ProbeImpl(check(Z3.probe_not(contextPtr, a.ptr)));
            }
            return new BoolImpl(check(Z3.mk_not(contextPtr, a.ptr)));
          }
          function And(...args) {
            if (args.length == 1 && args[0] instanceof ctx.AstVector) {
              args = [...args[0].values()];
              (0, utils_1.assert)((0, utils_1.allSatisfy)(args, isBool) ?? true, "AstVector containing not bools");
            }
            const allProbes = (0, utils_1.allSatisfy)(args, isProbe) ?? false;
            if (allProbes) {
              return _probeNary(Z3.probe_and, args);
            } else {
              const castArgs = args.map(from);
              _assertContext(...castArgs);
              return new BoolImpl(check(Z3.mk_and(contextPtr, castArgs.map((arg) => arg.ptr))));
            }
          }
          function Or(...args) {
            if (args.length == 1 && args[0] instanceof ctx.AstVector) {
              args = [...args[0].values()];
              (0, utils_1.assert)((0, utils_1.allSatisfy)(args, isBool) ?? true, "AstVector containing not bools");
            }
            const allProbes = (0, utils_1.allSatisfy)(args, isProbe) ?? false;
            if (allProbes) {
              return _probeNary(Z3.probe_or, args);
            } else {
              const castArgs = args.map(from);
              _assertContext(...castArgs);
              return new BoolImpl(check(Z3.mk_or(contextPtr, castArgs.map((arg) => arg.ptr))));
            }
          }
          function PbEq(args, coeffs, k) {
            _assertContext(...args);
            if (args.length !== coeffs.length) {
              throw new Error("Number of arguments and coefficients must match");
            }
            return new BoolImpl(check(Z3.mk_pbeq(contextPtr, args.map((arg) => arg.ast), coeffs, k)));
          }
          function PbGe(args, coeffs, k) {
            _assertContext(...args);
            if (args.length !== coeffs.length) {
              throw new Error("Number of arguments and coefficients must match");
            }
            return new BoolImpl(check(Z3.mk_pbge(contextPtr, args.map((arg) => arg.ast), coeffs, k)));
          }
          function PbLe(args, coeffs, k) {
            _assertContext(...args);
            if (args.length !== coeffs.length) {
              throw new Error("Number of arguments and coefficients must match");
            }
            return new BoolImpl(check(Z3.mk_pble(contextPtr, args.map((arg) => arg.ast), coeffs, k)));
          }
          function AtMost(args, k) {
            _assertContext(...args);
            return new BoolImpl(check(Z3.mk_atmost(contextPtr, args.map((arg) => arg.ast), k)));
          }
          function AtLeast(args, k) {
            _assertContext(...args);
            return new BoolImpl(check(Z3.mk_atleast(contextPtr, args.map((arg) => arg.ast), k)));
          }
          function ForAll(quantifiers, body, weight = 1) {
            if (!(0, utils_1.allSatisfy)(quantifiers, isConst)) {
              throw new Error("Quantifier variables must be constants");
            }
            return new NonLambdaQuantifierImpl(check(Z3.mk_quantifier_const_ex(
              contextPtr,
              true,
              weight,
              _toSymbol(""),
              _toSymbol(""),
              quantifiers.map((q) => q.ptr),
              // The earlier check verifies these are all apps
              [],
              [],
              body.ptr
            )));
          }
          function Exists(quantifiers, body, weight = 1) {
            if (!(0, utils_1.allSatisfy)(quantifiers, isConst)) {
              throw new Error("Quantifier variables must be constants");
            }
            return new NonLambdaQuantifierImpl(check(Z3.mk_quantifier_const_ex(
              contextPtr,
              false,
              weight,
              _toSymbol(""),
              _toSymbol(""),
              quantifiers.map((q) => q.ptr),
              // The earlier check verifies these are all apps
              [],
              [],
              body.ptr
            )));
          }
          function Lambda(quantifiers, expr) {
            if (!(0, utils_1.allSatisfy)(quantifiers, isConst)) {
              throw new Error("Quantifier variables must be constants");
            }
            return new LambdaImpl(check(Z3.mk_lambda_const(contextPtr, quantifiers.map((q) => q.ptr), expr.ptr)));
          }
          function ToReal(expr) {
            expr = from(expr);
            _assertContext(expr);
            (0, utils_1.assert)(isInt(expr), "Int expression expected");
            return new ArithImpl(check(Z3.mk_int2real(contextPtr, expr.ast)));
          }
          function ToInt(expr) {
            if (!isExpr(expr)) {
              expr = Real.val(expr);
            }
            _assertContext(expr);
            (0, utils_1.assert)(isReal(expr), "Real expression expected");
            return new ArithImpl(check(Z3.mk_real2int(contextPtr, expr.ast)));
          }
          function IsInt(expr) {
            if (!isExpr(expr)) {
              expr = Real.val(expr);
            }
            _assertContext(expr);
            (0, utils_1.assert)(isReal(expr), "Real expression expected");
            return new BoolImpl(check(Z3.mk_is_int(contextPtr, expr.ast)));
          }
          function Sqrt(a) {
            if (!isExpr(a)) {
              a = Real.val(a);
            }
            return a.pow("1/2");
          }
          function Cbrt(a) {
            if (!isExpr(a)) {
              a = Real.val(a);
            }
            return a.pow("1/3");
          }
          function BV2Int(a, isSigned) {
            _assertContext(a);
            return new ArithImpl(check(Z3.mk_bv2int(contextPtr, a.ast, isSigned)));
          }
          function Int2BV(a, bits) {
            if (isArith(a)) {
              (0, utils_1.assert)(isInt(a), "parameter must be an integer");
            } else {
              (0, utils_1.assert)(typeof a !== "number" || Number.isSafeInteger(a), "parameter must not have decimal places");
              a = Int.val(a);
            }
            return new BitVecImpl(check(Z3.mk_int2bv(contextPtr, bits, a.ast)));
          }
          function Concat(...bitvecs) {
            _assertContext(...bitvecs);
            return bitvecs.reduce((prev, curr) => new BitVecImpl(check(Z3.mk_concat(contextPtr, prev.ast, curr.ast))));
          }
          function Cond(probe, onTrue, onFalse) {
            _assertContext(probe, onTrue, onFalse);
            return new TacticImpl(check(Z3.tactic_cond(contextPtr, probe.ptr, onTrue.ptr, onFalse.ptr)));
          }
          function _toTactic(t) {
            return typeof t === "string" ? new TacticImpl(t) : t;
          }
          function AndThen(t1, t2, ...ts) {
            let result = _toTactic(t1);
            let current = _toTactic(t2);
            _assertContext(result, current);
            result = new TacticImpl(check(Z3.tactic_and_then(contextPtr, result.ptr, current.ptr)));
            for (const t of ts) {
              current = _toTactic(t);
              _assertContext(result, current);
              result = new TacticImpl(check(Z3.tactic_and_then(contextPtr, result.ptr, current.ptr)));
            }
            return result;
          }
          function OrElse(t1, t2, ...ts) {
            let result = _toTactic(t1);
            let current = _toTactic(t2);
            _assertContext(result, current);
            result = new TacticImpl(check(Z3.tactic_or_else(contextPtr, result.ptr, current.ptr)));
            for (const t of ts) {
              current = _toTactic(t);
              _assertContext(result, current);
              result = new TacticImpl(check(Z3.tactic_or_else(contextPtr, result.ptr, current.ptr)));
            }
            return result;
          }
          const UINT_MAX = 4294967295;
          function Repeat(t, max) {
            const tactic = _toTactic(t);
            _assertContext(tactic);
            const maxVal = max !== void 0 ? max : UINT_MAX;
            return new TacticImpl(check(Z3.tactic_repeat(contextPtr, tactic.ptr, maxVal)));
          }
          function TryFor(t, ms) {
            const tactic = _toTactic(t);
            _assertContext(tactic);
            return new TacticImpl(check(Z3.tactic_try_for(contextPtr, tactic.ptr, ms)));
          }
          function When(p, t) {
            const tactic = _toTactic(t);
            _assertContext(p, tactic);
            return new TacticImpl(check(Z3.tactic_when(contextPtr, p.ptr, tactic.ptr)));
          }
          function Skip() {
            return new TacticImpl(check(Z3.tactic_skip(contextPtr)));
          }
          function Fail() {
            return new TacticImpl(check(Z3.tactic_fail(contextPtr)));
          }
          function FailIf(p) {
            _assertContext(p);
            return new TacticImpl(check(Z3.tactic_fail_if(contextPtr, p.ptr)));
          }
          function ParOr(...tactics) {
            (0, utils_1.assert)(tactics.length > 0, "ParOr requires at least one tactic");
            const tacticImpls = tactics.map((t) => _toTactic(t));
            _assertContext(...tacticImpls);
            const tacticPtrs = tacticImpls.map((t) => t.ptr);
            return new TacticImpl(check(Z3.tactic_par_or(contextPtr, tacticPtrs)));
          }
          function ParAndThen(t1, t2) {
            const tactic1 = _toTactic(t1);
            const tactic2 = _toTactic(t2);
            _assertContext(tactic1, tactic2);
            return new TacticImpl(check(Z3.tactic_par_and_then(contextPtr, tactic1.ptr, tactic2.ptr)));
          }
          function With(t, params) {
            const tactic = _toTactic(t);
            _assertContext(tactic);
            const z3params = check(Z3.mk_params(contextPtr));
            Z3.params_inc_ref(contextPtr, z3params);
            try {
              for (const [key, value] of Object.entries(params)) {
                const sym = _toSymbol(key);
                if (typeof value === "boolean") {
                  Z3.params_set_bool(contextPtr, z3params, sym, value);
                } else if (typeof value === "number") {
                  if (Number.isInteger(value)) {
                    Z3.params_set_uint(contextPtr, z3params, sym, value);
                  } else {
                    Z3.params_set_double(contextPtr, z3params, sym, value);
                  }
                } else if (typeof value === "string") {
                  Z3.params_set_symbol(contextPtr, z3params, sym, _toSymbol(value));
                } else {
                  throw new Error(`Unsupported parameter type for ${key}`);
                }
              }
              const result = new TacticImpl(check(Z3.tactic_using_params(contextPtr, tactic.ptr, z3params)));
              return result;
            } finally {
              Z3.params_dec_ref(contextPtr, z3params);
            }
          }
          function LT(a, b) {
            return new BoolImpl(check(Z3.mk_lt(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function GT(a, b) {
            return new BoolImpl(check(Z3.mk_gt(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function LE(a, b) {
            return new BoolImpl(check(Z3.mk_le(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function GE(a, b) {
            return new BoolImpl(check(Z3.mk_ge(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function ULT(a, b) {
            return new BoolImpl(check(Z3.mk_bvult(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function UGT(a, b) {
            return new BoolImpl(check(Z3.mk_bvugt(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function ULE(a, b) {
            return new BoolImpl(check(Z3.mk_bvule(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function UGE(a, b) {
            return new BoolImpl(check(Z3.mk_bvuge(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function SLT(a, b) {
            return new BoolImpl(check(Z3.mk_bvslt(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function SGT(a, b) {
            return new BoolImpl(check(Z3.mk_bvsgt(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function SLE(a, b) {
            return new BoolImpl(check(Z3.mk_bvsle(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function SGE(a, b) {
            return new BoolImpl(check(Z3.mk_bvsge(contextPtr, a.ast, a.sort.cast(b).ast)));
          }
          function Extract(hi, lo, val) {
            return new BitVecImpl(check(Z3.mk_extract(contextPtr, hi, lo, val.ast)));
          }
          function Select(array, ...indices) {
            const args = indices.map((arg, i) => array.domain_n(i).cast(arg));
            if (args.length === 1) {
              return _toExpr(check(Z3.mk_select(contextPtr, array.ast, args[0].ast)));
            }
            const _args = args.map((arg) => arg.ast);
            return _toExpr(check(Z3.mk_select_n(contextPtr, array.ast, _args)));
          }
          function Store(array, ...indicesAndValue) {
            const args = indicesAndValue.map((arg, i) => {
              if (i === indicesAndValue.length - 1) {
                return array.range().cast(arg);
              }
              return array.domain_n(i).cast(arg);
            });
            if (args.length <= 1) {
              throw new Error("Array store requires both index and value arguments");
            }
            if (args.length === 2) {
              return _toExpr(check(Z3.mk_store(contextPtr, array.ast, args[0].ast, args[1].ast)));
            }
            const _idxs = args.slice(0, args.length - 1).map((arg) => arg.ast);
            return _toExpr(check(Z3.mk_store_n(contextPtr, array.ast, _idxs, args[args.length - 1].ast)));
          }
          function Ext(a, b) {
            return _toExpr(check(Z3.mk_array_ext(contextPtr, a.ast, b.ast)));
          }
          function SetUnion(...args) {
            return new SetImpl(check(Z3.mk_set_union(contextPtr, args.map((arg) => arg.ast))));
          }
          function SetIntersect(...args) {
            return new SetImpl(check(Z3.mk_set_intersect(contextPtr, args.map((arg) => arg.ast))));
          }
          function SetDifference(a, b) {
            return new SetImpl(check(Z3.mk_set_difference(contextPtr, a.ast, b.ast)));
          }
          function SetAdd(set, elem) {
            const arg = set.elemSort().cast(elem);
            return new SetImpl(check(Z3.mk_set_add(contextPtr, set.ast, arg.ast)));
          }
          function SetDel(set, elem) {
            const arg = set.elemSort().cast(elem);
            return new SetImpl(check(Z3.mk_set_del(contextPtr, set.ast, arg.ast)));
          }
          function SetComplement(set) {
            return new SetImpl(check(Z3.mk_set_complement(contextPtr, set.ast)));
          }
          function EmptySet(sort) {
            return new SetImpl(check(Z3.mk_empty_set(contextPtr, sort.ptr)));
          }
          function FullSet(sort) {
            return new SetImpl(check(Z3.mk_full_set(contextPtr, sort.ptr)));
          }
          function isMember(elem, set) {
            const arg = set.elemSort().cast(elem);
            return new BoolImpl(check(Z3.mk_set_member(contextPtr, arg.ast, set.ast)));
          }
          function isSubset(a, b) {
            return new BoolImpl(check(Z3.mk_set_subset(contextPtr, a.ast, b.ast)));
          }
          function InRe(seq, re) {
            const seqExpr = isSeq(seq) ? seq : String2.val(seq);
            return new BoolImpl(check(Z3.mk_seq_in_re(contextPtr, seqExpr.ast, re.ast)));
          }
          function Union(...res) {
            if (res.length === 0) {
              throw new Error("Union requires at least one argument");
            }
            if (res.length === 1) {
              return res[0];
            }
            return new ReImpl(check(Z3.mk_re_union(contextPtr, res.map((r) => r.ast))));
          }
          function Intersect(...res) {
            if (res.length === 0) {
              throw new Error("Intersect requires at least one argument");
            }
            if (res.length === 1) {
              return res[0];
            }
            return new ReImpl(check(Z3.mk_re_intersect(contextPtr, res.map((r) => r.ast))));
          }
          function ReConcat(...res) {
            if (res.length === 0) {
              throw new Error("ReConcat requires at least one argument");
            }
            if (res.length === 1) {
              return res[0];
            }
            return new ReImpl(check(Z3.mk_re_concat(contextPtr, res.map((r) => r.ast))));
          }
          function Plus(re) {
            return new ReImpl(check(Z3.mk_re_plus(contextPtr, re.ast)));
          }
          function Star(re) {
            return new ReImpl(check(Z3.mk_re_star(contextPtr, re.ast)));
          }
          function Option(re) {
            return new ReImpl(check(Z3.mk_re_option(contextPtr, re.ast)));
          }
          function Complement(re) {
            return new ReImpl(check(Z3.mk_re_complement(contextPtr, re.ast)));
          }
          function Diff(a, b) {
            return new ReImpl(check(Z3.mk_re_diff(contextPtr, a.ast, b.ast)));
          }
          function Range(lo, hi) {
            const loSeq = isSeq(lo) ? lo : String2.val(lo);
            const hiSeq = isSeq(hi) ? hi : String2.val(hi);
            return new ReImpl(check(Z3.mk_re_range(contextPtr, loSeq.ast, hiSeq.ast)));
          }
          function Loop(re, lo, hi = 0) {
            return new ReImpl(check(Z3.mk_re_loop(contextPtr, re.ast, lo, hi)));
          }
          function Power(re, n) {
            return new ReImpl(check(Z3.mk_re_power(contextPtr, re.ast, n)));
          }
          function AllChar(reSort) {
            return new ReImpl(check(Z3.mk_re_allchar(contextPtr, reSort.ptr)));
          }
          function Empty(reSort) {
            return new ReImpl(check(Z3.mk_re_empty(contextPtr, reSort.ptr)));
          }
          function Full(reSort) {
            return new ReImpl(check(Z3.mk_re_full(contextPtr, reSort.ptr)));
          }
          function mkPartialOrder(sort, index) {
            return new FuncDeclImpl(check(Z3.mk_partial_order(contextPtr, sort.ptr, index)));
          }
          function mkLinearOrder(sort, index) {
            return new FuncDeclImpl(check(Z3.mk_linear_order(contextPtr, sort.ptr, index)));
          }
          function mkPiecewiseLinearOrder(sort, index) {
            return new FuncDeclImpl(check(Z3.mk_piecewise_linear_order(contextPtr, sort.ptr, index)));
          }
          function mkTreeOrder(sort, index) {
            return new FuncDeclImpl(check(Z3.mk_tree_order(contextPtr, sort.ptr, index)));
          }
          function mkTransitiveClosure(f) {
            return new FuncDeclImpl(check(Z3.mk_transitive_closure(contextPtr, f.ptr)));
          }
          function mkChar(ch) {
            return new ExprImpl(check(Z3.mk_char(contextPtr, ch)));
          }
          function mkCharLe(ch1, ch2) {
            return new BoolImpl(check(Z3.mk_char_le(contextPtr, ch1.ast, ch2.ast)));
          }
          function mkCharToInt(ch) {
            return new ArithImpl(check(Z3.mk_char_to_int(contextPtr, ch.ast)));
          }
          function mkCharToBV(ch) {
            return new ExprImpl(check(Z3.mk_char_to_bv(contextPtr, ch.ast)));
          }
          function mkCharFromBV(bv) {
            return new ExprImpl(check(Z3.mk_char_from_bv(contextPtr, bv.ast)));
          }
          function mkCharIsDigit(ch) {
            return new BoolImpl(check(Z3.mk_char_is_digit(contextPtr, ch.ast)));
          }
          async function polynomialSubresultants(p, q, x) {
            const result = await Z3.polynomial_subresultants(contextPtr, p.ast, q.ast, x.ast);
            return new AstVectorImpl(check(result));
          }
          class AstImpl {
            constructor(ptr) {
              this.ptr = ptr;
              this.ctx = ctx;
              const myAst = this.ast;
              Z3.inc_ref(contextPtr, myAst);
              cleanup.register(this, () => Z3.dec_ref(contextPtr, myAst), this);
            }
            get ast() {
              return this.ptr;
            }
            id() {
              return Z3.get_ast_id(contextPtr, this.ast);
            }
            eqIdentity(other) {
              _assertContext(other);
              return check(Z3.is_eq_ast(contextPtr, this.ast, other.ast));
            }
            neqIdentity(other) {
              _assertContext(other);
              return !this.eqIdentity(other);
            }
            sexpr() {
              return Z3.ast_to_string(contextPtr, this.ast);
            }
            hash() {
              return Z3.get_ast_hash(contextPtr, this.ast);
            }
            toString() {
              return this.sexpr();
            }
          }
          class SolverImpl {
            get ptr() {
              _assertPtr(this._ptr);
              return this._ptr;
            }
            constructor(ptr = Z3.mk_solver(contextPtr)) {
              this.ctx = ctx;
              let myPtr;
              if (typeof ptr === "string") {
                myPtr = check(Z3.mk_solver_for_logic(contextPtr, _toSymbol(ptr)));
              } else {
                myPtr = ptr;
              }
              this._ptr = myPtr;
              Z3.solver_inc_ref(contextPtr, myPtr);
              const onClauseCallbackIdx = { value: null };
              this._onClauseCallbackIdx = onClauseCallbackIdx;
              cleanup.register(this, () => {
                Z3.solver_dec_ref(contextPtr, myPtr);
                if (onClauseCallbackIdx.value !== null && em) {
                  em.removeFunction(onClauseCallbackIdx.value);
                  onClauseCallbackIdx.value = null;
                }
              }, this);
            }
            set(key, value) {
              Z3.solver_set_params(contextPtr, this.ptr, _toParams(key, value));
            }
            push() {
              Z3.solver_push(contextPtr, this.ptr);
            }
            pop(num = 1) {
              Z3.solver_pop(contextPtr, this.ptr, num);
            }
            numScopes() {
              return Z3.solver_get_num_scopes(contextPtr, this.ptr);
            }
            reset() {
              Z3.solver_reset(contextPtr, this.ptr);
            }
            add(...exprs) {
              _flattenArgs(exprs).forEach((expr) => {
                _assertContext(expr);
                check(Z3.solver_assert(contextPtr, this.ptr, expr.ast));
              });
            }
            addAndTrack(expr, constant) {
              if (typeof constant === "string") {
                constant = Bool.const(constant);
              }
              (0, utils_1.assert)(isConst(constant), "Provided expression that is not a constant to addAndTrack");
              check(Z3.solver_assert_and_track(contextPtr, this.ptr, expr.ast, constant.ast));
            }
            addSimplifier(simplifier) {
              _assertContext(simplifier);
              check(Z3.solver_add_simplifier(contextPtr, this.ptr, simplifier.ptr));
            }
            assertions() {
              return new AstVectorImpl(check(Z3.solver_get_assertions(contextPtr, this.ptr)));
            }
            async check(...exprs) {
              const assumptions = _flattenArgs(exprs).map((expr) => {
                _assertContext(expr);
                return expr.ast;
              });
              const result = await asyncMutex.runExclusive(() => check(Z3.solver_check_assumptions(contextPtr, this.ptr, assumptions)));
              switch (result) {
                case low_level_1.Z3_lbool.Z3_L_FALSE:
                  return "unsat";
                case low_level_1.Z3_lbool.Z3_L_TRUE:
                  return "sat";
                case low_level_1.Z3_lbool.Z3_L_UNDEF:
                  return "unknown";
                default:
                  (0, utils_1.assertExhaustive)(result);
              }
            }
            unsatCore() {
              return new AstVectorImpl(check(Z3.solver_get_unsat_core(contextPtr, this.ptr)));
            }
            model() {
              return new ModelImpl(check(Z3.solver_get_model(contextPtr, this.ptr)));
            }
            statistics() {
              return new StatisticsImpl(check(Z3.solver_get_statistics(contextPtr, this.ptr)));
            }
            reasonUnknown() {
              return check(Z3.solver_get_reason_unknown(contextPtr, this.ptr));
            }
            toString() {
              return check(Z3.solver_to_string(contextPtr, this.ptr));
            }
            toSmtlib2(status = "unknown") {
              const assertionsVec = this.assertions();
              const numAssertions = assertionsVec.length();
              let formula;
              let assumptions;
              if (numAssertions > 0) {
                assumptions = [];
                for (let i = 0; i < numAssertions - 1; i++) {
                  assumptions.push(assertionsVec.get(i).ast);
                }
                formula = assertionsVec.get(numAssertions - 1).ast;
              } else {
                assumptions = [];
                formula = ctx.Bool.val(true).ast;
              }
              return check(Z3.benchmark_to_smtlib_string(contextPtr, "", "", status, "", assumptions, formula));
            }
            dimacs(includeNames = true) {
              return check(Z3.solver_to_dimacs_string(contextPtr, this.ptr, includeNames));
            }
            translate(target) {
              const ptr = check(Z3.solver_translate(contextPtr, this.ptr, target.ptr));
              return new target.Solver(ptr);
            }
            proof() {
              const result = Z3.solver_get_proof(contextPtr, this.ptr);
              throwIfError();
              if (!result) {
                return null;
              }
              return _toExpr(result);
            }
            fromString(s) {
              Z3.solver_from_string(contextPtr, this.ptr, s);
              throwIfError();
            }
            units() {
              return new AstVectorImpl(check(Z3.solver_get_units(contextPtr, this.ptr)));
            }
            nonUnits() {
              return new AstVectorImpl(check(Z3.solver_get_non_units(contextPtr, this.ptr)));
            }
            trail() {
              return new AstVectorImpl(check(Z3.solver_get_trail(contextPtr, this.ptr)));
            }
            trailLevels() {
              const trailVec = check(Z3.solver_get_trail(contextPtr, this.ptr));
              const n = Z3.ast_vector_size(contextPtr, trailVec);
              return check(Z3.solver_get_levels(contextPtr, this.ptr, trailVec, n));
            }
            async cube(vars, cutoff = 4294967295) {
              const tempVars = vars ?? new AstVectorImpl();
              const result = await asyncMutex.runExclusive(() => check(Z3.solver_cube(contextPtr, this.ptr, tempVars.ptr, cutoff)));
              return new AstVectorImpl(result);
            }
            async getConsequences(assumptions, variables) {
              const asmsVec = new AstVectorImpl();
              const varsVec = new AstVectorImpl();
              const consVec = new AstVectorImpl();
              _flattenArgs(assumptions).forEach((expr) => {
                _assertContext(expr);
                Z3.ast_vector_push(contextPtr, asmsVec.ptr, expr.ast);
              });
              variables.forEach((v) => {
                _assertContext(v);
                Z3.ast_vector_push(contextPtr, varsVec.ptr, v.ast);
              });
              const r = await asyncMutex.runExclusive(() => check(Z3.solver_get_consequences(contextPtr, this.ptr, asmsVec.ptr, varsVec.ptr, consVec.ptr)));
              let status;
              switch (r) {
                case low_level_1.Z3_lbool.Z3_L_FALSE:
                  status = "unsat";
                  break;
                case low_level_1.Z3_lbool.Z3_L_TRUE:
                  status = "sat";
                  break;
                default:
                  status = "unknown";
              }
              return [status, consVec];
            }
            solveFor(variables, terms, guards) {
              const varsVec = new AstVectorImpl();
              const termsVec = new AstVectorImpl();
              const guardsVec = new AstVectorImpl();
              variables.forEach((v) => {
                _assertContext(v);
                Z3.ast_vector_push(contextPtr, varsVec.ptr, v.ast);
              });
              terms.forEach((t) => {
                _assertContext(t);
                Z3.ast_vector_push(contextPtr, termsVec.ptr, t.ast);
              });
              guards.forEach((g) => {
                _assertContext(g);
                Z3.ast_vector_push(contextPtr, guardsVec.ptr, g.ast);
              });
              Z3.solver_solve_for(contextPtr, this.ptr, varsVec.ptr, termsVec.ptr, guardsVec.ptr);
              throwIfError();
            }
            setInitialValue(variable, value) {
              _assertContext(variable);
              _assertContext(value);
              Z3.solver_set_initial_value(contextPtr, this.ptr, variable.ast, value.ast);
              throwIfError();
            }
            congruenceRoot(expr) {
              _assertContext(expr);
              return _toExpr(check(Z3.solver_congruence_root(contextPtr, this.ptr, expr.ast)));
            }
            congruenceNext(expr) {
              _assertContext(expr);
              return _toExpr(check(Z3.solver_congruence_next(contextPtr, this.ptr, expr.ast)));
            }
            congruenceExplain(a, b) {
              _assertContext(a);
              _assertContext(b);
              return _toExpr(check(Z3.solver_congruence_explain(contextPtr, this.ptr, a.ast, b.ast)));
            }
            fromFile(filename) {
              Z3.solver_from_file(contextPtr, this.ptr, filename);
              throwIfError();
            }
            release() {
              if (this._onClauseCallbackIdx.value !== null && em) {
                em.removeFunction(this._onClauseCallbackIdx.value);
                this._onClauseCallbackIdx.value = null;
              }
              Z3.solver_dec_ref(contextPtr, this.ptr);
              this._ptr = null;
              cleanup.unregister(this);
            }
            registerOnClause(callback) {
              if (!em) {
                throw new Error("registerOnClause requires the Emscripten module; pass it to createApi");
              }
              if (this._onClauseCallbackIdx.value !== null) {
                em.removeFunction(this._onClauseCallbackIdx.value);
                this._onClauseCallbackIdx.value = null;
              }
              const cCallback = em.addFunction((_ctxPtr, proofHintPtr, n, depsPtr, literalsPtr) => {
                const proofHint = proofHintPtr ? _toExpr(proofHintPtr) : null;
                const deps = [];
                for (let i = 0; i < n; i++) {
                  deps.push(em.HEAPU32[(depsPtr >> 2) + i]);
                }
                const clause = new AstVectorImpl(literalsPtr);
                callback(proofHint, deps, clause);
              }, "viiiii");
              this._onClauseCallbackIdx.value = cCallback;
              em._Z3_solver_register_on_clause(contextPtr, this.ptr, 0, cCallback);
            }
          }
          class OptimizeImpl {
            get ptr() {
              _assertPtr(this._ptr);
              return this._ptr;
            }
            constructor(ptr = Z3.mk_optimize(contextPtr)) {
              this.ctx = ctx;
              let myPtr;
              myPtr = ptr;
              this._ptr = myPtr;
              Z3.optimize_inc_ref(contextPtr, myPtr);
              cleanup.register(this, () => Z3.optimize_dec_ref(contextPtr, myPtr), this);
            }
            set(key, value) {
              Z3.optimize_set_params(contextPtr, this.ptr, _toParams(key, value));
            }
            push() {
              Z3.optimize_push(contextPtr, this.ptr);
            }
            pop() {
              Z3.optimize_pop(contextPtr, this.ptr);
            }
            add(...exprs) {
              _flattenArgs(exprs).forEach((expr) => {
                _assertContext(expr);
                check(Z3.optimize_assert(contextPtr, this.ptr, expr.ast));
              });
            }
            addSoft(expr, weight, id = "") {
              if (isCoercibleRational(weight)) {
                weight = `${weight.numerator}/${weight.denominator}`;
              }
              check(Z3.optimize_assert_soft(contextPtr, this.ptr, expr.ast, weight.toString(), _toSymbol(id)));
            }
            addAndTrack(expr, constant) {
              if (typeof constant === "string") {
                constant = Bool.const(constant);
              }
              (0, utils_1.assert)(isConst(constant), "Provided expression that is not a constant to addAndTrack");
              check(Z3.optimize_assert_and_track(contextPtr, this.ptr, expr.ast, constant.ast));
            }
            assertions() {
              return new AstVectorImpl(check(Z3.optimize_get_assertions(contextPtr, this.ptr)));
            }
            maximize(expr) {
              return check(Z3.optimize_maximize(contextPtr, this.ptr, expr.ast));
            }
            minimize(expr) {
              return check(Z3.optimize_minimize(contextPtr, this.ptr, expr.ast));
            }
            getLower(index) {
              return _toExpr(check(Z3.optimize_get_lower(contextPtr, this.ptr, index)));
            }
            getUpper(index) {
              return _toExpr(check(Z3.optimize_get_upper(contextPtr, this.ptr, index)));
            }
            getLowerAsVector(index) {
              return new AstVectorImpl(check(Z3.optimize_get_lower_as_vector(contextPtr, this.ptr, index)));
            }
            getUpperAsVector(index) {
              return new AstVectorImpl(check(Z3.optimize_get_upper_as_vector(contextPtr, this.ptr, index)));
            }
            unsatCore() {
              return new AstVectorImpl(check(Z3.optimize_get_unsat_core(contextPtr, this.ptr)));
            }
            objectives() {
              return new AstVectorImpl(check(Z3.optimize_get_objectives(contextPtr, this.ptr)));
            }
            reasonUnknown() {
              return check(Z3.optimize_get_reason_unknown(contextPtr, this.ptr));
            }
            fromFile(filename) {
              Z3.optimize_from_file(contextPtr, this.ptr, filename);
              throwIfError();
            }
            translate(target) {
              const ptr = check(Z3.optimize_translate(contextPtr, this.ptr, target.ptr));
              return new target.Optimize(ptr);
            }
            async check(...exprs) {
              const assumptions = _flattenArgs(exprs).map((expr) => {
                _assertContext(expr);
                return expr.ast;
              });
              const result = await asyncMutex.runExclusive(() => check(Z3.optimize_check(contextPtr, this.ptr, assumptions)));
              switch (result) {
                case low_level_1.Z3_lbool.Z3_L_FALSE:
                  return "unsat";
                case low_level_1.Z3_lbool.Z3_L_TRUE:
                  return "sat";
                case low_level_1.Z3_lbool.Z3_L_UNDEF:
                  return "unknown";
                default:
                  (0, utils_1.assertExhaustive)(result);
              }
            }
            model() {
              return new ModelImpl(check(Z3.optimize_get_model(contextPtr, this.ptr)));
            }
            statistics() {
              return new StatisticsImpl(check(Z3.optimize_get_statistics(contextPtr, this.ptr)));
            }
            setInitialValue(variable, value) {
              _assertContext(variable);
              _assertContext(value);
              Z3.optimize_set_initial_value(contextPtr, this.ptr, variable.ast, value.ast);
              throwIfError();
            }
            toString() {
              return check(Z3.optimize_to_string(contextPtr, this.ptr));
            }
            fromString(s) {
              Z3.optimize_from_string(contextPtr, this.ptr, s);
              throwIfError();
            }
            release() {
              Z3.optimize_dec_ref(contextPtr, this.ptr);
              this._ptr = null;
              cleanup.unregister(this);
            }
          }
          class FixedpointImpl {
            get ptr() {
              _assertPtr(this._ptr);
              return this._ptr;
            }
            constructor(ptr = Z3.mk_fixedpoint(contextPtr)) {
              this.ctx = ctx;
              let myPtr;
              myPtr = ptr;
              this._ptr = myPtr;
              Z3.fixedpoint_inc_ref(contextPtr, myPtr);
              cleanup.register(this, () => Z3.fixedpoint_dec_ref(contextPtr, myPtr), this);
            }
            set(key, value) {
              Z3.fixedpoint_set_params(contextPtr, this.ptr, _toParams(key, value));
            }
            help() {
              return check(Z3.fixedpoint_get_help(contextPtr, this.ptr));
            }
            add(...constraints) {
              constraints.forEach((constraint) => {
                _assertContext(constraint);
                check(Z3.fixedpoint_assert(contextPtr, this.ptr, constraint.ast));
              });
            }
            registerRelation(pred) {
              _assertContext(pred);
              check(Z3.fixedpoint_register_relation(contextPtr, this.ptr, pred.ptr));
            }
            addRule(rule, name2) {
              _assertContext(rule);
              const symbol = _toSymbol(name2 ?? "");
              check(Z3.fixedpoint_add_rule(contextPtr, this.ptr, rule.ast, symbol));
            }
            addFact(pred, ...args) {
              _assertContext(pred);
              check(Z3.fixedpoint_add_fact(contextPtr, this.ptr, pred.ptr, args));
            }
            updateRule(rule, name2) {
              _assertContext(rule);
              const symbol = _toSymbol(name2);
              check(Z3.fixedpoint_update_rule(contextPtr, this.ptr, rule.ast, symbol));
            }
            async query(query) {
              _assertContext(query);
              const result = await asyncMutex.runExclusive(() => check(Z3.fixedpoint_query(contextPtr, this.ptr, query.ast)));
              switch (result) {
                case low_level_1.Z3_lbool.Z3_L_FALSE:
                  return "unsat";
                case low_level_1.Z3_lbool.Z3_L_TRUE:
                  return "sat";
                case low_level_1.Z3_lbool.Z3_L_UNDEF:
                  return "unknown";
                default:
                  (0, utils_1.assertExhaustive)(result);
              }
            }
            async queryRelations(...relations) {
              relations.forEach((rel) => _assertContext(rel));
              const decls = relations.map((rel) => rel.ptr);
              const result = await asyncMutex.runExclusive(() => check(Z3.fixedpoint_query_relations(contextPtr, this.ptr, decls)));
              switch (result) {
                case low_level_1.Z3_lbool.Z3_L_FALSE:
                  return "unsat";
                case low_level_1.Z3_lbool.Z3_L_TRUE:
                  return "sat";
                case low_level_1.Z3_lbool.Z3_L_UNDEF:
                  return "unknown";
                default:
                  (0, utils_1.assertExhaustive)(result);
              }
            }
            getAnswer() {
              const ans = check(Z3.fixedpoint_get_answer(contextPtr, this.ptr));
              return ans ? _toExpr(ans) : null;
            }
            getReasonUnknown() {
              return check(Z3.fixedpoint_get_reason_unknown(contextPtr, this.ptr));
            }
            getNumLevels(pred) {
              _assertContext(pred);
              return check(Z3.fixedpoint_get_num_levels(contextPtr, this.ptr, pred.ptr));
            }
            getCoverDelta(level, pred) {
              _assertContext(pred);
              const res = check(Z3.fixedpoint_get_cover_delta(contextPtr, this.ptr, level, pred.ptr));
              return res ? _toExpr(res) : null;
            }
            addCover(level, pred, property) {
              _assertContext(pred);
              _assertContext(property);
              check(Z3.fixedpoint_add_cover(contextPtr, this.ptr, level, pred.ptr, property.ast));
            }
            getRules() {
              return new AstVectorImpl(check(Z3.fixedpoint_get_rules(contextPtr, this.ptr)));
            }
            getAssertions() {
              return new AstVectorImpl(check(Z3.fixedpoint_get_assertions(contextPtr, this.ptr)));
            }
            setPredicateRepresentation(pred, kinds) {
              _assertContext(pred);
              const symbols = kinds.map((kind) => _toSymbol(kind));
              check(Z3.fixedpoint_set_predicate_representation(contextPtr, this.ptr, pred.ptr, symbols));
            }
            toString() {
              return check(Z3.fixedpoint_to_string(contextPtr, this.ptr, []));
            }
            fromString(s) {
              const av = check(Z3.fixedpoint_from_string(contextPtr, this.ptr, s));
              return new AstVectorImpl(av);
            }
            fromFile(file) {
              const av = check(Z3.fixedpoint_from_file(contextPtr, this.ptr, file));
              return new AstVectorImpl(av);
            }
            statistics() {
              return new StatisticsImpl(check(Z3.fixedpoint_get_statistics(contextPtr, this.ptr)));
            }
            release() {
              Z3.fixedpoint_dec_ref(contextPtr, this.ptr);
              this._ptr = null;
              cleanup.unregister(this);
            }
          }
          class ModelImpl {
            get ptr() {
              _assertPtr(this._ptr);
              return this._ptr;
            }
            constructor(ptr = Z3.mk_model(contextPtr)) {
              this.ctx = ctx;
              this._ptr = ptr;
              Z3.model_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.model_dec_ref(contextPtr, ptr), this);
            }
            length() {
              return Z3.model_get_num_consts(contextPtr, this.ptr) + Z3.model_get_num_funcs(contextPtr, this.ptr);
            }
            [Symbol.iterator]() {
              return this.values();
            }
            *entries() {
              const length = this.length();
              for (let i = 0; i < length; i++) {
                yield [i, this.get(i)];
              }
            }
            *keys() {
              for (const [key] of this.entries()) {
                yield key;
              }
            }
            *values() {
              for (const [, value] of this.entries()) {
                yield value;
              }
            }
            decls() {
              return [...this.values()];
            }
            sexpr() {
              return check(Z3.model_to_string(contextPtr, this.ptr));
            }
            toString() {
              return this.sexpr();
            }
            eval(expr, modelCompletion = false) {
              _assertContext(expr);
              const r = check(Z3.model_eval(contextPtr, this.ptr, expr.ast, modelCompletion));
              if (r === null) {
                throw new types_1.Z3Error("Failed to evaluate expression in the model");
              }
              return _toExpr(r);
            }
            get(i, to) {
              (0, utils_1.assert)(to === void 0 || typeof i === "number");
              if (typeof i === "number") {
                const length = this.length();
                if (i >= length) {
                  throw new RangeError(`expected index ${i} to be less than length ${length}`);
                }
                if (to === void 0) {
                  const numConsts = check(Z3.model_get_num_consts(contextPtr, this.ptr));
                  if (i < numConsts) {
                    return new FuncDeclImpl(check(Z3.model_get_const_decl(contextPtr, this.ptr, i)));
                  } else {
                    return new FuncDeclImpl(check(Z3.model_get_func_decl(contextPtr, this.ptr, i - numConsts)));
                  }
                }
                if (to < 0) {
                  to += length;
                }
                if (to >= length) {
                  throw new RangeError(`expected index ${to} to be less than length ${length}`);
                }
                const result = [];
                for (let j = i; j < to; j++) {
                  result.push(this.get(j));
                }
                return result;
              } else if (isFuncDecl(i) || isExpr(i) && isConst(i)) {
                const result = this.getInterp(i);
                (0, utils_1.assert)(result !== null);
                return result;
              } else if (isSort(i)) {
                return this.getUniverse(i);
              }
              (0, utils_1.assert)(false, "Number, declaration or constant expected");
            }
            updateValue(decl, a) {
              _assertContext(decl);
              _assertContext(a);
              if (isExpr(decl)) {
                decl = decl.decl();
              }
              if (isFuncDecl(decl) && decl.arity() !== 0 && isFuncInterp(a)) {
                const funcInterp = this.addFuncInterp(decl, a.elseValue());
                for (let i = 0; i < a.numEntries(); i++) {
                  const e = a.entry(i);
                  const n = e.numArgs();
                  const args = globalThis.Array.from({ length: n }, (_, i2) => e.argValue(i2));
                  funcInterp.addEntry(args, e.value());
                }
                return;
              }
              if (!isFuncDecl(decl) || decl.arity() !== 0) {
                throw new types_1.Z3Error("Expecting 0-ary function or constant expression");
              }
              if (!isAst(a)) {
                throw new types_1.Z3Error("Only func declarations can be assigned to func interpretations");
              }
              check(Z3.add_const_interp(contextPtr, this.ptr, decl.ptr, a.ast));
            }
            addFuncInterp(decl, defaultValue) {
              const fi = check(Z3.add_func_interp(contextPtr, this.ptr, decl.ptr, decl.range().cast(defaultValue).ptr));
              return new FuncInterpImpl(fi);
            }
            getInterp(expr) {
              (0, utils_1.assert)(isFuncDecl(expr) || isConst(expr), "Declaration expected");
              if (isConst(expr)) {
                (0, utils_1.assert)(isExpr(expr));
                expr = expr.decl();
              }
              (0, utils_1.assert)(isFuncDecl(expr));
              if (expr.arity() === 0) {
                const result = check(Z3.model_get_const_interp(contextPtr, this.ptr, expr.ptr));
                if (result === null) {
                  return null;
                }
                return _toExpr(result);
              } else {
                const interp = check(Z3.model_get_func_interp(contextPtr, this.ptr, expr.ptr));
                if (interp === null) {
                  return null;
                }
                return new FuncInterpImpl(interp);
              }
            }
            getUniverse(sort) {
              _assertContext(sort);
              return new AstVectorImpl(check(Z3.model_get_sort_universe(contextPtr, this.ptr, sort.ptr)));
            }
            numSorts() {
              return check(Z3.model_get_num_sorts(contextPtr, this.ptr));
            }
            getSort(i) {
              return _toSort(check(Z3.model_get_sort(contextPtr, this.ptr, i)));
            }
            getSorts() {
              const n = this.numSorts();
              const result = [];
              for (let i = 0; i < n; i++) {
                result.push(this.getSort(i));
              }
              return result;
            }
            sortUniverse(sort) {
              return this.getUniverse(sort);
            }
            translate(target) {
              const ptr = check(Z3.model_translate(contextPtr, this.ptr, target.ptr));
              return new target.Model(ptr);
            }
            release() {
              Z3.model_dec_ref(contextPtr, this.ptr);
              this._ptr = null;
              cleanup.unregister(this);
            }
          }
          class StatisticsImpl {
            get ptr() {
              _assertPtr(this._ptr);
              return this._ptr;
            }
            constructor(ptr) {
              this.ctx = ctx;
              this._ptr = ptr;
              Z3.stats_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.stats_dec_ref(contextPtr, ptr), this);
            }
            size() {
              return Z3.stats_size(contextPtr, this.ptr);
            }
            keys() {
              const result = [];
              const sz = this.size();
              for (let i = 0; i < sz; i++) {
                result.push(Z3.stats_get_key(contextPtr, this.ptr, i));
              }
              return result;
            }
            get(key) {
              const sz = this.size();
              for (let i = 0; i < sz; i++) {
                if (Z3.stats_get_key(contextPtr, this.ptr, i) === key) {
                  if (Z3.stats_is_uint(contextPtr, this.ptr, i)) {
                    return Z3.stats_get_uint_value(contextPtr, this.ptr, i);
                  } else {
                    return Z3.stats_get_double_value(contextPtr, this.ptr, i);
                  }
                }
              }
              throw new Error(`Statistics key not found: ${key}`);
            }
            entries() {
              const result = [];
              const sz = this.size();
              for (let i = 0; i < sz; i++) {
                const key = Z3.stats_get_key(contextPtr, this.ptr, i);
                const isUint = Z3.stats_is_uint(contextPtr, this.ptr, i);
                const isDouble = Z3.stats_is_double(contextPtr, this.ptr, i);
                const value = isUint ? Z3.stats_get_uint_value(contextPtr, this.ptr, i) : Z3.stats_get_double_value(contextPtr, this.ptr, i);
                result.push({
                  __typename: "StatisticsEntry",
                  key,
                  value,
                  isUint,
                  isDouble
                });
              }
              return result;
            }
            [Symbol.iterator]() {
              return this.entries()[Symbol.iterator]();
            }
            release() {
              Z3.stats_dec_ref(contextPtr, this.ptr);
              this._ptr = null;
              cleanup.unregister(this);
            }
          }
          class FuncEntryImpl {
            constructor(ptr) {
              this.ptr = ptr;
              this.ctx = ctx;
              Z3.func_entry_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.func_entry_dec_ref(contextPtr, ptr), this);
            }
            numArgs() {
              return check(Z3.func_entry_get_num_args(contextPtr, this.ptr));
            }
            argValue(i) {
              return _toExpr(check(Z3.func_entry_get_arg(contextPtr, this.ptr, i)));
            }
            value() {
              return _toExpr(check(Z3.func_entry_get_value(contextPtr, this.ptr)));
            }
          }
          class FuncInterpImpl {
            constructor(ptr) {
              this.ptr = ptr;
              this.ctx = ctx;
              Z3.func_interp_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.func_interp_dec_ref(contextPtr, ptr), this);
            }
            elseValue() {
              return _toExpr(check(Z3.func_interp_get_else(contextPtr, this.ptr)));
            }
            numEntries() {
              return check(Z3.func_interp_get_num_entries(contextPtr, this.ptr));
            }
            arity() {
              return check(Z3.func_interp_get_arity(contextPtr, this.ptr));
            }
            entry(i) {
              return new FuncEntryImpl(check(Z3.func_interp_get_entry(contextPtr, this.ptr, i)));
            }
            addEntry(args, value) {
              const argsVec = new AstVectorImpl();
              for (const arg of args) {
                argsVec.push(arg);
              }
              _assertContext(argsVec);
              _assertContext(value);
              (0, utils_1.assert)(this.arity() === argsVec.length(), "Number of arguments in entry doesn't match function arity");
              check(Z3.func_interp_add_entry(contextPtr, this.ptr, argsVec.ptr, value.ptr));
            }
          }
          class SortImpl extends AstImpl {
            get ast() {
              return Z3.sort_to_ast(contextPtr, this.ptr);
            }
            kind() {
              return Z3.get_sort_kind(contextPtr, this.ptr);
            }
            subsort(other) {
              _assertContext(other);
              return false;
            }
            cast(expr) {
              _assertContext(expr);
              (0, utils_1.assert)(expr.sort.eqIdentity(expr.sort), "Sort mismatch");
              return expr;
            }
            name() {
              return _fromSymbol(Z3.get_sort_name(contextPtr, this.ptr));
            }
            eqIdentity(other) {
              _assertContext(other);
              return check(Z3.is_eq_sort(contextPtr, this.ptr, other.ptr));
            }
            neqIdentity(other) {
              return !this.eqIdentity(other);
            }
          }
          class FuncDeclImpl extends AstImpl {
            get ast() {
              return Z3.func_decl_to_ast(contextPtr, this.ptr);
            }
            name() {
              return _fromSymbol(Z3.get_decl_name(contextPtr, this.ptr));
            }
            arity() {
              return Z3.get_arity(contextPtr, this.ptr);
            }
            domain(i) {
              (0, utils_1.assert)(i < this.arity(), "Index out of bounds");
              return _toSort(Z3.get_domain(contextPtr, this.ptr, i));
            }
            range() {
              return _toSort(Z3.get_range(contextPtr, this.ptr));
            }
            kind() {
              return Z3.get_decl_kind(contextPtr, this.ptr);
            }
            params() {
              const n = Z3.get_decl_num_parameters(contextPtr, this.ptr);
              const result = [];
              for (let i = 0; i < n; i++) {
                const kind = check(Z3.get_decl_parameter_kind(contextPtr, this.ptr, i));
                switch (kind) {
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_INT:
                    result.push(check(Z3.get_decl_int_parameter(contextPtr, this.ptr, i)));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_DOUBLE:
                    result.push(check(Z3.get_decl_double_parameter(contextPtr, this.ptr, i)));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_RATIONAL:
                    result.push(check(Z3.get_decl_rational_parameter(contextPtr, this.ptr, i)));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_SYMBOL:
                    result.push(_fromSymbol(check(Z3.get_decl_symbol_parameter(contextPtr, this.ptr, i))));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_SORT:
                    result.push(new SortImpl(check(Z3.get_decl_sort_parameter(contextPtr, this.ptr, i))));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_AST:
                    result.push(new ExprImpl(check(Z3.get_decl_ast_parameter(contextPtr, this.ptr, i))));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_FUNC_DECL:
                    result.push(new FuncDeclImpl(check(Z3.get_decl_func_decl_parameter(contextPtr, this.ptr, i))));
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_INTERNAL:
                    break;
                  case low_level_1.Z3_parameter_kind.Z3_PARAMETER_ZSTRING:
                    break;
                  default:
                    (0, utils_1.assertExhaustive)(kind);
                }
              }
              return result;
            }
            call(...args) {
              (0, utils_1.assert)(args.length === this.arity(), `Incorrect number of arguments to ${this}`);
              return _toExpr(check(Z3.mk_app(contextPtr, this.ptr, args.map((arg, i) => {
                return this.domain(i).cast(arg).ast;
              }))));
            }
          }
          class ExprImpl extends AstImpl {
            get sort() {
              return _toSort(Z3.get_sort(contextPtr, this.ast));
            }
            eq(other) {
              return new BoolImpl(check(Z3.mk_eq(contextPtr, this.ast, from(other).ast)));
            }
            neq(other) {
              return new BoolImpl(check(Z3.mk_distinct(contextPtr, [this, other].map((expr) => from(expr).ast))));
            }
            name() {
              return this.decl().name();
            }
            params() {
              return this.decl().params();
            }
            decl() {
              (0, utils_1.assert)(isApp(this), "Z3 application expected");
              return new FuncDeclImpl(check(Z3.get_app_decl(contextPtr, check(Z3.to_app(contextPtr, this.ast)))));
            }
            numArgs() {
              (0, utils_1.assert)(isApp(this), "Z3 applicaiton expected");
              return check(Z3.get_app_num_args(contextPtr, check(Z3.to_app(contextPtr, this.ast))));
            }
            arg(i) {
              (0, utils_1.assert)(isApp(this), "Z3 applicaiton expected");
              (0, utils_1.assert)(i < this.numArgs(), `Invalid argument index - expected ${i} to be less than ${this.numArgs()}`);
              return _toExpr(check(Z3.get_app_arg(contextPtr, check(Z3.to_app(contextPtr, this.ast)), i)));
            }
            children() {
              const num_args = this.numArgs();
              if (isApp(this)) {
                const result = [];
                for (let i = 0; i < num_args; i++) {
                  result.push(this.arg(i));
                }
                return result;
              }
              return [];
            }
          }
          class PatternImpl {
            constructor(ptr) {
              this.ptr = ptr;
              this.ctx = ctx;
            }
          }
          class BoolSortImpl extends SortImpl {
            cast(other) {
              if (typeof other === "boolean") {
                other = Bool.val(other);
              }
              (0, utils_1.assert)(isExpr(other), "true, false or Z3 Boolean expression expected.");
              (0, utils_1.assert)(this.eqIdentity(other.sort), "Value cannot be converted into a Z3 Boolean value");
              return other;
            }
            subsort(other) {
              _assertContext(other.ctx);
              return other instanceof ArithSortImpl;
            }
          }
          class BoolImpl extends ExprImpl {
            not() {
              return Not(this);
            }
            and(other) {
              return And(this, other);
            }
            or(other) {
              return Or(this, other);
            }
            xor(other) {
              return Xor(this, other);
            }
            implies(other) {
              return Implies(this, other);
            }
            iff(other) {
              return Iff(this, other);
            }
          }
          class ProbeImpl {
            constructor(ptr) {
              this.ptr = ptr;
              this.ctx = ctx;
            }
            apply(goal) {
              _assertContext(goal);
              return Z3.probe_apply(contextPtr, this.ptr, goal.ptr);
            }
          }
          class GoalImpl {
            constructor(models = true, unsat_cores = false, proofs = false) {
              this.ctx = ctx;
              const myPtr = check(Z3.mk_goal(contextPtr, models, unsat_cores, proofs));
              this.ptr = myPtr;
              Z3.goal_inc_ref(contextPtr, myPtr);
              cleanup.register(this, () => Z3.goal_dec_ref(contextPtr, myPtr), this);
            }
            // Factory method for creating from existing Z3_goal pointer
            static fromPtr(goalPtr) {
              const goal = Object.create(GoalImpl.prototype);
              goal.ctx = ctx;
              goal.ptr = goalPtr;
              Z3.goal_inc_ref(contextPtr, goalPtr);
              cleanup.register(goal, () => Z3.goal_dec_ref(contextPtr, goalPtr), goal);
              return goal;
            }
            add(...constraints) {
              for (const constraint of constraints) {
                const boolConstraint = isBool(constraint) ? constraint : Bool.val(constraint);
                _assertContext(boolConstraint);
                Z3.goal_assert(contextPtr, this.ptr, boolConstraint.ast);
              }
            }
            size() {
              return Z3.goal_size(contextPtr, this.ptr);
            }
            get(i) {
              (0, utils_1.assert)(i >= 0 && i < this.size(), "Index out of bounds");
              const ast = check(Z3.goal_formula(contextPtr, this.ptr, i));
              return new BoolImpl(ast);
            }
            depth() {
              return Z3.goal_depth(contextPtr, this.ptr);
            }
            inconsistent() {
              return Z3.goal_inconsistent(contextPtr, this.ptr);
            }
            precision() {
              return Z3.goal_precision(contextPtr, this.ptr);
            }
            reset() {
              Z3.goal_reset(contextPtr, this.ptr);
            }
            numExprs() {
              return Z3.goal_num_exprs(contextPtr, this.ptr);
            }
            isDecidedSat() {
              return Z3.goal_is_decided_sat(contextPtr, this.ptr);
            }
            isDecidedUnsat() {
              return Z3.goal_is_decided_unsat(contextPtr, this.ptr);
            }
            convertModel(model) {
              _assertContext(model);
              const convertedModel = check(Z3.goal_convert_model(contextPtr, this.ptr, model.ptr));
              return new ModelImpl(convertedModel);
            }
            asExpr() {
              const sz = this.size();
              if (sz === 0) {
                return Bool.val(true);
              } else if (sz === 1) {
                return this.get(0);
              } else {
                const constraints = [];
                for (let i = 0; i < sz; i++) {
                  constraints.push(this.get(i));
                }
                return And(...constraints);
              }
            }
            toString() {
              return Z3.goal_to_string(contextPtr, this.ptr);
            }
            dimacs(includeNames = true) {
              return Z3.goal_to_dimacs_string(contextPtr, this.ptr, includeNames);
            }
          }
          class ApplyResultImpl {
            constructor(ptr) {
              this.ctx = ctx;
              this.ptr = ptr;
              Z3.apply_result_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.apply_result_dec_ref(contextPtr, ptr), this);
            }
            length() {
              return Z3.apply_result_get_num_subgoals(contextPtr, this.ptr);
            }
            getSubgoal(i) {
              (0, utils_1.assert)(i >= 0 && i < this.length(), "Index out of bounds");
              const goalPtr = check(Z3.apply_result_get_subgoal(contextPtr, this.ptr, i));
              return GoalImpl.fromPtr(goalPtr);
            }
            toString() {
              return Z3.apply_result_to_string(contextPtr, this.ptr);
            }
          }
          const applyResultHandler = {
            get(target, prop) {
              if (typeof prop === "string") {
                const index = parseInt(prop, 10);
                if (!isNaN(index) && index >= 0 && index < target.length()) {
                  return target.getSubgoal(index);
                }
              }
              return target[prop];
            }
          };
          class TacticImpl {
            constructor(tactic) {
              this.ctx = ctx;
              let myPtr;
              if (typeof tactic === "string") {
                myPtr = check(Z3.mk_tactic(contextPtr, tactic));
              } else {
                myPtr = tactic;
              }
              this.ptr = myPtr;
              Z3.tactic_inc_ref(contextPtr, myPtr);
              cleanup.register(this, () => Z3.tactic_dec_ref(contextPtr, myPtr), this);
            }
            async apply(goal) {
              let goalToUse;
              if (isBool(goal)) {
                goalToUse = new GoalImpl();
                goalToUse.add(goal);
              } else {
                goalToUse = goal;
              }
              _assertContext(goalToUse);
              const result = await Z3.tactic_apply(contextPtr, this.ptr, goalToUse.ptr);
              const applyResult = new ApplyResultImpl(check(result));
              return new Proxy(applyResult, applyResultHandler);
            }
            solver() {
              const solverPtr = check(Z3.mk_solver_from_tactic(contextPtr, this.ptr));
              return new SolverImpl(solverPtr);
            }
            help() {
              return Z3.tactic_get_help(contextPtr, this.ptr);
            }
            paramDescrs() {
              const descrs = check(Z3.tactic_get_param_descrs(contextPtr, this.ptr));
              return new ParamDescrsImpl(descrs);
            }
            usingParams(params) {
              _assertContext(params);
              const newTactic = check(Z3.tactic_using_params(contextPtr, this.ptr, params.ptr));
              return new TacticImpl(newTactic);
            }
          }
          class ParamsImpl {
            constructor(params) {
              this.ctx = ctx;
              if (params) {
                this.ptr = params;
              } else {
                this.ptr = Z3.mk_params(contextPtr);
              }
              Z3.params_inc_ref(contextPtr, this.ptr);
              cleanup.register(this, () => Z3.params_dec_ref(contextPtr, this.ptr), this);
            }
            set(name2, value) {
              const sym = _toSymbol(name2);
              if (typeof value === "boolean") {
                Z3.params_set_bool(contextPtr, this.ptr, sym, value);
              } else if (typeof value === "number") {
                if (Number.isInteger(value)) {
                  check(Z3.params_set_uint(contextPtr, this.ptr, sym, value));
                } else {
                  check(Z3.params_set_double(contextPtr, this.ptr, sym, value));
                }
              } else if (typeof value === "string") {
                check(Z3.params_set_symbol(contextPtr, this.ptr, sym, _toSymbol(value)));
              }
            }
            validate(descrs) {
              _assertContext(descrs);
              Z3.params_validate(contextPtr, this.ptr, descrs.ptr);
            }
            toString() {
              return Z3.params_to_string(contextPtr, this.ptr);
            }
          }
          class ParamDescrsImpl {
            constructor(paramDescrs) {
              this.ctx = ctx;
              this.ptr = paramDescrs;
              Z3.param_descrs_inc_ref(contextPtr, this.ptr);
              cleanup.register(this, () => Z3.param_descrs_dec_ref(contextPtr, this.ptr), this);
            }
            size() {
              return Z3.param_descrs_size(contextPtr, this.ptr);
            }
            getName(i) {
              const sym = Z3.param_descrs_get_name(contextPtr, this.ptr, i);
              const name2 = _fromSymbol(sym);
              return typeof name2 === "string" ? name2 : `${name2}`;
            }
            getKind(name2) {
              return Z3.param_descrs_get_kind(contextPtr, this.ptr, _toSymbol(name2));
            }
            getDocumentation(name2) {
              return Z3.param_descrs_get_documentation(contextPtr, this.ptr, _toSymbol(name2));
            }
            toString() {
              return Z3.param_descrs_to_string(contextPtr, this.ptr);
            }
          }
          class SimplifierImpl {
            constructor(simplifier) {
              this.ctx = ctx;
              let myPtr;
              if (typeof simplifier === "string") {
                myPtr = check(Z3.mk_simplifier(contextPtr, simplifier));
              } else {
                myPtr = simplifier;
              }
              this.ptr = myPtr;
              Z3.simplifier_inc_ref(contextPtr, myPtr);
              cleanup.register(this, () => Z3.simplifier_dec_ref(contextPtr, myPtr), this);
            }
            help() {
              return Z3.simplifier_get_help(contextPtr, this.ptr);
            }
            paramDescrs() {
              const descrs = check(Z3.simplifier_get_param_descrs(contextPtr, this.ptr));
              return new ParamDescrsImpl(descrs);
            }
            usingParams(params) {
              _assertContext(params);
              const newSimplifier = check(Z3.simplifier_using_params(contextPtr, this.ptr, params.ptr));
              return new SimplifierImpl(newSimplifier);
            }
            andThen(other) {
              _assertContext(other);
              const newSimplifier = check(Z3.simplifier_and_then(contextPtr, this.ptr, other.ptr));
              return new SimplifierImpl(newSimplifier);
            }
          }
          class ArithSortImpl extends SortImpl {
            cast(other) {
              const sortTypeStr = isIntSort(this) ? "IntSort" : "RealSort";
              if (isExpr(other)) {
                const otherS = other.sort;
                if (isArith(other)) {
                  if (this.eqIdentity(otherS)) {
                    return other;
                  } else if (isIntSort(otherS) && isRealSort(this)) {
                    return ToReal(other);
                  }
                  (0, utils_1.assert)(false, "Can't cast Real to IntSort without loss");
                } else if (isBool(other)) {
                  if (isIntSort(this)) {
                    return If(other, 1, 0);
                  } else {
                    return ToReal(If(other, 1, 0));
                  }
                }
                (0, utils_1.assert)(false, `Can't cast expression to ${sortTypeStr}`);
              } else {
                if (typeof other !== "boolean") {
                  if (isIntSort(this)) {
                    (0, utils_1.assert)(!isCoercibleRational(other), "Can't cast fraction to IntSort");
                    return Int.val(other);
                  }
                  return Real.val(other);
                }
                (0, utils_1.assert)(false, `Can't cast primitive to ${sortTypeStr}`);
              }
            }
          }
          function Sum(arg0, ...args) {
            if (arg0 instanceof BitVecImpl) {
              if (args.length !== 1) {
                throw new Error("BitVec add only supports 2 arguments");
              }
              return new BitVecImpl(check(Z3.mk_bvadd(contextPtr, arg0.ast, arg0.sort.cast(args[0]).ast)));
            } else {
              (0, utils_1.assert)(arg0 instanceof ArithImpl);
              return new ArithImpl(check(Z3.mk_add(contextPtr, [arg0.ast].concat(args.map((arg) => arg0.sort.cast(arg).ast)))));
            }
          }
          function Sub(arg0, ...args) {
            if (arg0 instanceof BitVecImpl) {
              if (args.length !== 1) {
                throw new Error("BitVec sub only supports 2 arguments");
              }
              return new BitVecImpl(check(Z3.mk_bvsub(contextPtr, arg0.ast, arg0.sort.cast(args[0]).ast)));
            } else {
              (0, utils_1.assert)(arg0 instanceof ArithImpl);
              return new ArithImpl(check(Z3.mk_sub(contextPtr, [arg0.ast].concat(args.map((arg) => arg0.sort.cast(arg).ast)))));
            }
          }
          function Product(arg0, ...args) {
            if (arg0 instanceof BitVecImpl) {
              if (args.length !== 1) {
                throw new Error("BitVec mul only supports 2 arguments");
              }
              return new BitVecImpl(check(Z3.mk_bvmul(contextPtr, arg0.ast, arg0.sort.cast(args[0]).ast)));
            } else {
              (0, utils_1.assert)(arg0 instanceof ArithImpl);
              return new ArithImpl(check(Z3.mk_mul(contextPtr, [arg0.ast].concat(args.map((arg) => arg0.sort.cast(arg).ast)))));
            }
          }
          function Div(arg0, arg1) {
            if (arg0 instanceof BitVecImpl) {
              return new BitVecImpl(check(Z3.mk_bvsdiv(contextPtr, arg0.ast, arg0.sort.cast(arg1).ast)));
            } else {
              (0, utils_1.assert)(arg0 instanceof ArithImpl);
              return new ArithImpl(check(Z3.mk_div(contextPtr, arg0.ast, arg0.sort.cast(arg1).ast)));
            }
          }
          function BUDiv(arg0, arg1) {
            return new BitVecImpl(check(Z3.mk_bvudiv(contextPtr, arg0.ast, arg0.sort.cast(arg1).ast)));
          }
          function Neg(a) {
            if (a instanceof BitVecImpl) {
              return new BitVecImpl(check(Z3.mk_bvneg(contextPtr, a.ast)));
            } else {
              (0, utils_1.assert)(a instanceof ArithImpl);
              return new ArithImpl(check(Z3.mk_unary_minus(contextPtr, a.ast)));
            }
          }
          function Mod(a, b) {
            if (a instanceof BitVecImpl) {
              return new BitVecImpl(check(Z3.mk_bvsrem(contextPtr, a.ast, a.sort.cast(b).ast)));
            } else {
              (0, utils_1.assert)(a instanceof ArithImpl);
              return new ArithImpl(check(Z3.mk_mod(contextPtr, a.ast, a.sort.cast(b).ast)));
            }
          }
          class ArithImpl extends ExprImpl {
            add(other) {
              return Sum(this, other);
            }
            mul(other) {
              return Product(this, other);
            }
            sub(other) {
              return Sub(this, other);
            }
            pow(exponent) {
              return new ArithImpl(check(Z3.mk_power(contextPtr, this.ast, this.sort.cast(exponent).ast)));
            }
            div(other) {
              return Div(this, other);
            }
            mod(other) {
              return Mod(this, other);
            }
            neg() {
              return Neg(this);
            }
            le(other) {
              return LE(this, other);
            }
            lt(other) {
              return LT(this, other);
            }
            gt(other) {
              return GT(this, other);
            }
            ge(other) {
              return GE(this, other);
            }
          }
          class IntNumImpl extends ArithImpl {
            value() {
              return BigInt(this.asString());
            }
            asString() {
              return Z3.get_numeral_string(contextPtr, this.ast);
            }
            asBinary() {
              return Z3.get_numeral_binary_string(contextPtr, this.ast);
            }
          }
          class RatNumImpl extends ArithImpl {
            value() {
              return { numerator: this.numerator().value(), denominator: this.denominator().value() };
            }
            numerator() {
              return new IntNumImpl(Z3.get_numerator(contextPtr, this.ast));
            }
            denominator() {
              return new IntNumImpl(Z3.get_denominator(contextPtr, this.ast));
            }
            asNumber() {
              const { numerator, denominator } = this.value();
              const div = numerator / denominator;
              return Number(div) + Number(numerator - div * denominator) / Number(denominator);
            }
            asDecimal(prec = Number.parseInt(getParam("precision") ?? FALLBACK_PRECISION.toString())) {
              return Z3.get_numeral_decimal_string(contextPtr, this.ast, prec);
            }
            asString() {
              return Z3.get_numeral_string(contextPtr, this.ast);
            }
          }
          class RCFNumImpl {
            constructor(valueOrPtr) {
              this.ctx = ctx;
              let myPtr;
              if (typeof valueOrPtr === "string") {
                myPtr = check(Z3.rcf_mk_rational(contextPtr, valueOrPtr));
              } else if (typeof valueOrPtr === "number") {
                myPtr = check(Z3.rcf_mk_small_int(contextPtr, valueOrPtr));
              } else {
                myPtr = valueOrPtr;
              }
              this.ptr = myPtr;
              cleanup.register(this, () => Z3.rcf_del(contextPtr, myPtr), this);
            }
            add(other) {
              _assertContext(other);
              return new RCFNumImpl(check(Z3.rcf_add(contextPtr, this.ptr, other.ptr)));
            }
            sub(other) {
              _assertContext(other);
              return new RCFNumImpl(check(Z3.rcf_sub(contextPtr, this.ptr, other.ptr)));
            }
            mul(other) {
              _assertContext(other);
              return new RCFNumImpl(check(Z3.rcf_mul(contextPtr, this.ptr, other.ptr)));
            }
            div(other) {
              _assertContext(other);
              return new RCFNumImpl(check(Z3.rcf_div(contextPtr, this.ptr, other.ptr)));
            }
            neg() {
              return new RCFNumImpl(check(Z3.rcf_neg(contextPtr, this.ptr)));
            }
            inv() {
              return new RCFNumImpl(check(Z3.rcf_inv(contextPtr, this.ptr)));
            }
            power(k) {
              return new RCFNumImpl(check(Z3.rcf_power(contextPtr, this.ptr, k)));
            }
            lt(other) {
              _assertContext(other);
              return check(Z3.rcf_lt(contextPtr, this.ptr, other.ptr));
            }
            gt(other) {
              _assertContext(other);
              return check(Z3.rcf_gt(contextPtr, this.ptr, other.ptr));
            }
            le(other) {
              _assertContext(other);
              return check(Z3.rcf_le(contextPtr, this.ptr, other.ptr));
            }
            ge(other) {
              _assertContext(other);
              return check(Z3.rcf_ge(contextPtr, this.ptr, other.ptr));
            }
            eq(other) {
              _assertContext(other);
              return check(Z3.rcf_eq(contextPtr, this.ptr, other.ptr));
            }
            neq(other) {
              _assertContext(other);
              return check(Z3.rcf_neq(contextPtr, this.ptr, other.ptr));
            }
            isRational() {
              return check(Z3.rcf_is_rational(contextPtr, this.ptr));
            }
            isAlgebraic() {
              return check(Z3.rcf_is_algebraic(contextPtr, this.ptr));
            }
            isInfinitesimal() {
              return check(Z3.rcf_is_infinitesimal(contextPtr, this.ptr));
            }
            isTranscendental() {
              return check(Z3.rcf_is_transcendental(contextPtr, this.ptr));
            }
            toString(compact = false) {
              return check(Z3.rcf_num_to_string(contextPtr, this.ptr, compact, false));
            }
            toDecimal(precision) {
              return check(Z3.rcf_num_to_decimal_string(contextPtr, this.ptr, precision));
            }
          }
          class BitVecSortImpl extends SortImpl {
            size() {
              return Z3.get_bv_sort_size(contextPtr, this.ptr);
            }
            subsort(other) {
              return isBitVecSort(other) && this.size() < other.size();
            }
            cast(other) {
              if (isExpr(other)) {
                _assertContext(other);
                return other;
              }
              (0, utils_1.assert)(!isCoercibleRational(other), "Can't convert rational to BitVec");
              return BitVec.val(other, this.size());
            }
          }
          class BitVecImpl extends ExprImpl {
            size() {
              return this.sort.size();
            }
            add(other) {
              return Sum(this, other);
            }
            mul(other) {
              return Product(this, other);
            }
            sub(other) {
              return Sub(this, other);
            }
            sdiv(other) {
              return Div(this, other);
            }
            udiv(other) {
              return BUDiv(this, other);
            }
            smod(other) {
              return Mod(this, other);
            }
            urem(other) {
              return new BitVecImpl(check(Z3.mk_bvurem(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            srem(other) {
              return new BitVecImpl(check(Z3.mk_bvsrem(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            neg() {
              return Neg(this);
            }
            or(other) {
              return new BitVecImpl(check(Z3.mk_bvor(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            and(other) {
              return new BitVecImpl(check(Z3.mk_bvand(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            nand(other) {
              return new BitVecImpl(check(Z3.mk_bvnand(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            xor(other) {
              return new BitVecImpl(check(Z3.mk_bvxor(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            xnor(other) {
              return new BitVecImpl(check(Z3.mk_bvxnor(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            shr(count) {
              return new BitVecImpl(check(Z3.mk_bvashr(contextPtr, this.ast, this.sort.cast(count).ast)));
            }
            lshr(count) {
              return new BitVecImpl(check(Z3.mk_bvlshr(contextPtr, this.ast, this.sort.cast(count).ast)));
            }
            shl(count) {
              return new BitVecImpl(check(Z3.mk_bvshl(contextPtr, this.ast, this.sort.cast(count).ast)));
            }
            rotateRight(count) {
              return new BitVecImpl(check(Z3.mk_ext_rotate_right(contextPtr, this.ast, this.sort.cast(count).ast)));
            }
            rotateLeft(count) {
              return new BitVecImpl(check(Z3.mk_ext_rotate_left(contextPtr, this.ast, this.sort.cast(count).ast)));
            }
            not() {
              return new BitVecImpl(check(Z3.mk_bvnot(contextPtr, this.ast)));
            }
            extract(high, low) {
              return Extract(high, low, this);
            }
            signExt(count) {
              return new BitVecImpl(check(Z3.mk_sign_ext(contextPtr, count, this.ast)));
            }
            zeroExt(count) {
              return new BitVecImpl(check(Z3.mk_zero_ext(contextPtr, count, this.ast)));
            }
            repeat(count) {
              return new BitVecImpl(check(Z3.mk_repeat(contextPtr, count, this.ast)));
            }
            sle(other) {
              return SLE(this, other);
            }
            ule(other) {
              return ULE(this, other);
            }
            slt(other) {
              return SLT(this, other);
            }
            ult(other) {
              return ULT(this, other);
            }
            sge(other) {
              return SGE(this, other);
            }
            uge(other) {
              return UGE(this, other);
            }
            sgt(other) {
              return SGT(this, other);
            }
            ugt(other) {
              return UGT(this, other);
            }
            redAnd() {
              return new BitVecImpl(check(Z3.mk_bvredand(contextPtr, this.ast)));
            }
            redOr() {
              return new BitVecImpl(check(Z3.mk_bvredor(contextPtr, this.ast)));
            }
            addNoOverflow(other, isSigned) {
              return new BoolImpl(check(Z3.mk_bvadd_no_overflow(contextPtr, this.ast, this.sort.cast(other).ast, isSigned)));
            }
            addNoUnderflow(other) {
              return new BoolImpl(check(Z3.mk_bvadd_no_underflow(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            subNoOverflow(other) {
              return new BoolImpl(check(Z3.mk_bvsub_no_overflow(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            subNoUnderflow(other, isSigned) {
              return new BoolImpl(check(Z3.mk_bvsub_no_underflow(contextPtr, this.ast, this.sort.cast(other).ast, isSigned)));
            }
            sdivNoOverflow(other) {
              return new BoolImpl(check(Z3.mk_bvsdiv_no_overflow(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            mulNoOverflow(other, isSigned) {
              return new BoolImpl(check(Z3.mk_bvmul_no_overflow(contextPtr, this.ast, this.sort.cast(other).ast, isSigned)));
            }
            mulNoUnderflow(other) {
              return new BoolImpl(check(Z3.mk_bvmul_no_underflow(contextPtr, this.ast, this.sort.cast(other).ast)));
            }
            negNoOverflow() {
              return new BoolImpl(check(Z3.mk_bvneg_no_overflow(contextPtr, this.ast)));
            }
          }
          class BitVecNumImpl extends BitVecImpl {
            value() {
              return BigInt(this.asString());
            }
            asSignedValue() {
              let val = this.value();
              const size = BigInt(this.size());
              if (val >= 2n ** (size - 1n)) {
                val = val - 2n ** size;
              }
              if (val < (-2n) ** (size - 1n)) {
                val = val + 2n ** size;
              }
              return val;
            }
            asString() {
              return Z3.get_numeral_string(contextPtr, this.ast);
            }
            asBinaryString() {
              return Z3.get_numeral_binary_string(contextPtr, this.ast);
            }
          }
          class FPRMSortImpl extends SortImpl {
            cast(other) {
              if (isFPRM(other)) {
                _assertContext(other);
                return other;
              }
              throw new Error("Can't cast to FPRMSort");
            }
          }
          class FPRMImpl extends ExprImpl {
          }
          class FPSortImpl extends SortImpl {
            ebits() {
              return Z3.fpa_get_ebits(contextPtr, this.ptr);
            }
            sbits() {
              return Z3.fpa_get_sbits(contextPtr, this.ptr);
            }
            cast(other) {
              if (isExpr(other)) {
                _assertContext(other);
                return other;
              }
              if (typeof other === "number") {
                return Float.val(other, this);
              }
              throw new Error("Can't cast to FPSort");
            }
          }
          class FPImpl extends ExprImpl {
            add(rm, other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new FPImpl(check(Z3.mk_fpa_add(contextPtr, rm.ast, this.ast, otherFP.ast)));
            }
            sub(rm, other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new FPImpl(check(Z3.mk_fpa_sub(contextPtr, rm.ast, this.ast, otherFP.ast)));
            }
            mul(rm, other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new FPImpl(check(Z3.mk_fpa_mul(contextPtr, rm.ast, this.ast, otherFP.ast)));
            }
            div(rm, other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new FPImpl(check(Z3.mk_fpa_div(contextPtr, rm.ast, this.ast, otherFP.ast)));
            }
            neg() {
              return new FPImpl(check(Z3.mk_fpa_neg(contextPtr, this.ast)));
            }
            abs() {
              return new FPImpl(check(Z3.mk_fpa_abs(contextPtr, this.ast)));
            }
            sqrt(rm) {
              return new FPImpl(check(Z3.mk_fpa_sqrt(contextPtr, rm.ast, this.ast)));
            }
            rem(other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new FPImpl(check(Z3.mk_fpa_rem(contextPtr, this.ast, otherFP.ast)));
            }
            fma(rm, y, z) {
              const yFP = isFP(y) ? y : Float.val(y, this.sort);
              const zFP = isFP(z) ? z : Float.val(z, this.sort);
              return new FPImpl(check(Z3.mk_fpa_fma(contextPtr, rm.ast, this.ast, yFP.ast, zFP.ast)));
            }
            lt(other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new BoolImpl(check(Z3.mk_fpa_lt(contextPtr, this.ast, otherFP.ast)));
            }
            gt(other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new BoolImpl(check(Z3.mk_fpa_gt(contextPtr, this.ast, otherFP.ast)));
            }
            le(other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new BoolImpl(check(Z3.mk_fpa_leq(contextPtr, this.ast, otherFP.ast)));
            }
            ge(other) {
              const otherFP = isFP(other) ? other : Float.val(other, this.sort);
              return new BoolImpl(check(Z3.mk_fpa_geq(contextPtr, this.ast, otherFP.ast)));
            }
            isNaN() {
              return new BoolImpl(check(Z3.mk_fpa_is_nan(contextPtr, this.ast)));
            }
            isInf() {
              return new BoolImpl(check(Z3.mk_fpa_is_infinite(contextPtr, this.ast)));
            }
            isZero() {
              return new BoolImpl(check(Z3.mk_fpa_is_zero(contextPtr, this.ast)));
            }
            isNormal() {
              return new BoolImpl(check(Z3.mk_fpa_is_normal(contextPtr, this.ast)));
            }
            isSubnormal() {
              return new BoolImpl(check(Z3.mk_fpa_is_subnormal(contextPtr, this.ast)));
            }
            isNegative() {
              return new BoolImpl(check(Z3.mk_fpa_is_negative(contextPtr, this.ast)));
            }
            isPositive() {
              return new BoolImpl(check(Z3.mk_fpa_is_positive(contextPtr, this.ast)));
            }
            toIEEEBV() {
              return new BitVecImpl(check(Z3.mk_fpa_to_ieee_bv(contextPtr, this.ast)));
            }
            toReal() {
              return new ArithImpl(check(Z3.mk_fpa_to_real(contextPtr, this.ast)));
            }
          }
          class FPNumImpl extends FPImpl {
            value() {
              return Z3.get_numeral_double(contextPtr, this.ast);
            }
          }
          class SeqSortImpl extends SortImpl {
            isString() {
              return Z3.is_string_sort(contextPtr, this.ptr);
            }
            basis() {
              return _toSort(check(Z3.get_seq_sort_basis(contextPtr, this.ptr)));
            }
            cast(other) {
              if (isSeq(other)) {
                _assertContext(other);
                return other;
              }
              if (typeof other === "string") {
                return String2.val(other);
              }
              throw new Error("Can't cast to SeqSort");
            }
          }
          class SeqImpl extends ExprImpl {
            isString() {
              return Z3.is_string_sort(contextPtr, Z3.get_sort(contextPtr, this.ast));
            }
            asString() {
              if (!Z3.is_string(contextPtr, this.ast)) {
                throw new Error("Not a string value");
              }
              return Z3.get_string(contextPtr, this.ast);
            }
            concat(other) {
              const otherSeq = isSeq(other) ? other : String2.val(other);
              return new SeqImpl(check(Z3.mk_seq_concat(contextPtr, [this.ast, otherSeq.ast])));
            }
            length() {
              return new ArithImpl(check(Z3.mk_seq_length(contextPtr, this.ast)));
            }
            at(index) {
              const indexExpr = isArith(index) ? index : Int.val(index);
              return new SeqImpl(check(Z3.mk_seq_at(contextPtr, this.ast, indexExpr.ast)));
            }
            nth(index) {
              const indexExpr = isArith(index) ? index : Int.val(index);
              return _toExpr(check(Z3.mk_seq_nth(contextPtr, this.ast, indexExpr.ast)));
            }
            extract(offset, length) {
              const offsetExpr = isArith(offset) ? offset : Int.val(offset);
              const lengthExpr = isArith(length) ? length : Int.val(length);
              return new SeqImpl(check(Z3.mk_seq_extract(contextPtr, this.ast, offsetExpr.ast, lengthExpr.ast)));
            }
            indexOf(substr, offset) {
              const substrSeq = isSeq(substr) ? substr : String2.val(substr);
              const offsetExpr = offset !== void 0 ? isArith(offset) ? offset : Int.val(offset) : Int.val(0);
              return new ArithImpl(check(Z3.mk_seq_index(contextPtr, this.ast, substrSeq.ast, offsetExpr.ast)));
            }
            lastIndexOf(substr) {
              const substrSeq = isSeq(substr) ? substr : String2.val(substr);
              return new ArithImpl(check(Z3.mk_seq_last_index(contextPtr, this.ast, substrSeq.ast)));
            }
            contains(substr) {
              const substrSeq = isSeq(substr) ? substr : String2.val(substr);
              return new BoolImpl(check(Z3.mk_seq_contains(contextPtr, this.ast, substrSeq.ast)));
            }
            prefixOf(s) {
              const sSeq = isSeq(s) ? s : String2.val(s);
              return new BoolImpl(check(Z3.mk_seq_prefix(contextPtr, this.ast, sSeq.ast)));
            }
            suffixOf(s) {
              const sSeq = isSeq(s) ? s : String2.val(s);
              return new BoolImpl(check(Z3.mk_seq_suffix(contextPtr, this.ast, sSeq.ast)));
            }
            replace(src, dst) {
              const srcSeq = isSeq(src) ? src : String2.val(src);
              const dstSeq = isSeq(dst) ? dst : String2.val(dst);
              return new SeqImpl(check(Z3.mk_seq_replace(contextPtr, this.ast, srcSeq.ast, dstSeq.ast)));
            }
            replaceAll(src, dst) {
              const srcSeq = isSeq(src) ? src : String2.val(src);
              const dstSeq = isSeq(dst) ? dst : String2.val(dst);
              return new SeqImpl(check(Z3.mk_seq_replace_all(contextPtr, this.ast, srcSeq.ast, dstSeq.ast)));
            }
            replaceRe(re, dst) {
              const dstSeq = isSeq(dst) ? dst : String2.val(dst);
              return new SeqImpl(check(Z3.mk_seq_replace_re(contextPtr, this.ast, re.ast, dstSeq.ast)));
            }
            replaceReAll(re, dst) {
              const dstSeq = isSeq(dst) ? dst : String2.val(dst);
              return new SeqImpl(check(Z3.mk_seq_replace_re_all(contextPtr, this.ast, re.ast, dstSeq.ast)));
            }
            toInt() {
              return new ArithImpl(check(Z3.mk_str_to_int(contextPtr, this.ast)));
            }
            toCode() {
              return new ArithImpl(check(Z3.mk_string_to_code(contextPtr, this.ast)));
            }
            lt(other) {
              const otherSeq = isSeq(other) ? other : String2.val(other);
              return new BoolImpl(check(Z3.mk_str_lt(contextPtr, this.ast, otherSeq.ast)));
            }
            le(other) {
              const otherSeq = isSeq(other) ? other : String2.val(other);
              return new BoolImpl(check(Z3.mk_str_le(contextPtr, this.ast, otherSeq.ast)));
            }
            map(f) {
              return new SeqImpl(check(Z3.mk_seq_map(contextPtr, f.ast, this.ast)));
            }
            mapi(f, i) {
              const iExpr = isArith(i) ? i : Int.val(i);
              return new SeqImpl(check(Z3.mk_seq_mapi(contextPtr, f.ast, iExpr.ast, this.ast)));
            }
            foldl(f, a) {
              return _toExpr(check(Z3.mk_seq_foldl(contextPtr, f.ast, a.ast, this.ast)));
            }
            foldli(f, i, a) {
              const iExpr = isArith(i) ? i : Int.val(i);
              return _toExpr(check(Z3.mk_seq_foldli(contextPtr, f.ast, iExpr.ast, a.ast, this.ast)));
            }
          }
          class ReSortImpl extends SortImpl {
            basis() {
              return _toSort(check(Z3.get_re_sort_basis(contextPtr, this.ptr)));
            }
            cast(other) {
              if (isRe(other)) {
                _assertContext(other);
                return other;
              }
              throw new Error("Can't cast to ReSort");
            }
          }
          class ReImpl extends ExprImpl {
            plus() {
              return new ReImpl(check(Z3.mk_re_plus(contextPtr, this.ast)));
            }
            star() {
              return new ReImpl(check(Z3.mk_re_star(contextPtr, this.ast)));
            }
            option() {
              return new ReImpl(check(Z3.mk_re_option(contextPtr, this.ast)));
            }
            complement() {
              return new ReImpl(check(Z3.mk_re_complement(contextPtr, this.ast)));
            }
            union(other) {
              return new ReImpl(check(Z3.mk_re_union(contextPtr, [this.ast, other.ast])));
            }
            intersect(other) {
              return new ReImpl(check(Z3.mk_re_intersect(contextPtr, [this.ast, other.ast])));
            }
            diff(other) {
              return new ReImpl(check(Z3.mk_re_diff(contextPtr, this.ast, other.ast)));
            }
            concat(other) {
              return new ReImpl(check(Z3.mk_re_concat(contextPtr, [this.ast, other.ast])));
            }
            /**
             * Create a bounded repetition of this regex
             * @param lo Minimum number of repetitions
             * @param hi Maximum number of repetitions (0 means unbounded, i.e., at least lo)
             */
            loop(lo, hi = 0) {
              return new ReImpl(check(Z3.mk_re_loop(contextPtr, this.ast, lo, hi)));
            }
            power(n) {
              return new ReImpl(check(Z3.mk_re_power(contextPtr, this.ast, n)));
            }
          }
          class ArraySortImpl extends SortImpl {
            domain() {
              return _toSort(check(Z3.get_array_sort_domain(contextPtr, this.ptr)));
            }
            domain_n(i) {
              return _toSort(check(Z3.get_array_sort_domain_n(contextPtr, this.ptr, i)));
            }
            range() {
              return _toSort(check(Z3.get_array_sort_range(contextPtr, this.ptr)));
            }
          }
          class ArrayImpl extends ExprImpl {
            domain() {
              return this.sort.domain();
            }
            domain_n(i) {
              return this.sort.domain_n(i);
            }
            range() {
              return this.sort.range();
            }
            select(...indices) {
              return Select(this, ...indices);
            }
            store(...indicesAndValue) {
              return Store(this, ...indicesAndValue);
            }
            /**
             * Access the array default value.
             * Produces the default range value, for arrays that can be represented as
             * finite maps with a default range value.
             */
            default() {
              return _toExpr(check(Z3.mk_array_default(contextPtr, this.ast)));
            }
          }
          class SetImpl extends ExprImpl {
            elemSort() {
              return this.sort.domain();
            }
            union(...args) {
              return SetUnion(this, ...args);
            }
            intersect(...args) {
              return SetIntersect(this, ...args);
            }
            diff(b) {
              return SetDifference(this, b);
            }
            add(elem) {
              return SetAdd(this, elem);
            }
            del(elem) {
              return SetDel(this, elem);
            }
            complement() {
              return SetComplement(this);
            }
            contains(elem) {
              return isMember(elem, this);
            }
            subsetOf(b) {
              return isSubset(this, b);
            }
          }
          class FiniteSetSortImpl extends SortImpl {
            elemSort() {
              return _toSort(check(Z3.get_finite_set_sort_basis(contextPtr, this.ptr)));
            }
            cast(other) {
              _assertContext(other);
              return other;
            }
          }
          class FiniteSetImpl extends ExprImpl {
            union(other) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_union(contextPtr, this.ast, other.ast)));
            }
            intersect(other) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_intersect(contextPtr, this.ast, other.ast)));
            }
            diff(other) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_difference(contextPtr, this.ast, other.ast)));
            }
            contains(elem) {
              return new BoolImpl(check(Z3.mk_finite_set_member(contextPtr, elem.ast, this.ast)));
            }
            size() {
              return new ExprImpl(check(Z3.mk_finite_set_size(contextPtr, this.ast)));
            }
            subsetOf(other) {
              return new BoolImpl(check(Z3.mk_finite_set_subset(contextPtr, this.ast, other.ast)));
            }
            map(f) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_map(contextPtr, f.ast, this.ast)));
            }
            filter(f) {
              return new FiniteSetImpl(check(Z3.mk_finite_set_filter(contextPtr, f.ast, this.ast)));
            }
          }
          class DatatypeImpl {
            constructor(ctx2, name2) {
              this.constructors = [];
              this.ctx = ctx2;
              this.name = name2;
            }
            declare(name2, ...fields) {
              this.constructors.push([name2, fields]);
              return this;
            }
            create() {
              const datatypes = createDatatypes(this);
              return datatypes[0];
            }
            createPolymorphic(typeParams) {
              return createPolymorphicDatatype(typeParams, this);
            }
          }
          class DatatypeSortImpl extends SortImpl {
            numConstructors() {
              return Z3.get_datatype_sort_num_constructors(contextPtr, this.ptr);
            }
            constructorDecl(idx) {
              const ptr = Z3.get_datatype_sort_constructor(contextPtr, this.ptr, idx);
              return new FuncDeclImpl(ptr);
            }
            recognizer(idx) {
              const ptr = Z3.get_datatype_sort_recognizer(contextPtr, this.ptr, idx);
              return new FuncDeclImpl(ptr);
            }
            accessor(constructorIdx, accessorIdx) {
              const ptr = Z3.get_datatype_sort_constructor_accessor(contextPtr, this.ptr, constructorIdx, accessorIdx);
              return new FuncDeclImpl(ptr);
            }
            cast(other) {
              if (isExpr(other)) {
                (0, utils_1.assert)(this.eqIdentity(other.sort), "Value cannot be converted to this datatype");
                return other;
              }
              throw new Error("Cannot coerce value to datatype expression");
            }
            subsort(other) {
              _assertContext(other.ctx);
              return this.eqIdentity(other);
            }
          }
          class DatatypeExprImpl extends ExprImpl {
          }
          function createDatatypes(...datatypes) {
            if (datatypes.length === 0) {
              throw new Error("At least one datatype must be provided");
            }
            const dtCtx = datatypes[0].ctx;
            for (const dt of datatypes) {
              if (dt.ctx !== dtCtx) {
                throw new Error("All datatypes must be from the same context");
              }
            }
            const sortNames = datatypes.map((dt) => dt.name);
            const constructorLists = [];
            const scopedConstructors = [];
            try {
              for (const dt of datatypes) {
                const constructors = [];
                for (const [constructorName, fields] of dt.constructors) {
                  const fieldNames = [];
                  const fieldSorts = [];
                  const fieldRefs = [];
                  for (const [fieldName, fieldSort] of fields) {
                    fieldNames.push(fieldName);
                    if (fieldSort instanceof DatatypeImpl) {
                      const refIndex = datatypes.indexOf(fieldSort);
                      if (refIndex === -1) {
                        throw new Error(`Referenced datatype "${fieldSort.name}" not found in datatypes being created`);
                      }
                      fieldSorts.push(null);
                      fieldRefs.push(refIndex);
                    } else {
                      fieldSorts.push(fieldSort.ptr);
                      fieldRefs.push(0);
                    }
                  }
                  const constructor = Z3.mk_constructor(contextPtr, Z3.mk_string_symbol(contextPtr, constructorName), Z3.mk_string_symbol(contextPtr, `is_${constructorName}`), fieldNames.map((name2) => Z3.mk_string_symbol(contextPtr, name2)), fieldSorts, fieldRefs);
                  constructors.push(constructor);
                  scopedConstructors.push(constructor);
                }
                const constructorList = Z3.mk_constructor_list(contextPtr, constructors);
                constructorLists.push(constructorList);
              }
              const sortSymbols = sortNames.map((name2) => Z3.mk_string_symbol(contextPtr, name2));
              const resultSorts = Z3.mk_datatypes(contextPtr, sortSymbols, constructorLists);
              const results = [];
              for (let i = 0; i < resultSorts.length; i++) {
                const sortImpl = new DatatypeSortImpl(resultSorts[i]);
                const numConstructors = sortImpl.numConstructors();
                for (let j = 0; j < numConstructors; j++) {
                  const constructor = sortImpl.constructorDecl(j);
                  const recognizer = sortImpl.recognizer(j);
                  const constructorName = constructor.name().toString();
                  if (constructor.arity() === 0) {
                    sortImpl[constructorName] = constructor.call();
                  } else {
                    sortImpl[constructorName] = constructor;
                  }
                  sortImpl[`is_${constructorName}`] = recognizer;
                  for (let k = 0; k < constructor.arity(); k++) {
                    const accessor = sortImpl.accessor(j, k);
                    const accessorName = accessor.name().toString();
                    sortImpl[accessorName] = accessor;
                  }
                }
                results.push(sortImpl);
              }
              return results;
            } finally {
              for (const constructor of scopedConstructors) {
                Z3.del_constructor(contextPtr, constructor);
              }
              for (const constructorList of constructorLists) {
                Z3.del_constructor_list(contextPtr, constructorList);
              }
            }
          }
          function createPolymorphicDatatype(typeParams, datatype) {
            if (!(datatype instanceof DatatypeImpl)) {
              throw new Error("Datatype instance expected");
            }
            const constructors = [];
            try {
              for (const [constructorName, fields] of datatype.constructors) {
                const fieldNames = [];
                const fieldSorts = [];
                const fieldRefs = [];
                for (const [fieldName, fieldSort] of fields) {
                  fieldNames.push(fieldName);
                  if (fieldSort instanceof DatatypeImpl) {
                    if (fieldSort !== datatype) {
                      throw new Error(`Referenced datatype "${fieldSort.name}" is not the polymorphic datatype being created; mutual recursion is not supported in createPolymorphicDatatype`);
                    }
                    fieldSorts.push(null);
                    fieldRefs.push(0);
                  } else {
                    fieldSorts.push(fieldSort.ptr);
                    fieldRefs.push(0);
                  }
                }
                const constructor = Z3.mk_constructor(contextPtr, Z3.mk_string_symbol(contextPtr, constructorName), Z3.mk_string_symbol(contextPtr, `is_${constructorName}`), fieldNames.map((name2) => Z3.mk_string_symbol(contextPtr, name2)), fieldSorts, fieldRefs);
                constructors.push(constructor);
              }
              const nameSymbol = Z3.mk_string_symbol(contextPtr, datatype.name);
              const paramPtrs = typeParams.map((p) => p.ptr);
              const resultSort = Z3.mk_polymorphic_datatype(contextPtr, nameSymbol, paramPtrs, constructors);
              const sortImpl = new DatatypeSortImpl(resultSort);
              const numConstructors = sortImpl.numConstructors();
              for (let j = 0; j < numConstructors; j++) {
                const constructor = sortImpl.constructorDecl(j);
                const recognizer = sortImpl.recognizer(j);
                const constructorName = constructor.name().toString();
                if (constructor.arity() === 0) {
                  sortImpl[constructorName] = constructor.call();
                } else {
                  sortImpl[constructorName] = constructor;
                }
                sortImpl[`is_${constructorName}`] = recognizer;
                for (let k = 0; k < constructor.arity(); k++) {
                  const accessor = sortImpl.accessor(j, k);
                  const accessorName = accessor.name().toString();
                  sortImpl[accessorName] = accessor;
                }
              }
              return sortImpl;
            } finally {
              for (const constructor of constructors) {
                Z3.del_constructor(contextPtr, constructor);
              }
            }
          }
          class QuantifierImpl extends ExprImpl {
            is_forall() {
              return Z3.is_quantifier_forall(contextPtr, this.ast);
            }
            is_exists() {
              return Z3.is_quantifier_exists(contextPtr, this.ast);
            }
            is_lambda() {
              return Z3.is_lambda(contextPtr, this.ast);
            }
            weight() {
              return Z3.get_quantifier_weight(contextPtr, this.ast);
            }
            num_patterns() {
              return Z3.get_quantifier_num_patterns(contextPtr, this.ast);
            }
            pattern(i) {
              return new PatternImpl(check(Z3.get_quantifier_pattern_ast(contextPtr, this.ast, i)));
            }
            num_no_patterns() {
              return Z3.get_quantifier_num_no_patterns(contextPtr, this.ast);
            }
            no_pattern(i) {
              return _toExpr(check(Z3.get_quantifier_no_pattern_ast(contextPtr, this.ast, i)));
            }
            body() {
              return _toExpr(check(Z3.get_quantifier_body(contextPtr, this.ast)));
            }
            num_vars() {
              return Z3.get_quantifier_num_bound(contextPtr, this.ast);
            }
            var_name(i) {
              return _fromSymbol(Z3.get_quantifier_bound_name(contextPtr, this.ast, i));
            }
            var_sort(i) {
              return _toSort(check(Z3.get_quantifier_bound_sort(contextPtr, this.ast, i)));
            }
            children() {
              return [this.body()];
            }
          }
          class NonLambdaQuantifierImpl extends QuantifierImpl {
            not() {
              return Not(this);
            }
            and(other) {
              return And(this, other);
            }
            or(other) {
              return Or(this, other);
            }
            xor(other) {
              return Xor(this, other);
            }
            implies(other) {
              return Implies(this, other);
            }
            iff(other) {
              return Iff(this, other);
            }
          }
          class LambdaImpl extends QuantifierImpl {
            domain() {
              return this.sort.domain();
            }
            domain_n(i) {
              return this.sort.domain_n(i);
            }
            range() {
              return this.sort.range();
            }
            select(...indices) {
              return Select(this, ...indices);
            }
            store(...indicesAndValue) {
              return Store(this, ...indicesAndValue);
            }
            /**
             * Access the array default value.
             * Produces the default range value, for arrays that can be represented as
             * finite maps with a default range value.
             */
            default() {
              return _toExpr(check(Z3.mk_array_default(contextPtr, this.ast)));
            }
          }
          class AstVectorImpl {
            constructor(ptr = Z3.mk_ast_vector(contextPtr)) {
              this.ptr = ptr;
              this.ctx = ctx;
              Z3.ast_vector_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.ast_vector_dec_ref(contextPtr, ptr), this);
            }
            length() {
              return Z3.ast_vector_size(contextPtr, this.ptr);
            }
            [Symbol.iterator]() {
              return this.values();
            }
            *entries() {
              const length = this.length();
              for (let i = 0; i < length; i++) {
                yield [i, this.get(i)];
              }
            }
            *keys() {
              for (let [key] of this.entries()) {
                yield key;
              }
            }
            *values() {
              for (let [, value] of this.entries()) {
                yield value;
              }
            }
            get(from2, to) {
              const length = this.length();
              if (from2 < 0) {
                from2 += length;
              }
              if (from2 >= length) {
                throw new RangeError(`expected from index ${from2} to be less than length ${length}`);
              }
              if (to === void 0) {
                return _toAst(check(Z3.ast_vector_get(contextPtr, this.ptr, from2)));
              }
              if (to < 0) {
                to += length;
              }
              if (to >= length) {
                throw new RangeError(`expected to index ${to} to be less than length ${length}`);
              }
              const result = [];
              for (let i = from2; i < to; i++) {
                result.push(_toAst(check(Z3.ast_vector_get(contextPtr, this.ptr, i))));
              }
              return result;
            }
            set(i, v) {
              _assertContext(v);
              if (i >= this.length()) {
                throw new RangeError(`expected index ${i} to be less than length ${this.length()}`);
              }
              check(Z3.ast_vector_set(contextPtr, this.ptr, i, v.ast));
            }
            push(v) {
              _assertContext(v);
              check(Z3.ast_vector_push(contextPtr, this.ptr, v.ast));
            }
            resize(size) {
              check(Z3.ast_vector_resize(contextPtr, this.ptr, size));
            }
            has(v) {
              _assertContext(v);
              for (const item of this.values()) {
                if (item.eqIdentity(v)) {
                  return true;
                }
              }
              return false;
            }
            sexpr() {
              return check(Z3.ast_vector_to_string(contextPtr, this.ptr));
            }
          }
          class AstMapImpl {
            constructor(ptr = Z3.mk_ast_map(contextPtr)) {
              this.ptr = ptr;
              this.ctx = ctx;
              Z3.ast_map_inc_ref(contextPtr, ptr);
              cleanup.register(this, () => Z3.ast_map_dec_ref(contextPtr, ptr), this);
            }
            [Symbol.iterator]() {
              return this.entries();
            }
            get size() {
              return Z3.ast_map_size(contextPtr, this.ptr);
            }
            *entries() {
              for (const key of this.keys()) {
                yield [key, this.get(key)];
              }
            }
            keys() {
              return new AstVectorImpl(Z3.ast_map_keys(contextPtr, this.ptr));
            }
            *values() {
              for (const [_, value] of this.entries()) {
                yield value;
              }
            }
            get(key) {
              return _toAst(check(Z3.ast_map_find(contextPtr, this.ptr, key.ast)));
            }
            set(key, value) {
              check(Z3.ast_map_insert(contextPtr, this.ptr, key.ast, value.ast));
            }
            delete(key) {
              check(Z3.ast_map_erase(contextPtr, this.ptr, key.ast));
            }
            clear() {
              check(Z3.ast_map_reset(contextPtr, this.ptr));
            }
            has(key) {
              return check(Z3.ast_map_contains(contextPtr, this.ptr, key.ast));
            }
            sexpr() {
              return check(Z3.ast_map_to_string(contextPtr, this.ptr));
            }
          }
          function substitute(t, ...substitutions) {
            _assertContext(t);
            const from2 = [];
            const to = [];
            for (const [f, t2] of substitutions) {
              _assertContext(f);
              _assertContext(t2);
              from2.push(f.ast);
              to.push(t2.ast);
            }
            return _toExpr(check(Z3.substitute(contextPtr, t.ast, from2, to)));
          }
          function substituteVars(t, ...to) {
            _assertContext(t);
            const toAsts = [];
            for (const expr of to) {
              _assertContext(expr);
              toAsts.push(expr.ast);
            }
            return _toExpr(check(Z3.substitute_vars(contextPtr, t.ast, toAsts)));
          }
          function substituteFuns(t, ...substitutions) {
            _assertContext(t);
            const from2 = [];
            const to = [];
            for (const [f, body] of substitutions) {
              _assertContext(f);
              _assertContext(body);
              from2.push(f.ptr);
              to.push(body.ast);
            }
            return _toExpr(check(Z3.substitute_funs(contextPtr, t.ast, from2, to)));
          }
          function updateField(t, fieldAccessor, newValue) {
            _assertContext(t);
            _assertContext(fieldAccessor);
            _assertContext(newValue);
            return _toExpr(check(Z3.datatype_update_field(contextPtr, fieldAccessor.ptr, t.ast, newValue.ast)));
          }
          function ast_from_string(s) {
            const sort_names = [];
            const sorts = [];
            const decl_names = [];
            const decls = [];
            const v = new AstVectorImpl(check(Z3.parse_smtlib2_string(contextPtr, s, sort_names, sorts, decl_names, decls)));
            if (v.length() !== 1) {
              throw new Error("Expected exactly one AST. Instead got " + v.length() + ": " + v.sexpr());
            }
            return v.get(0);
          }
          const ctx = {
            ptr: contextPtr,
            name,
            /////////////
            // Classes //
            /////////////
            Solver: SolverImpl,
            Optimize: OptimizeImpl,
            Fixedpoint: FixedpointImpl,
            Model: ModelImpl,
            Tactic: TacticImpl,
            Goal: GoalImpl,
            Params: ParamsImpl,
            Simplifier: SimplifierImpl,
            AstVector: AstVectorImpl,
            AstMap: AstMapImpl,
            ///////////////
            // Functions //
            ///////////////
            interrupt,
            setPrintMode,
            isModel,
            isAst,
            isSort,
            isFuncDecl,
            isFuncInterp,
            isApp,
            isConst,
            isExpr,
            isVar,
            isAppOf,
            isBool,
            isTrue,
            isFalse,
            isAnd,
            isOr,
            isImplies,
            isNot,
            isEq,
            isDistinct,
            isQuantifier,
            isArith,
            isArithSort,
            isInt,
            isIntVal,
            isIntSort,
            isReal,
            isRealVal,
            isRealSort,
            isRCFNum,
            isBitVecSort,
            isBitVec,
            isBitVecVal,
            // TODO fix ordering
            isFPRMSort,
            isFPRM,
            isFPSort,
            isFP,
            isFPVal,
            isSeqSort,
            isSeq,
            isStringSort,
            isString,
            isFiniteSetSort,
            isFiniteSet,
            isArraySort,
            isArray,
            isConstArray,
            isProbe,
            isTactic,
            isGoal,
            isAstVector,
            eqIdentity,
            getVarIndex,
            from,
            solve,
            /////////////
            // Objects //
            /////////////
            Sort,
            Function,
            RecFunc,
            Bool,
            Int,
            Real,
            RCFNum,
            BitVec,
            Float,
            FloatRM,
            String: String2,
            Seq,
            Re,
            Array: Array2,
            Set: Set2,
            FiniteSet,
            Datatype,
            TypeVariable,
            ////////////////
            // Operations //
            ////////////////
            If,
            Distinct,
            Const,
            Consts,
            FreshConst,
            Var,
            Implies,
            Iff,
            Eq,
            Xor,
            Not,
            And,
            Or,
            PbEq,
            PbGe,
            PbLe,
            AtMost,
            AtLeast,
            ForAll,
            Exists,
            Lambda,
            ToReal,
            ToInt,
            IsInt,
            Sqrt,
            Cbrt,
            BV2Int,
            Int2BV,
            Concat,
            Cond,
            AndThen,
            OrElse,
            Repeat,
            TryFor,
            When,
            Skip,
            Fail,
            FailIf,
            ParOr,
            ParAndThen,
            With,
            LT,
            GT,
            LE,
            GE,
            ULT,
            UGT,
            ULE,
            UGE,
            SLT,
            SGT,
            SLE,
            SGE,
            Sum,
            Sub,
            Product,
            Div,
            BUDiv,
            Neg,
            Mod,
            Select,
            Store,
            Ext,
            Extract,
            substitute,
            substituteVars,
            substituteFuns,
            updateField,
            simplify,
            /////////////
            // Loading //
            /////////////
            ast_from_string,
            SetUnion,
            SetIntersect,
            SetDifference,
            SetAdd,
            SetDel,
            SetComplement,
            EmptySet,
            FullSet,
            isMember,
            isSubset,
            InRe,
            Union,
            Intersect,
            ReConcat,
            Plus,
            Star,
            Option,
            Complement,
            Diff,
            Range,
            Loop,
            Power,
            AllChar,
            Empty,
            Full,
            mkPartialOrder,
            mkLinearOrder,
            mkPiecewiseLinearOrder,
            mkTreeOrder,
            mkTransitiveClosure,
            mkChar,
            mkCharLe,
            mkCharToInt,
            mkCharToBV,
            mkCharFromBV,
            mkCharIsDigit,
            polynomialSubresultants
          };
          cleanup.register(ctx, () => Z3.del_context(contextPtr));
          return ctx;
        }
        return {
          enableTrace,
          disableTrace,
          getVersion,
          getVersionString,
          getFullVersion,
          openLog,
          appendLog,
          getParam,
          setParam,
          resetParams,
          Context: createContext
        };
      }
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/index.js
  var require_high_level2 = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/high-level/index.js"(exports) {
      "use strict";
      var __createBinding2 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar2 = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding2(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      __exportStar2(require_high_level(), exports);
      __exportStar2(require_types(), exports);
    }
  });

  // ../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/browser.js
  var require_browser = __commonJS({
    "../../../../../../../../../../home/fabi/clocktower_copilot/node_modules/z3-solver/build/browser.js"(exports) {
      "use strict";
      var __createBinding2 = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      }) : (function(o, m, k, k2) {
        if (k2 === void 0) k2 = k;
        o[k2] = m[k];
      }));
      var __exportStar2 = exports && exports.__exportStar || function(m, exports2) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p)) __createBinding2(exports2, m, p);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.init = init3;
      var high_level_1 = require_high_level2();
      var low_level_1 = require_low_level();
      __exportStar2(require_types(), exports);
      __exportStar2(require_types_GENERATED(), exports);
      async function init3(moduleOverrides = {}) {
        const initZ3 = global.initZ3;
        if (initZ3 === void 0) {
          throw new Error("initZ3 was not imported correctly. Please consult documentation on how to load Z3 in browser");
        }
        const lowLevel = await (0, low_level_1.init)(initZ3, moduleOverrides);
        const highLevel = (0, high_level_1.createApi)(lowLevel.Z3, lowLevel.em);
        return { ...lowLevel, ...highLevel };
      }
    }
  });

  // src/core/z3-engine.ts
  var z3_engine_exports = {};
  __export(z3_engine_exports, {
    handle: () => handle
  });
  var import_z3_solver2 = __toESM(require_browser(), 1);

  // src/core/symbolicSetup.ts
  var import_z3_solver = __toESM(require_browser(), 1);

  // src/core/model.ts
  var ROLES = [
    "Washerwoman",
    "Librarian",
    "Investigator",
    "Chef",
    "Empath",
    "Fortune Teller",
    "Undertaker",
    "Monk",
    "Ravenkeeper",
    "Virgin",
    "Slayer",
    "Soldier",
    "Mayor",
    "Butler",
    "Drunk",
    "Recluse",
    "Saint",
    "Poisoner",
    "Spy",
    "Scarlet Woman",
    "Baron",
    "Imp"
  ];
  var ROLE_ZH = {
    Washerwoman: "\u6D17\u8863\u5987",
    Librarian: "\u56FE\u4E66\u7BA1\u7406\u5458",
    Investigator: "\u8C03\u67E5\u5458",
    Chef: "\u53A8\u5E08",
    Empath: "\u5171\u60C5\u8005",
    "Fortune Teller": "\u5360\u535C\u5E08",
    Undertaker: "\u9001\u846C\u8005",
    Monk: "\u50E7\u4FA3",
    Ravenkeeper: "\u5B88\u9E26\u4EBA",
    Virgin: "\u8D1E\u6D01\u8005",
    Slayer: "\u730E\u624B",
    Soldier: "\u58EB\u5175",
    Mayor: "\u9547\u957F",
    Butler: "\u7BA1\u5BB6",
    Drunk: "\u9152\u9B3C",
    Recluse: "\u9690\u58EB",
    Saint: "\u5723\u5F92",
    Poisoner: "\u6295\u6BD2\u8005",
    Spy: "\u95F4\u8C0D",
    "Scarlet Woman": "\u7EA2\u5507\u5973\u90CE",
    Baron: "\u7537\u7235",
    Imp: "\u5C0F\u6076\u9B54"
  };
  var timeLabel = (time) => time ? `${time.phase === "night" ? "N" : "D"}${time.cycle}` : "\u65F6\u95F4\u672A\u5B9A";
  function activeEvents(events, revision = Infinity) {
    const upto = events.filter((e) => e.revision <= revision);
    const removed = new Set(
      upto.filter((e) => e.payload.kind === "retraction").map((e) => e.payload.targetId)
    );
    return upto.filter(
      (e) => e.payload.kind !== "retraction" && !removed.has(e.id)
    );
  }
  function eventLabel(event) {
    const p = event.payload;
    if (p.kind === "claim") {
      if (p.claimKind === "role")
        return p.identityStage === "current" ? `${p.speaker}\u53F7\u58F0\u79F0\u5F53\u524D\u89D2\u8272\u4E3A${ROLE_ZH[p.role]}` : `${p.speaker}\u53F7\u58F0\u79F0${ROLE_ZH[p.role]}`;
      if (p.role === "Investigator" || p.role === "Washerwoman")
        return `${p.speaker}\u53F7\u62A5\u544A${p.targets?.join("/")}\u53F7\u4E2D\u6709${ROLE_ZH[p.value]}`;
      if (p.role === "Librarian")
        return p.value === 0 ? `${p.speaker}\u53F7\u62A5\u544A\u96F6\u5916\u6765\u8005` : `${p.speaker}\u53F7\u62A5\u544A${p.targets?.join("/")}\u53F7\u4E2D\u6709${ROLE_ZH[p.value]}`;
      if (p.role === "Chef") return `${p.speaker}\u53F7\u62A5\u544A${p.value}\u7EC4\u90AA\u6076\u76F8\u90BB`;
      if (p.role === "Empath") return `${p.speaker}\u53F7\u62A5\u544A${p.value}\u540D\u90AA\u6076\u90BB\u5C45`;
      if (p.role === "Fortune Teller")
        return `${p.speaker}\u53F7\u62A5\u544A${p.targets?.join("/")}\u53F7\uFF1A${p.value ? "\u662F" : "\u5426"}`;
      if (p.role === "Ravenkeeper")
        return `${p.speaker}\u53F7\u62A5\u544A${p.targets?.[0]}\u53F7\u662F${ROLE_ZH[p.value]}`;
      return `${p.speaker}\u53F7\u62A5\u544A\u770B\u5230${ROLE_ZH[p.value]}`;
    }
    if (p.kind === "nomination") return `${p.nominator}\u53F7\u63D0\u540D${p.nominee}\u53F7`;
    if (p.kind === "vote") return `\u63D0\u540D${p.nominee}\u53F7\uFF1A${p.voters.length}\u7968`;
    if (p.kind === "execution") return `${p.seat}\u53F7\u88AB\u5904\u51B3`;
    if (p.kind === "death") return `${p.seat}\u53F7\u6B7B\u4EA1`;
    if (p.kind === "slayer") return `${p.actor}\u53F7\u4F7F\u7528\u730E\u624B\u80FD\u529B\u6307\u5411${p.target}\u53F7`;
    if (p.kind === "winner")
      return `${p.team === "good" ? "\u5584\u826F" : "\u90AA\u6076"}\u9635\u8425\u83B7\u80DC`;
    if (p.kind === "phase_closed")
      return p.channel === "actions" ? "\u672C\u65E5\u884C\u52A8\u8BB0\u5F55\u5B8C\u6574" : "\u672C\u9636\u6BB5\u6B7B\u4EA1\u8BB0\u5F55\u5B8C\u6574";
    return "\u64A4\u56DE\u8BEF\u5F55";
  }

  // src/core/setup.ts
  var TOWNSFOLK = [
    "Washerwoman",
    "Librarian",
    "Investigator",
    "Chef",
    "Empath",
    "Fortune Teller",
    "Undertaker",
    "Monk",
    "Ravenkeeper",
    "Virgin",
    "Slayer",
    "Soldier",
    "Mayor"
  ];
  var OUTSIDERS = [
    "Butler",
    "Drunk",
    "Recluse",
    "Saint"
  ];
  var MINIONS = [
    "Poisoner",
    "Spy",
    "Scarlet Woman",
    "Baron"
  ];
  var DEMONS = ["Imp"];
  var ROLE_TEAM = Object.fromEntries([
    ...TOWNSFOLK.map((role) => [role, "townsfolk"]),
    ...OUTSIDERS.map((role) => [role, "outsider"]),
    ...MINIONS.map((role) => [role, "minion"]),
    ...DEMONS.map((role) => [role, "demon"])
  ]);
  function baseSetup(playerCount) {
    if (!Number.isInteger(playerCount) || playerCount < 7 || playerCount > 15) {
      throw new RangeError("V1\u6807\u51C6\u8BBE\u7F6E\u4EC5\u652F\u63017\u201315\u540D\u975E\u65C5\u884C\u8005\u73A9\u5BB6\u3002");
    }
    const tier = Math.floor((playerCount - 7) / 3);
    return {
      townsfolk: 5 + 2 * tier,
      outsider: (playerCount - 7) % 3,
      minion: 1 + tier,
      demon: 1
    };
  }
  function validateInitialSetup(players) {
    const count = players.length;
    const errors = [];
    let expected = null;
    try {
      expected = baseSetup(count);
    } catch (error) {
      errors.push(error.message);
    }
    const baronInPlay = players.some((p) => p.actualRole === "Baron");
    if (expected && baronInPlay) {
      expected = {
        ...expected,
        townsfolk: expected.townsfolk - 2,
        outsider: expected.outsider + 2
      };
    }
    const actual = {
      townsfolk: 0,
      outsider: 0,
      minion: 0,
      demon: 1
    };
    let demonCount = 0;
    const seenSeats = /* @__PURE__ */ new Set();
    const seenRoles = /* @__PURE__ */ new Set();
    const roleSet = new Set(ROLES);
    for (const player of players) {
      if (!Number.isInteger(player.seat) || player.seat < 1 || player.seat > count || seenSeats.has(player.seat)) {
        errors.push(`\u5EA7\u4F4D ${player.seat} \u65E0\u6548\u6216\u91CD\u590D\u3002`);
      }
      seenSeats.add(player.seat);
      if (!roleSet.has(player.actualRole)) {
        errors.push(`${player.seat}\u53F7\u89D2\u8272\u4E0D\u5728Trouble Brewing\u76EE\u5F55\u4E2D\u3002`);
        continue;
      }
      if (seenRoles.has(player.actualRole))
        errors.push(`\u521D\u59CB\u89D2\u8272 ${player.actualRole} \u91CD\u590D\u3002`);
      seenRoles.add(player.actualRole);
      const team = ROLE_TEAM[player.actualRole];
      if (team === "demon") demonCount++;
      else actual[team]++;
      if (player.actualRole === "Drunk") {
        if (!player.shownToken || ROLE_TEAM[player.shownToken] !== "townsfolk") {
          errors.push("\u9152\u9B3C\u5FC5\u987B\u770B\u5230\u4E00\u4E2A\u9547\u6C11\u89D2\u8272token\u3002");
        }
      } else if (player.shownToken && player.shownToken !== player.actualRole) {
        errors.push(
          `${player.seat}\u53F7\u6240\u89C1token\u4E0E\u771F\u5B9E\u89D2\u8272\u4E0D\u4E00\u81F4\uFF1B\u6B64\u8BBE\u7F6E\u5DEE\u5F02\u53EA\u4E3A\u9152\u9B3C\u5EFA\u6A21\u3002`
        );
      }
    }
    actual.demon = demonCount;
    if (expected) {
      for (const team of ["townsfolk", "outsider", "minion", "demon"]) {
        if (actual[team] !== expected[team])
          errors.push(
            `${team} \u6570\u91CF\u5E94\u4E3A ${expected[team]}\uFF0C\u5B9E\u9645\u4E3A ${actual[team]}\u3002`
          );
      }
    }
    const drunk = players.find((p) => p.actualRole === "Drunk");
    if (drunk?.shownToken && seenRoles.has(drunk.shownToken)) {
      errors.push("\u9152\u9B3C\u770B\u5230\u7684\u9547\u6C11token\u4E0D\u5F97\u540C\u65F6\u4F5C\u4E3A\u53E6\u4E00\u4F4D\u73A9\u5BB6\u7684\u521D\u59CB\u771F\u5B9E\u89D2\u8272\u3002");
    }
    return { valid: errors.length === 0, expected, actual, baronInPlay, errors };
  }

  // src/core/replayFirstNight.ts
  function replayFirstNight(input, witness) {
    const errors = [];
    const roles = witness.roles;
    const setup = validateInitialSetup(
      roles.map((actualRole, index) => ({
        seat: index + 1,
        actualRole,
        ...actualRole === "Drunk" ? { shownToken: witness.shownTokens?.[index] } : {}
      }))
    );
    if (witness.shownTokens?.length !== roles.length || roles.some(
      (role, index) => role !== "Drunk" && witness.shownTokens?.[index] !== role
    ))
      errors.push("\u6240\u89C1token\u4E0E\u771F\u5B9E\u89D2\u8272\u6216\u5EA7\u4F4D\u6570\u4E0D\u4E00\u81F4\u3002");
    for (const token of input.tokenFacts ?? [])
      if (witness.shownTokens?.[token.seat - 1] !== token.shownRole)
        errors.push(`${token.seat}\u53F7\u6240\u89C1token\u4E0E\u5DF2\u91C7\u7EB3\u4FE1\u606F\u4E0D\u7B26\u3002`);
    if (roles.length !== input.playerCount || !setup.valid)
      errors.push(...setup.errors, "\u4EBA\u6570\u6216\u521D\u59CB\u89D2\u8272\u8BBE\u7F6E\u4E0D\u5408\u6CD5\u3002");
    if (input.nightOnePoisoner) {
      if (roles[input.nightOnePoisoner.seat - 1] !== "Poisoner")
        errors.push("\u5DF2\u91C7\u7EB3\u7684\u9996\u591C\u6295\u6BD2\u8005\u5EA7\u4F4D\u4E0D\u662F\u771F\u5B9E\u6295\u6BD2\u8005\u3002 ");
      if (witness.nightOnePoisoner?.seat !== input.nightOnePoisoner.seat || witness.nightOnePoisoner?.target !== input.nightOnePoisoner.target)
        errors.push("\u89C1\u8BC1\u6CA1\u6709\u91CD\u653E\u9996\u591C\u6295\u6BD2\u884C\u52A8\u3002 ");
    }
    for (const fact of input.facts)
      if (roles[fact.seat - 1] !== fact.role)
        errors.push(`${fact.seat}\u53F7\u4E0D\u7B26\u5408\u5DF2\u91C7\u7EB3\u7684\u771F\u5B9E\u89D2\u8272\u5047\u8BBE\u3002`);
    const isEvil = (role) => ROLE_TEAM[role] === "minion" || ROLE_TEAM[role] === "demon";
    const isPoisoned = (seat) => input.nightOnePoisoner?.target === seat;
    if (witness.registrations.some((choice) => isPoisoned(choice.seat)))
      errors.push("\u4E2D\u6BD2\u89D2\u8272\u4E0D\u80FD\u4F5C\u51FA\u7279\u6B8A\u6CE8\u518C\u9009\u62E9\u3002");
    const registration = (interaction, seat) => witness.registrations.find(
      (item) => item.interaction === interaction && item.seat === seat
    );
    const registeredEvil = (seat, interaction) => {
      const actual = roles[seat - 1];
      if (!isPoisoned(seat) && (actual === "Spy" || actual === "Recluse")) {
        const choice = registration(interaction, seat);
        if (choice?.evil === void 0)
          errors.push(`\u7F3A\u5C11${interaction}\u5BF9${seat}\u53F7\u7684\u9635\u8425\u6CE8\u518C\u9009\u62E9\u3002`);
        return choice?.evil ?? isEvil(actual);
      }
      return isEvil(actual);
    };
    for (const [index, report] of (input.reports ?? []).entries()) {
      const ability = report.kind === "pair_role" ? report.ability : report.kind === "librarian_zero" ? "Librarian" : report.kind === "chef" ? "Chef" : report.kind === "empath" ? "Empath" : "Fortune Teller";
      if (report.abilityActive && input.nightOnePoisoner?.target === report.speaker)
        errors.push(`${report.speaker}\u53F7\u9996\u591C\u88AB\u6295\u6BD2\uFF0C\u80FD\u529B\u4E0D\u80FD\u6709\u6548\u3002`);
      if (report.abilityActive && roles[report.speaker - 1] !== ability)
        errors.push(`${report.speaker}\u53F7\u6CA1\u6709\u88AB\u5047\u5B9A\u6709\u6548\u7684${ability}\u80FD\u529B\u3002`);
      if (!report.abilityActive || !report.acceptedMessage) continue;
      if (report.kind === "librarian_zero") {
        if (roles.some((role, position) => {
          if (ROLE_TEAM[role] !== "outsider") return false;
          const seat = position + 1;
          const registered = registration(`librarian_zero_${index}`, seat)?.role;
          return !(role === "Recluse" && !isPoisoned(seat) && registered && (ROLE_TEAM[registered] === "minion" || ROLE_TEAM[registered] === "demon"));
        }))
          errors.push(`\u7B2C${index + 1}\u6761\u56FE\u4E66\u7BA1\u7406\u5458\u96F6\u5916\u6765\u8005\u4FE1\u606F\u65E0\u6CD5\u91CD\u653E\u3002`);
      } else if (report.kind === "pair_role") {
        if (!report.targets.some((seat) => {
          if (roles[seat - 1] === report.seenRole) return true;
          const special = report.ability === "Investigator" ? "Recluse" : "Spy";
          return !isPoisoned(seat) && roles[seat - 1] === special && registration(`pair_${index}`, seat)?.role === report.seenRole;
        }))
          errors.push(`\u7B2C${index + 1}\u6761\u4E8C\u9009\u4E00\u89D2\u8272\u4FE1\u606F\u65E0\u6CD5\u91CD\u653E\u3002`);
      } else if (report.kind === "chef") {
        let count = 0;
        for (let position = 0; position < roles.length; position++) {
          const left = position + 1, right = (position + 1) % roles.length + 1;
          if (registeredEvil(left, `chef_${index}_${position}_left`) && registeredEvil(right, `chef_${index}_${position}_right`))
            count++;
        }
        if (count !== report.count)
          errors.push(
            `\u7B2C${index + 1}\u6761\u53A8\u5E08\u4FE1\u606F\u5E94\u4E3A${report.count}\uFF0C\u89C1\u8BC1\u91CD\u653E\u5F97\u5230${count}\u3002`
          );
      } else if (report.kind === "empath") {
        const left = report.speaker === 1 ? roles.length : report.speaker - 1;
        const right = report.speaker === roles.length ? 1 : report.speaker + 1;
        const count = Number(registeredEvil(left, `empath_${index}_left`)) + Number(registeredEvil(right, `empath_${index}_right`));
        if (count !== report.count)
          errors.push(`\u7B2C${index + 1}\u6761\u5171\u60C5\u8005\u4FE1\u606F\u65E0\u6CD5\u91CD\u653E\u3002`);
      } else {
        if (!witness.redHerringSeat || ![...roles].some(
          (role, i) => i + 1 === witness.redHerringSeat && (ROLE_TEAM[role] === "townsfolk" || ROLE_TEAM[role] === "outsider")
        )) {
          errors.push("\u5360\u535C\u5E08\u7EA2\u9CB1\u9C7C\u4E0D\u662F\u4E00\u4E2A\u5584\u826F\u73A9\u5BB6\u3002");
        }
        const yes = report.targets.some(
          (seat) => roles[seat - 1] === "Imp" || seat === witness.redHerringSeat || roles[seat - 1] === "Recluse" && !isPoisoned(seat) && registration(`ft_${index}`, seat)?.role === "Imp"
        );
        if (yes !== report.yes)
          errors.push(`\u7B2C${index + 1}\u6761\u5360\u535C\u5E08\u4FE1\u606F\u65E0\u6CD5\u91CD\u653E\u3002`);
      }
    }
    return { valid: errors.length === 0, errors };
  }

  // src/core/alignment.ts
  function initialAlignments(roles) {
    return roles.map(
      (role) => ROLE_TEAM[role] === "minion" || ROLE_TEAM[role] === "demon" ? "evil" : "good"
    );
  }
  function validAlignments(state) {
    return state.alignments === void 0 || Array.isArray(state.alignments) && state.alignments.length === state.roles.length && Array.from(state.alignments).every(
      (alignment) => alignment === "good" || alignment === "evil"
    );
  }
  function copyAlignments(state) {
    return state.alignments ? [...state.alignments] : initialAlignments(state.roles);
  }
  function isActuallyEvil(state, seat) {
    const explicit = state.alignments?.[seat - 1];
    return explicit !== void 0 ? explicit === "evil" : ROLE_TEAM[state.roles[seat - 1]] === "minion" || ROLE_TEAM[state.roles[seat - 1]] === "demon";
  }

  // src/core/day.ts
  var validSeat = (seat, n) => Number.isInteger(seat) && seat >= 1 && seat <= n;
  function resolveDay(before, actions) {
    const n = before.roles.length;
    if (n < 7 || n > 15 || before.alive.length !== n || !validAlignments(before) || before.winner || before.alive.filter(Boolean).length < 3 || before.roles.filter((role, index) => role === "Imp" && before.alive[index]).length < 1)
      return { status: "invalid", reason: "\u4EBA\u6570\u3001\u5B58\u6D3B\u8868\u6216\u7EC8\u5C40\u72B6\u6001\u65E0\u6548\u3002" };
    if (!Array.isArray(actions.events))
      return { status: "invalid", reason: "\u9700\u8981\u6309\u987A\u5E8F\u8BB0\u5F55\u5B8C\u6574\u767D\u5929\u4E8B\u4EF6\u3002" };
    const registeredDeaths = actions.scarletRecluseRegistrations ?? [];
    if (!Array.isArray(registeredDeaths) || new Set(registeredDeaths).size !== registeredDeaths.length || Array.from(registeredDeaths).some((seat) => !validSeat(seat, n)))
      return {
        status: "invalid",
        reason: "\u7EA2\u5507\u5973\u90CE\u7684\u9690\u58EB\u6B7B\u4EA1\u6CE8\u518C\u5305\u542B\u65E0\u6548\u6216\u91CD\u590D\u5EA7\u4F4D\u3002"
      };
    const usedRegistrations = /* @__PURE__ */ new Set();
    const state = {
      roles: [...before.roles],
      alive: [...before.alive],
      alignments: copyAlignments(before),
      spentVirginSeats: [...before.spentVirginSeats ?? []],
      spentSlayerSeats: [...before.spentSlayerSeats ?? []],
      spentDeadVotes: [...before.spentDeadVotes ?? []]
    };
    const source = actions.poisonSourceSeat ?? null;
    const poison = actions.poisonedSeat ?? null;
    if (source === null !== (poison === null))
      return { status: "invalid", reason: "\u4E2D\u6BD2\u76EE\u6807\u4E0E\u6765\u6E90\u5FC5\u987B\u4E00\u8D77\u8BB0\u5F55\u3002" };
    if (source !== null && (!validSeat(source, n) || !validSeat(poison, n) || !state.alive[source - 1] || state.roles[source - 1] !== "Poisoner"))
      return { status: "invalid", reason: "\u767D\u5929\u4E2D\u6BD2\u6765\u6E90\u4E0D\u662F\u5B58\u6D3B\u7684\u6295\u6BD2\u8005\u3002" };
    const butler = state.roles.findIndex((role, i) => role === "Butler" && state.alive[i]) + 1;
    const master = actions.butlerMasterSeat ?? null;
    if (butler && (master === null || !validSeat(master, n) || master === butler))
      return { status: "invalid", reason: "\u5B58\u6D3B\u7684\u7537\u4EC6\u5FC5\u987B\u6709\u975E\u81EA\u8EAB\u4E3B\u4EBA\u3002" };
    if (!butler && master !== null)
      return { status: "invalid", reason: "\u6CA1\u6709\u5B58\u6D3B\u7684\u7537\u4EC6\u5374\u8BB0\u5F55\u4E86\u4E3B\u4EBA\u3002" };
    const aliveCount2 = () => state.alive.filter(Boolean).length;
    const active = (seat) => !(source !== null && state.alive[source - 1] && state.roles[source - 1] === "Poisoner" && seat === poison);
    const deaths = [];
    const nominationTallies = [];
    const roleChanges = [];
    const butlerVoteWarnings = [];
    const nominators = /* @__PURE__ */ new Set();
    const nominees = /* @__PURE__ */ new Set();
    const fail = (reason) => ({ status: "invalid", reason });
    const demonDeath = (seat, preDeathAlive) => {
      const actualDemon = state.roles[seat - 1] === "Imp";
      const scarlet = state.roles.findIndex(
        (role, i) => role === "Scarlet Woman" && state.alive[i] && active(i + 1)
      ) + 1;
      const registeredRecluse = state.roles[seat - 1] === "Recluse" && active(seat) && scarlet && preDeathAlive >= 5 && registeredDeaths.includes(seat);
      if (!actualDemon && !registeredRecluse) return;
      if (registeredRecluse) usedRegistrations.add(seat);
      if (scarlet && preDeathAlive >= 5) {
        state.roles[scarlet - 1] = "Imp";
        roleChanges.push({
          seat: scarlet,
          from: "Scarlet Woman",
          to: "Imp",
          reason: "scarlet_woman",
          ...registeredRecluse ? { registeredRecluseSeat: seat } : {}
        });
      } else if (!state.roles.some((role, index) => role === "Imp" && state.alive[index]))
        state.winner = "good";
    };
    let immediateExecution = null;
    let executionDeathSeat = null;
    let executionCause = null;
    let endedAfterEventIndex = null;
    const eventSteps = [];
    for (const [eventIndex, event] of actions.events.entries()) {
      if (state.winner || immediateExecution !== null)
        return fail("\u7EC8\u5C40\u6216\u5904\u5973\u80FD\u529B\u7ACB\u5373\u5904\u51B3\u540E\u4E0D\u53EF\u518D\u8BB0\u5F55\u767D\u5929\u884C\u52A8\u3002");
      const deathOffset = deaths.length;
      const finishEvent = () => {
        eventSteps.push({
          eventIndex,
          deaths: deaths.slice(deathOffset),
          executedSeat: immediateExecution,
          aliveAfter: aliveCount2(),
          ...state.winner ? { winner: state.winner } : {}
        });
        if (state.winner || immediateExecution !== null)
          endedAfterEventIndex = eventIndex;
      };
      if (event.kind === "slayer") {
        if (!validSeat(event.actor, n) || !validSeat(event.target, n))
          return fail("\u6740\u624B\u884C\u52A8\u5305\u542B\u65E0\u6548\u5EA7\u4F4D\u3002");
        const actual = state.roles[event.actor - 1] === "Slayer" && state.alive[event.actor - 1];
        if (!actual) {
          if (event.recluseRegistersDemon !== void 0)
            return fail("\u975E\u5B58\u6D3B\u6740\u624B\u7684\u516C\u5F00\u5BA3\u79F0\u4E0D\u80FD\u643A\u5E26\u771F\u5B9E\u6CE8\u518C\u9009\u62E9\u3002");
          finishEvent();
          continue;
        }
        if (state.spentSlayerSeats.includes(event.actor))
          return fail("\u540C\u4E00\u6740\u624B\u4E0D\u80FD\u518D\u6B21\u53D1\u52A8\u5DF2\u7528\u8FC7\u7684\u80FD\u529B\u3002");
        state.spentSlayerSeats.push(event.actor);
        if (!active(event.actor) || !state.alive[event.target - 1]) {
          finishEvent();
          continue;
        }
        const targetRole = state.roles[event.target - 1];
        const recluseCanRegister = targetRole === "Recluse" && active(event.target);
        if (recluseCanRegister && event.recluseRegistersDemon === void 0)
          return {
            status: "unsupported",
            reason: "\u6740\u624B\u6307\u5B9A\u9690\u58EB\u65F6\u5FC5\u987B\u8BB0\u5F55\u5176\u5728\u6B64\u4E92\u52A8\u662F\u5426\u6CE8\u518C\u4E3A\u6076\u9B54\u3002"
          };
        if (!recluseCanRegister && event.recluseRegistersDemon !== void 0)
          return fail("\u9690\u58EB\u6CE8\u518C\u9009\u62E9\u53EA\u80FD\u7528\u4E8E\u771F\u5B9E\u9690\u58EB\u76EE\u6807\u3002");
        if (targetRole === "Imp" || recluseCanRegister && event.recluseRegistersDemon) {
          const count = aliveCount2();
          state.alive[event.target - 1] = false;
          deaths.push(event.target);
          demonDeath(event.target, count);
          if (!state.winner && aliveCount2() <= 2) state.winner = "evil";
        }
        finishEvent();
        continue;
      }
      if (!validSeat(event.nominator, n) || !validSeat(event.nominee, n) || !state.alive[event.nominator - 1] || nominators.has(event.nominator) || nominees.has(event.nominee))
        return fail("\u63D0\u540D\u8005\u6216\u88AB\u63D0\u540D\u8005\u65E0\u6548\uFF0C\u6216\u540C\u65E5\u91CD\u590D\u63D0\u540D\u3002");
      if (!Array.isArray(event.votes)) return fail("\u63D0\u540D\u5FC5\u987B\u8BB0\u5F55\u5B8C\u6574\u6295\u7968\u96C6\u5408\u3002");
      nominators.add(event.nominator);
      nominees.add(event.nominee);
      const firstVirgin = state.roles[event.nominee - 1] === "Virgin" && state.alive[event.nominee - 1] && !state.spentVirginSeats.includes(event.nominee);
      if (firstVirgin) {
        state.spentVirginSeats.push(event.nominee);
        if (active(event.nominee)) {
          const nominatorRole = state.roles[event.nominator - 1];
          const spyCanRegister = nominatorRole === "Spy" && active(event.nominator);
          if (spyCanRegister && event.spyRegistersTownsfolk === void 0)
            return {
              status: "unsupported",
              reason: "\u95F4\u8C0D\u9996\u6B21\u63D0\u540D\u5065\u5EB7\u5904\u5973\u65F6\u5FC5\u987B\u8BB0\u5F55\u6B64\u4E92\u52A8\u7684\u6CE8\u518C\u9009\u62E9\u3002"
            };
          if (!spyCanRegister && event.spyRegistersTownsfolk !== void 0)
            return fail("\u95F4\u8C0D\u6CE8\u518C\u9009\u62E9\u53EA\u80FD\u7528\u4E8E\u771F\u5B9E\u95F4\u8C0D\u63D0\u540D\u8005\u3002");
          const triggers = spyCanRegister ? event.spyRegistersTownsfolk : ROLE_TEAM[nominatorRole] === "townsfolk";
          if (triggers) {
            if (event.votes.length)
              return fail("\u5904\u5973\u80FD\u529B\u7ACB\u5373\u5904\u51B3\u65F6\u4E0D\u4F1A\u518D\u4E3E\u884C\u6295\u7968\u3002");
            const count = aliveCount2();
            state.alive[event.nominator - 1] = false;
            deaths.push(event.nominator);
            immediateExecution = event.nominator;
            executionDeathSeat = event.nominator;
            executionCause = "virgin";
            demonDeath(event.nominator, count);
            if (state.roles[event.nominator - 1] === "Saint" && active(event.nominator))
              state.winner = "evil";
            if (!state.winner && aliveCount2() <= 2) state.winner = "evil";
            finishEvent();
            continue;
          }
        } else if (event.spyRegistersTownsfolk !== void 0)
          return fail("\u4E2D\u6BD2\u7684\u5904\u5973\u6CA1\u6709\u53EF\u7528\u7684\u95F4\u8C0D\u6CE8\u518C\u5224\u5B9A\u3002");
      } else if (event.spyRegistersTownsfolk !== void 0)
        return fail("\u6B64\u63D0\u540D\u6CA1\u6709\u53EF\u7528\u7684\u5904\u5973\u6CE8\u518C\u5224\u5B9A\u3002");
      const voteSet = new Set(event.votes);
      if (voteSet.size !== event.votes.length || event.votes.some((seat) => !validSeat(seat, n)))
        return fail("\u6295\u7968\u5305\u542B\u91CD\u590D\u6216\u65E0\u6548\u5EA7\u4F4D\u3002");
      for (const voter of event.votes) {
        if (!state.alive[voter - 1]) {
          if (state.spentDeadVotes.includes(voter))
            return fail("\u5DF2\u7528\u8FC7\u9057\u8A00\u7968\u7684\u6B7B\u8005\u4E0D\u80FD\u518D\u6295\u7968\u3002");
          state.spentDeadVotes.push(voter);
        }
      }
      if (butler && event.votes.includes(butler) && active(butler) && event.butlerMasterRaisedAtTally === false && event.butlerMasterAlreadyCounted !== true)
        butlerVoteWarnings.push(
          `${butler}\u53F7\u7537\u4EC6\u7684\u4E3B\u4EBA\u5728\u5176\u8BA1\u7968\u65F6\u672A\u4E3E\u624B\uFF1B\u6309\u5B98\u65B9\u89C4\u5219\u8BE5\u7968\u4ECD\u8BA1\u5165\u3002`
        );
      nominationTallies.push({
        eventIndex,
        nominee: event.nominee,
        votes: event.votes.length,
        aliveAtVote: aliveCount2(),
        threshold: Math.ceil(aliveCount2() / 2)
      });
      finishEvent();
    }
    let executedSeat = immediateExecution;
    if (!state.winner && executedSeat === null && nominationTallies.length) {
      const high = Math.max(...nominationTallies.map((item) => item.votes));
      const leaders = nominationTallies.filter((item) => item.votes === high);
      if (leaders.length === 1 && high >= leaders[0].threshold) {
        executedSeat = leaders[0].nominee;
        executionCause = "vote";
        if (state.alive[executedSeat - 1]) {
          const count = aliveCount2();
          state.alive[executedSeat - 1] = false;
          deaths.push(executedSeat);
          executionDeathSeat = executedSeat;
          const role = state.roles[executedSeat - 1];
          if (role === "Saint" && active(executedSeat)) state.winner = "evil";
          else demonDeath(executedSeat, count);
          if (!state.winner && aliveCount2() <= 2) state.winner = "evil";
        }
      }
    }
    if (!state.winner && executedSeat === null && aliveCount2() === 3) {
      const mayor = state.roles.findIndex(
        (role, i) => role === "Mayor" && state.alive[i] && active(i + 1)
      );
      if (mayor >= 0) state.winner = "good";
    }
    if (registeredDeaths.some((seat) => !usedRegistrations.has(seat)))
      return fail(
        "\u7EA2\u5507\u5973\u90CE\u7684\u9690\u58EB\u6CE8\u518C\u53EA\u80FD\u7528\u4E8E\u5065\u5EB7\u9690\u58EB\u5B9E\u9645\u6B7B\u4EA1\u4E14\u6EE1\u8DB3\u7EE7\u4EFB\u6761\u4EF6\u7684\u672C\u6B21\u5224\u5B9A\u3002"
      );
    return {
      status: "ok",
      trace: {
        state,
        deaths,
        executedSeat,
        executionDeathSeat,
        executionCause,
        endedAfterEventIndex,
        eventSteps,
        nominationTallies,
        roleChanges,
        butlerVoteWarnings,
        poisonAtDusk: null
      }
    };
  }

  // src/core/night.ts
  var isSeat = (n, size) => Number.isInteger(n) && n >= 1 && n <= size;
  var livingRoleSeat = (state, role) => state.roles.findIndex(
    (value, index) => value === role && state.alive[index]
  ) + 1;
  var aliveCount = (state) => state.alive.filter(Boolean).length;
  function ravenkeeperDeathAtStep(state, deaths, conditions, sourceImpSeat, impActionIndex) {
    const speaker = deaths.find(
      (seat) => state.roles[seat - 1] === "Ravenkeeper"
    );
    return speaker === void 0 ? null : {
      speaker,
      impActionIndex,
      sourceImpSeat,
      poisonedSeat: conditions.poisonedSeat,
      poisonSourceSeat: conditions.poisonedSeat === null ? null : conditions.poisonerSeat,
      roles: [...state.roles],
      gameOver: Boolean(state.winner)
    };
  }
  function resolveRavenkeeperInformation(death, actions) {
    if (death.gameOver || death.poisonedSeat === death.speaker)
      return { status: "ok", info: null };
    const target = actions.ravenkeeperTarget;
    if (target === void 0 || !isSeat(target, death.roles.length))
      return { status: "invalid", reason: "\u5065\u5EB7\u5B88\u9E26\u4EBA\u591C\u6B7B\u65F6\u5FC5\u987B\u9009\u62E9\u4E00\u4F4D\u73A9\u5BB6\u3002" };
    const seenRole = death.roles[target - 1];
    const registration = actions.ravenkeeperRegistrationRole;
    if (registration !== void 0) {
      const allowed = death.poisonedSeat !== target && (seenRole === "Spy" ? ROLE_TEAM[registration] === "townsfolk" || ROLE_TEAM[registration] === "outsider" : seenRole === "Recluse" ? ROLE_TEAM[registration] === "minion" || ROLE_TEAM[registration] === "demon" : false);
      if (!allowed)
        return {
          status: "invalid",
          reason: "\u5B88\u9E26\u4EBA\u76EE\u6807\u5728\u672C\u6B21\u6B7B\u4EA1\u65F6\u70B9\u4E0D\u5141\u8BB8\u6B64\u89D2\u8272\u6CE8\u518C\u3002"
        };
    }
    return {
      status: "ok",
      info: {
        speaker: death.speaker,
        target,
        seenRole: registration ?? seenRole
      }
    };
  }
  function resolveImpAction(before, action, conditions) {
    const state = {
      ...before,
      roles: [...before.roles],
      alive: [...before.alive],
      alignments: copyAlignments(before)
    };
    const current = { ...conditions };
    const invalid = (reason) => ({ status: "invalid", reason });
    const actor = action.actor;
    if (!isSeat(actor, state.roles.length) || state.roles[actor - 1] !== "Imp")
      return invalid("\u884C\u52A8\u8005\u5FC5\u987B\u662F\u672C\u591C\u6392\u961F\u7684\u5C0F\u6076\u9B54\u3002");
    const skipReason = state.winner ? "game_over" : !state.alive[actor - 1] ? "dead" : void 0;
    if (skipReason) {
      if (action.skipReason !== skipReason || Object.keys(action).some((key) => key !== "actor" && key !== "skipReason"))
        return invalid("\u8DF3\u8FC7\u7684\u5C0F\u6076\u9B54\u5FC5\u987B\u6CE8\u660E\u6B63\u786E\u539F\u56E0\uFF0C\u4E0D\u80FD\u8BB0\u5F55\u76EE\u6807\u6216\u7EE7\u4EFB\u9009\u62E9\u3002");
      return {
        status: "ok",
        state,
        conditions: current,
        deaths: [],
        roleChanges: [],
        step: { actor, target: null, deathSeat: null, skipReason }
      };
    }
    if (action.skipReason !== void 0)
      return invalid("\u5B58\u6D3B\u5C0F\u6076\u9B54\u5728\u5BF9\u5C40\u7EE7\u7EED\u65F6\u5FC5\u987B\u884C\u52A8\uFF0C\u4E0D\u80FD\u8DF3\u8FC7\u3002");
    const target = action.target;
    if (target === void 0 || !isSeat(target, state.roles.length))
      return invalid("\u6BCF\u4E2A\u884C\u52A8\u7684\u5C0F\u6076\u9B54\u5FC5\u987B\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u76EE\u6807\u3002");
    for (const choice of [
      action.impSuccessorSeat,
      action.scarletRecluseRegistration
    ])
      if (choice !== void 0 && !isSeat(choice, state.roles.length))
        return invalid("\u5C0F\u6076\u9B54\u7EE7\u4EFB\u6216\u9690\u58EB\u6B7B\u4EA1\u6CE8\u518C\u5EA7\u4F4D\u65E0\u6548\u3002");
    const active = (seat) => seat !== current.poisonedSeat;
    const guarded = (seat) => seat === current.protectedSeat || state.roles[seat - 1] === "Soldier" && active(seat);
    let victim = target;
    if (action.mayorRedirectTarget !== void 0) {
      if (!state.alive[target - 1] || state.roles[target - 1] !== "Mayor" || !active(target) || guarded(target) || !active(actor))
        return invalid("\u9547\u957F\u4EC5\u5728\u4F1A\u88AB\u672C\u6B21\u6076\u9B54\u653B\u51FB\u6740\u6B7B\u65F6\u624D\u80FD\u8F6C\u79FB\u6B7B\u4EA1\u3002");
      if (!isSeat(action.mayorRedirectTarget, state.roles.length) || action.mayorRedirectTarget === target)
        return invalid("\u9547\u957F\u8F6C\u79FB\u5FC5\u987B\u6307\u5411\u53E6\u4E00\u4F4D\u6709\u6548\u73A9\u5BB6\u3002");
      victim = action.mayorRedirectTarget;
    }
    const deaths = [];
    const roleChanges = [];
    let usedScarletRegistration = false;
    let usedSuccessor = false;
    if (active(actor) && state.alive[victim - 1] && !guarded(victim)) {
      const count = aliveCount(state);
      state.alive[victim - 1] = false;
      deaths.push(victim);
      const scarlet = livingRoleSeat(state, "Scarlet Woman");
      if (state.roles[victim - 1] === "Recluse" && active(victim) && scarlet && active(scarlet) && count >= 5 && action.scarletRecluseRegistration === victim) {
        state.roles[scarlet - 1] = "Imp";
        usedScarletRegistration = true;
        roleChanges.push({
          seat: scarlet,
          from: "Scarlet Woman",
          to: "Imp",
          reason: "scarlet_woman",
          registeredRecluseSeat: victim,
          sourceImpSeat: actor
        });
      }
      if (state.roles[victim - 1] === "Imp") {
        let successor = scarlet && active(scarlet) && count >= 5 ? scarlet : 0;
        if (successor && action.impSuccessorSeat !== void 0 && action.impSuccessorSeat !== successor)
          return invalid("\u7EA2\u5507\u5973\u90CE\u6EE1\u8DB3\u63A5\u4EFB\u6761\u4EF6\u65F6\u5FC5\u987B\u4F18\u5148\u6210\u4E3AImp\u3002");
        if (!successor && target === actor && victim === actor) {
          const candidates = state.roles.flatMap(
            (role, index) => state.alive[index] && (ROLE_TEAM[role] === "minion" || role === "Recluse" && active(index + 1)) ? [index + 1] : []
          );
          if (candidates.length) {
            if (action.impSuccessorSeat === void 0 || !candidates.includes(action.impSuccessorSeat))
              return invalid("Imp\u81EA\u6740\u540E\u5FC5\u987B\u6307\u5B9A\u4E00\u4E2A\u5B58\u6D3B\u722A\u7259\u63A5\u4EFB\u3002");
            successor = action.impSuccessorSeat;
          } else if (action.impSuccessorSeat !== void 0)
            return invalid("\u6CA1\u6709\u53EF\u63A5\u4EFB\u7684\u5B58\u6D3B\u722A\u7259\u6216\u5065\u5EB7\u9690\u58EB\u3002");
        }
        if (successor) {
          usedSuccessor = true;
          const from = state.roles[successor - 1];
          state.roles[successor - 1] = "Imp";
          roleChanges.push({
            seat: successor,
            from,
            to: "Imp",
            sourceImpSeat: actor,
            reason: successor === scarlet && count >= 5 && active(scarlet) ? "scarlet_woman" : "imp_self_kill"
          });
        }
      }
    }
    if (action.impSuccessorSeat !== void 0 && !usedSuccessor)
      return invalid("\u672C\u6B21\u653B\u51FB\u6CA1\u6709\u5408\u6CD5\u7684\u7EE7\u4EFB\uFF0C\u4E0D\u80FD\u6307\u5B9A\u63A5\u4EFB\u8005\u3002");
    if (action.scarletRecluseRegistration !== void 0 && !usedScarletRegistration)
      return invalid(
        "\u7EA2\u5507\u5973\u90CE\u7684\u9690\u58EB\u6CE8\u518C\u53EA\u80FD\u7528\u4E8E\u5065\u5EB7\u9690\u58EB\u5B9E\u9645\u6B7B\u4EA1\u4E14\u6EE1\u8DB3\u7EE7\u4EFB\u6761\u4EF6\u7684\u672C\u6B21\u5224\u5B9A\u3002"
      );
    if (!livingRoleSeat(state, "Imp")) state.winner = "good";
    else if (aliveCount(state) <= 2) state.winner = "evil";
    if (current.poisonerSeat && (!state.alive[current.poisonerSeat - 1] || state.roles[current.poisonerSeat - 1] !== "Poisoner"))
      current.poisonedSeat = null;
    if (current.monkSeat && (!state.alive[current.monkSeat - 1] || state.roles[current.monkSeat - 1] !== "Monk" || !active(current.monkSeat)))
      current.protectedSeat = null;
    return {
      status: "ok",
      state,
      conditions: current,
      deaths,
      roleChanges,
      step: { actor, target, deathSeat: deaths[0] ?? null }
    };
  }
  function resolveNight(before, actions) {
    const n = before.roles.length;
    if (n < 7 || n > 15 || before.alive.length !== n || !validAlignments(before) || before.winner || before.alive.filter(Boolean).length < 3 || before.roles.filter((role, index) => role === "Imp" && before.alive[index]).length < 1) {
      return { status: "invalid", reason: "\u4EBA\u6570\u3001\u5B58\u6D3B\u8868\u6216\u7EC8\u5C40\u72B6\u6001\u65E0\u6548\u3002" };
    }
    if (!Number.isInteger(actions.cycle) || actions.cycle < 1) {
      return { status: "invalid", reason: "\u591C\u665A\u7F16\u53F7\u65E0\u6548\u3002" };
    }
    if (actions.scarletRecluseRegistration !== void 0 && !isSeat(actions.scarletRecluseRegistration, n))
      return { status: "invalid", reason: "\u7EA2\u5507\u5973\u90CE\u7684\u9690\u58EB\u6B7B\u4EA1\u6CE8\u518C\u5EA7\u4F4D\u65E0\u6548\u3002" };
    let state = {
      roles: [...before.roles],
      alive: [...before.alive],
      alignments: copyAlignments(before),
      spentVirginSeats: [...before.spentVirginSeats ?? []],
      spentSlayerSeats: [...before.spentSlayerSeats ?? []],
      spentDeadVotes: [...before.spentDeadVotes ?? []]
    };
    const validTarget = (target) => target !== void 0 && isSeat(target, n);
    const poisoner = livingRoleSeat(state, "Poisoner");
    const monk = livingRoleSeat(state, "Monk");
    const imp = livingRoleSeat(state, "Imp");
    if (!imp) return { status: "invalid", reason: "\u591C\u665A\u5F00\u59CB\u65F6\u6CA1\u6709\u5B58\u6D3B\u7684Imp\u3002" };
    if (poisoner && !validTarget(actions.poisonerTarget))
      return {
        status: "invalid",
        reason: "\u5B58\u6D3B\u7684\u6295\u6BD2\u8005\u6BCF\u591C\u5FC5\u987B\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u76EE\u6807\u3002"
      };
    if (!poisoner && actions.poisonerTarget !== void 0)
      return { status: "invalid", reason: "\u6CA1\u6709\u5B58\u6D3B\u7684\u6295\u6BD2\u8005\u5374\u8BB0\u5F55\u4E86\u6295\u6BD2\u884C\u52A8\u3002" };
    let poisoned = actions.poisonerTarget ?? null;
    const active = (seat) => seat !== poisoned;
    const butlerChoice = () => {
      const butler = livingRoleSeat(state, "Butler");
      if (!butler) {
        if (actions.butlerMasterSeat !== void 0)
          return { status: "invalid", reason: "\u6CA1\u6709\u5B58\u6D3B\u7537\u4EC6\u5374\u8BB0\u5F55\u4E86\u4E3B\u4EBA\u9009\u62E9\u3002" };
        return 0;
      }
      if (!validTarget(actions.butlerMasterSeat) || actions.butlerMasterSeat === butler)
        return {
          status: "invalid",
          reason: "\u5B58\u6D3B\u7537\u4EC6\u6BCF\u591C\u5FC5\u987B\u9009\u62E9\u53E6\u4E00\u4F4D\u73A9\u5BB6\u4E3A\u4E3B\u4EBA\u3002"
        };
      return actions.butlerMasterSeat;
    };
    if (actions.cycle === 1) {
      if (actions.scarletRecluseRegistration !== void 0)
        return {
          status: "invalid",
          reason: "\u9996\u591C\u6CA1\u6709\u9690\u58EB\u6B7B\u4EA1\u540E\u7684\u7EA2\u5507\u5973\u90CE\u5224\u5B9A\u3002"
        };
      if (actions.previousDayExecutionDeathSeat !== void 0 || actions.undertakerRegistrationRole !== void 0)
        return { status: "invalid", reason: "\u9996\u591C\u6CA1\u6709\u524D\u4E00\u65E5\u5904\u51B3\u4FE1\u606F\u3002" };
      const butlerMaster2 = butlerChoice();
      if (typeof butlerMaster2 !== "number") return butlerMaster2;
      if (actions.monkTarget !== void 0 || actions.impTarget !== void 0 || actions.impActions !== void 0 || actions.impSuccessorSeat !== void 0 || actions.mayorRedirectTarget !== void 0 || actions.ravenkeeperTarget !== void 0 || actions.ravenkeeperRegistrationRole !== void 0)
        return { status: "invalid", reason: "\u9996\u591C\u50E7\u4FA3\u548CImp\u5747\u4E0D\u884C\u52A8\u3002" };
      return {
        status: "ok",
        trace: {
          state,
          deaths: [],
          poisonedAtInformationStep: poisoned,
          protectedSeat: null,
          poisonSourceSeat: poisoner || null,
          butlerMasterSeat: butlerMaster2 || null,
          ravenkeeperInfo: null,
          ravenkeeperDeath: null,
          undertakerInfo: null,
          roleChanges: [],
          impSteps: []
        }
      };
    }
    if (monk && !validTarget(actions.monkTarget))
      return { status: "invalid", reason: "\u5B58\u6D3B\u7684\u50E7\u4FA3\u5FC5\u987B\u9009\u62E9\u4E00\u4E2A\u6709\u6548\u76EE\u6807\u3002" };
    if (!monk && actions.monkTarget !== void 0)
      return { status: "invalid", reason: "\u6CA1\u6709\u5B58\u6D3B\u7684\u50E7\u4FA3\u5374\u8BB0\u5F55\u4E86\u4FDD\u62A4\u884C\u52A8\u3002" };
    if (monk === actions.monkTarget)
      return { status: "invalid", reason: "\u50E7\u4FA3\u4E0D\u80FD\u4FDD\u62A4\u81EA\u5DF1\u3002" };
    const startingImps = state.roles.flatMap(
      (role, index) => role === "Imp" && state.alive[index] ? [index + 1] : []
    );
    const legacyChoices = [
      actions.impTarget,
      actions.mayorRedirectTarget,
      actions.impSuccessorSeat,
      actions.scarletRecluseRegistration
    ];
    let queue;
    if (actions.impActions !== void 0) {
      if (legacyChoices.some((value) => value !== void 0) || !Array.isArray(actions.impActions) || actions.impActions.length !== startingImps.length || Array.from(actions.impActions).some(
        (action) => !action || !startingImps.includes(action.actor)
      ) || new Set(actions.impActions.map((action) => action.actor)).size !== startingImps.length)
        return {
          status: "invalid",
          reason: "\u5C0F\u6076\u9B54\u884C\u52A8\u987A\u5E8F\u5FC5\u987B\u5B8C\u6574\u4E14\u552F\u4E00\uFF0C\u4E0D\u80FD\u6DF7\u7528\u5355\u6076\u9B54\u884C\u52A8\u5B57\u6BB5\u3002"
        };
      queue = actions.impActions;
    } else {
      if (startingImps.length !== 1)
        return {
          status: "invalid",
          reason: "\u591A\u4E2A\u5C0F\u6076\u9B54\u5FC5\u987B\u5206\u522B\u63D0\u4F9B\u5B8C\u6574\u884C\u52A8\u987A\u5E8F\u548C\u76EE\u6807\u3002"
        };
      queue = [
        {
          actor: imp,
          target: actions.impTarget,
          mayorRedirectTarget: actions.mayorRedirectTarget,
          impSuccessorSeat: actions.impSuccessorSeat,
          scarletRecluseRegistration: actions.scarletRecluseRegistration
        }
      ];
    }
    let conditions = {
      poisonedSeat: poisoned,
      protectedSeat: monk && active(monk) ? actions.monkTarget : null,
      poisonerSeat: poisoner || null,
      monkSeat: monk || null
    };
    const deaths = [];
    const roleChanges = [];
    const impSteps = [];
    let ravenkeeperInfo = null;
    let ravenkeeperDeath = null;
    for (const [actionIndex, action] of queue.entries()) {
      const result = resolveImpAction(state, action, conditions);
      if (result.status !== "ok") return result;
      state = result.state;
      conditions = result.conditions;
      deaths.push(...result.deaths);
      roleChanges.push(...result.roleChanges);
      impSteps.push(result.step);
      const death = ravenkeeperDeathAtStep(
        state,
        result.deaths,
        conditions,
        action.actor,
        actionIndex
      );
      if (death) {
        ravenkeeperDeath = death;
        const information = resolveRavenkeeperInformation(death, actions);
        if (information.status !== "ok") return information;
        ravenkeeperInfo = information.info;
      }
    }
    poisoned = conditions.poisonedSeat;
    if (!ravenkeeperInfo && (actions.ravenkeeperTarget !== void 0 || actions.ravenkeeperRegistrationRole !== void 0))
      return {
        status: "invalid",
        reason: "\u5B88\u9E26\u4EBA\u6B7B\u4EA1\u65F6\u80FD\u529B\u672A\u6709\u6548\u89E6\u53D1\uFF0C\u540E\u7EED\u6062\u590D\u4E0D\u80FD\u8865\u53D1\u6709\u6548\u4FE1\u606F\u3002"
      };
    const undertaker = livingRoleSeat(state, "Undertaker");
    let undertakerInfo = null;
    if (undertaker && active(undertaker) && !state.winner) {
      if (actions.previousDayExecutionDeathSeat === void 0)
        return {
          status: "unsupported",
          reason: "\u5065\u5EB7\u9001\u846C\u8005\u9700\u8981\u5B8C\u6574\u7684\u524D\u4E00\u65E5\u5904\u51B3\u6B7B\u4EA1\u8BB0\u5F55\u3002"
        };
      const executed = actions.previousDayExecutionDeathSeat;
      if (executed !== null) {
        if (!isSeat(executed, n) || state.alive[executed - 1])
          return {
            status: "invalid",
            reason: "\u9001\u846C\u8005\u7684\u5904\u51B3\u6B7B\u4EA1\u76EE\u6807\u65E0\u6548\u6216\u4ECD\u5B58\u6D3B\u3002"
          };
        const actual = state.roles[executed - 1];
        const registered = actions.undertakerRegistrationRole;
        if (registered !== void 0) {
          const allowed = active(executed) && (actual === "Spy" ? ROLE_TEAM[registered] === "townsfolk" || ROLE_TEAM[registered] === "outsider" : actual === "Recluse" ? ROLE_TEAM[registered] === "minion" || ROLE_TEAM[registered] === "demon" : false);
          if (!allowed)
            return {
              status: "invalid",
              reason: "\u9001\u846C\u8005\u76EE\u6807\u4E0D\u5141\u8BB8\u6B64\u89D2\u8272\u6CE8\u518C\u9009\u62E9\u3002"
            };
        }
        undertakerInfo = {
          speaker: undertaker,
          executedSeat: executed,
          seenRole: registered ?? actual
        };
      } else if (actions.undertakerRegistrationRole !== void 0)
        return {
          status: "invalid",
          reason: "\u65E0\u4EBA\u56E0\u5904\u51B3\u6B7B\u4EA1\u65F6\u6CA1\u6709\u89D2\u8272\u6CE8\u518C\u5224\u5B9A\u3002"
        };
    } else if (actions.undertakerRegistrationRole !== void 0)
      return { status: "invalid", reason: "\u9001\u846C\u8005\u80FD\u529B\u65E0\u6548\u65F6\u6CA1\u6709\u89D2\u8272\u6CE8\u518C\u5224\u5B9A\u3002" };
    const butlerMaster = state.winner ? 0 : butlerChoice();
    if (typeof butlerMaster !== "number") return butlerMaster;
    const poisonedAtInformationStep = poisoned;
    return {
      status: "ok",
      trace: {
        state,
        deaths,
        poisonedAtInformationStep,
        protectedSeat: conditions.protectedSeat,
        poisonSourceSeat: poisonedAtInformationStep === null ? null : poisoner,
        butlerMasterSeat: butlerMaster || null,
        ravenkeeperInfo,
        ravenkeeperDeath,
        undertakerInfo,
        roleChanges,
        impSteps
      }
    };
  }

  // src/core/timeline.ts
  function scarletRegistrationChoices(trace, phaseIndex2) {
    return trace.roleChanges.flatMap(
      (change) => change.registeredRecluseSeat === void 0 ? [] : [
        {
          interaction: `scarlet_woman_${phaseIndex2 % 2 === 0 ? "n" : "d"}${Math.floor(phaseIndex2 / 2) + 1}_${change.seat}`,
          seat: change.registeredRecluseSeat,
          role: "Imp"
        }
      ]
    );
  }
  function impSuccessorRegistrationChoices(trace, phaseIndex2) {
    if (!("impSteps" in trace)) return [];
    return trace.roleChanges.flatMap(
      (change) => change.from !== "Recluse" ? [] : [
        {
          interaction: `imp_successor_n${Math.floor(phaseIndex2 / 2) + 1}${"impSteps" in trace && trace.impSteps.length > 1 ? `_${change.sourceImpSeat}` : ""}`,
          seat: change.seat,
          role: "Poisoner"
        }
      ]
    );
  }
  function replayTimeline(input) {
    const validation = validateInitialSetup(input.initialPlayers);
    if (!validation.valid)
      return {
        status: "invalid",
        phaseIndex: 0,
        reason: validation.errors.join("\uFF1B")
      };
    const initial = [...input.initialPlayers].sort((a, b) => a.seat - b.seat);
    let state = {
      roles: initial.map((player) => player.actualRole),
      alignments: initialAlignments(initial.map((player) => player.actualRole)),
      alive: initial.map(() => true),
      spentVirginSeats: [],
      spentSlayerSeats: [],
      spentDeadVotes: []
    };
    const traces = [];
    let lastNight = null;
    let lastDay = null;
    for (const [index, phase] of input.phases.entries()) {
      const expected = index % 2 === 0 ? "night" : "day";
      if (state.winner)
        return {
          status: "invalid",
          phaseIndex: index,
          reason: "\u7EC8\u5C40\u540E\u4E0D\u80FD\u7EE7\u7EED\u8BB0\u5F55\u9636\u6BB5\u3002"
        };
      if (phase.kind !== expected)
        return {
          status: "invalid",
          phaseIndex: index,
          reason: `\u7B2C${index + 1}\u9636\u6BB5\u5E94\u4E3A${expected}\u3002`
        };
      if (phase.kind === "night") {
        const cycle = Math.floor(index / 2) + 1;
        if (phase.actions.cycle !== cycle)
          return {
            status: "invalid",
            phaseIndex: index,
            reason: "\u591C\u665A\u7F16\u53F7\u4E0E\u65F6\u95F4\u7EBF\u987A\u5E8F\u4E0D\u7B26\u3002"
          };
        const previousDayExecutionDeathSeat = lastDay?.executionDeathSeat ?? null;
        const result = resolveNight(state, {
          ...phase.actions,
          ...cycle > 1 ? { previousDayExecutionDeathSeat } : {}
        });
        if (result.status !== "ok")
          return {
            status: result.status,
            phaseIndex: index,
            reason: result.reason
          };
        lastNight = result.trace;
        state = result.trace.state;
        traces.push(result.trace);
      } else {
        if (!lastNight)
          return {
            status: "invalid",
            phaseIndex: index,
            reason: "\u7F3A\u5C11\u524D\u4E00\u591C\u72B6\u6001\u3002"
          };
        const result = resolveDay(state, {
          events: phase.events,
          scarletRecluseRegistrations: phase.scarletRecluseRegistrations,
          poisonedSeat: lastNight.poisonedAtInformationStep,
          poisonSourceSeat: lastNight.poisonSourceSeat,
          butlerMasterSeat: lastNight.butlerMasterSeat
        });
        if (result.status !== "ok")
          return {
            status: result.status,
            phaseIndex: index,
            reason: result.reason
          };
        lastDay = result.trace;
        state = result.trace.state;
        traces.push(result.trace);
      }
    }
    return { status: "ok", state, traces };
  }

  // src/core/observedTimeline.ts
  var seats = (count) => Array.from({ length: count }, (_, i) => i + 1);
  var livingRoleSeat2 = (state, role) => state.roles.findIndex((item, index) => item === role && state.alive[index]) + 1;
  var sameSet = (left, right) => {
    const sortedRight = [...right].sort((a, b) => a - b);
    return left.length === sortedRight.length && [...left].sort((a, b) => a - b).every((seat, index) => seat === sortedRight[index]);
  };
  function* dayVariants(events, state, poisonedSeat, deaths) {
    function* expand(index, prefix, spentVirgin) {
      if (index === events.length) {
        yield prefix;
        return;
      }
      const event = events[index];
      if (event.kind === "slayer") {
        const needsChoice = state.roles[event.actor - 1] === "Slayer" && state.alive[event.actor - 1] && state.alive[event.target - 1] && state.roles[event.target - 1] === "Recluse" && poisonedSeat !== event.target && poisonedSeat !== event.actor && !(state.spentSlayerSeats ?? []).includes(event.actor);
        for (const choice of needsChoice ? [false, true] : [void 0]) {
          yield* expand(
            index + 1,
            [
              ...prefix,
              {
                ...event,
                ...choice === void 0 ? {} : { recluseRegistersDemon: choice }
              }
            ],
            spentVirgin
          );
        }
      } else {
        const virgin = state.roles[event.nominee - 1] === "Virgin" && state.alive[event.nominee - 1] && !spentVirgin.has(event.nominee);
        const nextSpent = new Set(spentVirgin);
        if (virgin) nextSpent.add(event.nominee);
        const needsChoice = virgin && poisonedSeat !== event.nominee && poisonedSeat !== event.nominator && state.roles[event.nominator - 1] === "Spy";
        for (const choice of needsChoice ? [false, true] : [void 0]) {
          yield* expand(
            index + 1,
            [
              ...prefix,
              {
                ...event,
                ...choice === void 0 ? {} : { spyRegistersTownsfolk: choice }
              }
            ],
            nextSpent
          );
        }
      }
    }
    const recluse = state.roles.findIndex(
      (role, index) => role === "Recluse" && state.alive[index] && deaths.includes(index + 1)
    ) + 1;
    for (const candidate of expand(
      0,
      [],
      new Set(state.spentVirginSeats ?? [])
    )) {
      yield { events: candidate };
      if (recluse && livingRoleSeat2(state, "Scarlet Woman"))
        yield { events: candidate, scarletRecluseRegistrations: [recluse] };
    }
  }
  function* nightVariants(state, cycle, deaths, firstNightPoison, reports, canContinue) {
    const all = seats(state.roles.length);
    const poisoner = livingRoleSeat2(state, "Poisoner");
    const monk = livingRoleSeat2(state, "Monk");
    const butler = livingRoleSeat2(state, "Butler");
    const imp = livingRoleSeat2(state, "Imp");
    const ravenReport = reports.find(
      (report) => report.kind === "ravenkeeper" && report.cycle === cycle && report.abilityActive && report.acceptedMessage
    );
    const undertakerReport = reports.find(
      (report) => report.kind === "undertaker" && report.cycle === cycle && report.abilityActive && report.acceptedMessage
    );
    const poisons = poisoner ? cycle === 1 && firstNightPoison ? [firstNightPoison.target] : all : [void 0];
    const monks = cycle > 1 && monk ? all.filter((seat) => seat !== monk) : [void 0];
    const startingImps = all.filter(
      (seat) => state.roles[seat - 1] === "Imp" && state.alive[seat - 1]
    );
    if (cycle > 1 && deaths.length > startingImps.length) return;
    if (cycle > 1 && startingImps.length > 1) {
      function* expand(current, conditions, remaining, prefix, died, ravenDeath) {
        if (!canContinue()) return;
        if (!remaining.length) {
          if (sameSet(died, deaths))
            yield {
              state: current,
              actions: prefix,
              poisoned: conditions.poisonedSeat,
              ravenDeath
            };
          return;
        }
        for (const actor of remaining) {
          const rest = remaining.filter((seat) => seat !== actor);
          const skipReason = current.winner ? "game_over" : !current.alive[actor - 1] ? "dead" : void 0;
          if (skipReason) {
            const action = { actor, skipReason };
            yield* expand(
              current,
              conditions,
              rest,
              [...prefix, action],
              died,
              ravenDeath
            );
            continue;
          }
          for (const target of all) {
            const redirects = current.roles[target - 1] === "Mayor" && current.alive[target - 1] ? [void 0, ...all.filter((seat) => seat !== target)] : [void 0];
            const successors = target === actor ? [
              void 0,
              ...all.filter(
                (seat) => current.alive[seat - 1] && (ROLE_TEAM[current.roles[seat - 1]] === "minion" || current.roles[seat - 1] === "Recluse" && conditions.poisonedSeat !== seat)
              )
            ] : [void 0];
            for (const mayorRedirectTarget of redirects)
              for (const impSuccessorSeat of successors)
                for (const scarletRecluseRegistration of livingRoleSeat2(
                  current,
                  "Scarlet Woman"
                ) ? [
                  void 0,
                  ...deaths.filter(
                    (seat) => current.roles[seat - 1] === "Recluse"
                  )
                ] : [void 0]) {
                  if (!canContinue()) return;
                  const action = {
                    actor,
                    target,
                    ...mayorRedirectTarget === void 0 ? {} : { mayorRedirectTarget },
                    ...impSuccessorSeat === void 0 ? {} : { impSuccessorSeat },
                    ...scarletRecluseRegistration === void 0 ? {} : { scarletRecluseRegistration }
                  };
                  const resolved = resolveImpAction(current, action, conditions);
                  if (resolved.status !== "ok" || resolved.deaths.some((seat) => !deaths.includes(seat)))
                    continue;
                  yield* expand(
                    resolved.state,
                    resolved.conditions,
                    rest,
                    [...prefix, action],
                    [...died, ...resolved.deaths],
                    ravenkeeperDeathAtStep(
                      resolved.state,
                      resolved.deaths,
                      resolved.conditions,
                      actor,
                      prefix.length
                    ) ?? ravenDeath
                  );
                }
          }
        }
      }
      for (const poisonerTarget of poisons)
        for (const monkTarget of monks)
          for (const candidate of expand(
            state,
            {
              poisonedSeat: poisonerTarget ?? null,
              protectedSeat: monk && monk !== poisonerTarget ? monkTarget : null,
              poisonerSeat: poisoner || null,
              monkSeat: monk || null
            },
            startingImps,
            [],
            [],
            null
          )) {
            const needsRaven = candidate.ravenDeath && candidate.ravenDeath.poisonedSeat !== candidate.ravenDeath.speaker && !candidate.ravenDeath.gameOver;
            const ravenkeeperTarget = needsRaven ? ravenReport?.kind === "ravenkeeper" ? ravenReport.target : all[0] : void 0;
            const liveButler = livingRoleSeat2(candidate.state, "Butler");
            const butlerMasterSeat = liveButler && !candidate.state.winner ? all.find((seat) => seat !== liveButler) : void 0;
            for (const ravenkeeperRegistrationRole of ravenReport?.kind === "ravenkeeper" && needsRaven ? [void 0, ravenReport.seenRole] : [void 0])
              for (const undertakerRegistrationRole of undertakerReport?.kind === "undertaker" && livingRoleSeat2(candidate.state, "Undertaker") && candidate.poisoned !== undertakerReport.speaker && !candidate.state.winner ? [void 0, undertakerReport.seenRole] : [void 0])
                yield {
                  cycle,
                  impActions: candidate.actions,
                  ...poisonerTarget === void 0 ? {} : { poisonerTarget },
                  ...monkTarget === void 0 ? {} : { monkTarget },
                  ...butlerMasterSeat === void 0 ? {} : { butlerMasterSeat },
                  ...ravenkeeperTarget === void 0 ? {} : { ravenkeeperTarget },
                  ...ravenkeeperRegistrationRole === void 0 ? {} : { ravenkeeperRegistrationRole },
                  ...undertakerRegistrationRole === void 0 ? {} : { undertakerRegistrationRole }
                };
          }
      return;
    }
    const imps = cycle > 1 ? deaths.length === 1 ? [
      .../* @__PURE__ */ new Set([
        deaths[0],
        ...all.filter(
          (seat) => state.alive[seat - 1] && state.roles[seat - 1] === "Mayor"
        )
      ])
    ] : all : [void 0];
    const masters = butler ? [void 0, all.find((seat) => seat !== butler)] : [void 0];
    for (const poisonerTarget of poisons)
      for (const monkTarget of monks)
        for (const impTarget of imps)
          for (const butlerMasterSeat of masters) {
            const redirects = cycle > 1 && impTarget && state.alive[impTarget - 1] && state.roles[impTarget - 1] === "Mayor" ? [
              void 0,
              ...all.filter(
                (seat) => seat !== impTarget && (deaths.length !== 1 || seat === deaths[0])
              )
            ] : [void 0];
            const successors = cycle > 1 && impTarget === imp ? [
              void 0,
              ...all.filter(
                (seat) => state.alive[seat - 1] && (["Poisoner", "Spy", "Scarlet Woman", "Baron"].includes(
                  state.roles[seat - 1]
                ) || state.roles[seat - 1] === "Recluse" && poisonerTarget !== seat)
              )
            ] : [void 0];
            for (const mayorRedirectTarget of redirects)
              for (const impSuccessorSeat of successors) {
                const ravenSeat = mayorRedirectTarget ?? impTarget;
                const ravenTargets = cycle > 1 && ravenSeat && state.roles[ravenSeat - 1] === "Ravenkeeper" ? ravenReport?.kind === "ravenkeeper" ? [void 0, ravenReport.target] : [void 0, all[0]] : [void 0];
                for (const ravenkeeperTarget of ravenTargets)
                  for (const ravenkeeperRegistrationRole of ravenReport?.kind === "ravenkeeper" && ravenkeeperTarget ? [void 0, ravenReport.seenRole] : [void 0])
                    for (const undertakerRegistrationRole of undertakerReport?.kind === "undertaker" ? [void 0, undertakerReport.seenRole] : [void 0])
                      for (const scarletRecluseRegistration of cycle > 1 && livingRoleSeat2(state, "Scarlet Woman") ? [
                        void 0,
                        ...deaths.filter(
                          (seat) => state.roles[seat - 1] === "Recluse"
                        )
                      ] : [void 0])
                        yield {
                          cycle,
                          ...scarletRecluseRegistration ? { scarletRecluseRegistration } : {},
                          ...poisonerTarget ? { poisonerTarget } : {},
                          ...monkTarget ? { monkTarget } : {},
                          ...impTarget ? { impTarget } : {},
                          ...butlerMasterSeat ? { butlerMasterSeat } : {},
                          ...mayorRedirectTarget ? { mayorRedirectTarget } : {},
                          ...impSuccessorSeat ? { impSuccessorSeat } : {},
                          ...ravenkeeperTarget ? { ravenkeeperTarget } : {},
                          ...ravenkeeperRegistrationRole ? { ravenkeeperRegistrationRole } : {},
                          ...undertakerRegistrationRole ? { undertakerRegistrationRole } : {}
                        };
              }
          }
  }
  function nightReportChoices(report, trace, redHerringSeat, reportIndex) {
    if (!report.abilityActive) return [];
    if (report.kind === "ravenkeeper") {
      const death = trace.ravenkeeperDeath?.speaker === report.speaker ? trace.ravenkeeperDeath : null;
      const roles = death?.roles ?? trace.state.roles;
      const poison = death ? death.poisonedSeat : trace.poisonedAtInformationStep;
      if (roles[report.speaker - 1] !== "Ravenkeeper" || poison === report.speaker)
        return null;
      if (!report.acceptedMessage) return [];
      const information = trace.ravenkeeperInfo;
      return information?.speaker === report.speaker && information.target === report.target && information.seenRole === report.seenRole ? [] : null;
    }
    const role = report.kind === "undertaker" ? "Undertaker" : report.kind === "fortune_teller" ? "Fortune Teller" : "Empath";
    const state = trace.state;
    if (state.winner && report.acceptedMessage) return null;
    if (state.roles[report.speaker - 1] !== role || trace.poisonedAtInformationStep === report.speaker)
      return null;
    if (!state.alive[report.speaker - 1]) return null;
    if (!report.acceptedMessage) return [];
    if (report.kind === "undertaker")
      return trace.undertakerInfo?.speaker === report.speaker && trace.undertakerInfo.seenRole === report.seenRole ? [] : null;
    if (report.kind === "fortune_teller") {
      if (!redHerringSeat) return null;
      const alreadyYes = report.targets.some(
        (seat) => state.roles[seat - 1] === "Imp" || seat === redHerringSeat
      );
      if (!report.yes) return alreadyYes ? null : [];
      if (alreadyYes) return [];
      const recluse = report.targets.find(
        (seat) => state.roles[seat - 1] === "Recluse" && trace.poisonedAtInformationStep !== seat
      );
      return recluse ? [
        {
          interaction: `ft_n${report.cycle}_${reportIndex}`,
          seat: recluse,
          role: "Imp"
        }
      ] : null;
    }
    const n = state.roles.length;
    const neighbors = [];
    for (const direction of [-1, 1]) {
      for (let step = 1; step < n; step++) {
        const seat = (report.speaker - 1 + direction * step + n * n) % n + 1;
        if (state.alive[seat - 1]) {
          neighbors.push(seat);
          break;
        }
      }
    }
    if (neighbors.length !== 2) return null;
    const possibilities = neighbors.map((seat) => {
      const actual = state.roles[seat - 1];
      if (trace.poisonedAtInformationStep !== seat && (actual === "Spy" || actual === "Recluse"))
        return [
          .../* @__PURE__ */ new Set([
            Number(isActuallyEvil(state, seat)),
            actual === "Spy" ? 0 : 1
          ])
        ].sort();
      return [Number(isActuallyEvil(state, seat))];
    });
    for (const left of possibilities[0])
      for (const right of possibilities[1]) {
        if (left + right !== report.count) continue;
        return neighbors.flatMap(
          (seat, index) => possibilities[index].length > 1 ? [
            {
              interaction: `empath_n${report.cycle}_${reportIndex}_${index}`,
              seat,
              evil: Boolean(index === 0 ? left : right)
            }
          ] : []
        );
      }
    return null;
  }
  function replayNightInformation(report, trace, redHerringSeat, reportIndex, registrations) {
    if (nightReportChoices(report, trace, redHerringSeat, reportIndex) === null)
      return false;
    if (!report.abilityActive || !report.acceptedMessage || report.kind === "ravenkeeper" || report.kind === "undertaker")
      return true;
    const { state } = trace;
    let valid = true;
    const choice = (seat, interaction) => {
      const matches = registrations.filter(
        (r) => r.seat === seat && r.interaction === interaction
      );
      if (matches.length > 1) valid = false;
      return matches[0];
    };
    if (report.kind === "fortune_teller") {
      const targetMatches = report.targets.map((seat) => {
        const registered = choice(seat, `ft_n${report.cycle}_${reportIndex}`);
        const actual = state.roles[seat - 1];
        const allowed = registered?.role && (registered.role === actual || (actual === "Recluse" ? ["minion", "demon"].includes(ROLE_TEAM[registered.role]) : ["townsfolk", "outsider"].includes(ROLE_TEAM[registered.role])));
        if (registered && (actual !== "Recluse" && actual !== "Spy" || trace.poisonedAtInformationStep === seat || !allowed))
          valid = false;
        return (registered?.role ?? actual) === "Imp" || seat === redHerringSeat;
      });
      return valid && targetMatches.some(Boolean) === report.yes;
    }
    const n = state.roles.length;
    const neighbors = [-1, 1].map((direction) => {
      for (let step = 1; step < n; step++) {
        const seat = (report.speaker - 1 + direction * step + n * n) % n + 1;
        if (state.alive[seat - 1]) return seat;
      }
      return 0;
    });
    if (neighbors.includes(0)) return false;
    const count = neighbors.reduce((total, seat, side) => {
      const registered = choice(
        seat,
        `empath_n${report.cycle}_${reportIndex}_${side}`
      );
      const actual = state.roles[seat - 1];
      const native = isActuallyEvil(state, seat);
      if (registered && (trace.poisonedAtInformationStep === seat || actual !== "Spy" && actual !== "Recluse" || typeof registered.evil !== "boolean" || registered.evil !== native && registered.evil !== (actual === "Recluse")))
        valid = false;
      return total + Number(registered?.evil ?? native);
    }, 0);
    return valid && count === report.count;
  }
  function matchObservedTimeline(witness, input, setupInput, deadline, acceptFinalState, finalRoleConstraint) {
    const n = witness.roles.length;
    const limit3 = input.maxHistories ?? 1e4;
    if (!Number.isInteger(limit3) || limit3 < 1)
      throw new RangeError("\u9690\u85CF\u884C\u52A8\u641C\u7D22\u4E0A\u9650\u65E0\u6548\u3002");
    if (!input.phases.length || input.phases[0]?.kind !== "night")
      throw new RangeError("\u89C2\u5BDF\u65F6\u95F4\u7EBF\u5FC5\u987B\u4ECE\u9996\u591C\u5F00\u59CB\u3002");
    for (const [index, phase] of input.phases.entries()) {
      const expected = index % 2 === 0 ? "night" : "day";
      if (phase.kind !== expected || phase.cycle !== Math.floor(index / 2) + 1 || !Array.isArray(phase.deaths) || phase.deaths.some(
        (seat) => !Number.isInteger(seat) || seat < 1 || seat > n
      ) || new Set(phase.deaths).size !== phase.deaths.length || phase.kind === "day" && (!Array.isArray(phase.events) || phase.executedSeat !== null && (!Number.isInteger(phase.executedSeat) || phase.executedSeat < 1 || phase.executedSeat > n)))
        throw new RangeError("\u89C2\u5BDF\u65F6\u95F4\u7EBF\u987A\u5E8F\u3001\u6B7B\u4EA1\u6216\u5904\u51B3\u8BB0\u5F55\u65E0\u6548\u3002");
    }
    const acceptedReports = /* @__PURE__ */ new Set();
    for (const report of input.laterReports ?? []) {
      if (!Number.isInteger(report.cycle) || report.cycle < 2 || report.cycle > Math.ceil(input.phases.length / 2) || !Number.isInteger(report.speaker) || report.speaker < 1 || report.speaker > n)
        throw new RangeError("\u8DE8\u591C\u62A5\u544A\u5305\u542B\u65E0\u6548\u9636\u6BB5\u6216\u5EA7\u4F4D\u3002");
      if (!report.acceptedMessage || !report.abilityActive) continue;
      const key = `${report.cycle}:${report.kind}:${report.speaker}`;
      if (acceptedReports.has(key))
        throw new RangeError("\u540C\u4E00\u591C\u89D2\u8272\u80FD\u529B\u53EA\u53EF\u91C7\u7EB3\u4E00\u6B21\u5B9E\u9645\u5C55\u793A\u7684\u4FE1\u606F\u3002");
      acceptedReports.add(key);
    }
    let inspected = 0;
    let unknown = null;
    const checkBudget = () => {
      if (Date.now() >= deadline) {
        unknown = { status: "unknown", reason: "time_budget", inspected };
        return false;
      }
      if (inspected >= limit3) {
        unknown = { status: "unknown", reason: "candidate_limit", inspected };
        return false;
      }
      return true;
    };
    const search = (index, state, lastNight, lastDay, timeline2, registrations) => {
      if (finalRoleConstraint && state.roles[finalRoleConstraint.seat - 1] === "Imp" && finalRoleConstraint.role === "Imp" !== finalRoleConstraint.expected)
        return null;
      if (index === input.phases.length)
        return acceptFinalState && !acceptFinalState(state) ? null : {
          timeline: timeline2,
          registrations,
          finalRoles: [...state.roles],
          finalAlignments: copyAlignments(state),
          finalAlive: [...state.alive]
        };
      const observation = input.phases[index];
      const matchesRoleFacts = (next) => (input.phaseRoleFacts ?? []).filter((fact) => fact.phaseIndex === index).every((fact) => next.roles[fact.seat - 1] === fact.role);
      if (state.winner) return null;
      if (observation.kind === "night") {
        for (const variant of nightVariants(
          state,
          observation.cycle,
          observation.deaths,
          setupInput.nightOnePoisoner,
          input.laterReports ?? [],
          checkBudget
        )) {
          if (observation.cycle === 1 && variant.poisonerTarget !== void 0 && (setupInput.reports ?? []).some(
            (report) => report.abilityActive && report.speaker === variant.poisonerTarget
          ))
            continue;
          if (!checkBudget()) return null;
          inspected++;
          if (observation.cycle === 1 && variant.poisonerTarget !== void 0) {
            const inferred = {
              seat: livingRoleSeat2(state, "Poisoner"),
              target: variant.poisonerTarget
            };
            const replay = replayFirstNight(
              { ...setupInput, nightOnePoisoner: inferred },
              { ...witness, nightOnePoisoner: inferred }
            );
            if (!replay.valid) {
              unknown = {
                status: "unknown",
                reason: "unsupported_replay",
                inspected
              };
              continue;
            }
          }
          const previousDayExecutionDeathSeat = lastDay?.executionDeathSeat ?? null;
          const result = resolveNight(state, {
            ...variant,
            ...observation.cycle > 1 ? { previousDayExecutionDeathSeat } : {}
          });
          if (result.status === "unsupported") {
            unknown = {
              status: "unknown",
              reason: "unsupported_replay",
              inspected
            };
            continue;
          }
          if (result.status !== "ok" || !sameSet(result.trace.deaths, observation.deaths) || observation.winner !== void 0 && (result.trace.state.winner ?? null) !== observation.winner)
            continue;
          if (!matchesRoleFacts(result.trace.state)) continue;
          const reportChoices = (input.laterReports ?? []).map(
            (report, index2) => report.cycle === observation.cycle ? nightReportChoices(
              report,
              result.trace,
              witness.redHerringSeat,
              index2
            ) : []
          );
          if (reportChoices.some((choices) => choices === null)) continue;
          const found = search(
            index + 1,
            result.trace.state,
            result.trace,
            lastDay,
            [...timeline2, { kind: "night", actions: variant }],
            [
              ...registrations,
              ...scarletRegistrationChoices(result.trace, index),
              ...impSuccessorRegistrationChoices(result.trace, index),
              ...reportChoices.flatMap((choices) => choices ?? [])
            ]
          );
          if (found) return found;
        }
      } else {
        if (!lastNight) return null;
        for (const variant of dayVariants(
          observation.events,
          state,
          lastNight.poisonedAtInformationStep,
          observation.deaths
        )) {
          if (!checkBudget()) return null;
          inspected++;
          const result = resolveDay(state, {
            ...variant,
            poisonedSeat: lastNight.poisonedAtInformationStep,
            poisonSourceSeat: lastNight.poisonSourceSeat,
            butlerMasterSeat: lastNight.butlerMasterSeat
          });
          if (result.status === "unsupported") {
            unknown = {
              status: "unknown",
              reason: "unsupported_replay",
              inspected
            };
            continue;
          }
          if (result.status !== "ok" || !sameSet(result.trace.deaths, observation.deaths) || result.trace.executedSeat !== observation.executedSeat || observation.winner !== void 0 && (result.trace.state.winner ?? null) !== observation.winner)
            continue;
          if (!matchesRoleFacts(result.trace.state)) continue;
          const found = search(
            index + 1,
            result.trace.state,
            lastNight,
            result.trace,
            [...timeline2, { kind: "day", ...variant }],
            [
              ...registrations,
              ...scarletRegistrationChoices(result.trace, index)
            ]
          );
          if (found) return found;
        }
      }
      return null;
    };
    const timeline = search(
      0,
      {
        roles: [...witness.roles],
        alignments: initialAlignments(witness.roles),
        alive: witness.roles.map(() => true),
        spentVirginSeats: [],
        spentSlayerSeats: [],
        spentDeadVotes: []
      },
      null,
      null,
      [],
      []
    );
    if (timeline)
      return {
        status: "valid",
        timeline: timeline.timeline,
        registrations: timeline.registrations,
        finalRoles: timeline.finalRoles,
        finalAlignments: timeline.finalAlignments,
        finalAlive: timeline.finalAlive,
        inspected
      };
    return unknown ?? { status: "invalid", inspected };
  }
  function replayObservedWitness(witness, input, setupInput, currentQuery, expectedCurrent) {
    const errors = [];
    if (!witness.timeline || witness.timeline.length !== input.phases.length)
      return { valid: false, errors: ["\u89C1\u8BC1\u7F3A\u5C11\u5B8C\u6574\u884C\u52A8\u65F6\u95F4\u7EBF\u3002"] };
    const first = witness.timeline[0];
    const inferred = first.kind === "night" && first.actions.poisonerTarget !== void 0 ? {
      seat: witness.roles.indexOf("Poisoner") + 1,
      target: first.actions.poisonerTarget
    } : void 0;
    const firstNight = replayFirstNight(
      { ...setupInput, ...inferred ? { nightOnePoisoner: inferred } : {} },
      { ...witness, ...inferred ? { nightOnePoisoner: inferred } : {} }
    );
    errors.push(...firstNight.errors);
    const replay = replayTimeline({
      initialPlayers: witness.roles.map((actualRole, index) => ({
        seat: index + 1,
        actualRole,
        shownToken: witness.shownTokens[index]
      })),
      phases: witness.timeline
    });
    if (replay.status !== "ok")
      return { valid: false, errors: [...errors, replay.reason] };
    if (witness.currentRoles && (witness.currentRoles.length !== replay.state.roles.length || Array.from(witness.currentRoles).some(
      (role, index) => replay.state.roles[index] !== role
    )))
      errors.push("\u89C1\u8BC1\u7684\u5F53\u524D\u89D2\u8272\u4E0E\u884C\u52A8\u91CD\u653E\u7ED3\u679C\u4E0D\u7B26\u3002");
    const alignments = copyAlignments(replay.state);
    if (witness.currentAlive && (witness.currentAlive.length !== replay.state.alive.length || Array.from(witness.currentAlive).some(
      (alive, index) => alive !== replay.state.alive[index]
    )))
      errors.push("\u89C1\u8BC1\u7684\u5F53\u524D\u5B58\u6D3B\u8868\u4E0E\u884C\u52A8\u91CD\u653E\u7ED3\u679C\u4E0D\u7B26\u3002");
    if (witness.currentAlignments && (witness.currentAlignments.length !== alignments.length || Array.from(witness.currentAlignments).some(
      (alignment, index) => alignment !== alignments[index]
    )))
      errors.push("\u89C1\u8BC1\u7684\u5B9E\u9645\u9635\u8425\u4E0E\u884C\u52A8\u91CD\u653E\u7ED3\u679C\u4E0D\u7B26\u3002");
    if (!witness.currentAlignments && alignments.some(
      (alignment, index) => alignment !== initialAlignments(replay.state.roles)[index]
    ))
      errors.push("\u89C1\u8BC1\u7F3A\u5C11\u89D2\u8272\u4E0E\u5B9E\u9645\u9635\u8425\u4E0D\u540C\u7684\u9635\u8425\u8BC1\u636E\u3002");
    if (currentQuery && expectedCurrent !== void 0 && replay.state.roles[currentQuery.seat - 1] === currentQuery.role !== expectedCurrent)
      errors.push("\u89C1\u8BC1\u7684\u5F53\u524D\u89D2\u8272\u4E0D\u6EE1\u8DB3\u67E5\u8BE2\u5206\u652F\u3002");
    const expectedScarletChoices = replay.traces.flatMap(
      (trace, index) => scarletRegistrationChoices(trace, index)
    );
    const expectedImpChoices = replay.traces.flatMap(
      (trace, index) => impSuccessorRegistrationChoices(trace, index)
    );
    if (witness.registrations.filter(
      (r) => r.interaction.startsWith("imp_successor_n")
    ).length !== expectedImpChoices.length)
      errors.push("\u9690\u58EB\u81EA\u6740\u63A5\u4EFB\u7684\u6CE8\u518C\u8BB0\u5F55\u6570\u91CF\u4E0E\u5B9E\u9645\u5224\u5B9A\u4E0D\u7B26\u3002");
    if (witness.registrations.filter(
      (r) => r.interaction.startsWith("scarlet_woman_")
    ).length !== expectedScarletChoices.length)
      errors.push("\u7EA2\u5507\u5973\u90CE\u7EE7\u4EFB\u7684\u6CE8\u518C\u8BB0\u5F55\u6570\u91CF\u4E0E\u5B9E\u9645\u5224\u5B9A\u4E0D\u7B26\u3002");
    for (const [index, observation] of input.phases.entries()) {
      const trace = replay.traces[index];
      for (const expected of scarletRegistrationChoices(trace, index)) {
        const records = witness.registrations.filter(
          (r) => r.interaction === expected.interaction
        );
        if (records.length !== 1 || records[0].seat !== expected.seat || records[0].role !== "Imp")
          errors.push("\u7EA2\u5507\u5973\u90CE\u7EE7\u4EFB\u7684\u89C1\u8BC1\u9700\u8981\u552F\u4E00\u6709\u6548\u7684\u672C\u6B21\u9690\u58EB\u6076\u9B54\u6CE8\u518C\u3002");
      }
      for (const expected of impSuccessorRegistrationChoices(trace, index)) {
        const recorded = witness.registrations.filter(
          (registration) => observation.kind === "night" && registration.interaction === expected.interaction
        );
        if (observation.kind !== "night" || recorded.length !== 1 || recorded[0].seat !== expected.seat || !recorded[0].role || ROLE_TEAM[recorded[0].role] !== "minion")
          errors.push("\u9690\u58EB\u63A5\u4EFB\u5C0F\u6076\u9B54\u7684\u89C1\u8BC1\u9700\u8981\u552F\u4E00\u6709\u6548\u7684\u672C\u6B21\u722A\u7259\u6CE8\u518C\u3002");
      }
      for (const fact of (input.phaseRoleFacts ?? []).filter(
        (fact2) => fact2.phaseIndex === index
      )) {
        if (trace.state.roles[fact.seat - 1] !== fact.role)
          errors.push(
            `\u7B2C${index + 1}\u9636\u6BB5\u7ED3\u675F\u65F6${fact.seat}\u53F7\u89D2\u8272\u4E0E\u5DF2\u91C7\u7EB3\u6761\u4EF6\u4E0D\u7B26\u3002`
          );
      }
      if (!sameSet(trace.deaths, observation.deaths))
        errors.push(`\u7B2C${index + 1}\u9636\u6BB5\u6B7B\u4EA1\u96C6\u5408\u4E0D\u7B26\u3002`);
      if (observation.kind === "day" && (!("executedSeat" in trace) || trace.executedSeat !== observation.executedSeat))
        errors.push(`\u7B2C${index + 1}\u9636\u6BB5\u5904\u51B3\u7ED3\u679C\u4E0D\u7B26\u3002`);
      if (observation.winner !== void 0 && (trace.state.winner ?? null) !== observation.winner)
        errors.push(`\u7B2C${index + 1}\u9636\u6BB5\u80DC\u8D1F\u7ED3\u679C\u4E0D\u7B26\u3002`);
      if (observation.kind !== "night" || !("poisonedAtInformationStep" in trace))
        continue;
      for (const [reportIndex, report] of (input.laterReports ?? []).entries()) {
        if (report.cycle !== observation.cycle) continue;
        if (!replayNightInformation(
          report,
          trace,
          witness.redHerringSeat,
          reportIndex,
          witness.registrations
        )) {
          errors.push(`N${report.cycle}\u62A5\u544A\u65E0\u6CD5\u91CD\u653E\u3002`);
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }

  // src/core/symbolicSetup.ts
  var STANDARD_RULESET_HASH = "tb-standard-setup-first-night-v4";
  var TIMELINE_RULESET_HASH = "tb-standard-bounded-timeline-v7";
  var OBSERVED_TIMELINE_RULESET_HASH = "tb-standard-observed-timeline-v8";
  var roleIndex = new Map(
    ROLES.map((role, index) => [role, index])
  );
  var runtime = null;
  var z3 = () => runtime ??= typeof location !== "undefined" && /^https?:$/.test(location.protocol) ? (0, import_z3_solver.init)({
    locateFile: (file) => `/z3/${file}`,
    mainScriptUrlOrBlob: "/z3/z3-built.js"
  }) : (0, import_z3_solver.init)();
  async function queryInitialSetup(input) {
    return queryModel(input);
  }
  async function queryTimelineWorlds(input) {
    return queryModel(input, input);
  }
  async function queryObservedTimeline(input) {
    return queryModel(input, void 0, input);
  }
  async function queryModel(input, timelineInput, observedInput) {
    const base = baseSetup(input.playerCount);
    const n = input.playerCount;
    const reports = input.reports ?? [];
    const scope = timelineInput || observedInput ? "bounded_timeline" : reports.length ? "first_night_slice" : "initial_setup_only";
    const rulesetHash = timelineInput ? TIMELINE_RULESET_HASH : observedInput ? OBSERVED_TIMELINE_RULESET_HASH : STANDARD_RULESET_HASH;
    if (timelineInput) {
      if (!Array.isArray(timelineInput.timeline) || !timelineInput.timeline.length || !timelineInput.timeline[0] || timelineInput.timeline[0].kind !== "night" || !timelineInput.timeline[0].actions || timelineInput.timeline[0].actions.cycle !== 1 || !Array.isArray(timelineInput.observations) || timelineInput.observations.length !== timelineInput.timeline.length)
        throw new RangeError("\u52A8\u6001\u67E5\u8BE2\u9700\u8981\u4ECE\u9996\u591C\u5F00\u59CB\u7684\u5B8C\u6574\u884C\u52A8\u548C\u9010\u9636\u6BB5\u89C2\u5BDF\u3002");
      if (timelineInput.timeline[0].actions.poisonerTarget !== input.nightOnePoisoner?.target)
        throw new RangeError("\u9996\u591C\u884C\u52A8\u4E0E\u6295\u6BD2\u524D\u63D0\u4E0D\u4E00\u81F4\u3002");
      if (timelineInput.maxWorlds !== void 0 && (!Number.isInteger(timelineInput.maxWorlds) || timelineInput.maxWorlds < 1))
        throw new RangeError("\u5019\u9009\u4E16\u754C\u4E0A\u9650\u65E0\u6548\u3002");
    }
    if (observedInput && observedInput.maxWorlds !== void 0 && (!Number.isInteger(observedInput.maxWorlds) || observedInput.maxWorlds < 1))
      throw new RangeError("\u5019\u9009\u4E16\u754C\u4E0A\u9650\u65E0\u6548\u3002");
    const checkSeat = (seat) => {
      if (!Number.isInteger(seat) || seat < 1 || seat > n)
        throw new RangeError("\u8BBE\u7F6E\u67E5\u8BE2\u5305\u542B\u65E0\u6548\u5EA7\u4F4D\u3002");
    };
    if (timelineInput) {
      for (const [index, phase] of timelineInput.timeline.entries()) {
        const expected = index % 2 === 0 ? "night" : "day";
        if (!phase || phase.kind !== expected || phase.kind === "night" && (!phase.actions || phase.actions.cycle !== Math.floor(index / 2) + 1) || phase.kind === "day" && !Array.isArray(phase.events))
          throw new RangeError("\u52A8\u6001\u884C\u52A8\u65F6\u95F4\u7EBF\u987A\u5E8F\u6216\u9636\u6BB5\u5185\u5BB9\u65E0\u6548\u3002");
        const observation = timelineInput.observations[index];
        if (!observation || typeof observation !== "object")
          throw new RangeError("\u52A8\u6001\u9636\u6BB5\u89C2\u5BDF\u65E0\u6548\u3002");
        if (observation.deaths !== void 0) {
          if (!Array.isArray(observation.deaths) || !observation.deaths.every(
            (seat) => Number.isInteger(seat) && seat >= 1 && seat <= n
          ) || new Set(observation.deaths).size !== observation.deaths.length)
            throw new RangeError("\u52A8\u6001\u6B7B\u4EA1\u89C2\u5BDF\u65E0\u6548\u3002");
        }
        if (observation.executedSeat !== void 0 && (phase.kind !== "day" || observation.executedSeat !== null && (!Number.isInteger(observation.executedSeat) || observation.executedSeat < 1 || observation.executedSeat > n)))
          throw new RangeError("\u52A8\u6001\u5904\u51B3\u89C2\u5BDF\u65E0\u6548\u3002");
        if (observation.winner !== void 0 && observation.winner !== null && observation.winner !== "good" && observation.winner !== "evil")
          throw new RangeError("\u52A8\u6001\u80DC\u8D1F\u89C2\u5BDF\u65E0\u6548\u3002");
      }
    }
    const checkFact = ({ seat, role }) => {
      checkSeat(seat);
      if (!roleIndex.has(role)) throw new RangeError("\u8BBE\u7F6E\u67E5\u8BE2\u5305\u542B\u65E0\u6548\u89D2\u8272\u3002");
    };
    input.facts.forEach(checkFact);
    for (const token of input.tokenFacts ?? []) {
      checkSeat(token.seat);
      if (!roleIndex.has(token.shownRole))
        throw new RangeError("\u8BBE\u7F6E\u67E5\u8BE2\u5305\u542B\u65E0\u6548\u6240\u89C1\u89D2\u8272token\u3002");
    }
    checkFact(input.query);
    if (observedInput?.currentQuery) checkFact(observedInput.currentQuery);
    for (const fact of observedInput?.phaseRoleFacts ?? []) {
      checkFact(fact);
      if (!Number.isInteger(fact.phaseIndex) || fact.phaseIndex < 0 || fact.phaseIndex >= observedInput.phases.length)
        throw new RangeError("\u5F53\u524D\u89D2\u8272\u6761\u4EF6\u6240\u5728\u9636\u6BB5\u4E0D\u5728\u5C01\u95ED\u65F6\u95F4\u7EBF\u4E2D\u3002");
    }
    if (input.nightOnePoisoner) {
      checkSeat(input.nightOnePoisoner.seat);
      checkSeat(input.nightOnePoisoner.target);
    }
    const seenActiveReports = /* @__PURE__ */ new Set();
    for (const report of reports) {
      checkSeat(report.speaker);
      if (report.kind === "pair_role" || report.kind === "fortune_teller") {
        report.targets.forEach(checkSeat);
        if (report.targets[0] === report.targets[1])
          throw new RangeError("\u4E00\u6B21\u4FE1\u606F\u7684\u4E24\u4E2A\u76EE\u6807\u5FC5\u987B\u4E0D\u540C\u3002");
      }
      if (report.kind === "pair_role") {
        const requiredTeam = report.ability === "Washerwoman" ? "townsfolk" : report.ability === "Librarian" ? "outsider" : "minion";
        if (ROLE_TEAM[report.seenRole] !== requiredTeam)
          throw new RangeError("\u5C55\u793A\u89D2\u8272\u4E0E\u8FD9\u9879\u9996\u591C\u80FD\u529B\u7684\u7C7B\u522B\u4E0D\u7B26\u3002");
      }
      if ((report.kind === "chef" || report.kind === "empath") && (!Number.isInteger(report.count) || report.count < 0 || report.count > (report.kind === "empath" ? 2 : n))) {
        throw new RangeError("\u9996\u591C\u6570\u5B57\u4FE1\u606F\u8D85\u51FA\u5408\u6CD5\u8303\u56F4\u3002");
      }
      if (report.acceptedMessage && report.abilityActive) {
        const key = `${report.kind === "pair_role" ? report.ability : report.kind === "librarian_zero" ? "Librarian" : report.kind}:${report.speaker}`;
        if (seenActiveReports.has(key))
          throw new RangeError("\u540C\u4E00\u9996\u591C\u80FD\u529B\u53EA\u53EF\u91C7\u7EB3\u4E00\u6B21\u5B9E\u9645\u5C55\u793A\u7684\u4FE1\u606F\u3002");
        seenActiveReports.add(key);
      }
    }
    const { Context } = await z3();
    const deadline = Date.now() + Math.max(100, Math.min(input.timeoutMs ?? 2e3, 1e4));
    const { Solver, Int, Bool, Or, And, Not, Distinct, Sum, If } = new Context(
      "tb-setup"
    );
    const solver = new Solver();
    solver.set(
      "timeout",
      Math.max(100, Math.min(input.timeoutMs ?? 2e3, 1e4))
    );
    const roles = Array.from({ length: n }, (_, i) => Int.const(`seat_${i + 1}`));
    const shownTokens = Array.from(
      { length: n },
      (_, i) => Int.const(`shown_${i + 1}`)
    );
    for (const role of roles) solver.add(role.ge(0), role.lt(ROLES.length));
    for (const token of shownTokens)
      solver.add(token.ge(0), token.lt(ROLES.length));
    solver.add(Distinct(...roles));
    const isRole2 = (seat, role) => roles[seat - 1].eq(roleIndex.get(role));
    const hasTeam = (role, team) => Or(
      ...ROLES.flatMap(
        (id, index) => ROLE_TEAM[id] === team ? [role.eq(index)] : []
      )
    );
    const countTeam = (team) => {
      const terms = roles.map((role) => If(hasTeam(role, team), 1, 0));
      return Sum(terms[0], ...terms.slice(1));
    };
    const baron = Or(...roles.map((role) => role.eq(roleIndex.get("Baron"))));
    solver.add(
      countTeam("townsfolk").eq(Sum(Int.val(base.townsfolk), If(baron, -2, 0)))
    );
    solver.add(
      countTeam("outsider").eq(Sum(Int.val(base.outsider), If(baron, 2, 0)))
    );
    solver.add(countTeam("minion").eq(base.minion));
    solver.add(countTeam("demon").eq(1));
    for (const [index, token] of shownTokens.entries()) {
      const drunkToken = Or(
        ...TOWNSFOLK.map((townsfolk) => {
          const id = roleIndex.get(townsfolk);
          return And(
            token.eq(id),
            Not(Or(...roles.map((actual) => actual.eq(id))))
          );
        })
      );
      solver.add(
        Or(
          And(roles[index].eq(roleIndex.get("Drunk")), drunkToken),
          And(
            Not(roles[index].eq(roleIndex.get("Drunk"))),
            token.eq(roles[index])
          )
        )
      );
    }
    for (const token of input.tokenFacts ?? [])
      solver.add(shownTokens[token.seat - 1].eq(roleIndex.get(token.shownRole)));
    for (const fact of input.facts) solver.add(isRole2(fact.seat, fact.role));
    if (observedInput) {
      const poisonerInSetup = Or(
        ...roles.map((role) => role.eq(roleIndex.get("Poisoner")))
      );
      for (const phase of observedInput.phases) {
        if (phase.kind !== "night" || phase.cycle === 1) continue;
        for (const deadSeat of phase.deaths) {
          solver.add(Or(Not(isRole2(deadSeat, "Soldier")), poisonerInSetup));
        }
      }
    }
    if (input.nightOnePoisoner)
      solver.add(isRole2(input.nightOnePoisoner.seat, "Poisoner"));
    const isPoisoned = (seat) => input.nightOnePoisoner?.target === seat;
    const evilChoices = [];
    const registeredEvil = (seat, interaction) => {
      const actual = roles[seat - 1];
      const optional = And(
        Bool.val(!isPoisoned(seat)),
        Or(isRole2(seat, "Spy"), isRole2(seat, "Recluse"))
      );
      const evil = Or(hasTeam(actual, "minion"), hasTeam(actual, "demon"));
      const term = Bool.const(`evil_${interaction}_${seat}`);
      evilChoices.push({ interaction, seat, term });
      return If(optional, term, evil);
    };
    const redHerring = Int.const("red_herring_zero_based");
    const needsRedHerring = reports.some(
      (r) => r.kind === "fortune_teller" && r.acceptedMessage && r.abilityActive
    ) || (observedInput?.laterReports ?? []).some(
      (r) => r.kind === "fortune_teller" && r.acceptedMessage && r.abilityActive
    );
    if (needsRedHerring) {
      solver.add(redHerring.ge(0), redHerring.lt(n));
      solver.add(
        Or(
          ...roles.map(
            (role, index) => And(
              redHerring.eq(index),
              Or(hasTeam(role, "townsfolk"), hasTeam(role, "outsider"))
            )
          )
        )
      );
    }
    for (const [index, report] of reports.entries()) {
      const ability = report.kind === "pair_role" ? report.ability : report.kind === "librarian_zero" ? "Librarian" : report.kind === "chef" ? "Chef" : report.kind === "empath" ? "Empath" : "Fortune Teller";
      if (report.abilityActive) {
        solver.add(isRole2(report.speaker, ability));
        if (input.nightOnePoisoner && report.speaker === input.nightOnePoisoner.target)
          solver.add(Bool.val(false));
      }
      if (!report.abilityActive || !report.acceptedMessage) continue;
      if (report.kind === "librarian_zero") {
        solver.add(
          ...roles.map(
            (actual, position) => Or(
              Not(hasTeam(actual, "outsider")),
              And(
                Bool.val(!isPoisoned(position + 1)),
                isRole2(position + 1, "Recluse")
              )
            )
          )
        );
      } else if (report.kind === "pair_role") {
        const special = report.ability === "Investigator" ? "Recluse" : "Spy";
        solver.add(
          Or(
            ...report.targets.map(
              (seat) => Or(
                isRole2(seat, report.seenRole),
                And(Bool.val(!isPoisoned(seat)), isRole2(seat, special))
              )
            )
          )
        );
      } else if (report.kind === "chef") {
        const terms = Array.from({ length: n }, (_, position) => {
          const left = position + 1, right = (position + 1) % n + 1;
          return If(
            And(
              registeredEvil(left, `chef_${index}_${position}_left`),
              registeredEvil(right, `chef_${index}_${position}_right`)
            ),
            1,
            0
          );
        });
        solver.add(Sum(terms[0], ...terms.slice(1)).eq(report.count));
      } else if (report.kind === "empath") {
        const left = report.speaker === 1 ? n : report.speaker - 1;
        const right = report.speaker === n ? 1 : report.speaker + 1;
        solver.add(
          Sum(
            If(registeredEvil(left, `empath_${index}_left`), 1, 0),
            If(registeredEvil(right, `empath_${index}_right`), 1, 0)
          ).eq(report.count)
        );
      } else {
        const detects = report.targets.map(
          (seat) => Or(
            isRole2(seat, "Imp"),
            redHerring.eq(seat - 1),
            And(
              isRole2(seat, "Recluse"),
              Bool.val(!isPoisoned(seat)),
              Bool.const(`ft_recluse_${index}_${seat}`)
            )
          )
        );
        const yes2 = Or(...detects);
        solver.add(report.yes ? yes2 : Not(yes2));
      }
    }
    const witness = () => {
      const model = solver.model();
      const assignment = roles.map(
        (term) => ROLES[Number(model.eval(term).toString())]
      );
      const shown = shownTokens.map(
        (term) => ROLES[Number(model.eval(term).toString())]
      );
      const rh = needsRedHerring ? Number(model.eval(redHerring).toString()) + 1 : void 0;
      const registrations = evilChoices.flatMap(
        ({ interaction, seat, term }) => !isPoisoned(seat) && (assignment[seat - 1] === "Spy" || assignment[seat - 1] === "Recluse") ? [
          {
            interaction,
            seat,
            evil: model.eval(term).toString() === "true"
          }
        ] : []
      );
      for (const [index, report] of reports.entries()) {
        if (!report.abilityActive || !report.acceptedMessage) continue;
        if (report.kind === "librarian_zero") {
          for (const [position, actual] of assignment.entries()) {
            if (actual === "Recluse" && !isPoisoned(position + 1))
              registrations.push({
                interaction: `librarian_zero_${index}`,
                seat: position + 1,
                role: "Poisoner"
              });
          }
        } else if (report.kind === "pair_role") {
          const alreadyTrue = report.targets.some(
            (seat) => assignment[seat - 1] === report.seenRole
          );
          if (!alreadyTrue) {
            const special = report.ability === "Investigator" ? "Recluse" : "Spy";
            const seat = report.targets.find(
              (target) => !isPoisoned(target) && assignment[target - 1] === special
            );
            if (seat)
              registrations.push({
                interaction: `pair_${index}`,
                seat,
                role: report.seenRole
              });
          }
        } else if (report.kind === "fortune_teller") {
          for (const seat of report.targets) {
            if (assignment[seat - 1] === "Recluse" && !isPoisoned(seat)) {
              const alreadyYes = report.targets.some(
                (target) => assignment[target - 1] === "Imp" || target === rh
              );
              registrations.push({
                interaction: `ft_${index}`,
                seat,
                ...report.yes && !alreadyYes ? { role: "Imp" } : {}
              });
            }
          }
        }
      }
      return {
        roles: assignment,
        shownTokens: shown,
        ...rh ? { redHerringSeat: rh } : {},
        ...input.nightOnePoisoner ? { nightOnePoisoner: input.nightOnePoisoner } : {},
        registrations
      };
    };
    if (timelineInput || observedInput) {
      const maxWorlds = (timelineInput ?? observedInput)?.maxWorlds ?? 1e3;
      let inspected = 0;
      const sameSet2 = (a, b) => {
        const expected = [...b].sort((x, y) => x - y);
        return a.length === expected.length && [...a].sort((x, y) => x - y).every((seat, index) => seat === expected[index]);
      };
      const matches = (candidate) => {
        if (!timelineInput) return { status: "unknown" };
        const replay = replayTimeline({
          initialPlayers: candidate.roles.map((actualRole, index) => ({
            seat: index + 1,
            actualRole,
            shownToken: candidate.shownTokens[index]
          })),
          phases: timelineInput.timeline
        });
        if (replay.status === "unsupported")
          return { status: "unknown" };
        if (replay.status !== "ok") return { status: "invalid" };
        for (const [index, observation] of timelineInput.observations.entries()) {
          const trace = replay.traces[index];
          if (observation.deaths !== void 0 && !sameSet2(trace.deaths, observation.deaths))
            return { status: "invalid" };
          if (observation.executedSeat !== void 0 && (timelineInput.timeline[index].kind !== "day" || !("executedSeat" in trace) || trace.executedSeat !== observation.executedSeat))
            return { status: "invalid" };
          if (observation.winner !== void 0 && (trace.state.winner ?? null) !== observation.winner)
            return { status: "invalid" };
        }
        return { status: "valid", replay };
      };
      const find = async (proposition, expectedCurrent) => {
        while (inspected < maxWorlds && Date.now() < deadline) {
          const status = await solver.check(proposition);
          if (status === "unsat") return { status };
          if (status !== "sat")
            return { status: "unknown", reason: "solver_unknown" };
          const candidate = witness();
          inspected++;
          const firstNight = replayFirstNight(input, candidate);
          if (!firstNight.valid)
            throw new Error(`\u6C42\u89E3\u89C1\u8BC1\u91CD\u653E\u5931\u8D25\uFF1A${firstNight.errors.join("\uFF1B")}`);
          const observedVerdict = observedInput ? matchObservedTimeline(
            candidate,
            observedInput,
            input,
            deadline,
            expectedCurrent === void 0 || !observedInput.currentQuery ? void 0 : (state) => state.roles[observedInput.currentQuery.seat - 1] === observedInput.currentQuery.role === expectedCurrent,
            expectedCurrent === void 0 || !observedInput.currentQuery ? void 0 : { ...observedInput.currentQuery, expected: expectedCurrent }
          ) : null;
          const timelineVerdict = observedVerdict ? null : matches(candidate);
          const verdict = observedVerdict ? observedVerdict.status === "valid" ? "valid" : observedVerdict.status === "invalid" ? "invalid" : "unknown" : timelineVerdict?.status;
          if (verdict === "valid") {
            const answer = observedVerdict?.status === "valid" ? {
              ...candidate,
              timeline: observedVerdict.timeline,
              currentRoles: observedVerdict.finalRoles,
              currentAlive: observedVerdict.finalAlive,
              currentAlignments: observedVerdict.finalAlignments,
              registrations: [
                ...candidate.registrations,
                ...observedVerdict.registrations
              ],
              ...observedVerdict.timeline[0]?.kind === "night" && observedVerdict.timeline[0].actions.poisonerTarget !== void 0 ? {
                nightOnePoisoner: {
                  seat: candidate.roles.indexOf("Poisoner") + 1,
                  target: observedVerdict.timeline[0].actions.poisonerTarget
                }
              } : {}
            } : timelineVerdict?.status === "valid" && timelineInput ? {
              ...candidate,
              timeline: timelineInput.timeline,
              currentRoles: timelineVerdict.replay.state.roles,
              currentAlive: [...timelineVerdict.replay.state.alive],
              currentAlignments: copyAlignments(
                timelineVerdict.replay.state
              ),
              registrations: [
                ...candidate.registrations,
                ...timelineVerdict.replay.traces.flatMap(
                  (trace, phaseIndex2) => [
                    ...scarletRegistrationChoices(trace, phaseIndex2),
                    ...impSuccessorRegistrationChoices(trace, phaseIndex2)
                  ]
                )
              ]
            } : candidate;
            if (observedInput) {
              const replay = replayObservedWitness(
                answer,
                observedInput,
                input,
                observedInput.currentQuery,
                expectedCurrent
              );
              if (!replay.valid)
                throw new Error(`\u52A8\u6001\u89C1\u8BC1\u91CD\u653E\u5931\u8D25\uFF1A${replay.errors.join("\uFF1B")}`);
            }
            return { status: "sat", witness: answer };
          }
          if (verdict === "unknown")
            return {
              status: "unknown",
              reason: observedVerdict?.status === "unknown" ? observedVerdict.reason : "unsupported_replay"
            };
          solver.add(
            Not(
              And(
                ...roles.map(
                  (term, index) => term.eq(roleIndex.get(candidate.roles[index]))
                ),
                ...needsRedHerring && candidate.redHerringSeat ? [redHerring.eq(candidate.redHerringSeat - 1)] : []
              )
            )
          );
        }
        return {
          status: "unknown",
          reason: inspected >= maxWorlds ? "candidate_limit" : "time_budget"
        };
      };
      const queryFact = observedInput?.currentQuery ?? input.query;
      const phi2 = isRole2(queryFact.seat, queryFact.role);
      const current = Boolean(
        observedInput?.currentQuery && observedInput.phases.some((phase) => phase.deaths.length > 0)
      );
      solver.push();
      const yesResult = await find(
        current ? Bool.val(true) : phi2,
        current ? true : void 0
      );
      solver.pop();
      solver.push();
      const noResult = await find(
        current ? Bool.val(true) : Not(phi2),
        current ? false : void 0
      );
      solver.pop();
      const yes2 = "witness" in yesResult ? yesResult.witness : void 0;
      const no2 = "witness" in noResult ? noResult.witness : void 0;
      const classification2 = yesResult.status === "unsat" && noResult.status === "unsat" ? "inconsistent" : yesResult.status === "unsat" && noResult.status === "sat" ? "impossible" : noResult.status === "unsat" && yesResult.status === "sat" ? "necessary" : yesResult.status === "sat" && noResult.status === "sat" ? "contingent" : "unknown";
      return {
        rulesetHash,
        scope,
        status: classification2 === "inconsistent" ? "unsat" : classification2 === "unknown" && !yes2 && !no2 ? "unknown" : "sat",
        classification: classification2,
        yes: yes2,
        no: no2,
        inspectedCandidates: inspected,
        ...classification2 === "unknown" ? {
          unknownReason: ("reason" in yesResult ? yesResult.reason : void 0) ?? ("reason" in noResult ? noResult.reason : void 0)
        } : {}
      };
    }
    const baseStatus = await solver.check();
    if (baseStatus === "unsat")
      return {
        rulesetHash,
        scope,
        status: "unsat",
        classification: "inconsistent"
      };
    if (baseStatus !== "sat")
      return {
        rulesetHash,
        scope,
        status: "unknown",
        classification: "unknown"
      };
    const phi = isRole2(input.query.seat, input.query.role);
    const yesStatus = await solver.check(phi);
    const yes = yesStatus === "sat" ? witness() : void 0;
    const noStatus = await solver.check(Not(phi));
    const no = noStatus === "sat" ? witness() : void 0;
    for (const candidate of [yes, no]) {
      if (candidate) {
        const replay = replayFirstNight(input, candidate);
        if (!replay.valid)
          throw new Error(`\u6C42\u89E3\u89C1\u8BC1\u91CD\u653E\u5931\u8D25\uFF1A${replay.errors.join("\uFF1B")}`);
      }
    }
    const classification = yesStatus === "unsat" ? "impossible" : noStatus === "unsat" ? "necessary" : yesStatus === "sat" && noStatus === "sat" ? "contingent" : "unknown";
    return {
      rulesetHash,
      scope,
      status: "sat",
      classification,
      yes,
      no
    };
  }

  // src/core/standardWorkspace.ts
  var uid = () => globalThis.crypto.randomUUID();
  var validSeat2 = (seat, count) => Number.isInteger(seat) && Number(seat) >= 1 && Number(seat) <= count;
  var isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  var isRole = (role) => typeof role === "string" && ROLES.includes(role);
  var nonempty = (value) => typeof value === "string" && value.trim().length > 0;
  var validDate = (value) => typeof value === "string" && !Number.isNaN(Date.parse(value));
  var validTime = (value) => isRecord(value) && (value.phase === "day" || value.phase === "night") && Number.isInteger(value.cycle) && Number(value.cycle) >= 1 && Number(value.cycle) <= 99;
  function visibleStandardEvents(workspace, viewerSeat, revision = Infinity) {
    if (!validSeat2(viewerSeat, workspace.playerCount))
      throw new RangeError("\u79C1\u5BC6\u89C6\u89D2\u5EA7\u4F4D\u65E0\u6548\u3002");
    return activeEvents(workspace.events, revision).filter(
      (event) => event.visibility === "public" || event.ownerSeat === viewerSeat
    );
  }
  function requireLatestStandardRevision(workspace) {
    const branch = workspace.branches.find(
      (item) => item.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    if (branch.baseRevision !== workspace.events.length)
      throw new Error("\u5F53\u524D\u5206\u652F\u5C1A\u672A\u5305\u542B\u6700\u65B0\u8BB0\u5F55\uFF0C\u8BF7\u5148\u66F4\u65B0\u5230\u6700\u65B0\u8BB0\u5F55\u518D\u4FEE\u6539\u5386\u53F2\u3002");
  }
  function commitStandardDrafts(workspace, rawText, drafts, visibility = "private") {
    requireLatestStandardRevision(workspace);
    if (!drafts.length) throw new Error("\u6CA1\u6709\u53EF\u63D0\u4EA4\u7684\u4E8B\u4EF6\u3002");
    const physicalTimes = drafts.filter((d) => changesPhaseCompleteness(d.payload)).flatMap((d) => d.occurredAt ? [d.occurredAt] : []);
    workspace = reopenStandardPhases(workspace, physicalTimes);
    const current = activeEvents(workspace.events);
    const entryId = uid();
    const now = (/* @__PURE__ */ new Date()).toISOString();
    const events = drafts.map((draft, index) => {
      const payload = { ...draft.payload };
      if (payload.kind === "vote") {
        const nominations = current.filter(
          (event) => event.payload.kind === "nomination" && (payload.nominationId === void 0 || event.id === payload.nominationId) && event.payload.nominee === payload.nominee && event.occurredAt?.phase === draft.occurredAt?.phase && event.occurredAt?.cycle === draft.occurredAt?.cycle
        );
        if (nominations.length !== 1)
          throw new Error("\u6295\u7968\u5FC5\u987B\u5173\u8054\u540C\u4E00\u5929\u552F\u4E00\u4E00\u6761\u5DF2\u8BB0\u5F55\u7684\u63D0\u540D\u3002");
        if (visibility === "public" && nominations[0].visibility !== "public")
          throw new Error("\u516C\u5F00\u6295\u7968\u4E0D\u80FD\u5F15\u7528\u79C1\u5BC6\u63D0\u540D\u3002");
        payload.nominationId = nominations[0].id;
      }
      return {
        id: uid(),
        rawEntryId: entryId,
        revision: workspace.events.length + index + 1,
        recordedAt: now,
        occurredAt: draft.occurredAt,
        rawText,
        sourceSpan: draft.sourceSpan,
        payload,
        ...draft.correctsEventId !== void 0 ? { correctsEventId: draft.correctsEventId } : {},
        ...visibility === "public" ? { visibility: "public" } : {
          visibility: "private",
          ownerSeat: workspace.perspectiveSeat
        }
      };
    });
    const revision = workspace.events.length + events.length;
    const next = {
      ...workspace,
      schemaVersion: workspace.schemaVersion === 5 || drafts.some(
        (draft) => draft.correctsEventId !== void 0 && (draft.payload.kind === "nomination" || draft.payload.kind === "slayer")
      ) ? 5 : workspace.schemaVersion === 4 || drafts.some(
        (draft) => draft.correctsEventId !== void 0 && draft.payload.kind !== "vote"
      ) ? 4 : drafts.some((draft) => draft.correctsEventId !== void 0) ? 3 : workspace.schemaVersion,
      events: [...workspace.events, ...events],
      branches: workspace.branches.map(
        (branch) => branch.id === workspace.activeBranchId ? { ...branch, baseRevision: revision } : branch
      )
    };
    if (drafts.some((draft) => draft.correctsEventId !== void 0))
      validateStandardWorkspace(next);
    return next;
  }
  function retractStandardEvent(workspace, targetId, reason = "\u7EA0\u6B63\u8BEF\u5F55") {
    requireLatestStandardRevision(workspace);
    const target = activeEvents(workspace.events).find(
      (event) => event.id === targetId
    );
    if (!target) throw new Error("\u539F\u4E8B\u4EF6\u5DF2\u4E0D\u5B58\u5728\u6216\u5DF2\u64A4\u56DE\u3002");
    if (target.visibility === "private" && target.ownerSeat !== workspace.perspectiveSeat)
      throw new Error("\u4E0D\u80FD\u64A4\u56DE\u5176\u4ED6\u73A9\u5BB6\u7684\u79C1\u5BC6\u8BB0\u5F55\u3002");
    const entry = {
      id: uid(),
      rawEntryId: uid(),
      revision: workspace.events.length + 1,
      recordedAt: (/* @__PURE__ */ new Date()).toISOString(),
      occurredAt: target.occurredAt,
      rawText: reason,
      sourceSpan: [0, reason.length],
      payload: { kind: "retraction", targetId, reason },
      ...target.visibility === "public" ? { visibility: "public" } : { visibility: "private", ownerSeat: target.ownerSeat }
    };
    const next = {
      ...workspace,
      events: [...workspace.events, entry],
      branches: workspace.branches.map(
        (branch) => branch.id === workspace.activeBranchId ? { ...branch, baseRevision: entry.revision } : branch
      )
    };
    return changesPhaseCompleteness(target.payload) && target.occurredAt ? reopenStandardPhases(next, [target.occurredAt]) : next;
  }
  function changesPhaseCompleteness(payload) {
    return ["nomination", "vote", "execution", "death", "slayer"].includes(
      payload.kind
    );
  }
  function reopenStandardPhases(workspace, times) {
    const closures = visibleStandardEvents(
      workspace,
      workspace.perspectiveSeat
    ).filter(
      (e) => e.payload.kind === "phase_closed" && times.some(
        (time) => e.occurredAt?.cycle === time.cycle && e.occurredAt?.phase === time.phase
      )
    );
    return closures.reduce(
      (next, e) => retractStandardEvent(
        next,
        e.id,
        "\u672C\u9636\u6BB5\u884C\u52A8\u6216\u6B7B\u4EA1\u8BB0\u5F55\u5DF2\u53D8\u52A8\uFF0C\u8BF7\u91CD\u65B0\u786E\u8BA4\u5B8C\u6574\u3002"
      ),
      workspace
    );
  }
  function prepareStandardSetupQuery(workspace, allowPhysicalEvents = false, allowLaterReports = false) {
    const branch = workspace.branches.find(
      (item) => item.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    if (workspace.query.stage === "current" && !allowPhysicalEvents)
      return {
        status: "unsupported",
        reason: "\u5F53\u524D\u89D2\u8272\u67E5\u8BE2\u9700\u8981\u81F3\u5C11\u4E00\u4E2A\u5DF2\u5C01\u95ED\u7684\u65E5\u591C\u9636\u6BB5\u3002",
        revision: branch.baseRevision
      };
    const current = visibleStandardEvents(
      workspace,
      workspace.perspectiveSeat,
      branch.baseRevision
    );
    const byId = new Map(current.map((event) => [event.id, event]));
    if (!allowPhysicalEvents && current.some(
      (event) => [
        "nomination",
        "vote",
        "execution",
        "death",
        "slayer",
        "winner",
        "phase_closed"
      ].includes(event.payload.kind)
    ))
      return {
        status: "unsupported",
        reason: "\u767D\u5929\u6216\u8DE8\u591C\u4E8B\u5B9E\u5C1A\u672A\u63A5\u51657\u201315\u4EBA\u901A\u7528\u7B26\u53F7\u67E5\u8BE2\u3002",
        revision: branch.baseRevision
      };
    const selected = workspace.hypotheses.filter(
      (hypothesis) => branch.assumptionIds.includes(hypothesis.id)
    );
    const facts = [];
    const tokenFacts = [];
    const sourceIds = [];
    let nightOnePoisoner;
    const reports = /* @__PURE__ */ new Map();
    for (const premise of selected) {
      if (premise.kind === "actual_role") {
        facts.push({ seat: premise.seat, role: premise.role });
        continue;
      }
      if (premise.kind === "role_at_phase") {
        if (!allowPhysicalEvents)
          return {
            status: "unsupported",
            reason: "\u5F53\u524D\u89D2\u8272\u58F0\u79F0\u9700\u8981\u5148\u786E\u8BA4\u5176\u6240\u5728\u9636\u6BB5\u53CA\u6B64\u524D\u9636\u6BB5\u7684\u8BB0\u5F55\u5B8C\u6574\u3002",
            revision: branch.baseRevision
          };
        continue;
      }
      if (premise.kind === "seen_token") {
        tokenFacts.push({ seat: premise.seat, shownRole: premise.shownRole });
        continue;
      }
      if (premise.kind === "night_one_poison") {
        if (nightOnePoisoner)
          return {
            status: "unsupported",
            reason: "\u540C\u4E00\u9996\u591C\u5B58\u5728\u591A\u4E2A\u5DF2\u91C7\u7EB3\u6295\u6BD2\u884C\u52A8\u3002",
            revision: branch.baseRevision
          };
        nightOnePoisoner = {
          seat: premise.poisonerSeat,
          target: premise.targetSeat
        };
        continue;
      }
      const event = byId.get(premise.eventId);
      if (!event)
        return {
          status: "unsupported",
          reason: "\u5DF2\u91C7\u7EB3\u62A5\u544A\u5728\u5F53\u524D\u4FEE\u8BA2\u6216\u79C1\u5BC6\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\u3002",
          revision: branch.baseRevision
        };
      if (event.payload.kind !== "claim" || event.payload.claimKind !== "ability_report" || event.occurredAt?.phase !== "night")
        return {
          status: "unsupported",
          reason: "\u80FD\u529B\u62A5\u544A\u9700\u8981\u660E\u786E\u7684\u591C\u665A\u65F6\u95F4\u3002",
          revision: branch.baseRevision
        };
      if (event.occurredAt.cycle !== 1) {
        if (!allowLaterReports)
          return {
            status: "unsupported",
            reason: "\u8DE8\u591C\u80FD\u529B\u62A5\u544A\u9700\u8981\u5C01\u95ED\u89C2\u5BDF\u67E5\u8BE2\u3002",
            revision: branch.baseRevision
          };
        sourceIds.push(event.id);
        continue;
      }
      const item = reports.get(event.id) ?? {
        event,
        acceptedMessage: false,
        abilityActive: false
      };
      if (premise.kind === "report_accurate") item.acceptedMessage = true;
      else item.abilityActive = true;
      reports.set(event.id, item);
      sourceIds.push(event.id);
    }
    const mapped = [];
    for (const { event, acceptedMessage, abilityActive } of reports.values()) {
      const payload = event.payload;
      if (payload.kind !== "claim" || payload.claimKind !== "ability_report")
        continue;
      const base = {
        speaker: payload.speaker,
        acceptedMessage,
        abilityActive
      };
      if (payload.role === "Librarian" && payload.value === 0) {
        mapped.push({ kind: "librarian_zero", ...base });
      } else if ((payload.role === "Washerwoman" || payload.role === "Librarian" || payload.role === "Investigator") && payload.targets?.length === 2 && isRole(payload.value)) {
        mapped.push({
          kind: "pair_role",
          ability: payload.role,
          targets: [payload.targets[0], payload.targets[1]],
          seenRole: payload.value,
          ...base
        });
      } else if ((payload.role === "Chef" || payload.role === "Empath") && typeof payload.value === "number") {
        mapped.push({
          kind: payload.role.toLowerCase(),
          count: payload.value,
          ...base
        });
      } else if (payload.role === "Fortune Teller" && payload.targets?.length === 2 && typeof payload.value === "boolean") {
        mapped.push({
          kind: "fortune_teller",
          targets: [payload.targets[0], payload.targets[1]],
          yes: payload.value,
          ...base
        });
      } else
        return {
          status: "unsupported",
          reason: "\u6B64\u89D2\u8272\u62A5\u544A\u5C1A\u672A\u63A5\u5165\u6807\u51C6\u8BBE\u7F6E\u6C42\u89E3\u3002",
          revision: branch.baseRevision
        };
    }
    return {
      status: "ready",
      input: {
        playerCount: workspace.playerCount,
        facts,
        tokenFacts,
        query: workspace.query,
        reports: mapped,
        ...nightOnePoisoner ? { nightOnePoisoner } : {},
        timeoutMs: 5e3
      },
      sourceIds: [...new Set(sourceIds)],
      revision: branch.baseRevision
    };
  }
  function prepareStandardObservedQuery(workspace) {
    const base = prepareStandardSetupQuery(workspace, true, true);
    if (base.status !== "ready") return base;
    const branch = workspace.branches.find(
      (item) => item.id === workspace.activeBranchId
    );
    const current = visibleStandardEvents(
      workspace,
      workspace.perspectiveSeat,
      branch.baseRevision
    );
    const physical = current.filter(
      (event) => [
        "nomination",
        "vote",
        "execution",
        "death",
        "slayer",
        "winner",
        "phase_closed"
      ].includes(event.payload.kind)
    );
    const historical = new Map(
      workspace.events.filter((event) => event.revision <= branch.baseRevision).map((event) => [event.id, event])
    );
    const originalRevision = (event) => {
      let original = event;
      while (original.correctsEventId !== void 0) {
        const previous = historical.get(original.correctsEventId);
        if (!previous || previous.revision >= original.revision)
          throw new Error("\u7EA0\u6B63\u8BB0\u5F55\u7684\u539F\u8BB0\u5F55\u6216\u987A\u5E8F\u65E0\u6548\u3002");
        original = previous;
      }
      return original.revision;
    };
    physical.sort(
      (left, right) => originalRevision(left) - originalRevision(right)
    );
    const fail = (reason) => ({
      status: "unsupported",
      reason,
      revision: branch.baseRevision
    });
    if (!physical.length) return fail("\u5F53\u524D\u4FEE\u8BA2\u6CA1\u6709\u53EF\u4F9B\u8DE8\u9636\u6BB5\u641C\u7D22\u7684\u516C\u5F00\u4E8B\u5B9E\u3002");
    if (physical.some((event) => !event.occurredAt))
      return fail("\u8DE8\u9636\u6BB5\u4E8B\u5B9E\u9700\u8981\u660E\u786E\u65F6\u95F4\u3002");
    const last = physical.reduce(
      (max, event) => Math.max(
        max,
        event.occurredAt.cycle * 2 + (event.occurredAt.phase === "day" ? 1 : 0)
      ),
      0
    );
    const finalCycle = Math.floor(last / 2);
    const finalPhase = last % 2 === 1 ? "day" : "night";
    const phases = [];
    for (let cycle = 1; cycle <= finalCycle; cycle++) {
      const night = physical.filter(
        (event) => event.occurredAt?.phase === "night" && event.occurredAt.cycle === cycle
      );
      if (night.some(
        (event) => event.payload.kind !== "death" && event.payload.kind !== "winner" && event.payload.kind !== "phase_closed"
      ))
        return fail(`N${cycle}\u5305\u542B\u5C1A\u672A\u63A5\u5165\u7684\u884C\u52A8\u3002`);
      const nightCloses = night.filter(
        (event) => event.payload.kind === "phase_closed"
      );
      if (nightCloses.length > 1 || cycle > 1 && nightCloses.length !== 1)
        return fail(
          `N${cycle}\u6B7B\u4EA1\u8BB0\u5F55\u5C1A\u672A\u786E\u8BA4\u5B8C\u6574\u3002\u8BF7\u5728\u201C\u8BB0\u5F55\u201D\u4E2D\u786E\u8BA4\u672C\u9636\u6BB5\u8BB0\u5F55\u5B8C\u6574\uFF08\u6216\u7528 close deaths @N${cycle}\uFF09\u3002`
        );
      const nightWinners = night.flatMap(
        (event) => event.payload.kind === "winner" ? [event.payload.team] : []
      );
      if (nightWinners.length > 1) return fail(`N${cycle}\u5B58\u5728\u91CD\u590D\u80DC\u8D1F\u8BB0\u5F55\u3002`);
      const nightDeaths = night.flatMap(
        (event) => event.payload.kind === "death" ? [event.payload.seat] : []
      );
      if (cycle === 1 && nightDeaths.length) return fail("\u9996\u591C\u4E0D\u80FD\u6709\u6B7B\u4EA1\u8BB0\u5F55\u3002");
      if (new Set(nightDeaths).size !== nightDeaths.length)
        return fail(`N${cycle}\u5B58\u5728\u91CD\u590D\u6B7B\u4EA1\u8BB0\u5F55\u3002`);
      phases.push({
        kind: "night",
        cycle,
        deaths: nightDeaths,
        ...nightWinners[0] ? { winner: nightWinners[0] } : {}
      });
      if (cycle === finalCycle && finalPhase === "night") break;
      const day = physical.filter(
        (event) => event.occurredAt?.phase === "day" && event.occurredAt.cycle === cycle
      );
      const dayCloses = day.filter(
        (event) => event.payload.kind === "phase_closed"
      );
      if (dayCloses.length !== 2 || !dayCloses.some(
        (event) => event.payload.kind === "phase_closed" && event.payload.channel === "actions"
      ) || !dayCloses.some(
        (event) => event.payload.kind === "phase_closed" && event.payload.channel === "deaths"
      ))
        return fail(
          `D${cycle}\u884C\u52A8\u4E0E\u6B7B\u4EA1\u8BB0\u5F55\u5C1A\u672A\u786E\u8BA4\u5B8C\u6574\u3002\u8BF7\u5728\u201C\u8BB0\u5F55\u201D\u4E2D\u786E\u8BA4\u672C\u9636\u6BB5\u8BB0\u5F55\u5B8C\u6574\uFF08\u6216\u7528 close actions @D${cycle} \u548C close deaths @D${cycle}\uFF09\u3002`
        );
      const votes = day.filter((event) => event.payload.kind === "vote");
      const nominations = day.filter(
        (event) => event.payload.kind === "nomination"
      );
      const nominationIds = new Set(nominations.map((event) => event.id));
      if (nominations.some(
        (nomination) => votes.filter(
          (vote) => vote.payload.kind === "vote" && vote.payload.nominationId === nomination.id
        ).length > 1
      ) || votes.some(
        (vote) => vote.payload.kind === "vote" && !nominationIds.has(vote.payload.nominationId ?? "")
      ))
        return fail(`D${cycle}\u6295\u7968\u4E0E\u63D0\u540D\u7684\u5F15\u7528\u4E0D\u5B8C\u6574\u6216\u91CD\u590D\u3002`);
      const events = [];
      for (const event of day) {
        const payload = event.payload;
        if (payload.kind === "nomination") {
          const vote = votes.find(
            (item) => item.payload.kind === "vote" && item.payload.nominationId === event.id
          );
          if (vote && day.slice(day.indexOf(event) + 1, day.indexOf(vote)).some(
            (item) => ["slayer", "nomination", "execution", "death", "winner"].includes(
              item.payload.kind
            )
          ))
            return fail(
              `D${cycle}\u63D0\u540D\u4E0E\u8BA1\u7968\u4E4B\u95F4\u5B58\u5728\u5176\u4ED6\u516C\u5F00\u884C\u52A8\uFF0C\u6682\u4E0D\u652F\u6301\u8FD9\u7C7B\u4EA4\u9519\u987A\u5E8F\uFF1B\u8BF7\u6838\u5BF9\u5E76\u4FDD\u7559\u5B9E\u9645\u53D1\u751F\u987A\u5E8F\u3002`
            );
          events.push({
            kind: "nomination",
            nominator: payload.nominator,
            nominee: payload.nominee,
            votes: vote?.payload.kind === "vote" ? vote.payload.voters : []
          });
        } else if (payload.kind === "slayer") {
          events.push({
            kind: "slayer",
            actor: payload.actor,
            target: payload.target
          });
        }
      }
      const deaths = day.flatMap(
        (event) => event.payload.kind === "death" ? [event.payload.seat] : []
      );
      const dayWinners = day.flatMap(
        (event) => event.payload.kind === "winner" ? [event.payload.team] : []
      );
      const executions = day.flatMap(
        (event) => event.payload.kind === "execution" ? [event.payload.seat] : []
      );
      if (new Set(deaths).size !== deaths.length || executions.length > 1 || dayWinners.length > 1)
        return fail(`D${cycle}\u5B58\u5728\u91CD\u590D\u6B7B\u4EA1\u6216\u5904\u51B3\u8BB0\u5F55\u3002`);
      phases.push({
        kind: "day",
        cycle,
        events,
        deaths,
        executedSeat: executions[0] ?? null,
        ...dayWinners[0] ? { winner: dayWinners[0] } : {}
      });
    }
    const reportEvents = /* @__PURE__ */ new Map();
    for (const premise of workspace.hypotheses.filter(
      (item) => branch.assumptionIds.includes(item.id) && (item.kind === "report_accurate" || item.kind === "ability_active")
    )) {
      if (premise.kind !== "report_accurate" && premise.kind !== "ability_active")
        continue;
      const event = current.find((item) => item.id === premise.eventId);
      if (!event || event.occurredAt?.phase !== "night" || event.occurredAt.cycle === 1)
        continue;
      const report = reportEvents.get(event.id) ?? {
        event,
        acceptedMessage: false,
        abilityActive: false
      };
      if (premise.kind === "report_accurate") report.acceptedMessage = true;
      else report.abilityActive = true;
      reportEvents.set(event.id, report);
    }
    const laterReports = [];
    for (const {
      event,
      acceptedMessage,
      abilityActive
    } of reportEvents.values()) {
      const payload = event.payload;
      if (payload.kind !== "claim" || payload.claimKind !== "ability_report")
        continue;
      const cycle = event.occurredAt.cycle;
      if (cycle > finalCycle) return fail(`N${cycle}\u62A5\u544A\u6240\u5728\u591C\u665A\u5C1A\u672A\u5C01\u95ED\u3002`);
      const common = {
        cycle,
        speaker: payload.speaker,
        acceptedMessage,
        abilityActive
      };
      if (payload.role === "Undertaker" && isRole(payload.value)) {
        laterReports.push({
          kind: "undertaker",
          seenRole: payload.value,
          ...common
        });
      } else if (payload.role === "Ravenkeeper" && payload.targets?.length === 1 && isRole(payload.value)) {
        laterReports.push({
          kind: "ravenkeeper",
          target: payload.targets[0],
          seenRole: payload.value,
          ...common
        });
      } else if (payload.role === "Empath" && typeof payload.value === "number") {
        laterReports.push({ kind: "empath", count: payload.value, ...common });
      } else if (payload.role === "Fortune Teller" && payload.targets?.length === 2 && typeof payload.value === "boolean") {
        laterReports.push({
          kind: "fortune_teller",
          targets: [payload.targets[0], payload.targets[1]],
          yes: payload.value,
          ...common
        });
      } else return fail("\u6B64\u8DE8\u591C\u89D2\u8272\u62A5\u544A\u5C1A\u672A\u63A5\u5165\u52A8\u6001\u67E5\u8BE2\u3002");
    }
    const phaseRoleFacts = [];
    for (const premise of workspace.hypotheses.filter(
      (h) => branch.assumptionIds.includes(h.id)
    )) {
      if (premise.kind !== "role_at_phase") continue;
      const index = 2 * (premise.occurredAt.cycle - 1) + (premise.occurredAt.phase === "day" ? 1 : 0);
      if (index >= phases.length)
        return fail(
          `${premise.occurredAt.phase === "night" ? "N" : "D"}${premise.occurredAt.cycle}\u5F53\u524D\u89D2\u8272\u58F0\u79F0\u6240\u5728\u9636\u6BB5\u5C1A\u672A\u786E\u8BA4\u5B8C\u6574\u3002`
        );
      phaseRoleFacts.push({
        seat: premise.seat,
        role: premise.role,
        phaseIndex: index
      });
    }
    const acceptedReports = /* @__PURE__ */ new Set();
    for (const report of laterReports) {
      if (!report.acceptedMessage || !report.abilityActive) continue;
      const key = `${report.cycle}:${report.kind}:${report.speaker}`;
      if (acceptedReports.has(key))
        return fail(`N${report.cycle}\u540C\u4E00\u89D2\u8272\u80FD\u529B\u53EA\u80FD\u91C7\u7EB3\u4E00\u6B21\u5B9E\u9645\u5C55\u793A\u7684\u4FE1\u606F\u3002`);
      acceptedReports.add(key);
    }
    return {
      status: "ready",
      input: {
        ...base.input,
        phases,
        laterReports,
        phaseRoleFacts,
        ...workspace.query.stage === "current" ? {
          currentQuery: {
            seat: workspace.query.seat,
            role: workspace.query.role
          }
        } : {},
        timeoutMs: 7e3,
        maxWorlds: 500,
        maxHistories: 5e3
      },
      sourceIds: [
        .../* @__PURE__ */ new Set([...base.sourceIds, ...physical.map((event) => event.id)])
      ],
      revision: branch.baseRevision
    };
  }
  function validateStandardWorkspace(value) {
    if (!isRecord(value) || value.schemaVersion !== 2 && value.schemaVersion !== 3 && value.schemaVersion !== 4 && value.schemaVersion !== 5 || value.profile !== "standard")
      throw new Error("\u4E0D\u662F\u6807\u51C6\u5BF9\u5C40\u5DE5\u4F5C\u533A\u5BFC\u51FA\u6570\u636E\u3002");
    const count = value.playerCount;
    if (!Number.isInteger(count) || Number(count) < 7 || Number(count) > 15 || !nonempty(value.gameId) || !nonempty(value.title) || !validSeat2(value.perspectiveSeat, Number(count)) || !validSeat2(value.selectedSeat, Number(count)) || value.recordingTime !== void 0 && !validTime(value.recordingTime) || !isRecord(value.query) || !validSeat2(value.query.seat, Number(count)) || !isRole(value.query.role) || value.query.stage !== void 0 && value.query.stage !== "initial" && value.query.stage !== "current" || !Array.isArray(value.events) || !Array.isArray(value.hypotheses) || !Array.isArray(value.branches) || !nonempty(value.activeBranchId))
      throw new Error("\u6807\u51C6\u5BF9\u5C40\u7684\u4EBA\u6570\u3001\u89C6\u89D2\u6216\u67E5\u8BE2\u5B57\u6BB5\u65E0\u6548\u3002");
    const eventsById = /* @__PURE__ */ new Map();
    const retracted = /* @__PURE__ */ new Set();
    for (const [index, raw] of value.events.entries()) {
      if (!isRecord(raw) || !nonempty(raw.id) || eventsById.has(raw.id) || raw.revision !== index + 1 || !nonempty(raw.rawEntryId) || !nonempty(raw.rawText) || !validDate(raw.recordedAt) || !Array.isArray(raw.sourceSpan) || raw.sourceSpan.length !== 2 || !Number.isInteger(raw.sourceSpan[0]) || !Number.isInteger(raw.sourceSpan[1]) || raw.sourceSpan[0] < 0 || raw.sourceSpan[1] < raw.sourceSpan[0] || raw.sourceSpan[1] > raw.rawText.length || raw.occurredAt !== void 0 && !validTime(raw.occurredAt) || !isRecord(raw.payload) || raw.visibility !== "public" && raw.visibility !== "private" || raw.visibility === "private" && (!validSeat2(raw.ownerSeat, Number(count)) || raw.ownerSeat !== value.perspectiveSeat) || raw.visibility === "public" && raw.ownerSeat !== void 0)
        throw new Error(`\u7B2C${index + 1}\u6761\u6807\u51C6\u5BF9\u5C40\u4E8B\u4EF6\u65E0\u6548\u3002`);
      const payload = raw.payload;
      const atPhase = (phase) => validTime(raw.occurredAt) && raw.occurredAt.phase === phase;
      const pair = (target) => Array.isArray(target) && target.length === 2 && target.every((seat) => validSeat2(seat, Number(count))) && target[0] !== target[1];
      let valid = false;
      switch (payload.kind) {
        case "claim":
          valid = validSeat2(payload.speaker, Number(count)) && isRole(payload.role);
          if (payload.claimKind === "role") {
            valid &&= payload.targets === void 0 && payload.value === void 0 && (payload.identityStage === void 0 || payload.identityStage === "initial" || payload.identityStage === "current" && validTime(raw.occurredAt));
          } else if (payload.claimKind === "ability_report") {
            valid &&= atPhase("night") && payload.identityStage === void 0;
            if (payload.role === "Washerwoman" || payload.role === "Librarian" || payload.role === "Investigator") {
              valid &&= payload.role === "Librarian" && payload.value === 0 && payload.targets === void 0 || pair(payload.targets) && isRole(payload.value) && ROLE_TEAM[payload.value] === (payload.role === "Washerwoman" ? "townsfolk" : payload.role === "Librarian" ? "outsider" : "minion");
            } else if (payload.role === "Chef" || payload.role === "Empath") {
              valid &&= Number.isInteger(payload.value) && Number(payload.value) >= 0 && Number(payload.value) <= (payload.role === "Empath" ? 2 : Number(count)) && payload.targets === void 0;
            } else if (payload.role === "Fortune Teller") {
              valid &&= pair(payload.targets) && typeof payload.value === "boolean";
            } else if (payload.role === "Undertaker") {
              valid &&= isRole(payload.value) && payload.targets === void 0;
            } else if (payload.role === "Ravenkeeper") {
              valid &&= isRole(payload.value) && Array.isArray(payload.targets) && payload.targets.length === 1 && validSeat2(payload.targets[0], Number(count));
            } else valid = false;
          } else valid = false;
          if (payload.change !== void 0) {
            const change = payload.change;
            const previous = isRecord(change) && nonempty(change.previousId) ? eventsById.get(change.previousId) : void 0;
            valid &&= isRecord(change) && (change.kind === "correction" || change.kind === "changed_claim") && validTime(change.announcedAt) && previous !== void 0 && isRecord(previous.payload) && previous.payload.kind === "claim" && previous.payload.claimKind === payload.claimKind && previous.payload.speaker === payload.speaker && (previous.payload.identityStage ?? "initial") === (payload.identityStage ?? "initial") && previous.visibility === raw.visibility && previous.ownerSeat === raw.ownerSeat && ![...eventsById.values()].some(
              (e) => isRecord(e.payload) && e.payload.kind === "claim" && isRecord(e.payload.change) && e.payload.change.previousId === change.previousId && !retracted.has(e.id)
            ) && (change.kind === "correction" ? retracted.has(change.previousId) : !retracted.has(change.previousId));
            if (valid && isRecord(change) && change.kind === "changed_claim" && (payload.claimKind === "ability_report" || payload.identityStage === "current")) {
              valid &&= validTime(previous.occurredAt) && validTime(raw.occurredAt) && previous.occurredAt.phase === raw.occurredAt.phase && previous.occurredAt.cycle === raw.occurredAt.cycle;
            }
          }
          break;
        case "nomination":
          valid = atPhase("day") && validSeat2(payload.nominator, Number(count)) && validSeat2(payload.nominee, Number(count));
          break;
        case "vote": {
          const nomination = nonempty(payload.nominationId) ? eventsById.get(payload.nominationId) : void 0;
          valid = atPhase("day") && validSeat2(payload.nominee, Number(count)) && Array.isArray(payload.voters) && payload.voters.every(
            (seat) => validSeat2(seat, Number(count))
          ) && new Set(payload.voters).size === payload.voters.length && nomination !== void 0 && !retracted.has(payload.nominationId) && isRecord(nomination.payload) && nomination.payload.kind === "nomination" && nomination.payload.nominee === payload.nominee && validTime(nomination.occurredAt) && validTime(raw.occurredAt) && nomination.occurredAt.phase === "day" && nomination.occurredAt.cycle === raw.occurredAt.cycle && (raw.visibility !== "public" || nomination.visibility === "public");
          break;
        }
        case "execution":
          valid = atPhase("day") && validSeat2(payload.seat, Number(count));
          break;
        case "death":
          valid = validTime(raw.occurredAt) && validSeat2(payload.seat, Number(count));
          break;
        case "winner":
          valid = validTime(raw.occurredAt) && (payload.team === "good" || payload.team === "evil");
          break;
        case "slayer":
          valid = atPhase("day") && validSeat2(payload.actor, Number(count)) && validSeat2(payload.target, Number(count));
          break;
        case "phase_closed":
          valid = validTime(raw.occurredAt) && (payload.channel === "deaths" || atPhase("day") && payload.channel === "actions");
          break;
        case "retraction": {
          const target = nonempty(payload.targetId) ? eventsById.get(payload.targetId) : void 0;
          valid = target !== void 0 && isRecord(target.payload) && target.payload.kind !== "retraction" && !retracted.has(payload.targetId) && nonempty(payload.reason) && raw.visibility === target.visibility && raw.ownerSeat === target.ownerSeat;
          if (valid) retracted.add(payload.targetId);
          break;
        }
      }
      if (!valid) throw new Error(`\u7B2C${index + 1}\u6761\u6807\u51C6\u5BF9\u5C40\u4E8B\u4EF6\u8F7D\u8377\u6216\u5F15\u7528\u65E0\u6548\u3002`);
      if (raw.correctsEventId !== void 0) {
        const previous = nonempty(raw.correctsEventId) ? eventsById.get(raw.correctsEventId) : void 0;
        const ballot = payload.kind === "vote";
        const fact = payload.kind === "death" || payload.kind === "execution";
        const action = payload.kind === "nomination" || payload.kind === "slayer";
        const nomination = ballot && nonempty(payload.nominationId) ? eventsById.get(payload.nominationId) : void 0;
        const previousBallot = previous && isRecord(previous.payload) ? previous.payload : void 0;
        const correctedVoters = payload.voters;
        const reboundBallot = value.schemaVersion === 5 && ballot && previousBallot?.kind === "vote" && nomination?.correctsEventId === previousBallot.nominationId && Array.isArray(previousBallot.voters) && Array.isArray(correctedVoters) && previousBallot.voters.length === correctedVoters.length && previousBallot.voters.every(
          (seat) => correctedVoters.includes(seat)
        );
        if (!(ballot ? value.schemaVersion >= 3 : fact ? value.schemaVersion >= 4 : action && value.schemaVersion === 5) || !previous || !isRecord(previous.payload) || previous.payload.kind !== payload.kind || !retracted.has(raw.correctsEventId) || ballot && (!reboundBallot && (previous.payload.nominee !== payload.nominee || previous.payload.nominationId !== payload.nominationId) || retracted.has(payload.nominationId)) || payload.kind === "nomination" && [...eventsById.values()].some(
          (event) => !retracted.has(event.id) && isRecord(event.payload) && event.payload.kind === "vote" && event.payload.nominationId === raw.correctsEventId
        ) || !validTime(previous.occurredAt) || !validTime(raw.occurredAt) || previous.occurredAt.phase !== raw.occurredAt.phase || previous.occurredAt.cycle !== raw.occurredAt.cycle || previous.visibility !== raw.visibility || previous.ownerSeat !== raw.ownerSeat || [...eventsById.values()].some(
          (event) => event.correctsEventId === raw.correctsEventId && !retracted.has(event.id)
        ))
          throw new Error(
            `\u7B2C${index + 1}\u6761${ballot ? "\u6295\u7968" : "\u4E8B\u5B9E"}\u7EA0\u6B63\u7684\u539F\u8BB0\u5F55\u3001\u9636\u6BB5\u6216\u5F15\u7528\u65E0\u6548\u3002`
          );
      }
      eventsById.set(raw.id, raw);
    }
    const hypothesisIds = /* @__PURE__ */ new Set();
    for (const [index, raw] of value.hypotheses.entries()) {
      if (!isRecord(raw) || !nonempty(raw.id) || hypothesisIds.has(raw.id) || !validDate(raw.createdAt))
        throw new Error(`\u7B2C${index + 1}\u6761\u5047\u8BBE\u65E0\u6548\u3002`);
      if (raw.kind === "actual_role") {
        if (!validSeat2(raw.seat, Number(count)) || !isRole(raw.role))
          throw new Error("\u771F\u5B9E\u89D2\u8272\u5047\u8BBE\u65E0\u6548\u3002");
      } else if (raw.kind === "role_at_phase") {
        if (!validSeat2(raw.seat, Number(count)) || !isRole(raw.role) || !validTime(raw.occurredAt))
          throw new Error("\u9636\u6BB5\u89D2\u8272\u5047\u8BBE\u65E0\u6548\u3002");
      } else if (raw.kind === "seen_token") {
        if (!validSeat2(raw.seat, Number(count)) || !isRole(raw.shownRole))
          throw new Error("\u6240\u89C1\u89D2\u8272token\u5047\u8BBE\u65E0\u6548\u3002");
      } else if (raw.kind === "night_one_poison") {
        if (!validSeat2(raw.poisonerSeat, Number(count)) || !validSeat2(raw.targetSeat, Number(count)))
          throw new Error("\u9996\u591C\u6295\u6BD2\u5047\u8BBE\u65E0\u6548\u3002");
      } else if (raw.kind === "report_accurate" || raw.kind === "ability_active") {
        const event = nonempty(raw.eventId) ? eventsById.get(raw.eventId) : void 0;
        if (!event || !isRecord(event.payload) || event.payload.kind !== "claim" || event.payload.claimKind !== "ability_report")
          throw new Error("\u62A5\u544A\u5047\u8BBE\u5F15\u7528\u4E86\u4E0D\u5B58\u5728\u7684\u80FD\u529B\u62A5\u544A\u3002");
      } else throw new Error("\u672A\u77E5\u5047\u8BBE\u7C7B\u578B\u3002");
      hypothesisIds.add(raw.id);
    }
    const branchIds = /* @__PURE__ */ new Set();
    for (const [index, raw] of value.branches.entries()) {
      if (!isRecord(raw) || !nonempty(raw.id) || branchIds.has(raw.id) || !nonempty(raw.name) || !validDate(raw.createdAt) || !Number.isInteger(raw.baseRevision) || Number(raw.baseRevision) < 0 || Number(raw.baseRevision) > value.events.length || !Array.isArray(raw.assumptionIds) || !raw.assumptionIds.every(
        (id) => typeof id === "string" && hypothesisIds.has(id)
      ) || new Set(raw.assumptionIds).size !== raw.assumptionIds.length || raw.parentId !== void 0 && !branchIds.has(raw.parentId))
        throw new Error(`\u7B2C${index + 1}\u4E2A\u6807\u51C6\u5BF9\u5C40\u5206\u652F\u65E0\u6548\u3002`);
      branchIds.add(raw.id);
    }
    if (!branchIds.has(value.activeBranchId))
      throw new Error("\u6D3B\u52A8\u5206\u652F\u5F15\u7528\u65E0\u6548\u3002");
    return value;
  }

  // src/core/conflict.ts
  function withAssumptions(workspace, assumptionIds) {
    return {
      ...workspace,
      branches: workspace.branches.map(
        (b) => b.id === workspace.activeBranchId ? { ...b, assumptionIds } : b
      )
    };
  }
  async function analyzeStandardConflict(workspace, oracle, options = {}, onProgress) {
    const branch = workspace.branches.find(
      (b) => b.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    const started = performance.now();
    const budget = Math.max(0, Math.min(options.budgetMs ?? 15e3, 6e4));
    const maxChecks = Math.max(0, Math.min(options.maxChecks ?? 40, 200));
    let checks = 0;
    let core = [...new Set(branch.assumptionIds)];
    let rulesetHash;
    let proof = [];
    const finish = (status, reason) => ({
      status,
      assumptionIds: [...core],
      checks,
      reason,
      rulesetHash,
      deletionWitnesses: [...proof]
    });
    const check = async (ids) => {
      const remaining = budget - (performance.now() - started);
      if (checks >= maxChecks || remaining <= 0)
        return {
          kind: "budget",
          reason: checks >= maxChecks ? "\u5DF2\u8FBE\u5230\u68C0\u67E5\u6B21\u6570\u4E0A\u9650" : "\u5DF2\u8FBE\u5230\u5B9A\u4F4D\u65F6\u95F4\u9884\u7B97"
        };
      checks++;
      try {
        const answer = await oracle(
          withAssumptions(workspace, ids),
          Math.max(
            1,
            Math.floor(Math.min(remaining, options.checkTimeoutMs ?? 1500))
          )
        );
        if (rulesetHash && rulesetHash !== answer.rulesetHash)
          return {
            kind: "unknown",
            reason: "\u89C4\u5219\u7248\u672C\u53D1\u751F\u53D8\u5316\uFF0C\u4E0D\u80FD\u5408\u5E76\u9A8C\u8BC1\u7ED3\u679C"
          };
        rulesetHash = answer.rulesetHash;
        if (answer.status === "unsat" && answer.classification === "inconsistent")
          return { kind: "unsat" };
        const witness = answer.yes ?? answer.no;
        if (witness) return { kind: "sat", witness };
        return {
          kind: "unknown",
          reason: answer.unknownReason === "time_budget" ? "\u5355\u6B21\u68C0\u67E5\u8FBE\u5230\u65F6\u95F4\u9884\u7B97" : answer.unknownReason === "candidate_limit" ? "\u9690\u85CF\u884C\u52A8\u6216\u5019\u9009\u641C\u7D22\u8FBE\u5230\u4E0A\u9650" : answer.unknownReason === "unsupported_replay" ? "\u5B58\u5728\u5C1A\u672A\u652F\u6301\u7684\u89C4\u5219\u4EA4\u4E92" : "\u90E8\u5206\u68C0\u67E5\u7ED3\u679C\u672A\u77E5\u6216\u672A\u627E\u5230\u53EF\u91CD\u653E\u89C1\u8BC1"
        };
      } catch (error) {
        return {
          kind: "unknown",
          reason: error instanceof Error ? error.message : "\u68C0\u67E5\u672A\u5B8C\u6210"
        };
      }
    };
    const baseline = await check(core);
    if (baseline.kind === "sat") return finish("not_conflicting");
    if (baseline.kind !== "unsat") return finish("unconfirmed", baseline.reason);
    onProgress?.(finish("partial", "\u5B9A\u4F4D\u4ECD\u5728\u8FDB\u884C\uFF0C\u6700\u5C0F\u6027\u5C1A\u672A\u9A8C\u8BC1\u3002"));
    let index = 0;
    let unknownReason;
    while (index < core.length) {
      const id = core[index];
      const reduced = core.filter((item) => item !== id);
      const answer = await check(reduced);
      if (answer.kind === "budget") return finish("partial", answer.reason);
      if (answer.kind === "unsat") {
        core = reduced;
        index = 0;
        proof = [];
        unknownReason = void 0;
      } else {
        if (answer.kind === "sat")
          proof.push({ assumptionId: id, witness: answer.witness });
        else unknownReason = answer.reason;
        index++;
      }
      onProgress?.(finish("partial", "\u5B9A\u4F4D\u4ECD\u5728\u8FDB\u884C\uFF0C\u6700\u5C0F\u6027\u5C1A\u672A\u9A8C\u8BC1\u3002"));
    }
    if (!core.length)
      return finish(
        "fixed_conflict",
        "\u4E0D\u91C7\u7EB3\u4EFB\u4F55\u5047\u8BBE\u4ECD\u7136\u51B2\u7A81\uFF0C\u8BF7\u6838\u5BF9\u56FA\u5B9A\u4E8B\u5B9E\u8BB0\u5F55\u3002"
      );
    return finish(unknownReason ? "partial" : "minimal", unknownReason);
  }

  // src/core/factHistory.ts
  var order = (time) => (time.cycle - 1) * 2 + (time.phase === "day" ? 1 : 0);
  var limit = (value, fallback, max) => Number.isFinite(value) ? Math.max(0, Math.min(value, max)) : fallback;
  async function analyzeFactHistory(workspace, solvers, options = {}, onProgress) {
    const branch = workspace.branches.find(
      (b) => b.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    const assumptionIds = options.includeAssumptions === false ? [] : [...branch.assumptionIds];
    const snapshot = {
      ...workspace,
      query: { ...workspace.query, stage: "initial" },
      branches: workspace.branches.map(
        (b) => b.id === branch.id ? { ...b, assumptionIds } : b
      )
    };
    const visible = visibleStandardEvents(
      snapshot,
      snapshot.perspectiveSeat,
      branch.baseRevision
    );
    const started = performance.now();
    const budget = limit(options.budgetMs, 3e4, 6e4);
    const maxChecks = Math.floor(limit(options.maxChecks, 40, 200));
    const steps = /* @__PURE__ */ new Map();
    let checks = 0;
    let rulesetHash;
    let boundary;
    let previous;
    let witness;
    let sources = [];
    const finish = (status, reason) => ({
      status,
      revision: branch.baseRevision,
      assumptionIds: [...assumptionIds],
      checks,
      complete: status === "located" || status === "compatible",
      rulesetHash,
      boundary: boundary && { ...boundary },
      sourceIds: [...sources],
      previous,
      witness,
      reason,
      steps: [...steps.values()].sort((a, b) => order(a.time) - order(b.time)).map((step) => ({
        ...step,
        time: { ...step.time },
        sourceIds: [...step.sourceIds]
      }))
    });
    const check = async (solve) => {
      const remaining = budget - (performance.now() - started);
      if (remaining <= 0 || checks >= maxChecks)
        return {
          kind: "unknown",
          reason: "\u9636\u6BB5\u5B9A\u4F4D\u8FBE\u5230\u65F6\u95F4\u6216\u68C0\u67E5\u6B21\u6570\u9884\u7B97\u3002"
        };
      checks++;
      try {
        const answer = await solve(
          Math.max(
            1,
            Math.floor(
              Math.min(remaining, limit(options.checkTimeoutMs, 5e3, 6e4))
            )
          )
        );
        if (rulesetHash && rulesetHash !== answer.rulesetHash)
          return {
            kind: "unknown",
            reason: "\u89C4\u5219\u7248\u672C\u53D1\u751F\u53D8\u5316\uFF0C\u4E0D\u80FD\u5408\u5E76\u9636\u6BB5\u8BC1\u636E\u3002",
            changedRules: true
          };
        rulesetHash = answer.rulesetHash;
        if (answer.status === "unsat" && answer.classification === "inconsistent")
          return { kind: "conflict" };
        const proof = answer.yes ?? answer.no;
        if (proof) return { kind: "compatible", witness: proof };
        return {
          kind: "unknown",
          reason: answer.unknownReason === "unsupported_replay" ? "\u5B58\u5728\u5C1A\u672A\u652F\u6301\u7684\u89C4\u5219\u4EA4\u4E92\u3002" : answer.unknownReason === "candidate_limit" ? "\u5019\u9009\u6216\u9690\u85CF\u884C\u52A8\u641C\u7D22\u8FBE\u5230\u4E0A\u9650\u3002" : "\u672C\u6B21\u68C0\u67E5\u672A\u5B8C\u6210\uFF0C\u5C1A\u672A\u627E\u5230\u53EF\u91CD\u653E\u89C1\u8BC1\u3002"
        };
      } catch (error) {
        return {
          kind: "unknown",
          reason: error instanceof Error ? error.message : "\u672C\u6B21\u9636\u6BB5\u68C0\u67E5\u672A\u5B8C\u6210\u3002"
        };
      }
    };
    const physical = visible.some((e) => e.payload.kind !== "claim");
    if (!physical) {
      const prepared2 = prepareStandardSetupQuery(snapshot);
      if (prepared2.status !== "ready")
        return finish("not_ready", prepared2.reason);
      const answer = await check(
        (timeoutMs) => solvers.setup({ ...prepared2.input, timeoutMs })
      );
      if (answer.kind === "compatible") {
        witness = answer.witness;
        return finish(
          "compatible",
          "\u5F53\u524D\u6CA1\u6709\u65E5\u591C\u4E8B\u4EF6\uFF1B\u8BBE\u7F6E\u4E0E\u672C\u6B21\u4FDD\u7559\u524D\u63D0\u5DF2\u6709\u517C\u5BB9\u89C1\u8BC1\u3002"
        );
      }
      if (answer.kind === "conflict")
        return finish(
          "partial",
          "\u5C1A\u65E0\u65E5\u591C\u4E8B\u4EF6\uFF0C\u51B2\u7A81\u6765\u81EA\u8BBE\u7F6E\u6216\u624B\u52A8\u524D\u63D0\uFF0C\u8BF7\u4F7F\u7528\u524D\u63D0\u51B2\u7A81\u5B9A\u4F4D\u3002"
        );
      return finish("unknown", answer.reason);
    }
    const prepared = prepareStandardObservedQuery(snapshot);
    if (prepared.status !== "ready") return finish("not_ready", prepared.reason);
    const input = prepared.input;
    const sourcesAt = (time) => visible.filter(
      (e) => prepared.sourceIds.includes(e.id) && e.occurredAt && order(e.occurredAt) === order(time)
    ).map((e) => e.id);
    const inspect = async (length) => {
      const last = input.phases[length - 1];
      const time = { phase: last.kind, cycle: last.cycle };
      const answer = await check(
        (timeoutMs) => solvers.observed({
          ...input,
          phases: input.phases.slice(0, length),
          laterReports: input.laterReports?.filter((r) => r.cycle <= time.cycle),
          phaseRoleFacts: input.phaseRoleFacts?.filter(
            (f) => f.phaseIndex < length
          ),
          timeoutMs
        })
      );
      const step = {
        time,
        status: answer.kind,
        sourceIds: sourcesAt(time),
        ...answer.kind === "unknown" ? { reason: answer.reason } : {}
      };
      if (!(answer.kind === "unknown" && "changedRules" in answer))
        steps.set(length - 1, step);
      if (answer.kind === "conflict") {
        boundary = time;
        sources = step.sourceIds;
      }
      return { time, answer };
    };
    const full = await inspect(input.phases.length);
    if (full.answer.kind === "compatible") {
      witness = full.answer.witness;
      return finish(
        "compatible",
        "\u5B8C\u6574\u8BB0\u5F55\u5DF2\u6709\u4E00\u79CD\u517C\u5BB9\u89E3\u91CA\uFF1B\u8FD9\u4E0D\u8BC1\u660E\u6240\u6709\u8BB0\u5F55\u6216\u58F0\u79F0\u771F\u5B9E\u3002"
      );
    }
    onProgress?.(
      finish(boundary ? "partial" : "unknown", "\u6B63\u5728\u68C0\u67E5\u66F4\u65E9\u7684\u5B8C\u6574\u9636\u6BB5\u3002")
    );
    let unresolved;
    for (let length = 1; length <= input.phases.length; length++) {
      if (length < input.phases.length && (budget - (performance.now() - started) <= 0 || checks >= maxChecks))
        return finish(
          boundary ? "partial" : "unknown",
          "\u9636\u6BB5\u5B9A\u4F4D\u8FBE\u5230\u9884\u7B97\uFF0C\u4FDD\u7559\u5DF2\u786E\u8BA4\u7684\u8BC1\u636E\uFF1B\u6700\u65E9\u8FB9\u754C\u5C1A\u672A\u9A8C\u8BC1\u3002"
        );
      const current = length === input.phases.length ? full : await inspect(length);
      const answer = current.answer;
      if (answer.kind === "conflict")
        return finish(
          unresolved ? "partial" : "located",
          unresolved ? `\u622A\u81F3${current.time.phase === "day" ? "D" : "N"}${current.time.cycle}\u7684\u8BB0\u5F55\u5DF2\u786E\u8BA4\u51B2\u7A81\uFF0C\u4F46\u66F4\u65E9\u9636\u6BB5\u4ECD\u6709\u672A\u77E5\uFF1A${unresolved}` : "\u6B64\u524D\u6BCF\u4E2A\u5B8C\u6574\u9636\u6BB5\u5747\u6709\u517C\u5BB9\u89C1\u8BC1\uFF1B\u52A0\u5165\u672C\u9636\u6BB5\u540E\u9996\u6B21\u786E\u8BA4\u51B2\u7A81\u3002\u8BF7\u7ED3\u5408\u6B64\u524D\u8BB0\u5F55\u6838\u5BF9\u672C\u9636\u6BB5\u6765\u6E90\uFF0C\u8FD9\u4E0D\u662F\u6765\u6E90\u7EA7\u6700\u5C0F\u51B2\u7A81\u96C6\u3002"
        );
      if (answer.kind === "compatible")
        previous = { time: current.time, witness: answer.witness };
      else {
        if ("changedRules" in answer)
          return finish(boundary ? "partial" : "unknown", answer.reason);
        unresolved ??= answer.reason;
      }
      onProgress?.(
        finish(boundary ? "partial" : "unknown", "\u6B63\u5728\u68C0\u67E5\u66F4\u65E9\u7684\u5B8C\u6574\u9636\u6BB5\u3002")
      );
    }
    return finish("unknown", unresolved ?? "\u5B8C\u6574\u5386\u53F2\u7684\u68C0\u67E5\u672A\u5B8C\u6210\u3002");
  }

  // src/core/standardHistory.ts
  var phaseIndex = (time) => 2 * (time.cycle - 1) + (time.phase === "day" ? 1 : 0);
  var samePhase = (a, b) => !!a && !!b && phaseIndex(a) === phaseIndex(b);
  var activeRevision = (w) => w.branches.find((b) => b.id === w.activeBranchId).baseRevision;
  var visibleAtBranch = (w) => visibleStandardEvents(w, w.perspectiveSeat, activeRevision(w));
  function currentStandardClaims(events, history = events) {
    const byId = new Map(history.map((e) => [e.id, e]));
    const superseded = /* @__PURE__ */ new Set();
    for (const event of events) {
      let payload = event.payload;
      while (payload.kind === "claim" && payload.change && !superseded.has(payload.change.previousId)) {
        const previousId = payload.change.previousId;
        superseded.add(previousId);
        const previous = byId.get(previousId);
        if (!previous) break;
        payload = previous.payload;
      }
    }
    return events.filter(
      (e, index) => e.payload.kind === "claim" && !superseded.has(e.id) && (e.payload.claimKind !== "role" || !events.slice(index + 1).some(
        (later) => later.payload.kind === "claim" && later.payload.claimKind === "role" && e.payload.kind === "claim" && later.payload.speaker === e.payload.speaker && (later.payload.identityStage ?? "initial") === (e.payload.identityStage ?? "initial") && (e.payload.identityStage !== "current" || samePhase(e.occurredAt, later.occurredAt))
      ))
    );
  }
  function requireLatestRevision(w) {
    requireLatestStandardRevision(w);
  }
  function nominationVoteSources(workspace, nominationId) {
    return visibleAtBranch(workspace).filter(
      (event) => event.payload.kind === "vote" && event.payload.nominationId === nominationId
    );
  }
  function correctStandardAction(workspace, eventId, payload, confirmedVoteIds = []) {
    requireLatestRevision(workspace);
    const source = visibleAtBranch(workspace).find(
      (event) => event.id === eventId
    );
    if (!source || source.occurredAt?.phase !== "day" || source.payload.kind !== "nomination" && source.payload.kind !== "slayer")
      throw new Error("\u5F85\u7EA0\u6B63\u7684\u63D0\u540D\u6216\u730E\u624B\u884C\u52A8\u5DF2\u64A4\u56DE\u6216\u5728\u5F53\u524D\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\u3002");
    if (payload.kind !== source.payload.kind)
      throw new Error("\u7EA0\u6B63\u5FC5\u987B\u4FDD\u6301\u539F\u8BB0\u5F55\u7C7B\u578B\u3002");
    const seats2 = payload.kind === "nomination" ? [payload.nominator, payload.nominee] : [payload.actor, payload.target];
    if (seats2.some(
      (seat) => !Number.isInteger(seat) || seat < 1 || seat > workspace.playerCount
    ))
      throw new Error("\u7EA0\u6B63\u7684\u73A9\u5BB6\u5EA7\u4F4D\u65E0\u6548\u3002");
    if (payload.kind === "nomination" && source.payload.kind === "nomination" && payload.nominator === source.payload.nominator && payload.nominee === source.payload.nominee || payload.kind === "slayer" && source.payload.kind === "slayer" && payload.actor === source.payload.actor && payload.target === source.payload.target)
      return workspace;
    const ballots = payload.kind === "nomination" ? nominationVoteSources(workspace, source.id) : [];
    const allBallots = activeEvents(workspace.events).filter(
      (event) => event.payload.kind === "vote" && event.payload.nominationId === source.id
    );
    if (payload.kind === "nomination" && allBallots.length !== ballots.length)
      throw new Error("\u8BE5\u63D0\u540D\u6709\u5173\u8054\u8BB0\u5F55\u5728\u5F53\u524D\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\uFF0C\u4E0D\u80FD\u5728\u6B64\u89C6\u89D2\u7EA0\u6B63\u3002");
    if (new Set(confirmedVoteIds).size !== confirmedVoteIds.length || confirmedVoteIds.length !== ballots.length || ballots.some((vote) => !confirmedVoteIds.includes(vote.id)))
      throw new Error(
        "\u8BF7\u5148\u6838\u5BF9\u5E76\u786E\u8BA4\u5168\u90E8\u5173\u8054\u6295\u7968\uFF1B\u4E3E\u624B\u540D\u5355\u4F1A\u4FDD\u7559\uFF0C\u6295\u7968\u5C06\u91CD\u65B0\u5173\u8054\u5230\u7EA0\u6B63\u540E\u7684\u63D0\u540D\u3002"
      );
    let next = workspace;
    for (const vote of ballots)
      next = retractStandardEvent(
        next,
        vote.id,
        "\u63D0\u540D\u7EA0\u6B63\uFF1A\u4FDD\u7559\u539F\u6295\u7968\u4F4D\u7F6E\u548C\u540D\u5355\uFF0C\u91CD\u65B0\u5173\u8054\u5DF2\u6838\u5BF9\u7684\u63D0\u540D\u3002"
      );
    next = retractStandardEvent(
      next,
      source.id,
      "\u884C\u52A8\u7EA0\u6B63\uFF1A\u4FDD\u7559\u539F\u8BB0\u5F55\u548C\u53D1\u751F\u4F4D\u7F6E\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u672C\u65E5\u5B8C\u6574\u6027\u3002"
    );
    const noun = payload.kind === "nomination" ? "\u63D0\u540D" : "\u730E\u624B\u884C\u52A8";
    const label = `${noun}\u7EA0\u6B63\uFF1A${eventLabel({ payload })} \xB7 ${timeLabel(source.occurredAt)}`;
    next = commitStandardDrafts(
      next,
      label,
      [
        {
          payload: { ...payload },
          occurredAt: source.occurredAt,
          correctsEventId: source.id,
          label,
          sourceSpan: [0, label.length]
        }
      ],
      source.visibility
    );
    const nominationId = next.events.at(-1).id;
    if (payload.kind === "nomination") {
      for (const vote of ballots) {
        const ballot = {
          ...vote.payload,
          nominee: payload.nominee,
          nominationId,
          voters: [...vote.payload.voters]
        };
        const voteLabel = `\u63D0\u540D\u7EA0\u6B63\u65F6\u91CD\u65B0\u5173\u8054\u6295\u7968\uFF1A${eventLabel({ payload: ballot })} \xB7 ${timeLabel(vote.occurredAt)}`;
        next = commitStandardDrafts(
          next,
          voteLabel,
          [
            {
              payload: ballot,
              occurredAt: vote.occurredAt,
              correctsEventId: vote.id,
              label: voteLabel,
              sourceSpan: [0, voteLabel.length]
            }
          ],
          vote.visibility
        );
      }
    }
    return next;
  }
  function correctStandardFact(workspace, eventId, payload) {
    requireLatestRevision(workspace);
    const source = visibleAtBranch(workspace).find(
      (event) => event.id === eventId
    );
    if (!source || !source.occurredAt || source.payload.kind !== "death" && source.payload.kind !== "execution")
      throw new Error("\u5F85\u7EA0\u6B63\u7684\u6B7B\u4EA1\u6216\u5904\u51B3\u8BB0\u5F55\u5DF2\u64A4\u56DE\u6216\u5728\u5F53\u524D\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\u3002");
    if (payload.kind !== source.payload.kind)
      throw new Error("\u7EA0\u6B63\u5FC5\u987B\u4FDD\u6301\u539F\u8BB0\u5F55\u7C7B\u578B\uFF1B\u5904\u51B3\u4E0E\u6B7B\u4EA1\u8BF7\u5206\u522B\u6838\u5BF9\u3002");
    if (!Number.isInteger(payload.seat) || payload.seat < 1 || payload.seat > workspace.playerCount)
      throw new Error("\u7EA0\u6B63\u7684\u73A9\u5BB6\u5EA7\u4F4D\u65E0\u6548\u3002");
    if (payload.seat === source.payload.seat) return workspace;
    const next = retractStandardEvent(
      workspace,
      source.id,
      "\u4E8B\u5B9E\u7EA0\u6B63\uFF1A\u4FDD\u7559\u539F\u8BB0\u5F55\u548C\u53D1\u751F\u4F4D\u7F6E\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u672C\u9636\u6BB5\u5B8C\u6574\u6027\u3002"
    );
    const label = `${payload.kind === "death" ? "\u6B7B\u4EA1" : "\u5904\u51B3"}\u7EA0\u6B63\uFF1A${eventLabel({ payload })} \xB7 ${timeLabel(source.occurredAt)}`;
    return commitStandardDrafts(
      next,
      label,
      [
        {
          payload: { ...payload },
          occurredAt: source.occurredAt,
          correctsEventId: source.id,
          label,
          sourceSpan: [0, label.length]
        }
      ],
      source.visibility
    );
  }
  function correctStandardVote(workspace, voteId, voters) {
    requireLatestRevision(workspace);
    const visible = visibleAtBranch(workspace);
    const vote = visible.find((event) => event.id === voteId);
    if (!vote || vote.payload.kind !== "vote" || !vote.occurredAt)
      throw new Error("\u5F85\u7EA0\u6B63\u7684\u6295\u7968\u5DF2\u64A4\u56DE\u6216\u5728\u5F53\u524D\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\u3002");
    const ballot = vote.payload;
    if (!visible.some(
      (event) => event.id === ballot.nominationId && event.payload.kind === "nomination"
    ))
      throw new Error("\u8FD9\u6B21\u6295\u7968\u5173\u8054\u7684\u63D0\u540D\u5DF2\u64A4\u56DE\uFF0C\u8BF7\u5148\u6838\u5BF9\u63D0\u540D\u8BB0\u5F55\u3002");
    if (new Set(voters).size !== voters.length || voters.some(
      (seat) => !Number.isInteger(seat) || seat < 1 || seat > workspace.playerCount
    ))
      throw new Error("\u4E3E\u624B\u73A9\u5BB6\u5305\u542B\u91CD\u590D\u6216\u65E0\u6548\u5EA7\u4F4D\u3002");
    if (voters.length === ballot.voters.length && voters.every((seat) => ballot.voters.includes(seat)))
      return workspace;
    const next = retractStandardEvent(
      workspace,
      vote.id,
      "\u6295\u7968\u7EA0\u6B63\uFF1A\u4FDD\u7559\u539F\u6295\u7968\u4F4D\u7F6E\u548C\u539F\u6587\uFF0C\u8BF7\u91CD\u65B0\u6838\u5BF9\u672C\u65E5\u8BB0\u5F55\u5B8C\u6574\u6027\u3002"
    );
    const payload = { ...ballot, voters: [...voters] };
    const label = `\u6295\u7968\u7EA0\u6B63\uFF1A${eventLabel({ payload })} \xB7 ${timeLabel(vote.occurredAt)}`;
    return commitStandardDrafts(
      next,
      label,
      [
        {
          payload,
          occurredAt: vote.occurredAt,
          correctsEventId: vote.id,
          label,
          sourceSpan: [0, label.length]
        }
      ],
      vote.visibility
    );
  }
  function standardPhaseStatus(w, time) {
    const records = visibleAtBranch(w).filter(
      (e) => samePhase(e.occurredAt, time)
    );
    const required = time.phase === "day" ? ["actions", "deaths"] : ["deaths"];
    const missing = required.filter(
      (channel) => !records.some(
        (e) => e.payload.kind === "phase_closed" && e.payload.channel === channel
      )
    );
    return { records, complete: !missing.length, missing };
  }
  function closeStandardPhase(w, time, confirmed) {
    requireLatestRevision(w);
    if (!confirmed) throw new Error("\u8BF7\u5148\u786E\u8BA4\u672C\u9636\u6BB5\u884C\u52A8\u4E0E\u6B7B\u4EA1\u8BB0\u5F55\u5DF2\u6536\u9F50\u3002");
    const status = standardPhaseStatus(w, time);
    if (status.complete) return w;
    const label = `${timeLabel(time)}\u672C\u9636\u6BB5\u8BB0\u5F55\u5B8C\u6574`;
    const next = commitStandardDrafts(
      w,
      label,
      status.missing.map((channel) => ({
        payload: {
          kind: "phase_closed",
          channel
        },
        occurredAt: time,
        label,
        sourceSpan: [0, label.length]
      })),
      "private"
    );
    validateStandardWorkspace(next);
    return next;
  }

  // src/core/claimAnalysis.ts
  function prepareClaimAnalysis(workspace) {
    const branch = workspace.branches.find(
      (b) => b.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    const events = visibleStandardEvents(
      workspace,
      workspace.perspectiveSeat,
      branch.baseRevision
    );
    const groups = [];
    const hypotheses = [...workspace.hypotheses];
    const namespace = crypto.randomUUID();
    for (let seat = 1; seat <= workspace.playerCount; seat++) {
      const claims = currentStandardClaims(events, workspace.events).filter(
        (e) => e.payload.kind === "claim" && e.payload.speaker === seat
      );
      const latest = claims.filter(
        (e) => e.payload.kind === "claim" && e.payload.claimKind === "role" && e.payload.identityStage !== "current"
      ).at(-1);
      const currentRoles = claims.filter(
        (e) => e.payload.kind === "claim" && e.payload.claimKind === "role" && e.payload.identityStage === "current"
      ).filter(
        (e, index, all) => !all.slice(index + 1).some(
          (later) => later.occurredAt?.cycle === e.occurredAt?.cycle && later.occurredAt?.phase === e.occurredAt?.phase
        )
      );
      const reports = claims.filter(
        (e) => e.payload.kind === "claim" && e.payload.claimKind === "ability_report"
      );
      if (!latest && !currentRoles.length && !reports.length) continue;
      const group = {
        seat,
        sourceIds: [],
        assumptionIds: [],
        conditions: []
      };
      const add = (draft, source) => {
        const id = `claim-analysis-${namespace}-${hypotheses.length}`;
        hypotheses.push({ ...draft, id, createdAt: branch.createdAt });
        group.assumptionIds.push(id);
        if (source.payload.kind === "claim")
          group.conditions.push({
            id,
            seat,
            kind: draft.kind,
            role: source.payload.role,
            sourceId: source.id,
            occurredAt: source.occurredAt
          });
      };
      if (latest?.payload.kind === "claim") {
        group.role = latest.payload.role;
        group.sourceIds.push(latest.id);
        add({ kind: "actual_role", seat, role: latest.payload.role }, latest);
      }
      for (const claim of currentRoles) {
        if (claim.payload.kind !== "claim" || !claim.occurredAt) continue;
        group.sourceIds.push(claim.id);
        add(
          {
            kind: "role_at_phase",
            seat,
            role: claim.payload.role,
            occurredAt: claim.occurredAt
          },
          claim
        );
      }
      for (const report of reports) {
        group.sourceIds.push(report.id);
        add({ kind: "report_accurate", eventId: report.id }, report);
        add({ kind: "ability_active", eventId: report.id }, report);
      }
      groups.push(group);
    }
    const fixedIds = [...branch.assumptionIds];
    const withConditions = (ids) => ({
      ...workspace,
      // Query the initial assignment while exact phase-role conditions and report nights retain their own time.
      query: { ...workspace.query, stage: "initial" },
      hypotheses,
      branches: workspace.branches.map(
        (b) => b.id === branch.id ? {
          ...b,
          assumptionIds: [...fixedIds, ...ids]
        } : b
      )
    });
    const withSeats = (seats2) => withConditions(
      groups.filter((g) => seats2.includes(g.seat)).flatMap((g) => g.assumptionIds)
    );
    return { groups, revision: branch.baseRevision, withSeats, withConditions };
  }
  async function analyzeClaims(workspace, oracle, options = {}, onProgress) {
    return analyzeClaimGroups(
      prepareClaimAnalysis(workspace),
      oracle,
      options,
      onProgress
    );
  }
  async function analyzeClaimGroups(prepared, oracle, options = {}, onProgress) {
    const all = prepared.groups.map((g) => g.seat);
    const result = {
      status: "unknown",
      revision: prepared.revision,
      groups: prepared.groups,
      coreSeats: [],
      coreMinimal: false,
      complete: false,
      checks: 0,
      trials: [],
      repairs: [],
      repairSearchComplete: false
    };
    if (!all.length)
      return {
        ...result,
        status: "empty",
        complete: true,
        repairSearchComplete: true
      };
    const started = performance.now();
    const budget = Math.max(0, Math.min(options.budgetMs ?? 3e4, 6e4));
    const maxChecks = Math.max(0, Math.min(options.maxChecks ?? 120, 200));
    const maxRepairs = Math.max(1, Math.min(options.maxRepairs ?? 6, 20));
    const cache = /* @__PURE__ */ new Map();
    const key = (seats2) => seats2.join(",");
    const retained = (relaxed) => all.filter((s) => !relaxed.includes(s));
    const exhausted = () => budget <= performance.now() - started;
    const check = async (seats2) => {
      const sorted = [...seats2].sort((a, b) => a - b);
      const cached = cache.get(key(sorted));
      if (cached) return cached;
      const remaining = budget - (performance.now() - started);
      if (remaining <= 0 || result.checks >= maxChecks)
        return { kind: "budget", reason: "\u5DF2\u8FBE\u5230\u5206\u6790\u65F6\u95F4\u6216\u68C0\u67E5\u6B21\u6570\u4E0A\u9650\u3002" };
      result.checks++;
      let answer;
      try {
        const solved = await oracle(
          prepared.withSeats(sorted),
          Math.max(
            1,
            Math.floor(Math.min(remaining, options.checkTimeoutMs ?? 2e3))
          )
        );
        if (result.rulesetHash && result.rulesetHash !== solved.rulesetHash) {
          answer = {
            kind: "unknown",
            reason: "\u89C4\u5219\u7248\u672C\u53D1\u751F\u53D8\u5316\uFF0C\u4E0D\u80FD\u5408\u5E76\u7ED3\u679C\u3002"
          };
        } else {
          result.rulesetHash = solved.rulesetHash;
          if (solved.status === "unsat" && solved.classification === "inconsistent")
            answer = { kind: "unsat" };
          else if (solved.yes ?? solved.no)
            answer = { kind: "sat", witness: solved.yes ?? solved.no };
          else
            answer = {
              kind: "unknown",
              reason: solved.unknownReason === "time_budget" ? "\u5355\u6B21\u68C0\u67E5\u8FBE\u5230\u65F6\u95F4\u9884\u7B97\u3002" : "\u89C4\u5219\u4EA4\u4E92\u6216\u5019\u9009\u641C\u7D22\u672A\u5B8C\u6210\uFF0C\u7ED3\u679C\u672A\u77E5\u3002"
            };
        }
      } catch (error) {
        answer = {
          kind: "unknown",
          reason: error instanceof Error ? error.message : "\u5206\u6790\u672A\u5B8C\u6210\u3002"
        };
      }
      cache.set(key(sorted), answer);
      return answer;
    };
    const snapshot = () => ({
      ...result,
      coreSeats: [...result.coreSeats],
      trials: result.trials.map((t) => ({ ...t })),
      repairs: result.repairs.map((r) => ({ ...r, seats: [...r.seats] }))
    });
    const publish = () => onProgress?.(snapshot());
    const stop = (reason) => {
      result.reason = reason;
      return snapshot();
    };
    const subset = (left, right) => left.every((s) => right.includes(s));
    const baseline = await check(all);
    if (baseline.kind === "sat")
      return {
        ...result,
        status: "compatible",
        witness: baseline.witness,
        complete: true,
        repairSearchComplete: true
      };
    if (baseline.kind !== "unsat") return stop(baseline.reason);
    const background = await check([]);
    if (background.kind === "unsat")
      return {
        ...result,
        status: "fixed_conflict",
        complete: true,
        repairSearchComplete: true,
        reason: "\u4E0D\u91C7\u4FE1\u4EFB\u4F55\u73A9\u5BB6\u58F0\u79F0\u4ECD\u6709\u51B2\u7A81\uFF0C\u8BF7\u6838\u5BF9\u5BF9\u5C40\u4E8B\u4EF6\u4E0E\u624B\u52A8\u91C7\u7EB3\u7684\u524D\u63D0\u3002"
      };
    if (background.kind !== "sat") return stop(background.reason);
    result.status = "conflict";
    result.coreSeats = [...all];
    publish();
    const recordRepair = (repair) => {
      if (result.repairs.some(
        (r) => subset(r.seats, repair.seats) && key(r.seats) !== key(repair.seats)
      ))
        return;
      result.repairs = result.repairs.filter(
        (r) => !subset(repair.seats, r.seats)
      );
      result.repairs.push(repair);
      result.repairs.sort(
        (a, b) => a.seats.length - b.seats.length || key(a.seats).localeCompare(key(b.seats), "en")
      );
    };
    for (const seat of all) {
      const answer = await check(retained([seat]));
      if (answer.kind === "budget") return stop(answer.reason);
      result.trials.push({
        seat,
        status: answer.kind === "sat" ? "compatible" : answer.kind === "unsat" ? "conflict" : "unknown",
        ...answer.kind === "sat" ? { witness: answer.witness } : {},
        ...answer.kind === "unknown" ? { reason: answer.reason } : {}
      });
      if (answer.kind === "sat" && result.repairs.length < maxRepairs)
        recordRepair({ seats: [seat], witness: answer.witness, minimal: true });
      publish();
    }
    const shrink = async (input) => {
      let core = [...input];
      let index = 0;
      let unknownReason;
      while (index < core.length) {
        const reduced = core.filter((s) => s !== core[index]);
        const answer = await check(reduced);
        if (answer.kind === "budget")
          return { core, minimal: false, budgetReason: answer.reason };
        if (answer.kind === "unsat") {
          core = reduced;
          index = 0;
          unknownReason = void 0;
        } else {
          if (answer.kind === "unknown") unknownReason = answer.reason;
          index++;
        }
      }
      return { core, minimal: !unknownReason, unknownReason };
    };
    const firstCore = await shrink(all);
    result.coreSeats = firstCore.core;
    result.coreMinimal = firstCore.minimal;
    publish();
    if (firstCore.budgetReason) return stop(firstCore.budgetReason);
    const cores = [firstCore.core];
    const frontier = [[]];
    const queued = /* @__PURE__ */ new Set([""]);
    let searchUnknown;
    const enqueue = (seats2) => {
      const sorted = [...new Set(seats2)].sort((a, b) => a - b);
      if (!queued.has(key(sorted))) {
        queued.add(key(sorted));
        frontier.push(sorted);
      }
    };
    while (frontier.length) {
      if (exhausted())
        return stop("\u5DF2\u8FBE\u5230\u5206\u6790\u65F6\u95F4\u6216\u68C0\u67E5\u6B21\u6570\u4E0A\u9650\uFF0C\u4FDD\u7559\u5DF2\u9A8C\u8BC1\u7684\u7EC4\u5408\u3002");
      frontier.sort(
        (a, b) => a.length - b.length || key(a).localeCompare(key(b), "en")
      );
      const relaxed = frontier.shift();
      if (result.repairs.some((r) => subset(r.seats, relaxed))) continue;
      const uncovered = cores.find(
        (core) => !core.some((s) => relaxed.includes(s))
      );
      if (uncovered) {
        for (const seat of uncovered) enqueue([...relaxed, seat]);
        continue;
      }
      if (result.repairs.length >= maxRepairs)
        return stop("\u5DF2\u8FBE\u5230\u5C55\u793A\u7EC4\u5408\u4E0A\u9650\uFF0C\u5176\u4ED6\u7EC4\u5408\u5C1A\u672A\u641C\u7D22\u5B8C\u3002");
      const answer = await check(retained(relaxed));
      if (answer.kind === "budget") return stop(answer.reason);
      if (answer.kind === "unknown") {
        searchUnknown = answer.reason;
        for (const seat of retained(relaxed)) enqueue([...relaxed, seat]);
        continue;
      }
      if (answer.kind === "unsat") {
        const learned = await shrink(retained(relaxed));
        cores.push(learned.core);
        if (learned.budgetReason) return stop(learned.budgetReason);
        for (const seat of learned.core) enqueue([...relaxed, seat]);
        continue;
      }
      let repair = {
        seats: [...relaxed],
        witness: answer.witness,
        minimal: false
      };
      recordRepair(repair);
      publish();
      let index = 0;
      let minimalityUnknown;
      while (index < repair.seats.length) {
        const smaller = repair.seats.filter((s) => s !== repair.seats[index]);
        const restored = await check(retained(smaller));
        if (restored.kind === "budget") return stop(restored.reason);
        if (restored.kind === "sat") {
          repair = { seats: smaller, witness: restored.witness, minimal: false };
          recordRepair(repair);
          index = 0;
          minimalityUnknown = void 0;
          publish();
        } else {
          if (restored.kind === "unknown") minimalityUnknown = restored.reason;
          index++;
        }
      }
      repair = { ...repair, minimal: !minimalityUnknown };
      recordRepair(repair);
      if (minimalityUnknown) searchUnknown = minimalityUnknown;
      publish();
    }
    result.repairSearchComplete = !searchUnknown;
    result.complete = result.coreMinimal && result.repairSearchComplete && result.trials.every((t) => t.status !== "unknown") && result.repairs.every((r) => r.minimal);
    result.reason = searchUnknown ?? firstCore.unknownReason ?? (result.complete ? void 0 : "\u90E8\u5206\u68C0\u67E5\u672A\u5B8C\u6210\uFF0C\u4FDD\u7559\u5DF2\u9A8C\u8BC1\u7684\u7EC4\u5408\u3002");
    return snapshot();
  }

  // src/core/claimConditionAnalysis.ts
  async function analyzeClaimConditions(workspace, selectedSeats, oracle, options = {}, onProgress) {
    const prepared = prepareClaimAnalysis(workspace);
    const seats2 = [...new Set(selectedSeats)].sort((a, b) => a - b);
    if (!seats2.length || seats2.some((s) => !prepared.groups.some((g) => g.seat === s)))
      throw new Error("\u9009\u5B9A\u73A9\u5BB6\u7684\u58F0\u79F0\u5728\u5F53\u524D\u4FEE\u8BA2\u6216\u79C1\u5BC6\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\uFF0C\u8BF7\u91CD\u65B0\u5206\u6790\u3002");
    const conditions = prepared.groups.filter((g) => seats2.includes(g.seat)).flatMap((g) => g.conditions);
    const otherIds = prepared.groups.filter((g) => !seats2.includes(g.seat)).flatMap((g) => g.assumptionIds);
    const ids = (keys) => keys.map((key) => conditions[key - 1].id);
    const translate = (analysis2) => ({
      status: analysis2.status === "empty" ? "unknown" : analysis2.status,
      revision: prepared.revision,
      seats: [...seats2],
      conditions,
      coreIds: ids(analysis2.coreSeats),
      coreMinimal: analysis2.coreMinimal,
      explanations: analysis2.repairs.map((repair) => ({
        relaxedIds: ids(repair.seats),
        witness: repair.witness,
        minimal: repair.minimal
      })),
      trials: analysis2.trials.map(({ seat, ...trial }) => ({
        ...trial,
        conditionId: conditions[seat - 1].id
      })),
      searchComplete: analysis2.repairSearchComplete,
      complete: analysis2.complete,
      checks: analysis2.checks,
      rulesetHash: analysis2.rulesetHash,
      reason: analysis2.status === "fixed_conflict" ? "\u9009\u5B9A\u73A9\u5BB6\u7684\u5168\u90E8\u4E34\u65F6\u6761\u4EF6\u653E\u5BBD\u540E\u4ECD\u6709\u51B2\u7A81\u3002\u8BF7\u8FD4\u56DE\u4E00\u952E\u5206\u6790\uFF0C\u590D\u6838\u73A9\u5BB6\u7EC4\u5408\u548C\u624B\u52A8\u524D\u63D0\u3002" : analysis2.reason?.replaceAll("\u5C55\u793A\u7EC4\u5408\u4E0A\u9650", "\u5C55\u793A\u89E3\u91CA\u4E0A\u9650").replaceAll("\u7EC4\u5408", "\u89E3\u91CA")
    });
    const analysis = await analyzeClaimGroups(
      {
        revision: prepared.revision,
        groups: conditions.map((condition, index) => ({
          seat: index + 1,
          sourceIds: [condition.sourceId],
          assumptionIds: [condition.id],
          conditions: [condition]
        })),
        withSeats: (keys) => prepared.withConditions([...otherIds, ...ids(keys)])
      },
      oracle,
      { budgetMs: 2e4, maxChecks: 150, ...options },
      (progress) => onProgress?.(translate(progress))
    );
    return translate(analysis);
  }

  // src/core/standardQuery.ts
  async function solveStandardWorkspace(workspace, solvers, timeoutMs) {
    const branch = workspace.branches.find(
      (b) => b.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    const events = visibleStandardEvents(
      workspace,
      workspace.perspectiveSeat,
      branch.baseRevision
    );
    const dynamic = events.some(
      (e) => !["claim", "retraction"].includes(e.payload.kind)
    );
    const phaseRolePremise = workspace.hypotheses.some(
      (h) => h.kind === "role_at_phase" && branch.assumptionIds.includes(h.id)
    );
    if (dynamic || phaseRolePremise) {
      const prepared2 = prepareStandardObservedQuery(workspace);
      if (prepared2.status !== "ready") throw new Error(prepared2.reason);
      const answer2 = await solvers.observed({
        ...prepared2.input,
        ...timeoutMs !== void 0 ? { timeoutMs } : {}
      });
      return {
        answer: answer2,
        sourceIds: prepared2.sourceIds,
        revision: prepared2.revision
      };
    }
    const prepared = prepareStandardSetupQuery(workspace);
    if (prepared.status !== "ready") throw new Error(prepared.reason);
    const answer = await solvers.setup({
      ...prepared.input,
      ...timeoutMs !== void 0 ? { timeoutMs } : {}
    });
    return { answer, sourceIds: prepared.sourceIds, revision: prepared.revision };
  }

  // src/core/recordAnalysis.ts
  function isAnalyzableRecord(event) {
    return ["death", "execution", "nomination", "slayer", "vote"].includes(
      event.payload.kind
    );
  }
  function prepareRecordAnalysis(workspace, sourceId, includeAssumptions = true) {
    const branch = workspace.branches.find(
      (b) => b.id === workspace.activeBranchId
    );
    if (!branch) throw new Error("\u6D3B\u52A8\u5206\u652F\u4E0D\u5B58\u5728\u3002");
    const source = visibleStandardEvents(
      workspace,
      workspace.perspectiveSeat,
      branch.baseRevision
    ).find((event) => event.id === sourceId);
    if (!source || !source.occurredAt || !isAnalyzableRecord(source))
      throw new Error(
        "\u5F85\u8BD5\u67E5\u7684\u8BB0\u5F55\u5DF2\u64A4\u56DE\u3001\u5C1A\u672A\u8FDB\u5165\u5F53\u524D\u4FEE\u8BA2\u6216\u5728\u5F53\u524D\u89C6\u89D2\u4E0B\u4E0D\u53EF\u89C1\u3002"
      );
    const events = workspace.events.filter(
      (event) => event.revision <= branch.baseRevision
    );
    const eventIds = new Set(events.map((event) => event.id));
    const hypotheses = workspace.hypotheses.filter(
      (hypothesis) => !("eventId" in hypothesis) || eventIds.has(hypothesis.eventId)
    );
    const assumptionIds = includeAssumptions ? [...branch.assumptionIds] : [];
    if (assumptionIds.some(
      (id) => !hypotheses.some((hypothesis) => hypothesis.id === id)
    ))
      throw new Error("\u5F53\u524D\u91C7\u7EB3\u524D\u63D0\u7684\u6765\u6E90\u8D85\u51FA\u8FD9\u4EFD\u4FEE\u8BA2\uFF0C\u8BF7\u5148\u6838\u5BF9\u524D\u63D0\u3002");
    const snapshot = {
      ...workspace,
      query: { ...workspace.query, stage: "initial" },
      events,
      hypotheses,
      branches: [{ ...branch, parentId: void 0, assumptionIds }]
    };
    const relatedSourceIds = source.payload.kind === "nomination" ? nominationVoteSources(snapshot, source.id).map((vote) => vote.id) : [];
    const candidates = [];
    const seats2 = Array.from({ length: workspace.playerCount }, (_, i) => i + 1);
    const payload = source.payload;
    const addSeatChoices = (field, from, label, make) => {
      for (const seat of seats2)
        if (seat !== from)
          candidates.push({
            id: `${field}-${seat}`,
            label: `${label}\uFF1A${from}\u53F7 \u2192 ${seat}\u53F7`,
            payload: make(seat)
          });
    };
    if (payload.kind === "death" || payload.kind === "execution")
      addSeatChoices(
        "seat",
        payload.seat,
        payload.kind === "death" ? "\u6B7B\u4EA1\u73A9\u5BB6" : "\u5904\u51B3\u73A9\u5BB6",
        (seat) => ({ ...payload, seat })
      );
    else if (payload.kind === "nomination") {
      addSeatChoices("nominee", payload.nominee, "\u88AB\u63D0\u540D\u4EBA", (nominee) => ({
        ...payload,
        nominee
      }));
      addSeatChoices("nominator", payload.nominator, "\u63D0\u540D\u4EBA", (nominator) => ({
        ...payload,
        nominator
      }));
    } else if (payload.kind === "slayer") {
      addSeatChoices("actor", payload.actor, "\u884C\u52A8\u73A9\u5BB6", (actor) => ({
        ...payload,
        actor
      }));
      addSeatChoices("target", payload.target, "\u730E\u624B\u76EE\u6807", (target) => ({
        ...payload,
        target
      }));
    } else {
      for (const seat of seats2) {
        const removing = payload.voters.includes(seat);
        const voters = removing ? payload.voters.filter((voter) => voter !== seat) : [...payload.voters, seat];
        candidates.push({
          id: `voter-${seat}`,
          label: `\u4E3E\u624B\u540D\u5355\uFF1A${removing ? "\u79FB\u9664" : "\u8865\u5165"}${seat}\u53F7\uFF08${payload.voters.length}\u7968 \u2192 ${voters.length}\u7968\uFF09`,
          payload: { ...payload, voters }
        });
      }
    }
    return {
      snapshot,
      source,
      candidates,
      relatedSourceIds,
      withCandidate(candidate) {
        const choice = candidates.find((item) => item.id === candidate.id);
        if (!choice) throw new Error("\u8BD5\u67E5\u5019\u9009\u4E0D\u5C5E\u4E8E\u5F53\u524D\u6765\u6E90\u3002");
        const replacement = choice.payload;
        const trial = replacement.kind === "vote" ? correctStandardVote(snapshot, source.id, replacement.voters) : replacement.kind === "death" || replacement.kind === "execution" ? correctStandardFact(snapshot, source.id, replacement) : correctStandardAction(
          snapshot,
          source.id,
          replacement,
          relatedSourceIds
        );
        return closeStandardPhase(trial, source.occurredAt, true);
      }
    };
  }
  var limit2 = (value, fallback, max) => Number.isFinite(value) ? Math.max(0, Math.min(value, max)) : fallback;
  async function analyzeRecord(workspace, sourceId, solvers, options = {}, onProgress) {
    const prepared = prepareRecordAnalysis(
      workspace,
      sourceId,
      options.includeAssumptions !== false
    );
    const started = performance.now();
    const budget = limit2(options.budgetMs, 2e4, 6e4);
    const maxChecks = Math.floor(limit2(options.maxChecks, 40, 200));
    const maxResults = Math.floor(limit2(options.maxResults, 4, 12));
    let checks = 0, testedCandidates = 0, unknownCandidates = 0;
    let baselineConflict = false;
    let rulesetHash;
    const alternatives = [];
    const finish = (status, reason) => ({
      status,
      sourceId,
      revision: prepared.snapshot.events.length,
      assumptionIds: [...prepared.snapshot.branches[0].assumptionIds],
      relatedSourceIds: [...prepared.relatedSourceIds],
      baselineConflict,
      checks,
      testedCandidates,
      totalCandidates: prepared.candidates.length,
      unknownCandidates,
      complete: ["confirmed", "compatible", "no_single_edit"].includes(status),
      alternatives: [...alternatives],
      rulesetHash,
      reason
    });
    const check = async (trial) => {
      const input = prepareStandardObservedQuery(trial);
      if (input.status !== "ready")
        return { kind: "not_ready", reason: input.reason };
      const remaining = budget - (performance.now() - started);
      if (remaining <= 0 || checks >= maxChecks)
        return {
          kind: "budget",
          reason: "\u8BD5\u67E5\u8FBE\u5230\u65F6\u95F4\u6216\u68C0\u67E5\u6B21\u6570\u9884\u7B97\uFF0C\u672A\u68C0\u67E5\u90E8\u5206\u4ECD\u672A\u77E5\u3002"
        };
      checks++;
      try {
        const answer = await solvers.observed({
          ...input.input,
          timeoutMs: Math.max(
            1,
            Math.floor(
              Math.min(remaining, limit2(options.checkTimeoutMs, 3e3, 6e4))
            )
          )
        });
        if (rulesetHash && rulesetHash !== answer.rulesetHash)
          return {
            kind: "changed_rules",
            reason: "\u89C4\u5219\u7248\u672C\u53D1\u751F\u53D8\u5316\uFF0C\u4FDD\u7559\u6B64\u524D\u8BC1\u636E\uFF0C\u4E0D\u80FD\u5408\u5E76\u65B0\u7ED3\u679C\u3002"
          };
        rulesetHash = answer.rulesetHash;
        if (answer.status === "unsat" && answer.classification === "inconsistent")
          return { kind: "conflict" };
        const witness = answer.yes ?? answer.no;
        if (witness) return { kind: "compatible", witness };
        return {
          kind: "unknown",
          reason: answer.unknownReason === "unsupported_replay" ? "\u5B58\u5728\u5C1A\u672A\u652F\u6301\u7684\u89C4\u5219\u4EA4\u4E92\u3002" : answer.unknownReason === "candidate_limit" ? "\u5019\u9009\u6216\u9690\u85CF\u884C\u52A8\u641C\u7D22\u8FBE\u5230\u4E0A\u9650\u3002" : "\u672C\u6B21\u68C0\u67E5\u672A\u5B8C\u6210\uFF0C\u5C1A\u672A\u627E\u5230\u517C\u5BB9\u89C1\u8BC1\u3002"
        };
      } catch (error) {
        return {
          kind: "unknown",
          reason: error instanceof Error ? error.message : "\u672C\u6B21\u68C0\u67E5\u672A\u5B8C\u6210\u3002"
        };
      }
    };
    const baseline = await check(prepared.snapshot);
    if (baseline.kind === "not_ready")
      return finish("not_ready", baseline.reason);
    if (baseline.kind === "compatible")
      return finish(
        "compatible",
        "\u539F\u5B8C\u6574\u80CC\u666F\u5DF2\u6709\u517C\u5BB9\u89C1\u8BC1\uFF0C\u65E0\u9700\u636E\u6B64\u731C\u6D4B\u5F55\u5165\u9519\u8BEF\u3002"
      );
    if (baseline.kind !== "conflict") return finish("unknown", baseline.reason);
    baselineConflict = true;
    onProgress?.(
      finish("partial", "\u539F\u80CC\u666F\u5DF2\u786E\u8BA4\u51B2\u7A81\uFF0C\u6B63\u5728\u8BD5\u67E5\u8FD9\u6761\u8BB0\u5F55\u7684\u5355\u5904\u66FF\u4EE3\u3002")
    );
    let unresolved;
    for (const candidate of prepared.candidates) {
      if (alternatives.length >= maxResults)
        return finish("partial", "\u5DF2\u8FBE\u5230\u5C55\u793A\u5019\u9009\u4E0A\u9650\uFF0C\u5176\u4ED6\u5355\u5904\u66FF\u4EE3\u5C1A\u672A\u68C0\u67E5\u3002");
      let answer;
      try {
        answer = await check(prepared.withCandidate(candidate));
      } catch (error) {
        answer = {
          kind: "unknown",
          reason: error instanceof Error ? error.message : "\u5019\u9009\u8BB0\u5F55\u65E0\u6CD5\u51C6\u5907\u3002"
        };
      }
      if (answer.kind === "budget" || answer.kind === "changed_rules")
        return finish("partial", answer.reason);
      testedCandidates++;
      if (answer.kind === "compatible")
        alternatives.push({ ...candidate, witness: answer.witness });
      else if (answer.kind !== "conflict") {
        unknownCandidates++;
        unresolved ??= answer.reason;
      }
      onProgress?.(finish("partial", "\u5DF2\u786E\u8BA4\u7684\u5019\u9009\u5B9E\u65F6\u663E\u793A\uFF0C\u672A\u5B8C\u6210\u90E8\u5206\u4ECD\u672A\u77E5\u3002"));
    }
    if (unknownCandidates) return finish("partial", unresolved);
    return alternatives.length ? finish(
      "confirmed",
      "\u8FD9\u6761\u8BB0\u5F55\u7684\u5355\u5904\u66FF\u4EE3\u5DF2\u68C0\u67E5\u5B8C\uFF1B\u5019\u9009\u53EA\u662F\u5728\u6240\u5217\u6761\u4EF6\u4E0B\u53EF\u6210\u7ACB\uFF0C\u4E0D\u8BC1\u660E\u539F\u8BB0\u5F55\u9519\u8BEF\u3002"
    ) : finish(
      "no_single_edit",
      "\u8FD9\u4E9B\u5355\u5904\u66FF\u4EE3\u5747\u672A\u6D88\u9664\u5B8C\u6574\u80CC\u666F\u51B2\u7A81\uFF1B\u8FD9\u4E0D\u8BC1\u660E\u539F\u8BB0\u5F55\u6B63\u786E\uFF0C\u53EF\u80FD\u6D89\u53CA\u591A\u5904\u8BB0\u5F55\u6216\u624B\u52A8\u524D\u63D0\u3002"
    );
  }

  // src/core/z3-engine.ts
  async function handle(request, onProgress) {
    if (request.kind === "record_analysis") {
      if (!request.workspace || !request.sourceId)
        throw new Error("\u7F3A\u5C11\u8BB0\u5F55\u8BD5\u67E5\u8F93\u5165\u3002");
      return analyzeRecord(
        request.workspace,
        request.sourceId,
        { setup: queryInitialSetup, observed: queryObservedTimeline },
        request.options,
        onProgress
      );
    }
    if (request.kind === "fact_history") {
      if (!request.workspace) throw new Error("\u7F3A\u5C11\u9636\u6BB5\u6838\u5BF9\u8F93\u5165\u3002");
      return analyzeFactHistory(
        request.workspace,
        { setup: queryInitialSetup, observed: queryObservedTimeline },
        request.options,
        onProgress
      );
    }
    if (request.kind === "claim_diagnosis") {
      if (!request.workspace || !request.seats) throw new Error("\u7F3A\u5C11\u7EC6\u67E5\u8F93\u5165\u3002");
      return analyzeClaimConditions(
        request.workspace,
        request.seats,
        async (workspace, timeoutMs) => (await solveStandardWorkspace(
          workspace,
          {
            setup: queryInitialSetup,
            observed: queryObservedTimeline
          },
          timeoutMs
        )).answer,
        request.options,
        onProgress
      );
    }
    if (request.kind === "claim_analysis") {
      if (!request.workspace) throw new Error("\u7F3A\u5C11\u58F0\u79F0\u5206\u6790\u8F93\u5165\u3002");
      return analyzeClaims(
        request.workspace,
        async (workspace, timeoutMs) => (await solveStandardWorkspace(
          workspace,
          { setup: queryInitialSetup, observed: queryObservedTimeline },
          timeoutMs
        )).answer,
        request.options,
        onProgress
      );
    }
    if (request.kind === "conflict_query") {
      if (!request.workspace) throw new Error("\u7F3A\u5C11\u51B2\u7A81\u5B9A\u4F4D\u8F93\u5165\u3002");
      return analyzeStandardConflict(
        request.workspace,
        async (workspace, timeoutMs) => (await solveStandardWorkspace(
          workspace,
          { setup: queryInitialSetup, observed: queryObservedTimeline },
          timeoutMs
        )).answer,
        request.options,
        onProgress
      );
    }
    if (request.kind === "setup_query") {
      if (!request.input) throw new Error("\u7F3A\u5C11\u8BBE\u7F6E\u67E5\u8BE2\u8F93\u5165\u3002");
      return queryInitialSetup(request.input);
    }
    if (request.kind === "observed_query") {
      if (!request.input || !("phases" in request.input))
        throw new Error("\u7F3A\u5C11\u5C01\u95ED\u89C2\u5BDF\u67E5\u8BE2\u8F93\u5165\u3002");
      return queryObservedTimeline(request.input);
    }
    if (request.kind === "timeline_query") {
      if (!request.input || !("timeline" in request.input))
        throw new Error("\u7F3A\u5C11\u52A8\u6001\u67E5\u8BE2\u8F93\u5165\u3002");
      return queryTimelineWorlds(request.input);
    }
    const { Context, getVersionString } = await (0, import_z3_solver2.init)({
      locateFile: (file) => `/z3/${file}`,
      mainScriptUrlOrBlob: "/z3/z3-built.js"
    });
    const { Solver, Int } = new Context("browser-probe");
    const value = Int.const("value");
    const solver = new Solver();
    solver.add(value.eq(7));
    return {
      status: await solver.check(),
      value: solver.model().eval(value).toString(),
      version: getVersionString()
    };
  }
  return __toCommonJS(z3_engine_exports);
})();
