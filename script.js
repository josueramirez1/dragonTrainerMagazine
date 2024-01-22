const URL1 = "https://vanillajsacademy.com/api/dragons.json";
const URL2 = "https://vanillajsacademy.com/api/dragons-authors.json";
const app = document.querySelector("#app");

Promise.all([fetch(URL1), fetch(URL2)])
  .then((responses) => {
    return Promise.all(
      responses.map((response) => {
        return response.json();
      })
    );
  })
  .then((data) => {
    if (!data) renderFail(data);
    render(data[0].articles, data[1].authors);
  })
  .catch((error) => {
    console.warn(error);
    renderFail(error);
  });

/// Helper Functions///

function getAuthor(name, authors) {
  return authors.find((author) => {
    return author.author === name;
  });
}

function render(articles, authors) {
  let info = `${articles
    .map((article) => {
      let bios = getAuthor(article.author, authors);
      return `<h2><a href="${article.url}">${article.title}</a></h2>
              <div class="info">
              <p ><em>By ${article.author}</em></p>
              <p ><em> ${article.pubdate}</em></p>
              </div>
              <p class="description">${article.article}</p>
              <p class="ata"><em><strong>About the Author:</strong> ${bios.bio}</em></p>
              
              <hr>

            `;
    })
    .join(" ")}`;
  let cleaned = cleanHTML(info);
  app.innerHTML = cleaned;
  // app.append(cleaned);
}

function renderFail(articles) {
  app.innerHTML = `<iframe src="https://giphy.com/embed/3o7TKrEzvLbsVAud8I" width="480" height="330" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>

          <h3>The Dragon has burned all our paper! We apologize for the incovenience. Please check back later for more stories!</h3>
          `;
}

//Sanitizing API//

function cleanHTML(str, nodes) {
  function stringToHTML() {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body || document.createElement("body");
  }

  function removeScripts(html) {
    let scripts = html.querySelectorAll("script");
    for (let script of scripts) {
      script.remove();
    }
  }

  function isPossiblyDangerous(name, value) {
    let val = value.replace(/\s+/g, "").toLowerCase();
    if (["src", "href", "xlink:href"].includes(name)) {
      if (val.includes("javascript:") || val.includes("data:")) return true;
    }
    if (name.startsWith("on")) return true;
  }

  function removeAttributes(elem) {
    let atts = elem.attributes;
    for (let { name, value } of atts) {
      if (!isPossiblyDangerous(name, value)) continue;
      elem.removeAttribute(name);
    }
  }

  function clean(html) {
    let nodes = html.children;
    for (let node of nodes) {
      removeAttributes(node);
      clean(node);
    }
  }

  let html = stringToHTML();

  removeScripts(html);
  clean(html);

  return nodes ? html.childNodes : html.innerHTML;
}
