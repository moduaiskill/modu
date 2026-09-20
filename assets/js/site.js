"use strict";
/*
 * 공통 스크립트. body[data-page] 값에 따라 페이지별 렌더러를 실행합니다.
 * 데이터는 catalog.js(스킬), results.js(결과물), cohorts.js(기수)에서 읽습니다.
 */
(function () {
  const skills = window.skillCatalog || [];
  const results = window.resultCatalog || [];
  const cohorts = window.cohorts || [];
  const categories = window.skillCategories || [];
  const statusLabel = window.skillStatusLabel || {};
  const params = new URLSearchParams(location.search);
  let toastTimer;

  /* ---------- 아이콘 스프라이트 ---------- */
  const SYMBOLS = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    "up-right": '<path d="M6 18 18 6M6 6h12v12"/>',
    folder:
      '<path d="M3 7V5a1 1 0 0 1 1-1h5l3 3h8a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z"/><path d="M3 9h18"/>',
    book: '<path d="M12 6c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-3-1-6-1-9 1v14Z"/>',
    case: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4h8v3M3 12l9 3 9-3M12 12v5"/>',
    building: '<path d="m3 8 9-5 9 5H3Zm2 3v7m5-7v7m4-7v7m5-7v7M3 21h18"/>',
    leaf: '<path d="M19 4C7 2 2 9 6 15s16 3 13-11ZM5 21 16 8M9 16v-6m0 6h6"/>',
    megaphone:
      '<path d="M4 10h4l12-6v16L8 14H4v-4Zm4 4 2 6H6l-2-6m16-5 2 1v4l-2 1"/>',
    pen: '<path d="m4 20 1-6L16 3l5 5-11 11-6 1ZM13 6l5 5M5 14l5 5"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M15 8V3H3v13h5"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 19h16"/>',
    users:
      '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 13a6 6 0 0 1 3.5 6"/>',
    calendar:
      '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4m8-4v4"/>',
    file: '<path d="M6 3h8l4 4v14H6V3Zm8 0v4h4M9 12h6M9 16h6"/>',
    github:
      '<path d="M9 19c-4 1-4-2-6-2m12 5v-4c0-1-.3-1.6-.8-2 3-.4 6-1.5 6-6a5 5 0 0 0-1.3-3.5 5 5 0 0 0-.1-3.5s-1.2-.4-3.8 1.3a13 13 0 0 0-7 0C5.4 2.6 4.2 3 4.2 3a5 5 0 0 0-.1 3.5A5 5 0 0 0 2.8 10c0 4.5 3 5.6 6 6-.5.4-.8 1.1-.8 2v4"/>',
  };
  function injectSprite() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "svg-defs");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = Object.entries(SYMBOLS)
      .map(
        ([name, body]) =>
          '<symbol id="i-' + name + '" viewBox="0 0 24 24">' + body + "</symbol>",
      )
      .join("");
    document.body.prepend(svg);
  }

  /* ---------- DOM 도우미 ---------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }
  function icon(name, extra) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon" + (extra ? " " + extra : ""));
    svg.setAttribute("aria-hidden", "true");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", "#i-" + name);
    svg.append(use);
    return svg;
  }
  function link(href, text, className, external) {
    const a = el("a", className, text);
    a.href = href;
    if (external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    return a;
  }
  function textLink(href, text, iconName) {
    const a = link(href, text + " ", "text-link");
    a.append(icon(iconName || "arrow", "small"));
    return a;
  }
  function tag(text, className) {
    return el("span", "tag " + (className || ""), text);
  }
  function statusTag(skill) {
    return tag(statusLabel[skill.status] || skill.status, skill.status);
  }
  function fill(id, node) {
    const target = document.getElementById(id);
    if (!target) return null;
    target.replaceChildren(...(Array.isArray(node) ? node : [node]));
    return target;
  }
  function setText(id, text) {
    const target = document.getElementById(id);
    if (target) target.textContent = text;
  }
  function skillById(id) {
    return skills.find((skill) => skill.id === id);
  }
  function resultById(id) {
    return results.find((result) => result.id === id);
  }
  function normalizeQuery(value) {
    return (value || "").trim().normalize("NFKC").toLocaleLowerCase("ko");
  }
  function matchesQuery(skill, query) {
    if (!query) return true;
    return [
      skill.id,
      skill.title,
      skill.description,
      skill.categoryName,
      skill.audience,
      ...(skill.members || []),
      ...skill.tags,
    ]
      .join(" ")
      .normalize("NFKC")
      .toLocaleLowerCase("ko")
      .includes(query);
  }
  function categoryButtons() {
    return categories.map((item) => {
      const count =
        item.id === "all"
          ? skills.length
          : skills.filter((skill) => skill.category === item.id).length;
      const button = el("button", "filter", item.name + " ");
      button.type = "button";
      button.dataset.category = item.id;
      button.append(el("span", "", String(count)));
      return button;
    });
  }
  function toast(message) {
    const target = document.querySelector("#toast");
    if (!target) return;
    clearTimeout(toastTimer);
    target.textContent = message;
    target.classList.add("visible");
    toastTimer = setTimeout(() => target.classList.remove("visible"), 3000);
  }
  async function copyText(text, focusTarget) {
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      const area = el("textarea", "clipboard-fallback");
      area.value = text;
      document.body.append(area);
      area.select();
      try {
        copied = document.execCommand("copy");
      } catch {
        /* 사용자가 직접 복사할 수 있습니다. */
      }
      area.remove();
      focusTarget?.focus();
    }
    toast(
      copied
        ? "복사했습니다."
        : "자동 복사가 제한되어 있습니다. 텍스트를 직접 선택해 복사해 주세요.",
    );
  }

  /* ---------- 카드 ---------- */
  function skillCard(skill) {
    const card = el("article", "skill-card");
    const top = el("div", "card-top");
    const category = el("span", "card-category");
    category.append(icon(skill.icon), document.createTextNode(skill.categoryName));
    top.append(category, statusTag(skill));
    const heading = el("h3");
    heading.append(link("skill.html?id=" + skill.id, skill.title));
    const tags = el("div", "card-tags");
    skill.tags.forEach((item) => tags.append(tag(item)));
    const bottom = el("div", "card-bottom");
    const meta =
      skill.status === "planned"
        ? (skill.cohort ? skill.cohort + "기 제작 후보" : "제작 후보") +
          (skill.members ? " · " + skill.members.join(", ") : "")
        : skill.download
          ? "폴더 · 스크립트 포함"
          : "SKILL.md 하나로 사용";
    bottom.append(el("span", "", meta), textLink("skill.html?id=" + skill.id, "자세히"));
    card.append(
      top,
      heading,
      el("p", "card-description", skill.description),
      tags,
      bottom,
    );
    return card;
  }
  function resultCard(result, options) {
    const card = el("article", "result-card");
    const preview = el("div", "result-preview");
    if (result.preview) {
      const img = el("img");
      img.src = result.preview;
      img.alt = result.alt || result.title + " 미리보기";
      img.loading = "lazy";
      img.width = 720;
      img.height = 450;
      preview.append(img);
    } else {
      const tile = el("div", "doc-tile");
      tile.append(el("b", "", result.tile || "DOC"), el("span", "", result.format));
      preview.append(tile);
    }
    const body = el("div", "result-body");
    body.append(
      el("span", "result-kind", result.number + " / " + result.kind),
      el("h3", "", result.title),
      el("p", "", result.description),
    );
    const meta = el("div", "result-meta");
    meta.append(tag(result.format));
    meta.append(
      tag(
        result.origin === "generated" ? "스킬로 만든 예시" : "제공된 시연 자료",
        result.origin === "generated" ? "example" : "",
      ),
    );
    const skill = result.skill && skillById(result.skill);
    if (skill && !(options && options.hideSkill)) {
      const skillTag = tag("스킬 · " + skill.title);
      meta.append(skillTag);
    }
    body.append(meta);
    const links = el("div", "result-links");
    links.append(
      link(result.view, result.viewLabel || "브라우저에서 보기", "", true),
    );
    if (result.download) {
      links.append(link(result.download, result.downloadLabel || "내려받기"));
    }
    if (skill && !(options && options.hideSkill)) {
      links.append(link("skill.html?id=" + skill.id, "스킬 보기"));
    }
    body.append(links);
    card.append(preview, body);
    return card;
  }
  function resultShowcase(items) {
    const wrap = el("div", "showcase");
    const list = el("div", "showcase-list");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", "결과물 목록");
    const stage = el("div", "showcase-stage");
    stage.id = "showcase-stage";
    stage.setAttribute("role", "tabpanel");
    const frame = el("div", "showcase-frame");
    const thumbs = el("div", "showcase-thumbs");
    const info = el("div", "showcase-info");
    stage.append(frame, thumbs, info);

    /* 결과물은 실제 비율 그대로의 이미지로 보여 줍니다. */
    function showImage(result, index) {
      const shot = result.gallery[index];
      const img = el("img");
      img.src = shot.src;
      img.alt = shot.alt || result.title + " 미리보기";
      img.loading = "lazy";
      img.decoding = "async";
      frame.replaceChildren(img);
      frame.scrollTop = 0;
      [...thumbs.children].forEach((button, order) => {
        const active = order === index;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    }

    function renderGallery(result) {
      thumbs.replaceChildren();
      if (result.gallery.length < 2) {
        thumbs.hidden = true;
      } else {
        thumbs.hidden = false;
        result.gallery.forEach((shot, index) => {
          const button = el("button", "showcase-thumb");
          button.type = "button";
          const img = el("img");
          img.src = shot.src;
          img.alt = "";
          img.loading = "lazy";
          button.append(img, el("span", "", shot.label || String(index + 1)));
          button.addEventListener("click", () => showImage(result, index));
          thumbs.append(button);
        });
      }
      showImage(result, 0);
    }

    /* 마크다운처럼 이미지가 어울리지 않는 결과물은 내용을 그대로 싣습니다. */
    function renderText(result) {
      const tile = el("div", "doc-tile");
      tile.append(el("b", "", result.tile || "DOC"), el("span", "", result.format));
      frame.replaceChildren(tile);
      thumbs.hidden = true;
      if (!/\.(md|txt)$/i.test(result.view)) return;
      fetch(result.view)
        .then((response) => (response.ok ? response.text() : Promise.reject()))
        .then((text) => {
          if (!frame.contains(tile)) return;
          frame.replaceChildren(el("pre", "showcase-text", text));
        })
        .catch(() => {
          /* 파일을 바로 읽을 수 없으면 표지 타일을 그대로 둡니다. */
        });
    }

    function renderInfo(result) {
      info.replaceChildren();
      info.append(
        el("span", "result-kind", result.number + " / " + result.kind),
        el("h3", "", result.title),
        el("p", "", result.description),
      );
      const meta = el("div", "result-meta");
      meta.append(tag(result.format));
      meta.append(
        tag(
          result.origin === "generated" ? "스킬로 만든 예시" : "제공된 시연 자료",
          result.origin === "generated" ? "example" : "",
        ),
      );
      const skill = result.skill && skillById(result.skill);
      if (skill) meta.append(tag("스킬 · " + skill.title));
      info.append(meta);
      const links = el("div", "result-links");
      links.append(link(result.view, result.viewLabel || "원본 열어보기", "", true));
      if (result.download) {
        links.append(link(result.download, result.downloadLabel || "내려받기"));
      }
      if (skill) links.append(link("skill.html?id=" + skill.id, "스킬 보기"));
      info.append(links);
    }

    const buttons = items.map((result, index) => {
      const button = el("button", "showcase-item");
      button.type = "button";
      button.id = "showcase-tab-" + result.id;
      button.setAttribute("role", "tab");
      button.append(
        el("span", "showcase-num", result.number),
        el("span", "showcase-name", result.title),
        el("span", "showcase-kind", result.kind),
      );
      button.addEventListener("click", () => select(index));
      button.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % items.length;
        if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index - 1 + items.length) % items.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = items.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        select(next);
        buttons[next].focus();
      });
      return button;
    });

    function select(index) {
      buttons.forEach((button, order) => {
        const active = order === index;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      const result = items[index];
      stage.setAttribute("aria-labelledby", buttons[index].id);
      if (result.gallery && result.gallery.length) renderGallery(result);
      else renderText(result);
      renderInfo(result);
    }

    list.append(...buttons);
    wrap.append(list, stage);
    if (items.length) select(0);
    return wrap;
  }
  function memberCard(member) {
    const card = el("article", "member-card");
    card.append(el("span", "field", member.field), el("h3", "", member.name));
    card.append(el("p", "", member.plan));
    const skill = member.skill && skillById(member.skill);
    if (skill) {
      card.append(textLink("skill.html?id=" + skill.id, "제작 후보 · " + skill.title));
    }
    return card;
  }
  function factsTable(rows) {
    const table = el("table", "data-table");
    const body = el("tbody");
    rows.forEach(([label, value]) => {
      const tr = el("tr");
      tr.append(el("th", "", label), el("td", "", value));
      body.append(tr);
    });
    table.append(body);
    return table;
  }
  function checkList(items) {
    const list = el("ul", "check-list");
    items.forEach((item) => list.append(el("li", "", item)));
    return list;
  }
  function paragraphs(items, className) {
    const wrap = el("div", className || "prose");
    items.forEach((item) => wrap.append(el("p", "", item)));
    return wrap;
  }

  /* ---------- 내비게이션 ---------- */
  function setupNav() {
    const current = document.body.dataset.nav;
    document.querySelectorAll(".site-nav a[data-nav]").forEach((item) => {
      if (item.dataset.nav === current) item.setAttribute("aria-current", "page");
    });
    const menu = document.querySelector(".menu-toggle");
    const navigation = document.querySelector("#navigation");
    if (!menu || !navigation) return;
    const close = () => {
      menu.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-label", "메뉴 열기");
      navigation.classList.remove("open");
    };
    menu.addEventListener("click", () => {
      const open = menu.getAttribute("aria-expanded") !== "true";
      menu.setAttribute("aria-expanded", String(open));
      menu.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
      navigation.classList.toggle("open", open);
    });
    navigation.querySelectorAll("a").forEach((item) => item.addEventListener("click", close));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navigation.classList.contains("open")) {
        close();
        menu.focus();
      }
    });
  }

  /* ---------- 사용법 탭 (홈·가이드·스킬 상세 공용) ---------- */
  const usage = {
    chat: {
      title: "복사해서 대화에 붙여 넣습니다",
      description:
        "SKILL.md 내용을 아래 요청, 업무 자료와 함께 전달합니다. 일반 채팅에서는 지침으로 활용하며 필요한 참고자료도 함께 전달합니다.",
      label: "요청 예시",
      code: "첨부하거나 붙여 넣은 SKILL.md 지침에 따라\n이 회의 메모를 정리해줘.\n결정 사항과 후속 할 일을 구분해줘.",
    },
    claude: {
      title: "Claude Code에 폴더로 설치합니다",
      description:
        "스킬 폴더 전체를 프로젝트의 .claude/skills/ 아래에 복사합니다. 모든 프로젝트에서 쓰려면 개인 폴더 ~/.claude/skills/를 사용합니다.",
      label: "폴더 위치와 호출 예시",
      code: ".claude/skills/meeting-notes/SKILL.md\n\n/meeting-notes 이 회의 메모를 정리해줘.",
    },
    codex: {
      title: "Codex에 폴더로 설치합니다",
      description:
        "스킬 폴더 전체를 프로젝트의 .agents/skills/ 아래에 복사합니다. 개인용 위치는 ~/.agents/skills/이며, 목록에 나타나지 않으면 Codex를 다시 시작합니다.",
      label: "폴더 위치와 호출 예시",
      code: ".agents/skills/meeting-notes/SKILL.md\n\n$meeting-notes 이 회의 메모를 정리해줘.",
    },
  };
  function setupUsageTabs() {
    const tabs = [...document.querySelectorAll("[data-tool]")];
    if (!tabs.length) return;
    const select = (tab) => {
      tabs.forEach((item) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });
      const content = usage[tab.dataset.tool];
      setText("usage-title", content.title);
      setText("usage-description", content.description);
      setText("usage-code", content.code);
      setText("code-label", content.label);
      document.querySelector("#usage-panel")?.setAttribute("aria-labelledby", tab.id);
    };
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => select(tab));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          select(tabs[next]);
          tabs[next].focus();
        }
      });
    });
    select(tabs[0]);
  }
  function setupCopyButtons() {
    document.querySelectorAll("[data-copy-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const source = document.getElementById(button.dataset.copyTarget);
        if (source) copyText(source.textContent, button);
      });
    });
  }

  /* ---------- 페이지: 홈 ---------- */
  const HOME_SKILL_LIMIT = 6;
  function setupHomeSearch() {
    const grid = document.querySelector("#home-skills");
    const search = document.querySelector("#home-search");
    const filtersWrap = document.querySelector("#home-filters");
    if (!grid || !search) return;
    const ready = skills.filter((skill) => skill.status !== "planned");
    const planned = skills.filter((skill) => skill.status === "planned");
    const ordered = [...ready, ...planned];
    const empty = document.querySelector("#home-empty");
    let category = "all";
    const buttons = categoryButtons();
    if (filtersWrap) filtersWrap.replaceChildren(...buttons);
    const update = () => {
      buttons.forEach((button) => {
        const active = button.dataset.category === category;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const query = normalizeQuery(search.value);
      const matched = ordered.filter(
        (skill) =>
          (category === "all" || category === skill.category) &&
          matchesQuery(skill, query),
      );
      const browsing = Boolean(query) || category !== "all";
      const shown = browsing ? matched : matched.slice(0, HOME_SKILL_LIMIT);
      grid.replaceChildren(...shown.map(skillCard));
      const status = document.querySelector("#home-search-count");
      if (status) {
        status.replaceChildren();
        status.append(
          el("b", "", matched.length + "개"),
          document.createTextNode(
            browsing
              ? " 스킬이 검색어와 일치합니다."
              : " 중 " + shown.length + "개를 먼저 보여드립니다.",
          ),
        );
      }
      if (empty) empty.hidden = matched.length > 0;
    };
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        category = button.dataset.category;
        update();
      }),
    );
    search.addEventListener("input", update);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && search.value) {
        event.preventDefault();
        search.value = "";
        update();
      }
    });
    document.querySelectorAll("[data-keyword]").forEach((button) =>
      button.addEventListener("click", () => {
        search.value = button.dataset.keyword;
        category = "all";
        update();
        search.focus();
      }),
    );
    document.querySelector("#home-reset")?.addEventListener("click", () => {
      search.value = "";
      category = "all";
      update();
      search.focus();
    });
    update();
  }
  function renderHome() {
    setupHomeSearch();
    fill("home-showcase", resultShowcase(results));
    setText("stat-shared", String(skills.filter((s) => s.status === "shared").length));
    setText("stat-planned", String(skills.filter((s) => s.status === "planned").length));
    setText("stat-results", String(results.length));
    const cohort = cohorts[0];
    if (cohort) {
      setText("stat-members", String(cohort.members.length));
      setText("home-cohort-title", cohort.title);
      setText("home-cohort-period", cohort.period + " · " + cohort.status);
      setText("home-cohort-summary", cohort.summary);
      const list = el("ol", "notice-list");
      cohort.weeks.forEach((week) => {
        const li = el("li");
        li.append(
          el("span", "date", "WEEK " + String(week.number).padStart(2, "0")),
          link("cohort.html?id=" + cohort.id + "#week-" + week.number, week.title),
          tag(week.status === "done" ? "완료" : "예정", week.status),
        );
        list.append(li);
      });
      fill("home-cohort-weeks", list);
      const facts = el("div", "cohort-facts");
      [
        [cohort.members.length + "명", "참여자"],
        [cohort.skills.length + "개", "스킬과 제작 후보"],
        [cohort.results.length + "종", "결과물"],
      ].forEach(([value, label]) => {
        const item = el("div");
        item.append(el("b", "", value), el("span", "", label));
        facts.append(item);
      });
      fill("home-cohort-facts", facts);
      const cohortLink = document.getElementById("home-cohort-link");
      if (cohortLink) cohortLink.href = "cohort.html?id=" + cohort.id;
    }
  }

  /* ---------- 페이지: 스킬 목록 ---------- */
  function renderSkills() {
    const grid = document.querySelector("#skill-grid");
    const search = document.querySelector("#skill-search");
    const filtersWrap = document.querySelector("#filters");
    const empty = document.querySelector("#empty-state");
    if (!grid || !search || !filtersWrap) return;
    let category = params.get("category") || "all";
    if (!categories.some((item) => item.id === category)) category = "all";
    const buttons = categoryButtons();
    filtersWrap.replaceChildren(...buttons);
    const update = () => {
      buttons.forEach((button) => {
        const active = button.dataset.category === category;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const query = normalizeQuery(search.value);
      const shown = skills.filter(
        (skill) =>
          (category === "all" || category === skill.category) &&
          matchesQuery(skill, query),
      );
      grid.replaceChildren(...shown.map(skillCard));
      const counts = { shared: 0, example: 0, planned: 0 };
      shown.forEach((skill) => (counts[skill.status] = (counts[skill.status] || 0) + 1));
      const status = document.querySelector("#result-count");
      if (status) {
        status.replaceChildren();
        const strong = el("b", "", shown.length + "개");
        status.append(
          strong,
          document.createTextNode(
            " · 공유 스킬 " +
              counts.shared +
              " · 시작 예제 " +
              counts.example +
              " · 제작 후보 " +
              counts.planned,
          ),
        );
      }
      if (empty) empty.hidden = shown.length > 0;
    };
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        category = button.dataset.category;
        update();
      }),
    );
    search.addEventListener("input", update);
    document.querySelector("#reset-search")?.addEventListener("click", () => {
      search.value = "";
      category = "all";
      update();
      search.focus();
    });
    update();
  }

  /* ---------- 페이지: 스킬 상세 ---------- */
  function renderSkill() {
    const skill = skillById(params.get("id"));
    const main = document.querySelector("#skill-detail");
    const missing = document.querySelector("#skill-missing");
    if (!skill) {
      if (main) main.hidden = true;
      if (missing) missing.hidden = false;
      return;
    }
    document.title = skill.title + " — 모두의 AI Skill";
    setText("skill-title", skill.title);
    setText("skill-lead", skill.description);
    setText("crumb-current", skill.title);
    const crumbCategory = document.getElementById("crumb-category");
    if (crumbCategory) {
      crumbCategory.textContent = skill.categoryName;
      crumbCategory.href = "skills.html?category=" + skill.category;
    }
    fill("skill-meta", [
      statusTag(skill),
      tag(skill.categoryName),
      ...(skill.cohort ? [tag(skill.cohort + "기")] : []),
      ...skill.tags.map((item) => tag(item)),
    ]);

    const sections = [];
    const section = (title, node, note) => {
      const wrap = el("section");
      const head = el("div", "sub-head");
      head.append(el("h3", "", title));
      if (note) head.append(el("span", "", note));
      wrap.append(head, node);
      sections.push(wrap);
    };
    section("소개", paragraphs(skill.overview || [skill.benefit]));
    section(
      "사용자와 효용",
      factsTable([
        ["사용자", skill.audience],
        ["기대하는 변화", skill.benefit],
        ...(skill.origin ? [["출처", skill.origin]] : []),
        ...(skill.members ? [["제작 참여", skill.members.join(", ") + " (" + skill.cohort + "기)"]] : []),
      ]),
    );
    if (skill.inputs) section("필요한 입력", checkList(skill.inputs));
    if (skill.steps) {
      const steps = el("ol", "steps");
      skill.steps.forEach((step) => {
        const li = el("li");
        const body = el("div");
        body.append(el("h3", "", step.title), el("p", "", step.text));
        li.append(body);
        steps.append(li);
      });
      section("작업 흐름", steps);
    }
    if (skill.usageExample) {
      const box = el("div", "code-box");
      const toolbar = el("div", "code-toolbar");
      const button = el("button", "", "");
      button.type = "button";
      button.append(icon("copy", "small"), document.createTextNode(" 복사"));
      button.addEventListener("click", () => copyText(skill.usageExample, button));
      toolbar.append(el("span", "", skill.status === "shared" && skill.id === "md-to-hwpx" ? "실행 명령" : "요청 예시"), button);
      const pre = el("pre");
      pre.append(el("code", "", skill.usageExample));
      box.append(toolbar, pre);
      section("사용 예시", box, "환경별 설치 방법은 사용 가이드 참고");
    }
    if (skill.files) {
      const tree = el("ul", "file-tree");
      skill.files.forEach((file) => tree.append(el("li", "", file)));
      section("폴더 구성", tree, skill.folder);
    }
    if (skill.requirements) section("요구 환경", checkList(skill.requirements));
    const related = (skill.results || []).map(resultById).filter(Boolean);
    if (related.length) {
      const grid = el("div", "result-grid");
      related.forEach((result) => {
        const card = resultCard(result, { hideSkill: true });
        if (result.relation) {
          card.querySelector(".result-body p").textContent = result.relation;
        }
        grid.append(card);
      });
      section("이 스킬로 만든 결과물", grid, related.length + "종");
    } else if (skill.status === "planned") {
      section(
        "결과물",
        paragraphs([
          "아직 완성 파일과 결과물이 없습니다. 제작과 피드백을 거쳐 공개하면 이 자리에 연결합니다.",
        ]),
      );
    }
    if (skill.notes) section("주의사항", checkList(skill.notes));
    fill("skill-sections", sections);

    const side = [];
    const action = el("div", "side-box");
    action.append(el("h3", "", "파일"));
    if (skill.download) {
      const download = link(skill.download, "스킬 ZIP 받기 ", "button");
      download.setAttribute("download", "");
      download.append(icon("download", "small"));
      action.append(download);
    }
    const view = link(
      skill.path,
      skill.status === "planned" ? "분야 안내 보기 " : "SKILL.md 보기 ",
      "button secondary",
    );
    view.append(icon("up-right", "small"));
    action.append(view);
    if (skill.status === "example") {
      const raw = link(skill.path, "SKILL.md 내려받기 ", "button secondary");
      raw.setAttribute("download", "SKILL.md");
      raw.append(icon("download", "small"));
      action.append(raw);
    }
    side.push(action);
    const info = el("div", "side-box");
    info.append(el("h3", "", "요약"));
    const dl = el("dl");
    [
      ["상태", statusLabel[skill.status] || skill.status],
      ["분야", skill.categoryName],
      ["기수", skill.cohort ? skill.cohort + "기" : "미정"],
      ["사용 환경", skill.environment || "제작 후보입니다. 아직 완성 파일은 없으며, 제작과 피드백을 거쳐 공개합니다."],
    ].forEach(([label, value]) => {
      dl.append(el("dt", "", label), el("dd", "", value));
    });
    info.append(dl);
    side.push(info);
    const cohort = cohorts.find((item) => item.id === skill.cohort);
    if (cohort) {
      const box = el("div", "side-box");
      box.append(el("h3", "", "기수 활동"));
      box.append(el("p", "note", cohort.title + " · " + cohort.period));
      box.append(textLink("cohort.html?id=" + cohort.id, "기수 활동 보기"));
      side.push(box);
    }
    fill("skill-side", side);
  }

  /* ---------- 페이지: 결과물 ---------- */
  function renderResults() {
    const grid = document.querySelector("#result-grid");
    if (!grid) return;
    const buttons = [...document.querySelectorAll("[data-origin]")];
    let origin = "all";
    const update = () => {
      buttons.forEach((button) => {
        const active = button.dataset.origin === origin;
        button.classList.toggle("active", active);
        button.setAttribute("aria-pressed", String(active));
      });
      const shown = results.filter((result) => origin === "all" || result.origin === origin);
      grid.replaceChildren(...shown.map(resultCard));
      setText("result-total", shown.length + "종");
    };
    buttons.forEach((button) =>
      button.addEventListener("click", () => {
        origin = button.dataset.origin;
        update();
      }),
    );
    update();
    const table = document.querySelector("#result-table tbody");
    if (table) {
      results.forEach((result) => {
        const tr = el("tr");
        const skill = result.skill && skillById(result.skill);
        const first = el("td");
        first.append(link(result.view, result.title, "", true));
        const skillCell = el("td");
        skillCell.append(
          skill ? link("skill.html?id=" + skill.id, skill.title) : document.createTextNode("연결된 스킬 없음"),
        );
        tr.append(
          el("td", "", result.number),
          first,
          el("td", "", result.format),
          skillCell,
          el("td", "", result.relation || ""),
        );
        table.append(tr);
      });
    }
  }

  /* ---------- 페이지: 기수 목록 ---------- */
  function renderCohorts() {
    const grid = document.querySelector("#cohort-grid");
    if (!grid) return;
    const cards = cohorts.map((cohort) => {
      const card = el("article", "cohort-card");
      const top = el("div", "card-top");
      top.append(el("span", "period", cohort.period), tag(cohort.status, cohort.statusClass));
      card.append(top, el("h3", "", cohort.title), el("p", "", cohort.summary));
      const facts = el("div", "cohort-facts");
      [
        [cohort.members.length + "명", "참여자"],
        [cohort.skills.length + "개", "스킬과 제작 후보"],
        [cohort.results.length + "종", "결과물"],
      ].forEach(([value, label]) => {
        const item = el("div");
        item.append(el("b", "", value), el("span", "", label));
        facts.append(item);
      });
      card.append(facts);
      const bottom = el("div", "card-bottom");
      const done = cohort.weeks.filter((week) => week.status === "done").length;
      bottom.append(
        el("span", "", "주차 기록 " + done + " / " + cohort.weeks.length),
        textLink("cohort.html?id=" + cohort.id, "활동 내역 보기"),
      );
      card.append(bottom);
      return card;
    });
    grid.prepend(...cards);
  }

  /* ---------- 페이지: 기수 상세 ---------- */
  function renderCohort() {
    const cohort = cohorts.find((item) => item.id === (params.get("id") || cohorts[0]?.id));
    const main = document.querySelector("#cohort-detail");
    const missing = document.querySelector("#cohort-missing");
    if (!cohort) {
      if (main) main.hidden = true;
      if (missing) missing.hidden = false;
      return;
    }
    document.title = cohort.title + " — 모두의 AI Skill";
    setText("cohort-title", cohort.title);
    setText("cohort-lead", cohort.summary);
    setText("crumb-current", cohort.name);
    fill("cohort-meta", [tag(cohort.period), tag(cohort.status, cohort.statusClass)]);
    fill("cohort-goal", el("p", "", cohort.goal));
    fill(
      "cohort-facts",
      factsTable([
        ["참여자", cohort.members.map((member) => member.name).join(", ")],
        ...cohort.facts,
      ]),
    );

    const timeline = el("ol", "timeline");
    cohort.weeks.forEach((week) => {
      const li = el("li");
      li.id = "week-" + week.number;
      const weekLabel = el("span", "week", "WEEK " + String(week.number).padStart(2, "0"));
      if (week.date) weekLabel.append(el("small", "", week.date));
      const body = el("div");
      const heading = el("h3", "", week.title + " ");
      heading.append(tag(week.status === "done" ? "완료" : "예정", week.status));
      body.append(heading);
      if (week.place) body.append(el("p", "meta", week.place));
      if (week.summary) {
        const list = el("ul");
        week.summary.forEach((item) => list.append(el("li", "", item)));
        body.append(list);
      }
      if (week.pendingNote) body.append(el("p", "note", week.pendingNote));
      if (week.links) {
        const links = el("div", "links");
        week.links.forEach((item) => links.append(textLink(item.href, item.label, "up-right")));
        body.append(links);
      }
      li.append(weekLabel, body);
      timeline.append(li);
    });
    fill("cohort-weeks", timeline);
    setText("cohort-weeks-count", cohort.weeks.filter((w) => w.status === "done").length + " / " + cohort.weeks.length + "주차 기록");

    fill("cohort-members", cohort.members.map(memberCard));
    setText("cohort-members-count", cohort.members.length + "명");
    const cohortSkills = cohort.skills.map(skillById).filter(Boolean);
    fill("cohort-skills", cohortSkills.map(skillCard));
    const shared = cohortSkills.filter((s) => s.status === "shared").length;
    const example = cohortSkills.filter((s) => s.status === "example").length;
    setText(
      "cohort-skills-count",
      "공유 " + shared + " · 예제 " + example + " · 후보 " + (cohortSkills.length - shared - example),
    );
    const cohortResults = cohort.results.map(resultById).filter(Boolean);
    fill("cohort-results", cohortResults.map(resultCard));
    setText("cohort-results-count", cohortResults.length + "종");
    if (cohort.notes) fill("cohort-notes", checkList(cohort.notes));
  }

  /* ---------- 실행 ---------- */
  injectSprite();
  setupNav();
  setupUsageTabs();
  setupCopyButtons();
  const page = document.body.dataset.page;
  const renderers = {
    home: renderHome,
    skills: renderSkills,
    skill: renderSkill,
    results: renderResults,
    cohorts: renderCohorts,
    cohort: renderCohort,
  };
  if (renderers[page]) renderers[page]();
})();
