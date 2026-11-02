"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { inputStyle } from "./AuthShell"

interface Props {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  autoComplete?: string
}

export default function PasswordInput({
  id, value, onChange, placeholder = "••••••••", required = true, minLength, autoComplete
}: Props) {
  const [show, setShow] = useState(false)

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        style={{ ...inputStyle, paddingRight: 46 }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        aria-pressed={show}
        style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          background: "none", border: "none", borderRadius: 8, cursor: "pointer", color: "#6B6962"
        }}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}