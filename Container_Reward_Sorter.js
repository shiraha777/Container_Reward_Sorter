// ==UserScript==
// @name         重新排序补给箱中的战舰
// @name:en      Container Reward Sorter
// @namespace    http://tampermonkey.net/
// @version      2025-10-16
// @description  对补给箱中的战舰进行分类排序：未获得的在前，已获得的在后；
// @description:en  Sort the battleship reward in containers: unobtained ones first, acquired ones last;
// @author       shiraha
// @match        https://armory.worldofwarships.asia/*
// @icon         https://wows-web-static.wgcdn.co/metashop/1a69ae8c/favicon.png
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let sorted = false;
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

            console.log("doing sort...")
            // 清空 groupDiv 中除标题外的内容
            Array.from(groupDiv.children).forEach(child => {
                if (child !== title) {
                    child.remove();
                }
            });

            // 重新插入：先未获得，再已获得
            notOwned.forEach(item => groupDiv.appendChild(item));
            owned.forEach(item => groupDiv.appendChild(item));
        });
        console.log('sorted!')
    }

    // 使用 MutationObserver 监听元素加载和移除
    const observer = new MutationObserver(() => {
        const target = document.querySelector('.AutoDescription_items.AutoDescription_grid.AutoDescription_isLoaded');
        if (target && !sorted) {
            sortLootboxItems();
            sorted = true;
        } else if (!target && sorted) {
            // 当元素消失时，重置 sorted
            console.log('target disappeared, reset sorted = false');
            sorted = false;
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();