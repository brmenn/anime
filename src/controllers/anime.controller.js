import { baseUrl as _baseUrl } from "../utils/base-url.js";
import { default as Axios } from "axios";
import { load } from "cheerio";
import { requestFailed } from "../utils/errors.js";
import { get } from "../utils/episodeHelper.js";
import { baseUrl } from "../utils/base-url.js";
import { headers } from "../utils/headers.js";

export async function detailAnime(req, res) {
  const id = req.params.id;
  const fullUrl = _baseUrl + `anime/${id}`;
  // console.log(fullUrl);
  try {
    const response = await Axios.get(fullUrl, {
      headers
    });

    const $ = load(response.data);
    if ($(".venser").length === 0) {
      res.status(404).json({ status: false, message: `anime "${id}" not found` });
      return;
    }
    const detailElement = $(".venser").find(".fotoanime");
    let object = {};
    let episode_list = [];
    object.thumb = detailElement.find("img").attr("src");
    object.anime_id = req.params.id;
    let genre_name, genre_id, genre_link;
    let genreList = [];

    object.synopsis = $("#venkonten > div.venser > div.fotoanime > div.sinopc")
      .find("p")
      .text();

    detailElement.find(".infozin").filter(function () {
      object.title = $(this)
        .find("p")
        .children()
        .eq(0)
        .text()
        .replace("Judul: ", "");
      object.japanase = $(this)
        .find("p")
        .children()
        .eq(1)
        .text()
        .replace("Japanese: ", "");
      object.score = parseFloat(
        $(this).find("p").children().eq(2).text().replace("Skor: ", "")
      );
      object.producer = $(this)
        .find("p")
        .children()
        .eq(3)
        .text()
        .replace("Produser: ", "");
      object.type = $(this)
        .find("p")
        .children()
        .eq(4)
        .text()
        .replace("Tipe: ", "");
      object.status = $(this)
        .find("p")
        .children()
        .eq(5)
        .text()
        .replace("Status: ", "");
      const totalEpisodeText = $(this)
        .find("p")
        .children()
        .eq(6)
        .text()
        .replace("Total Episode: ", "")
        .trim();
      object.total_episode = parseInt(totalEpisodeText);
      object.duration = $(this)
        .find("p")
        .children()
        .eq(7)
        .text()
        .replace("Durasi: ", "");
      object.release_date = $(this)
        .find("p")
        .children()
        .eq(8)
        .text()
        .replace("Tanggal Rilis: ", "");
      object.studio = $(this)
        .find("p")
        .children()
        .eq(9)
        .text()
        .replace("Studio: ", "");
      $(this)
        .find("p")
        .children()
        .eq(10)
        .find("span > a")
        .each(function () {
          genre_name = $(this).text();
          genre_id = $(this)
            .attr("href").match(/\/genres\/(.*?)\//)[1]
          genre_link = $(this).attr("href");
          genreList.push({ genre_name, genre_id, genre_link });
          object.genre_list = genreList;
        });
    });

    $("div.venser > div.episodelist > ul > li").each((i, element) => {
      const link = $(element).find("span > a").attr("href");
      if (!link || !/\/episode\//.test(link)) return;
      episode_list.push({
        title: $(element).find("span > a").text(),
        id: link.match(/\/episode\/([^/]+)/)[1],
        link,
        uploaded_on: $(element).find(".zeebr").text().trim(),
      });
    });
    object.episode_list =
      episode_list.length === 0
        ? [
            {
              title: "Masih kosong gan",
              id: "Masih kosong gan",
              link: "Masih kosong gan",
              uploaded_on: "Masih kosong gan",
            },
          ]
        : episode_list;
    const batchHref = $("div.venser > div:nth-child(6) > ul > li > span:nth-child(1) > a").attr("href");
    object.batch_link = batchHref
      ? {
          id: batchHref.match(/\/batch\/([^/]+)/)?.[1],
          link: batchHref,
        }
      : {
          id: "Masih kosong gan",
          link: "Masih kosong gan",
        };
    res.json(object);
  } catch (err) {
    console.log(err);
    requestFailed(req, res, err);
  }
}
export async function batchAnime(req, res) {
  const id = req.params.id;
  const fullUrl = `${baseUrl}batch/${id}`;
  try {
    const response = await Axios.get(fullUrl, { headers });
    const $ = load(response.data);
    const obj = {};
    obj.status = "success";
    obj.baseUrl = fullUrl;
    obj.batch_id = id;
    obj.batch_list = [];

    if ($(".download2 > .batchlink").length === 0) {
      res.status(404).json({ status: false, message: `batch "${id}" not found` });
      return;
    }

    $(".download2 > .batchlink").each((i, element) => {
      const title = $(element).children("h4").first().text().trim();
      const qualities = [];
      $(element)
        .children("ul")
        .each((j, ul) => {
          $(ul)
            .children("li")
            .each((k, li) => {
              const download_links = [];
              $(li)
                .find("a")
                .each((l, a) => {
                  download_links.push({
                    host: $(a).text().trim(),
                    link: $(a).attr("href"),
                  });
                });
              qualities.push({
                quality: $(li).find("strong").text().trim(),
                size: $(li).find("i").text().trim(),
                download_links,
              });
            });
        });
      obj.batch_list.push({ title, download_list: qualities });
    });

    obj.title = obj.batch_list.length ? obj.batch_list[0].title : "Masih kosong gan";
    const allQualities = obj.batch_list.flatMap((b) => b.download_list);
    obj.download_list =
      allQualities.length > 0
        ? {
            low_quality: allQualities[0],
            medium_quality: allQualities[Math.floor((allQualities.length - 1) / 2)],
            high_quality: allQualities[allQualities.length - 1],
          }
        : { low_quality: null, medium_quality: null, high_quality: null };

    res.send(obj);
  } catch (err) {
    requestFailed(req, res, err);
  }
}
export async function epsAnime(req, res) {
  const id = req.params.id;
  const fullUrl = `${_baseUrl}episode/${id}`;
  try {
    const response = await Axios.get(fullUrl, {
      headers
    });
    const $ = load(response.data);
    if ($(".venutama").length === 0) {
      res.status(404).json({ status: false, message: `episode "${id}" not found` });
      return;
    }
    const streamElement = $("#lightsVideo").find("#embed_holder");
    const obj = {};
    obj.title = $(".venutama > h1").text();
    obj.baseUrl = fullUrl;

    obj.id = $("div.flir > a:contains('Episodes')").attr("href")?.match(/\/anime\/([^\/]+)/)[1] || "-";
    obj.stream_link = streamElement.find("iframe").attr("src");
    obj.prev_eps_slug = $("div.flir > a:contains('Previous')").attr("href")?.match(/\/episode\/([^\/]+)/)[1] || "-";
    obj.next_eps_slug = $("div.flir > a:contains('Next')").attr("href")?.match(/\/episode\/([^\/]+)/)[1] || "-";

    // obj.link_stream = await get(streamLink);

    obj.episode_list = [];
    $("div.keyingpost > li").each((i, element) => {
      const link = $(element).find("a").attr("href");
      if (!link || !/\/episode\//.test(link)) return;
      obj.episode_list.push({
        title: $(element).find("a").text().trim(),
        id: link.match(/\/episode\/([^/]+)/)[1],
        link,
      });
    });

    obj.mirror_list = [];
    $(".mirrorstream ul").each((i, element) => {
      const quality = ($(element).attr("class") || "").replace(/^m/, "");
      $(element)
        .find("li > a")
        .each((j, a) => {
          const dataContent = $(a).attr("data-content");
          if (!dataContent) return;
          obj.mirror_list.push({
            quality,
            host: $(a).text().trim(),
            data_content: dataContent,
          });
        });
    });

    const allQualities = _parseDownloadList(response.data);
    obj.download_list = allQualities;
    obj.download = {
      low_quality: allQualities[0] || null,
      medium_quality:
        allQualities[Math.floor((allQualities.length - 1) / 2)] || null,
      high_quality: allQualities[allQualities.length - 1] || null,
    };
    res.send(obj);
  } catch (err) {
    console.log(err);
    requestFailed(req, res, err);
  }
}

export async function epsMirror(req, res) {
  const dataContent = req.body?.data_content ?? req.body?.dataContent;
  const episodeId = req.params.animeId;
  const ajaxUrl = `${baseUrl}wp-admin/admin-ajax.php`;

  if (!dataContent) {
    res.status(400).json({
      status: false,
      message: "data_content is required (base64 payload from mirror_list)",
    });
    return;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(dataContent, "base64").toString());
  } catch (err) {
    res.status(400).json({ status: false, message: "data_content is not valid base64 JSON" });
    return;
  }

  const ajaxHeaders = {
    ...headers,
    Accept: "*/*",
    "X-Requested-With": "XMLHttpRequest",
    Origin: baseUrl.replace(/\/$/, ""),
    Referer: `${baseUrl}episode/${episodeId}/`,
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  };

  try {
    const nonceResponse = await Axios.post(
      ajaxUrl,
      new URLSearchParams({ action: "aa1208d27f29ca340c92c66d1926f13f" }).toString(),
      { headers: ajaxHeaders }
    );
    const nonceBody = nonceResponse.data;
    const nonce =
      typeof nonceBody === "string" ? nonceBody : nonceBody?.data ?? "";

    const embedResponse = await Axios.post(
      ajaxUrl,
      new URLSearchParams({
        ...payload,
        nonce,
        action: "2a3505c93b0035d3f455df82bf976b84",
      }).toString(),
      { headers: ajaxHeaders }
    );
    const embedBody = embedResponse.data;
    const encoded =
      typeof embedBody === "string" ? embedBody : embedBody?.data ?? "";

    const embedHtml = Buffer.from(encoded, "base64").toString();
    const $ = load(embedHtml);
    const streamLink = $("iframe").attr("src");

    res.send({
      status: "success",
      anime_id: episodeId,
      stream_link: streamLink,
      link_stream: streamLink ? await get(streamLink) : "-",
    });
  } catch (err) {
    requestFailed(req, res, err);
  }
}

function _parseDownloadList(html) {
  const $ = load(html);
  const qualities = [];
  $(".download ul").each((i, ul) => {
    $(ul)
      .children("li")
      .each((j, li) => {
        const download_links = [];
        $(li)
          .find("a")
          .each((k, a) => {
            download_links.push({
              host: $(a).text().trim(),
              link: $(a).attr("href"),
            });
          });
        qualities.push({
          quality: $(li).find("strong").text().trim(),
          size: $(li).find("i").text().trim(),
          download_links,
        });
      });
  });
  return qualities;
}
