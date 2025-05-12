"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ApiService: () => ApiService,
  AskRequest: () => import_types.AskRequest,
  AskResponse: () => import_types.AskResponse,
  BackendMessage: () => import_types.BackendMessage,
  BackendSession: () => import_types.BackendSession,
  DatasetType: () => import_types.DatasetType,
  Message: () => import_types.Message,
  Session: () => import_types.Session,
  createApiClient: () => createApiClient,
  createPublicApiClient: () => createPublicApiClient
});
module.exports = __toCommonJS(index_exports);

// src/types.ts
var import_types = require("@neurofinance/types");

// src/client.ts
var import_axios = __toESM(require("axios"));
var DEFAULT_API_BASE_URL = "http://localhost:8000";
var createApiClient = (config = {}) => {
  const baseURL = config.baseUrl || DEFAULT_API_BASE_URL;
  const client = import_axios.default.create({
    baseURL,
    headers: {
      "Content-Type": "application/json"
    }
  });
  if (config.getAccessToken) {
    client.interceptors.request.use(async (axiosConfig) => {
      try {
        const token = await config.getAccessToken?.();
        if (token) {
          axiosConfig.headers.Authorization = `Bearer ${token}`;
        }
        return axiosConfig;
      } catch (error) {
        console.error("Error accessing auth token:", error);
        return axiosConfig;
      }
    });
  }
  return client;
};
var createPublicApiClient = (baseUrl) => {
  return import_axios.default.create({
    baseURL: baseUrl || DEFAULT_API_BASE_URL,
    headers: {
      "Content-Type": "application/json"
    }
  });
};

// src/services.ts
var import_axios2 = __toESM(require("axios"));
var sessionsCache = null;
var sessionsCacheTime = 0;
var CACHE_EXPIRY_MS = 5e3;
var invalidateCache = () => {
  sessionsCache = null;
};
var ApiService = class {
  constructor(apiClient) {
    this.client = apiClient;
  }
  /**
   * Updates or creates a session
   */
  async updateSession(sessionId, htmlFiles, outputFolder, lastMessage) {
    try {
      const response = await this.client.put(`/sessions/${sessionId}`, {
        html_files: htmlFiles,
        output_folder: outputFolder,
        last_message: lastMessage
      });
      const updatedSession = {
        id: response.data.id,
        lastMessage: response.data.last_message || "Neue Konversation",
        timestamp: response.data.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        htmlFiles: response.data.html_files || [],
        outputFolder: response.data.output_folder || outputFolder
      };
      invalidateCache();
      return updatedSession;
    } catch (error) {
      console.error("Error updating session:", error);
      throw error;
    }
  }
  /**
   * Retrieves messages for a specific session
   */
  async getSessionMessages(sessionId) {
    try {
      const response = await this.client.get(`/sessions/${sessionId}/messages`);
      const messages = response.data.map((msg) => ({
        id: msg.id,
        userId: msg.userId,
        content: msg.content,
        sender: msg.sender,
        htmlFiles: msg.htmlFiles || [],
        outputFolder: msg.outputFolder,
        timestamp: msg.timestamp
      }));
      return messages;
    } catch (error) {
      console.error("Error retrieving session messages:", error);
      if (import_axios2.default.isAxiosError(error)) {
        const axiosError = error;
        console.error("Axios error details:", axiosError.response?.data);
        throw new Error(
          axiosError.response?.data?.detail || "Error retrieving messages"
        );
      } else {
        throw new Error("Unknown error retrieving messages");
      }
    }
  }
  /**
   * Asks a question to the backend agent for a specific session
   */
  async askQuestion(sessionId, question) {
    const payload = {
      session_id: sessionId,
      question
    };
    try {
      const response = await this.client.post("/ask", payload);
      return response.data;
    } catch (error) {
      console.error("Error calling /ask endpoint:", error);
      if (import_axios2.default.isAxiosError(error)) {
        const axiosError = error;
        console.error("Axios error details:", axiosError.response?.data);
        throw new Error(
          axiosError.response?.data?.detail || "Error querying the agent"
        );
      } else {
        throw new Error("Unknown error querying the agent");
      }
    }
  }
  /**
   * Retrieves all sessions for the current user
   */
  async getSessions() {
    const now = Date.now();
    if (sessionsCache && now - sessionsCacheTime < CACHE_EXPIRY_MS) {
      return sessionsCache;
    }
    try {
      const response = await this.client.get("/sessions");
      const transformedSessions = response.data.map((session) => ({
        id: session.id,
        userId: session.user_id,
        lastMessage: session.last_message || "Neue Konversation",
        timestamp: session.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        htmlFiles: session.html_files || [],
        outputFolder: session.output_folder
      }));
      sessionsCache = transformedSessions;
      sessionsCacheTime = now;
      return transformedSessions;
    } catch (error) {
      console.error("Error retrieving sessions:", error);
      throw error;
    }
  }
  /**
   * Creates a new session
   */
  async createSession(sessionId) {
    try {
      const outputFolder = `user_question_output_${sessionId.substring(0, 4)}`;
      const updatedSession = await this.updateSession(
        sessionId,
        [],
        outputFolder,
        "Neue Konversation"
      );
      return updatedSession;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }
  /**
   * Adds a message to a session
   */
  async addMessage(sessionId, content, sender) {
    const payload = {
      content,
      sender
    };
    try {
      const response = await this.client.post(
        `/sessions/${sessionId}/messages`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Error adding message:", error);
      if (import_axios2.default.isAxiosError(error)) {
        const axiosError = error;
        console.error("Axios error details:", axiosError.response?.data);
        throw new Error(
          axiosError.response?.data?.detail || "Error adding message"
        );
      } else {
        throw new Error("Unknown error adding message");
      }
    }
  }
  /**
   * Health check function
   */
  async checkHealth() {
    try {
      const response = await this.client.get("/health");
      return response.data;
    } catch (error) {
      console.error("Health check error:", error);
      throw error;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiService,
  AskRequest,
  AskResponse,
  BackendMessage,
  BackendSession,
  DatasetType,
  Message,
  Session,
  createApiClient,
  createPublicApiClient
});
//# sourceMappingURL=index.js.map