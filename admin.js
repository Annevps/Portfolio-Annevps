/* =========================================================
   ANNE VITÓRIA — Admin + Dashboard
   ========================================================= */

const SUPABASE_URL = "https://khktnihmmjdnjosnqkls.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_G7eu65EA3s8SrP633y1bDQ_0k-FOSJJ";

let supabaseClient = null;
let currentUser = null;
let editingProjectId = null;


/* ================== SUPABASE ================== */

function initSupabase() {
  if (typeof window.supabase === "undefined") {
    console.error("Supabase não foi carregado.");
    return false;
  }

  if (!supabaseClient) {
    supabaseClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_PUBLISHABLE_KEY
    );
  }

  return true;
}


/* ================== LOGIN ================== */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  if (!initSupabase()) {
    alert("Erro: biblioteca do Supabase não foi carregada.");
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const emailError = document.getElementById("emailError");
    const passwordError = document.getElementById("passwordError");
    const authMessage = document.getElementById("authMessage");

    emailError.textContent = "";
    passwordError.textContent = "";
    authMessage.textContent = "";
    authMessage.classList.remove("error", "success");

    if (!email) {
      emailError.textContent = "Por favor, informe seu e-mail.";
      return;
    }

    if (!password) {
      passwordError.textContent = "Por favor, informe sua senha.";
      return;
    }

    try {
      const { data, error } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password
        });

      if (error) {
        console.error("Erro de login:", error);

        authMessage.textContent =
          "❌ E-mail ou senha incorretos.";
        authMessage.classList.add("error");

        return;
      }

      if (data.user) {
        authMessage.textContent =
          "✅ Login realizado! Redirecionando...";
        authMessage.classList.add("success");

        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 700);
      }

    } catch (err) {
      console.error(err);

      authMessage.textContent =
        "❌ Erro ao fazer login. Tente novamente.";

      authMessage.classList.add("error");
    }
  });
}


/* ================== DASHBOARD ================== */

const projectsList = document.getElementById("projectsList");
const leadsList = document.getElementById("leadsList");

if (projectsList || leadsList) {

  initSupabase();


  /* ================== AUTENTICAÇÃO ================== */

  async function checkAuth() {

    const { data, error } =
      await supabaseClient.auth.getSession();

    if (error || !data.session) {
      window.location.href = "admin.html";
      return;
    }

    currentUser = data.session.user;

    const userEmail =
      document.getElementById("userEmail");

    const topbarEmail =
      document.getElementById("topbarEmail");

    if (userEmail) {
      userEmail.textContent = currentUser.email;
    }

    if (topbarEmail) {
      topbarEmail.textContent = currentUser.email;
    }

    loadProjects();

    if (leadsList) {
      loadLeads();
    }
  }


  /* ================== LOGOUT ================== */

  const logoutBtn =
    document.getElementById("logoutBtn");

  if (logoutBtn) {

    logoutBtn.addEventListener("click", async () => {

      await supabaseClient.auth.signOut();

      window.location.href = "index.html";

    });
  }


  /* ================== ABAS ================== */

  const tabButtons =
    document.querySelectorAll(
      ".sidebar-link[data-tab]"
    );

  const tabPanels =
    document.querySelectorAll(".tab-panel");

  tabButtons.forEach((btn) => {

    btn.addEventListener("click", () => {

      const tab = btn.dataset.tab;

      tabButtons.forEach((b) => {
        b.classList.remove("active");
      });

      btn.classList.add("active");

      tabPanels.forEach((p) => {
        p.classList.remove("active");
      });

      const panel =
        document.getElementById(`tab-${tab}`);

      if (panel) {
        panel.classList.add("active");
      }

    });

  });


  /* ================== PROJETOS ================== */

  async function loadProjects() {

    if (!projectsList) return;

    const { data, error } =
      await supabaseClient
        .from("projects")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Erro ao carregar projetos:",
        error
      );

      projectsList.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            ❌ Erro ao carregar projetos
          </td>
        </tr>
      `;

      return;
    }

    if (!data || data.length === 0) {

      projectsList.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            📭 Nenhum projeto cadastrado
          </td>
        </tr>
      `;

      return;
    }

    projectsList.innerHTML = data.map((project) => `

      <tr>

        <td>
          <strong>
            ${project.title || ""}
          </strong>
        </td>

        <td>
          ${project.category || ""}
        </td>

        <td>
          ${(project.description || "").substring(0, 60)}
          ...
        </td>

        <td>
          ${
            project.project_url
              ? `
                <a
                  href="${project.project_url}"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  🔗 Abrir
                </a>
              `
              : "-"
          }
        </td>

        <td class="table-actions">

          <button
            class="btn btn-edit btn-small"
            onclick="editProject(${project.id})"
          >
            <i class="fas fa-edit"></i>
            Editar
          </button>

          <button
            class="btn btn-danger btn-small"
            onclick="deleteProject(${project.id})"
          >
            <i class="fas fa-trash"></i>
            Deletar
          </button>

        </td>

      </tr>

    `).join("");
  }


  /* ================== LEADS ================== */

  async function loadLeads() {

    if (!leadsList) return;

    const { data, error } =
      await supabaseClient
        .from("leads")
        .select("*")
        .order("created_at", {
          ascending: false
        });

    if (error) {

      console.error(
        "Erro ao carregar leads:",
        error
      );

      leadsList.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            ❌ Erro ao carregar leads
          </td>
        </tr>
      `;

      return;
    }

    if (!data || data.length === 0) {

      leadsList.innerHTML = `
        <tr>
          <td colspan="6" class="text-center">
            📭 Nenhum lead recebido ainda
          </td>
        </tr>
      `;

      return;
    }

    leadsList.innerHTML = data.map((lead) => `

      <tr>

        <td>
          <strong>
            ${lead.name || "-"}
          </strong>
        </td>

        <td>
          ${
            lead.email
              ? `<a href="mailto:${lead.email}">
                  ${lead.email}
                 </a>`
              : "-"
          }
        </td>

        <td>
          ${lead.subject || "-"}
        </td>

        <td style="max-width:280px;">
          ${(lead.message || "").substring(0, 90)}
          ...
        </td>

        <td>
          ${
            lead.created_at
              ? new Date(
                  lead.created_at
                ).toLocaleDateString("pt-BR")
              : "-"
          }
        </td>

        <td class="table-actions">

          <button
            class="btn btn-danger btn-small"
            onclick="deleteLead(${lead.id})"
          >
            <i class="fas fa-trash"></i>
            Excluir
          </button>

        </td>

      </tr>

    `).join("");
  }


  /* ================== MODAL DE PROJETO ================== */

  const projectModal =
    document.getElementById("projectModal");

  const addProjectBtn =
    document.getElementById("addProjectBtn");

  const closeModal =
    document.getElementById("closeModal");

  const cancelBtn =
    document.getElementById("cancelBtn");

  const projectForm =
    document.getElementById("projectForm");


  if (addProjectBtn) {

    addProjectBtn.addEventListener(
      "click",
      () => {

        editingProjectId = null;

        document.getElementById(
          "modalTitle"
        ).textContent = "Adicionar projeto";

        if (projectForm) {
          projectForm.reset();
        }

        if (projectModal) {
          projectModal.classList.add("open");
        }

      }
    );
  }


  [closeModal, cancelBtn].forEach((el) => {

    if (el) {

      el.addEventListener(
        "click",
        () => {

          if (projectModal) {
            projectModal.classList.remove(
              "open"
            );
          }

        }
      );

    }

  });


  if (projectModal) {

    projectModal.addEventListener(
      "click",
      (e) => {

        if (
          e.target === projectModal ||
          e.target.classList.contains(
            "modal-overlay"
          )
        ) {

          projectModal.classList.remove(
            "open"
          );

        }

      }
    );

  }


  /* ================== SALVAR PROJETO ================== */

  if (projectForm) {

    projectForm.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        const title =
          document
            .getElementById("projectTitle")
            .value
            .trim();

        const category =
          document
            .getElementById("projectCategory")
            .value
            .trim();

        const description =
          document
            .getElementById("projectDescription")
            .value
            .trim();

        const project_url =
          document
            .getElementById("projectUrl")
            .value
            .trim();

        const image_url =
          document
            .getElementById("projectImage")
            .value
            .trim();


        if (
          !title ||
          !category ||
          !description ||
          !project_url
        ) {

          alert(
            "⚠️ Preencha todos os campos obrigatórios."
          );

          return;
        }


        const projectData = {
          title,
          category,
          description,
          project_url,
          image_url: image_url || null
        };


        try {

          if (editingProjectId) {

            const { error } =
              await supabaseClient
                .from("projects")
                .update(projectData)
                .eq(
                  "id",
                  editingProjectId
                );

            if (error) {
              throw error;
            }

            alert(
              "✅ Projeto atualizado!"
            );

          } else {

            const { error } =
              await supabaseClient
                .from("projects")
                .insert([projectData]);

            if (error) {
              throw error;
            }

            alert(
              "✅ Projeto criado!"
            );
          }


          if (projectModal) {
            projectModal.classList.remove(
              "open"
            );
          }

          projectForm.reset();

          loadProjects();

        } catch (err) {

          console.error(err);

          alert(
            "❌ Erro ao salvar projeto."
          );

        }

      }
    );

  }


  /* ================== EDITAR PROJETO ================== */

  window.editProject = async (id) => {

    const { data, error } =
      await supabaseClient
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

    if (error || !data) {

      console.error(error);

      alert(
        "❌ Erro ao carregar projeto."
      );

      return;
    }


    editingProjectId = id;

    document.getElementById(
      "modalTitle"
    ).textContent = "Editar projeto";

    document.getElementById(
      "projectTitle"
    ).value = data.title || "";

    document.getElementById(
      "projectCategory"
    ).value = data.category || "";

    document.getElementById(
      "projectDescription"
    ).value = data.description || "";

    document.getElementById(
      "projectUrl"
    ).value = data.project_url || "";

    document.getElementById(
      "projectImage"
    ).value = data.image_url || "";


    if (projectModal) {
      projectModal.classList.add("open");
    }

  };


  /* ================== EXCLUIR PROJETO ================== */

  window.deleteProject = async (id) => {

    if (
      !confirm(
        "⚠️ Tem certeza que deseja deletar este projeto?"
      )
    ) {
      return;
    }


    try {

      const { error } =
        await supabaseClient
          .from("projects")
          .delete()
          .eq("id", id);

      if (error) {
        throw error;
      }

      alert(
        "✅ Projeto deletado!"
      );

      loadProjects();

    } catch (err) {

      console.error(err);

      alert(
        "❌ Erro ao deletar projeto."
      );

    }

  };


  /* ================== EXCLUIR LEAD ================== */

  window.deleteLead = async (id) => {

    if (
      !confirm(
        "⚠️ Tem certeza que deseja excluir este lead?"
      )
    ) {
      return;
    }


    try {

      const { error } =
        await supabaseClient
          .from("leads")
          .delete()
          .eq("id", id);

      if (error) {
        throw error;
      }

      alert(
        "✅ Lead excluído!"
      );

      loadLeads();

    } catch (err) {

      console.error(err);

      alert(
        "❌ Erro ao excluir lead."
      );

    }

  };


  /* ================== INICIAR DASHBOARD ================== */

  checkAuth();
}
