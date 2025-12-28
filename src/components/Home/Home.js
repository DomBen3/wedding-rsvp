import React, { useEffect, useRef, useState } from "react";
import usPhoto from "../../images/us.jpg";
import "./Home.css";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/mnjqjawj";
const HISTORY_STEP_KEY = "__wedding_rsvp_step";

export default function Home() {
  const translations = {
    en: {
      langLabel: "Language",
      langEnglish: "EN",
      langKorean: "한국어",

      kicker: "We Are Getting Married",
      title: "Anna & Dominic",
      intro: {
        date: "Saturday, August 15th, 2026",
        time: "5:00pm",
        venueName: "Baywood Clubhouse",
        venueCity: "Millsboro, Delaware",
        line: "at {{time}} at the {{venueLink}} in {{venueCity}}.",
      },
      copy1:
        "We are so excited to celebrate with you. Please RSVP when you can so we can plan accordingly.",
      ctaAttend: "Will You Attend",

      form: {
        errorNameRequired: "Please enter your name first.",
        errorRsvpSend: "Something went wrong sending your RSVP.",
        errorAddressSend: "Something went wrong sending your address.",

        thankYouTitle: "Thank you!",
        received: "We got your response.",

        rsvpTitle: "RSVP",
        partyNames:
          "Please put the names of everyone in your family/party who will be attending below.",
        fullNamePlaceholder: "Full Name",
        attendingQuestion:
          'Do you think you will be attending (If you are not yet sure, please RSVP "Yes" for now)?',
        yes: "Yes",
        no: "No",
        sending: "Sending...",
        informalNote:
          "This is an informal RSVP, we will send an official invitation at a later date.",

        addressTitle: "Address",
        addressQuestion: "What address would you like to receive the invitation at?",
        addressPlaceholder: "Street, City, State, ZIP",
        submit: "Submit",
      },
    },
    ko: {
      langLabel: "언어",
      langEnglish: "EN",
      langKorean: "한국어",

      kicker: "결혼합니다",
      title: "Anna & Dominic",
      intro: {
        date: "2026년 8월 15일 (토)",
        time: "오후 5:00",
        venueName: "Baywood Clubhouse",
        venueCity: "델라웨어주 밀스보로",
        line: "{{date}} {{time}} · {{venueLink}} ({{venueCity}})",
      },
      copy1:
        "함께 축하해 주셔서 감사합니다. 준비에 도움이 될 수 있도록 가능하실 때 RSVP를 부탁드립니다.",
      ctaAttend: "참석하시나요?",

      form: {
        errorNameRequired: "먼저 이름을 입력해 주세요.",
        errorRsvpSend: "RSVP 전송 중 문제가 발생했습니다.",
        errorAddressSend: "주소 전송 중 문제가 발생했습니다.",

        thankYouTitle: "감사합니다!",
        received: "응답이 접수되었습니다.",

        rsvpTitle: "RSVP",
        partyNames: "참석하실 가족/일행의 모든 성함을 아래에 입력해 주세요.",
        fullNamePlaceholder: "성함 (전체)",
        attendingQuestion:
          '참석하실 예정인가요? (아직 확실하지 않으시면 우선 "예"로 RSVP해 주세요.)',
        yes: "예",
        no: "아니요",
        sending: "전송 중...",
        informalNote:
          "이는 간단한 RSVP이며, 추후 정식 청첩장을 보내드릴 예정입니다.",

        addressTitle: "주소",
        addressQuestion: "청첩장을 받으실 주소를 입력해 주세요.",
        addressPlaceholder: "도로명, 도시, 주, 우편번호",
        submit: "제출",
      },
    },
  };

  const [lang, setLang] = useState("en"); // "en" | "ko"
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [attendingAnswer, setAttendingAnswer] = useState(null); // "yes" | "no" | null
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isFading, setIsFading] = useState(false);
  const fadeTimerRef = useRef(null);
  const isApplyingHistoryStepRef = useRef(false);

  const t = translations[lang] || translations.en;

  function getRsvpStep({ rsvpOpen: ro, attendingAnswer: aa, submitted: sub }) {
    if (!ro) return "landing";
    if (sub) return aa === "no" ? "thanks_no" : "thanks_yes";
    if (aa === "yes") return "address";
    return "rsvp";
  }

  function applyRsvpStep(step) {
    setSubmitError("");
    switch (step) {
      case "landing":
        setRsvpOpen(false);
        return;
      case "rsvp":
        setRsvpOpen(true);
        setSubmitted(false);
        setAttendingAnswer(null);
        return;
      case "address":
        setRsvpOpen(true);
        setSubmitted(false);
        setAttendingAnswer("yes");
        return;
      case "thanks_no":
        setRsvpOpen(true);
        setAttendingAnswer("no");
        setSubmitted(true);
        return;
      case "thanks_yes":
      default:
        setRsvpOpen(true);
        setAttendingAnswer("yes");
        setSubmitted(true);
        return;
    }
  }

  useEffect(() => {
    // try localStorage first, then fall back to browser language
    try {
      const saved = window.localStorage.getItem("wedding_lang");
      if (saved === "en" || saved === "ko") {
        setLang(saved);
        return;
      }
    } catch {
      // ignore
    }
    try {
      const browserLang = navigator?.language || "";
      if (browserLang.toLowerCase().startsWith("ko")) setLang("ko");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("wedding_lang", lang);
    } catch {
      // ignore
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

  // Keep the RSVP "step" in the browser history so Back goes to the previous step when possible.
  useEffect(() => {
    const initialStep = getRsvpStep({
      rsvpOpen: false,
      attendingAnswer: null,
      submitted: false,
    });
    try {
      const existing = window.history.state || {};
      if (existing?.[HISTORY_STEP_KEY] !== initialStep) {
        window.history.replaceState(
          { ...existing, [HISTORY_STEP_KEY]: initialStep },
          document.title
        );
      }
    } catch {
      // ignore history errors (e.g., restricted environments)
    }

    function onPopState(e) {
      const step = e?.state?.[HISTORY_STEP_KEY];
      if (!step) return;
      isApplyingHistoryStepRef.current = true;
      // use the same fade transition for a consistent feel
      transitionTo(() => applyRsvpStep(step));
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const step = getRsvpStep({ rsvpOpen, attendingAnswer, submitted });
    try {
      const existing = window.history.state || {};
      // If we're responding to a Back/Forward navigation, don't add another history entry.
      if (isApplyingHistoryStepRef.current) {
        window.history.replaceState(
          { ...existing, [HISTORY_STEP_KEY]: step },
          document.title
        );
      } else if (existing?.[HISTORY_STEP_KEY] !== step) {
        window.history.pushState(
          { ...existing, [HISTORY_STEP_KEY]: step },
          document.title
        );
      }
    } catch {
      // ignore history errors
    } finally {
      isApplyingHistoryStepRef.current = false;
    }
  }, [rsvpOpen, attendingAnswer, submitted]);

  async function submitToFormspree(payload) {
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const data = await res.json();
          detail = data?.error || data?.message || "";
        } catch {
          // ignore json parse errors
        }
        throw new Error(detail || `Form submit failed (${res.status})`);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function transitionTo(nextStateFn, ms = 180) {
    setIsFading(true);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      nextStateFn();
      setIsFading(false);
    }, ms);
  }

  function handleStartRsvp() {
    transitionTo(() => {
      setRsvpOpen(true);
      setSubmitted(false);
      setAttendingAnswer(null);
      setName("");
      setAddress("");
      setSubmitError("");
    });
  }

  async function handlePickAttending(answer) {
    if (!name.trim()) return;

    if (answer === "no") {
      try {
        await submitToFormspree({
          name: name.trim(),
          answers: name.trim(),
          answer: "no",
          address: "",
        });
        transitionTo(() => {
          setAttendingAnswer("no");
          setSubmitted(true);
        });
      } catch (err) {
        setSubmitError(err?.message || t.form.errorRsvpSend);
      }
      return;
    }

    transitionTo(() => {
      setAttendingAnswer("yes");
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setSubmitError(t.form.errorNameRequired);
      return;
    }
    if (attendingAnswer !== "yes") return;
    if (!address.trim()) return;

    try {
      await submitToFormspree({
        name: name.trim(),
        answers: name.trim(),
        answer: "yes",
        address: address.trim(),
      });
      transitionTo(() => {
        setSubmitted(true);
      });
    } catch (err) {
      setSubmitError(err?.message || t.form.errorAddressSend);
    }
  }

  return (
      <main lang={lang}>
        <div className="home-langRow" aria-label={t.langLabel}>
                    <button
                      type="button"
                      className={`home-langBtn ${lang === "en" ? "is-active" : ""}`}
                      onClick={() => setLang("en")}
                      aria-pressed={lang === "en"}
                    >
                      {t.langEnglish}
                    </button>
                    <button
                      type="button"
                      className={`home-langBtn ${lang === "ko" ? "is-active" : ""}`}
                      onClick={() => setLang("ko")}
                      aria-pressed={lang === "ko"}
                    >
                      {t.langKorean}
                    </button>
                  </div>
        <div
          className="home"
          style={{ backgroundImage: `url(${usPhoto})` }}
        >
          <div className="home-inner">
            <div className={`home-fade ${isFading ? "is-fading" : ""}`}>
              {!rsvpOpen ? (
                <>
                  <p className="home-kicker">{t.kicker}</p>
                  <h1 className="home-title">{t.title}</h1>
                  <p className="home-copy">
                    <strong>{t.intro.date}</strong>{" "}
                    {lang === "en" ? (
                      <>
                        at <strong>{t.intro.time}</strong> at the{" "}
                        <a
                          href="https://www.google.com/maps/place/32267+Clubhouse+Way,+Millsboro,+DE+19966/@38.6441445,-75.1901812,17z/data=!3m1!4b1!4m6!3m5!1s0x89b8c642e5ae0d7b:0x28d9016eea5af560!8m2!3d38.6441403!4d-75.1876063!16s%2Fg%2F11bw4g326t?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.intro.venueName}
                        </a>{" "}
                        in {t.intro.venueCity}.
                      </>
                    ) : (
                      <>
                        {" "}
                        <strong>{t.intro.time}</strong> ·{" "}
                        <a
                          href="https://www.google.com/maps/place/32267+Clubhouse+Way,+Millsboro,+DE+19966/@38.6441445,-75.1901812,17z/data=!3m1!4b1!4m6!3m5!1s0x89b8c642e5ae0d7b:0x28d9016eea5af560!8m2!3d38.6441403!4d-75.1876063!16s%2Fg%2F11bw4g326t?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.intro.venueName}
                        </a>{" "}
                        ({t.intro.venueCity})
                      </>
                    )}
                  </p>
                  <p className="home-copy">
                    {t.copy1}
                  </p>
                  <button className="home-cta" type="button" onClick={handleStartRsvp}>
                    {t.ctaAttend}
                  </button>
                </>
              ) : (
                <form className="home-form" onSubmit={handleSubmit}>
                  {!!submitError && !submitted && (
                    <p className="home-formError" role="alert">
                      {submitError}
                    </p>
                  )}
                  {submitted ? (
                    <>
                      <h2 className="home-formTitle">{t.form.thankYouTitle}</h2>
                      <p className="home-copy">{t.form.received}</p>
                    </>
                  ) : attendingAnswer === null ? (
                    <>
                      <h2 className="home-formTitle">{t.form.rsvpTitle}</h2>
                    <p className="home-question">
                      {t.form.partyNames}
                    </p>
                    <input
                      id="rsvp-name"
                      className="home-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t.form.fullNamePlaceholder}
                      autoComplete="name"
                      required
                    />
                    <p className="home-question" style={{ width: "60%" }}>
                      {t.form.attendingQuestion}
                    </p>
                      <div className="home-choiceRow" role="group" aria-label="Attending?">
                        <button
                          className="home-cta home-choiceBtn"
                          type="button"
                        disabled={!name.trim() || isSubmitting}
                          onClick={() => handlePickAttending("yes")}
                        >
                          {t.form.yes}
                        </button>
                        <button
                          className="home-cta home-choiceBtn"
                          type="button"
                        disabled={!name.trim() || isSubmitting}
                          onClick={() => handlePickAttending("no")}
                        >
                          {t.form.no}
                        </button>
                      </div>
                      {isSubmitting && (
                        <p className="home-rsvpNote">{t.form.sending}</p>
                      )}
                      <p className="home-rsvpNote">
                        {t.form.informalNote}
                      </p>
                    </>
                  ) : attendingAnswer === "yes" ? (
                    <>
                      <h2 className="home-formTitle">{t.form.addressTitle}</h2>
                      <p className="home-question">{t.form.addressQuestion}</p>
                      <input
                        id="rsvp-address"
                        className="home-input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t.form.addressPlaceholder}
                        autoComplete="street-address"
                        required
                      />
                      <button
                        className="home-cta home-submit"
                        type="submit"
                        disabled={!address.trim() || isSubmitting}
                      >
                        {isSubmitting ? t.form.sending : t.form.submit}
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="home-formTitle">{t.form.thankYouTitle}</h2>
                      <p className="home-copy">{t.form.received}</p>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
  );
}
