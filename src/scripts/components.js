// Custom Element: AppBar
class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <h1>Notes App</h1>
      </header>
    `;
  }
}

// Custom Element: NoteForm
class NoteForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="noteForm">
        <input type="text" id="noteTitle" placeholder="Enter note title" required>
        <textarea id="noteBody" placeholder="Enter note body" required></textarea>
        <button type="submit">Add Note</button>
      </form>
      <div id="formError" style="color: red;"></div>
    `;

    const form = this.querySelector("#noteForm");
    form.addEventListener("submit", this.addNote.bind(this));
    form.addEventListener("input", this.validateForm.bind(this));
  }

  validateForm() {
    const titleInput = this.querySelector("#noteTitle");
    const bodyInput = this.querySelector("#noteBody");
    const formError = this.querySelector("#formError");

    formError.textContent = "";

    if (!titleInput.checkValidity() || !bodyInput.checkValidity()) {
      formError.textContent = "Please enter valid title and body for the note.";
      return false;
    }

    return true;
  }

  addNote(event) {
    event.preventDefault();

    if (this.validateForm()) {
      const title = this.querySelector("#noteTitle").value;
      const body = this.querySelector("#noteBody").value;

      const note = {
        title,
        body,
      };
      const xhr = new XMLHttpRequest();

      xhr.onload = function () {
        const response = JSON.parse(this.responseText);
        if (response.error) {
          console.log("error");
        } else {
          const noteList = document.querySelector("note-list");
          noteList.renderNotes();
          event.target.reset();
        }
      };

      xhr.onerror = function () {
        console.log("Ups something error");
      };

      xhr.open("POST", "https://notes-api.dicoding.dev/v2/notes");

      // menambahkan properti pada header request
      xhr.setRequestHeader("Content-Type", "application/json");

      xhr.send(JSON.stringify(note));
      //notesData.push(note);
    }
  }
}
function deleteNote(id) {
  //console.log("cek");
  const xhr = new XMLHttpRequest();

  xhr.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      console.log("error");
    } else {
      const noteList = document.querySelector("note-list");
      noteList.renderNotes();
    }
  };

  xhr.onerror = function () {
    console.log("Ups something error");
  };

  xhr.open("DELETE", "https://notes-api.dicoding.dev/v2/notes/" + id);

  xhr.send();
}

// Custom Element: NoteList
class NoteList extends HTMLElement {
  connectedCallback() {
    this.renderNotes();
    this.addEventListener("noteAdded", this.renderNotes.bind(this));
  }

  renderNotes() {
    const xhr = new XMLHttpRequest();
    const a = this;
    document.querySelector("#loading").style.display = "block";

    xhr.onload = function () {
      const response = JSON.parse(this.responseText);
      if (response.error) {
        console.log("error");
      } else {
        //console.log(response.data);
        a.innerHTML = "";
        if (response.length === 0) {
          a.innerHTML = "<p data-empty-message>No notes available.</p>";
          return;
        }
        response.data.reverse().forEach((data, index) => {
          const noteItem = document.createElement("div");
          noteItem.classList.add("note");
          noteItem.innerHTML = `
              <h3>${data.title}</h3>
              <p>${data.body}</p>
              <small>${new Date(data.createdAt).toLocaleDateString()}</small>
              <br>
              <button class="delete-button">hapus</button>
          `;
          a.appendChild(noteItem);
          const deleteButton = noteItem.querySelector(".delete-button");
          deleteButton.addEventListener("click", function () {
            deleteNote(data.id);
          });
        });
        document.querySelector("#loading").style.display = "none";
      }
    };

    xhr.onerror = function () {
      console.log("Ups something error");
    };

    xhr.open("GET", "https://notes-api.dicoding.dev/v2/notes");
    xhr.send();
  }
}

// Mengaktifkan custom elements
customElements.define("app-bar", AppBar);
customElements.define("note-form", NoteForm);
customElements.define("note-list", NoteList);
