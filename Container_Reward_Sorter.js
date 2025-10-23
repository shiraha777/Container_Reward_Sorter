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
// @grant        none
// @license      MIT
// ==/UserScript==

(function() {
    'use strict';

    let sorted = false;

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

            // 重新插入：先未获得，再已获得，船只按默认顺序排序
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
