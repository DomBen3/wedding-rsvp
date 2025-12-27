import React, { useEffect, useRef, useState } from "react";
import usPhoto from "../../images/us.jpg";
import "./Home.css";

export default function Home() {
  const [rsvpOpen, setRsvpOpen] = useState(false);
  const [attendingAnswer, setAttendingAnswer] = useState(null); // "yes" | "no" | null
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, []);

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
    });
  }

  function handlePickAttending(answer) {
    if (!name.trim()) return;

    if (answer === "no") {
      transitionTo(() => {
        setAttendingAnswer("no");
        setSubmitted(true);
      });
      return;
    }

    transitionTo(() => {
      setAttendingAnswer("yes");
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    transitionTo(() => {
      setSubmitted(true);
    });
  }

  return (
      <main>
        <div
          className="home"
          style={{ backgroundImage: `url(${usPhoto})` }}
        >
          <div className="home-inner">
            <div className={`home-fade ${isFading ? "is-fading" : ""}`}>
              {!rsvpOpen ? (
                <>
                  <p className="home-kicker">We Are Getting Married</p>
                  <h1 className="home-title">Anna &amp; Dominic</h1>
                  <p className="home-copy">
                    <strong>Saturday, August 15th, 2026</strong> at <strong>5:00pm</strong> at the <a href="https://www.google.com/maps/place/32267+Clubhouse+Way,+Millsboro,+DE+19966/@38.6441445,-75.1901812,17z/data=!3m1!4b1!4m6!3m5!1s0x89b8c642e5ae0d7b:0x28d9016eea5af560!8m2!3d38.6441403!4d-75.1876063!16s%2Fg%2F11bw4g326t?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener noreferrer">Baywood Clubhouse</a> in Millsboro, Delaware.
                  </p>
                  <p className="home-copy">
                    We are so excited to celebrate with you. Please RSVP when you
                    can so we can plan accordingly.
                  </p>
                  <button className="home-cta" type="button" onClick={handleStartRsvp}>
                    Will You Attend
                  </button>
                </>
              ) : (
                <form className="home-form" onSubmit={handleSubmit}>
                  {submitted ? (
                    <>
                      <h2 className="home-formTitle">Thank you!</h2>
                      <p className="home-copy">We got your response.</p>
                    </>
                  ) : attendingAnswer === null ? (
                    <>
                      <h2 className="home-formTitle">RSVP</h2>
                    <p className="home-question">
                      Please put all names attending below.
                    </p>
                    <input
                      id="rsvp-name"
                      className="home-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      autoComplete="name"
                      required
                    />
                    <p className="home-question" style={{ width: "60%" }}>Do you think you will be attending (If you are not yet sure, please RSVP "Yes" for now)?</p>
                      <div className="home-choiceRow" role="group" aria-label="Attending?">
                        <button
                          className="home-cta home-choiceBtn"
                          type="button"
                        disabled={!name.trim()}
                          onClick={() => handlePickAttending("yes")}
                        >
                          Yes
                        </button>
                        <button
                          className="home-cta home-choiceBtn"
                          type="button"
                        disabled={!name.trim()}
                          onClick={() => handlePickAttending("no")}
                        >
                          No
                        </button>
                      </div>
                      <p className="home-rsvpNote">
                        This is an informal RSVP, we will send an official invitation at a later date.
                      </p>
                    </>
                  ) : attendingAnswer === "yes" ? (
                    <>
                      <h2 className="home-formTitle">Address</h2>
                      <p className="home-question" htmlFor="rsvp-address">
                        What address would you like to receive the invitation at?
                      </p>
                      <input
                        id="rsvp-address"
                        className="home-input"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, City, State, ZIP"
                        autoComplete="street-address"
                        required
                      />
                      <button
                        className="home-cta home-submit"
                        type="submit"
                        disabled={!address.trim()}
                      >
                        Submit
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="home-formTitle">Thank you!</h2>
                      <p className="home-copy">We got your response.</p>
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
