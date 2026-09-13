"use strict";

const catalog = window.skillCatalog || [];
const grid = document.querySelector("#skill-grid");
const search = document.querySelector("#skill-search");
const filters = [...document.querySelectorAll(".filter")];
const dialog = document.querySelector("#skill-dialog");
let category = "all";
let lastTrigger;
let toastTimer;

function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.classList.add("icon");
  svg.setAttribute("aria-hidden", "true");
  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", "#i-" + name);
  svg.append(use);
  return svg;
}
function element(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}
function showDetail(skill, trigger) {
  lastTrigger = trigger;
  document.querySelector("#dialog-category").textContent = skill.categoryName;
  document.querySelector("#dialog-title").textContent = skill.title;
  document.querySelector("#dialog-description").textContent = skill.description;
  document.querySelector("#dialog-audience").textContent = skill.audience;
  document.querySelector("#dialog-benefit").textContent = skill.benefit;
  document.querySelector("#dialog-status").textContent =
    skill.environment ||
    "1주차 제작 후보입니다. 아직 완성 파일은 없으며, 제작과 피드백을 거쳐 공개합니다.";
  const link = document.querySelector("#dialog-link");
  link.href = skill.path;
  link.replaceChildren(
    document.createTextNode(
      skill.status === "shared" ? "스킬 지침 보기 " : "분야 안내 보기 ",
    ),
    icon("arrow"),
  );
  const download = document.querySelector("#dialog-download");
  download.hidden = !skill.download;
  if (skill.download) download.href = skill.download;
  else download.removeAttribute("href");
  dialog.showModal();
  document.body.classList.add("modal-open");
}
function renderSkills() {
  const query = search.value.trim().normalize("NFKC").toLocaleLowerCase("ko");
  const shown = catalog.filter(
    (skill) =>
      (category === "all" || category === skill.category) &&
      [
        skill.id,
        skill.title,
        skill.description,
        skill.categoryName,
        skill.audience,
        ...skill.tags,
      ]
        .join(" ")
        .normalize("NFKC")
        .toLocaleLowerCase("ko")
        .includes(query),
  );
  grid.replaceChildren();
  shown.forEach((skill) => {
    const shared = skill.status === "shared";
    const card = element(
      "article",
      "skill-card" + (shared ? " is-shared" : ""),
    );
    const top = element("div", "card-top");
    const categoryIcon = element("span", "category-icon " + skill.tone);
    categoryIcon.append(icon(skill.icon));
    top.append(
      categoryIcon,
      element(
        "span",
        "skill-state " + skill.status,
        shared ? "공유 스킬" : "준비 중",
      ),
    );
    const tags = element("div", "tags");
    skill.tags.forEach((tag) => tags.append(element("span", "", tag)));
    const bottom = element("div", "card-bottom");
    bottom.append(
      element("span", "", shared ? "폴더 · 스크립트 포함" : "1기 제작 후보"),
    );
    const button = element(
      "button",
      "card-link",
      shared ? "스킬 살펴보기" : "제작 방향 보기",
    );
    button.type = "button";
    button.setAttribute("aria-label", skill.title + " 자세히 보기");
    button.append(icon("up-right"));
    button.addEventListener("click", () => showDetail(skill, button));
    bottom.append(button);
    card.append(
      top,
      element("p", "card-category", skill.categoryName),
      element("h3", "", skill.title),
      element("p", "card-description", skill.description),
      tags,
      bottom,
    );
    grid.append(card);
  });
  const sharedCount = shown.filter((skill) => skill.status === "shared").length;
  document.querySelector("#result-count").textContent =
    "공유 스킬 " +
    sharedCount +
    "개 · 제작 후보 " +
    (shown.length - sharedCount) +
    "개";
  document.querySelector("#empty-state").hidden = shown.length > 0;
}
filters[0].querySelector("span").textContent = catalog.length;
filters.forEach((button) =>
  button.addEventListener("click", () => {
    category = button.dataset.category;
    filters.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    renderSkills();
  }),
);
search.addEventListener("input", renderSkills);
document.querySelector("#reset-search").addEventListener("click", () => {
  search.value = "";
  filters[0].click();
  search.focus();
});
document
  .querySelector("#close-dialog")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (
    event.target === dialog &&
    (event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom)
  )
    dialog.close();
});
dialog.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  lastTrigger?.focus();
});

const usage = {
  chat: {
    badge: "대화에 지침 전달",
    title: "복사해서, 대화에 붙여 넣으세요.",
    description: "SKILL.md 내용을 아래 요청, 회의 메모와 함께 전달하세요.",
    label: "요청 예시",
    code: "첨부하거나 붙여 넣은 SKILL.md 지침에 따라\n이 회의 메모를 정리해줘.\n결정 사항과 후속 할 일을 구분해줘.",
    note: "일반 채팅에서는 지침으로 활용합니다. 필요한 참고자료도 함께 전달하세요.",
  },
  claude: {
    badge: "프로젝트에 폴더 설치",
    title: "Claude Code에 스킬을 더하세요.",
    description:
      "meeting-notes 폴더를 프로젝트의 .claude/skills/ 아래에 복사하세요.",
    label: "폴더 위치와 호출 예시",
    code: ".claude/skills/meeting-notes/SKILL.md\n\n/meeting-notes 이 회의 메모를 정리해줘.",
    note: "개별 스킬 폴더 전체를 복사하세요. 개인용 설치 위치는 ~/.claude/skills/입니다.",
  },
  codex: {
    badge: "프로젝트에 폴더 설치",
    title: "Codex에 스킬을 더하세요.",
    description:
      "meeting-notes 폴더를 프로젝트의 .agents/skills/ 아래에 복사하세요.",
    label: "폴더 위치와 호출 예시",
    code: ".agents/skills/meeting-notes/SKILL.md\n\n$meeting-notes 이 회의 메모를 정리해줘.",
    note: "개인용 위치는 ~/.agents/skills/입니다. 목록에 나타나지 않으면 Codex를 다시 시작하세요.",
  },
};
const tabs = [...document.querySelectorAll("[data-tool]")];
function selectTab(tab) {
  tabs.forEach((item) => {
    const active = item === tab;
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  const content = usage[tab.dataset.tool];
  ["badge", "title", "description", "code", "note"].forEach((key) => {
    document.querySelector("#usage-" + key).textContent = content[key];
  });
  document.querySelector("#code-label").textContent = content.label;
  document
    .querySelector("#usage-panel")
    .setAttribute("aria-labelledby", tab.id);
}
tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectTab(tab));
  tab.addEventListener("keydown", (event) => {
    let next;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    if (event.key === "ArrowLeft")
      next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (next !== undefined) {
      event.preventDefault();
      selectTab(tabs[next]);
      tabs[next].focus();
    }
  });
});
function toast(message) {
  const target = document.querySelector("#toast");
  clearTimeout(toastTimer);
  target.textContent = message;
  target.classList.add("visible");
  toastTimer = setTimeout(() => target.classList.remove("visible"), 3000);
}
document.querySelector("#copy-usage").addEventListener("click", async () => {
  const text = document.querySelector("#usage-code").textContent;
  let copied = false;
  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch {
    const area = element("textarea", "clipboard-fallback");
    area.value = text;
    document.body.append(area);
    area.select();
    try {
      copied = document.execCommand("copy");
    } catch {
      /* The text can still be copied manually. */
    }
    area.remove();
    document.querySelector("#copy-usage").focus();
  }
  toast(
    copied
      ? "사용 예시를 복사했어요."
      : "자동 복사가 제한되어 있어요. 예시를 직접 선택해 복사해주세요.",
  );
});

const menu = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
  menu.setAttribute("aria-label", "메뉴 열기");
  navigation.classList.remove("open");
}
menu.addEventListener("click", () => {
  const open = menu.getAttribute("aria-expanded") !== "true";
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  navigation.classList.toggle("open", open);
});
navigation
  .querySelectorAll("a")
  .forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("open")) {
    closeMenu();
    menu.focus();
  }
});
renderSkills();
