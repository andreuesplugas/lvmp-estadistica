// 🔴 PON AQUÍ TU URL
//const DATA_URL = "https://script.google.com/macros/s/XXXXX/exec";
// o CSV:
// const DATA_URL = "https://docs.google.com/spreadsheets/d/.../pub?output=csv";

// 🔴 PON AQUÍ TU URL CSV
const USE_LOCAL_CSV = false; // Cambia a false para usar la URL remota
const LOCAL_CSV_FILE = "data.csv";
const REMOTE_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQVaP1-ziLbI2dQbfInEhOLhbUmGvRlrHu6mM9USQgftrrKdbPlOMB49AD27g3y4IHfC4xjGmmInXA6/pub?output=csv";
const DATA_URL = USE_LOCAL_CSV ? LOCAL_CSV_FILE : REMOTE_CSV_URL;

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

// parsear fecha en formato español dd/mm/yyyy o dd-mm-yyyy
function parseDateValue(value) {
  if (value instanceof Date && !isNaN(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const iso = Date.parse(trimmed);
  if (!isNaN(iso)) {
    return new Date(iso);
  }

  const match = trimmed.match(/^([0-3]?\d)[\/\-]([0-1]?\d)[\/\-](\d{4})$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    return new Date(year, month, day);
  }

  return null;
}

// detectar fecha
function isDate(value) {
  return parseDateValue(value) instanceof Date && !isNaN(parseDateValue(value));
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
  let keys = Object.keys(data[0]).filter(k => k !== "id" && k !== "etapa_inici" && k !== "etapa_fi");
  /*
  // Poner "dia" primero
  if (keys.includes("dia")) {
    keys = ["dia", ...keys.filter(k => k !== "dia")];
  }
  */
  var _responsive = 0;
  let columns = keys.map(k => {
    let column = {
      title: k,
      field: k,
      responsive: _responsive++,
      //headerFilter: "input",
      //formatter: cellFormatter,
      //sorter: function(a, b) {
      //  if (isNumber(a) && isNumber(b)) return Number(a) - Number(b);
      //  return String(a).localeCompare(String(b));
      //}
    };
    
    if (k === "dia") {
      column.title = "Día";
      column.formatter = "textarea";
      //column.width = 100; // Ajustar ancho para que se vean todos los valores
    }
    if (k === "data") {
      column.title = "Data";
      //column.formatter = "date";
      column.sorter = "date";
      column.sorterParams = { format: "dd/MM/yyyy" };
      column.width = 100; // Ajustar ancho para que se vean todos los valores
    }
    /*
    if (k === "data") {
      column.sorter = function(a, b) {
        const aDate = parseDateValue(a);
        const bDate = parseDateValue(b);
        if (aDate && bDate) {
          return bDate - aDate; // más recientes primero
        }
        if (isNumber(a) && isNumber(b)) return Number(a) - Number(b);
        return String(a).localeCompare(String(b));
      };
    }
    */
    if (k === "etapa") {
      column.title = "Etapa";
      column.formatter = "textarea";
      //column.width = 200; // Ajustar ancho para que se vean todos los valores
    }
    if (k === "trajecte") {
      column.title = "Trajecte";
      column.formatter = "textarea";
      column.width = 200; // Ajustar ancho para que se vean todos los valores
    }
    
    return column;
  });
  /*
  const etapaVirtual = {
    title: "Etapa",
    field: "etapa_virtual",
    mutator: function(value, data) {
      return (data.etapa_inici || "") + "-" + (data.etapa_fi || "");
    },
    headerFilter: "input",
    formatter: cellFormatter,
    sorter: function(a, b) {
      const aDate = parseDateValue(a);
      const bDate = parseDateValue(b);
      if (aDate && bDate) return aDate - bDate;
      if (isNumber(a) && isNumber(b)) return Number(a) - Number(b);
      return String(a).localeCompare(String(b));
    },
    width: 200
  };
  
  const dataIndex = columns.findIndex(col => col.field === "data");
  if (dataIndex >= 0) {
    columns.splice(dataIndex + 1, 0, etapaVirtual);
  } else {
    columns.push(etapaVirtual);
  }
  */
  return columns;
}

// ---------- Procesar datos ----------
function processData(results) {
  console.log(results.data);

  const data = results.data;

  if (!data || data.length === 0) {
    console.error("No hay datos");
    return;
  }

  const isMobile = true; //tabletAndMobileCheck();

  const table = new Tabulator("#tabla", {
    data: data,
    height:"1000px",
    tooltipsHeader: false,
    layout: isMobile ? "fitDataStretch" : "fitColumns",
    responsiveLayout: isMobile ? "collapse" : false,
    height: isMobile ? "70vh" : null,
    pagination: true,
    paginationSize: 15,
    columns: generateColumns(data),

    //initialSort: [{column: "data", dir: "desc"}],
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

// ---------- Cargar CSV ----------
function loadCSV() {
  if (USE_LOCAL_CSV) {
    fetch(DATA_URL)
      .then(response => response.text())
      .then(csvText => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: processData
        });
      })
      .catch(error => console.error("Error cargando CSV local:", error));
  } else {
    Papa.parse(DATA_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: processData
    });
  }
}

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", loadCSV);
