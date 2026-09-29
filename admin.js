/* =========================================================
   ANNE VITÓRIA — ADMIN + DASHBOARD
   ========================================================= */

const SUPABASE_URL = "https://khktnihmmjdjnosqkls.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "COLE_AQUI_SUA_PUBLISHABLE_KEY";


let supabaseClient = null;
let currentUser = null;
let editingProjectId = null;


/* =========================================================
   INICIALIZAR SUPABASE
   ========================================================= */

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


/* =========================================================
   LOGIN
   ========================================================= */

const loginForm = document.getElementById("loginForm");


if (loginForm) {

  const supabaseOK = initSupabase();


  if (!supabaseOK) {

    const authMessage =
      document.getElementById("authMessage");

    if (authMessage) {

      authMessage.textContent =
        "Erro: Supabase não foi carregado.";

      authMessage.classList.add("error");
    }

  }


  loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();


    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;


    const emailError =
      document.getElementById("emailError");

    const passwordError =
      document.getElementById("passwordError");

    const authMessage =
      document.getElementById("authMessage");


    emailError.textContent = "";
    passwordError.textContent = "";
    authMessage.textContent = "";

    authMessage.classList.remove(
      "error",
      "success"
    );


    if (!email) {

      emailError.textContent =
        "Digite seu e-mail.";

      return;
    }


    if (!password) {

      passwordError.textContent =
        "Digite sua senha.";

      return;
    }


    if (!supabaseClient) {

      authMessage.textContent =
        "Erro: conexão com o Supabase não foi inicializada.";

      authMessage.classList.add("error");

      return;
    }


    authMessage.textContent =
      "Entrando...";


    try {

      const { data, error } =
        await supabaseClient.auth.signInWithPassword({

          email: email,

          password: password

        });


      console.log("Resultado do login:", data);
      console.log("Erro do login:", error);


      if (error) {

        console.error(
          "Erro Supabase:",
          error
        );


        authMessage.textContent =
          "❌ " + error.message;

        authMessage.classList.add(
          "error"
        );

        return;
      }


      if (data && data.user) {

        authMessage.textContent =
          "✅ Login realizado!";

        authMessage.classList.add(
          "success"
        );


        setTimeout(function () {

          window.location.href =
            "dashboard.html";

        }, 700);

      }

    } catch (error) {

      console.error(
        "Erro inesperado:",
        error
      );


      authMessage.textContent =
        "❌ Ocorreu um erro ao fazer login.";

      authMessage.classList.add(
        "error"
      );

    }

  });

}


/* =========================================================
   DASHBOARD
   ========================================================= */

const projectsList =
  document.getElementById("projectsList");

const leadsList =
  document.getElementById("leadsList");


if (projectsList || leadsList) {

  initSupabase();


  /* =======================================================
     VERIFICAR LOGIN
     ======================================================= */

  async function checkAuth() {

    try {

      const { data, error } =
        await supabaseClient.auth.getSession();


      if (error || !data.session) {

        window.location.href =
          "admin.html";

        return;
      }


      currentUser =
        data.session.user;


      const userEmail =
        document.getElementById("userEmail");

      const topbarEmail =
        document.getElementById("topbarEmail");


      if (userEmail) {

        userEmail.textContent =
          currentUser.email;
      }


      if (topbarEmail) {

        topbarEmail.textContent =
          currentUser.email;
      }


      loadProjects();


      if (leadsList) {

        loadLeads();
      }

    } catch (error) {

      console.error(
        "Erro ao verificar sessão:",
        error
      );

      window.location.href =
        "admin.html";
    }

  }


  /* =======================================================
     LOGOUT
     ======================================================= */

  const logoutBtn =
    document.getElementById("logoutBtn");


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async function () {

        await supabaseClient.auth.signOut();

        window.location.href =
          "admin.html";

      }
    );

  }


  /* =======================================================
     ABAS
     ======================================================= */

  const tabButtons =
    document.querySelectorAll(
      ".sidebar-link[data-tab]"
    );


  const tabPanels =
    document.querySelectorAll(
      ".tab-panel"
    );


  tabButtons.forEach(function (button) {

    button.addEventListener(
      "click",
      function () {

        const tab =
          button.dataset.tab;


        tabButtons.forEach(
          function (btn) {

            btn.classList.remove(
              "active"
            );

          }
        );


        button.classList.add(
          "active"
        );


        tabPanels.forEach(
          function (panel) {

            panel.classList.remove(
              "active"
            );

          }
        );


        const selectedPanel =
          document.getElementById(
            "tab-" + tab
          );


        if (selectedPanel) {

          selectedPanel.classList.add(
            "active"
          );

        }

      }
    );

  });


  /* =======================================================
     CARREGAR PROJETOS
     ======================================================= */

  async function loadProjects() {

    if (!projectsList) return;


    const { data, error } =
      await supabaseClient
        .from("projects")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


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


    projectsList.innerHTML =
      data.map(function (project) {

        return `
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
              ${(project.description || "").substring(0, 60)}...
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
        `;

      }).join("");

  }


  /* =======================================================
     CARREGAR LEADS
     ======================================================= */

  async function loadLeads() {

    if (!leadsList) return;


    const { data, error } =
      await supabaseClient
        .from("leads")
        .select("*")
        .order(
          "created_at",
          {
            ascending: false
          }
        );


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


    leadsList.innerHTML =
      data.map(function (lead) {

        return `
          <tr>

            <td>
              <strong>
                ${lead.name || "-"}
              </strong>
            </td>

            <td>

              ${
                lead.email
                  ? `
                    <a href="mailto:${lead.email}">
                      ${lead.email}
                    </a>
                  `
                  : "-"
              }

            </td>

            <td>
              ${lead.subject || "-"}
            </td>

            <td>
              ${(lead.message || "").substring(0, 90)}...
            </td>

            <td>
              ${
                lead.created_at
                  ? new Date(
                      lead.created_at
                    ).toLocaleDateString(
                      "pt-BR"
                    )
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
        `;

      }).join("");

  }


  /* =======================================================
     MODAL
     ======================================================= */

  const projectModal =
    document.getElementById(
      "projectModal"
    );

  const addProjectBtn =
    document.getElementById(
      "addProjectBtn"
    );

  const closeModal =
    document.getElementById(
      "closeModal"
    );

  const cancelBtn =
    document.getElementById(
      "cancelBtn"
    );

  const projectForm =
    document.getElementById(
      "projectForm"
    );


  if (addProjectBtn) {

    addProjectBtn.addEventListener(
      "click",
      function () {

        editingProjectId = null;


        const modalTitle =
          document.getElementById(
            "modalTitle"
          );


        if (modalTitle) {

          modalTitle.textContent =
            "Adicionar projeto";

        }


        if (projectForm) {

          projectForm.reset();

        }


        if (projectModal) {

          projectModal.classList.add(
            "open"
          );

        }

      }
    );

  }


  [closeModal, cancelBtn].forEach(
    function (element) {

      if (element) {

        element.addEventListener(
          "click",
          function () {

            if (projectModal) {

              projectModal.classList.remove(
                "open"
              );

            }

          }
        );

      }

    }
  );


  /* =======================================================
     SALVAR PROJETO
     ======================================================= */

  if (projectForm) {

    projectForm.addEventListener(
      "submit",
      async function (e) {

        e.preventDefault();


        const title =
          document.getElementById(
            "projectTitle"
          ).value.trim();


        const category =
          document.getElementById(
            "projectCategory"
          ).value.trim();


        const description =
          document.getElementById(
            "projectDescription"
          ).value.trim();


        const project_url =
          document.getElementById(
            "projectUrl"
          ).value.trim();


        const image_url =
          document.getElementById(
            "projectImage"
          ).value.trim();


        if (
          !title ||
          !category ||
          !description ||
          !project_url
        ) {

          alert(
            "Preencha os campos obrigatórios."
          );

          return;
        }


        const projectData = {

          title: title,

          category: category,

          description: description,

          project_url: project_url,

          image_url:
            image_url || null

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
              "Projeto atualizado!"
            );

          } else {

            const { error } =
              await supabaseClient
                .from("projects")
                .insert([
                  projectData
                ]);


            if (error) {
              throw error;
            }


            alert(
              "Projeto criado!"
            );

          }


          if (projectModal) {

            projectModal.classList.remove(
              "open"
            );

          }


          if (projectForm) {

            projectForm.reset();

          }


          loadProjects();

        } catch (error) {

          console.error(
            "Erro ao salvar projeto:",
            error
          );


          alert(
            "Erro ao salvar projeto."
          );

        }

      }
    );

  }


  /* =======================================================
     EDITAR PROJETO
     ======================================================= */

  window.editProject =
    async function (id) {

      const { data, error } =
        await supabaseClient
          .from("projects")
          .select("*")
          .eq("id", id)
          .single();


      if (error || !data) {

        console.error(error);

        alert(
          "Erro ao carregar projeto."
        );

        return;
      }


      editingProjectId = id;


      document.getElementById(
        "modalTitle"
      ).textContent =
        "Editar projeto";


      document.getElementById(
        "projectTitle"
      ).value =
        data.title || "";


      document.getElementById(
        "projectCategory"
      ).value =
        data.category || "";


      document.getElementById(
        "projectDescription"
      ).value =
        data.description || "";


      document.getElementById(
        "projectUrl"
      ).value =
        data.project_url || "";


      document.getElementById(
        "projectImage"
      ).value =
        data.image_url || "";


      if (projectModal) {

        projectModal.classList.add(
          "open"
        );

      }

    };


  /* =======================================================
     EXCLUIR PROJETO
     ======================================================= */

  window.deleteProject =
    async function (id) {

      if (
        !confirm(
          "Tem certeza que deseja deletar este projeto?"
        )
      ) {

        return;
      }


      const { error } =
        await supabaseClient
          .from("projects")
          .delete()
          .eq("id", id);


      if (error) {

        console.error(error);

        alert(
          "Erro ao excluir projeto."
        );

        return;
      }


      alert(
        "Projeto excluído!"
      );


      loadProjects();

    };


  /* =======================================================
     EXCLUIR LEAD
     ======================================================= */

  window.deleteLead =
    async function (id) {

      if (
        !confirm(
          "Tem certeza que deseja excluir este lead?"
        )
      ) {

        return;
      }


      const { error } =
        await supabaseClient
          .from("leads")
          .delete()
          .eq("id", id);


      if (error) {

        console.error(error);

        alert(
          "Erro ao excluir lead."
        );

        return;
      }


      alert(
        "Lead excluído!"
      );


      loadLeads();

    };


  checkAuth();

}
