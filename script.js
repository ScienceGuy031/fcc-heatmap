async function getData() {
  await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
  )
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
      displayGraph(json);
    });
}

let width = document.getElementById("root").scrollWidth * 0.9;
let height = window.innerHeight * 0.5;

const root = d3.select("#root");
const header = root.append("div");
const title = header
  .append("h1")
  .text("FreeCodeCamp Heatmap")
  .attr("id", "title");
const description = header
  .append("h2")
  .text("Monthly Global Land-Surface Temperature")
  .attr("id", "description");

root
  .append("div")
  .attr("id", "graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr('id', 'heatmap');

getData();

function displayGraph(data) {
  const baseTemp = data.baseTemperature;
  let years = [];
  data.monthlyVariance.forEach((el) => {
    years.push(el.year);
  });
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const svg = d3.select("#heatmap");

  const x = d3.scaleBand();
  x.range([0, width - 70]);
  x.domain(years);

  const xAxis = d3.axisBottom(x);
  xAxis.tickValues(x.domain().filter((d) => !(d % 10)));

  const y = d3.scaleBand();
  y.domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  y.range([height, 70]);

  const yAxis = d3.axisLeft(y);
  yAxis.tickFormat(function (d, i) {
    return `${months[i]}`;
  });

  // Tooltip
  var tip = d3.tip()
  .attr('class', 'd3-tip')
  .attr('id', 'tooltip')
  .html('<p>justSomeHTML</p>');

  svg.call(tip);

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(70,${height - 70})`)
    .attr("id", "x-axis")
    .call(xAxis);
  svg
    .append("g")
    .attr("transform", "translate(70, -70)")
    .attr("id", "y-axis")
    .call(yAxis);

  // Cells
  svg
    .selectAll("rect")
    .data(data.monthlyVariance)
    .join("rect")
    .attr("data-year", (d) => d.year)
    .attr("data-month", (d) => d.month - 1)
    .attr("data-temp", (d) => d.variance + baseTemp)
    .attr("x", (d) => x(d.year) + 70)
    .attr("y", (d) => y(d.month - 1) - 70)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("class", "cell")
    .attr("fill", (d) => getCellColor(d.variance))
    .on("mouseover", (e, d) => {
      let html = '';
      let variance = Math.round(d.variance * 100) / 100;
      html += `<p>${months[d.month - 1]} ${d.year}</p>`;
      html += `<p>${Math.round((d.variance + baseTemp) * 100) / 100}°C</p>`;
      html += `<p>${variance >= 0 ? '+' + variance : variance }K</p>`
      tip.attr('data-year', d.year);
      
      tip.html(html);
      tip.show(e)
    })
    .on("mouseout", tip.hide);

  // Legend

  const legendContainer = root
    .append("svg")
    .attr("width", width)
    .attr("height", 80);
  const legend = legendContainer
    .append("svg")
    .attr("id", "legend")
    .attr("width", width)
    .attr("height", 80);

  const legendScale = d3.scaleLinear().domain([-7, 7]).range([0, 500]);

  legendAxis = d3.axisBottom(legendScale);
  legendAxis.tickFormat((d) => d + "°C");

  legend.append("g").attr("transform", `translate(100,50)`).call(legendAxis);

  let colors = [];
  for (let v = 7.5; v >= -7.5; v--) {
    colors.push(getCellColor(v));
  }

  colors.forEach((color, i) => {
    legend
      .append("rect")
      .attr("x", legendScale(i - 8) + 100)
      .attr("y", 20)
      .attr("width", 36)
      .attr("height", 30)
      .attr("fill", color);
  });
}

function getCellColor(variance) {
  // Cell colors by variance from base temperature
  if (variance > 7) return "#c92a2a";
  if (variance > 6) return "#d9480f";
  if (variance > 5) return "#e8590c";
  if (variance > 4) return "#f76707";
  if (variance > 3) return "#fd7e14";
  if (variance > 2) return "#ff922b";
  if (variance > 1) return "#ffa94d";
  if (variance > 0) return "#ffc078";
  if (variance > -1) return "#74c0fc";
  if (variance > -2) return "#4dabf7";
  if (variance > -3) return "#339af0";
  if (variance > -4) return "#228be6";
  if (variance > -5) return "#1c7ed6";
  if (variance > -6) return "#1971c2";
  if (variance > -7) return "#1864ab";
  return "#364fc7";
}
