/* Map integration (D3 + TopoJSON) */
(function () {
  // Legend config and renderer
const texasHub = [-96.8067, 32.7767]; // Dallas — PermitSight + NebuLogic
const legendItems = [
  { key: "ai", coordinates: texasHub, label: '<a href="https://austinlu.com/experience/2025-cofounder" target="_blank" rel="noopener noreferrer"><strong>Co-founder &amp; CTO</strong></a> @ PermitSight' },
  { key: "experience", coordinates: texasHub, label: '<a href="https://austinlu.com/experience/2025-nebulogic" target="_blank" rel="noopener noreferrer"><strong>AI Development Lead</strong></a> @ NebuLogic' },
  { key: "publication", coordinates: [-88.2434, 40.1164], label: '<a href="https://acsinger.ece.illinois.edu/research/group-members/" target="_blank" rel="noopener noreferrer">Ex-AI/ML Research</a> @ University of Illinois' },
];

// Markers config
const markers = [
  // Publication
  { type: "publication", curvature: 0.14, content: '2022 Q2 <a href="https://austinlu.com/publication/2022-05-08-mechatronic" target="_blank" rel="noopener noreferrer"><strong>Robotic Orchestration</strong></a>', place: "Nashville, TN", coordinates: [-86.7816, 36.1627] },
  { type: "publication", curvature: 0.4, content: '2022 Q4 <a href="https://austinlu.com/publication/2022-10-01-cloud-research.md" target="_blank" rel="noopener noreferrer"><strong>Cloud Robotics</strong></a>', place: "Munich, Germany", coordinates: [-68, 42.5] },
  {
    type: "publication",
    curvature: 0.14,
    content: `2023 Q1
      <a href="https://austinlu.com/publication/2023-03-01-bandwidth-extension" target="_blank" rel="noopener noreferrer">[1]</a>
      <a href="https://austinlu.com/publication/2023-03-01-mechanized-panels" target="_blank" rel="noopener noreferrer">[2]</a>
      <a href="https://austinlu.com/publication/2023-03-01-printed-simulators" target="_blank" rel="noopener noreferrer">[3]</a>
      <a href="https://austinlu.com/publication/2023-03-01-source-separation-bandlimited" target="_blank" rel="noopener noreferrer">[3]</a>
      `,
    place: "Chicago, IL",
    coordinates: [-87.6298, 41.8781]
  },
  {
    type: "publication",
    curvature: 0,
    content: '2023 Q2 <a href="https://austinlu.com/publication/2023-05-08-investigating-sample-bias" target="_blank" rel="noopener noreferrer"><strong>Multiple: AI/ML for Human-Computer Interaction</strong></a>',
    place: "Champaign, IL",
    coordinates: [-88.2434, 40.1164]
  },
  { type: "publication", curvature: 0.14, content: '2023 Q4 <a href="https://austinlu.com/publication/2023-10-23-interactive-demo" target="_blank" rel="noopener noreferrer"><strong>Interactive Digital Twins</strong></a>', place: "New Paltz, NY", coordinates: [-74.0746, 41.7474] },
  { type: "publication", curvature: 0.3, content: '2024 Q1 <a href="https://austinlu.com/publication/2024-03-01-delay-constrained" target="_blank" rel="noopener noreferrer"><strong>Wearable Implants for Human Computer Interaction</strong></a>', place: "Ottawa, Canada", coordinates: [-75.6972, 45.4215] },
  // { type: "publication", curvature: 0.14, content: '2024 Q2 <strong>Oceanography and Robotics training</strong>', place: "Shinnecock Bay", coordinates: [-72.4949, 40.8534] },
  { type: "publication", curvature: 0.14, content: '2024 Q3 <a href="https://austinlu.com/publication/2024-08-27-discovery-partners" target="_blank" rel="noopener noreferrer"><strong>International Innovation Showcase</strong></a>', place: "Chicago, IL", coordinates: [-87.6298, 41.8781] },
  { type: "publication", curvature: 0.14, content: '2025 Q3 <a href="https://austinlu.com/publication/2025-07-05-latent-fxlms" target="_blank" rel="noopener noreferrer"><strong>AI/ML: Latent Signal Processing</strong></a>', place: "Malaga, Spain", coordinates: [-71.5, 39] },

  // Experience
  // { type: "ai", curvature: 0.6, content: '2025 Q1 <strong>AI Chatbot Pilot</strong> for city 311 platform', place: "Indiana", coordinates: [-85.15, 41.07] },
  { type: "experience", curvature: 0.2, content: '2025 Q2 <strong>AI Chatbot Demo</strong> for city staff', place: "CA", coordinates: [-122.4194, 37.7749] },
  { type: "experience", curvature: 0.3, content: '2025 Q4 Showcasing our <strong>AI GovTech Platform</strong>', place: '<a href="https://fall.smartcitiesconnect.org/" target="_blank" rel="noopener noreferrer"><strong>Smart Cities Connect 2025</strong></a> at National Harbor, MD', coordinates: [-77.0369, 38.9638] },

  // AI
  { type: "ai", curvature: 0.3, content: '2025 Q3 <strong>AI Permit Review Pilot</strong> for city plan reviewers', place: "WA", coordinates: [-122.3321, 47.6062] },
  { type: "ai", curvature: 0, content: '2026 Q1 <strong>AI Permit Review Pilot</strong> for city inspectors', place: "TX", coordinates: [-96.8067, 32.7767] },
  { type: "ai", curvature: 0.6, content: '2026 Q2 Seminar on <strong>AI Permit Review</strong>', place: 'the <a href="https://www.planning.org/conference/" target="_blank" rel="noopener noreferrer"><strong>National Planning Conference 2026</strong></a> in Detroit, MI', coordinates: [-83.05, 42.33] },
];

const d3 = window.d3;
const topojson = window.topojson;

const radius = 7;
const radiusHover = 10;
const container = document.getElementById('map-container');
let { width, height } = container.getBoundingClientRect();
if (!width || !height) { width = 1000; height = 600; }

const svg = d3.select("#map-container")
  .append("svg")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("tabindex", -1)
  .attr("focusable", false);

const gMap = svg.append("g");
const gMarkers = svg.append("g");
const mapInfo = d3.select("#map-info");
let stickyMarker = null;

const projection = d3.geoMercator();
const pathGenerator = d3.geoPath().projection(projection);

const mapDataUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

d3.json(mapDataUrl).then(data => {
  const states = topojson.feature(data, data.objects.states);
  // Filter to CONUS (lower-48 + DC): include only FIPS 01-56, excluding Alaska (02) and Hawaii (15)
  // This also excludes territories like PR (72), USVI (78), Guam (66), AS (60), CNMI (69)
  const conusIds = new Set(
    states.features
      .map(f => Number(f.id))
      .filter(id => id <= 56 && id !== 2 && id !== 15)
  );
  const conus = {
    type: "FeatureCollection",
    features: states.features.filter(f => conusIds.has(Number(f.id)))
  };
  // Fit projection to CONUS states edge-to-edge (no padding)
  projection.fitSize([width, height], conus);

  gMap.selectAll("path.state")
      .data(conus.features)
      .enter()
      .append("path")
      .attr("class", "country state")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("d", pathGenerator);

  // State borders mesh
  const borders = topojson.mesh(
    data,
    data.objects.states,
    (a, b) => a !== b && conusIds.has(Number(a.id)) && conusIds.has(Number(b.id))
  );
  gMap.append("path")
      .datum(borders)
      .attr("class", "state-borders")
      .attr("vector-effect", "non-scaling-stroke")
      .attr("d", pathGenerator);

  drawMarkers();
  drawHubs();
  drawArcs();
  renderLegend();
});

// Clear info bar when clicking outside a marker
svg.on("click", () => {
  if (stickyMarker) {
    stickyMarker = null;
    mapInfo.classed("is-visible", false);
    gMap.selectAll("path.arc").classed("is-highlight", false);
    resetMarkerSizes();
  }
});

function coordKey(coordinates) {
  return `${Math.round(coordinates[0] * 10000)}-${Math.round(coordinates[1] * 10000)}`;
}

function sameCoord(a, b) {
  return Array.isArray(a) && Array.isArray(b) && coordKey(a) === coordKey(b);
}

function isOnHub(marker) {
  return legendItems.some(hub => hub.coordinates && sameCoord(hub.coordinates, marker.coordinates));
}

function spokeAtHub(type, coordinates) {
  return markers.find(m => m.type === type && sameCoord(m.coordinates, coordinates));
}

function resetMarkerSizes() {
  gMarkers.selectAll("circle.marker").transition().duration(150).attr("r", radius);
  gMarkers.selectAll(".split-disc").transition().duration(150).attr("transform", "scale(1)");
}

function semicirclePath(r, side) {
  const sweep = side === "right" ? 1 : 0;
  return `M 0,${-r} A ${r},${r} 0 0,${sweep} 0,${r} Z`;
}

function highlightType(type) {
  highlightTypes([type]);
}

function highlightTypes(types) {
  const set = new Set(types);
  gMap.selectAll("path.arc").classed("is-highlight", dd => set.has(dd.type));
  raiseHighlightedArcs();
}

function raiseHighlightedArcs() {
  gMap.selectAll("path.arc.is-highlight").raise();
}

function bindMarkerHover(selection, getType, getRadius) {
  selection
    .on("mouseenter", function (event, d) {
      d3.select(this).transition().duration(150).attr("r", getRadius(true));
      highlightType(getType(d));
    })
    .on("mouseleave", function (event, d) {
      if (!stickyMarker || stickyMarker !== d3.select(this).datum()) {
        d3.select(this).transition().duration(150).attr("r", getRadius(false));
      }
      if (!stickyMarker) gMap.selectAll("path.arc").classed("is-highlight", false);
    });
}

function drawMarkers() {
  const visible = markers.filter(m => !isOnHub(m));
  const dots = gMarkers.selectAll("circle.marker.spoke")
      .data(visible, d => d.id || getMarkerId(d))
      .enter()
      .append("circle")
      .attr("class", d => `marker spoke ${d.type}`)
      .attr("data-id", d => d.id || getMarkerId(d))
      .attr("vector-effect", "non-scaling-stroke")
      .attr("cx", d => projection(d.coordinates)[0])
      .attr("cy", d => projection(d.coordinates)[1])
      .attr("r", radius)
      .on("click", function (event, d) {
          event.stopPropagation();
          resetMarkerSizes();
          d3.select(this).transition().duration(150).attr("r", radiusHover);
          stickyMarker = d;
          showInfo(d);
      });
  bindMarkerHover(dots, d => d.type, hovering => hovering ? radiusHover : radius);
}

function drawHubs() {
  const groups = d3.group(
    legendItems.filter(d => Array.isArray(d.coordinates)),
    d => coordKey(d.coordinates)
  );

  groups.forEach(items => {
    const coords = items[0].coordinates;
    const [cx, cy] = projection(coords);
    const g = gMarkers.append("g")
      .attr("class", "hub-marker")
      .attr("transform", `translate(${cx},${cy})`);

    const ai = items.find(d => d.key === "ai");
    const experience = items.find(d => d.key === "experience");

    if (ai && experience) {
      const stack = { keys: ["ai", "experience"], hubs: [ai, experience], coordinates: coords };
      g.datum(stack);

      const disc = g.append("g").attr("class", "split-disc");
      disc.append("path")
        .attr("class", "split-half ai")
        .attr("d", semicirclePath(radius, "left"));
      disc.append("path")
        .attr("class", "split-half experience")
        .attr("d", semicirclePath(radius, "right"));
      disc.append("circle")
        .attr("class", "split-outline")
        .attr("r", radius);

      const growStack = (hovering) => {
        const scale = hovering ? radiusHover / radius : 1;
        disc.transition().duration(150).attr("transform", `scale(${scale})`);
      };

      g.append("circle")
        .attr("class", "hub-hit")
        .attr("r", radiusHover)
        .on("mouseenter", () => {
          growStack(true);
          highlightTypes(stack.keys);
        })
        .on("mouseleave", () => {
          if (stickyMarker !== stack) growStack(false);
          if (!stickyMarker) gMap.selectAll("path.arc").classed("is-highlight", false);
        })
        .on("click", (event) => {
          event.stopPropagation();
          resetMarkerSizes();
          growStack(true);
          stickyMarker = stack;
          showSharedHubInfo(stack.hubs);
        });
      return;
    }

    items.forEach(hub => {
      const dot = g.append("circle")
        .datum(hub)
        .attr("class", `marker hub ${hub.key}`)
        .attr("vector-effect", "non-scaling-stroke")
        .attr("r", radius)
        .on("click", function (event, d) {
          event.stopPropagation();
          resetMarkerSizes();
          d3.select(this).transition().duration(150).attr("r", radiusHover);
          stickyMarker = d;
          showHubInfo(d);
        });
      bindMarkerHover(dot, d => d.key, hovering => hovering ? radiusHover : radius);
    });
  });
}

function getMarkerId(d) {
  return `${d.type}-${Math.round(d.coordinates[0]*10000)}-${Math.round(d.coordinates[1]*10000)}`;
}

function legendSwatch(type) {
  return `<svg class="legend-dot ${type}" width="11" height="11" viewBox="0 0 11 11" aria-hidden="true" focusable="false"><circle cx="5.5" cy="5.5" r="5"></circle></svg>`;
}

function infoLine(type, html) {
  return `<div class="map-info-line">${legendSwatch(type)}<span>${html}</span></div>`;
}

function showInfo(d) {
  mapInfo.html(infoLine(d.type, `${d.content} in ${d.place}`));
  mapInfo.classed("is-visible", true);
  highlightType(d.type);
}

function showHubInfo(hub) {
  showSharedHubInfo([hub]);
}

function showSharedHubInfo(hubs) {
  const lines = hubs.map(hub => {
    const spoke = spokeAtHub(hub.key, hub.coordinates);
    const text = spoke ? `${spoke.content} in ${spoke.place}` : hub.label;
    return infoLine(hub.key, text);
  });
  mapInfo.html(lines.join(""));
  mapInfo.classed("is-visible", true);
  highlightTypes(hubs.map(hub => hub.key));
}

function renderLegend() {
  const container = d3.select("#legend-text");
  if (container.empty()) return;

  container.selectAll("li.legend-item").remove();

  const items = container
      .selectAll("li.legend-item")
      .data(legendItems)
      .enter()
      .append("li")
      .attr("class", "legend-item");

  const svgs = items
      .append("svg")
      .attr("class", d => `legend-dot ${d.key}`)
      .attr("width", 11)
      .attr("height", 11)
      .attr("viewBox", "0 0 11 11")
      .attr("aria-hidden", true)
      .attr("focusable", false);

  svgs.each(function(d) {
      d3.select(this)
          .append("circle")
          .attr("cx", 5.5)
          .attr("cy", 5.5)
          .attr("r", 5);
  });

  items.append("span").html(d => d.label);
}

// ----- Star arcs: hub in each category connects to all others -----
function buildCurvedArcPath(fromLonLat, toLonLat, curvature = 0.2) {
  const [ax, ay] = projection(fromLonLat);
  const [bx, by] = projection(toLonLat);
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  let nx = -dy;
  let ny = dx;
  const nlen = Math.hypot(nx, ny) || 1;
  nx /= nlen;
  ny /= nlen;
  if (ny > 0) { nx = -nx; ny = -ny; }
  const distance = Math.hypot(dx, dy);
  const offset = distance * curvature;
  const cx = mx + nx * offset;
  const cy = my + ny * offset;
  return `M ${ax},${ay} Q ${cx},${cy} ${bx},${by}`;
}

function drawArcs() {
  const arcs = [];
  legendItems.forEach(legend => {
    if (!legend.coordinates) return;
    const type = legend.key;
    const hubCoords = legend.coordinates;
    const hubId = `hub-${type}`;
    const list = markers.filter(m => m.type === type && Array.isArray(m.coordinates));
    list.forEach(spoke => {
      if (sameCoord(hubCoords, spoke.coordinates)) return;
      const spokeId = spoke.id || getMarkerId(spoke);
      const dPath = buildCurvedArcPath(hubCoords, spoke.coordinates, spoke.curvature);
      arcs.push({ type, sourceId: hubId, targetId: spokeId, d: dPath });
    });
  });
  gMap.selectAll("path.arc")
    .data(arcs)
    .enter()
    .append("path")
    .attr("class", d => `arc ${d.type}`)
    .attr("data-src", d => d.sourceId)
    .attr("data-tgt", d => d.targetId)
    .attr("vector-effect", "non-scaling-stroke")
    .attr("d", d => d.d);
}

})();
