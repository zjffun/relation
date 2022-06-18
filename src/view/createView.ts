import { select, Selection } from "d3-selection";
import { linkHorizontal } from "d3-shape";

export function createView(selector, { texts, relations }) {
  const container = select(selector);
  const viewContainer = container
    .append("div")
    .attr("class", "relation-view-container");
  const svg = viewContainer.append("svg").attr("class", "relation-view-svg");
  const links = svg.append("g").attr("class", "relation-view-svg__links");

  const textsEl = viewContainer
    .append("div")
    .attr("class", "relation-view-texts");

  const textsArray = initTexts(textsEl, texts);

  initRelations(links, relations, textsArray, viewContainer);
}

function initTexts(
  textsEl: Selection<HTMLDivElement, unknown, null, undefined>,
  texts
) {
  const textsArray = [];
  texts.forEach((text) => {
    const textArray = [];
    const textEl = textsEl
      .append("pre")
      .attr("class", "relation-view-texts__text");

    text.split("\n").forEach((d, i) => {
      const el = textEl.append("div").attr("class", "line");
      el.append("span")
        .attr("class", "line-num")
        .text(`${i + 1}`);

      el.append("code").attr("class", "line-code").text(`${d}`);
      textArray.push(el);
    });

    textsArray.push(textArray);
  });

  return textsArray;
}

function initRelations(linksEl, relations, textsArray, viewContainer) {
  relations.forEach((viewRelation, i) => {
    const linkEl = linksEl
      .append("g")
      .attr("class", "relation-view-svg__links__link");

    renderLinks(
      linkEl,
      viewRelationToLinks(
        viewRelation,
        textsArray[i],
        textsArray[i + 1],
        viewContainer
      )
    );
  });

  function viewRelationToLinks(
    viewRelation,
    textsArray1,
    textsArray2,
    containerEl
  ) {
    const containerElRect = containerEl.node().getBoundingClientRect();
    const links = [];
    viewRelation.forEach((d, i) => {
      const line = d[0];
      const nline = d[1];
      const type = d[2]?.type;
      let start1, start2, end1, end2;

      if (line[1] !== null) {
        start1 = textsArray1[line[0] - 1].node().getBoundingClientRect();
        start2 = textsArray1[line[1] - 1].node().getBoundingClientRect();

        if (nline[1] !== null) {
          end1 = textsArray2[nline[0] - 1].node().getBoundingClientRect();
          end2 = textsArray2[nline[1] - 1].node().getBoundingClientRect();
          links.push({
            source: [
              [start1.x - containerElRect.x, start1.y - containerElRect.y],
              [
                start1.x + start1.width - containerElRect.x,
                start1.y - containerElRect.y,
              ],
              [
                start2.x + start2.width - containerElRect.x,
                start2.y + start2.height - containerElRect.y,
              ],
              [
                start2.x - containerElRect.x,
                start2.y + start2.height - containerElRect.y,
              ],
            ],
            target: [
              [end1.x - containerElRect.x, end1.y - containerElRect.y],
              [
                end1.x + end1.width - containerElRect.x,
                end1.y - containerElRect.y,
              ],
              [
                end2.x + end2.width - containerElRect.x,
                end2.y + end2.height - containerElRect.y,
              ],
              [
                end2.x - containerElRect.x,
                end2.y + end2.height - containerElRect.y,
              ],
            ],
            type,
          });
        } else {
          end1 = textsArray2[nline[0] - 1].node().getBoundingClientRect();

          links.push({
            source: [
              [start1.x - containerElRect.x, start1.y - containerElRect.y],
              [
                start1.x + start1.width - containerElRect.x,
                start1.y - containerElRect.y,
              ],
              [
                start2.x + start2.width - containerElRect.x,
                start2.y + start2.height - containerElRect.y,
              ],
              [
                start2.x - containerElRect.x,
                start2.y + start2.height - containerElRect.y,
              ],
            ],
            target: [
              [end1.x - containerElRect.x, end1.y - containerElRect.y],
              [
                end1.x + end1.width - containerElRect.x,
                end1.y - containerElRect.y,
              ],
              [
                end1.x + end1.width - containerElRect.x,
                end1.y - containerElRect.y,
              ],
              [end1.x - containerElRect.x, end1.y - containerElRect.y],
            ],
            type,
          });
        }
      } else {
        end1 = textsArray2[nline[0] - 1].node().getBoundingClientRect();
        end2 = textsArray2[nline[1] - 1].node().getBoundingClientRect();

        start1 = textsArray1[line[0] - 1].node().getBoundingClientRect();

        links.push({
          source: [
            [start1.x - containerElRect.x, start1.y - containerElRect.y],
            [
              start1.x + start1.width - containerElRect.x,
              start1.y - containerElRect.y,
            ],
            [
              start1.x + start1.width - containerElRect.x,
              start1.y - containerElRect.y,
            ],
            [start1.x - containerElRect.x, start1.y - containerElRect.y],
          ],
          target: [
            [end1.x - containerElRect.x, end1.y - containerElRect.y],
            [
              end1.x + end1.width - containerElRect.x,
              end1.y - containerElRect.y,
            ],
            [
              end2.x + end2.width - containerElRect.x,
              end2.y + end2.height - containerElRect.y,
            ],
            [
              end2.x - containerElRect.x,
              end2.y + end2.height - containerElRect.y,
            ],
          ],

          type,
        });
      }
    });
    return links;
  }

  function renderLinks(linkEl, links) {
    const rangeLinkHorizontalGen = rangeLinkHorizontal();

    const link = linkEl
      .selectAll(".link")

      .data(links)
      .join(
        (enter) => {
          const g = enter.append("g").attr("class", "link");

          const linkEl = g
            .append("path")
            .attr("class", (link) => `link ${link.type}`)
            .attr("fill", "none")
            .attr("stroke-width", 1)
            // .style("opacity", 0)
            .attr("d", rangeLinkHorizontalGen)

            .attr(
              "id",
              (d, i) => "linklabel_" + i
              // d.source.name +
              // "_" +
              // d.target.name +
              // "_" +
              // d.source.index +
              // "_" +
              // d.target.index
            )
            .style("opacity", 0.65)
            .attr("stroke-width", (d) => Math.max(1, d.width));
        },
        (update) => {
          update
            .select("path")
            // .attr("id", (d, i) => "linklabel" + i)

            .attr("d", rangeLinkHorizontalGen)

            .attr("stroke-width", (d) => Math.max(1, d.width))
            .attr(
              "id",
              (d, i) => "linklabel_" + i
              // "linklabel_" +
              // d.source.name +
              // "_" +
              // d.target.name +
              // "_" +
              // d.source.index +
              // "_" +
              // d.target.index
            );
        },
        (exit) => {
          exit
            .call((g) => g.select("path").attr("stroke-width", (d) => 1))
            .remove();
        }
      );
  }
}

function rangeLinkHorizontal() {
  const linkHorizontalGen = linkHorizontal();
  return function (d) {
    const lineTop1 = linkHorizontalGen({
      source: d.source[0],
      target: d.source[1],
    });

    const lineTop2 = linkHorizontalGen({
      source: d.source[1],
      target: d.target[0],
    }).replace(/^M.*C/, "C");

    const lineTop3 = linkHorizontalGen({
      source: d.target[0],
      target: d.target[1],
    }).replace(/^M.*C/, "C");

    const lineRight = `L${d.target[2][0]} ${d.target[2][1]}`;

    const lineBottom1 = linkHorizontalGen({
      source: d.target[2],
      target: d.target[3],
    }).replace(/^M.*C/, "C");

    const lineBottom2 = linkHorizontalGen({
      source: d.target[3],
      target: d.source[2],
    }).replace(/^M.*C/, "C");

    const lineBottom3 = linkHorizontalGen({
      source: d.source[2],
      target: d.source[3],
    }).replace(/^M.*C/, "C");

    const lineLeft = `L${d.source[0][0]} ${d.source[0][1]}`;

    return (
      lineTop1 +
      lineTop2 +
      lineTop3 +
      lineRight +
      lineBottom1 +
      lineBottom2 +
      lineBottom3 +
      lineLeft
    );
  };
}
