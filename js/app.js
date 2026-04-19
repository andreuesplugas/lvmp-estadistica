// 🔴 PON AQUÍ TU URL
//const DATA_URL = "https://script.google.com/macros/s/XXXXX/exec";
// o CSV:
// const DATA_URL = "https://docs.google.com/spreadsheets/d/.../pub?output=csv";

// 🔴 PON AQUÍ TU URL CSV
const DATA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVaP1-ziLbI2dQbfInEhOLhbUmGvRlrHu6mM9USQgftrrKdbPlOMB49AD27g3y4IHfC4xjGmmInXA6/pub?output=csv";

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
  return typeof url === "string" && url.match(/\.(jpeg|jpg|png|gif|webp)$/i);
}

// detectar número
function isNumber(value) {
  return value !== null && value !== "" && !isNaN(value);
}

// detectar fecha
function isDate(value) {
  return !isNaN(Date.parse(value));
}

// ---------- Formatter ----------
function cellFormatter(cell) {
  const value = cell.getValue();

  if (!value) return "";

  if (typeof value === "string") {

    // YouTube embed
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

// ---------- Columnas dinámicas ----------
function generateColumns(data) {
  const keys = Object.keys(data[0]);

  return keys.map(k => ({
    title: k,
    field: k,
    headerFilter: "input",
    formatter: cellFormatter,
    sorter: function(a, b) {
      if (isNumber(a) && isNumber(b)) return Number(a) - Number(b);
      if (isDate(a) && isDate(b)) return new Date(a) - new Date(b);
      return String(a).localeCompare(String(b));
    }
  }));
}

// ---------- Cargar CSV ----------
function loadCSV() {
  Papa.parse(DATA_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      console.log(results.data);

      const data = results.data;

      if (!data || data.length === 0) {
        console.error("No hay datos");
        return;
      }

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

        table.setFilter(function(rowData) {
          return Object.values(rowData).some(v =>
            String(v).toLowerCase().includes(value)
          );
        });
      });

    }
  });
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", loadCSV);
