"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function Profile({ user }) {
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef(null);
  const isIssuer = user?.role === "issuer";

  // Close modal on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setShowModal(!showModal)}
        className="flex items-center gap-2 rounded-full bg-zinc-800 pl-1 pr-3 py-1 text-sm font-medium text-white cursor-pointer transition-colors hover:bg-zinc-700"
      >
        {/* Avatar circle */}
        <div
          className={`h-8 w-8 rounded-full flex items-center justify-center text-base font-semibold ${
            isIssuer ? "bg-white text-black" : "bg-white text-black"
          }`}
        >
          {isIssuer ? "I" : "U"}
        </div>
        <span>{user?.username}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${showModal ? "rotate-180" : ""}`}
        />
      </button>

      {showModal && (
        <ProfileModal user={user} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
