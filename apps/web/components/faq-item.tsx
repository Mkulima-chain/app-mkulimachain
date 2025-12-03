"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface FAQItemProps {
  question: string
  answer: string
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card
      className="border-[#004D73]/10 hover:border-[#3A8F4C]/30 transition-all cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-[#5A3E36] mb-2">{question}</h3>
            {isOpen && (
              <p className="text-[#004D73] mt-3 leading-relaxed animate-fade-in">{answer}</p>
            )}
          </div>
          <button
            className={`flex-shrink-0 w-8 h-8 rounded-full bg-[#3A8F4C]/10 flex items-center justify-center transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          >
            <svg
              className="w-5 h-5 text-[#3A8F4C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

