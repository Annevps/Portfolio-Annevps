/* =========================================================
   ANNE VITÓRIA — script principal
========================================================= */
const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "sb_secret_U6qHc5-h3ukVuOhjrsKXlA_D0gLtM5zsb_secret_U6qHc5-h3ukVuOhjrsKXlA_D0gLtM5z";

let supabaseClient = null;
let selectedProject = null;

function initSupabase() {
  if (typeof window.supabase === "undefined") {
    console.error("Supabase não foi carregado");
    return false;
  }
  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return true;
}

/* -------- Botão Admin -------- */
const adminButton = document.querySelector(".admin-button");
if (adminButton) {
  adminButton.addEventListener("click", () => {
    window.location.href = "admin.html";
  });
}

/* -------- Menu mobile -------- */
const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector(".main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 720) {
        mainNav.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });
}

/* -------- Efeito digitação -------- */
const typingCode = document.getElementById("typingCode");
if (typingCode) {
  const codeText = `const anne = {
  nome: "Anne Vitória",
  idade: 16,
  cidade: "Carlos Chagas - MG",
  estudando: "Tecnologia da Informação",
  interesse: "Programação e Desenvolvimento Web",
  objetivo: "Construir meu futuro"
};

console.log("Bem-vindo! 🚀");`;

  let i = 0;
  (function type() {
    if (i < codeText.length) {
      typingCode.textContent += codeText.charAt(i++);
      setTimeout(type, 22);
    }
  })();
}

/* -------- Reveal on scroll -------- */
function observeRevealElements() {
  const elements = document.querySelectorAll(".reveal-section, .reveal-item");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  elements.forEach((el) => observer.observe(el));
}

/* -------- Carregar projetos -------- */
async function loadProjects() {
  const projectsGrid = document.getElementById("projectsGrid");
  if (!projectsGrid) return;

  if (!initSupabase()) {
    projectsGrid.innerHTML = `<p class="projects-message">Erro ao carregar o Supabase.</p>`;
    return;
  }

  const { data: projects, error } = await supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    projectsGrid.innerHTML = `<p class="projects-message">Não foi possível carregar os projetos no momento.</p>`;
    console.error(error);
    return;
  }

  if (!projects || projects.length === 0) {
    projectsGrid.innerHTML = `<p class="projects-message">Ainda não existem projetos cadastrados.</p>`;
    return;
  }

  projectsGrid.innerHTML = projects
    .map((project) => {
      const imageMarkup = project.image_url
        ? `<img src="${project.image_url}" alt="Imagem do projeto ${project.title}" loading="lazy" />`
        : `<div class="project-placeholder"><i class="fas fa-code"></i></div>`;

      const safeTitle = project.title.replace(/'/g, "\\'");
      const safeCategory = (project.category || "").replace(/'/g, "\\'");
      const safeDesc = (project.description || "").replace(/'/g, "\\'");
      const safeImg = (project.image_url || "").replace(/'/g, "\\'");
      const safeUrl = (project.project_url || "").replace(/'/g, "\\'");

      return `
        <article class="project-card reveal-item"
          onclick="openProjectModal(${project.id}, '${safeTitle}', '${safeCategory}', '${safeDesc}', '${safeImg}', '${safeUrl}')">
          <div class="project-thumb">${imageMarkup}</div>
          <div class="project-content">
            <span class="project-tag">${project.category}</span>
            <h3>${project.title}</h3>
            <p>${(project.description || "").substring(0, 100)}...</p>
            <button type="button" class="btn btn-primary btn-small">
              <i class="fas fa-mouse"></i> Ver detalhes
            </button>
          </div>
        </article>
      `;
    })
    .join("");

  observeRevealElements();
}

/* -------- Modal de projeto -------- */
const projectModal = document.getElementById("projectModal");
const closeProjectModal = document.getElementById("closeProjectModal");

if (closeProjectModal) {
  closeProjectModal.addEventListener("click", () => {
    projectModal.classList.remove("open");
    selectedProject = null;
  });
}

if (projectModal) {
  projectModal.addEventListener("click", (e) => {
    if (e.target === projectModal) {
      projectModal.classList.remove("open");
      selectedProject = null;
    }
  });
}

window.openProjectModal = function (id, title, category, description, imageUrl, projectUrl) {
  selectedProject = { id, title, category, description, imageUrl, projectUrl };

  document.getElementById("projectModalTitle").textContent = title;
  document.getElementById("projectModalTag").textContent = category;
  document.getElementById("projectModalDescription").textContent = description;
  document.getElementById("projectModalLink").href = projectUrl;

  const modalImg = document.getElementById("projectModalImage");
  if (imageUrl) {
    modalImg.src = imageUrl;
    modalImg.style.display = "block";
  } else {
    modalImg.removeAttribute("src");
    modalImg.style.display = "none";
  }

  projectModal.classList.add("open");
};

const useAsReferenceBtn = document.getElementById("useAsReferenceBtn");
if (useAsReferenceBtn) {
  useAsReferenceBtn.addEventListener("click", () => {
    if (selectedProject) {
      localStorage.setItem("referenceProject", JSON.stringify(selectedProject));
      window.location.href = "contato.html";
      projectModal.classList.remove("open");
    }
  });
}

/* -------- Referência no formulário -------- */
function loadReferenceProject() {
  const referenceBox = document.getElementById("projectReferenceBox");
  const referenceContent = document.getElementById("referenceContent");
  const clearReferenceBtn = document.getElementById("clearReferenceBtn");
  if (!referenceBox) return;

  const saved = localStorage.getItem("referenceProject");
  if (saved) {
    try {
      const project = JSON.parse(saved);
      referenceContent.innerHTML = `
        <strong>${project.title}</strong>
        <small>${project.projectUrl}</small>
      `;
      referenceBox.style.display = "flex";

      const messageField = document.getElementById("message");
      if (messageField && !messageField.value.includes(project.title)) {
        messageField.value += `\n\n[Site de Referência: ${project.title} - ${project.projectUrl}]`;
      }
    } catch {}
  }

  if (clearReferenceBtn) {
    clearReferenceBtn.addEventListener("click", () => {
      localStorage.removeItem("referenceProject");
      referenceBox.style.display = "none";
      const messageField = document.getElementById("message");
      if (messageField) {
        messageField.value = messageField.value.split("\n\n[Site de Referência:")[0];
      }
    });
  }
}

/* -------- Formulário de contato (salva leads) -------- */
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  initSupabase();

  contactForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name");
    const email = document.getElementById("email");
    const subject = document.getElementById("subject");
    const message = document.getElementById("message");
    const privacy = document.getElementById("privacy");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const subjectError = document.getElementById("subjectError");
    const messageError = document.getElementById("messageError");
    const privacyError = document.getElementById("privacyError");

    const clearError = (field, el) => {
      if (field) field.setAttribute("aria-invalid", "false");
      if (el) el.textContent = "";
    };
    const setError = (field, el, msg) => {
      if (field) field.setAttribute("aria-invalid", "true");
      if (el) el.textContent = msg;
    };

    [name, email, subject, message, privacy].forEach((f, i) => {
      const errs = [nameError, emailError, subjectError, messageError, privacyError];
      clearError(f, errs[i]);
    });

    let isValid = true;
    if (!name.value.trim()) { setError(name, nameError, "Por favor, informe seu nome."); isValid = false; }

    if (!email.value.trim()) {
      setError(email, emailError, "Por favor, informe seu e-mail."); isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError(email, emailError, "Digite um e-mail válido."); isValid = false;
    }

    if (!subject.value.trim()) { setError(subject, subjectError, "Por favor, informe o assunto."); isValid = false; }
    if (!message.value.trim()) {
      setError(message, messageError, "Escreva sua mensagem."); isValid = false;
    } else if (message.value.trim().length < 10) {
      setError(message, messageError, "A mensagem deve ter pelo menos 10 caracteres."); isValid = false;
    }

    if (!privacy.checked) {
      setError(privacy, privacyError, "É necessário aceitar a política de privacidade."); isValid = false;
    }

    if (!isValid) return;

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Enviando...`;

    try {
      const { error } = await supabaseClient.from("leads").insert([{
        name: name.value.trim(),
        email: email.value.trim(),
        subject: subject.value.trim(),
        message: message.value.trim(),
        privacy_accepted: true,
        reference_project: (() => {
          try { return JSON.parse(localStorage.getItem("referenceProject"))?.title || null; }
          catch { return null; }
        })(),
      }]);

      if (error) throw error;

      submitBtn.innerHTML = `<i class="fas fa-check"></i> Enviado!`;
      submitBtn.style.background = "var(--success)";
      submitBtn.style.color = "#0A0A0A";

      setTimeout(() => {
        contactForm.reset();
        localStorage.removeItem("referenceProject");
        const referenceBox = document.getElementById("projectReferenceBox");
        if (referenceBox) referenceBox.style.display = "none";
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.background = "";
        submitBtn.style.color = "";
      }, 1800);
    } catch (err) {
      console.error(err);
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      setError(null, messageError, "Não foi possível enviar. Tente novamente.");
    }
  });
}

/* -------- Inicialização -------- */
document.addEventListener("DOMContentLoaded", () => {
  observeRevealElements();

  if (document.getElementById("projectsGrid")) loadProjects();
  loadReferenceProject();
});