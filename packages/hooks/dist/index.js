"use strict";
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _array_without_holes(arr) {
    if (Array.isArray(arr)) return _array_like_to_array(arr);
}
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
        var info = gen[key](arg);
        var value = info.value;
    } catch (error) {
        reject(error);
        return;
    }
    if (info.done) {
        resolve(value);
    } else {
        Promise.resolve(value).then(_next, _throw);
    }
}
function _async_to_generator(fn) {
    return function() {
        var self = this, args = arguments;
        return new Promise(function(resolve, reject) {
            var gen = fn.apply(self, args);
            function _next(value) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
            }
            function _throw(err) {
                asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
            }
            _next(undefined);
        });
    };
}
function _instanceof(left, right) {
    if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
        return !!right[Symbol.hasInstance](left);
    } else {
        return left instanceof right;
    }
}
function _iterable_to_array(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _non_iterable_spread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _to_consumable_array(arr) {
    return _array_without_holes(arr) || _iterable_to_array(arr) || _unsupported_iterable_to_array(arr) || _non_iterable_spread();
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
function _ts_generator(thisArg, body) {
    var f, y, t, _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
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
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = function(target, all) {
    for(var name in all)__defProp(target, name, {
        get: all[name],
        enumerable: true
    });
};
var __copyProps = function(to, from, except, desc) {
    if (from && (typeof from === "undefined" ? "undefined" : _type_of(from)) === "object" || typeof from === "function") {
        var _iteratorNormalCompletion = true, _didIteratorError = false, _iteratorError = undefined;
        try {
            var _loop = function() {
                var key = _step.value;
                if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
                    get: function() {
                        return from[key];
                    },
                    enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
                });
            };
            for(var _iterator = __getOwnPropNames(from)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true)_loop();
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally{
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally{
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }
    }
    return to;
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    generateUUID: function() {
        return generateUUID;
    },
    useLocalStorage: function() {
        return useLocalStorage;
    },
    useSessionManagement: function() {
        return useSessionManagement;
    }
});
module.exports = __toCommonJS(src_exports);
// src/useLocalStorage.ts
var import_react = require("react");
function useLocalStorage(key, initialValue) {
    var _ref = _sliced_to_array((0, import_react.useState)(function() {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            var item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error("Error reading from localStorage:", error);
            return initialValue;
        }
    }), 2), storedValue = _ref[0], setStoredValue = _ref[1];
    var setValue = function(value) {
        try {
            var valueToStore = _instanceof(value, Function) ? value(storedValue) : value;
            setStoredValue(valueToStore);
            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error("Error writing to localStorage:", error);
        }
    };
    (0, import_react.useEffect)(function() {
        if (typeof window === "undefined") {
            return;
        }
        var handleStorageChange = function(e) {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error("Error parsing localStorage change:", error);
                }
            }
        };
        window.addEventListener("storage", handleStorageChange);
        return function() {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [
        key
    ]);
    return [
        storedValue,
        setValue
    ];
}
// src/useSessionManagement.ts
var import_react2 = require("react");
// src/utils.ts
function generateUUID() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === "x" ? r : r & 3 | 8;
        return v.toString(16);
    });
}
// src/useSessionManagement.ts
function useSessionManagement() {
    var _useLocalStorage = _sliced_to_array(useLocalStorage("currentSessionId", null), 2), currentSessionId = _useLocalStorage[0], setCurrentSessionIdRaw = _useLocalStorage[1];
    var _ref = _sliced_to_array((0, import_react2.useState)([]), 2), sessions = _ref[0], setSessions = _ref[1];
    var _ref1 = _sliced_to_array((0, import_react2.useState)(true), 2), isLoading = _ref1[0], setIsLoading = _ref1[1];
    var _ref2 = _sliced_to_array((0, import_react2.useState)(null), 2), error = _ref2[0], setError = _ref2[1];
    var _ref3 = _sliced_to_array((0, import_react2.useState)(null), 2), selectedFile = _ref3[0], setSelectedFile = _ref3[1];
    var _ref4 = _sliced_to_array((0, import_react2.useState)([]), 2), messages = _ref4[0], setMessages = _ref4[1];
    var _ref5 = _sliced_to_array((0, import_react2.useState)(false), 2), isLoadingMessages = _ref5[0], setIsLoadingMessages = _ref5[1];
    var initialized = (0, import_react2.useRef)(false);
    var sessionsLoaded = (0, import_react2.useRef)(false);
    var setCurrentSessionId = (0, import_react2.useCallback)(function(id) {
        setCurrentSessionIdRaw(id);
    }, [
        setCurrentSessionIdRaw
    ]);
    var initializeSession = (0, import_react2.useCallback)(function() {
        if (initialized.current) return currentSessionId;
        if (!currentSessionId && typeof window !== "undefined") {
            var newSessionId = generateUUID();
            setCurrentSessionId(newSessionId);
            initialized.current = true;
            return newSessionId;
        } else {
            initialized.current = true;
            return currentSessionId;
        }
    }, [
        currentSessionId,
        setCurrentSessionId
    ]);
    var loadSessions = (0, import_react2.useCallback)(function() {
        return _async_to_generator(function() {
            var loadedSessions;
            return _ts_generator(this, function(_state) {
                if (sessionsLoaded.current) return [
                    2,
                    sessions
                ];
                try {
                    setIsLoading(true);
                    setError(null);
                    loadedSessions = [];
                    setSessions(loadedSessions);
                    sessionsLoaded.current = true;
                    setIsLoading(false);
                    return [
                        2,
                        loadedSessions
                    ];
                } catch (err) {
                    console.error("Error loading sessions:", err);
                    setError("Failed to load sessions");
                    setIsLoading(false);
                    return [
                        2,
                        []
                    ];
                }
                return [
                    2
                ];
            });
        })();
    }, [
        sessions
    ]);
    var createSession = (0, import_react2.useCallback)(function() {
        return _async_to_generator(function() {
            var sessionId, newSession;
            return _ts_generator(this, function(_state) {
                try {
                    setIsLoading(true);
                    setError(null);
                    sessionId = generateUUID();
                    newSession = {
                        id: sessionId,
                        lastMessage: "New conversation",
                        timestamp: /* @__PURE__ */ new Date().toISOString(),
                        htmlFiles: []
                    };
                    setSessions(function(prev) {
                        return _to_consumable_array(prev).concat([
                            newSession
                        ]);
                    });
                    setCurrentSessionId(sessionId);
                    setIsLoading(false);
                    return [
                        2,
                        sessionId
                    ];
                } catch (err) {
                    console.error("Error creating session:", err);
                    setError("Failed to create session");
                    setIsLoading(false);
                    return [
                        2,
                        null
                    ];
                }
                return [
                    2
                ];
            });
        })();
    }, [
        setCurrentSessionId
    ]);
    var updateSession = (0, import_react2.useCallback)(function(updatedSession) {
        if (!updatedSession) return;
        setSessions(function(prevSessions) {
            var index = prevSessions.findIndex(function(s) {
                return s.id === updatedSession.id;
            });
            if (index === -1) {
                return [
                    updatedSession
                ].concat(_to_consumable_array(prevSessions));
            } else {
                var updatedSessions = _to_consumable_array(prevSessions);
                updatedSessions[index] = updatedSession;
                return updatedSessions;
            }
        });
    }, []);
    var loadMessages = (0, import_react2.useCallback)(function(sessionId) {
        return _async_to_generator(function() {
            var loadedMessages;
            return _ts_generator(this, function(_state) {
                if (!sessionId) return [
                    2,
                    []
                ];
                try {
                    setIsLoadingMessages(true);
                    loadedMessages = [];
                    setMessages(loadedMessages);
                    setIsLoadingMessages(false);
                    return [
                        2,
                        loadedMessages
                    ];
                } catch (err) {
                    console.error("Error loading messages:", err);
                    setIsLoadingMessages(false);
                    return [
                        2,
                        []
                    ];
                }
                return [
                    2
                ];
            });
        })();
    }, []);
    var addMessage = (0, import_react2.useCallback)(function(content, sender) {
        return _async_to_generator(function() {
            var newMessage;
            return _ts_generator(this, function(_state) {
                if (!currentSessionId) return [
                    2,
                    null
                ];
                try {
                    newMessage = {
                        id: generateUUID(),
                        content: content,
                        sender: sender,
                        timestamp: /* @__PURE__ */ new Date().toISOString()
                    };
                    setMessages(function(prev) {
                        return _to_consumable_array(prev).concat([
                            newMessage
                        ]);
                    });
                    return [
                        2,
                        newMessage
                    ];
                } catch (err) {
                    console.error("Error adding message:", err);
                    return [
                        2,
                        null
                    ];
                }
                return [
                    2
                ];
            });
        })();
    }, [
        currentSessionId
    ]);
    var selectFile = (0, import_react2.useCallback)(function(fileName, outputFolder, sessionId) {
        setSelectedFile({
            fileName: fileName,
            outputFolder: outputFolder,
            sessionId: sessionId
        });
    }, []);
    var resetSelection = (0, import_react2.useCallback)(function() {
        setSelectedFile(null);
    }, []);
    var handleSessionSelect = (0, import_react2.useCallback)(function(sessionId) {
        setCurrentSessionId(sessionId);
        resetSelection();
        loadMessages(sessionId);
    }, [
        setCurrentSessionId,
        resetSelection,
        loadMessages
    ]);
    var handleHtmlFileSelect = (0, import_react2.useCallback)(function(fileName, outputFolder, sessionId) {
        setCurrentSessionId(sessionId);
        selectFile(fileName, outputFolder, sessionId);
    }, [
        setCurrentSessionId,
        selectFile
    ]);
    (0, import_react2.useEffect)(function() {
        if (typeof window !== "undefined" && !initialized.current) {
            initializeSession();
        }
    }, [
        initializeSession
    ]);
    (0, import_react2.useEffect)(function() {
        if (typeof window !== "undefined" && !sessionsLoaded.current) {
            loadSessions();
        }
    }, [
        loadSessions
    ]);
    (0, import_react2.useEffect)(function() {
        if (currentSessionId) {
            loadMessages(currentSessionId);
        } else {
            setMessages([]);
        }
    }, [
        currentSessionId,
        loadMessages
    ]);
    return {
        // Session state
        currentSessionId: currentSessionId,
        sessions: sessions,
        isLoading: isLoading,
        error: error,
        // Message state
        messages: messages,
        isLoadingMessages: isLoadingMessages,
        // HTML file selection
        selectedFile: selectedFile,
        // Session actions
        setCurrentSessionId: setCurrentSessionId,
        createSession: createSession,
        updateSession: updateSession,
        loadSessions: loadSessions,
        // Message actions
        addMessage: addMessage,
        // HTML file actions
        selectFile: selectFile,
        resetSelection: resetSelection,
        // Convenience handlers
        handleSessionSelect: handleSessionSelect,
        handleHtmlFileSelect: handleHtmlFileSelect,
        // Error handling
        setError: setError,
        clearError: function() {
            return setError(null);
        }
    };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    generateUUID: generateUUID,
    useLocalStorage: useLocalStorage,
    useSessionManagement: useSessionManagement
});
