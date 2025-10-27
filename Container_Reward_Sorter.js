// ==UserScript==
// @name         重新排序补给箱中的战舰
// @name:zh-CN   重新排序补给箱中的战舰
// @name:en      Container Reward Sorter
// @namespace    https://github.com/shiraha777/Container_Reward_Sorter
// @version      2025-10-23
// @description  用于战舰世界军火库网页版的脚本，对补给箱中的战舰列表进行简易重新排序：未获得的在前，已获得的在后，方便玩家确认自己未获得和已获得的战舰。
// @description:zh-CN  用于战舰世界军火库网页版的脚本，对补给箱中的战舰列表进行简易重新排序：未获得的在前，已获得的在后，方便玩家确认自己未获得和已获得的战舰。
// @description:en  Sort the warships in containers: unobtained ones first, acquired ones last;
// @author       shiraha
// @match        https://armory.worldofwarships.asia/*
// @match        https://armory.worldofwarships.com/*
// @match        https://armory.worldofwarships.eu/*
// @match        https://armory.wowsgame.cn/*
// @icon         https://wows-web-static.wgcdn.co/metashop/1a69ae8c/favicon.png
// @grant        GM_setValue
// @grant        GM_getValue
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';
    // 排序标识符
    let sorted = false;
    // 初始化语言环境
    const isZh = navigator.language.toLowerCase().startsWith("zh");
    console.log("isZh = " + isZh);
    // 设置按钮语言
    const states = {
        sortByInventory: isZh
        ? ["显示全部", "仅显示已获得", "仅显示未获得"]
        : ["Show All", "Owned Only", "Unowned Only"],

        sortByTier: isZh
        ? ["等级降序", "等级升序", "等级默认"]
        : ["Tier Desc", "Tier Asc", "Tier Default"],

        sortByRarity: isZh
        ? ["稀有度降序", "稀有度升序", "稀有度默认"]
        : ["Rarity Desc", "Rarity Asc", "Rarity Default"],
    };
    // 定义按钮样式和属性
    const delimiterHTML = `
        <span class="BundlePageHeader_preBundleTitle">　</span>
    `;
    const extraHTML = `
        <span class="AutoDescription_group" data-modify-btn="sortByInventory"></span>
        <span class="AutoDescription_group" data-modify-btn="sortByTier"></span>
        <span class="AutoDescription_group" data-modify-btn="exchange">⇄</span>
        <span class="AutoDescription_group" data-modify-btn="sortByRarity"></span>
    `;
    // 初始化按钮文本
    function initButtonText(btn, key) {
        const saved = GM_getValue(key, states[key][0]);
        btn.textContent = saved;
    }

    // 根据保存的顺序调整 sortByTier 和 sortByRarity 的位置
    function applyOrder(container) {
        const order = GM_getValue("exchangeOrder", ["sortByTier", "sortByRarity"]);
        const tier = container.querySelector('[data-modify-btn="sortByTier"]');
        const rarity = container.querySelector('[data-modify-btn="sortByRarity"]');
        const exchange = container.querySelector('[data-modify-btn="exchange"]');

        if (tier && rarity && exchange) {
            const first = order[0] === "sortByTier" ? tier : rarity;
            const second = order[1] === "sortByTier" ? tier : rarity;

            container.insertBefore(first, exchange);
            container.insertBefore(exchange, second);
            container.insertBefore(second, exchange.nextSibling);
        }
    }

    function insertButtons() {
        let container = document.querySelector(".AutoDescription_groupsTab");
        let delimiter = true;

        // 如果不存在，则创建并插入到 searchTab 之后
        if (!container) {
            const topPanel = document.querySelector(".AutoDescription_topPanel");
            const searchTab = document.querySelector(".AutoDescription_searchTab");

            if (topPanel && searchTab) {
                container = document.createElement("div");
                container.className = "AutoDescription_groupsTab";
                // 插入到 searchTab 之后
                if (searchTab.nextSibling) {
                    topPanel.insertBefore(container, searchTab.nextSibling);
                } else {
                    topPanel.appendChild(container);
                }
                delimiter = false;
                console.log("已创建并插入 .AutoDescription_groupsTab 容器");
            }
        }

        // 如果容器存在且还没插入过按钮，则插入按钮
        if (container && !container.querySelector('[data-modify-btn="sortByInventory"]')) {
            if(delimiter) {
                container.insertAdjacentHTML("beforeend", delimiterHTML);
            }
            container.insertAdjacentHTML("beforeend", extraHTML);
            console.log("已插入自定义按钮");
            bindEvents(container);
            applyOrder(container); // 应用保存的顺序
        }
    }

    function bindEvents(container) {
        // sortByInventory
        const sortBtn = container.querySelector('[data-modify-btn="sortByInventory"]');
        if (sortBtn) {
            initButtonText(sortBtn, "sortByInventory");
            sortBtn.addEventListener("click", () => {
                let idx = states.sortByInventory.indexOf(sortBtn.textContent);
                idx = (idx + 1) % states.sortByInventory.length;
                sortBtn.textContent = states.sortByInventory[idx];
                GM_setValue("sortByInventory", states.sortByInventory[idx]);
                console.log("sortByInventory 切换为:", states.sortByInventory[idx]);
            });
        }

        // sortByTier
        const tierBtn = container.querySelector('[data-modify-btn="sortByTier"]');
        if (tierBtn) {
            initButtonText(tierBtn, "sortByTier");
            tierBtn.addEventListener("click", () => {
                let idx = states.sortByTier.indexOf(tierBtn.textContent);
                idx = (idx + 1) % states.sortByTier.length;
                tierBtn.textContent = states.sortByTier[idx];
                GM_setValue("sortByTier", states.sortByTier[idx]);
                console.log("sortByTier 切换为:", states.sortByTier[idx]);
            });
        }

        // sortByRarity
        const rarityBtn = container.querySelector('[data-modify-btn="sortByRarity"]');
        if (rarityBtn) {
            initButtonText(rarityBtn, "sortByRarity");
            rarityBtn.addEventListener("click", () => {
                let idx = states.sortByRarity.indexOf(rarityBtn.textContent);
                idx = (idx + 1) % states.sortByRarity.length;
                rarityBtn.textContent = states.sortByRarity[idx];
                GM_setValue("sortByRarity", states.sortByRarity[idx]);
                console.log("sortByRarity 切换为:", states.sortByRarity[idx]);
            });
        }

        // exchange
        const exchangeBtn = container.querySelector('[data-modify-btn="exchange"]');
        if (exchangeBtn) {
            exchangeBtn.addEventListener("click", () => {
                const tier = container.querySelector('[data-modify-btn="sortByTier"]');
                const rarity = container.querySelector('[data-modify-btn="sortByRarity"]');
                const exchange = container.querySelector('[data-modify-btn="exchange"]');

                if (tier && rarity && exchange) {
                    const order = [];

                    // 判断当前顺序
                    const tierBeforeRarity = tier.compareDocumentPosition(rarity) & Node.DOCUMENT_POSITION_FOLLOWING;

                    if (tierBeforeRarity) {
                        // 当前是 tier → exchange → rarity，改为 rarity → exchange → tier
                        container.insertBefore(rarity, tier); // rarity 放到 tier 前
                        container.insertBefore(exchange, tier); // exchange 放到 tier 前（即中间）
                        order.push("sortByRarity", "sortByTier");
                    } else {
                        // 当前是 rarity → exchange → tier，改为 tier → exchange → rarity
                        container.insertBefore(tier, rarity); // tier 放到 rarity 前
                        container.insertBefore(exchange, rarity); // exchange 放到 rarity 前（即中间）
                        order.push("sortByTier", "sortByRarity");
                    }

                    GM_setValue("exchangeOrder", order);
                    console.log("exchange: 已交换 sortByTier 与 sortByRarity，当前顺序:", order);
                }
            });
        }
    }

    // 等级罗马数字到整数数字的映射（仅限1~11）
    const romanToArabic = {
        'I': 1,
        'II': 2,
        'III': 3,
        'IV': 4,
        'V': 5,
        'VI': 6,
        'VII': 7,
        'VIII': 8,
        'IX': 9,
        'X': 10,
        '★': 11
    };

    // 稀有度到整数数字的映射，排序顺序：common < uncommon < rare < epic < legendary
    const rarityOrder = {
        'we-card__rarity-common': 1,
        'we-card__rarity-uncommon': 2,
        'we-card__rarity-rare': 3,
        'we-card__rarity-epic': 4,
        'we-card__rarity-legendary': 5
    };

    // 控制稀有度排序方向：'asc' 从低到高，'desc' 从高到低
    let tierSortOrder = 'desc';
    let raritySortOrder = 'desc';

    function getRarityValue(item) {
        for (let cls of Object.keys(rarityOrder)) {
            if (item.querySelector(`.${cls}`)) {
                return rarityOrder[cls];
            }
        }
        return 0; // 默认值
    }

    function getTierValue(item) {
        const tierAttr = item.getAttribute('data-tier');
        return tierAttr ? parseInt(tierAttr, 10) : 0;
    }

    // 综合排序：先按等级，再按稀有度
    function sortByTierAndRarity(items) {
        return items.sort((a, b) => {
            const ta = getTierValue(a);
            const tb = getTierValue(b);
            if (ta !== tb) {
                return tierSortOrder === 'asc' ? ta - tb : tb - ta;
            }
            const ra = getRarityValue(a);
            const rb = getRarityValue(b);
            return raritySortOrder === 'asc' ? ra - rb : rb - ra;
        });
    }

    function sortLootboxItems() {
        console.log('checking...');
        const container = document.querySelector('.AutoDescription_items.AutoDescription_grid.AutoDescription_isLoaded');
        if (!container) return;

        // 添加更多筛选按钮
        insertButtons();

        console.log('start sort!');
        // 遍历 container 下的每个子<div>
        container.querySelectorAll(':scope > div').forEach(groupDiv => {
            const title = groupDiv.querySelector('.AutoDescription_groupTitle');

            // 找到所有卡片
            const items = Array.from(groupDiv.querySelectorAll('.LootboxRewardItemCard_item.AutoDescription_gridItem'));

            // 分类：未获得（没有 we-card__inventory）和已获得（有 we-card__inventory）
            const notOwned = items.filter(item => !item.querySelector('.we-card__inventory'));
            const owned = items.filter(item => item.querySelector('.we-card__inventory'));

            console.log("doing sort...");
            // 清空 groupDiv 中除标题外的内容
            Array.from(groupDiv.children).forEach(child => {
                if (child !== title) {
                    child.remove();
                }
            });

            // 先按等级，再按稀有度
            const notOwnedSorted = sortByTierAndRarity(notOwned);
            const ownedSorted = sortByTierAndRarity(owned);

            // 重新插入：先未获得，再已获得
            notOwnedSorted.forEach(item => groupDiv.appendChild(item));
            ownedSorted.forEach(item => groupDiv.appendChild(item));
        });
        console.log('sorted!');
    }

    // 为每个战舰打上 data-tier 属性
    function assignTierData() {
        document.querySelectorAll('.LootboxRewardItemCard_item.AutoDescription_gridItem').forEach(card => {
            const span = card.querySelector('span');
            if (!span) return;

            const text = span.textContent.trim();
            const match = text.match(/^(★|X|IX|IV|V?I{1,3}|VI{1,3}|VII{1,3}|VIII)\b/);
            if (!match) return;

            const roman = match[1];
            const tier = romanToArabic[roman];
            if (!tier) return;

            card.setAttribute('data-tier', tier);
        });
    }

    // 操作防抖，避免在搜索框输入时连续更新页面导致性能问题
    function debounce(fn, delay) {
        let timer = null;
        return function(...args) {
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(this, args), delay);
        };
    }

    // 使用 MutationObserver 监听元素加载和移除，监听搜索框输入事件
    const observer = new MutationObserver(() => {
        const target = document.querySelector('.AutoDescription_items.AutoDescription_grid.AutoDescription_isLoaded');
        if (target && !sorted) {
            // 先打上等级标签，方便后续排序
            assignTierData();
            // 执行排序
            sortLootboxItems();
            // 排序完毕，打上标记防止重复操作
            sorted = true;
        } else if (!target && sorted) {
            // 当元素消失时，重置 sorted
            console.log('target disappeared, reset sorted = false');
            sorted = false;
        }

        // 绑定 input 事件
        const inputEl = document.querySelector('.SearchInput_input');
        if (inputEl && !inputEl.dataset.sortBound) {
            const debouncedSort = debounce(() => {
                assignTierData();
                sortLootboxItems();
            }, 300); // 300ms 防抖
            inputEl.addEventListener('input', () => {
                console.log('SearchInput_input value changed');
                debouncedSort();
            });
            inputEl.dataset.sortBound = 'true';
            console.log('input listener with debounce attached');
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();

