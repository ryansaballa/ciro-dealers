/**
 * CIRO Dealer Scraper
 *
 * PURPOSE
 * -------
 * Run this script from Chrome DevTools while viewing:
 * https://www.ciro.ca/office-investor/dealers-we-regulate
 *
 * WHY NOT NODE?
 * -------------
 * Direct Node.js requests are blocked by Cloudflare.
 * Running in the browser reuses your authenticated session.
 *
 * OUTPUT
 * ------
 * dealers.json
 */

(async () => {
  const TOTAL_PAGES = 30;

  const VIEW_DOM_ID =
    "a1a1eee130d5a0b151cb50266ac8c4565ff2fd26774c1ef47d77b13c951ea6df";

  const allDealers = [];

  const delay = (ms) =>
    new Promise((resolve) =>
      setTimeout(resolve, ms)
    );

  function createSlug(text) {
    return text
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function getProvince(address) {
    const match = address.match(
      /\b(AB|BC|MB|NB|NL|NS|NT|NU|ON|PE|QC|SK|YT)\b/
    );

    return match ? match[1] : "";
  }

  function getPostalCode(address) {
    const match = address.match(
      /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/i
    );

    return match
      ? match[0].toUpperCase()
      : "";
  }

  function getCity(address) {
    const province = getProvince(address);

    if (!province) return "";

    const match = address.match(
      new RegExp(
        `([A-Za-z\\s'\\-.]+),?\\s${province}`
      )
    );

    return match
      ? match[1].trim()
      : "";
  }

  for (let page = 0; page < TOTAL_PAGES; page++) {
    console.log(
      `Fetching page ${page + 1}/${TOTAL_PAGES}`
    );

    const url = new URL(
      "https://www.ciro.ca/views/ajax"
    );

    url.search = new URLSearchParams({
      _wrapper_format: "drupal_ajax",
      view_name: "regulated_dealers",
      view_display_id: "block_regulated_dealers",
      view_args: "",
      view_path: "/node/12256",
      view_base_path: "",
      view_dom_id: VIEW_DOM_ID,
      pager_element: "0",
      sort_bef_combine_regulated_dealers: "title_ASC",
      field_registration_category_target_id: "All",
      combine: "",
      sort_by: "title",
      sort_order: "ASC",
      page: String(page),
      _drupal_ajax: "1",
    });

    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        Accept:
          "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With":
          "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      console.warn(
        `Page ${page + 1} failed`
      );

      continue;
    }

    const json = await response.json();

    const html = json.find(
      (item) =>
        item.command === "insert" &&
        item.data?.includes(
          "node--type-regulated-dealer"
        )
    )?.data;

    if (!html) {
      console.warn(
        `No dealer data found on page ${page + 1}`
      );

      continue;
    }

    const doc = new DOMParser()
      .parseFromString(
        html,
        "text/html"
      );

    const articles = [
      ...doc.querySelectorAll(
        "article.node--type-regulated-dealer"
      ),
    ];

    const pageDealers = articles.map(
      (article) => {
        const name =
          article
            .querySelector(
              ".field--name-title"
            )
            ?.textContent.trim() || "";

        const address =
          article
            .querySelector(
              ".field--name-field-street-address"
            )
            ?.textContent
            .replace(/\s+/g, " ")
            .trim() || "";

        return {
          id: createSlug(name),

          name,

          address,

          city: getCity(address),

          province:
            getProvince(address),

          postalCode:
            getPostalCode(address),

          phone:
            article
              .querySelector(
                ".field--name-field-telephone"
              )
              ?.textContent.trim() ||
            "",

          website:
            article.querySelector(
              ".field--name-field-website a"
            )?.href || "",

          category:
            article
              .querySelector(
                ".field--name-field-registration-category .field__item"
              )
              ?.textContent.trim() ||
            "",

          participant: Boolean(
            article.querySelector(
              ".field--name-field-market-participant"
            )
          ),

          // Phase 2 placeholders
          latitude: null,
          longitude: null,
        };
      }
    );

    console.log(
      `Found ${pageDealers.length} dealers`
    );

    allDealers.push(...pageDealers);

    await delay(500);
  }

  const uniqueDealers = [
    ...new Map(
      allDealers.map(
        (dealer) => [
          `${dealer.name}|${dealer.address}`,
          dealer,
        ]
      )
    ).values(),
  ];

  uniqueDealers.sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  const output = {
    source:
      "https://www.ciro.ca/office-investor/dealers-we-regulate",
    generatedAt:
      new Date().toISOString(),
    count:
      uniqueDealers.length,
    dealers:
      uniqueDealers,
  };

  console.log(
    `✅ Found ${uniqueDealers.length} unique dealers`
  );

  const blob = new Blob(
    [
      JSON.stringify(
        output,
        null,
        2
      ),
    ],
    {
      type: "application/json",
    }
  );

  const link =
    document.createElement("a");

  link.href =
    URL.createObjectURL(blob);

  link.download =
    "dealers.json";

  link.click();

  window.dealers =
    uniqueDealers;

  console.table(
    uniqueDealers.slice(0, 10)
  );
})();