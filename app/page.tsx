"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { Send, Loader2, Bot, User, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ThemeToggle } from "@/components/theme-toggle"

// API URL - change this to your deployed backend URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Message {
  sender: "user" | "bot"
  text: string
  confidence?: number
  timestamp: Date
}

export default function MedicalChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Hello! I'm your health assistant. Ask me anything about medical topics!",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      sender: "user",
      text: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const res = await axios.post(`${API_URL}/ask`, { query: input })

      // Extract answer and confidence from response
      const { answer, confidence } = res.data

      const botReply: Message = {
        sender: "bot",
        text: answer,
        confidence: confidence,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botReply])
    } catch (err) {
      console.error("Error fetching response:", err)
      setError("Failed to connect to the chatbot server. Please try again later.")

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "⚠️ Failed to connect to the chatbot server. Please try again later.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) sendMessage()
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col rounded-xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900 transition-colors duration-300">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-900 p-4 md:p-6 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Medical Health Assistant</h1>
            </div>
            <ThemeToggle />
          </div>
          <p className="text-blue-100 mt-2 text-sm md:text-base">
            Your personal AI health companion. Ask me anything about health and wellness.
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50/50 dark:bg-slate-800/50 transition-colors duration-300">
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}
              >
                <div className={`flex items-start gap-2 max-w-[85%]`}>
                  {msg.sender === "bot" && (
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-full mt-0.5 transition-colors duration-300">
                      <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-2xl shadow-sm ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 text-white"
                        : "bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 dark:text-gray-100"
                    } transition-colors duration-300`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <span className="text-xs opacity-70">{formatTime(msg.timestamp)}</span>
                      {msg.confidence !== undefined && (
                        <span className="text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 px-1.5 py-0.5 rounded-full">
                          {(msg.confidence * 100).toFixed(0)}% match
                        </span>
                      )}
                    </div>
                    <p className="text-sm md:text-base">{msg.text}</p>
                  </div>

                  {msg.sender === "user" && (
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full mt-0.5 transition-colors duration-300">
                      <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start mb-4"
              >
                <div className="flex items-start gap-2">
                  <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1.5 rounded-full mt-0.5 transition-colors duration-300">
                    <Bot className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="p-3 rounded-2xl shadow-sm bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 transition-colors duration-300">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-300">Thinking...</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors duration-300">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleEnter}
              disabled={isLoading}
              placeholder="Ask your health question..."
              className="flex-1 p-3 rounded-xl border border-gray-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 focus:border-transparent transition-all bg-gray-50 dark:bg-slate-800 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className={`p-3 rounded-xl ${
                isLoading || !input.trim()
                  ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-600 dark:to-indigo-700 hover:opacity-90 active:scale-95"
              } text-white transition-all duration-200 flex items-center justify-center`}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            This AI assistant provides general information only, not medical advice. Always consult with healthcare
            professionals for medical concerns.
          </p>
        </div>
      </div>
    </div>
  )
}
