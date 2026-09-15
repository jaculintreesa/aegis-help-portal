const chatOverlay = document.getElementById("chatOverlay");
const chatBody = document.getElementById("chatBody");
const chatForm = document.getElementById("chatForm");
const messageInput = document.getElementById("messageInput");
const typing = document.getElementById("typing");
const closeChat = document.getElementById("closeChat");
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

/* ================================
   AEGIS CONVERSATION
================================ */

const questions = [
  {
    key: "name",
    text:
      "Hey. I'm Aegis. 🛡️\n\n" +
      "You don't have to explain everything at once. " +
      "What should I call you?"
  },
  {
    key: "age",
    text:
      "Nice to meet you, {name}. " +
      "How old are you?"
  },
  {
    key: "location",
    text:
      "Thanks, {name}. " +
      "Where are you reaching out from?"
  },
  {
    key: "email",
    text:
      "Got it. And where can I send a follow-up if needed?\n\n" +
      "What's your email address?"
  },
  {
    key: "grievance",
    text:
      "I've got what I need.\n\n" +
      "Now tell me... what's going on? " +
      "How can I help?"
  }
];

let state = {
  step: -1,
  data: {},
  started: false,
  completed: false
};

/* ================================
   MESSAGE FUNCTIONS
================================ */

function addMessage(text, type = "aegis") {
  const div = document.createElement("div");

  div.className = `message ${type}`;

  div.innerHTML = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>");

  chatBody.appendChild(div);
  chatBody.scrollTop = chatBody.scrollHeight;
}

function showAegis(text, delay = 600) {
  typing.classList.add("active");

  setTimeout(() => {
    if (state.completed) {
      typing.classList.remove("active");
      return;
    }

    typing.classList.remove("active");
    addMessage(text, "aegis");
  }, delay);
}

/* ================================
   QUESTION FLOW
================================ */

function nextQuestion() {
  if (state.completed) {
    return;
  }

  state.step++;

  if (state.step >= questions.length) {
    return;
  }

  let text = questions[state.step].text;

  text = text.replace(
    "{name}",
    state.data.name || "there"
  );

  showAegis(text);
}

/* ================================
   SEND AEGIS REQUEST BY EMAIL
================================ */

async function sendAegisRequest() {
  const now = new Date();

  const date = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });

  const time = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const emailData = {
    name: state.data.name,
    age: state.data.age,
    location: state.data.location,
    email: state.data.email,
    grievance: state.data.grievance,
    date: date,
    time: time,

    _subject: "🛡️ Someone Needs Your Help!",
    _template: "table",
    _captcha: "false"
  };

  try {
    const response = await fetch(
      "https://formsubmit.co/ajax/jkhjgy6@gmail.com",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },

        body: JSON.stringify(emailData)
      }
    );

    const result = await response.json();

    console.log("FormSubmit response:", result);

    if (
      !response.ok ||
      result.success === false
    ) {
      throw new Error("Email submission failed.");
    }

    return true;

  } catch (error) {
    console.error("Aegis email error:", error);
    return false;
  }
}

/* ================================
   OPEN / CLOSE CHAT
================================ */

function openChat() {
  chatOverlay.classList.add("open");

  chatOverlay.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.style.overflow = "hidden";

  if (!state.started) {
    state.started = true;

    chatBody.innerHTML = "";

    state.step = -1;
    state.data = {};
    state.completed = false;

    typing.classList.remove("active");

    messageInput.disabled = false;

    chatForm
      .querySelector("button")
      .disabled = false;

    messageInput.placeholder =
      "Type your response...";

    setTimeout(nextQuestion, 350);
  }

  setTimeout(() => {
    if (!messageInput.disabled) {
      messageInput.focus();
    }
  }, 700);
}

function closeChatPanel() {
  typing.classList.remove("active");

  /*
    Remove focus before hiding the chat overlay.
    This prevents the aria-hidden accessibility warning.
  */
  if (
    document.activeElement &&
    chatOverlay.contains(document.activeElement)
  ) {
    document.activeElement.blur();
  }

  chatOverlay.classList.remove("open");

  chatOverlay.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.style.overflow = "";
}

/* ================================
   CHAT BUTTONS
================================ */

document
  .querySelectorAll("[data-open-chat]")
  .forEach(button => {
    button.addEventListener(
      "click",
      openChat
    );
  });

closeChat.addEventListener(
  "click",
  closeChatPanel
);

chatOverlay.addEventListener(
  "click",
  event => {
    if (event.target === chatOverlay) {
      closeChatPanel();
    }
  }
);

document.addEventListener(
  "keydown",
  event => {
    if (
      event.key === "Escape" &&
      chatOverlay.classList.contains("open")
    ) {
      closeChatPanel();
    }
  }
);

/* ================================
   FORM SUBMISSION
================================ */

chatForm.addEventListener(
  "submit",
  async event => {
    event.preventDefault();

    const value =
      messageInput.value.trim();

    if (!value) {
      return;
    }

    if (state.completed) {
      return;
    }

    addMessage(value, "user");

    messageInput.value = "";

    const current =
      questions[state.step]?.key;

    /* ============================
       AGE VALIDATION
    ============================ */

    if (
      current === "age" &&
      !/^\d{1,3}$/.test(value)
    ) {
      showAegis(
        "Just a number is enough. " +
        "How old are you?"
      );

      return;
    }

    /* ============================
       EMAIL VALIDATION
    ============================ */

    if (
      current === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    ) {
      showAegis(
        "That email doesn't look quite right. " +
        "Could you check it and try again?"
      );

      return;
    }

    /* ============================
       SAVE RESPONSE
    ============================ */

    state.data[current] = value;

    /* ============================
       FINAL GRIEVANCE
    ============================ */

    if (current === "grievance") {

      state.completed = true;
      state.step = questions.length;

      typing.classList.remove("active");

      messageInput.disabled = true;

      chatForm
        .querySelector("button")
        .disabled = true;

      messageInput.placeholder =
        "Sending request...";

      typing.classList.add("active");

      const emailSent =
        await sendAegisRequest();

      typing.classList.remove("active");

      /* ==========================
         EMAIL SUCCESS
      ========================== */

      if (emailSent) {

        addMessage(
          "I've heard you. 💙\n\n" +
          "Your request has been received " +
          "and sent for follow-up.\n\n" +
          "Thank you for trusting Aegis " +
          "with your story.\n\n" +
          "You took the first step by speaking up. " +
          "You don't have to face it alone. 🛡️",
          "aegis"
        );

        messageInput.placeholder =
          "Request received ✓";

        console.log(
          "Aegis request sent:",
          state.data
        );

      }

      /* ==========================
         EMAIL FAILED
      ========================== */

      else {

        state.completed = false;

        messageInput.disabled = false;

        chatForm
          .querySelector("button")
          .disabled = false;

        messageInput.placeholder =
          "Try submitting again...";

        showAegis(
          "I couldn't send your request just yet. " +
          "Please try submitting your message again."
        );
      }

      return;
    }

    /* ============================
       NEXT QUESTION
    ============================ */

    setTimeout(
      nextQuestion,
      650
    );
  }
);

/* ================================
   MOBILE MENU
================================ */

menuBtn.addEventListener(
  "click",
  () => {
    navLinks.classList.toggle("show");
  }
);

navLinks
  .querySelectorAll("a, button")
  .forEach(item => {
    item.addEventListener(
      "click",
      () => {
        navLinks.classList.remove("show");
      }
    );
  });

/* ================================
   SCROLL REVEAL
================================ */

const observer =
  new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(
            "visible"
          );
        }
      });
    },
    {
      threshold: 0.12
    }
  );

document
  .querySelectorAll(".reveal")
  .forEach(element => {
    observer.observe(element);
  });