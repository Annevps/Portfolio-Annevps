const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const subject = document.getElementById("subject");
    const message = document.getElementById("message");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const subjectError = document.getElementById("subjectError");
    const messageError = document.getElementById("messageError");

    let isValid = true;

    const clearError = (field, errorElement, message) => {
      if (field) {
        field.setAttribute("aria-invalid", "false");
      }
      if (errorElement) {
        errorElement.textContent = "";
      }
    };

    const setError = (field, errorElement, message) => {
      isValid = false;
      if (field) {
        field.setAttribute("aria-invalid", "true");
      }
      if (errorElement) {
        errorElement.textContent = message;
      }
    };

    clearError(name, nameError);
    clearError(email, emailError);
    clearError(subject, subjectError);
    clearError(message, messageError);

    if (!name.value.trim()) {
      setError(name, nameError, "Por favor, informe seu nome.");
    }

    if (!email.value.trim()) {
      setError(email, emailError, "Por favor, informe seu e-mail.");
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.value.trim())) {
        setError(email, emailError, "Digite um e-mail válido.");
      }
    }

    if (!subject.value.trim()) {
      setError(subject, subjectError, "Por favor, informe o assunto.");
    }

    if (!message.value.trim()) {
      setError(message, messageError, "Escreva sua mensagem.");
    } else if (message.value.trim().length < 10) {
      setError(message, messageError, "A mensagem deve ter pelo menos 10 caracteres.");
    }

    if (isValid) {
      alert("Mensagem enviada com sucesso! Em breve entrarei em contato.");
      contactForm.reset();
    }
  });
}