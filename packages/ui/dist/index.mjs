// src/components/Button.tsx
import React from "react";
var Button = React.forwardRef(
  ({
    children,
    className = "",
    variant = "primary",
    size = "md",
    isLoading = false,
    disabled,
    ...props
  }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
    const variantClasses = {
      primary: "bg-h1-new text-white hover:bg-h1-light focus:ring-h1-new",
      secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400",
      outline: "bg-transparent border border-gray-300 hover:bg-gray-100 focus:ring-gray-400",
      ghost: "bg-transparent hover:bg-gray-100 focus:ring-gray-400"
    };
    const sizeClasses = {
      sm: "text-xs px-2 py-1",
      md: "text-sm px-4 py-2",
      lg: "text-base px-6 py-3"
    };
    const loadingClasses = isLoading ? "relative !text-transparent" : "";
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        ref,
        className: `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${loadingClasses} ${className}`,
        disabled: disabled || isLoading,
        ...props
      },
      children,
      isLoading && /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 flex items-center justify-center" }, /* @__PURE__ */ React.createElement("svg", { className: "animate-spin h-5 w-5 text-current", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24" }, /* @__PURE__ */ React.createElement("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), /* @__PURE__ */ React.createElement("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })))
    );
  }
);
Button.displayName = "Button";

// src/components/Card.tsx
import React2 from "react";
var Card = React2.forwardRef(
  ({
    children,
    className = "",
    variant = "default",
    padding = "md",
    ...props
  }, ref) => {
    const baseClasses = "rounded-lg";
    const variantClasses = {
      default: "bg-white",
      bordered: "bg-white border border-gray-200",
      elevated: "bg-white shadow-md"
    };
    const paddingClasses = {
      none: "",
      sm: "p-2",
      md: "p-4",
      lg: "p-6"
    };
    return /* @__PURE__ */ React2.createElement(
      "div",
      {
        ref,
        className: `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`,
        ...props
      },
      children
    );
  }
);
Card.displayName = "Card";

// src/components/Input.tsx
import React3 from "react";
var Input = React3.forwardRef(
  ({
    className = "",
    label,
    error,
    helperText,
    disabled,
    ...props
  }, ref) => {
    const inputClasses = `
      w-full 
      px-3 
      py-2 
      border 
      rounded-md 
      focus:outline-none 
      focus:ring-2 
      focus:ring-offset-2 
      ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "border-gray-300 focus:border-h1-new focus:ring-h1-new"}
      ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
      ${className}
    `;
    return /* @__PURE__ */ React3.createElement("div", { className: "w-full" }, label && /* @__PURE__ */ React3.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, label), /* @__PURE__ */ React3.createElement(
      "input",
      {
        ref,
        disabled,
        className: inputClasses,
        "aria-invalid": error ? "true" : "false",
        "aria-describedby": error ? `${props.id}-error` : helperText ? `${props.id}-helper` : void 0,
        ...props
      }
    ), error && /* @__PURE__ */ React3.createElement(
      "p",
      {
        id: `${props.id}-error`,
        className: "mt-1 text-sm text-red-600"
      },
      error
    ), helperText && !error && /* @__PURE__ */ React3.createElement(
      "p",
      {
        id: `${props.id}-helper`,
        className: "mt-1 text-sm text-gray-500"
      },
      helperText
    ));
  }
);
Input.displayName = "Input";

// src/components/ChatMessage.tsx
import React4, { useState } from "react";
var ChatMessage = ({
  message,
  sessionId,
  htmlBaseUrl = "/user_output"
}) => {
  const isUser = message.sender === "user";
  const [selectedHtmlFile, setSelectedHtmlFile] = useState(null);
  const handleViewHtml = (file, e) => {
    e.preventDefault();
    setSelectedHtmlFile(file);
  };
  const handleCloseHtml = () => {
    setSelectedHtmlFile(null);
  };
  const getHtmlUrl = (file) => {
    if (message.outputFolder) {
      return `${htmlBaseUrl}/${message.outputFolder}/${file}`;
    } else if (sessionId) {
      return `/api/files/${sessionId}/${file}`;
    } else {
      return `/api/files/unknown/${file}`;
    }
  };
  const hasHtmlFiles = message.sender === "assistant" && message.htmlFiles && message.htmlFiles.length > 0 && message.outputFolder;
  return /* @__PURE__ */ React4.createElement(
    "div",
    {
      className: `flex ${isUser ? "justify-end" : "justify-start"}`
    },
    /* @__PURE__ */ React4.createElement(
      "div",
      {
        className: `max-w-3/4 p-3 rounded-lg ${isUser ? "bg-teal-500 text-white" : "bg-gray-100 text-gray-800"}`
      },
      /* @__PURE__ */ React4.createElement("p", { className: "whitespace-pre-wrap" }, message.content),
      hasHtmlFiles && /* @__PURE__ */ React4.createElement("div", { className: "mt-2 pt-2 border-t border-gray-200" }, /* @__PURE__ */ React4.createElement("p", { className: "text-sm font-medium mb-1" }, "Generated Graphics:"), /* @__PURE__ */ React4.createElement("ul", { className: "space-y-1" }, message.htmlFiles.map((file, index) => /* @__PURE__ */ React4.createElement("li", { key: index }, /* @__PURE__ */ React4.createElement(
        "button",
        {
          onClick: (e) => handleViewHtml(file, e),
          className: "text-blue-600 hover:underline text-sm flex items-center"
        },
        /* @__PURE__ */ React4.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4 mr-1", viewBox: "0 0 20 20", fill: "currentColor" }, /* @__PURE__ */ React4.createElement("path", { fillRule: "evenodd", d: "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z", clipRule: "evenodd" })),
        file
      ))))),
      selectedHtmlFile && /* @__PURE__ */ React4.createElement("div", { className: "mt-4 border rounded-lg overflow-hidden" }, /* @__PURE__ */ React4.createElement("div", { className: "bg-gray-200 p-2 flex justify-between items-center" }, /* @__PURE__ */ React4.createElement("span", { className: "text-sm font-medium" }, selectedHtmlFile), /* @__PURE__ */ React4.createElement(
        "button",
        {
          onClick: handleCloseHtml,
          className: "text-gray-600 hover:text-gray-800"
        },
        /* @__PURE__ */ React4.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, /* @__PURE__ */ React4.createElement("path", { fillRule: "evenodd", d: "M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z", clipRule: "evenodd" }))
      )), /* @__PURE__ */ React4.createElement("div", { className: "bg-white p-0 h-96" }, /* @__PURE__ */ React4.createElement(
        "iframe",
        {
          src: getHtmlUrl(selectedHtmlFile),
          className: "w-full h-full border-0",
          title: selectedHtmlFile
        }
      )))
    )
  );
};

// src/components/ChatInput.tsx
import React5, { useState as useState2 } from "react";
var ChatInput = ({
  onSendMessage,
  isLoading = false,
  placeholder = "Type your message...",
  buttonText = "Send"
}) => {
  const [message, setMessage] = useState2("");
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage("");
    }
  };
  return /* @__PURE__ */ React5.createElement("div", null, /* @__PURE__ */ React5.createElement("form", { onSubmit: handleSubmit, className: "flex gap-1 items-center" }, /* @__PURE__ */ React5.createElement(
    "input",
    {
      type: "text",
      value: message,
      onChange: (e) => setMessage(e.target.value),
      placeholder,
      className: "flex-1 border px-3 py-2 rounded-d",
      disabled: isLoading
    }
  ), /* @__PURE__ */ React5.createElement(
    Button,
    {
      type: "submit",
      className: "ml-2 px-4 py-2 bg-h1-new text-white rounded-d hover:bg-h1-light",
      disabled: !message.trim() || isLoading,
      isLoading
    },
    buttonText
  )));
};

// src/components/Sidebar.tsx
import React6 from "react";
var Sidebar = ({
  currentSessionId,
  sessions,
  isLoading = false,
  onSessionSelect,
  onCreateSession,
  onSignOut,
  onHtmlFileSelect,
  title = "Chats"
}) => {
  return /* @__PURE__ */ React6.createElement("div", { className: "w-64 h-screen bg-gray-100 border-r border-gray-200 flex flex-col" }, /* @__PURE__ */ React6.createElement("div", { className: "p-4 border-b border-gray-200 flex items-center justify-between" }, /* @__PURE__ */ React6.createElement("h2", { className: "text-lg font-gilroy font-bold" }, title), /* @__PURE__ */ React6.createElement(
    "button",
    {
      onClick: onCreateSession,
      className: "p-1 rounded-full bg-gray-200 hover:bg-gray-300",
      "aria-label": "Create new chat"
    },
    /* @__PURE__ */ React6.createElement("svg", { width: "20", height: "20", viewBox: "0 0 20 20", fill: "none", xmlns: "http://www.w3.org/2000/svg" }, /* @__PURE__ */ React6.createElement("path", { d: "M10 13.3333V6.66667", stroke: "#323232", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }), /* @__PURE__ */ React6.createElement("path", { d: "M6.66666 10H13.3333", stroke: "#323232", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round" }))
  )), /* @__PURE__ */ React6.createElement("div", { className: "flex-1 overflow-y-auto" }, isLoading ? /* @__PURE__ */ React6.createElement("div", { className: "p-4 text-center text-gray-500" }, "Loading...") : sessions.length === 0 ? /* @__PURE__ */ React6.createElement("div", { className: "p-4 text-center text-gray-500" }, "No chats available") : /* @__PURE__ */ React6.createElement("div", null, sessions.map((session) => /* @__PURE__ */ React6.createElement(
    "div",
    {
      key: session.id,
      className: `p-3 border-b border-gray-200 cursor-pointer ${session.id === currentSessionId ? "bg-gray-200" : "hover:bg-gray-50"}`,
      onClick: () => onSessionSelect(session.id)
    },
    /* @__PURE__ */ React6.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React6.createElement("span", { className: "text-sm font-medium truncate" }, session.title || `Chat ${session.id.slice(0, 6)}`), session.createdAt && /* @__PURE__ */ React6.createElement("span", { className: "text-xs text-gray-500" }, new Date(session.createdAt).toLocaleDateString())),
    onHtmlFileSelect && session.htmlFiles && session.htmlFiles.length > 0 && /* @__PURE__ */ React6.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React6.createElement("p", { className: "text-xs text-gray-500 mb-1" }, "Files:"), /* @__PURE__ */ React6.createElement("ul", { className: "space-y-1" }, session.htmlFiles.map((file, index) => /* @__PURE__ */ React6.createElement("li", { key: index }, /* @__PURE__ */ React6.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          onHtmlFileSelect(file.name, file.outputFolder, session.id);
        },
        className: "text-xs text-blue-600 hover:underline"
      },
      file.name
    )))))
  )))), onSignOut && /* @__PURE__ */ React6.createElement("div", { className: "p-4 border-t border-gray-200" }, /* @__PURE__ */ React6.createElement(
    "button",
    {
      onClick: onSignOut,
      className: "w-full py-2 px-4 flex items-center justify-center space-x-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors"
    },
    /* @__PURE__ */ React6.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor" }, /* @__PURE__ */ React6.createElement("path", { fillRule: "evenodd", d: "M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-8 1a1 1 0 00-1 1v2a1 1 0 001 1h3a1 1 0 100-2H7V9a1 1 0 00-1-1z", clipRule: "evenodd" })),
    /* @__PURE__ */ React6.createElement("span", null, "Sign Out")
  )));
};

// src/components/NavbarItem.tsx
import React7 from "react";
var NavbarItem = ({
  session,
  isActive = false,
  onClick,
  onHtmlFileSelect
}) => {
  const formatDate = (dateString) => {
    if (!dateString)
      return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return "";
    }
  };
  const hasHtmlFiles = session.htmlFiles && session.htmlFiles.length > 0 && session.outputFolder;
  return /* @__PURE__ */ React7.createElement(
    "div",
    {
      className: `p-3 border-b border-gray-200 cursor-pointer ${isActive ? "bg-gray-200" : "hover:bg-gray-50"}`,
      onClick
    },
    /* @__PURE__ */ React7.createElement("div", { className: "flex items-center justify-between" }, /* @__PURE__ */ React7.createElement("span", { className: "text-sm font-medium truncate" }, session.title || `Chat ${session.id.slice(0, 6)}`), session.createdAt && /* @__PURE__ */ React7.createElement("span", { className: "text-xs text-gray-500" }, formatDate(session.createdAt))),
    hasHtmlFiles && onHtmlFileSelect && /* @__PURE__ */ React7.createElement("div", { className: "mt-2" }, /* @__PURE__ */ React7.createElement("p", { className: "text-xs text-gray-500 mb-1" }, "Files:"), /* @__PURE__ */ React7.createElement("ul", { className: "space-y-1" }, session.htmlFiles.map((file, index) => /* @__PURE__ */ React7.createElement("li", { key: index }, /* @__PURE__ */ React7.createElement(
      "button",
      {
        onClick: (e) => {
          e.stopPropagation();
          onHtmlFileSelect(file, session.outputFolder, session.id);
        },
        className: "text-xs text-blue-600 hover:underline"
      },
      file
    )))))
  );
};

// src/components/ChatContainer.tsx
import React8, { useRef, useEffect } from "react";
var ChatContainer = ({
  messages,
  sessionId,
  isLoading = false,
  loadingMessage = "Loading conversation...",
  emptyMessage = "No messages yet. Start a conversation!",
  renderMessage,
  htmlBaseUrl
}) => {
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  return /* @__PURE__ */ React8.createElement("div", { className: "flex-1 p-4 overflow-y-auto" }, isLoading ? /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-center h-full" }, /* @__PURE__ */ React8.createElement("p", { className: "text-gray-500" }, loadingMessage)) : messages.length === 0 ? /* @__PURE__ */ React8.createElement("div", { className: "flex items-center justify-center h-full" }, /* @__PURE__ */ React8.createElement("p", { className: "text-gray-500" }, emptyMessage)) : /* @__PURE__ */ React8.createElement("div", { className: "space-y-4" }, messages.map((message, index) => /* @__PURE__ */ React8.createElement("div", { key: message.id || index }, renderMessage ? renderMessage(message, index) : /* @__PURE__ */ React8.createElement(
    ChatMessage,
    {
      message,
      sessionId,
      htmlBaseUrl
    }
  ))), /* @__PURE__ */ React8.createElement("div", { ref: messagesEndRef })));
};
export {
  Button,
  Card,
  ChatContainer,
  ChatInput,
  ChatMessage,
  Input,
  NavbarItem,
  Sidebar
};
