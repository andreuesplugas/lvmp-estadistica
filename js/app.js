// 🔴 PON AQUÍ TU URL
const DATA_URL = "https://script.google.com/macros/s/XXXXX/exec";
// o CSV:
// const DATA_URL = "https://docs.google.com/spreadsheets/d/.../pub?output=csv";

// ---------- Helpers ----------

// detectar youtube
function getYoutubeEmbed(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return null;
}

// detectar imagen
function isImage(url) {
  return url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
}

// detectar número
function isNumber(value) {
  return !isNaN(value) && value !== null && value !== "";
}

// detectar fecha simple
function isDate(value) {
  return !isNaN(Date.parse(value));
}

// ---------- Formatter ----------
function cellFormatter(cell) {
  const value = cell.getValue();

  if (!value) return "";

  if (typeof value === "string") {

    // YouTube
    const yt = getYoutubeEmbed(value);
    if (yt) {
      return `<iframe width="150" height="90" src="${yt}" allowfullscreen></iframe>`;
    }

    // Imagen
    if (isImage(value)) {
      return `<img src="${value}" width="80">`;
    }

    // Link
    if (value.startsWith("http")) {
      return `<a href="${value}" target="_blank">🔗</a>`;
    }
  }

  return value;
}

// ---------- Crear columnas dinámicamente ----------
function generateColumns(data) {
  const keys = Object.keys(data[0]);

  return keys.map(k => {
    return {
      title: k,
      field: k,
      headerFilter: "input",
      formatter: cellFormatter,
      sorter: function(a, b) {
        if (isNumber(a) && isNumber(b)) return a - b;
        if (isDate(a) && isDate(b)) return new Date(a) - new Date(b);
        return String(a).localeCompare(String(b));
      }
    };
  });
}

// ---------- Cargar datos ----------
async function loadData() {
  const response = await fetch(DATA_URL);
  let data = await response.json();

  return data;
}

// ---------- Init ----------
loadData().then(data => {

  const table = new Tabulator("#tabla", {
    data: data,
    layout: "fitColumns",
    pagination: true,
    paginationSize: 10,
    columns: generateColumns(data),
  });

  // filtro global
  document.getElementById("filtro").addEventListener("keyup", function() {
    const value = this.value.toLowerCase();

    table.setFilter(function(data) {
      return Object.values(data).some(v =>
        String(v).toLowerCase().includes(value)
      );
    });
  });

});