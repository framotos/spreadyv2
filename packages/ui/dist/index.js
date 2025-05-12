"use strict";
function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
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
function _object_spread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        var ownKeys = Object.keys(source);
        if (typeof Object.getOwnPropertySymbols === "function") {
            ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                return Object.getOwnPropertyDescriptor(source, sym).enumerable;
            }));
        }
        ownKeys.forEach(function(key) {
            _define_property(target, key, source[key]);
        });
    }
    return target;
}
function _object_without_properties(source, excluded) {
    if (source == null) return {};
    var target = _object_without_properties_loose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _object_without_properties_loose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
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
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = function(mod, isNodeMode, target) {
    return target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(// If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
        value: mod,
        enumerable: true
    }) : target, mod);
};
var __toCommonJS = function(mod) {
    return __copyProps(__defProp({}, "__esModule", {
        value: true
    }), mod);
};
// src/index.ts
var src_exports = {};
__export(src_exports, {
    Button: function() {
        return Button;
    },
    Card: function() {
        return Card;
    },
    ChatContainer: function() {
        return ChatContainer;
    },
    ChatInput: function() {
        return ChatInput;
    },
    ChatMessage: function() {
        return ChatMessage;
    },
    Input: function() {
        return Input;
    },
    NavbarItem: function() {
        return NavbarItem;
    },
    Sidebar: function() {
        return Sidebar;
    }
});
module.exports = __toCommonJS(src_exports);
// src/components/Button.tsx
var import_react = __toESM(require("react"));
var Button = import_react.default.forwardRef(function(_param, ref) {
    var children = _param.children, _param_className = _param.className, className = _param_className === void 0 ? "" : _param_className, _param_variant = _param.variant, variant = _param_variant === void 0 ? "primary" : _param_variant, _param_size = _param.size, size = _param_size === void 0 ? "md" : _param_size, _param_isLoading = _param.isLoading, isLoading = _param_isLoading === void 0 ? false : _param_isLoading, disabled = _param.disabled, props = _object_without_properties(_param, [
        "children",
        "className",
        "variant",
        "size",
        "isLoading",
        "disabled"
    ]);
    var baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    var variantClasses = {
        primary: "bg-h1-new text-white hover:bg-h1-light focus:ring-h1-new",
        secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
        outline: "bg-transparent border border-gray-300 hover:bg-gray-100 focus:ring-gray-400",
        ghost: "bg-transparent hover:bg-gray-100 focus:ring-gray-400"
    };
    var sizeClasses = {
        sm: "text-xs px-2 py-1",
        md: "text-sm px-4 py-2",
        lg: "text-base px-6 py-3"
    };
    var loadingClasses = isLoading ? "relative !text-transparent" : "";
    return /* @__PURE__ */ import_react.default.createElement("button", _object_spread({
        ref: ref,
        className: "".concat(baseClasses, " ").concat(variantClasses[variant], " ").concat(sizeClasses[size], " ").concat(loadingClasses, " ").concat(className),
        disabled: disabled || isLoading
    }, props), children, isLoading && /* @__PURE__ */ import_react.default.createElement("div", {
        className: "absolute inset-0 flex items-center justify-center"
    }, /* @__PURE__ */ import_react.default.createElement("svg", {
        className: "animate-spin h-5 w-5 text-current",
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24"
    }, /* @__PURE__ */ import_react.default.createElement("circle", {
        className: "opacity-25",
        cx: "12",
        cy: "12",
        r: "10",
        stroke: "currentColor",
        strokeWidth: "4"
    }), /* @__PURE__ */ import_react.default.createElement("path", {
        className: "opacity-75",
        fill: "currentColor",
        d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    }))));
});
Button.displayName = "Button";
// src/components/Card.tsx
var import_react2 = __toESM(require("react"));
var Card = import_react2.default.forwardRef(function(_param, ref) {
    var children = _param.children, _param_className = _param.className, className = _param_className === void 0 ? "" : _param_className, _param_variant = _param.variant, variant = _param_variant === void 0 ? "default" : _param_variant, _param_padding = _param.padding, padding = _param_padding === void 0 ? "md" : _param_padding, props = _object_without_properties(_param, [
        "children",
        "className",
        "variant",
        "padding"
    ]);
    var baseClasses = "rounded-lg";
    var variantClasses = {
        default: "bg-white",
        bordered: "bg-white border border-gray-200",
        elevated: "bg-white shadow-md"
    };
    var paddingClasses = {
        none: "",
        sm: "p-2",
        md: "p-4",
        lg: "p-6"
    };
    return /* @__PURE__ */ import_react2.default.createElement("div", _object_spread({
        ref: ref,
        className: "".concat(baseClasses, " ").concat(variantClasses[variant], " ").concat(paddingClasses[padding], " ").concat(className)
    }, props), children);
});
Card.displayName = "Card";
// src/components/Input.tsx
var import_react3 = __toESM(require("react"));
var Input = import_react3.default.forwardRef(function(_param, ref) {
    var _param_className = _param.className, className = _param_className === void 0 ? "" : _param_className, label = _param.label, error = _param.error, helperText = _param.helperText, disabled = _param.disabled, props = _object_without_properties(_param, [
        "className",
        "label",
        "error",
        "helperText",
        "disabled"
    ]);
    var inputClasses = "\n      w-full \n      px-3 \n      py-2 \n      border \n      rounded-md \n      focus:outline-none \n      focus:ring-2 \n      focus:ring-offset-2 \n      ".concat(error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-h1-new focus:ring-h1-new", "\n      ").concat(disabled ? "bg-gray-100 cursor-not-allowed" : "", "\n      ").concat(className, "\n    ");
    return /* @__PURE__ */ import_react3.default.createElement("div", {
        className: "w-full"
    }, label && /* @__PURE__ */ import_react3.default.createElement("label", {
        className: "block text-sm font-medium text-gray-700 mb-1"
    }, label), /* @__PURE__ */ import_react3.default.createElement("input", _object_spread({
        ref: ref,
        disabled: disabled,
        className: inputClasses,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? "".concat(props.id, "-error") : helperText ? "".concat(props.id, "-helper") : void 0
    }, props)), error && /* @__PURE__ */ import_react3.default.createElement("p", {
        id: "".concat(props.id, "-error"),
        className: "mt-1 text-sm text-red-600"
    }, error), helperText && !error && /* @__PURE__ */ import_react3.default.createElement("p", {
        id: "".concat(props.id, "-helper"),
        className: "mt-1 text-sm text-gray-500"
    }, helperText));
});
Input.displayName = "Input";
// src/components/ChatMessage.tsx
var import_react4 = __toESM(require("react"));
var ChatMessage = function(param) {
    var message = param.message, sessionId = param.sessionId, _param_htmlBaseUrl = param.htmlBaseUrl, htmlBaseUrl = _param_htmlBaseUrl === void 0 ? "/user_output" : _param_htmlBaseUrl;
    var isUser = message.sender === "user";
    var _ref = _sliced_to_array((0, import_react4.useState)(null), 2), selectedHtmlFile = _ref[0], setSelectedHtmlFile = _ref[1];
    var handleViewHtml = function(file, e) {
        e.preventDefault();
        setSelectedHtmlFile(file);
    };
    var handleCloseHtml = function() {
        setSelectedHtmlFile(null);
    };
    var getHtmlUrl = function(file) {
        if (message.outputFolder) {
            return "".concat(htmlBaseUrl, "/").concat(message.outputFolder, "/").concat(file);
        } else if (sessionId) {
            return "/api/files/".concat(sessionId, "/").concat(file);
        } else {
            return "/api/files/unknown/".concat(file);
        }
    };
    var hasHtmlFiles = message.sender === "assistant" && message.htmlFiles && message.htmlFiles.length > 0 && message.outputFolder;
    return /* @__PURE__ */ import_react4.default.createElement("div", {
        className: "flex ".concat(isUser ? "justify-end" : "justify-start")
    }, /* @__PURE__ */ import_react4.default.createElement("div", {
        className: "max-w-3/4 p-3 rounded-lg ".concat(isUser ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-800")
    }, /* @__PURE__ */ import_react4.default.createElement("p", {
        className: "whitespace-pre-wrap"
    }, message.content), hasHtmlFiles && /* @__PURE__ */ import_react4.default.createElement("div", {
        className: "mt-2 pt-2 border-t border-gray-200"
    }, /* @__PURE__ */ import_react4.default.createElement("p", {
        className: "text-sm font-medium mb-1"
    }, "Generated Graphics:"), /* @__PURE__ */ import_react4.default.createElement("ul", {
        className: "space-y-1"
    }, message.htmlFiles.map(function(file, index) {
        return /* @__PURE__ */ import_react4.default.createElement("li", {
            key: index
        }, /* @__PURE__ */ import_react4.default.createElement("button", {
            onClick: function(e) {
                return handleViewHtml(file, e);
            },
            className: "text-blue-600 hover:underline text-sm flex items-center"
        }, /* @__PURE__ */ import_react4.default.createElement("svg", {
            xmlns: "http://www.w3.org/2000/svg",
            className: "h-4 w-4 mr-1",
            viewBox: "0 0 20 20",
            fill: "currentColor"
        }, /* @__PURE__ */ import_react4.default.createElement("path", {
            fillRule: "evenodd",
            d: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z",
            clipRule: "evenodd"
        })), file));
    }))), selectedHtmlFile && /* @__PURE__ */ import_react4.default.createElement("div", {
        className: "mt-4 border rounded-lg overflow-hidden"
    }, /* @__PURE__ */ import_react4.default.createElement("div", {
        className: "bg-gray-200 p-2 flex justify-between items-center"
    }, /* @__PURE__ */ import_react4.default.createElement("span", {
        className: "text-sm font-medium"
    }, selectedHtmlFile), /* @__PURE__ */ import_react4.default.createElement("button", {
        onClick: handleCloseHtml,
        className: "text-gray-600 hover:text-gray-800"
    }, /* @__PURE__ */ import_react4.default.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        viewBox: "0 0 20 20",
        fill: "currentColor"
    }, /* @__PURE__ */ import_react4.default.createElement("path", {
        fillRule: "evenodd",
        d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z",
        clipRule: "evenodd"
    })))), /* @__PURE__ */ import_react4.default.createElement("div", {
        className: "bg-white p-0 h-96"
    }, /* @__PURE__ */ import_react4.default.createElement("iframe", {
        src: getHtmlUrl(selectedHtmlFile),
        className: "w-full h-full border-0",
        title: selectedHtmlFile
    })))));
};
// src/components/ChatInput.tsx
var import_react5 = __toESM(require("react"));
var ChatInput = function(param) {
    var onSendMessage = param.onSendMessage, _param_isLoading = param.isLoading, isLoading = _param_isLoading === void 0 ? false : _param_isLoading, _param_placeholder = param.placeholder, placeholder = _param_placeholder === void 0 ? "Type your message..." : _param_placeholder, _param_buttonText = param.buttonText, buttonText = _param_buttonText === void 0 ? "Send" : _param_buttonText;
    var _ref = _sliced_to_array((0, import_react5.useState)(""), 2), message = _ref[0], setMessage = _ref[1];
    var handleSubmit = function(e) {
        e.preventDefault();
        if (message.trim() && !isLoading) {
            onSendMessage(message);
            setMessage("");
        }
    };
    return /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("form", {
        onSubmit: handleSubmit,
        className: "flex gap-1 items-center"
    }, /* @__PURE__ */ import_react5.default.createElement("input", {
        type: "text",
        value: message,
        onChange: function(e) {
            return setMessage(e.target.value);
        },
        placeholder: placeholder,
        className: "flex-1 border px-3 py-2 rounded-d",
        disabled: isLoading
    }), /* @__PURE__ */ import_react5.default.createElement(Button, {
        type: "submit",
        className: "ml-2 px-4 py-2 bg-h1-new text-white rounded-d hover:bg-h1-light",
        disabled: !message.trim() || isLoading,
        isLoading: isLoading
    }, buttonText)));
};
// src/components/Sidebar.tsx
var import_react6 = __toESM(require("react"));
var Sidebar = function(param) {
    var currentSessionId = param.currentSessionId, sessions = param.sessions, _param_isLoading = param.isLoading, isLoading = _param_isLoading === void 0 ? false : _param_isLoading, onSessionSelect = param.onSessionSelect, onCreateSession = param.onCreateSession, onSignOut = param.onSignOut, onHtmlFileSelect = param.onHtmlFileSelect, _param_title = param.title, title = _param_title === void 0 ? "Chats" : _param_title;
    return /* @__PURE__ */ import_react6.default.createElement("div", {
        className: "w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col"
    }, /* @__PURE__ */ import_react6.default.createElement("div", {
        className: "p-4 border-b border-gray-200 flex items-center justify-between"
    }, /* @__PURE__ */ import_react6.default.createElement("h2", {
        className: "text-lg font-gilroy font-bold"
    }, title), /* @__PURE__ */ import_react6.default.createElement("button", {
        onClick: onCreateSession,
        className: "p-1 rounded-full bg-gray-200 hover:bg-gray-300",
        "aria-label": "Create new chat"
    }, /* @__PURE__ */ import_react6.default.createElement("svg", {
        width: "20",
        height: "20",
        viewBox: "0 0 20 20",
        fill: "none",
        xmlns: "http://www.w3.org/2000/svg"
    }, /* @__PURE__ */ import_react6.default.createElement("path", {
        d: "M10 13.3333V6.66667",
        stroke: "#323232",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
    }), /* @__PURE__ */ import_react6.default.createElement("path", {
        d: "M6.66666 10H13.3333",
        stroke: "#323232",
        strokeWidth: "1.5",
        strokeLinecap: "round",
        strokeLinejoin: "round"
    })))), /* @__PURE__ */ import_react6.default.createElement("div", {
        className: "flex-1 overflow-y-auto"
    }, isLoading ? /* @__PURE__ */ import_react6.default.createElement("div", {
        className: "p-4 text-center text-gray-500"
    }, "Loading...") : sessions.length === 0 ? /* @__PURE__ */ import_react6.default.createElement("div", {
        className: "p-4 text-center text-gray-500"
    }, "No chats available") : /* @__PURE__ */ import_react6.default.createElement("div", null, sessions.map(function(session) {
        return /* @__PURE__ */ import_react6.default.createElement("div", {
            key: session.id,
            className: "p-3 border-b border-gray-200 cursor-pointer ".concat(session.id === currentSessionId ? "bg-gray-200" : "hover:bg-gray-50"),
            onClick: function() {
                return onSessionSelect(session.id);
            }
        }, /* @__PURE__ */ import_react6.default.createElement("div", {
            className: "flex items-center justify-between"
        }, /* @__PURE__ */ import_react6.default.createElement("span", {
            className: "text-sm font-medium truncate"
        }, session.title || "Chat ".concat(session.id.slice(0, 6))), session.createdAt && /* @__PURE__ */ import_react6.default.createElement("span", {
            className: "text-xs text-gray-500"
        }, new Date(session.createdAt).toLocaleDateString())), onHtmlFileSelect && session.htmlFiles && session.htmlFiles.length > 0 && /* @__PURE__ */ import_react6.default.createElement("div", {
            className: "mt-2"
        }, /* @__PURE__ */ import_react6.default.createElement("p", {
            className: "text-xs text-gray-500 mb-1"
        }, "Files:"), /* @__PURE__ */ import_react6.default.createElement("ul", {
            className: "space-y-1"
        }, session.htmlFiles.map(function(file, index) {
            return /* @__PURE__ */ import_react6.default.createElement("li", {
                key: index
            }, /* @__PURE__ */ import_react6.default.createElement("button", {
                onClick: function(e) {
                    e.stopPropagation();
                    onHtmlFileSelect(file.name, file.outputFolder, session.id);
                },
                className: "text-xs text-blue-600 hover:underline"
            }, file.name));
        }))));
    }))), onSignOut && /* @__PURE__ */ import_react6.default.createElement("div", {
        className: "p-4 border-t border-gray-200"
    }, /* @__PURE__ */ import_react6.default.createElement("button", {
        onClick: onSignOut,
        className: "w-full py-2 px-4 flex items-center justify-center space-x-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
    }, /* @__PURE__ */ import_react6.default.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        className: "h-5 w-5",
        viewBox: "0 0 20 20",
        fill: "currentColor"
    }, /* @__PURE__ */ import_react6.default.createElement("path", {
        fillRule: "evenodd",
        d: "M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-8 1a1 1 0 00-1 1v2a1 1 0 001 1h3a1 1 0 100-2H7V9a1 1 0 00-1-1z",
        clipRule: "evenodd"
    })), /* @__PURE__ */ import_react6.default.createElement("span", null, "Sign Out"))));
};
// src/components/NavbarItem.tsx
var import_react7 = __toESM(require("react"));
var NavbarItem = function(param) {
    var session = param.session, _param_isActive = param.isActive, isActive = _param_isActive === void 0 ? false : _param_isActive, onClick = param.onClick, onHtmlFileSelect = param.onHtmlFileSelect;
    var formatDate = function(dateString) {
        if (!dateString) return "";
        try {
            var date = new Date(dateString);
            return date.toLocaleDateString();
        } catch (error) {
            return "";
        }
    };
    var hasHtmlFiles = session.htmlFiles && session.htmlFiles.length > 0 && session.outputFolder;
    return /* @__PURE__ */ import_react7.default.createElement("div", {
        className: "p-3 border-b border-gray-200 cursor-pointer ".concat(isActive ? "bg-gray-200" : "hover:bg-gray-50"),
        onClick: onClick
    }, /* @__PURE__ */ import_react7.default.createElement("div", {
        className: "flex items-center justify-between"
    }, /* @__PURE__ */ import_react7.default.createElement("span", {
        className: "text-sm font-medium truncate"
    }, session.title || "Chat ".concat(session.id.slice(0, 6))), session.createdAt && /* @__PURE__ */ import_react7.default.createElement("span", {
        className: "text-xs text-gray-500"
    }, formatDate(session.createdAt))), hasHtmlFiles && onHtmlFileSelect && /* @__PURE__ */ import_react7.default.createElement("div", {
        className: "mt-2"
    }, /* @__PURE__ */ import_react7.default.createElement("p", {
        className: "text-xs text-gray-500 mb-1"
    }, "Files:"), /* @__PURE__ */ import_react7.default.createElement("ul", {
        className: "space-y-1"
    }, session.htmlFiles.map(function(file, index) {
        return /* @__PURE__ */ import_react7.default.createElement("li", {
            key: index
        }, /* @__PURE__ */ import_react7.default.createElement("button", {
            onClick: function(e) {
                e.stopPropagation();
                onHtmlFileSelect(file, session.outputFolder, session.id);
            },
            className: "text-xs text-blue-600 hover:underline"
        }, file));
    }))));
};
// src/components/ChatContainer.tsx
var import_react8 = __toESM(require("react"));
var ChatContainer = function(param) {
    var messages = param.messages, sessionId = param.sessionId, _param_isLoading = param.isLoading, isLoading = _param_isLoading === void 0 ? false : _param_isLoading, _param_loadingMessage = param.loadingMessage, loadingMessage = _param_loadingMessage === void 0 ? "Loading conversation..." : _param_loadingMessage, _param_emptyMessage = param.emptyMessage, emptyMessage = _param_emptyMessage === void 0 ? "No messages yet. Start a conversation!" : _param_emptyMessage, renderMessage = param.renderMessage, htmlBaseUrl = param.htmlBaseUrl;
    var messagesEndRef = (0, import_react8.useRef)(null);
    (0, import_react8.useEffect)(function() {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({
                behavior: "smooth"
            });
        }
    }, [
        messages
    ]);
    return /* @__PURE__ */ import_react8.default.createElement("div", {
        className: "flex-1 p-4 overflow-y-auto"
    }, isLoading ? /* @__PURE__ */ import_react8.default.createElement("div", {
        className: "flex items-center justify-center h-full"
    }, /* @__PURE__ */ import_react8.default.createElement("p", {
        className: "text-gray-500"
    }, loadingMessage)) : messages.length === 0 ? /* @__PURE__ */ import_react8.default.createElement("div", {
        className: "flex items-center justify-center h-full"
    }, /* @__PURE__ */ import_react8.default.createElement("p", {
        className: "text-gray-500"
    }, emptyMessage)) : /* @__PURE__ */ import_react8.default.createElement("div", {
        className: "space-y-4"
    }, messages.map(function(message, index) {
        return /* @__PURE__ */ import_react8.default.createElement("div", {
            key: message.id || index
        }, renderMessage ? renderMessage(message, index) : /* @__PURE__ */ import_react8.default.createElement(ChatMessage, {
            message: message,
            sessionId: sessionId,
            htmlBaseUrl: htmlBaseUrl
        }));
    }), /* @__PURE__ */ import_react8.default.createElement("div", {
        ref: messagesEndRef
    })));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
    Button: Button,
    Card: Card,
    ChatContainer: ChatContainer,
    ChatInput: ChatInput,
    ChatMessage: ChatMessage,
    Input: Input,
    NavbarItem: NavbarItem,
    Sidebar: Sidebar
});
