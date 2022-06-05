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

    text.split("\n").forEach((d) => {
      const el = textEl.append("code").text(d);
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
      let start1, start2, end1, end2;

      if (Array.isArray(line)) {
        start1 = textsArray1[line[0] - 1].node().getBoundingClientRect();
        start2 = textsArray1[line[1] - 1].node().getBoundingClientRect();

        if (Array.isArray(nline)) {
          end1 = textsArray2[nline[0] - 1].node().getBoundingClientRect();
          end2 = textsArray2[nline[1] - 1].node().getBoundingClientRect();
          links.push({
            source: [
              [
                start1.x + start1.width - containerElRect.x,
                start1.y - containerElRect.y,
              ],
              [
                start2.x + start2.width - containerElRect.x,
                start2.y + start2.height - containerElRect.y,
              ],
            ],
            target: [
              [end1.x - containerElRect.x, end1.y - containerElRect.y],
              [
                end2.x - containerElRect.x,
                end2.y + end2.height - containerElRect.y,
              ],
            ],
          });
        } else {
          end1 = textsArray2[nline - 1].getBoundingClientRect();

          links.push({
            source: [
              [
                start1.x + start1.width - containerElRect.x,
                start1.y - containerElRect.y,
              ],
              [
                start2.x + start2.width - containerElRect.x,
                start2.y + start2.height - containerElRect.y,
              ],
            ],
            target: [
              [end1.x - containerElRect.x, end1.y - containerElRect.y],
              [end1.x - containerElRect.x, end1.y - containerElRect.y],
            ],
          });
        }
      } else {
        end1 = textsArray2[nline[0] - 1].node().getBoundingClientRect();
        end2 = textsArray2[nline[1] - 1].node().getBoundingClientRect();

        start1 = textsArray1[line - 1].node().getBoundingClientRect();

        links.push({
          source: [
            [
              start1.x + start1.width - containerElRect.x,
              start1.y - containerElRect.y,
            ],
            [
              start1.x + start1.width - containerElRect.x,
              start1.y - containerElRect.y,
            ],
          ],
          target: [
            [end1.x - containerElRect.x, end1.y - containerElRect.y],
            [
              end2.x - containerElRect.x,
              end2.y + end2.height - containerElRect.y,
            ],
          ],
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
            .attr("class", "link")
            .attr("fill", "none")
            .attr("stroke-width", 0.1)
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
    const lineTop = linkHorizontalGen({
      source: d.source[0],
      target: d.target[0],
    });

    const lineRight = `L${d.target[1][0]} ${d.target[1][1]}`;

    const lineBottom = linkHorizontalGen({
      source: d.target[1],
      target: d.source[1],
    });

    const lineLeft = `L${d.target[0][0]} ${d.target[0][1]}`;

    return lineTop + lineRight + lineBottom + lineLeft;
  };
}
